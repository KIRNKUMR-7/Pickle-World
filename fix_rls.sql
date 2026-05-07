-- Allow deletes for everyone (since the admin dashboard uses the anon key)
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."orders";
CREATE POLICY "Enable delete for all users" ON "public"."orders" FOR DELETE USING (true);

-- Allow updates for everyone (in case we want to update order status later)
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."orders";
CREATE POLICY "Enable update for all users" ON "public"."orders" FOR UPDATE USING (true);

-- Ensure inserts are allowed
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."orders";
CREATE POLICY "Enable insert for all users" ON "public"."orders" FOR INSERT WITH CHECK (true);
