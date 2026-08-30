-- =====================================================================
-- TINDI HOLDINGS LTD — CORPORATE STATUS & METRICS SYSTEM (IDEMPOTENT & ROBUST)
-- =====================================================================

-- 1. ENUMS
do $$ begin
  create type public.entity_status as enum (
    'PRE_LAUNCH', 'ACTIVE', 'IN_DEVELOPMENT', 'PILOT', 'PLANNED', 'FUTURE', 'PAUSED', 'CLOSED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.metric_classification as enum (
    'VERIFIED', 'PROJECTED', 'TARGET', 'ESTIMATED', 'INTERNAL'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.metric_visibility as enum (
    'PUBLIC', 'ADMIN_ONLY', 'HIDDEN'
  );
exception when duplicate_object then null; end $$;

-- 2. COMPANIES TABLE
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid()
);

alter table public.companies add column if not exists name text not null default '';
alter table public.companies add column if not exists slug text unique;
alter table public.companies add column if not exists tagline text;
alter table public.companies add column if not exists description text;
alter table public.companies add column if not exists industry text;
alter table public.companies add column if not exists icon_name text;
alter table public.companies add column if not exists logo_url text;
alter table public.companies add column if not exists status public.entity_status not null default 'PRE_LAUNCH';
alter table public.companies add column if not exists status_note text;
alter table public.companies add column if not exists founded_date date;
alter table public.companies add column if not exists launch_date date;
alter table public.companies add column if not exists contact_email text;
alter table public.companies add column if not exists contact_phone text;
alter table public.companies add column if not exists website_url text;
alter table public.companies add column if not exists is_subsidiary boolean not null default true;
alter table public.companies add column if not exists parent_id uuid references public.companies(id) on delete set null;
alter table public.companies add column if not exists display_order integer not null default 0;
alter table public.companies add column if not exists is_public boolean not null default true;
alter table public.companies add column if not exists created_at timestamptz not null default now();
alter table public.companies add column if not exists updated_at timestamptz not null default now();

alter table public.companies enable row level security;
drop policy if exists "Public companies are readable by everyone" on public.companies;
drop policy if exists "Admins can manage companies" on public.companies;

create policy "Public companies are readable by everyone"
  on public.companies for select using (is_public = true);

create policy "Admins can manage companies"
  on public.companies for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant select on public.companies to anon, authenticated;
grant all on public.companies to service_role;

-- 3. CORPORATE METRICS TABLE
create table if not exists public.corporate_metrics (
  id uuid primary key default gen_random_uuid()
);

alter table public.corporate_metrics add column if not exists name text not null default '';
alter table public.corporate_metrics add column if not exists slug text unique;
alter table public.corporate_metrics add column if not exists description text;
alter table public.corporate_metrics add column if not exists category text not null default 'General';
alter table public.corporate_metrics add column if not exists current_value numeric;
alter table public.corporate_metrics add column if not exists current_display text;
alter table public.corporate_metrics add column if not exists unit text;
alter table public.corporate_metrics add column if not exists prefix text;
alter table public.corporate_metrics add column if not exists suffix text;
alter table public.corporate_metrics add column if not exists target_value numeric;
alter table public.corporate_metrics add column if not exists target_display text;
alter table public.corporate_metrics add column if not exists target_date date;
alter table public.corporate_metrics add column if not exists classification public.metric_classification not null default 'TARGET';
alter table public.corporate_metrics add column if not exists visibility public.metric_visibility not null default 'PUBLIC';
alter table public.corporate_metrics add column if not exists is_auto_computed boolean not null default false;
alter table public.corporate_metrics add column if not exists auto_compute_sql text;
alter table public.corporate_metrics add column if not exists source text;
alter table public.corporate_metrics add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.corporate_metrics add column if not exists display_order integer not null default 0;
alter table public.corporate_metrics add column if not exists is_featured boolean not null default false;
alter table public.corporate_metrics add column if not exists last_verified_at timestamptz;
alter table public.corporate_metrics add column if not exists last_verified_by uuid references auth.users(id) on delete set null;
alter table public.corporate_metrics add column if not exists created_at timestamptz not null default now();
alter table public.corporate_metrics add column if not exists updated_at timestamptz not null default now();

alter table public.corporate_metrics enable row level security;
drop policy if exists "Public metrics visible to everyone" on public.corporate_metrics;
drop policy if exists "Admins can manage all metrics" on public.corporate_metrics;

create policy "Public metrics visible to everyone"
  on public.corporate_metrics for select using (visibility = 'PUBLIC');

create policy "Admins can manage all metrics"
  on public.corporate_metrics for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant select on public.corporate_metrics to anon, authenticated;
grant all on public.corporate_metrics to service_role;

-- 4. METRIC HISTORY TABLE
create table if not exists public.metric_history (
  id uuid primary key default gen_random_uuid(),
  metric_id uuid not null references public.corporate_metrics(id) on delete cascade,
  old_value numeric,
  new_value numeric,
  old_display text,
  new_display text,
  change_note text,
  changed_by uuid references auth.users(id) on delete set null,
  changed_by_name text,
  created_at timestamptz not null default now()
);

alter table public.metric_history enable row level security;
drop policy if exists "Admins can read metric history" on public.metric_history;
drop policy if exists "Admins can insert metric history" on public.metric_history;

create policy "Admins can read metric history"
  on public.metric_history for select using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert metric history"
  on public.metric_history for insert with check (public.has_role(auth.uid(), 'admin'));

grant select, insert on public.metric_history to authenticated;
grant all on public.metric_history to service_role;

