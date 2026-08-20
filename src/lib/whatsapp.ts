import { db } from "@/lib/db";

const META_API_URL = "https://graph.facebook.com/v21.0";

export async function sendWhatsAppMessage(business: any, to: string, text: string) {
  if (!business.metaAccessToken || !business.metaPhoneNumberId) {
    console.error("Meta WhatsApp credentials missing for business", business.id);
    return;
  }

  const url = `${META_API_URL}/${business.metaPhoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${business.metaAccessToken}`,
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
  if (!business.metaAccessToken || !business.metaPhoneNumberId) {
    console.error("Meta WhatsApp credentials missing for business", business.id);
    return;
  }

  const url = `${META_API_URL}/${business.metaPhoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${business.metaAccessToken}`,
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

  const messageType = message.type;
  
  // Quick reset command for testing/stuck users
  if (messageType === "text" && message.text.body.toLowerCase().trim() === "reset") {
    await db.customerSession.update({
      where: { id: session.id },
      data: { currentState: "ACTIVE", cartData: "[]", conversationHistory: "[]" }
    });
    await sendWhatsAppMessage(business, from, "Conversation reset. How can I help you today?");
    return;
  }

  if (session.currentState === "AWAITING_PAYMENT") {
    // If they are awaiting payment but typed 'cancel', let them cancel
    if (messageType === "text" && message.text.body.toLowerCase().trim() === "cancel") {
      await db.customerSession.update({
        where: { id: session.id },
        data: { currentState: "ACTIVE", cartData: "[]", conversationHistory: "[]" }
      });
      await sendWhatsAppMessage(business, from, "Order cancelled. Let me know if you need anything else!");
      return;
    }
    
    // Check if there's a pending order for this customer to fetch the link
    const order = await db.order.findFirst({
      where: { businessId, customerPhone: from, status: "PENDING" },
      orderBy: { createdAt: 'desc' }
    });
    
    if (order && order.paymentUrl) {
      await sendWhatsAppMessage(business, from, `You have a pending order. Please complete your payment here:\n${order.paymentUrl}\n\nType 'cancel' to cancel this order.`);
    } else {
      await sendWhatsAppMessage(business, from, "You have a pending order. Please complete your payment.");
    }
    return;
  }

  // Handle only text messages for now in the AI loop
  if (messageType !== "text") {
    await sendWhatsAppMessage(business, from, "I can only process text messages right now.");
    return;
  }

  const userText = message.text.body;
  
  let cart = JSON.parse(session.cartData || "[]");
  let history = JSON.parse(session.conversationHistory || "[]");

  history.push({ role: "user", content: userText });

  const systemPrompt = buildSystemPrompt(business, business.products, cart);
  const messages = [{ role: "system", content: systemPrompt }, ...history];

  let aiResponse = await callLLM({ messages, tools: AI_TOOLS });

  // Handle Tool Calls Loop
  while (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
    // Add the AI's tool call to history so the LLM knows it called it
    history.push(aiResponse);
    messages.push(aiResponse);

    for (const toolCall of aiResponse.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments || "{}");
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
            existing.quantity += args.quantity;
          } else {
            cart.push({ productId: product.id, name: product.name, price: product.price, quantity: args.quantity });
          }
          toolResult = `Success: Added ${args.quantity}x ${product.name} to cart.`;
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
          // Calculate total
          const totalAmount = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
          const totalKobo = Math.round(totalAmount * 100);

          try {
            // Create Order
            const order = await db.order.create({
              data: {
                businessId,
                customerPhone: from,
                totalAmount,
                items: {
                  create: cart.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtTime: item.price
                  }))
                }
              }
            });

            // Initialize Paystack transaction
            // Generate a dummy email if none is known, as Paystack requires an email.
            const customerEmail = `${from.replace("+", "")}@chatbiz.local`;
            
            const paystackData = await initializeTransaction({
              email: customerEmail,
              amount: totalKobo,
              reference: `ORDER-${order.id}`,
              metadata: { orderId: order.id, customerPhone: from, businessId }
            });

            await db.order.update({
              where: { id: order.id },
              data: { 
                paystackReference: paystackData.reference,
                paymentUrl: paystackData.authorization_url,
                customerEmail
              }
            });

            // Set session to awaiting payment
            await db.customerSession.update({
              where: { id: session.id },
              data: { currentState: "AWAITING_PAYMENT", cartData: "[]" }
            });

            toolResult = `Success: Checkout generated. Send this Paystack payment link to the user: ${paystackData.authorization_url}`;
            // clear the local cart variable so next prompt reflects it
            cart = [];
          } catch (e: any) {
            console.error("Checkout tool error:", e);
            toolResult = `Error: Failed to generate checkout. ${e.message}`;
          }
        }
      }

      // Add tool response to messages array
      const toolMessage = {
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: toolResult
      };
      history.push(toolMessage);
      messages.push(toolMessage);
    }

    // Call LLM again to get the final textual response after tools executed
    // We update the system prompt in case cart changed
    messages[0].content = buildSystemPrompt(business, business.products, cart);
    aiResponse = await callLLM({ messages, tools: AI_TOOLS });
  }

  // Once we have a pure textual response from AI:
  if (aiResponse.content) {
    await sendWhatsAppMessage(business, from, aiResponse.content);
    history.push({ role: "assistant", content: aiResponse.content });
  }

  // Trim history to prevent huge payload (keep last 20 messages)
  if (history.length > 20) {
    history = history.slice(history.length - 20);
  }

  // Save session state (currentState might have changed to AWAITING_PAYMENT in the checkout tool)
  const currentSession = await db.customerSession.findUnique({ where: { id: session.id } });
  
  await db.customerSession.update({
    where: { id: session.id },
    data: {
      cartData: JSON.stringify(cart),
      conversationHistory: JSON.stringify(history),
      currentState: currentSession?.currentState // preserve AWAITING_PAYMENT if it was set
    }
  });
}
