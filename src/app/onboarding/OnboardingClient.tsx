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
      <div className={styles.iconWrapper}>
        <MessageSquare size={32} color="#1877F2" />
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
              <p className={styles.helperText}>
                You will be redirected to Meta to securely authorize your WhatsApp number.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
