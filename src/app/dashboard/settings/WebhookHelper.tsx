"use client";

import { useState } from "react";
import { Copy, Check, Send, Loader2 } from "lucide-react";
import styles from "./WebhookHelper.module.css";

interface WebhookHelperProps {
  label: string;
  url: string;
  isTestSection?: boolean;
  businessWhatsapp?: string;
}

export default function WebhookHelper({ label, url, isTestSection, businessWhatsapp }: WebhookHelperProps) {
  const [copied, setCopied] = useState(false);
  const [testTo, setTestTo] = useState(businessWhatsapp || "");
  const [testMsg, setTestMsg] = useState("Hello from ChatBiz! Your bot is working 🚀");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/test-twilio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo, message: testMsg }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ ok: true, text: `✅ Message sent! SID: ${data.sid}` });
      } else {
        setResult({ ok: false, text: `❌ Error: ${data.error}` });
      }
    } catch (e: any) {
      setResult({ ok: false, text: `❌ Network error: ${e.message}` });
    } finally {
      setSending(false);
    }
  };

  if (isTestSection) {
    return (
      <div className={`card ${styles.testCard}`}>
        <p className={styles.testDesc}>
          Send a test WhatsApp message via Twilio to verify your credentials are working.
        </p>
        <div className={styles.testRow}>
          <div className={styles.testField}>
            <label>Send to (WhatsApp number)</label>
            <input
              type="tel"
              value={testTo}
              onChange={e => setTestTo(e.target.value)}
              placeholder="+2348012345678"
            />
          </div>
          <div className={styles.testField} style={{ flex: 2 }}>
            <label>Message</label>
            <input
              type="text"
              value={testMsg}
              onChange={e => setTestMsg(e.target.value)}
            />
          </div>
          <button
            onClick={handleTest}
            disabled={sending || !testTo}
            className={`btn btn-primary ${styles.sendBtn}`}
          >
            {sending ? <Loader2 size={16} className={styles.spin} /> : <Send size={16} />}
            {sending ? "Sending…" : "Send Test"}
          </button>
        </div>
        {result && (
          <div className={`${styles.testResult} ${result.ok ? styles.resultOk : styles.resultErr}`}>
            {result.text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.urlBox}>
      <span className={styles.urlLabel}>{label}</span>
      <div className={styles.urlRow}>
        <code className={styles.urlText}>{url}</code>
        <button onClick={handleCopy} className={styles.copyBtn} title="Copy to clipboard">
          {copied ? <Check size={15} color="#25D366" /> : <Copy size={15} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
