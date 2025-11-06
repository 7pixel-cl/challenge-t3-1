import { z } from "zod/v4";

// Re-export note schemas from @acme/db for client/server sharing
export {
  CreateNoteSchema,
  UpdateNoteSchema,
  NoteStatus,
  type NoteStatus as NoteStatusType,
} from "@acme/db/schema";

// ID validation schema for note operations
export const NoteIdSchema = z.object({
  id: z.string().uuid("Invalid note ID"),
});

export const unused = z.string().describe(
  `This lib is currently not used as we use drizzle-zod for simple schemas
   But as your application grows and you need other validators to share
   with back and frontend, you can put them in here
  `,
);
