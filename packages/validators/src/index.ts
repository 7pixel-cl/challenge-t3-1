import { z } from "zod/v4";

/**
 * Note status enum - shared between client and server
 */
export const NoteStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type NoteStatus = (typeof NoteStatus)[keyof typeof NoteStatus];

/**
 * Shared validator for note title
 * - Required, min 1 character, max 256 characters
 */
export const NoteTitleSchema = z
  .string()
  .min(1, "Title is required")
  .max(256, "Title must be 256 characters or less");

/**
 * Shared validator for note content
 * - Optional string
 */
export const NoteContentSchema = z.string().optional();

/**
 * Shared validator for note status
 */
export const NoteStatusSchema = z.enum([
  NoteStatus.DRAFT,
  NoteStatus.ACTIVE,
  NoteStatus.ARCHIVED,
]);

/**
 * Client-side note creation input validator
 * Used for form validation on the frontend
 */
export const CreateNoteInputSchema = z.object({
  title: NoteTitleSchema,
  content: NoteContentSchema,
  status: NoteStatusSchema.default(NoteStatus.ACTIVE).optional(),
});

/**
 * Client-side note update input validator
 */
export const UpdateNoteInputSchema = z.object({
  title: NoteTitleSchema.optional(),
  content: NoteContentSchema,
  status: NoteStatusSchema.optional(),
});

export type CreateNoteInput = z.infer<typeof CreateNoteInputSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteInputSchema>;
