import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiSecret = process.env.TWILIO_API_SECRET;
const fromNumber = process.env.TWILIO_PHONE_NUMBER || "whatsapp:+14155238886";



let client: twilio.Twilio;

if (apiKeySid && apiSecret && accountSid) {
  client = twilio(apiKeySid, apiSecret, { accountSid });
} else if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
} else {
  console.warn("Twilio credentials missing. Twilio features will not work.");
}

export async function sendTwilioMessage(to: string, body: string) {
  if (!client) throw new Error("Twilio client not initialized");

  // Ensure 'to' has 'whatsapp:' prefix if it's a WhatsApp message
  const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  return client.messages.create({
    from: fromNumber,
    to: formattedTo,
    body: body,
  });
}

export async function sendTwilioMediaMessage(to: string, body: string, mediaUrl: string) {
  if (!client) throw new Error("Twilio client not initialized");

  const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  return client.messages.create({
    from: fromNumber,
    to: formattedTo,
    body: body,
    mediaUrl: [mediaUrl],
  });
}
