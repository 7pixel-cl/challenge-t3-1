import { redirect } from "next/navigation";
import { auth } from "~/auth/server";
import { NoteDetailClient } from "./_components/note-detail-client";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/?error=unauthorized");
  }

  return <NoteDetailClient noteId={id} />;
}

async function headers() {
  const { headers } = await import("next/headers");
  return headers();
}
