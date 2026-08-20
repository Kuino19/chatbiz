import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";
import styles from "./onboarding.module.css";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const business = await db.business.findUnique({
    where: { userId: session.user.id },
  });

  if (!business) {
    redirect("/login");
  }

  if (business.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className={styles.page}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.wrapper}>
        <div className={styles.brand}>
          <img src="/logo.png" alt="ChatBiz Logo" style={{ width: 20, height: 20 }} />
          <span>ChatBiz</span>
        </div>

        <OnboardingClient />
      </div>
    </div>
  );
}
