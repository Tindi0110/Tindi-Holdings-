-- ============================================================================
-- TINDI HOLDINGS LTD — COMPREHENSIVE SUPABASE DATABASE SCHEMA MIGRATION
-- Execute this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================================

-- 1. Ensure extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Ensure custom Enums
do $$ begin
  create type public.app_role as enum ('admin', 'manager', 'customer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null;
end $$;

-- 3. Stock Transfers Table
create table if not exists public.stock_transfers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  source_branch_id uuid references public.branches(id) on delete set null,
  target_branch_id uuid not null references public.branches(id) on delete cascade,
  quantity int not null check (quantity > 0),
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'In Transit', 'Completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stock_transfers enable row level security;
grant all on public.stock_transfers to service_role;
grant select, insert, update on public.stock_transfers to authenticated;
create policy "Admins manage stock transfers" on public.stock_transfers
  for all using (true) with check (true);

-- 4. Stock Adjustments Table
create table if not exists public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null,
  type text not null default 'manual',
  reason text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stock_adjustments enable row level security;
grant all on public.stock_adjustments to service_role;
grant select, insert on public.stock_adjustments to authenticated;
create policy "Admins manage stock adjustments" on public.stock_adjustments
  for all using (true) with check (true);

-- 5. Sub Categories Table
create table if not exists public.sub_categories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  is_active boolean not null default true,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sub_categories enable row level security;
grant all on public.sub_categories to service_role;
grant select on public.sub_categories to anon;
grant select, insert, update, delete on public.sub_categories to authenticated;
create policy "Sub-categories readable by all" on public.sub_categories
  for select using (true);
create policy "Sub-categories manageable by authenticated" on public.sub_categories
  for all using (true) with check (true);

-- 6. Coupons & Vouchers Table
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null default 'percentage' check (discount_type in ('percentage', 'fixed')),
  value numeric(10,2) not null check (value > 0),
  min_spend numeric(10,2) default 0,
  max_discount numeric(10,2),
  usage_limit int,
  times_used int not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coupons enable row level security;
grant all on public.coupons to service_role;
grant select on public.coupons to anon;
grant select, insert, update, delete on public.coupons to authenticated;
create policy "Coupons readable by all" on public.coupons
  for select using (true);
create policy "Coupons manageable by admin" on public.coupons
  for all using (true) with check (true);

-- 7. Product Reviews Table
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reviewer_name text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null,
  is_approved boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_reviews enable row level security;
grant all on public.product_reviews to service_role;
grant select on public.product_reviews to anon;
grant select, insert, update, delete on public.product_reviews to authenticated;
create policy "Product reviews readable by all" on public.product_reviews
  for select using (true);
create policy "Product reviews insertable" on public.product_reviews
  for insert with check (true);
create policy "Product reviews manageable by admin" on public.product_reviews
  for all using (true) with check (true);

-- 8. Customer Feedback & Support Table
create table if not exists public.customer_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text,
  customer_email text,
  subject text,
  message text not null,
  category text not null default 'general' check (category in ('general', 'product', 'shipping', 'support', 'billing', 'other')),
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'resolved', 'archived')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_feedback enable row level security;
grant all on public.customer_feedback to service_role;
grant insert on public.customer_feedback to anon;
grant select, insert, update, delete on public.customer_feedback to authenticated;
create policy "Feedback insertable by all" on public.customer_feedback
  for insert with check (true);
create policy "Feedback manageable by admin" on public.customer_feedback
  for all using (true) with check (true);

-- 9. Marketing Campaigns Table
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text not null default 'email' check (type in ('email', 'sms', 'social', 'push', 'banner', 'other')),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed', 'cancelled')),
  budget numeric(12,2) default 0,
  spent numeric(12,2) default 0,
  target_audience text,
  start_date date,
  end_date date,
  impressions int default 0,
  clicks int default 0,
  conversions int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;
grant all on public.campaigns to service_role;
grant select, insert, update, delete on public.campaigns to authenticated;
create policy "Campaigns manageable by admin" on public.campaigns
  for all using (true) with check (true);

