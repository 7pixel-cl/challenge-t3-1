import { authRouter } from "./router/auth";
import { notesRouter } from "./router/notes";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  notes: notesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
