"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { connectWhatsAppAccount } from "@/app/dashboard/settings/actions";
import MetaLoginButton from "@/components/MetaLoginButton";
import { MessageSquare, Loader2, CheckCircle, Lock } from "lucide-react";
import styles from "./onboarding.module.css";

export default function OnboardingClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<"selection" | "existing" | "new">("selection");
  const router = useRouter();

  const handleLoginSuccess = async (accessToken: string) => {
    setLoading(true);
    setError(null);

    const res = await connectWhatsAppAccount(accessToken);

    if (res?.success) {
      setSuccess(true);
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
        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px" }}>Final Step</span>
        <div style={{ display: "flex", gap: "4px", justifyContent: "center", marginTop: "8px" }}>
          <div style={{ height: "4px", width: "30px", background: "#25D366", borderRadius: "2px" }} />
          <div style={{ height: "4px", width: "30px", background: "#25D366", borderRadius: "2px" }} />
        </div>
      </div>

      <div className={styles.iconWrapper}>
        <MessageSquare size={32} color="#25D366" />
      </div>

      {onboardingStep === "selection" && !success && (
        <>
          <h1 className={styles.title}>How do you use WhatsApp today?</h1>
          <p className={styles.subtitle}>
            Do you already have a WhatsApp Business number with existing customers, or are you starting fresh?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
            <button
              onClick={() => setOnboardingStep("existing")}
              style={{ padding: "1.25rem", border: "1px solid #e5e7eb", borderRadius: "12px", background: "#fff", textAlign: "left", cursor: "pointer", transition: "all 0.2s" }}
              className="hover:border-[#25D366] hover:bg-[#F0FDF4]"
            >
              <div style={{ fontWeight: "700", color: "#0B132B", marginBottom: "0.25rem" }}>I have an existing Business number</div>
              <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Keep your current app and chat history. ChatBiz will work alongside it.</div>
            </button>
            <button
              onClick={() => setOnboardingStep("new")}
              style={{ padding: "1.25rem", border: "1px solid #e5e7eb", borderRadius: "12px", background: "#fff", textAlign: "left", cursor: "pointer", transition: "all 0.2s" }}
              className="hover:border-[#25D366] hover:bg-[#F0FDF4]"
            >
              <div style={{ fontWeight: "700", color: "#0B132B", marginBottom: "0.25rem" }}>I am starting fresh</div>
              <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>I have a new phone number that is not yet on WhatsApp.</div>
            </button>
          </div>
        </>
      )}

      {onboardingStep !== "selection" && !success && (
        <>
          <h1 className={styles.title}>
            {onboardingStep === "existing" ? "Connect Your Existing Number" : "Connect a New Number"}
          </h1>
          <p className={styles.subtitle} style={{ marginBottom: "1.5rem" }}>
            {onboardingStep === "existing"
              ? "ChatBiz will safely co-exist with your current WhatsApp Business app. Your existing chats and customers stay exactly where they are."
              : "Register your fresh number directly as an API line. You don't even need to install the WhatsApp app on your phone."}
          </p>

          <button onClick={() => setOnboardingStep("selection")} style={{ fontSize: "0.85rem", color: "#6b7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginBottom: "1.5rem" }}>
            &larr; Go back
          </button>
        </>
      )}

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
        onboardingStep !== "selection" && (
          <div className={styles.actionContainer}>
            {loading ? (
              <div className={styles.loadingState}>
                <Loader2 className={styles.spinner} size={24} />
                <p>Configuring your WhatsApp connection...</p>
              </div>
            ) : (
              <>
                {onboardingStep === "existing" && (
                  <div style={{ background: "#F9FAFB", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", border: "1px solid #E5E7EB", textAlign: "left" }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0B132B", marginBottom: "0.75rem" }}>What to expect next:</p>
                    <ol style={{ paddingLeft: "1.25rem", margin: 0, fontSize: "0.85rem", color: "#4B5563", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <li>Click <strong>Connect</strong> below to open Facebook.</li>
                      <li>Check your WhatsApp Business app on your phone for a message from "Facebook Business".</li>
                      <li>Tap <strong>Connect</strong> inside WhatsApp, then come back here to enter the code.</li>
                    </ol>
                  </div>
                )}
                
                <MetaLoginButton 
                  onLoginSuccess={handleLoginSuccess} 
                  flowType={onboardingStep === "existing" ? "coexistence" : "new"} 
                />
                
                <p className={styles.helperText} style={{ marginBottom: "1rem", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Lock size={12} style={{ marginRight: '6px' }} />
                  We never see your WhatsApp password. You will be redirected to Meta to securely authorize your number.
                </p>
                
                {onboardingStep === "new" && (
                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", marginTop: "1rem", fontSize: "0.85rem" }}>
                    <p style={{ color: "#4b5563", marginBottom: "0.25rem", fontWeight: "600" }}>Getting an error?</p>
                    <p style={{ color: "#6b7280", lineHeight: 1.5 }}>
                      If Meta says your number is already registered (a common issue with recycled SIMs), try 
                      <button onClick={() => setOnboardingStep("existing")} style={{ background: "none", border: "none", color: "#0B132B", fontWeight: "600", textDecoration: "underline", cursor: "pointer", padding: "0 4px" }}>
                        connecting it as an existing number
                      </button> 
                      instead.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )
      )}
    </div>
  );
}
