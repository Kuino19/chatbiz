"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import styles from "./page.module.css";
import toastStyles from "@/components/ToastContainer.module.css";
import { saveProfile, saveApiSettings, sendTestMessage } from "./actions";

interface Props {
  businessId: string;
  initialName: string;
  initialWhatsapp: string;
  initialMetaToken: string;
  initialPhoneNumberId: string;
}

interface ToastState {
  type: "success" | "error";
  msg: string;
} 

function useFormToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  function show(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }
  return { toast, showSuccess: (m: string) => show("success", m), showError: (m: string) => show("error", m) };
}

export default function SettingsForm({
  initialName,
  initialWhatsapp,
  initialMetaToken,
  initialPhoneNumberId,
}: Props) {
  const [profilePending, startProfile] = useTransition();
  const [apiPending, startApi] = useTransition();
  const profileToast = useFormToast();
  const apiToast = useFormToast();

  function handleProfile(formData: FormData) {
    startProfile(async () => {
      const r = await saveProfile(formData);
      r.success ? profileToast.showSuccess("Profile saved ✓") : profileToast.showError(r.error || "Save failed");
    });
  }

  function handleApi(formData: FormData) {
    startApi(async () => {
      const r = await saveApiSettings(formData);
      r.success ? apiToast.showSuccess("API settings saved ✓") : apiToast.showError(r.error || "Save failed");
    });
  }

  const [testPending, startTest] = useTransition();
  const testToast = useFormToast();

  function handleTestMessage(formData: FormData) {
    startTest(async () => {
      const r = await sendTestMessage(formData);
      r.success ? testToast.showSuccess("Test message sent ✓") : testToast.showError(r.error || "Failed to send test message");
    });
  }

  return (
    <>
      {/* ── Toasts ── */}
      {profileToast.toast && (
        <div className={`${toastStyles.portal}`} style={{ pointerEvents: "none" }}>
          <div className={`${toastStyles.toast} ${profileToast.toast.type === "success" ? toastStyles.success : toastStyles.error}`}>
            {profileToast.toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {profileToast.toast.msg}
          </div>
        </div>
      )}
      {apiToast.toast && (
        <div className={`${toastStyles.portal}`} style={{ pointerEvents: "none", bottom: "5rem" }}>
          <div className={`${toastStyles.toast} ${apiToast.toast.type === "success" ? toastStyles.success : toastStyles.error}`}>
            {apiToast.toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {apiToast.toast.msg}
          </div>
        </div>
      )}
      {testToast.toast && (
        <div className={`${toastStyles.portal}`} style={{ pointerEvents: "none", bottom: "10rem" }}>
          <div className={`${toastStyles.toast} ${testToast.toast.type === "success" ? toastStyles.success : toastStyles.error}`}>
            {testToast.toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {testToast.toast.msg}
          </div>
        </div>
      )}

      {/* ── BUSINESS PROFILE ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Business Profile</h2>
        <form action={handleProfile} className={`card ${styles.form}`}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Business Name</label>
            <input id="name" name="name" type="text" defaultValue={initialName} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="whatsappNumber">Your WhatsApp Number</label>
            <input
              id="whatsappNumber"
              name="whatsappNumber"
              type="text"
              defaultValue={initialWhatsapp}
              placeholder="+2348012345678"
            />
            <small className={styles.hint}>Receive low-stock alerts and order confirmations on your phone.</small>
          </div>
          <button type="submit" className="btn btn-primary" disabled={profilePending}>
            {profilePending ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </section>

      {/* ── META CLOUD API ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Meta WhatsApp Cloud API — Credentials</h2>
        <form action={handleApi} className={`card ${styles.form}`}>

          <div className={styles.formGroup}>
            <label htmlFor="metaPhoneNumberId">Meta Phone Number ID</label>
            <input
              id="metaPhoneNumberId"
              name="metaPhoneNumberId"
              type="text"
              defaultValue={initialPhoneNumberId}
              placeholder="From Meta Developer → WhatsApp → Phone Numbers"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="metaAccessToken">Meta Permanent Access Token</label>
            <input
              id="metaAccessToken"
              name="metaAccessToken"
              type="password"
              defaultValue={initialMetaToken}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={apiPending}>
            {apiPending ? "Saving…" : "Save API Settings"}
          </button>
        </form>
      </section>

      {/* ── APP REVIEW TEST MESSAGE ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>App Review: Send Test Message</h2>
        <form action={handleTestMessage} className={`card ${styles.form}`}>
          <div className={styles.formGroup}>
            <label htmlFor="testNumber">Your WhatsApp Number (e.g. 2348012345678)</label>
            <input
              id="testNumber"
              name="testNumber"
              type="text"
              placeholder="Include country code, no +, no spaces"
              required
            />
            <small className={styles.hint}>
              Click the button below to send the official Meta test template message to your phone. You can record your screen while doing this to submit for your App Review!
            </small>
          </div>
          <button type="submit" className="btn btn-primary" disabled={testPending}>
            {testPending ? "Sending..." : "Send Test Message"}
          </button>
        </form>
      </section>
    </>
  );
}
