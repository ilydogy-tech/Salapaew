-- salapaew shop schema starter for Supabase PostgreSQL
-- Run in SQL Editor. Review and finish RLS policies before production.
create extension if not exists pgcrypto;

create sequence if not exists public.order_number_seq start 1;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price_thb numeric(12,2) not null check (price_thb >= 0),
  category text not null check (category in ('game','digital')),
  image_url text,
  stock integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  contact text not null,
  note text not null default '',
  total_thb numeric(12,2) not null check (total_thb >= 0),
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_payment','slip_submitted','paid','processing','completed','cancelled')),
  slip_path text,
  tracking_token_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price_thb numeric(12,2) not null check (unit_price_thb >= 0),
  quantity integer not null check (quantity > 0),
  line_total_thb numeric(12,2) generated always as (unit_price_thb * quantity) stored
);

-- Sequential public-facing order numbers: SLP0001, SLP0002, ...
-- Sequence allocation is atomic, but call this only from a trusted Edge Function/RPC
-- that validates products and prices on the server. Never trust browser-sent prices.
create or replace function public.next_order_number()
returns text
language sql
security definer
set search_path = ''
as $$
  select 'SLP' || lpad(nextval('public.order_number_seq')::text, 4, '0');
$$;

-- Private-by-default RLS. Admin policies should be added only after admin flow is ready.
alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public may read active products only; no public write policy.
drop policy if exists "anyone can read active products" on public.products;
create policy "anyone can read active products"
on public.products for select
to anon, authenticated
using (active = true);

-- Admin read policy; apply to products, orders, order_items. Writes should go through
-- Edge Functions or explicit policies that check auth.uid() exists in public.admins.
drop policy if exists "admins can read all orders" on public.orders;
create policy "admins can read all orders"
on public.orders for select to authenticated
using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

drop policy if exists "admins can read order items" on public.order_items;
create policy "admins can read order items"
on public.order_items for select to authenticated
using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

drop policy if exists "admins can read all products" on public.products;
create policy "admins can read all products"
on public.products for select to authenticated
using (active = true or exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

-- Intentionally no anonymous INSERT/UPDATE/DELETE policies on orders/products.
-- Implement order creation and payment-slip upload via a server-side Edge Function.
-- Keep the payment-slips Storage bucket private; do not expose direct public URLs.
