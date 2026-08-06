import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;
          
          const user = await db.user.findUnique({
            where: { email: credentials.email as string }
          });

          // User must exist and have a password (register via /register)
          if (!user || !user.password) return null;

          // Validate the password
          const passwordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!passwordValid) return null;

          return user;
        } catch (error) {
          console.error("AUTH_AUTHORIZE_ERROR:", error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    }
  }
});
