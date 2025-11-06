import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, eq, isNull } from "@acme/db";
import { CreateNoteSchema, Note, UpdateNoteSchema } from "@acme/db/schema";

import { adminProcedure, memberProcedure, protectedProcedure } from "../trpc";

export const notesRouter = {
  /**
   * Create a new note
   * - Available to members and admins
   * - Automatically associates note with current user
   */
  create: memberProcedure
    .input(CreateNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [note] = await ctx.db
        .insert(Note)
        .values({
          ...input,
          userId,
        })
        .returning();

      return note;
    }),

  /**
   * List notes with RBAC enforcement
   * - Members: see only their own notes (not deleted)
   * - Admins: see ALL notes (not deleted)
   */
  list: protectedProcedure
    .input(
      z
        .object({
          includeDeleted: z.boolean().optional().default(false),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const userRole = user.role;
      const includeDeleted = input?.includeDeleted ?? false;

      // Build base query conditions
      const conditions = [];

      // Soft delete filter (unless includeDeleted is true)
      if (!includeDeleted) {
        conditions.push(isNull(Note.deletedAt));
      }

      // RBAC: members only see their own notes, admins see all
      if (userRole !== "admin") {
        conditions.push(eq(Note.userId, user.id));
      }

      const notes = await ctx.db.query.Note.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: (notes, { desc }) => [desc(notes.createdAt)],
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return notes;
    }),

  /**
   * Get a single note by ID
   * - Members: can only view their own notes
   * - Admins: can view any note
   */
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const userRole = user.role;

      const note = await ctx.db.query.Note.findFirst({
        where: and(eq(Note.id, input.id), isNull(Note.deletedAt)),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      if (!note) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Note not found",
        });
      }

      // RBAC: members can only view their own notes
      if (userRole !== "admin" && note.userId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this note",
        });
      }

      return note;
    }),

  /**
   * Update a note
   * - Members: can only update their own notes
   * - Admins: can update any note
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: UpdateNoteSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const userRole = user.role;

      // First, check if the note exists and isn't deleted
      const existingNote = await ctx.db.query.Note.findFirst({
        where: and(eq(Note.id, input.id), isNull(Note.deletedAt)),
      });

      if (!existingNote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Note not found",
        });
      }

      // RBAC: members can only update their own notes
      if (userRole !== "admin" && existingNote.userId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this note",
        });
      }

      const [updatedNote] = await ctx.db
        .update(Note)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(Note.id, input.id))
        .returning();

      return updatedNote;
    }),

  /**
   * Soft delete a note
   * - Members: can only delete their own notes
   * - Admins: can delete ANY note
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const userRole = user.role;

      // First, check if the note exists and isn't already deleted
      const existingNote = await ctx.db.query.Note.findFirst({
        where: and(eq(Note.id, input.id), isNull(Note.deletedAt)),
      });

      if (!existingNote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Note not found",
        });
      }

      // RBAC: members can only delete their own notes, admins can delete any
      if (userRole !== "admin" && existingNote.userId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this note",
        });
      }

      // Soft delete: set deletedAt timestamp
      const [deletedNote] = await ctx.db
        .update(Note)
        .set({ deletedAt: new Date() })
        .where(eq(Note.id, input.id))
        .returning();

      return deletedNote;
    }),

  /**
   * Permanently delete a note (admin only)
   * - Hard delete from database
   */
  permanentDelete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const deletedNote = await ctx.db
        .delete(Note)
        .where(eq(Note.id, input.id))
        .returning();

      if (!deletedNote.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Note not found",
        });
      }

      return deletedNote[0];
    }),

  /**
   * Restore a soft-deleted note (admin only)
   */
  restore: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [restoredNote] = await ctx.db
        .update(Note)
        .set({ deletedAt: null })
        .where(eq(Note.id, input.id))
        .returning();

      if (!restoredNote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Note not found",
        });
      }

      return restoredNote;
    }),
} satisfies TRPCRouterRecord;
