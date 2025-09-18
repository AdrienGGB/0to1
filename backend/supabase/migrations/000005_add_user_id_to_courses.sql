ALTER TABLE "public"."courses"
ADD COLUMN "user_id" "uuid" REFERENCES "auth"."users"("id");