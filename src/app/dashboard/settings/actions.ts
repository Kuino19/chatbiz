"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    await db.business.update({
      where: { userId: session.user.id },
      data: {
        name: formData.get("name") as string,
        whatsappNumber: formData.get("whatsappNumber") as string,
        bankName: (formData.get("bankName") as string) || null,
        bankAccountNumber: (formData.get("bankAccountNumber") as string) || null,
        bankAccountName: (formData.get("bankAccountName") as string) || null,
        botPersonality: (formData.get("botPersonality") as string) || null,
      },
    });
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message as string };
  }
}

export async function saveApiSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    await db.business.update({
      where: { userId: session.user.id },
      data: {
        metaAccessToken: (formData.get("metaAccessToken") as string).trim(),
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

    const testNumber = formData.get("testNumber") as string;
    if (!testNumber) return { success: false, error: "No test number provided" };

    const url = `https://graph.facebook.com/v21.0/${business.metaPhoneNumberId}/messages`;
    
    // We send a simple text message or the exact template Meta suggested.
    // The requirement says: "Embed the cURL command from step 2 into your website and record how you send a message."
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${business.metaAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: testNumber,
        type: "text",
        text: {
          body: "What can I help you today?"
        }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || "Failed to send test message" };
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
      
      const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=4406781476230289&redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL || "https://chatbiz.goanitech.com/")}&client_secret=${process.env.META_APP_SECRET}&code=${codeOrToken}`;
      
      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        return { success: false, error: tokenData.error?.message || "Failed to exchange OAuth code for token." };
      }
      
      accessToken = tokenData.access_token;
    }

    // 1. Fetch Client WhatsApp Business Accounts (since we are a Tech Provider)
    // The user token granted via Embedded Signup allows us to fetch their linked WABA.
    const url = `https://graph.facebook.com/v21.0/me/client_whatsapp_business_accounts`;
    const wabaResponse = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    const wabaData = await wabaResponse.json();
    if (!wabaResponse.ok) {
      return { success: false, error: wabaData.error?.message || "Failed to fetch WABA" };
    }

    if (!wabaData.data || wabaData.data.length === 0) {
      return { success: false, error: "No WhatsApp Business Accounts found. Please ensure you completed the Embedded Signup." };
    }

    // Usually we take the first WABA, or present a UI for the user to choose. We take the first for simplicity.
    const wabaId = wabaData.data[0].id;

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
    // This requires the Tech Provider's System User Token, but the user's token with whatsapp_business_management might suffice if our App is configured correctly.
    // NOTE: Webhook subscriptions are often done at the App level for Tech Providers. 
    // We will attempt to subscribe the WABA.
    const subscribeResponse = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!subscribeResponse.ok) {
      console.warn("Failed to subscribe WABA to webhook (App might already be globally subscribed)", await subscribeResponse.json());
    }

    // 4. Update Business in Database
    await db.business.update({
      where: { userId: session.user.id },
      data: {
        metaAccessToken: accessToken,
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
