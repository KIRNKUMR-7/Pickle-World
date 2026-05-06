-- =============================================
-- Pickle World Orders Table
-- Run this in Supabase → SQL Editor → New Query
-- =============================================

create table if not exists public.orders (
  id                  uuid         primary key default gen_random_uuid(),
  created_at          timestamptz  not null default now(),

  -- Payment info
  razorpay_payment_id text         not null,
  razorpay_order_id   text,
  status              text         not null default 'paid',

  -- Customer info
  customer_name       text         not null,
  customer_phone      text         not null,
  customer_address    text         not null,
  customer_pincode    text         not null,

  -- Order details
  items               jsonb        not null,
  total_amount        numeric      not null
);

-- Allow anyone to INSERT (needed for the frontend client key)
alter table public.orders enable row level security;

create policy "Allow inserts from anyone"
  on public.orders for insert
  with check (true);

-- Only allow reads with service role (admin only)
create policy "Allow reads with service key only"
  on public.orders for select
  using (false);
