import { createAuthClient } from "better-auth/react";

import type { Session as AuthSession } from "@acme/auth";

export const authClient = createAuthClient();

// Type-safe useSession hook
export const useTypedSession = () => {
  const session = authClient.useSession();
  return {
    ...session,
    data: session.data as AuthSession | null | undefined,
  };
};
