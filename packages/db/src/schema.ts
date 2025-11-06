import { relations, sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { user } from "./auth-schema";

export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Note status enum
 */
export const NoteStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type NoteStatus = (typeof NoteStatus)[keyof typeof NoteStatus];

/**
 * Notes table for the Personal Notes feature
 * Implements RBAC with userId foreign key to user table
 * Supports soft deletion via deletedAt field
 */
export const Note = pgTable("note", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text(),
  status: t.varchar({ length: 20 }).notNull().default(NoteStatus.ACTIVE),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: t.timestamp({ mode: "date" }).defaultNow().notNull(),
  updatedAt: t.timestamp({ mode: "date" }),
  deletedAt: t.timestamp({ mode: "date" }),
}));

/**
 * Zod schema for creating a new note
 * - title is required (max 256 chars)
 * - content is optional
 * - status defaults to "active"
 */
export const CreateNoteSchema = createInsertSchema(Note, {
  title: z.string().min(1, "Title is required").max(256),
  content: z.string().optional(),
  status: z
    .enum([NoteStatus.DRAFT, NoteStatus.ACTIVE, NoteStatus.ARCHIVED])
    .default(NoteStatus.ACTIVE)
    .optional(),
}).omit({
  id: true,
  userId: true, // userId is set server-side from session
  createdAt: true,
  updatedAt: true,
  deletedAt: true, // deletedAt is managed by soft delete logic
});

/**
 * Zod schema for updating a note
 */
export const UpdateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(256).optional(),
  content: z.string().optional(),
  status: z
    .enum([NoteStatus.DRAFT, NoteStatus.ACTIVE, NoteStatus.ARCHIVED])
    .optional(),
});

/**
 * Relations for the Note table
 */
export const noteRelations = relations(Note, ({ one }) => ({
  user: one(user, {
    fields: [Note.userId],
    references: [user.id],
  }),
}));

export * from "./auth-schema";
