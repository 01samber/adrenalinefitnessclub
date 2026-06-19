import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/server/validations/auth.validation";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });

        if (!parsed.success) {
          if (process.env.NODE_ENV !== "production") {
            console.log("[auth] credentials validation failed", {
              receivedEmail: credentials?.email,
              issues: parsed.error.flatten().fieldErrors,
            });
          }
          return null;
        }

        const email = parsed.data.email.trim().toLowerCase();
        const password = parsed.data.password;

        const user = await prisma.user.findUnique({ where: { email } });

        let passwordMatches = false;

        if (user) {
          passwordMatches = await verifyPassword(password, user.passwordHash);
        }

        if (process.env.NODE_ENV !== "production") {
          console.log("[auth] credentials login attempt", {
            receivedEmail: credentials?.email,
            email,
            userFound: Boolean(user),
            status: user?.status,
            role: user?.role,
            passwordMatches,
          });
        }

        if (!user) {
          return null;
        }

        if (user.status !== UserStatus.ACTIVE) {
          return null;
        }

        if (!passwordMatches) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.status = token.status;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
