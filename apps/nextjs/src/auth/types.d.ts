import "better-auth/react";

import type { UserRole } from "@acme/auth";

declare module "better-auth/react" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      emailVerified: boolean;
      createdAt: Date;
      updatedAt: Date;
      role: UserRole;
    };
  }
}
