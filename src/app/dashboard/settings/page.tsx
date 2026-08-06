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
        initialVerifyToken={business.webhookVerifyToken || ""}
        initialMetaToken={business.metaAccessToken || ""}
        initialPhoneNumberId={business.metaPhoneNumberId || ""}
      />

      {/* ── TWILIO SANDBOX ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Twilio WhatsApp (Sandbox / Testing)</h2>
        <div className={`card ${styles.infoCard}`}>
          <p className={styles.infoText}>
            Use Twilio&apos;s WhatsApp Sandbox for testing without a live number.
          </p>
          <WebhookHelper
            label="Twilio Webhook URL — paste in Twilio Console"
            url={`${baseUrl}/api/twilio/webhook`}
          />
          <ol className={styles.instructionList}>
            <li>Go to <strong>Twilio Console → Messaging → WhatsApp → Sandbox</strong></li>
            <li>Paste the URL above as <strong>"WHEN A MESSAGE COMES IN"</strong></li>
            <li>Set method to <strong>HTTP POST</strong></li>
            <li>Send <code>join &lt;your-sandbox-word&gt;</code> from your phone to activate</li>
          </ol>
        </div>
      </section>

      {/* ── META CLOUD API INFO ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Meta WhatsApp Cloud API (Production)</h2>
        <div className={`card ${styles.infoCard}`}>
          <WebhookHelper
            label="Meta Webhook URL — paste in Meta Developer Portal"
            url={`${baseUrl}/api/whatsapp/webhook`}
          />
          <ol className={styles.instructionList}>
            <li>Open <strong>Meta Developer Portal → Your App → WhatsApp → Configuration</strong></li>
            <li>Paste the URL and your <strong>Verify Token</strong> from the form above</li>
            <li>Subscribe to the <strong>messages</strong> webhook field</li>
          </ol>
        </div>
      </section>

      {/* ── TEST BOT ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Test Your Bot</h2>
        <WebhookHelper
          label="Send a test WhatsApp message via Twilio"
          url="/api/test-twilio"
          isTestSection
          businessWhatsapp={business.whatsappNumber || ""}
        />
      </section>
    </div>
  );
}
