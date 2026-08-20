import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function initializeTransaction({
  email,
  amount, // in kobo
  reference,
  metadata,
}: {
  email: string;
  amount: number;
  reference?: string;
  metadata?: any;
}) {
  if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY is not set");

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      reference,
      metadata,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to initialize Paystack transaction");
  }

  return data.data; // { authorization_url, access_code, reference }
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  if (!PAYSTACK_SECRET_KEY) return false;

  const expectedSignature = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  return signature === expectedSignature;
}
