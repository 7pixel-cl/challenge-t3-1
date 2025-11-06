-- Custom SQL migration file, put your code below! --
-- Add note table for Personal Notes feature
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'note'
  ) THEN
    CREATE TABLE "note" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "title" varchar(256) NOT NULL,
      "content" text,
      "status" varchar(20) DEFAULT 'active' NOT NULL,
      "user_id" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp,
      "deleted_at" timestamp,
      CONSTRAINT "note_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action
    );
  END IF;
END $$;
