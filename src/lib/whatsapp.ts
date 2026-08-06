import { db } from "@/lib/db";
import { generateInvoicePDF } from "./pdf";
import { sendTwilioMessage } from "./twilio";

const META_API_URL = "https://graph.facebook.com/v21.0";


async function sendMetaMessage(phoneNumberId: string, accessToken: string, to: string, message: any) {
  const url = `${META_API_URL}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      ...message,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("[Meta API Error]", JSON.stringify(data));
  }
  return data;
}

async function sendResponse(business: any, to: string, text: string) {
  // Determine provider
  if (business.metaAccessToken && business.metaPhoneNumberId) {
    return sendMetaMessage(business.metaPhoneNumberId, business.metaAccessToken, to, {
      type: "text",
      text: { body: text }
    });
  } else if (process.env.TWILIO_ACCOUNT_SID) {
    // For now, if Twilio is configured globally, we can use it as fallback or primary
    // In a real multi-tenant app, we'd check business.twilioSid etc.
    return sendTwilioMessage(to, text);
  }
}

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
      data: { businessId, customerPhone: from, currentState: "GREETING", cartData: "[]" }
    });
  }

  const messageType = message.type;
  
  // Quick hack: If user says "hi" or "menu", reset to GREETING
  if (messageType === "text" && ["hi", "hello", "menu"].includes(message.text.body.toLowerCase())) {
    session = await db.customerSession.update({
      where: { id: session.id },
      data: { currentState: "GREETING", cartData: "[]" }
    });
  }

  const cart = JSON.parse(session.cartData || "[]");

  switch (session.currentState) {
    case "GREETING":
      await sendResponse(business, from, 
        `Welcome to ${business.name}! 👋\nHere is our product catalog. Reply with the product ID to add it to your cart, or type 'checkout' to finish.\n\n` + 
        business.products.map(p => `*ID: ${p.id.slice(-4)}* - ${p.name} (₦${p.price})`).join("\n")
      );
      await db.customerSession.update({
        where: { id: session.id },
        data: { currentState: "BROWSING" }
      });
      break;

    case "BROWSING":
      if (messageType === "text") {
        const text = message.text.body.toLowerCase().trim();
        
        if (text === "checkout") {
          if (cart.length === 0) {
            await sendResponse(business, from, "Your cart is empty. Type 'menu' to see our products.");
            return;
          }
          
          const total = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
          const cartSummary = cart.map((item: any) => `${item.quantity}x ${item.name} (₦${item.price})`).join("\n");
          
          await sendResponse(business, from, 
            `*Order Summary*\n\n${cartSummary}\n\n*Total: ₦${total}*\n\nPlease reply with 'confirm' to place your order or 'cancel' to start over.`
          );
          
          await db.customerSession.update({
            where: { id: session.id },
            data: { currentState: "CONFIRMING" }
          });
        } else {
          // Assume they typed a product ID suffix
          const product = business.products.find(p => p.id.endsWith(text) || p.id.slice(-4) === text);
          if (product) {
            // Ask for quantity
            await sendResponse(business, from, `How many ${product.name} would you like? (Reply with a number)`);
            await db.customerSession.update({
              where: { id: session.id },
              data: { currentState: `ASKING_QTY_${product.id}` }
            });
          } else {
            await sendResponse(business, from, "Product not found. Reply with a valid ID, or 'checkout' to finish.");
          }
        }
      }
      break;

    case "CONFIRMING":
      if (messageType === "text") {
        const text = message.text.body.toLowerCase().trim();
        if (text === "confirm") {
          // Create order
          const totalAmount = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
          
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

          // Decrease stock
          for (const item of cart) {
            await db.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } }
            });
          }

          // Generate PDF Invoice (simplified)
          const invoiceUrl = await generateInvoicePDF(order.id, cart, totalAmount);

          await sendResponse(business, from, 
            `Thank you! Your order #${order.id.slice(-6).toUpperCase()} has been placed.\nTotal: ₦${totalAmount}\n\nPlease transfer to Acc 1234567890 (GTBank) and *reply with a screenshot of the payment proof*.`
          );

          await db.customerSession.update({
            where: { id: session.id },
            data: { currentState: "AWAITING_PAYMENT", cartData: "[]" }
          });

          // Check low stock
          for (const item of cart) {
            const prod = await db.product.findUnique({ where: { id: item.productId } });
            if (prod && prod.stock <= prod.lowStockThreshold) {
              if (business.whatsappNumber) {
                await sendResponse(business, business.whatsappNumber.replace("+",""), 
                  `🚨 *Low Stock Alert*: ${prod.name} has only ${prod.stock} left in stock!`
                );
              }
            }
          }

        } else if (text === "cancel") {
          await db.customerSession.update({
            where: { id: session.id },
            data: { currentState: "GREETING", cartData: "[]" }
          });
          await sendResponse(business, from, "Order cancelled. Type 'menu' to start over.");
        }
      }
      break;

    case "AWAITING_PAYMENT":
      if (messageType === "image") {
        const imageId = message.image.id;
        // In a real app, we would download the image using the media API and save to S3/Cloudinary.
        // For now, we simulate saving the proof URL.
        const proofUrl = `https://graph.facebook.com/v19.0/${imageId}`; 
        
        // Find latest pending order
        const order = await db.order.findFirst({
          where: { businessId, customerPhone: from, status: "PENDING" },
          orderBy: { createdAt: 'desc' }
        });

        if (order) {
          await db.order.update({
            where: { id: order.id },
            data: { paymentProofUrl: proofUrl }
          });

          await sendResponse(business, from, 
            "Payment proof received! We are verifying it. You will be notified once approved."
          );

          // Notify business owner
          if (business.whatsappNumber) {
            await sendResponse(business, business.whatsappNumber.replace("+",""), 
              `💰 *Payment Proof Uploaded* for Order #${order.id.slice(-6).toUpperCase()}.\nPlease review it in your dashboard.`
            );
          }

          await db.customerSession.update({
            where: { id: session.id },
            data: { currentState: "GREETING" }
          });
        }
      } else {
        await sendResponse(business, from, "Please upload an image of your payment receipt.");
      }
      break;

    default:
      if (session.currentState.startsWith("ASKING_QTY_")) {
        const productId = session.currentState.replace("ASKING_QTY_", "");
        const product = business.products.find(p => p.id === productId);
        
        if (messageType === "text" && product) {
          const qty = parseInt(message.text.body.trim(), 10);
          if (isNaN(qty) || qty <= 0) {
            await sendResponse(business, from, "Please enter a valid number.");
          } else if (qty > product.stock) {
            await sendResponse(business, from, `Sorry, we only have ${product.stock} in stock. How many would you like?`);
          } else {
            cart.push({
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: qty
            });
            await db.customerSession.update({
              where: { id: session.id },
              data: { currentState: "BROWSING", cartData: JSON.stringify(cart) }
            });
            await sendResponse(business, from, `Added ${qty}x ${product.name} to cart.\nReply with another product ID to add more, or type 'checkout' to finish.`);
          }
        }
      }
      break;
  }
}

