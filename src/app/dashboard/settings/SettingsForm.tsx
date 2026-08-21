"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, AlertCircle, Building2, Loader2, CreditCard } from "lucide-react";
import styles from "./page.module.css";
import toastStyles from "@/components/ToastContainer.module.css";
import { saveProfile, saveApiSettings, sendTestMessage, connectWhatsAppAccount, verifyBankAccountAction } from "./actions";
import MetaLoginButton from "@/components/MetaLoginButton";
import { BankItem } from "@/lib/paystack";

interface Props {
  businessId: string;
  initialName: string;
  initialWhatsapp: string;
  initialMetaToken: string;
  initialPhoneNumberId: string;
  initialBankName: string;
  initialBankCode: string;
  initialBankAccountNumber: string;
  initialBankAccountName: string;
  initialSubaccountCode: string;
  initialBotPersonality: string;
  bankList?: BankItem[];
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

// Fallback bank list if Paystack API call was empty
const DEFAULT_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "058", name: "Guaranty Trust Bank (GTBank)" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "50211", name: "Kuda Bank" },
  { code: "565", name: "One Finance (Carbon)" },
  { code: "999991", name: "PalmPay" },
  { code: "999992", name: "OPay" },
  { code: "076", name: "Polaris Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "100", name: "Suntrust Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank (ALAT)" },
  { code: "057", name: "Zenith Bank" },
];

