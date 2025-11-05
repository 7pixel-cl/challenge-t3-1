# ✅ Take-Home Challenge — T3 Stack (1–2 Hour Timebox)

Welcome! This is a short take-home designed to evaluate your ability to work in a modern, full-stack TypeScript environment using the **T3 stack**.

Please **timebox** yourself to **1–2 hours max**.

We are _not_ expecting a full production system — clarity, correctness, and thoughtful choices matter more than UI polish.

---

## 🎯 Challenge Goal

Build a small "**Personal Notes**" feature with:

- Auth via **better-auth**
- Database via **Drizzle + Supabase Postgres**
- Server-side **RBAC** (role-based access control)
- **Next.js App Router**, tRPC, Zod
- Basic **Accessibility**

---

## 🧾 User Requirements

Two roles:

| Role       | Permissions                                                   |
| ---------- | ------------------------------------------------------------- |
| **member** | create notes, list **only their own** notes, delete their own |
| **admin**  | list **all** notes, delete any note                           |

### Features

| Feature          | Requirement                                               |
| ---------------- | --------------------------------------------------------- |
| Create note      | `title` required, `content` optional                      |
| List notes       | member sees **their notes**, admin sees **all**           |
| Delete note      | enforce via server RBAC                                   |
| Input validation | **Zod** on client + server                                |
| Accessibility    | labels, focus, keyboard operability, `aria-live` messages |

> ✅ **RBAC must be enforced server-side** through tRPC context/middleware — not only in the UI.

---

## 🧠 Evaluation Criteria

| Category                 | Focus                                      |
| ------------------------ | ------------------------------------------ |
| tRPC API design          | clear procedures & error handling          |
| RBAC                     | secure server-side checks                  |
| Drizzle schema & queries | correct models, migrations                 |
| Supabase usage           | correct connection via `POSTGRES_URL`      |
| Validation               | Zod shared types where appropriate         |
| Accessibility            | focus, labels, announcements, keyboard nav |
| Code quality             | reasoning, clarity, structure, naming      |
| Developer experience     | setup notes, clear README                  |

---

## 🚀 Getting Started

### System Requirements

