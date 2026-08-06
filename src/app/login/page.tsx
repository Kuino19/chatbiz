"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "CredentialsSignin"
      ? "Invalid email or password."
      : null
  );
  const justRegistered = searchParams.get("registered") === "true";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.wrapper}>
        {/* Logo */}
        <Link href="/" className={styles.brand}>
          <div className={styles.logoIcon}><MessageSquare size={15} /></div>
          <span>ChatBiz</span>
        </Link>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Sign in to your WhatsApp store</p>
          </div>

          {/* Success banner from registration */}
          {justRegistered && (
            <div className={styles.successBox}>
              <CheckCircle2 size={15} />
              Account created! Sign in to get started 🚀
            </div>
          )}

          {/* Error alert */}
          {error && (
            <div className={styles.errorBox}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <div className={styles.divider}><span>New to ChatBiz?</span></div>
          <Link href="/register" className={styles.registerBtn}>
            Create a free account
          </Link>
        </div>

        <p className={styles.legal}>
          By signing in, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ background: "#050c14", minHeight: "100vh" }} />}>
      <LoginForm />
    </Suspense>
  );
}
