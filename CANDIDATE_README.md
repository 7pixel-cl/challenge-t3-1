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
