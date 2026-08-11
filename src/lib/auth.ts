import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { RateLimitSignInError } from "@/lib/auth-errors";
import { AUTH_LIMITS, consumeRateLimit, isRateLimited } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();

        if (
          await isRateLimited(
            `auth:login:email:${email}`,
            AUTH_LIMITS.loginEmail.limit,
            AUTH_LIMITS.loginEmail.windowSeconds
          )
        ) {
          throw new RateLimitSignInError();
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        const valid =
          !!user &&
          (await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          ));

        if (!valid) {
          await consumeRateLimit(
            `auth:login:email:${email}`,
            AUTH_LIMITS.loginEmail.limit,
            AUTH_LIMITS.loginEmail.windowSeconds
          );
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
