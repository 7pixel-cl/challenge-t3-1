import { Separator } from "@acme/ui/separator";

import { getSession } from "~/auth/server";
import { HydrateClient } from "~/trpc/server";
import { AuthShowcase } from "./_components/auth-showcase";
import { CreateNoteForm, NotesList } from "./_components/notes";

export default async function HomePage() {
  const session = await getSession();

  return (
    <HydrateClient>
      <main className="container min-h-screen py-16">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              Personal <span className="text-primary">Golden Notes</span>
            </h1>
            <AuthShowcase />
          </div>

          {session && (
            <>
              <Separator />

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h2 className="mb-4 text-2xl font-bold">Create Note</h2>
                  <CreateNoteForm />
                </div>

                <div>
                  <h2 className="mb-4 text-2xl font-bold">Your Notes</h2>
                  <NotesList />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
