# Candidate Submission — Personal Notes Challenge

## Overview

> Brief description of what you built and your approach

Starting time: [Your start time here]

### Initial Setup Complete
1. Database schema migration setup with Drizzle
2. Better Auth configuration with email/password authentication
3. Role-based access control (RBAC) implementation with `member` and `admin` roles

---

## ✅ Features Completed

| Feature                                  | Status | Notes |
| ---------------------------------------- | ------ | ----- |
| Supabase setup                           | ✅     | Connected via @vercel/postgres pooled connection |
| Drizzle schema + migrations              | ✅     | Using drizzle-kit migrations (not db:push) |
| better-auth login                        | ✅     | Email/password authentication configured |
| Admin + member roles                     | ✅     | Role field added to user schema with migration |
| Create notes                             |        |       |
| List (member = own only)                 |        |       |
| List (admin = all)                       |        |       |
| Delete note with RBAC                    |        |       |
| Zod validation                           |        |       |
| Accessibility (labels, aria-live, focus) |        |       |

**Status key**: ✅ Complete | ⚠️ Partial | ❌ Not attempted

---

## 🧠 Design Decisions

### Architecture

> Why this structure? Key choices

Using T3 Turborepo setup with strict package boundaries. Key choices:
- **Migration-based schema changes**: Using `drizzle-kit generate` and `drizzle-kit migrate` instead of `db:push` for proper version control and rollback capability
- **Custom incremental migrations**: Created conditional migration to add `role` column safely (checks if exists before adding)
- **Server-side only API**: `@acme/api` package only imported in Next.js server components
- **Shared validators**: Zod schemas in `@acme/validators` for client/server type safety

### Auth & RBAC

> How and where you handle role checks

**Authentication**: Better Auth with email/password provider
- `emailAndPassword.enabled: true` with 8-128 character passwords
- `requireEmailVerification: false` for easier testing/seeding
- `autoSignIn: true` for better UX

**RBAC Implementation**:
- `role` field added to user schema via migration `0000_add_role_to_user.sql`
- Configured as `additionalFields` in Better Auth with `input: false` to prevent user tampering
- Default role: `member`
- UserRole constant exported from `@acme/auth`: `MEMBER` | `ADMIN`
- Server-side enforcement will be in tRPC middleware (next phase)

### Data Model

> Schema rationale

**Auth Schema** ([packages/db/src/auth-schema.ts](packages/db/src/auth-schema.ts)):
- Better Auth tables: `user`, `session`, `account`, `verification`
- Added `role` field to `user` table with default `'member'`
- Snake case column naming via `casing: "snake_case"` in drizzle.config.ts

**Migration Strategy**:
- Migrations stored in `packages/db/drizzle/` (version controlled)
- Using conditional SQL to handle existing tables: `IF NOT EXISTS` checks
- Direct connection string (port 5432) for migrations vs pooled (port 6543) for runtime

### Accessibility

> Key a11y considerations

**Auth Form** ([apps/nextjs/src/app/_components/auth-showcase-client.tsx](apps/nextjs/src/app/_components/auth-showcase-client.tsx)):
- Proper `<Label htmlFor>` associations for all inputs
- `role="alert"` for error messages
- Required fields marked with `required` attribute
- Password minimum length enforced (8 chars)
- Loading states with disabled buttons to prevent double submission
- Test user credentials displayed for easy access

---

## 🧪 If I Had More Time

> 3–6 bullets of improvements or features you would add

---

## ⏱ Time Spent

> Approximate time: ~X hours

---

## 🚀 Run Instructions

```bash
# Install dependencies
pnpm install

# Setup database
pnpm --filter @acme/auth generate
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Apply migrations to database
pnpm db:seed      # Seed test users (optional)

# Start development server
pnpm dev
```
````

---

## 📝 Notes & Assumptions

> Any context, issues encountered, assumptions made, or feedback

---

## 🎉 Thank You!

> Optional: Any final thoughts or comments

```

---

## 🎉 Final Notes

This exercise is intentionally small. We're looking for **judgment, clarity, and familiarity with this stack**, not perfection.

Focus on:
- ✅ Clear tRPC API design
- ✅ Secure server-side RBAC
- ✅ Working with Drizzle + Supabase
- ✅ Basic accessibility
- ✅ Clean, readable code

Good luck! 🚀

---

## References

The stack originates from [create-t3-app](https://github.com/t3-oss/create-t3-app).

For more context on the T3 Turbo setup, see this [blog post](https://jumr.dev/blog/t3-turbo).
```
