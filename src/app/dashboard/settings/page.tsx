import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import WebhookHelper from "./WebhookHelper";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const business = await db.business.findUnique({
    where: { userId: session.user.id },
  });

  if (!business) redirect("/dashboard");

  const baseUrl = process.env.NEXTAUTH_URL || "https://your-domain.com";

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Configure your WhatsApp and Business settings</p>
      </div>

      {/* ── BUSINESS PROFILE + META API (client form with toasts) ── */}
      <SettingsForm
        businessId={business.id}
        initialName={business.name}
        initialWhatsapp={business.whatsappNumber || ""}
        initialMetaToken={business.metaAccessToken || ""}
        initialPhoneNumberId={business.metaPhoneNumberId || ""}
        initialBankName={business.bankName || ""}
        initialBankAccountNumber={business.bankAccountNumber || ""}
        initialBankAccountName={business.bankAccountName || ""}
        initialBotPersonality={business.botPersonality || ""}
      />

      {/* ── META CLOUD API INFO ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Meta WhatsApp Cloud API (Production)</h2>
        <div className={`card ${styles.infoCard}`}>
          <WebhookHelper
            label="Meta Webhook URL — paste in Meta Developer Portal"
            url={`${baseUrl}/api/webhooks/whatsapp`}
          />
          <ol className={styles.instructionList}>
            <li>Open <strong>Meta Developer Portal → Your App → WhatsApp → Configuration</strong></li>
            <li>Paste the URL above into the <strong>Callback URL</strong> field</li>
            <li>Paste your <strong>WHATSAPP_VERIFY_TOKEN</strong> (from Vercel Env Vars) into the <strong>Verify Token</strong> field</li>
            <li>Subscribe to the <strong>messages</strong> webhook field</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