export default function SettingsForm({
  initialName,
  initialWhatsapp,
  initialMetaToken,
  initialPhoneNumberId,
  initialBankName,
  initialBankCode,
  initialBankAccountNumber,
  initialBankAccountName,
  initialSubaccountCode,
  initialBotPersonality,
  bankList = [],
}: Props) {
  const [accessToken, setAccessToken] = useState(initialMetaToken);
  const [profilePending, startProfile] = useTransition();
  const [apiPending, startApi] = useTransition();
  const profileToast = useFormToast();
  const apiToast = useFormToast();

  const banks = bankList.length > 0 ? bankList : DEFAULT_BANKS;

  const [selectedBankCode, setSelectedBankCode] = useState(initialBankCode || "");
  const [selectedBankName, setSelectedBankName] = useState(initialBankName || "");
  const [accountNumber, setAccountNumber] = useState(initialBankAccountNumber || "");
  const [accountName, setAccountName] = useState(initialBankAccountName || "");
  const [subaccountCode, setSubaccountCode] = useState(initialSubaccountCode || "");
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Auto-verify account name when 10 digits and bank selected
  async function verifyAccount(bankCode: string, accNum: string) {
    if (!bankCode || accNum.length !== 10) return;
    setIsResolving(true);
    setResolveError(null);

    const res = await verifyBankAccountAction(bankCode, accNum);
    setIsResolving(false);
    if (res.success && res.accountName) {
      setAccountName(res.accountName);
      setResolveError(null);
    } else {
      setResolveError(res.error || "Could not verify account name.");
    }
  }

  function handleBankChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value;
    setSelectedBankCode(code);
    const bankObj = banks.find((b) => b.code === code);
    if (bankObj) {
      setSelectedBankName(bankObj.name);
    }
    if (accountNumber.trim().length === 10) {
      verifyAccount(code, accountNumber.trim());
    }
  }

  function handleAccountNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(val);
    if (val.length === 10 && selectedBankCode) {
      verifyAccount(selectedBankCode, val);
    }
  }

  function handleProfile(formData: FormData) {
    formData.set("bankName", selectedBankName);
    formData.set("bankCode", selectedBankCode);
    formData.set("bankAccountName", accountName);
    formData.set("bankAccountNumber", accountNumber);

    startProfile(async () => {
      const r = await saveProfile(formData);
      if (r.success) {
        if (r.subaccountCode) setSubaccountCode(r.subaccountCode);
        if (r.accountName) setAccountName(r.accountName);
        profileToast.showSuccess("Profile & Paystack Subaccount saved ✓");
      } else {
        profileToast.showError(r.error || "Save failed");
      }
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


      {/* ── BUSINESS PROFILE & DIRECT PAYOUT SETTINGS ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Business Profile & Direct Bank Payouts</h2>
        
        {/* Direct Payouts Subaccount Status Banner */}
        {subaccountCode ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            color: "#065F46"
          }}>
            <CreditCard size={20} color="#059669" />
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>Direct Payouts Active (Paystack Subaccount)</div>
              <div style={{ fontSize: "0.8rem", color: "#047857" }}>
                Customer payments will route directly to your bank account via Paystack Subaccount: <code>{subaccountCode}</code>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            color: "#92400E"
          }}>
            <Building2 size={20} color="#D97706" />
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>Direct Settlement Setup Needed</div>
              <div style={{ fontSize: "0.8rem", color: "#B45309" }}>
                Enter your settlement bank details below to automatically configure your Paystack Subaccount so funds route directly to you.
              </div>
            </div>
          </div>
        )}

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

          <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", marginBottom: "0.25rem" }}>
              Settlement Bank Account (For Automated Payouts)
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#6B7280", marginBottom: "1rem" }}>
              Paystack will deposit customer payments directly into this account upon successful WhatsApp checkout.
            </p>

            <div className={styles.formGroup}>
              <label htmlFor="bankSelect">Select Bank</label>
              <select
                id="bankSelect"
                value={selectedBankCode}
                onChange={handleBankChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  backgroundColor: "#fff",
                }}
              >
                <option value="">-- Choose your Bank --</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bankAccountNumber">10-Digit Account Number (NUBAN)</label>
              <div style={{ position: "relative" }}>
                <input
                  id="bankAccountNumber"
                  type="text"
                  value={accountNumber}
                  onChange={handleAccountNumberChange}
                  placeholder="0123456789"
                  maxLength={10}
                />
                {isResolving && (
                  <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
                    <Loader2 size={18} className={styles.spinner} style={{ animation: "spin 1s linear infinite" }} />
                  </div>
                )}
              </div>
              {resolveError && (
                <small style={{ color: "#DC2626", fontWeight: "500", marginTop: "4px", display: "block" }}>
                  {resolveError}
                </small>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bankAccountName">Verified Account Name</label>
              <input
                id="bankAccountName"
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account name will be verified automatically"
                style={{
                  backgroundColor: accountName ? "#F0FDF4" : "#F9FAFB",
                  borderColor: accountName ? "#86EFAC" : "#D1D5DB",
                }}
              />
              <small className={styles.hint}>
                {accountName
                  ? "✓ Account verified with Nigeria Inter-Bank Settlement System (NIBSS)."
                  : "Select a bank and enter 10 digits to auto-verify your name."}
              </small>
            </div>
          </div>

          <div className={styles.formGroup} style={{ borderTop: "1px solid #E5E7EB", paddingTop: "1.25rem" }}>
            <label htmlFor="botPersonality">AI Bot Personality</label>
            <textarea
              id="botPersonality"
              name="botPersonality"
              rows={4}
              defaultValue={initialBotPersonality}
              placeholder="e.g. You are a cheerful and professional sales assistant for a boutique clothing store. Use emojis sparingly."
            />
            <small className={styles.hint}>Instruct the AI on how to talk to your customers.</small>
          </div>
          <button type="submit" className="btn btn-primary" disabled={profilePending || isResolving}>
            {profilePending ? "Saving & Syncing Subaccount…" : "Save Profile & Bank Details"}
          </button>
        </form>
      </section>

      {/* ── WHATSAPP BUSINESS CONNECTION ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>WhatsApp Business Connection</h2>
        <div className={`card ${styles.form}`}>
          {(!initialPhoneNumberId || !initialMetaToken) ? (
            <div>
              <p style={{ fontSize: "0.9rem", color: "#4B5563", marginBottom: "1.25rem" }}>
                Connect your WhatsApp Business number to activate your 24/7 AI sales assistant.
              </p>
              <MetaLoginButton 
                flowType="coexistence"
                onLoginSuccess={async (token) => {
                  setAccessToken(token);
                  const result = await connectWhatsAppAccount(token);
                  if (result.success) {
                    apiToast.showSuccess("Successfully connected WhatsApp account!");
                    window.location.reload();
                  } else {
                    apiToast.showError(result.error || "Failed to configure account.");
                  }
                }} 
              />
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", backgroundColor: "#dcfce7", borderRadius: "0.5rem", border: "1px solid #bbf7d0", marginBottom: "1.25rem" }}>
                <CheckCircle2 size={22} color="#16a34a" />
                <div>
                  <div style={{ fontWeight: "700", color: "#166534", fontSize: "0.95rem" }}>WhatsApp Connected & Active</div>
                  <div style={{ fontSize: "0.85rem", color: "#15803d" }}>
                    Connected Line: <strong>{initialWhatsapp || "Official WhatsApp Business Line"}</strong> &bull; 24/7 AI Sales Assistant is Online
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <MetaLoginButton 
                  flowType="coexistence"
                  onLoginSuccess={async (token) => {
                    setAccessToken(token);
                    const result = await connectWhatsAppAccount(token);
                    if (result.success) {
                      apiToast.showSuccess("WhatsApp connection updated!");
                      window.location.reload();
                    } else {
                      apiToast.showError(result.error || "Failed to update connection.");
                    }
                  }} 
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── TEST WHATSAPP BOT ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Test WhatsApp Bot</h2>
        <form action={handleTestMessage} className={`card ${styles.form}`}>
          <div className={styles.formGroup}>
            <label htmlFor="testNumber">Your WhatsApp Phone Number</label>
            <input
              id="testNumber"
              name="testNumber"
              type="text"
              placeholder="e.g. 2348012345678 (include country code, no +)"
              required
            />
            <small className={styles.hint}>
              Enter your WhatsApp number to receive an instant test message and verify your store bot is online.
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
