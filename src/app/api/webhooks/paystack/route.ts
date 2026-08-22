import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/paystack";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const rawBody = await req.text();
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === "charge.success") {
      const { reference, amount, metadata } = payload.data;

      // Atomic interactive transaction to guarantee single execution & prevent race conditions
      const result = await db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { paystackReference: reference },
          include: { business: true, items: true },
        });

        if (!order) {
          return { error: "Order not found", status: 404 };
        }

        // Idempotency: If already marked as PAID by a previous webhook execution, exit cleanly
        if (order.status === "PAID") {
          return { alreadyProcessed: true, order };
        }

        // Verify amount paid against order total (Paystack amount is in kobo)
        const expectedAmountKobo = Math.round(order.totalAmount * 100);
        if (amount < expectedAmountKobo) {
          console.error(`Insufficient amount paid for order ${order.id}. Expected ${expectedAmountKobo}, got ${amount}`);
          return { error: "Insufficient amount paid", status: 400 };
        }

        // Update Order Status atomically
        await tx.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });

        // Decrement stock atomically with concurrency protection
        for (const item of order.items) {
          await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return { success: true, order };
      });

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status || 400 });
      }

      if (result.alreadyProcessed) {
        return NextResponse.json({ received: true, note: "Already processed" }, { status: 200 });
      }

      const order = result.order!;
      const customerAddressLine = order.deliveryAddress ? `\n📍 *Delivering to:* ${order.deliveryAddress}` : "";
      const merchantAddressLine = order.deliveryAddress ? `\n📍 *Delivery Address:* ${order.deliveryAddress}` : "";

      // Send confirmation to Customer (outside DB transaction)
      await sendWhatsAppMessage(
        order.business,
        order.customerPhone,
        `✅ *Payment Confirmed!*\nYour order *#${order.id.slice(-6).toUpperCase()}* has been confirmed and is being processed.${customerAddressLine}\n\nThank you for shopping with *${order.business.name}*! 🎉`
      ).catch((err) => console.error("Error sending customer receipt:", err));

      // Send confirmation to Business Owner
      if (order.business.whatsappNumber) {
        await sendWhatsAppMessage(
          order.business,
          order.business.whatsappNumber.replace("+", ""),
          `💰 *New Payment Received*\nOrder *#${order.id.slice(-6).toUpperCase()}* for *₦${order.totalAmount.toLocaleString()}* has been paid via Paystack.${merchantAddressLine}\n\nPlease prepare fulfillment.`
        ).catch((err) => console.error("Error sending merchant alert:", err));
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Paystack Webhook Error:", error.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
