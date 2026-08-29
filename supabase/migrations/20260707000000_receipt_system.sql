-- 1. Create Receipt Status Enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'receipt_status') THEN
    CREATE TYPE public.receipt_status AS ENUM (
      'generated', 'viewed', 'printed', 'downloaded', 'shared', 'emailed', 'cancelled', 'refunded', 'returned', 'archived'
    );
  END IF;
END $$;

-- 2. Create Receipt Settings Table
CREATE TABLE IF NOT EXISTS public.receipt_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  company_name text NOT NULL DEFAULT 'Tindi Holdings Ltd',
  company_logo text,
  email text DEFAULT 'info@tindiholdings.com',
  phone text DEFAULT '+254 700 000 000',
  website text DEFAULT 'https://tindiholdings.com',
  tagline text DEFAULT 'Pioneering Future Scale & Excellence',
  return_policy text DEFAULT 'Returns accepted within 30 days with original receipt.',
  terms text DEFAULT 'Thank you for shopping with us. All transactions are subject to our terms of service.',
  footer_message text DEFAULT 'Tindi Holdings Ltd. All rights reserved.',
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

-- 3. Create Receipts Table
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
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS receipts_order_id_idx ON public.receipts(order_id);
CREATE INDEX IF NOT EXISTS receipts_branch_id_idx ON public.receipts(branch_id);
CREATE INDEX IF NOT EXISTS receipts_user_id_idx ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS receipts_receipt_number_idx ON public.receipts(receipt_number);
CREATE INDEX IF NOT EXISTS receipts_status_idx ON public.receipts(status);

-- 4. Create Receipt Line Items Table
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

-- 5. Create Refund Receipts Table
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

-- 6. Create Receipt Actions Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.receipt_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  action text NOT NULL, -- e.g., 'printed', 'downloaded', 'emailed', 'viewed', 'cancelled', 'refunded'
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address text,
  device text,
  browser text,
  os text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb, -- extra logs (e.g. copies count)
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS receipt_actions_receipt_id_idx ON public.receipt_actions(receipt_id);
CREATE INDEX IF NOT EXISTS receipt_actions_created_at_idx ON public.receipt_actions(created_at DESC);

-- 7. Create Notifications Table for Alerts
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

-- 8. Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE public.receipt_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Receipt Settings
CREATE POLICY "Public read receipt settings" ON public.receipt_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins manage receipt settings" ON public.receipt_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Receipts
CREATE POLICY "Customers view own receipts" ON public.receipts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public verify specific fields" ON public.receipts
  FOR SELECT USING (true); -- Public verification via URL (restrict fields in API select, not here)

CREATE POLICY "Admins view and manage all receipts" ON public.receipts
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Receipt Items
CREATE POLICY "Customers view own receipt items" ON public.receipt_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.receipts r WHERE r.id = receipt_id AND r.user_id = auth.uid())
  );

CREATE POLICY "Admins manage all receipt items" ON public.receipt_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Refund Receipts
CREATE POLICY "Customers view own refund receipts" ON public.refund_receipts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.receipts r WHERE r.id = original_receipt_id AND r.user_id = auth.uid())
  );

CREATE POLICY "Admins manage all refund receipts" ON public.refund_receipts
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Receipt Actions (Audit Trails)
CREATE POLICY "Customers view own receipt actions" ON public.receipt_actions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.receipts r WHERE r.id = receipt_id AND r.user_id = auth.uid())
  );

CREATE POLICY "Admins manage all receipt actions" ON public.receipt_actions
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Notifications
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins manage notifications" ON public.notifications
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert Global Default Settings
INSERT INTO public.receipt_settings (branch_id, company_name)
VALUES (NULL, 'Tindi Holdings Ltd')
ON CONFLICT (branch_id) DO NOTHING;