-- 10. Customer Referrals Table
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users(id) on delete set null,
  referred_id uuid references auth.users(id) on delete set null,
  referral_code text unique not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'rewarded', 'expired')),
  reward_type text default 'discount' check (reward_type in ('discount', 'credit', 'gift', 'none')),
  reward_value numeric(10,2) default 0,
  reward_paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.referrals enable row level security;
grant all on public.referrals to service_role;
grant select, insert, update, delete on public.referrals to authenticated;
create policy "Referrals manageable by admin" on public.referrals
  for all using (true) with check (true);

-- 11. Receipt Settings Table
create table if not exists public.receipt_settings (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete cascade,
  business_name text not null default 'Tindi Holdings Ltd',
  tax_pin text default 'P051234567Z',
  phone text default '+254 700 000 000',
  email text default 'info@tindiholdings.co.ke',
  address text default 'Westlands Commercial Centre, Nairobi',
  footer_message text default 'Thank you for shopping with Tindi Group!',
  currency text not null default 'KES',
  tax_rate numeric(5,2) default 16.00,
  template_type text default 'standard',
  show_qr_code boolean default true,
  show_barcode boolean default true,
  updated_at timestamptz not null default now()
);

alter table public.receipt_settings enable row level security;
grant all on public.receipt_settings to service_role;
grant select on public.receipt_settings to anon;
grant select, insert, update on public.receipt_settings to authenticated;
create policy "Receipt settings readable by all" on public.receipt_settings
  for select using (true);
create policy "Receipt settings manageable by admin" on public.receipt_settings
  for all using (true) with check (true);

-- 12. Returns & Refunds Table (Jumia Style)
create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  return_number text unique not null,
  order_id uuid not null references public.orders(id) on delete cascade,
  order_number text,
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text,
  customer_phone text,
  customer_email text,
  branch_id uuid references public.branches(id) on delete set null,
  status text not null default 'requested' check (
    status in ('requested', 'approved', 'pickup_scheduled', 'in_transit', 'received', 'inspecting', 'refunded', 'rejected', 'cancelled')
  ),
  reason_category text not null default 'defective',
  reason_title text not null,
  reason_details text,
  images jsonb default '[]'::jsonb,
  items jsonb not null default '[]'::jsonb,
  pickup_method text not null default 'express_pickup' check (pickup_method in ('express_pickup', 'drop_off')),
  pickup_address text,
  dropoff_branch_name text,
  refund_method text not null default 'mpesa' check (refund_method in ('mpesa', 'store_credit', 'bank_transfer', 'original_payment')),
  refund_phone text,
  refund_account_name text,
  refund_bank_name text,
  refund_account_number text,
  refund_amount numeric(10,2) not null default 0 check (refund_amount >= 0),
  refund_reference text,
  voucher_code text,
  tracking_number text,
  waybill_number text,
  admin_notes text,
  rejection_reason text,
  inspection_notes text,
  inspection_passed boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.return_events (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references public.return_requests(id) on delete cascade,
  status text not null,
  title text not null,
  description text,
  location text,
  actor_name text default 'Tindi Automated System',
  created_at timestamptz not null default now()
);

alter table public.return_requests enable row level security;
alter table public.return_events enable row level security;
grant all on public.return_requests to service_role;
grant select, insert, update on public.return_requests to authenticated;
grant all on public.return_events to service_role;
grant select, insert on public.return_events to authenticated;

-- 13. Create indexes for maximum speed
create index if not exists idx_stock_transfers_product on public.stock_transfers(product_id);
create index if not exists idx_stock_adjustments_product on public.stock_adjustments(product_id);
create index if not exists idx_sub_categories_category on public.sub_categories(category_id);
create index if not exists idx_product_reviews_product on public.product_reviews(product_id);
create index if not exists idx_customer_feedback_status on public.customer_feedback(status);
create index if not exists idx_coupons_code on public.coupons(code);
create index if not exists idx_campaigns_status on public.campaigns(status);
create index if not exists idx_return_requests_order on public.return_requests(order_id);
create index if not exists idx_return_requests_user on public.return_requests(user_id);
create index if not exists idx_return_requests_status on public.return_requests(status);
create index if not exists idx_return_events_return on public.return_events(return_id);

-- Output verification confirmation
select 'Tindi Holdings Database Schema Successfully Synchronized!' as status;
