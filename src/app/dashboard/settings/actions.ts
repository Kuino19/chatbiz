"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { listBanks, resolveAccountNumber, createOrUpdateSubaccount } from "@/lib/paystack";
import { encryptToken, decryptToken } from "@/lib/crypto";

export async function getBankListAction() {
  return await listBanks();
}

export async function verifyBankAccountAction(bankCode: string, accountNumber: string) {
  if (!bankCode || !accountNumber || accountNumber.length !== 10) {
    return { success: false, error: "Please provide a valid 10-digit account number and select a bank." };
  }

  try {
    const data = await resolveAccountNumber({ accountNumber, bankCode });
    if (data && data.account_name) {
      return { success: true, accountName: data.account_name };
    }
    return { success: false, error: "Could not resolve account." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to verify account details with bank." };
  }
}

export async function saveProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const business = await db.business.findUnique({
      where: { userId: session.user.id },
    });

    if (!business) return { success: false, error: "Business not found" };

    const name = (formData.get("name") as string) || business.name;
    const whatsappNumber = formData.get("whatsappNumber") as string;
    const bankName = (formData.get("bankName") as string) || null;
    const bankCode = (formData.get("bankCode") as string) || null;
    const bankAccountNumber = (formData.get("bankAccountNumber") as string) || null;
    let bankAccountName = (formData.get("bankAccountName") as string) || null;
    const botPersonality = (formData.get("botPersonality") as string) || null;

    let subaccountCode = business.paystackSubaccountCode;

    // If bank details provided, create or update Paystack subaccount
    if (bankCode && bankAccountNumber && bankAccountNumber.trim().length === 10) {
      try {
        // Resolve account name if not provided or to ensure accuracy
        const resolved = await resolveAccountNumber({
          accountNumber: bankAccountNumber.trim(),
          bankCode: bankCode.trim(),
        });
        if (resolved?.account_name) {
          bankAccountName = resolved.account_name;
        }

        const subaccountResult = await createOrUpdateSubaccount({
          businessName: name,
          settlementBank: bankCode.trim(),
          accountNumber: bankAccountNumber.trim(),
          subaccountCode: business.paystackSubaccountCode,
        });

        if (subaccountResult?.subaccount_code) {
          subaccountCode = subaccountResult.subaccount_code;
        }
      } catch (paystackErr: any) {
        console.error("Paystack Subaccount Setup Error:", paystackErr);
        return {
          success: false,
          error: `Paystack Subaccount error: ${paystackErr.message || "Invalid bank details."}`,
        };
      }
    }

    await db.business.update({
      where: { userId: session.user.id },
      data: {
        name,
        whatsappNumber,
        bankName,
        bankCode,
        bankAccountNumber,
        bankAccountName,
        paystackSubaccountCode: subaccountCode,
        botPersonality,
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return {
      success: true,
      subaccountCode,
      accountName: bankAccountName,
    };
  } catch (e: any) {
    return { success: false, error: e.message as string };
  }
}

export async function saveApiSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const rawToken = (formData.get("metaAccessToken") as string || "").trim();
    const encryptedToken = rawToken ? encryptToken(rawToken) : undefined;

    await db.business.update({
      where: { userId: session.user.id },
      data: {
        ...(encryptedToken && { metaAccessToken: encryptedToken }),
        metaPhoneNumberId: (formData.get("metaPhoneNumberId") as string).trim(),
      },
    });
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message as string };
  }
}

