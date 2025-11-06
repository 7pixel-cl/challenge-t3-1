"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
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
import { CreateNoteInputSchema } from "@acme/validators";

import { useTRPC } from "~/trpc/react";

export function CreateNoteForm() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "archived">(
    "active",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createNote = useMutation(
    trpc.notes.create.mutationOptions({
      onSuccess: async () => {
        setTitle("");
        setContent("");
        setStatus("active");
        setErrors({});
        // Invalidate notes list to refetch
        await queryClient.invalidateQueries(trpc.notes.list.queryFilter());
        // Announce success for screen readers
        const announcement = document.getElementById("note-announcements");
        if (announcement) {
          announcement.textContent = "Note created successfully";
        }
      },
      onError: (error) => {
        setErrors({ general: error.message });
        // Announce error for screen readers
        const announcement = document.getElementById("note-announcements");
        if (announcement) {
          announcement.textContent = `Error: ${error.message}`;
        }
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side Zod validation
    const result = CreateNoteInputSchema.safeParse({
      title: title.trim(),
      content: content.trim() || undefined,
      status,
    });

    if (!result.success) {
      // Extract Zod errors into a more usable format
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);

      // Announce validation error for screen readers
      const announcement = document.getElementById("note-announcements");
      if (announcement) {
        announcement.textContent = `Validation error: ${Object.values(fieldErrors).join(", ")}`;
      }
      return;
    }

    createNote.mutate(result.data);
  };

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

      <Card>
        <CardHeader>
          <CardTitle>Create New Note</CardTitle>
          <CardDescription>Add a new note to your collection</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="note-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title"
                required
                maxLength={256}
                aria-required="true"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
              />
              {errors.title && (
                <p
                  id="title-error"
                  className="text-destructive text-sm"
                  role="alert"
                >
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-content">Content (optional)</Label>
              <Textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter note content"
                rows={4}
                className="resize-none"
                aria-invalid={!!errors.content}
                aria-describedby={errors.content ? "content-error" : undefined}
              />
              {errors.content && (
                <p
                  id="content-error"
                  className="text-destructive text-sm"
                  role="alert"
                >
                  {errors.content}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as "draft" | "active" | "archived")
                }
              >
                <SelectTrigger id="note-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-destructive text-sm" role="alert">
                  {errors.status}
                </p>
              )}
            </div>

            {errors.general && (
              <p className="text-destructive text-sm" role="alert">
                {errors.general}
              </p>
            )}

            <Button
              type="submit"
              disabled={createNote.isPending}
              className="w-full"
            >
              {createNote.isPending ? "Creating..." : "Create Note"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
