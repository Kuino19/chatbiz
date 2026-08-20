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

      const order = await db.order.findUnique({
        where: { paystackReference: reference },
        include: { business: true, items: true },
      });

      if (!order) {
        console.error(`Order not found for Paystack reference ${reference}`);
        return NextResponse.json({ received: true });
      }

      // Check if already paid to prevent duplicate webhook processing
      if (order.status === "PAID") {
        return NextResponse.json({ received: true });
      }

      // Verify amount (Paystack amount is in kobo)
      const expectedAmountKobo = Math.round(order.totalAmount * 100);
      if (amount < expectedAmountKobo) {
        console.error(`Insufficient amount paid for order ${order.id}. Expected ${expectedAmountKobo}, got ${amount}`);
        return NextResponse.json({ error: "Insufficient amount paid" }, { status: 400 });
      }

      // Mark order as PAID
      await db.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });

      // Decrease stock for items
      for (const item of order.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Send confirmation to Customer
      await sendWhatsAppMessage(
        order.business,
        order.customerPhone,
        `✅ Payment Received!\nYour order #${order.id.slice(-6).toUpperCase()} has been confirmed and is now being processed. Thank you for shopping with ${order.business.name}!`
      );

      // Send confirmation to Business Owner
      if (order.business.whatsappNumber) {
        await sendWhatsAppMessage(
          order.business,
          order.business.whatsappNumber.replace("+", ""),
          `💰 *New Payment Received*\nOrder #${order.id.slice(-6).toUpperCase()} for ₦${order.totalAmount} has been paid via Paystack.\nPlease check your dashboard.`
        );
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Paystack Webhook Error:", error.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
