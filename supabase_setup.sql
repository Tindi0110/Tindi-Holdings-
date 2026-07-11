-- ==========================================
-- TINDI HOLDINGS LIMITED - DATABASE CONFIGURATION
-- Combined Setup Script for Enterprise Schema
-- Copy and paste this script into your Supabase SQL Editor and run it.
-- ==========================================

-- 1. Create Enums
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'receipt_status') THEN
    CREATE TYPE public.receipt_status AS ENUM (
      'generated', 'viewed', 'printed', 'downloaded', 'shared', 'emailed', 'cancelled', 'refunded', 'returned', 'archived'
    );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    CREATE TYPE public.document_type AS ENUM (
      'sales_receipt', 'invoice', 'quotation', 'refund_receipt', 'return_receipt', 'exchange_receipt', 
      'delivery_note', 'purchase_order', 'supplier_receipt', 'stock_transfer_note', 'credit_note', 
      'debit_note', 'proforma_invoice', 'payment_confirmation', 'subscription_receipt', 'gift_receipt', 'tax_invoice'
    );
  END IF;
END $$;

-- 2. Create branches table if not exists (reference table)
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create receipt_settings Table
CREATE TABLE IF NOT EXISTS public.receipt_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  company_name text NOT NULL DEFAULT 'Tindi Holdings Limited',
  company_logo text,
  email text DEFAULT 'info@tindiholdings.com',
  phone text DEFAULT '+254 700 000 000',
  website text DEFAULT 'https://tindiholdings.com',
  tagline text DEFAULT 'Pioneering Future Scale & Excellence',
  return_policy text DEFAULT 'Returns accepted within 30 days with original receipt.',
  terms text DEFAULT 'Thank you for shopping with us. All transactions are subject to our terms of service.',
  footer_message text DEFAULT 'Tindi Holdings Limited. All rights reserved.',
  social_media jsonb DEFAULT '{}'::jsonb,
  paper_size text DEFAULT '80mm', -- 'A4', '58mm', '80mm'
  font_family text DEFAULT 'Inter, sans-serif',
  receipt_width text DEFAULT '100%',
  date_format text DEFAULT 'YYYY-MM-DD',
  time_format text DEFAULT 'HH:mm:ss',
  currency_default text DEFAULT 'KES',
  tax_registration_number text DEFAULT 'KRA-PIN-01102026',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id)
);

-- Insert Default Settings
INSERT INTO public.receipt_settings (branch_id, company_name)
VALUES (NULL, 'Tindi Holdings Limited')
ON CONFLICT (branch_id) DO NOTHING;

-- 4. Create Receipts Table
CREATE TABLE IF NOT EXISTS public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text UNIQUE NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount_paid numeric(10,2) NOT NULL check (amount_paid >= 0),
  currency text NOT NULL DEFAULT 'KES',
  tax_amount numeric(10,2) NOT NULL DEFAULT 0 check (tax_amount >= 0),
  tax_details jsonb NOT NULL DEFAULT '{}'::jsonb, -- Vat details breakdown, PIN
  discount_amount numeric(10,2) NOT NULL DEFAULT 0 check (discount_amount >= 0),
  discount_details jsonb NOT NULL DEFAULT '{}'::jsonb, -- voucher/promotion details
  loyalty_points jsonb NOT NULL DEFAULT '{}'::jsonb, -- points earned/balance
  payment_method text NOT NULL DEFAULT 'cod',
  payment_details jsonb NOT NULL DEFAULT '{}'::jsonb, -- Card/Mpesa details, reference
  shipping_details jsonb NOT NULL DEFAULT '{}'::jsonb, -- tracking number, delivery address
  status public.receipt_status NOT NULL DEFAULT 'generated',
  receipt_hash text NOT NULL,
  digital_signature text NOT NULL,
  watermark text,
  is_archived boolean NOT NULL DEFAULT false,
  document_type public.document_type NOT NULL DEFAULT 'sales_receipt',
  company_id uuid,
  company_name text NOT NULL DEFAULT 'Tindi Holdings Limited',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create Indexes for Receipts
