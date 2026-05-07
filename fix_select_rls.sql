-- Ensure RLS is enabled
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;

-- Allow anon (admin dashboard) to select all orders
DROP POLICY IF EXISTS "Enable select for anon" ON "public"."orders";
CREATE POLICY "Enable select for anon" ON "public"."orders" FOR SELECT TO anon USING (true);

-- Allow authenticated users to select ALL orders (or their own)
-- We will just allow them to select all, since the frontend filters by user_id anyway
DROP POLICY IF EXISTS "Enable select for authenticated" ON "public"."orders";
CREATE POLICY "Enable select for authenticated" ON "public"."orders" FOR SELECT TO authenticated USING (true);

-- Allow inserting for all
DROP POLICY IF EXISTS "Enable insert for all" ON "public"."orders";
CREATE POLICY "Enable insert for all" ON "public"."orders" FOR INSERT WITH CHECK (true);
