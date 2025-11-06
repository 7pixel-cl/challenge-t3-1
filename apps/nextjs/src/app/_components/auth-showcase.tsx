import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, getSession } from "~/auth/server";
import { AuthShowcaseClient } from "./auth-showcase-client";

export async function AuthShowcase() {
  const session = await getSession();

  const handleSignOut = async () => {
    "use server";
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/");
  };

  return (
    <AuthShowcaseClient
      isAuthenticated={!!session}
      userName={session?.user.name}
      onSignOut={handleSignOut}
    />
  );
}
