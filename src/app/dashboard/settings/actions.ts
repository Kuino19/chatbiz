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
        type: "template",
        template: {
          name: "jaspers_market_order_confirmation_v1",
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: "John Doe" },
                { type: "text", text: "123456" },
                { type: "text", text: "Aug 6, 2026" }
              ]
            }
          ]
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