CREATE INDEX IF NOT EXISTS receipts_order_id_idx ON public.receipts(order_id);
CREATE INDEX IF NOT EXISTS receipts_branch_id_idx ON public.receipts(branch_id);
CREATE INDEX IF NOT EXISTS receipts_user_id_idx ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS receipts_receipt_number_idx ON public.receipts(receipt_number);
CREATE INDEX IF NOT EXISTS receipts_status_idx ON public.receipts(status);
CREATE INDEX IF NOT EXISTS receipts_document_type_idx ON public.receipts(document_type);

-- 5. Create Receipt Line Items Table
CREATE TABLE IF NOT EXISTS public.receipt_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity int NOT NULL check (quantity > 0),
  unit_price numeric(10,2) NOT NULL check (unit_price >= 0),
  stock_before int,
  stock_remaining int,
  warehouse text DEFAULT 'Primary Warehouse',
  inventory_transaction_id text
);

CREATE INDEX IF NOT EXISTS receipt_items_receipt_id_idx ON public.receipt_items(receipt_id);

-- 6. Create Refund Receipts Table
CREATE TABLE IF NOT EXISTS public.refund_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_number text UNIQUE NOT NULL,
  original_receipt_id uuid NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  refund_amount numeric(10,2) NOT NULL check (refund_amount >= 0),
  refund_reason text NOT NULL,
  staff_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refund_receipts_receipt_id_idx ON public.refund_receipts(original_receipt_id);

-- 7. Create Receipt Actions Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.receipt_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  action text NOT NULL, -- e.g., 'printed', 'downloaded', 'emailed', 'viewed', 'cancelled', 'refunded'
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address text,
  device text,
  browser text,
  os text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb, -- extra logs
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS receipt_actions_receipt_id_idx ON public.receipt_actions(receipt_id);
CREATE INDEX IF NOT EXISTS receipt_actions_created_at_idx ON public.receipt_actions(created_at DESC);

-- 8. Create Notifications Table for Alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- Null means broadcast to all admins
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(is_read);

-- 9. Create Receipt Builder Config Table
CREATE TABLE IF NOT EXISTS public.receipt_builder_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  company_id uuid, -- For multi-company extensions
  primary_color text NOT NULL DEFAULT '#3b82f6',
  font_family text NOT NULL DEFAULT 'Inter, sans-serif',
  show_header boolean NOT NULL DEFAULT true,
  show_footer boolean NOT NULL DEFAULT true,
  show_barcode boolean NOT NULL DEFAULT true,
  show_qrcode boolean NOT NULL DEFAULT true,
  show_loyalty boolean NOT NULL DEFAULT true,
  show_shipping boolean NOT NULL DEFAULT true,
  show_payment_details boolean NOT NULL DEFAULT true,
  layout_sections jsonb NOT NULL DEFAULT '["header", "metadata", "items", "totals", "payment", "loyalty", "security", "footer"]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id)
);

-- Insert Default Builder Config
INSERT INTO public.receipt_builder_config (branch_id, company_id)
VALUES (NULL, NULL)
ON CONFLICT (branch_id) DO NOTHING;

-- 10. Add staff_role column to profiles
alter table public.profiles add column if not exists staff_role text;

-- 11. Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
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

-- 12. Create support_messages table
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender text not null check (sender in ('customer', 'admin')),
  message text not null,
  created_at timestamptz not null default now()
);

-- 13. Create stock_transfers table
CREATE TABLE IF NOT EXISTS public.stock_transfers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  source_branch_id uuid references public.branches(id) on delete set null,
  target_branch_id uuid not null references public.branches(id) on delete cascade,
  quantity int not null check (quantity > 0),
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'In Transit', 'Completed')),
  created_at timestamptz not null default now()
);

-- 14. Create stock_adjustments table
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null,
  type text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- 15. Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
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

