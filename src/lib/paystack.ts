import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export interface BankItem {
  id: number;
  name: string;
  code: string;
  active: boolean;
  country: string;
  currency: string;
}

export async function listBanks(): Promise<BankItem[]> {
  if (!PAYSTACK_SECRET_KEY) return [];

  try {
    const res = await fetch("https://api.paystack.co/bank?country=nigeria&use_cursor=false&perPage=100", {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
      next: { revalidate: 86400 }, // cache for 24h
    });

    if (!res.ok) {
      console.error("Failed to fetch bank list:", await res.text());
      return [];
    }

    const data = await res.json();
    return (data.data || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      code: b.code,
      active: b.active,
      country: b.country,
      currency: b.currency,
    }));
  } catch (err) {
    console.error("Error listing banks:", err);
    return [];
  }
}

export async function resolveAccountNumber({
  accountNumber,
  bankCode,
}: {
  accountNumber: string;
  bankCode: string;
}): Promise<{ account_number: string; account_name: string } | null> {
  if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY is not set");

  const res = await fetch(
    `https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Could not resolve account number with selected bank.");
  }

  return data.data; // { account_number, account_name, bank_id }
}

export async function createOrUpdateSubaccount({
  businessName,
  settlementBank,
  accountNumber,
  percentageCharge = 0,
  subaccountCode,
}: {
  businessName: string;
  settlementBank: string; // bank code e.g. "058"
  accountNumber: string; // 10 digit NUBAN
  percentageCharge?: number; // 0 for pure SaaS model (or custom platform fee %)
  subaccountCode?: string | null;
}): Promise<{ subaccount_code: string; id: number }> {
  if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY is not set");

  const endpoint = subaccountCode
    ? `https://api.paystack.co/subaccount/${subaccountCode}`
    : "https://api.paystack.co/subaccount";

  const method = subaccountCode ? "PUT" : "POST";

  const payload: any = {
    business_name: businessName,
    settlement_bank: settlementBank,
    account_number: accountNumber,
    percentage_charge: percentageCharge,
  };

  if (!subaccountCode) {
    payload.description = `Subaccount for ${businessName}`;
  }

  const res = await fetch(endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Failed to configure Paystack subaccount.");
  }

  return {
    subaccount_code: data.data.subaccount_code,
    id: data.data.id,
  };
}

export async function initializeTransaction({
  email,
  amount, // in kobo
  reference,
  metadata,
  subaccount,
}: {
  email: string;
  amount: number;
  reference?: string;
  metadata?: any;
  subaccount?: string | null;
}) {
  if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY is not set");

  const bodyPayload: any = {
    email,
    amount,
    reference,
    metadata,
  };

  if (subaccount) {
    bodyPayload.subaccount = subaccount;
    bodyPayload.bearer = "subaccount"; // Merchant pays Paystack transaction fee directly
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyPayload),
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

