"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function completeOnboarding(businessId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.business.update({
    where: { id: businessId },
    data: { onboardingCompleted: true }
  });

  revalidatePath("/dashboard");
}
