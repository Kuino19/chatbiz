"use client";

import styles from "../login/page.module.css";
import Link from "next/link";
import { registerUser } from "./actions";
import { useState } from "react";
import { MessageSquare } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await registerUser(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.wrapper}>
        <Link href="/" className={styles.brand}>
          <img src="/logo.png" alt="ChatBiz" style={{ width: 22, height: 22 }} />
          <span>ChatBiz</span>
        </Link>

        <div className={styles.card} style={{ maxWidth: "460px" }}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>Create your store</h1>
            <p className={styles.subtitle}>Start selling on WhatsApp in minutes</p>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "1.25rem",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}

          <form className={styles.form} action={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Your name</label>
              <input id="name" name="name" type="text" required placeholder="John Doe" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required placeholder="you@company.com" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Min. 6 characters"
                minLength={6}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Creating your store…" : "Create My Store →"}
            </button>
          </form>

          <div className={styles.divider}><span>Already have an account?</span></div>
          <Link href="/login" className={styles.registerBtn}>
            Sign in instead
          </Link>
        </div>

        <p className={styles.legal}>
          By registering, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
