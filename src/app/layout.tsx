import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatBiz — Sell on WhatsApp Like a Professional",
  description: "The all-in-one platform for Nigerian businesses to automate orders, manage inventory, and collect payments directly inside WhatsApp.",
  keywords: ["WhatsApp business", "WhatsApp commerce", "Nigeria ecommerce", "WhatsApp bot", "WhatsApp shop"],
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Script id="facebook-jssdk" strategy="afterInteractive">
          {`
            window.fbAsyncInit = function() {
              FB.init({
                appId            : '4406781476230289',
                autoLogAppEvents : true,
                xfbml            : true,
                version          : 'v26.0'
              });
            };
          `}
        </Script>
        <Script
          async
          defer
          crossOrigin="anonymous"
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