-- 16. Enable RLS on all tables
ALTER TABLE public.receipt_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_builder_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 17. Security Grants
grant select, insert, update on public.receipt_settings to authenticated;
grant all on public.receipt_settings to service_role;
grant select, insert, update on public.receipts to authenticated;
grant all on public.receipts to service_role;
grant select, insert on public.receipt_items to authenticated;
grant all on public.receipt_items to service_role;
grant select, insert on public.refund_receipts to authenticated;
grant all on public.refund_receipts to service_role;
grant select, insert on public.receipt_actions to authenticated;
grant all on public.receipt_actions to service_role;
grant select, insert, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
grant select, insert, update on public.receipt_builder_config to authenticated;
grant all on public.receipt_builder_config to service_role;
grant select, insert, update on public.support_tickets to authenticated;
grant all on public.support_tickets to service_role;
grant select, insert on public.support_messages to authenticated;
grant all on public.support_messages to service_role;
grant select, insert, update on public.stock_transfers to authenticated;
grant all on public.stock_transfers to service_role;
grant select, insert on public.stock_adjustments to authenticated;
grant all on public.stock_adjustments to service_role;
grant select on public.coupons to anon, authenticated;
grant all on public.coupons to service_role;

-- 18. Security RLS Policies

-- has_role helper function check
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Settings Policies
CREATE POLICY "Public read receipt settings" ON public.receipt_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage receipt settings" ON public.receipt_settings FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Receipts Policies
CREATE POLICY "Customers view own receipts" ON public.receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public verify specific fields" ON public.receipts FOR SELECT USING (true);
CREATE POLICY "Admins view and manage all receipts" ON public.receipts FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Receipt Items Policies
CREATE POLICY "Customers view own receipt items" ON public.receipt_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.receipts r WHERE r.id = receipt_id AND r.user_id = auth.uid()));
CREATE POLICY "Admins manage all receipt items" ON public.receipt_items FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Refund Policies
CREATE POLICY "Customers view own refund receipts" ON public.refund_receipts FOR SELECT USING (EXISTS (SELECT 1 FROM public.receipts r WHERE r.id = original_receipt_id AND r.user_id = auth.uid()));
CREATE POLICY "Admins manage all refund receipts" ON public.refund_receipts FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Action Log Policies
CREATE POLICY "Customers view own receipt actions" ON public.receipt_actions FOR SELECT USING (EXISTS (SELECT 1 FROM public.receipts r WHERE r.id = receipt_id AND r.user_id = auth.uid()));
CREATE POLICY "Admins manage all receipt actions" ON public.receipt_actions FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Notifications Policies
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins manage notifications" ON public.notifications FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Builder Config Policies
CREATE POLICY "Public read receipt builder config" ON public.receipt_builder_config FOR SELECT USING (true);
CREATE POLICY "Admins manage receipt builder config" ON public.receipt_builder_config FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Support Ticket Policies
create policy "Admins manage support tickets" on public.support_tickets for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Users view own support tickets" on public.support_tickets for select using (auth.jwt() ->> 'email' = email);
create policy "Anyone can insert support tickets" on public.support_tickets for insert with check (true);

-- Support Message Policies
create policy "Admins manage support messages" on public.support_messages for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Users view messages for own tickets" on public.support_messages for select using (exists (select 1 from public.support_tickets t where t.id = ticket_id and auth.jwt() ->> 'email' = t.email));
create policy "Users insert messages for own tickets" on public.support_messages for insert with check (exists (select 1 from public.support_tickets t where t.id = ticket_id and auth.jwt() ->> 'email' = t.email));

-- Stock Transfer Policies
create policy "Admins manage stock transfers" on public.stock_transfers for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Users view stock transfers" on public.stock_transfers for select using (true);

-- Stock Adjustment Policies
create policy "Admins manage stock adjustments" on public.stock_adjustments for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Users view stock adjustments" on public.stock_adjustments for select using (true);

-- Coupon Policies
create policy "Coupons viewable by everyone" on public.coupons for select using (true);
create policy "Admins manage coupons" on public.coupons for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
