import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import WebhookHelper from "./WebhookHelper";
import SettingsForm from "./SettingsForm";
import { listBanks } from "@/lib/paystack";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const business = await db.business.findUnique({
    where: { userId: session.user.id },
  });

  if (!business) redirect("/dashboard");

  const baseUrl = process.env.NEXTAUTH_URL || "https://your-domain.com";
  const banks = await listBanks();

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Configure your WhatsApp, Bank Payouts, and Business settings</p>
      </div>

      {/* ── BUSINESS PROFILE + META API (client form with toasts) ── */}
      <SettingsForm
        businessId={business.id}
        initialName={business.name}
        initialWhatsapp={business.whatsappNumber || ""}
        initialMetaToken={business.metaAccessToken || ""}
        initialPhoneNumberId={business.metaPhoneNumberId || ""}
        initialBankName={business.bankName || ""}
        initialBankCode={business.bankCode || ""}
        initialBankAccountNumber={business.bankAccountNumber || ""}
        initialBankAccountName={business.bankAccountName || ""}
        initialSubaccountCode={business.paystackSubaccountCode || ""}
        initialBotPersonality={business.botPersonality || ""}
        bankList={banks}
      />
    </div>
  );
}
