-- Migration: Reviews, Feedback, Campaigns, Referrals, Sub-categories
-- Created: 2026-08-17

-- ─── Product Reviews ──────────────────────────────────────────────────────────
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reviewer_name text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  is_approved boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.product_reviews to anon;
grant select, insert on public.product_reviews to authenticated;
grant all on public.product_reviews to service_role;
alter table public.product_reviews enable row level security;
create policy "Reviews readable by all" on public.product_reviews for select using (true);
create policy "Reviews insertable by auth" on public.product_reviews for insert with check (auth.uid() = user_id);

-- ─── Customer Feedback ────────────────────────────────────────────────────────
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

grant select, insert on public.customer_feedback to authenticated;
grant insert on public.customer_feedback to anon;
grant all on public.customer_feedback to service_role;
alter table public.customer_feedback enable row level security;
create policy "Feedback submittable by all" on public.customer_feedback for insert with check (true);
create policy "Feedback readable by submitter" on public.customer_feedback for select using (auth.uid() = user_id);

-- ─── Marketing Campaigns ──────────────────────────────────────────────────────
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

grant all on public.campaigns to service_role;
grant select on public.campaigns to authenticated;
alter table public.campaigns enable row level security;
create policy "Campaigns readable by authenticated" on public.campaigns for select using (auth.role() = 'authenticated');

-- ─── Referrals ────────────────────────────────────────────────────────────────
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

grant all on public.referrals to service_role;
grant select on public.referrals to authenticated;
alter table public.referrals enable row level security;
create policy "Referrals readable by referrer" on public.referrals for select using (auth.uid() = referrer_id);

-- ─── Sub-categories (replaces localStorage) ───────────────────────────────────
create table if not exists public.sub_categories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  is_active boolean not null default true,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

grant select on public.sub_categories to anon;
grant select on public.sub_categories to authenticated;
grant all on public.sub_categories to service_role;
alter table public.sub_categories enable row level security;
create policy "Sub-categories readable by all" on public.sub_categories for select using (true);
