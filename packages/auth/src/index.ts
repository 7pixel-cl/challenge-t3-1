import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@acme/db/client";

/**
 * User roles for RBAC
 */
export const UserRole = {
  MEMBER: "member",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export function initAuth<
  TExtraPlugins extends BetterAuthPlugin[] = [],
>(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
  extraPlugins?: TExtraPlugins;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Disabled for easier testing/seeding
      autoSignIn: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: UserRole.MEMBER,
          required: true,
          input: false, // Security: prevent users from setting their own role
        },
      },
    },
    plugins: [expo(), ...(options.extraPlugins ?? [])],
    trustedOrigins: ["expo://"],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;

// Better Auth inferred types
type InferredSession = Auth["$Infer"]["Session"];
type InferredUser = InferredSession["user"];

// Extended user type with role field
export type User = InferredUser & { role: UserRole };

// Extended session type with properly typed user
export type Session = Omit<InferredSession, "user"> & {
  user: User;
};
