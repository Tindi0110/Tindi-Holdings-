-- =====================================================================
-- TINDI HOLDINGS LTD — CORPORATE STATUS SYSTEM
-- Migration: 20260830000001_corporate_status_system.sql
-- Purpose: Establish the data architecture for a credible pre-launch
--          corporate platform with auditable, dynamic metrics.
-- =====================================================================

-- -----------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------

-- Corporate entity status (companies, ventures, projects)
do $$ begin
  create type public.entity_status as enum (
    'PRE_LAUNCH',
    'ACTIVE',
    'IN_DEVELOPMENT',
    'PILOT',
    'PLANNED',
    'FUTURE',
    'PAUSED',
    'CLOSED'
  );
exception
  when duplicate_object then null;
end $$;

-- Metric data classification
do $$ begin
  create type public.metric_classification as enum (
    'VERIFIED',    -- Actual, confirmed data from records
    'PROJECTED',   -- Forecast / expected
    'TARGET',      -- Strategic target / goal
    'ESTIMATED',   -- Best estimate, not yet verified
    'INTERNAL'     -- Internal only, not for public display
  );
exception
  when duplicate_object then null;
end $$;

-- Metric visibility
do $$ begin
  create type public.metric_visibility as enum (
    'PUBLIC',      -- Shown on public website
    'ADMIN_ONLY',  -- Only shown in admin dashboard
    'HIDDEN'       -- Completely hidden
  );
exception
  when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------
-- COMPANIES TABLE
-- The authoritative registry for all Tindi Holdings subsidiaries and
-- future ventures. Not hard-coded in the frontend.
-- -----------------------------------------------------------------------

