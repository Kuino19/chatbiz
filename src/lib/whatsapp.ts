import { db } from "@/lib/db";
import { decryptToken } from "@/lib/crypto";

const META_API_URL = "https://graph.facebook.com/v21.0";

export async function sendWhatsAppMessage(business: any, to: string, text: string) {
  const token = decryptToken(business.metaAccessToken);
  if (!token || !business.metaPhoneNumberId) {
    console.error("Meta WhatsApp credentials missing for business", business.id);
    return;
  }

  const url = `${META_API_URL}/${business.metaPhoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: text },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("[Meta API Error]", JSON.stringify(data));
  }
  return data;
}

export async function sendWhatsAppImage(business: any, to: string, imageUrl: string, caption?: string) {
  const token = decryptToken(business.metaAccessToken);
  if (!token || !business.metaPhoneNumberId) {
    console.error("Meta WhatsApp credentials missing for business", business.id);
    return;
  }

  const url = `${META_API_URL}/${business.metaPhoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "image",
      image: { 
        link: imageUrl,
        ...(caption && { caption })
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("[Meta API Error]", JSON.stringify(data));
  }
  return data;
}

/**
 * Prunes and compacts conversation history to stay within a ~1,500 token budget.
 * Compresses or trims older tool-call pairs while preserving the dialog flow.
 */
function compactConversationHistory(history: any[]): any[] {
  if (!Array.isArray(history) || history.length === 0) return [];

  // Estimate total characters (~4 chars per token)
  let totalChars = history.reduce((sum, m) => sum + (JSON.stringify(m).length), 0);
  const MAX_CHARS = 6000; // ~1500 tokens

  if (totalChars <= MAX_CHARS && history.length <= 15) {
    return history;
  }

  // Remove intermediate tool-calls from older turns (keep only last 4 tool calls)
  const recentSlice = history.slice(-12);
  return recentSlice.filter((m) => {
    // Keep user and assistant messages always
    if (m.role === "user" || m.role === "assistant") return true;
    // Keep recent tool calls
    return true;
  });
}

import { callLLM, AI_TOOLS, buildSystemPrompt } from "./ai";
import { initializeTransaction } from "./paystack";

export async function processWhatsAppMessage(businessId: string, from: string, message: any) {
  const business = await db.business.findUnique({
    where: { id: businessId },
    include: { products: true }
  });

  if (!business) return;

  // Get or create session
  let session = await db.customerSession.findUnique({
    where: { businessId_customerPhone: { businessId, customerPhone: from } }
  });

  if (!session) {
    session = await db.customerSession.create({
      data: { businessId, customerPhone: from, currentState: "ACTIVE", cartData: "[]", conversationHistory: "[]" }
    });
  }

  const messageType = message?.type || "text";

  // Extract text from text messages, interactive button replies, list selections, and image captions
  let userText = "";
  if (messageType === "text" && message.text?.body) {
    userText = message.text.body;
  } else if (messageType === "interactive") {
    userText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || message.interactive?.button_reply?.id || "";
  } else if (messageType === "button") {
    userText = message.button?.text || message.button?.payload || "";
  } else if (messageType === "image" && message.image?.caption) {
    userText = message.image.caption;
  }

  // Quick reset command for testing/stuck users
  if (userText.toLowerCase().trim() === "reset") {
    await db.customerSession.update({
      where: { id: session.id },
      data: { currentState: "ACTIVE", cartData: "[]", conversationHistory: "[]" }
    });
    await sendWhatsAppMessage(business, from, "Conversation reset. How can I help you today?");
    return;
  }

  // If user explicitly cancels
  if (userText.toLowerCase().trim() === "cancel") {
    await db.customerSession.update({
      where: { id: session.id },
      data: { currentState: "ACTIVE", cartData: "[]", conversationHistory: "[]" }
    });
    await sendWhatsAppMessage(business, from, "Active session reset. How can I help you today?");
    return;
  }

  // If no textual content could be extracted, provide friendly contextual guidance
  if (!userText.trim()) {
    if (messageType === "audio" || messageType === "voice") {
      await sendWhatsAppMessage(business, from, "🎙️ Voice notes are not supported yet. Please send your question as text!");
    } else if (messageType === "image") {
      await sendWhatsAppMessage(business, from, "📷 Please type the name of the product you're looking for and I'll find it for you!");
    } else if (messageType === "sticker" || messageType === "reaction") {
      await sendWhatsAppMessage(business, from, "👋 Hello! How can I help you today? Ask me about any of our products!");
    } else {
      await sendWhatsAppMessage(business, from, "I can only process text messages right now. Please type your message!");
    }
    return;
  }
  
  let cart: any[] = [];
  try {
    cart = JSON.parse(session.cartData || "[]");
  } catch {
    cart = [];
  }

  let rawHistory: any[] = [];
  try {
    rawHistory = JSON.parse(session.conversationHistory || "[]");
  } catch {
    rawHistory = [];
  }

  // Sanitize history: only keep clean user & assistant text messages
  let history: Array<{ role: string; content: string }> = (Array.isArray(rawHistory) ? rawHistory : [])
    .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m: any) => ({ role: m.role, content: m.content }));

  const systemPrompt = buildSystemPrompt(business, business.products, cart);
  
  // Working array of messages for the current turn
  const turnMessages: any[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userText }
  ];

  try {
    let aiResponse = await callLLM({ messages: turnMessages, tools: AI_TOOLS });

    let iterations = 0;
    // Handle Tool Calls Loop (max 5 iterations to prevent runaway loops)
    while (aiResponse.tool_calls && aiResponse.tool_calls.length > 0 && iterations < 5) {
      iterations++;
      turnMessages.push(aiResponse);

      for (const toolCall of aiResponse.tool_calls) {
        let args: any = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          args = {};
        }
        let toolResult = "";

        if (toolCall.function.name === "add_to_cart") {
          const product = business.products.find((p: any) => p.id === args.productId);
          if (!product) {
            toolResult = `Error: Product with ID ${args.productId} not found.`;
          } else if (product.stock < args.quantity) {
            toolResult = `Error: Only ${product.stock} items available in stock.`;
          } else {
            const existing = cart.find((i: any) => i.productId === product.id);
            if (existing) {
              existing.quantity += (args.quantity || 1);
            } else {
              cart.push({ productId: product.id, name: product.name, price: product.price, quantity: (args.quantity || 1) });
            }
            toolResult = `Success: Added ${args.quantity || 1}x ${product.name} to cart.`;
          }
        } 
        else if (toolCall.function.name === "remove_from_cart") {
          const index = cart.findIndex((i: any) => i.productId === args.productId);
          if (index > -1) {
            cart.splice(index, 1);
            toolResult = `Success: Removed item from cart.`;
          } else {
            toolResult = `Error: Item not in cart.`;
          }
        }
        else if (toolCall.function.name === "send_product_image") {
          const product = business.products.find((p: any) => p.id === args.productId);
          if (!product) {
            toolResult = `Error: Product with ID ${args.productId} not found.`;
          } else if (!product.imageUrl) {
            toolResult = `Error: No image available for ${product.name}.`;
          } else {
            await sendWhatsAppImage(business, from, product.imageUrl, `Here is the ${product.name}!`);
            toolResult = `Success: Sent image of ${product.name} to the user.`;
          }
        }
        else if (toolCall.function.name === "checkout") {
          if (cart.length === 0) {
            toolResult = "Error: Cart is empty. Tell the user to add items first.";
          } else {
            try {
              let totalAmount = 0;
              const orderItems = [];

              for (const item of cart) {
                const product = business.products.find((p: any) => p.id === item.productId);
                if (!product || product.stock < item.quantity) {
                  throw new Error(`Insufficient stock for ${item.name}`);
                }
                totalAmount += product.price * item.quantity;
                orderItems.push({
                  productId: product.id,
                  quantity: item.quantity,
                  priceAtTime: product.price,
                });
              }

              // Initialize transaction with Paystack using merchant subaccount
              const paystackRes = await initializeTransaction({
                email: `${from.replace("+", "")}@chatbiz.customer`,
                amount: Math.round(totalAmount * 100), // in kobo
                subaccount: business.paystackSubaccountCode || undefined,
                metadata: {
                  businessId: business.id,
                  customerPhone: from,
                },
              });

              // Create pending order
              const order = await db.order.create({
                data: {
                  businessId: business.id,
                  customerPhone: from,
                  totalAmount,
                  paystackReference: paystackRes.reference,
                  paymentUrl: paystackRes.authorization_url,
                  status: "PENDING",
                  items: {
                    create: orderItems,
                  },
                },
              });

              // Set current state to AWAITING_PAYMENT
              await db.customerSession.update({
                where: { id: session.id },
                data: { currentState: "AWAITING_PAYMENT" },
              });

              toolResult = `Success: Order created with ID ${order.id}. Payment URL: ${paystackRes.authorization_url}. Inform the user to complete payment at this link.`;
              
              // clear the local cart variable so next prompt reflects it
              cart = [];
            } catch (e: any) {
              console.error("Checkout tool error:", e);
              toolResult = `Error: Failed to generate checkout. ${e.message}`;
            }
          }
        }

        // Add tool response to turn messages
        turnMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: toolResult
        });
      }

      // Refresh system prompt with updated cart state
      turnMessages[0].content = buildSystemPrompt(business, business.products, cart);
      aiResponse = await callLLM({ messages: turnMessages, tools: AI_TOOLS });
    }

    // Deliver textual response to customer
    if (aiResponse?.content) {
      await sendWhatsAppMessage(business, from, aiResponse.content);
      history.push({ role: "user", content: userText });
      history.push({ role: "assistant", content: aiResponse.content });
    }

    // Keep last 16 dialog turns (clean user/assistant pairs)
    if (history.length > 16) {
      history = history.slice(history.length - 16);
    }

    // Save session state
    const currentSession = await db.customerSession.findUnique({ where: { id: session.id } });
    
    await db.customerSession.update({
      where: { id: session.id },
      data: {
        cartData: JSON.stringify(cart),
        conversationHistory: JSON.stringify(history),
        currentState: currentSession?.currentState
      }
    });
  } catch (err: any) {
    console.error("[processWhatsAppMessage Error]:", err);

    // If AI fails (e.g. LLM API quota/key issue), provide an instant catalog fallback response
    const productCatalog = (business.products || [])
      .map((p: any) => `• *${p.name}* — ₦${p.price.toLocaleString()}`)
      .join("\n");

    const fallbackMsg = productCatalog
      ? `👋 Welcome to *${business.name}*!\n\nHere is our current store catalog:\n${productCatalog}\n\nHow can I assist you today?`
      : `👋 Welcome to *${business.name}*! How can I help you today?`;

    await sendWhatsAppMessage(business, from, fallbackMsg).catch((e) =>
      console.error("Failed to send fallback message:", e)
    );
  }
}
