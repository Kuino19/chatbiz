"use client";

import { useState } from "react";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface Props {
  onLoginSuccess: (accessToken: string) => void;
}

export default function MetaLoginButton({ onLoginSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (typeof window === "undefined" || !window.FB) {
      alert("Meta SDK is still loading. Please try again in a few seconds.");
      return;
    }

    setLoading(true);

    window.FB.login(
      (response: any) => {
        setLoading(false);
        if (response.authResponse) {
          console.log("Meta Login Success:", response.authResponse);
          // If code is returned, pass the code instead of accessToken
          onLoginSuccess(response.authResponse.code || response.authResponse.accessToken);
        } else {
          console.error("User cancelled login or did not fully authorize.");
        }
      },
      {
        scope: "whatsapp_business_management,whatsapp_business_messaging",
        return_scopes: true,
        config_id: "999368676477731",
        response_type: "code",
        override_default_response_type: true,
        extras: {
          feature: "whatsapp_embedded_signup",
          sessionInfoVersion: "2",
        }
      }
    );
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className="btn"
      style={{
        backgroundColor: "#25D366",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        width: "100%",
        marginBottom: "1rem",
        fontWeight: "bold"
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ width: "22px", height: "22px" }}
      >
        <path d="M12.01 2.01C6.5 2.01 2.02 6.49 2.02 12.01C2.02 13.76 2.47 15.42 3.28 16.86L2.01 21.99L7.26 20.61C8.69 21.37 10.3 21.8 12.01 21.8C17.52 21.8 22 17.32 22 11.8C22 6.28 17.52 1.8 12.01 1.8V2.01ZM12.01 19.99C10.51 19.99 9.09 19.6 7.84 18.91L7.54 18.73L4.43 19.55L5.27 16.51L5.07 16.19C4.34 14.99 3.93 13.56 3.93 12.02C3.93 7.58 7.55 3.96 11.99 3.96C16.43 3.96 20.05 7.58 20.05 12.02C20.05 16.46 16.43 20.08 11.99 20.08V19.99ZM16.44 14.07C16.2 13.95 15.02 13.37 14.8 13.29C14.58 13.21 14.42 13.17 14.26 13.41C14.1 13.65 13.64 14.19 13.5 14.35C13.36 14.51 13.22 14.53 12.98 14.41C12.74 14.29 11.96 14.04 11.04 13.22C10.32 12.58 9.83 11.78 9.69 11.54C9.55 11.3 9.67 11.17 9.79 11.05C9.9 10.94 10.03 10.77 10.15 10.63C10.27 10.49 10.31 10.39 10.39 10.23C10.47 10.07 10.43 9.93 10.37 9.81C10.31 9.69 9.83 8.5 9.63 8.02C9.43 7.55 9.24 7.62 9.1 7.61C8.96 7.6 8.8 7.6 8.64 7.6C8.48 7.6 8.22 7.66 8 7.9C7.78 8.14 7.16 8.72 7.16 9.9C7.16 11.08 8.02 12.22 8.14 12.38C8.26 12.54 9.83 14.96 12.24 16C12.81 16.25 13.26 16.4 13.62 16.51C14.19 16.69 14.71 16.66 15.12 16.6C15.58 16.53 16.56 16.01 16.76 15.43C16.96 14.85 16.96 14.35 16.9 14.23C16.84 14.11 16.68 14.03 16.44 13.91V14.07Z" />
      </svg>
      {loading ? "Connecting..." : "Connect WhatsApp Business"}
    </button>
  );
}