create table if not exists public.companies (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  tagline          text,
  description      text,
  industry         text,
  icon_name        text,                         -- Lucide icon name
  logo_url         text,
  status           public.entity_status not null default 'PRE_LAUNCH',
  status_note      text,                         -- Human readable note e.g. "Launching Q4 2026"
  founded_date     date,
  launch_date      date,                         -- Expected / actual launch date
  contact_email    text,
  contact_phone    text,
  website_url      text,
  is_subsidiary    boolean not null default true,
  parent_id        uuid references public.companies(id) on delete set null,
  display_order    integer not null default 0,
  is_public        boolean not null default true, -- Show on public site
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- RLS for companies
alter table public.companies enable row level security;

create policy "Public companies are readable by everyone"
  on public.companies for select
  using (is_public = true);

create policy "Admins can manage companies"
  on public.companies for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant select on public.companies to anon, authenticated;
grant all on public.companies to service_role;

-- -----------------------------------------------------------------------
-- CORPORATE METRICS TABLE
-- Every key business metric should live here, not in frontend components.
-- The frontend reads from this table. Admins update via the dashboard.
-- -----------------------------------------------------------------------

create table if not exists public.corporate_metrics (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  description      text,
  category         text not null default 'General',   -- e.g. "Operations", "Finance", "Impact"

  -- Current value (what IS true today)
  current_value    numeric,
  current_display  text,              -- Override display string e.g. "Pre-launch"
  unit             text,              -- e.g. "customers", "KES", "%"
  prefix           text,              -- e.g. "KES ", "$"
  suffix           text,              -- e.g. "+", "M+"

  -- Target / projection
  target_value     numeric,
  target_display   text,             -- e.g. "1.5M+"
  target_date      date,             -- When do we expect to hit target

  -- Classification & visibility
  classification   public.metric_classification not null default 'TARGET',
  visibility       public.metric_visibility not null default 'PUBLIC',
  is_auto_computed boolean not null default false,  -- If true, computed from DB records
  auto_compute_sql text,             -- The query used to compute it (admin reference)

  -- Metadata
  source           text,             -- "Supabase orders table", "Manual entry", etc.
  company_id       uuid references public.companies(id) on delete set null,
  display_order    integer not null default 0,
  is_featured      boolean not null default false,   -- Show on homepage
  last_verified_at timestamptz,
  last_verified_by uuid references auth.users(id) on delete set null,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- RLS for corporate_metrics
alter table public.corporate_metrics enable row level security;

create policy "Public metrics visible to everyone"
  on public.corporate_metrics for select
  using (visibility = 'PUBLIC');

create policy "Admins can manage all metrics"
  on public.corporate_metrics for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant select on public.corporate_metrics to anon, authenticated;
grant all on public.corporate_metrics to service_role;

-- -----------------------------------------------------------------------
-- METRIC HISTORY TABLE
-- Every change to a corporate metric is recorded here with full audit
-- trail: who changed it, when, what the old/new values were, and why.
-- -----------------------------------------------------------------------

create table if not exists public.metric_history (
  id             uuid primary key default gen_random_uuid(),
  metric_id      uuid not null references public.corporate_metrics(id) on delete cascade,
  old_value      numeric,
  new_value      numeric,
  old_display    text,
  new_display    text,
  change_note    text,                    -- Admin's reason for the change
  changed_by     uuid references auth.users(id) on delete set null,
  changed_by_name text,                  -- Denormalized for display after user deletion
  created_at     timestamptz not null default now()
);

-- RLS for metric_history
alter table public.metric_history enable row level security;

create policy "Admins can read metric history"
  on public.metric_history for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert metric history"
  on public.metric_history for insert
  with check (public.has_role(auth.uid(), 'admin'));

grant select, insert on public.metric_history to authenticated;
grant all on public.metric_history to service_role;

-- -----------------------------------------------------------------------
-- SITE SETTINGS TABLE
-- Global configuration for the platform. Allows admins to control
-- pre-launch mode, store status, and other site-wide settings.
-- -----------------------------------------------------------------------

create table if not exists public.site_settings (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  value        text,
  value_json   jsonb,
  description  text,
  is_public    boolean not null default false,  -- Can be read by anon?
  updated_by   uuid references auth.users(id) on delete set null,
  updated_at   timestamptz not null default now()
);

-- RLS for site_settings
alter table public.site_settings enable row level security;

create policy "Public settings readable by everyone"
  on public.site_settings for select
  using (is_public = true);

create policy "Admins can manage all settings"
  on public.site_settings for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant select on public.site_settings to anon, authenticated;
grant all on public.site_settings to service_role;

-- -----------------------------------------------------------------------
-- AUDIT LOGS TABLE
-- Every sensitive administrative action is logged here permanently.
-- -----------------------------------------------------------------------

create table if not exists public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  action       text not null,           -- e.g. "UPDATE_METRIC", "PUBLISH_ARTICLE"
  entity_type  text,                    -- e.g. "metric", "company", "product"
  entity_id    text,                    -- UUID or identifier of affected record
  old_data     jsonb,                   -- Previous state (safe subset)
  new_data     jsonb,                   -- New state (safe subset)
  performed_by uuid references auth.users(id) on delete set null,
  performed_by_name text,              -- Denormalized
  ip_address   text,
  user_agent   text,
  created_at   timestamptz not null default now()
);

-- RLS for audit_logs
alter table public.audit_logs enable row level security;

create policy "Admins can read audit logs"
  on public.audit_logs for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert audit logs"
  on public.audit_logs for insert
  with check (public.has_role(auth.uid(), 'admin'));

grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;

-- -----------------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- -----------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

create trigger corporate_metrics_updated_at
  before update on public.corporate_metrics
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------
-- SEED DATA — COMPANIES (PRE-LAUNCH)
-- All companies reflect their true current status: PRE_LAUNCH.
-- Statistics are NOT seeded here — they belong in corporate_metrics.
-- -----------------------------------------------------------------------

insert into public.companies (name, slug, tagline, description, industry, icon_name, status, status_note, contact_email, contact_phone, display_order, is_public)
values
  (
    'Tindi Tech & Smart Homes',
    'tindi-tech-smart-homes',
    'Pioneering digital innovation and intelligent living environments',
    'Tindi Tech & Smart Homes develops software platforms, cloud infrastructure, cybersecurity solutions, and home automation ecosystems. We are building technology capabilities that will serve individuals, businesses, and institutions across East Africa.',
    'Information Technology & IoT',
    'Cpu',
    'PRE_LAUNCH',
    'Platform and product development in progress. Launch planned Q4 2026.',
    'tech@tindiholdings.com',
    '+254 700 110000',
    1,
    true
  ),
  (
    'Tindi Safaris & Logistics',
    'tindi-safaris-logistics',
    'Connecting East Africa through precision logistics and curated travel',
    'Tindi Safaris & Logistics is building multi-modal logistics capabilities and premium safari travel services across East Africa. Our fleet and operational infrastructure are currently being established.',
    'Transportation & Tourism',
    'Compass',
    'PRE_LAUNCH',
    'Fleet acquisition and operational setup in progress. Launch planned Q1 2027.',
    'safaris@tindiholdings.com',
    '+254 700 220000',
    2,
    true
  ),
  (
    'Tindi Eats',
    'tindi-eats',
    'Redefining culinary experiences across East Africa',
    'Tindi Eats is developing dining, catering, and food technology platforms. Our hospitality concept, kitchen infrastructure, and digital ordering systems are currently in the design and development phase.',
    'Hospitality & Food Technology',
    'Utensils',
    'IN_DEVELOPMENT',
    'Concept development and venue planning in progress.',
    'eats@tindiholdings.com',
    '+254 700 330000',
    3,
    true
  ),
  (
    'Tindi Apparel',
    'tindi-apparel',
    'Sustainable fashion crafted for the modern African professional',
    'Tindi Apparel is designing premium, sustainable fashion collections combining African craftsmanship with modern materials. Our design studio and supply chain are currently being established.',
    'Fashion & Apparel',
    'Shirt',
    'PRE_LAUNCH',
    'Design studio established. Collection development in progress.',
    'apparel@tindiholdings.com',
    '+254 700 440000',
    4,
    true
  ),
  (
    'Tindi Energy',
    'tindi-energy',
    'Clean energy solutions for sustainable growth',
    'Planned expansion into renewable energy, grid-scale solar storage, and clean power infrastructure for East Africa.',
    'Energy',
    'Zap',
    'FUTURE',
    'Strategic planning stage. No operational timeline confirmed.',
    null,
    null,
    5,
    true
  ),
  (
    'Tindi Finance',
    'tindi-finance',
    'Empowering commerce through accessible financial technology',
    'Planned expansion into financial technology, digital payments, micro-credit, and consumer financial services.',
    'Financial Technology',
    'Layers',
    'PLANNED',
    'Feasibility and regulatory assessment in progress.',
    null,
    null,
    6,
    true
  ),
  (
    'Tindi Real Estate',
    'tindi-real-estate',
    'Developing smart, sustainable urban environments',
    'Planned expansion into smart property development and management across East Africa.',
    'Real Estate',
    'Building',
    'FUTURE',
    'Strategic planning stage.',
    null,
    null,
    7,
    true
  ),
  (
    'Tindi Health',
    'tindi-health',
    'Technology-enabled healthcare for every community',
    'Planned expansion into digital health platforms, telemedicine, and medical technology.',
    'Healthcare Technology',
    'Heart',
    'FUTURE',
    'Research and concept stage.',
    null,
    null,
    8,
    true
  )
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------
-- SEED DATA — CORPORATE METRICS
-- All current_value figures reflect the ACTUAL pre-launch state (0 or 1).
-- Targets reflect the strategic vision. Classification is honest.
-- -----------------------------------------------------------------------

insert into public.corporate_metrics (name, slug, description, category, current_value, current_display, target_value, target_display, target_date, unit, classification, visibility, is_featured, display_order)
values
  (
    'Registered Customers',
    'registered-customers',
    'Total verified registered customers across all platforms',
    'Operations',
    0,
    'Pre-launch',
    1500000,
    '1.5M+',
    '2030-12-31',
    'customers',
    'VERIFIED',
    'PUBLIC',
    true,
    1
  ),
  (
    'Active Countries',
    'active-countries',
    'Countries where Tindi Holdings has active operations',
    'Operations',
    1,
    '1 (Kenya)',
    8,
    '8+',
    '2030-12-31',
    'countries',
    'VERIFIED',
    'PUBLIC',
    true,
    2
  ),
  (
    'Completed Projects',
    'completed-projects',
    'Total confirmed, delivered projects across all subsidiaries',
    'Operations',
    0,
    'Pre-launch',
    620,
    '620+',
    '2031-12-31',
    'projects',
    'VERIFIED',
    'PUBLIC',
    true,
    3
  ),
  (
    'Active Products',
    'active-products',
    'Products currently listed and available for sale',
    'Commerce',
    0,
    'Pre-launch',
    500,
    '500+',
    '2027-12-31',
    'products',
    'VERIFIED',
    'PUBLIC',
    false,
    4
  ),
  (
    'Smart Home Installations',
    'smart-home-installations',
    'Completed smart home and building automation installations',
    'Technology',
    0,
    'Pre-launch',
    320,
    '320+',
    '2029-12-31',
    'installations',
    'VERIFIED',
    'PUBLIC',
    false,
    5
  ),
  (
    'Fleet Vehicles',
    'fleet-vehicles',
    'Operational vehicles in the Tindi Safaris & Logistics fleet',
    'Logistics',
    0,
    'Under acquisition',
    180,
    '180+',
    '2028-12-31',
    'vehicles',
    'VERIFIED',
    'PUBLIC',
    false,
    6
  ),
  (
    'Team Members',
    'team-members',
    'Full-time and contracted team members across all entities',
    'People',
    0,
    'Founding team',
    250,
    '250+',
    '2028-12-31',
    'people',
    'VERIFIED',
    'PUBLIC',
    false,
    7
  ),
  (
    'Operating Subsidiaries',
    'operating-subsidiaries',
    'Confirmed Tindi Holdings subsidiaries with active development',
    'Corporate',
    4,
    '4',
    10,
    '10+',
    '2031-12-31',
    'companies',
    'VERIFIED',
    'PUBLIC',
    true,
    8
  ),
  (
    'Years of Strategic Operation',
    'years-operation',
    'Years since Tindi Holdings Ltd was formally established',
    'Corporate',
    null,
    'Launching 2026',
    null,
    null,
    null,
    'years',
    'VERIFIED',
    'PUBLIC',
    false,
    9
  )
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------
-- SEED DATA — SITE SETTINGS
-- -----------------------------------------------------------------------

insert into public.site_settings (key, value, description, is_public)
values
  ('prelaunch_mode', 'true', 'Global pre-launch mode. When true, shows pre-launch messaging across the site.', true),
  ('store_status', 'PRE_LAUNCH', 'Commerce platform status: PRE_LAUNCH | ACTIVE | PAUSED', true),
  ('store_launch_message', 'Our commerce platform is being prepared for launch. Check back soon.', 'Message shown when store is in PRE_LAUNCH mode.', true),
  ('company_name', 'Tindi Holdings Ltd', 'Official company name', true),
  ('company_tagline', 'Building businesses for Africa''s next generation.', 'Homepage hero tagline', true),
  ('investor_disclaimer', 'All financial projections, targets and illustrative scenarios presented on this website are forward-looking statements and do not represent guaranteed returns or historical performance. Investment carries risk. Tindi Holdings Ltd is a pre-launch entity.', 'Disclaimer shown on investor pages', true),
  ('launch_quarter', 'Q4 2026', 'Expected formal launch quarter', true),
  ('contact_email', 'info@tindiholdings.com', 'Primary contact email', true),
  ('contact_phone', '+254 700 000 000', 'Primary contact phone', true),
  ('hq_address', 'Nairobi, Kenya', 'Headquarters address', true)
on conflict (key) do nothing;

-- -----------------------------------------------------------------------
-- GRANT SEQUENCE ACCESS
-- -----------------------------------------------------------------------

grant usage on all sequences in schema public to authenticated;
grant usage on all sequences in schema public to anon;