export async function sendTestMessage(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const business = await db.business.findUnique({
      where: { userId: session.user.id }
    });

    if (!business || !business.metaAccessToken || !business.metaPhoneNumberId) {
      return { success: false, error: "Missing API credentials" };
    }

    let testNumber = (formData.get("testNumber") as string || "").trim();
    if (!testNumber) return { success: false, error: "No test number provided" };

    // Sanitize phone number to digits only
    let cleanNumber = testNumber.replace(/\D/g, "");
    // If entered as 080... (11 digits in Nigeria), convert to 23480...
    if (cleanNumber.length === 11 && cleanNumber.startsWith("0")) {
      cleanNumber = "234" + cleanNumber.slice(1);
    }

    const plainToken = decryptToken(business.metaAccessToken);
    if (!plainToken) {
      return { success: false, error: "Failed to decrypt API access token" };
    }

    const url = `https://graph.facebook.com/v21.0/${business.metaPhoneNumberId}/messages`;
    
    // Meta requires an approved template (like 'hello_world') when initiating contact outside 24h window
    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${plainToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanNumber,
        type: "template",
        template: {
          name: "hello_world",
          language: { code: "en_US" }
        }
      }),
    });

    let data = await response.json();

    // If template fails (e.g. template not created in WABA yet), try fallback to text message
    if (!response.ok) {
      console.warn("Template test message failed, trying fallback text:", data);
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${plainToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanNumber,
          type: "text",
          text: {
            body: `Hello from ${business.name}! Your ChatBiz WhatsApp bot is online and working properly.`
          }
        }),
      });

      data = await response.json();
    }

    if (!response.ok) {
      console.error("[sendTestMessage Error]", JSON.stringify(data));
      const errorMsg = data.error?.message || "Failed to send test message.";
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message as string };
  }
}

export async function connectWhatsAppAccount(codeOrToken: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    let accessToken = codeOrToken;

    // If it's not a direct token (doesn't start with EAA), it's likely an OAuth code that needs exchanging
    if (!accessToken.startsWith("EAA")) {
      if (!process.env.META_APP_SECRET) {
        return { success: false, error: "Server missing META_APP_SECRET environment variable to exchange OAuth code." };
      }
      
      const clientId = process.env.NEXT_PUBLIC_META_APP_ID || "4406781476230289"; // Fallback to current app id if not set
      
      // When exchanging a code from FB.login (JS SDK), we MUST omit redirect_uri
      const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${clientId}&client_secret=${process.env.META_APP_SECRET}&code=${codeOrToken}`;
      
      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        return { success: false, error: tokenData.error?.message || "Failed to exchange OAuth code for token." };
      }
      
      accessToken = tokenData.access_token;
    }

    const clientId = process.env.NEXT_PUBLIC_META_APP_ID || "4406781476230289";
    
    // 1. Fetch WABA ID using debug_token
    const debugUrl = `https://graph.facebook.com/v21.0/debug_token?input_token=${accessToken}&access_token=${clientId}|${process.env.META_APP_SECRET}`;
    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();

    if (!debugResponse.ok || !debugData.data) {
      return { success: false, error: debugData.error?.message || "Failed to validate token." };
    }

    const granularScopes = debugData.data.granular_scopes || [];
    const wabaScope = granularScopes.find((s: any) => s.scope === "whatsapp_business_management" || s.scope === "whatsapp_business_messaging");
    
    if (!wabaScope || !wabaScope.target_ids || wabaScope.target_ids.length === 0) {
      return { success: false, error: "No WhatsApp Business Account linked to this token. Please ensure you completed the Embedded Signup." };
    }

    const wabaId = wabaScope.target_ids[0];

    // 2. Fetch Phone Numbers for this WABA
    const phoneResponse = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/phone_numbers`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    const phoneData = await phoneResponse.json();
    if (!phoneResponse.ok || !phoneData.data || phoneData.data.length === 0) {
      return { success: false, error: phoneData.error?.message || "No phone numbers found for this WABA." };
    }

    const phoneNumberId = phoneData.data[0].id;
    const displayPhoneNumber = phoneData.data[0].display_phone_number;

    // 3. Subscribe the App to the Webhook for this WABA
    const subscribeResponse = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!subscribeResponse.ok) {
      console.warn("Failed to subscribe WABA to webhook (App might already be globally subscribed)", await subscribeResponse.json());
    }

    // 4. Encrypt Access Token before storing in Database
    const encryptedToken = encryptToken(accessToken);

    // 5. Update Business in Database
    await db.business.update({
      where: { userId: session.user.id },
      data: {
        metaAccessToken: encryptedToken,
        wabaId: wabaId,
        metaPhoneNumberId: phoneNumberId,
        whatsappNumber: displayPhoneNumber,
        metaTokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Approximate 60 days
        onboardingCompleted: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: { wabaId, phoneNumberId, displayPhoneNumber } };
  } catch (error: any) {
    console.error("Meta Connection Error:", error);
    return { success: false, error: "An unexpected error occurred during connection." };
  }
}
