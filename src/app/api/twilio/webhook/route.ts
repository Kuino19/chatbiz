import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processWhatsAppMessage } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const from = formData.get('From') as string; // e.g. whatsapp:+234...
    const to = formData.get('To') as string;     // e.g. whatsapp:+1415...
    const body = formData.get('Body') as string;
    const numMedia = parseInt(formData.get('NumMedia') as string || '0', 10);

    const cleanFrom = from.replace('whatsapp:', '');
    const cleanTo = to.replace('whatsapp:', '');

    // Try to find business by their WhatsApp number first
    let business = await db.business.findFirst({
      where: {
        OR: [
          { whatsappNumber: cleanTo },
          { whatsappNumber: to },
        ]
      }
    });

    // Fallback: in Twilio sandbox mode the "To" is Twilio's shared sandbox number
    // (+14155238886), not the business's number. So if no match, find any business
    // that has a whatsapp number configured (first one — single-tenant dev mode).
    if (!business) {
      business = await db.business.findFirst({
        where: { whatsappNumber: { not: null } }
      });
    }

    // Last resort: just grab the first business in the DB (sandbox testing)
    if (!business) {
      business = await db.business.findFirst();
    }

    if (!business) {
      console.error("No business found for Twilio number:", to);
      return new NextResponse("Business Not Found", { status: 404 });
    }

    // Map Twilio fields to our internal message format
    const message: any = {
      from: cleanFrom,
    };

    if (numMedia > 0) {
      message.type = "image";
      message.image = {
        id: formData.get('MediaUrl0'),
        url: formData.get('MediaUrl0')
      };
    } else {
      message.type = "text";
      message.text = { body: body };
    }

    // Process the message
    await processWhatsAppMessage(business.id, cleanFrom, message);

    // Twilio expects a 200 (optionally with TwiML)
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Twilio Webhook error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
