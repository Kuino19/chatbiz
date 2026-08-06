import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processWhatsAppMessage } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe') {
      // Find a business that has this verify token
      const business = await db.business.findFirst({
        where: { webhookVerifyToken: token }
      });

      if (business) {
        console.log('WEBHOOK_VERIFIED');
        return new NextResponse(challenge, { status: 200 });
      }
    }
    return new NextResponse("Forbidden", { status: 403 });
  }

  return new NextResponse("Bad Request", { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        // We can use the Meta Phone Number ID to identify the business
        const metaPhoneNumberId = entry.changes[0]?.value?.metadata?.phone_number_id;
        
        if (!metaPhoneNumberId) continue;

        const business = await db.business.findFirst({
          where: { metaPhoneNumberId }
        });

        if (!business) {
          console.error("No business found for phone_number_id:", metaPhoneNumberId);
          continue;
        }

        const messages = entry.changes[0]?.value?.messages;
        if (messages && messages[0]) {
          const message = messages[0];
          const from = message.from; // customer phone number
          
          // Process the message in the background to not block the webhook response
          processWhatsAppMessage(business.id, from, message).catch(err => {
            console.error("Error processing WhatsApp message:", err);
          });
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