-- 5. SITE SETTINGS TABLE
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid()
);

alter table public.site_settings add column if not exists key text unique;
alter table public.site_settings add column if not exists value text;
alter table public.site_settings add column if not exists value_json jsonb;
alter table public.site_settings add column if not exists description text;
alter table public.site_settings add column if not exists is_public boolean not null default false;
alter table public.site_settings add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.site_settings add column if not exists updated_at timestamptz not null default now();

-- Ensure `value` column accepts text strings cleanly
do $$ begin
  alter table public.site_settings alter column value type text using value::text;
exception when others then null; end $$;

alter table public.site_settings enable row level security;
drop policy if exists "Public settings readable by everyone" on public.site_settings;
drop policy if exists "Admins can manage all settings" on public.site_settings;

create policy "Public settings readable by everyone"
  on public.site_settings for select using (is_public = true);

create policy "Admins can manage all settings"
  on public.site_settings for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant select on public.site_settings to anon, authenticated;
grant all on public.site_settings to service_role;

-- 6. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  performed_by uuid references auth.users(id) on delete set null,
  performed_by_name text,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;
drop policy if exists "Admins can read audit logs" on public.audit_logs;
drop policy if exists "Admins can insert audit logs" on public.audit_logs;

create policy "Admins can read audit logs"
  on public.audit_logs for select using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert audit logs"
  on public.audit_logs for insert with check (public.has_role(auth.uid(), 'admin'));

grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;

-- 7. SEED DATA — 4 SUBSIDIARIES (PRE-LAUNCH)
insert into public.companies (name, slug, tagline, description, industry, icon_name, status, status_note, contact_email, contact_phone, display_order, is_public)
values
  ('Tindi Tech & Smart Homes', 'tindi-tech-smart-homes', 'Pioneering digital innovation and intelligent living environments', 'Tindi Tech & Smart Homes develops software platforms, cloud infrastructure, cybersecurity solutions, and home automation ecosystems.', 'Information Technology & IoT', 'Cpu', 'PRE_LAUNCH', 'Platform and product development in progress. Launch planned Q4 2026.', 'tech@tindiholdings.com', '+254 700 110000', 1, true),
  ('Tindi Safaris & Logistics', 'tindi-safaris-logistics', 'Connecting East Africa through precision logistics and curated travel', 'Tindi Safaris & Logistics is building multi-modal logistics capabilities and premium safari travel services across East Africa.', 'Transportation & Tourism', 'Compass', 'PRE_LAUNCH', 'Fleet acquisition and operational setup in progress. Launch planned Q1 2027.', 'safaris@tindiholdings.com', '+254 700 220000', 2, true),
  ('Tindi Eats', 'tindi-eats', 'Redefining culinary experiences across East Africa', 'Tindi Eats is developing dining, catering, and food technology platforms.', 'Hospitality & Food Technology', 'Utensils', 'IN_DEVELOPMENT', 'Concept development and venue planning in progress.', 'eats@tindiholdings.com', '+254 700 330000', 3, true),
  ('Tindi Apparel', 'tindi-apparel', 'Sustainable fashion crafted for the modern African professional', 'Tindi Apparel is designing premium, sustainable fashion collections combining African craftsmanship with modern materials.', 'Fashion & Apparel', 'Shirt', 'PRE_LAUNCH', 'Design studio established. Collection development in progress.', 'apparel@tindiholdings.com', '+254 700 440000', 4, true)
on conflict (slug) do update set
  status = excluded.status,
  status_note = excluded.status_note,
  contact_email = excluded.contact_email,
  is_public = excluded.is_public;

-- 8. SEED DATA — CORPORATE METRICS
insert into public.corporate_metrics (name, slug, description, category, current_value, current_display, target_value, target_display, target_date, unit, classification, visibility, is_featured, display_order)
values
  ('Operating Subsidiaries', 'operating-subsidiaries', 'Confirmed Tindi Holdings subsidiaries with active development', 'Corporate', 4, '4', 10, '10+', '2031-12-31', 'companies', 'VERIFIED', 'PUBLIC', true, 1),
  ('Active Countries', 'active-countries', 'Countries where Tindi Holdings has active operations', 'Operations', 1, '1 (Kenya)', 8, '8+', '2030-12-31', 'countries', 'VERIFIED', 'PUBLIC', true, 2),
  ('Registered Customers', 'registered-customers', 'Total verified registered customers across all platforms', 'Operations', 0, 'Pre-launch', 1500000, '1.5M+', '2030-12-31', 'customers', 'TARGET', 'PUBLIC', true, 3),
  ('Completed Projects', 'completed-projects', 'Total confirmed, delivered projects across all subsidiaries', 'Operations', 0, 'Pre-launch', 620, '620+', '2031-12-31', 'projects', 'TARGET', 'PUBLIC', true, 4)
on conflict (slug) do update set
  current_value = excluded.current_value,
  current_display = excluded.current_display,
  target_value = excluded.target_value,
  target_display = excluded.target_display,
  classification = excluded.classification,
  visibility = excluded.visibility;

-- 9. SEED DATA — SITE SETTINGS
insert into public.site_settings (key, value, description, is_public)
values
  ('prelaunch_mode', 'true', 'Global pre-launch mode.', true),
  ('store_status', 'PRE_LAUNCH', 'Commerce platform status.', true),
  ('company_name', 'Tindi Holdings Ltd', 'Official company name', true),
  ('launch_quarter', 'Q4 2026', 'Expected formal launch quarter', true)
on conflict (key) do update set
  value = excluded.value,
  is_public = excluded.is_public;
