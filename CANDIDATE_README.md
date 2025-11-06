# Candidate Submission — Personal Notes Challenge

## Overview

I built a personal notes application with role-based access control using the T3 stack. The app lets users create and manage their own notes, while admins have full visibility and control over all notes in the system. The focus was on server-side security, proper validation, and making sure everything is accessible.

---

## ✅ Features Completed

| Feature                                  | Status | Notes                                             |
| ---------------------------------------- | ------ | ------------------------------------------------- |
| Supabase setup                           | ✅     | Connected via @vercel/postgres pooled connection  |
| Drizzle schema + migrations              | ✅     | Notes table with soft deletes, Better Auth tables |
| better-auth login                        | ✅     | Email/password with scrypt hashing                |
| Admin + member roles                     | ✅     | Server-controlled role assignment                 |
| Create notes                             | ✅     | Title required, content optional                  |
| List (member = own only)                 | ✅     | Filtered by userId in tRPC context                |
| List (admin = all)                       | ✅     | No filter applied for admin role                  |
| Delete note with RBAC                    | ✅     | Server-side checks, soft delete pattern           |
| Zod validation                           | ✅     | Client + server with shared schemas               |
| Accessibility (labels, aria-live, focus) | ✅     | ARIA attributes, live regions, keyboard nav       |

**Status key**: ✅ Complete | ⚠️ Partial | ❌ Not attempted

---

## 🧠 Design Decisions

### Architecture

I went with the T3 Turborepo setup because it enforces clean separation between packages. The key was making sure `@acme/api` only runs server-side (in the Next.js app), while shared stuff like Zod schemas lives in `@acme/validators` so both client and server can use them.

The tRPC layer is the backbone here - all API logic goes through it, which means we get end-to-end type safety from database to UI. I stuck with the relational query API from Drizzle (`ctx.db.query.notes.findMany()`) because it's more readable than the SQL-like builder syntax.

### Auth & RBAC

Better Auth handles the authentication side - it's simpler than NextAuth and the setup was straightforward. For RBAC, I added a `role` field to the user schema as an `additionalField` with `input: false`, which prevents users from setting their own roles during signup.

The role enforcement happens in tRPC middleware. I created two custom procedures:

- `memberProcedure` - requires any authenticated user
- `adminProcedure` - requires user.role === "admin"