> [!NOTE]
> Make sure to follow the system requirements specified in [`package.json#engines`](./package.json#L4) before proceeding.

You will need:

- **Node.js** (see package.json for version)
- **pnpm** package manager

### About This Stack

This starter uses [Turborepo](https://turborepo.com) and contains:

```text
apps
  └─ nextjs
      ├─ Next.js 15
      ├─ React 19
      ├─ Tailwind CSS v4
      └─ E2E Typesafe API Server & Client
packages
  ├─ api
  │   └─ tRPC v11 router definition
  ├─ auth
  │   └─ Authentication using better-auth
  ├─ db
  │   └─ Typesafe db calls using Drizzle & Supabase
  ├─ ui
  │   └─ UI components using shadcn-ui
  └─ validators
      └─ Shared Zod validation schemas
tooling
  ├─ eslint
  │   └─ shared, fine-grained, eslint presets
  ├─ prettier
  │   └─ shared prettier configuration
  ├─ tailwind
  │   └─ shared tailwind theme and configuration
  └─ typescript
      └─ shared tsconfig you can extend from
```

---

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
# Install dependencies
pnpm install

# Configure environment variables
# There is an `.env.example` in the root directory you can use for reference
cp .env.example .env
```

### 2. Configure Supabase Database

You **must** use Supabase **Free Tier**. Do **not** pay for anything.

#### Steps:

1. Sign up free: [https://supabase.com](https://supabase.com)
2. Create new project (**free tier**)
3. Go to: **Project → Settings → Database → Connection String → URI**
4. Copy the Postgres URI and add it to your `.env`:

```env
POSTGRES_URL="postgresql://YOUR_SUPABASE_CONNECTION_STRING"
```

> **Note**: The [db](./packages/db) package is preconfigured to use Supabase and is **edge-bound**. The setup should work out of the box once you provide the `POSTGRES_URL`.

### 3. Generate Better Auth Schema

This project uses [Better Auth](https://www.better-auth.com) for authentication. The auth schema needs to be generated using the Better Auth CLI before you can use the authentication features.

```bash
# Generate the Better Auth schema
pnpm --filter @acme/auth generate
```

This command runs the Better Auth CLI with the following configuration:

- **Config file**: `packages/auth/script/auth-cli.ts` - A CLI-only configuration file (isolated from src to prevent imports)
- **Output**: `packages/db/src/auth-schema.ts` - Generated Drizzle schema for authentication tables

The generation process:

1. Reads the Better Auth configuration from `packages/auth/script/auth-cli.ts`
2. Generates the appropriate database schema based on your auth setup
3. Outputs a Drizzle-compatible schema file to the `@acme/db` package

> **Note**: The `auth-cli.ts` file is placed in the `script/` directory (instead of `src/`) to prevent accidental imports from other parts of the codebase. This file is exclusively for CLI schema generation and should **not** be used directly in your application. For runtime authentication, use the configuration from `packages/auth/src/index.ts`.

For more information about the Better Auth CLI, see the [official documentation](https://www.better-auth.com/docs/concepts/cli#generate).

### 4. Push Database Schema

```bash
# Push the Drizzle schema to the database
pnpm db:push
```

### 5. Run the Development Server

```bash
pnpm dev
```

The Next.js app should now be running at `http://localhost:3000`.

> **If setup takes >10 minutes**, stub pieces and document assumptions — we value design thinking over battling config.

---

## 🗄️ Database — Drizzle + Supabase

### Suggested Schema for Notes

You'll need to create a `notes` table in your Drizzle schema:

```ts
notes
  id         uuid (pk)
  createdAt  timestamp
  ... continue designing schema you think is best
```

### Drizzle Configuration

The project is already configured for Drizzle with Supabase. See:

- Schema: `packages/db/src/schema.ts`
- Client: `packages/db/src/client.ts`
- Config: `packages/db/drizzle.config.ts`

To generate migrations after schema changes:

```bash
pnpm db:generate
pnpm db:push
```

---

## 👤 Auth — better-auth + RBAC

Use **better-auth** to sign in. You'll need to add a **role** field for users (`member`, `admin`).

### Required Test Users

| User   | Role   |
| ------ | ------ |
| Admin  | admin  |
| Member | member |

### Implementation Notes

- Better Auth configuration: `packages/auth/src/index.ts`
- Server-side auth: `apps/nextjs/src/auth/server.ts`
- Client-side auth: `apps/nextjs/src/auth/client.ts`

> ✅ **Remember**: RBAC must be enforced server-side through tRPC context/middleware — not only in the UI.

---

## 📄 Accessibility Requirements

We don't need perfect WCAG compliance — just demonstrate awareness.

---

## 🎨 UI Components

This repo includes a UI package with shadcn/ui components. To add new components:

```bash
pnpm ui-add
```

This runs the interactive `shadcn/ui` CLI to install components.

---

## 📚 Helpful Documentation

| Topic              | Link                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| T3 Stack           | [https://create.t3.gg](https://create.t3.gg)                                           |
| create-t3-turbo    | [https://github.com/t3-oss/create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) |
| tRPC               | [https://trpc.io/docs](https://trpc.io/docs)                                           |
| Drizzle ORM        | [https://orm.drizzle.team/docs/overview](https://orm.drizzle.team/docs/overview)       |
| Supabase           | [https://supabase.com/docs](https://supabase.com/docs)                                 |
| better-auth        | [https://www.better-auth.com](https://www.better-auth.com)                             |
| Next.js App Router | [https://nextjs.org/docs/app](https://nextjs.org/docs/app)                             |
| Zod                | [https://zod.dev](https://zod.dev)                                                     |
| shadcn/ui          | [https://ui.shadcn.com](https://ui.shadcn.com)                                         |

---

## 🏗️ Working with the Monorepo

### Package Names

In this template, we use `@acme` as a placeholder for package names. You can keep it as-is for the challenge.

### Adding New Packages

To add a new package:

```bash
pnpm turbo gen init
```

This will prompt you for a package name and set up all necessary configurations.

### Code Sharing

The `api` package should only be a production dependency in the Next.js application. This gives you full typesafety while keeping backend code secure.

If you need to share runtime code between client and server (like Zod schemas), use the `validators` package.

---

## 📦 Submission Requirements

Please submit:

- ✅ GitHub repo OR zip file
- ✅ Your completed **Candidate README** (template below)
- ✅ Estimated time spent (~1–2 hours)
- ✅ Any notes, trade-offs, or assumptions

---

# 📄 Candidate README Template

**Copy the section below into a new file called `CANDIDATE_README.md` and fill it out:**

````markdown
# Candidate Submission — Personal Notes Challenge

## Overview

> Brief description of what you built and your approach

---

## ✅ Features Completed

| Feature                                  | Status | Notes |
| ---------------------------------------- | ------ | ----- |
| Supabase setup                           |        |       |
| Drizzle schema + migrations              |        |       |
| better-auth login                        |        |       |
| Admin + member roles                     |        |       |
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

### Auth & RBAC

> How and where you handle role checks

### Data Model

> Schema rationale

### Accessibility

> Key a11y considerations

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
pnpm db:push

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
