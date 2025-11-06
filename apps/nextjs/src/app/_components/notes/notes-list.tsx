"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { authClient } from "~/auth/client";
import { useTRPC } from "~/trpc/react";

export function NotesList() {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Get current user session to check if admin
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "admin";

  const { data: notes, isLoading, error } = useQuery(trpc.notes.list.queryOptions());

  const deleteNote = useMutation(
    trpc.notes.delete.mutationOptions({
      onSuccess: async () => {
        // Invalidate notes list to refetch
        await queryClient.invalidateQueries(trpc.notes.list.queryFilter());
        setDeleteId(null);
        // Announce success for screen readers
        const announcement = document.getElementById("note-announcements");
        if (announcement) {
          announcement.textContent = "Note deleted successfully";
        }
      },
      onError: (error) => {
        // Announce error for screen readers
        const announcement = document.getElementById("note-announcements");
        if (announcement) {
          announcement.textContent = `Error: ${error.message}`;
        }
      },
    }),
  );

  const handleDelete = () => {
    if (deleteId) {
      deleteNote.mutate({ id: deleteId });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <NoteCardSkeleton />
        <NoteCardSkeleton />
        <NoteCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive" role="alert">
            Error loading notes: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No notes yet. Create your first note above!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4" role="list" aria-label="Your notes">
        {notes.map((note) => (
          <Card key={note.id} role="listitem">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{note.title}</CardTitle>
                  <CardDescription>
                    {new Date(note.createdAt).toLocaleDateString()} at{" "}
                    {new Date(note.createdAt).toLocaleTimeString()}
                    {isAdmin && note.user && (
                      <>
                        {" - "}
                        <span className="font-medium">
                          Created by: {note.user.name} ({note.user.email})
                        </span>
                      </>
                    )}
                  </CardDescription>
                </div>
                {note.status && (
                  <Badge variant={note.status === "active" ? "default" : "secondary"}>
                    {note.status}
                  </Badge>
                )}
              </div>
            </CardHeader>
            {note.content && (
              <CardContent>
                <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {note.content}
                </p>
              </CardContent>
            )}
            <CardFooter className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push(`/notes/${note.id}`)}
                aria-label={`View note: ${note.title}`}
              >
                View
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteId(note.id)}
                aria-label={`Delete note: ${note.title}`}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleteNote.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteNote.isPending}
            >
              {deleteNote.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function NoteCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
