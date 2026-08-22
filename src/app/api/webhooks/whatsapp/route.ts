import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processWhatsAppMessage } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- GET: Meta verification handshake ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    // Must echo back the challenge as plain text, status 200
    console.log('WEBHOOK_VERIFIED');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Distributed database-level idempotency to guarantee zero duplicate executions across serverless instances
async function isDuplicateMessage(msgId: string): Promise<boolean> {
  try {
    await db.processedWebhook.create({
      data: { id: msgId }
    });
    return false; // Newly inserted, not a duplicate
  } catch (err: any) {
    // Unique key collision means this Meta message was already processed
    return true;
  }
}

// --- POST: incoming messages / status updates ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        const metaPhoneNumberId = entry.changes[0]?.value?.metadata?.phone_number_id;
        
        if (!metaPhoneNumberId) continue;

        // Lookup which business this phone number belongs to
        const business = await db.business.findFirst({
          where: { metaPhoneNumberId }
        });

        if (!business) {
          console.error("No business found for phone_number_id:", metaPhoneNumberId);
          continue;
        }

        const value = entry.changes[0]?.value;
        const messages = value?.messages;
        const statuses = value?.statuses;

        if (messages && messages.length > 0) {
          for (const msg of messages) {
            const msgId = msg.id;
            if (msgId) {
              const isDupe = await isDuplicateMessage(msgId);
              if (isDupe) {
                console.log(`[Distributed Deduplication] Ignoring duplicate message ${msgId}`);
                continue;
              }
            }

            const from = msg.from; // sender's WhatsApp number
            
            // Await the message processing so serverless doesn't freeze prematurely
            await processWhatsAppMessage(business.id, from, msg).catch(err => {
              console.error("Error processing WhatsApp message:", err);
            });
          }
        }

        if (statuses && statuses.length > 0) {
          for (const status of statuses) {
            console.log("Message status update:", {
              id: status.id,
              status: status.status,
              recipient: status.recipient_id,
            });
            // Track delivery state in the future if needed
          }
        }
      }
      
      // Always acknowledge quickly
      return NextResponse.json({ status: "ok" }, { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (err: any) {
    console.error("Webhook processing error:", err);

    // Still return 200 so Meta doesn't retry-storm on parsing edge cases
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
