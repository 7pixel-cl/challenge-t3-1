import { createAuthClient } from "better-auth/react";

import type { Session as AuthSession } from "@acme/auth";

import { env } from "~/env";

const client = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
});

// Re-export with typed methods
export const authClient = {
  ...client,
  useSession: () => {
    const result = client.useSession();
    return {
      ...result,
      data: result.data as AuthSession | null | undefined,
    };
  },
};