All the role checks happen server-side in [packages/api/src/trpc.ts:44-68](packages/api/src/trpc.ts#L44-L68). The frontend just consumes these protected endpoints - there's no client-side role logic that could be bypassed.

For the notes.list endpoint, I check the role in the resolver itself rather than middleware because members and admins hit the same endpoint but get different results (own notes vs all notes).

### Data Model

The notes table is pretty minimal:

- `id` (uuid) - unique identifier
- `title` (varchar 256) - required field
- `content` (text) - optional, can be null
- `status` (enum) - active/draft/archived for future filtering
- `userId` (uuid) - foreign key to user table
- `createdAt`, `updatedAt`, `deletedAt` - standard timestamps

I went with soft deletes (`deletedAt` timestamp) instead of hard deletes because it's reversible and lets you implement an "undo" feature later. The queries filter out soft-deleted notes by default with `.where(isNull(notes.deletedAt))`.

The relationship between users and notes is one-to-many with cascade delete, so if a user gets deleted (from the auth system), their notes clean up automatically.

### Accessibility

Focused on the fundamentals:

- Proper `<label>` elements for all form inputs (linked with `htmlFor`)
- ARIA attributes where needed (`aria-required`, `aria-invalid`, `aria-describedby`)
- Live regions for dynamic feedback (`role="status"` with `aria-live="polite"`)
- Keyboard navigation works for all interactive elements
- Descriptive button labels (e.g., "Delete note: {title}" instead of just "Delete")

The error and success messages get announced to screen readers through the live region, so users get feedback without needing to see the UI.

---

## 🧪 If I Had More Time

### Feature Improvements

- **Optimistic updates** - The mutations wait for server confirmation. Could make it feel snappier with optimistic UI updates using TanStack Query's `setQueryData`.
- **Note search** - Client-side filter or server-side full-text search.
- **Pagination** - Currently loads all notes at once, which doesn't scale beyond a few hundred notes.

### Testing

Proper testing is critical for production applications but was omitted due to time constraints. Here's what I would add:

- **Unit tests for tRPC procedures** - Test the RBAC logic with mocked contexts to ensure:
  - Members can only access their own notes
  - Admins can access all notes
  - Unauthorized users get proper `UNAUTHORIZED` errors
  - Role-based mutations (update/delete) enforce ownership correctly

- **Integration tests** - Test the full tRPC router with a test database:
  - Create → Read → Update → Delete flows
  - Error cases (invalid IDs, missing fields, etc.)
  - Soft delete behavior

- **Component tests** - Use Testing Library to test React components:
  - Form validation and error states
  - ARIA attributes and accessibility
  - Keyboard navigation
  - Success/error message announcements

- **E2E tests** - Use Playwright to test critical user flows:
  - Login as member → create note → verify it appears in list
  - Login as admin → verify can see all users' notes
  - Test RBAC: member cannot delete other users' notes

Would use Vitest for unit/integration tests (fast, compatible with T3 stack) and Playwright for E2E tests.

### Production Hardening

Based on Next.js and tRPC best practices, here are production improvements I'd make:

- **Error reporting** - Integrate Sentry or similar service to capture `INTERNAL_SERVER_ERROR` exceptions from the tRPC `onError` handler instead of just console logging.

- **Environment-aware logging** - Replace `console.log` statements in the timing middleware with a proper logger (like Pino or Winston) that respects `LOG_LEVEL` and doesn't pollute production logs.

- **Stricter CORS** - Currently using `Access-Control-Allow-Origin: *` which is fine for dev but should be restricted to specific origins in production (e.g., via `ALLOWED_ORIGINS` env var).

- **Better error messages** - Parse tRPC error codes on the client (`TRPCClientError`) to show user-friendly messages instead of raw error text. For example, "You need to log in" for `UNAUTHORIZED` vs "An error occurred".

- **SSR prefetching** - Add `createServerSideHelpers` from `@trpc/react-query/server` to prefetch data in Server Components for better initial page load performance.

- **Rate limiting** - Add request rate limiting to the tRPC API handler to prevent abuse (e.g., using `@upstash/ratelimit` with Redis).

These are all best practices from the official tRPC and T3 Stack docs, but they go beyond the scope of this take-home assignment.

---

## ⏱ Time Spent

> Approximate time: ~2 hours + some minutes fixing the CI Build erros to a clean deployment

Breakdown:

- Setup & database: ~ 15 mins
- Auth & RBAC: ~ 30 mins
- Notes Backend and TRPC: ~ 30 mins
- Frontend UI: ~ 25 mins
- Accessibility & polish: ~ 15 mins
- Build erros: ~ 20 mins

---

## 🚀 Run Instructions

```bash
# Install dependencies
pnpm install

# Setup database
pnpm --filter @acme/auth generate
pnpm db:push

# Seed test users (optional)
pnpm db:seed

# Start development server
pnpm dev
```

Then open http://localhost:3000

### 🔑 Test User Credentials

The following test users are available in the database:

| Role       | Email                 | Password   | Notes                     |
| ---------- | --------------------- | ---------- | ------------------------- |
| **Admin**  | `admin@example.com`   | `Test123.` | Full access to all notes  |
| **Member** | `member1@example.com` | `Test123.` | Can only access own notes |
| **Member** | `member2@example.com` | `Test123.` | Can only access own notes |

Each user has 2 pre-created notes with different statuses for testing.

**Note**: You can also create new accounts using the "Sign up" option on the login page. New users default to the "member" role.

---

## 📝 Notes & Assumptions

**Assumptions:**

- Soft delete is preferred over hard delete (can be changed easily)
- New users default to "member" role (admin promotion would need a separate admin panel)
- Notes are private by default - no sharing between members
- The status field (active/draft/archived) is set but not used in the UI yet

**Issues encountered:**

- Had to migrate from old tRPC patterns to v11 (new TanStack Query integration) - the docs weren't super clear but figured it out
- Supabase connection string needed `postgres://` not `postgresql://` for @vercel/postgres
- shadcn/ui components needed custom import fixes for the `cn` utility

**Trade-offs:**

- Chose simplicity over features - no edit UI, no pagination, no search. Wanted to nail the core requirements first.
- Skipped file uploads and rich text editing to keep the scope manageable.
- Accessibility is solid but not exhaustive - focused on forms and announcements.

---

## 🎉 Thank You!

This was a fun challenge! The T3 stack is really nice to work with once you get the hang of tRPC and Drizzle. I appreciated the focus on RBAC and accessibility - those are often afterthoughts but they're critical for real apps.

If I were taking this further, I'd add proper testing (especially for the RBAC logic), better error states, and maybe a richer note editor. But for a take-home, I think this shows the key patterns and architectural decisions pretty well.

Thanks for the opportunity! 🚀
