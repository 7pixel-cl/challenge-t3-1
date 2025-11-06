import { scrypt } from "@noble/hashes/scrypt";
import postgres from "postgres";

/**
 * Seed script for creating test users
 *
 * This script creates three test users with pre-hashed passwords:
 * - admin@example.com (role: admin)
 * - member1@example.com (role: member)
 * - member2@example.com (role: member)
 *
 * All passwords are: Test123.
 */

// Hash password using scrypt (same as Better Auth)
function hashPassword(password: string): string {
  const normalizedPassword = password.normalize("NFKC");
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = scrypt(normalizedPassword, salt, {
    N: 16384,
    r: 16,
    p: 1,
    dkLen: 64,
  });

  // Convert to hex and format as salt:key
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const keyHex = Array.from(key)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${saltHex}:${keyHex}`;
}

async function main() {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL environment variable is required");
  }

  // Use direct connection (port 5432) for seeding
  const connectionString = process.env.POSTGRES_URL.replace(":6543", ":5432");

  console.log("🌱 Seeding database...");

  const client = postgres(connectionString);

  try {
    // Hash the password once (same for all test users)
    const hashedPassword = hashPassword("Test123.");

    const testUsers = [
      {
        id: crypto.randomUUID(),
        name: "Admin User",
        email: "admin@example.com",
        emailVerified: true,
        role: "admin",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: "Member One",
        email: "member1@example.com",
        emailVerified: true,
        role: "member",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: "Member Two",
        email: "member2@example.com",
        emailVerified: true,
        role: "member",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log("Creating test users...");

    for (const user of testUsers) {
      // Check if user already exists
      const existing =
        await client`SELECT id FROM "user" WHERE email = ${user.email}`;

      if (existing.length > 0) {
        console.log(`  ⏭️  User ${user.email} already exists, skipping`);
        continue;
      }

      // Insert user
      await client`
        INSERT INTO "user" (id, name, email, email_verified, role, created_at, updated_at)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${user.emailVerified}, ${user.role}, ${user.createdAt}, ${user.updatedAt})
      `;

      // Insert password in account table (Better Auth stores passwords here)
      await client`
        INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
        VALUES (${crypto.randomUUID()}, ${user.email}, 'credential', ${user.id}, ${user.password}, ${user.createdAt}, ${user.updatedAt})
      `;

      console.log(`  ✅ Created user: ${user.email} (${user.role})`);
    }

    // Fetch actual user IDs from database
    const users = await client`
      SELECT id, email FROM "user"
      WHERE email IN ('admin@example.com', 'member1@example.com', 'member2@example.com')
      ORDER BY email
    `;

    if (users.length !== 3) {
      console.error("⚠️  Warning: Not all test users found in database. Skipping note seeding.");
      console.log("\n🎉 Seeding complete!");
      console.log("\nTest credentials:");
      console.log("  Admin:    admin@example.com / Test123.");
      console.log("  Member 1: member1@example.com / Test123.");
      console.log("  Member 2: member2@example.com / Test123.");
      return;
    }

    const adminUser = users.find(u => u.email === 'admin@example.com');
    const member1User = users.find(u => u.email === 'member1@example.com');
    const member2User = users.find(u => u.email === 'member2@example.com');

    // Seed notes for each user
    console.log("\nCreating test notes...");

    const testNotes = [
      // Admin notes
      {
        id: crypto.randomUUID(),
        title: "Admin: Project Planning",
        content: "Planning document for Q1 2025 initiatives. Focus on scalability and performance improvements.",
        status: "active",
        userId: adminUser!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: "Admin: Team Meeting Notes",
        content: "Weekly sync notes - discussed roadmap priorities and resource allocation.",
        status: "draft",
        userId: adminUser!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Member 1 notes
      {
        id: crypto.randomUUID(),
        title: "Feature Implementation Ideas",
        content: "Brainstorming session for new notification system. Consider push notifications and email digests.",
        status: "active",
        userId: member1User!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: "Bug Fixes TODO",
        content: "List of bugs to fix: navbar alignment, form validation, API timeout handling.",
        status: "active",
        userId: member1User!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Member 2 notes
      {
        id: crypto.randomUUID(),
        title: "Learning Resources",
        content: "Collection of helpful tutorials and documentation links for TypeScript and React patterns.",
        status: "active",
        userId: member2User!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: "Code Review Feedback",
        content: "Notes from last PR review - focus on error handling and edge cases.",
        status: "archived",
        userId: member2User!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const note of testNotes) {
      // Check if note already exists (by title and userId)
      const existing = await client`
        SELECT id FROM "note"
        WHERE title = ${note.title} AND user_id = ${note.userId} AND deleted_at IS NULL
      `;

      if (existing.length > 0) {
        console.log(`  ⏭️  Note "${note.title}" already exists, skipping`);
        continue;
      }

      await client`
        INSERT INTO "note" (id, title, content, status, user_id, created_at, updated_at)
        VALUES (${note.id}, ${note.title}, ${note.content}, ${note.status}, ${note.userId}, ${note.createdAt}, ${note.updatedAt})
      `;

      const userName = users.find(u => u.id === note.userId)?.email.split('@')[0];
      console.log(`  ✅ Created note: "${note.title}" (${userName})`);
    }

    console.log("\n🎉 Seeding complete!");
    console.log("\nTest credentials:");
    console.log("  Admin:    admin@example.com / Test123.");
    console.log("  Member 1: member1@example.com / Test123.");
    console.log("  Member 2: member2@example.com / Test123.");
    console.log("\nTest notes:");
    console.log("  - 2 notes per user (6 total)");
    console.log("  - Various statuses: active, draft, archived");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
