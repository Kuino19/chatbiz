"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
      padding: "2rem",
      textAlign: "center"
    }}>
      <div style={{
        background: "#FEE2E2",
        padding: "1rem",
        borderRadius: "50%",
        marginBottom: "1rem",
        color: "#DC2626"
      }}>
        <AlertCircle size={36} />
      </div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827", marginBottom: "0.5rem" }}>
        Unable to load this section
      </h2>
      <p style={{ fontSize: "0.9rem", color: "#6B7280", maxWidth: "400px", marginBottom: "1.5rem" }}>
        {error.message || "An unexpected error occurred. Please try reloading or check your internet connection."}
      </p>
      <button
        onClick={() => reset()}
        className="btn btn-primary"
        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        <RefreshCw size={16} /> Try Again
      </button>
    </div>
  );
}
