"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { connectWhatsAppAccount } from "@/app/dashboard/settings/actions";
import MetaLoginButton from "@/components/MetaLoginButton";
import { MessageSquare, Loader2, CheckCircle } from "lucide-react";
import styles from "./onboarding.module.css";

export default function OnboardingClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleLoginSuccess = async (accessToken: string) => {
    setLoading(true);
    setError(null);

    const res = await connectWhatsAppAccount(accessToken);

    if (res?.success) {
      setSuccess(true);
      // Give them a second to read the success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      setError(res?.error || "Failed to connect WhatsApp account.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px" }}>Step 1 of 2</span>
        <div style={{ display: "flex", gap: "4px", justifyContent: "center", marginTop: "8px" }}>
          <div style={{ height: "4px", width: "30px", background: "#25D366", borderRadius: "2px" }} />
          <div style={{ height: "4px", width: "30px", background: "#e5e7eb", borderRadius: "2px" }} />
        </div>
      </div>

      <div className={styles.iconWrapper}>
        <MessageSquare size={32} color="#25D366" />
      </div>
      <h1 className={styles.title}>Connect WhatsApp</h1>
      <p className={styles.subtitle}>
        Link your WhatsApp Business Account to start receiving and managing orders directly from ChatBiz.
      </p>

      {error && (
        <div className={styles.errorAlert}>
          {error}
        </div>
      )}

      {success ? (
        <div className={styles.successState}>
          <CheckCircle size={48} color="#22c55e" />
          <p>Successfully connected! Redirecting to dashboard...</p>
        </div>
      ) : (
        <div className={styles.actionContainer}>
          {loading ? (
            <div className={styles.loadingState}>
              <Loader2 className={styles.spinner} size={24} />
              <p>Configuring your WhatsApp connection...</p>
            </div>
          ) : (
            <>
              <MetaLoginButton onLoginSuccess={handleLoginSuccess} />
              <p className={styles.helperText} style={{ marginBottom: "1rem", color: "#6b7280" }}>
                🔒 We never see your WhatsApp password. You will be redirected to Meta to securely authorize your number.
              </p>
              
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", marginTop: "1rem", fontSize: "0.9rem" }}>
                <p style={{ color: "#4b5563", marginBottom: "0.5rem" }}>Don't have a WhatsApp Business number yet?</p>
                <a href="https://business.whatsapp.com/" target="_blank" rel="noreferrer" style={{ color: "#25D366", fontWeight: "600", textDecoration: "none" }}>
                  Here's how to set one up in 2 minutes &rarr;
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
