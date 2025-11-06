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
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";

import { authClient } from "~/auth/client";
import { useTRPC } from "~/trpc/react";

interface NoteDetailClientProps {
  noteId: string;
}

export function NoteDetailClient({ noteId }: NoteDetailClientProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Get current user session to check if admin
  const { data: session } = authClient.useSession();
  const isAdmin = session ? session.user.role === "admin" : false;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "archived">(
    "active",
  );
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch the note
  const {
    data: note,
    isLoading,
    error: fetchError,
  } = useQuery(
    trpc.notes.byId.queryOptions(
      { id: noteId },
      {
        retry: false,
      },
    ),
  );

  // Set form values when note is loaded (using useEffect pattern)
  if (note && !isEditing) {
    if (title === "" && content === "") {
      setTitle(note.title);
      setContent(note.content ?? "");
      setStatus(note.status as "draft" | "active" | "archived");
    }
  }

  // Update mutation
  const updateNote = useMutation(
    trpc.notes.update.mutationOptions({
      onSuccess: async () => {
        setIsEditing(false);
        setError(null);
        await queryClient.invalidateQueries(
          trpc.notes.byId.queryFilter({ id: noteId }),
        );
        await queryClient.invalidateQueries(trpc.notes.list.queryFilter());
        announceToScreenReader("Note updated successfully");
      },
      onError: (error) => {
        setError(error.message);
        announceToScreenReader(`Error: ${error.message}`);
      },
    }),
  );

  // Delete mutation
  const deleteNote = useMutation(
    trpc.notes.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.notes.list.queryFilter());
        announceToScreenReader("Note deleted successfully");
        router.push("/");
      },
      onError: (error) => {
        announceToScreenReader(`Error: ${error.message}`);
        setShowDeleteDialog(false);
      },
    }),
  );

  const announceToScreenReader = (message: string) => {
    const announcement = document.getElementById("note-announcements");
    if (announcement) {
      announcement.textContent = message;
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    updateNote.mutate({
      id: noteId,
      data: {
        title: title.trim(),
        content: content.trim() || undefined,
        status,
      },
    });
  };

  const handleCancelEdit = () => {
    if (note) {
      setTitle(note.title);
      setContent(note.content ?? "");
      setStatus(note.status as "draft" | "active" | "archived");
    }
    setIsEditing(false);
    setError(null);
  };

  const handleDelete = () => {
    deleteNote.mutate({ id: noteId });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <div className="bg-muted h-8 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
              <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fetchError || !note) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-destructive text-center" role="alert">
                {fetchError?.message ??
                  "Note not found or you don't have permission to view it"}
              </p>
              <div className="flex justify-center">
                <Button onClick={() => router.push("/")} variant="outline">
                  Back to Notes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* ARIA live region for announcements */}
      <div
        id="note-announcements"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-4">
          <Button onClick={() => router.push("/")} variant="outline" size="sm">
            ← Back to Notes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-note-title">
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="edit-note-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter note title"
                        required
                        maxLength={256}
                        aria-required="true"
                        aria-invalid={!!error && !title.trim()}
                        aria-describedby={error ? "title-error" : undefined}
                      />
                      {error && !title.trim() && (
                        <p
                          id="title-error"
                          className="text-destructive text-sm"
                          role="alert"
                        >
                          {error}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-2xl">{note.title}</CardTitle>
                    <CardDescription>
                      Created: {new Date(note.createdAt).toLocaleDateString()}{" "}
                      at {new Date(note.createdAt).toLocaleTimeString()}
                      {note.updatedAt && note.updatedAt !== note.createdAt && (
                        <>
                          {" • "}
                          Updated:{" "}
                          {new Date(
                            note.updatedAt,
                          ).toLocaleDateString()} at{" "}
                          {new Date(note.updatedAt).toLocaleTimeString()}
                        </>
                      )}
                      {isAdmin && (
                        <>
                          {" • "}
                          <span className="font-medium">
                            Owner: {note.user.name} ({note.user.email})
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </>
                )}
              </div>
              {!isEditing && note.status && (
                <Badge
                  variant={note.status === "active" ? "default" : "secondary"}
                >
                  {note.status}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-note-content">Content (optional)</Label>
                  <Textarea
                    id="edit-note-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter note content"
                    rows={8}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-note-status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as "draft" | "active" | "archived")
                    }
                  >
                    <SelectTrigger id="edit-note-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && title.trim() && (
                  <p className="text-destructive text-sm" role="alert">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={updateNote.isPending}>
                    {updateNote.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={updateNote.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {note.content ? (
                  <p className="whitespace-pre-wrap">{note.content}</p>
                ) : (
                  <p className="text-muted-foreground italic">No content</p>
                )}
              </div>
            )}
          </CardContent>

          {!isEditing && (
            <CardFooter className="flex gap-2">
              <Button onClick={() => setIsEditing(true)} variant="default">
                Edit
              </Button>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                aria-label={`Delete note: ${note.title}`}
              >
                Delete
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{note.title}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
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
