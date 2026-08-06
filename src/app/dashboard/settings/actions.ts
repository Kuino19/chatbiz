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
        metaAccessToken: formData.get("metaAccessToken") as string,
        metaPhoneNumberId: formData.get("metaPhoneNumberId") as string,
      },
    });
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message as string };
  }
}
