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
          onLoginSuccess(response.authResponse.accessToken);
        } else {
          console.error("User cancelled login or did not fully authorize.");
        }
      },
      {
        scope: "whatsapp_business_management,whatsapp_business_messaging",
        return_scopes: true,
        config_id: "999368676477731",
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
        backgroundColor: "#1877F2",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        width: "100%",
        marginBottom: "1rem"
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ width: "20px", height: "20px" }}
      >
        <path d="M12 2.03998C6.5 2.03998 2 6.52998 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.59998H15.19C13.95 8.59998 13.56 9.36998 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.52998 17.5 2.03998 12 2.03998Z" />
      </svg>
      {loading ? "Connecting..." : "Connect with Meta"}
    </button>
  );
}
