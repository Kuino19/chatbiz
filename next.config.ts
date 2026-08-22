import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs', 'cloudinary'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  env: {
    AUTH_URL: "https://chatbiz.goanitech.com",
    NEXTAUTH_URL: "https://chatbiz.goanitech.com",
  }
};

export default nextConfig;
