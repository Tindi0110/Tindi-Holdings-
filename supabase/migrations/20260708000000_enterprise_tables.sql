-- Add staff_role column to profiles
alter table public.profiles add column if not exists staff_role text;

-- Create support_tickets table
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subsidiary text,
  channel text not null,
  subject text not null,
  message text not null,
  status text not null default 'Open' check (status in ('Open', 'In_Progress', 'Resolved')),
  created_at timestamptz not null default now()
);

-- Enable RLS and grants for support_tickets
alter table public.support_tickets enable row level security;
grant select, insert, update on public.support_tickets to authenticated;
grant all on public.support_tickets to service_role;

create policy "Admins manage support tickets" on public.support_tickets
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Users view own support tickets" on public.support_tickets
  for select using (auth.jwt() ->> 'email' = email);

create policy "Anyone can insert support tickets" on public.support_tickets
  for insert with check (true);

-- Create support_messages table
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender text not null check (sender in ('customer', 'admin')),
  message text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS and grants for support_messages
alter table public.support_messages enable row level security;
grant select, insert on public.support_messages to authenticated;
grant all on public.support_messages to service_role;

create policy "Admins manage support messages" on public.support_messages
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Users view messages for own tickets" on public.support_messages
  for select using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and auth.jwt() ->> 'email' = t.email
    )
  );

create policy "Users insert messages for own tickets" on public.support_messages
  for insert with check (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and auth.jwt() ->> 'email' = t.email
    )
  );

-- Create stock_transfers table
create table if not exists public.stock_transfers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  source_branch_id uuid references public.branches(id) on delete set null,
  target_branch_id uuid not null references public.branches(id) on delete cascade,
  quantity int not null check (quantity > 0),
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'In Transit', 'Completed')),
  created_at timestamptz not null default now()
);

-- Enable RLS and grants for stock_transfers
alter table public.stock_transfers enable row level security;
grant select, insert, update on public.stock_transfers to authenticated;
grant all on public.stock_transfers to service_role;

create policy "Admins manage stock transfers" on public.stock_transfers
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Users view stock transfers" on public.stock_transfers
  for select using (true);

-- Create stock_adjustments table
create table if not exists public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null,
  type text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS and grants for stock_adjustments
alter table public.stock_adjustments enable row level security;
grant select, insert on public.stock_adjustments to authenticated;
grant all on public.stock_adjustments to service_role;

create policy "Admins manage stock adjustments" on public.stock_adjustments
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Users view stock adjustments" on public.stock_adjustments
  for select using (true);

-- Create coupons table
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  value numeric(10,2) not null check (value > 0),
  min_spend numeric(10,2) check (min_spend >= 0),
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable RLS and grants for coupons
alter table public.coupons enable row level security;
grant select on public.coupons to anon, authenticated;
grant all on public.coupons to service_role;

create policy "Coupons viewable by everyone" on public.coupons for select using (true);
create policy "Admins manage coupons" on public.coupons
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
