-- ============================================================================
-- RETURNS & REFUNDS SYSTEM MIGRATION (JUMIA STYLE)
-- ============================================================================

-- 1. Create Return Requests Table
CREATE TABLE IF NOT EXISTS public.return_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number text UNIQUE NOT NULL,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name text,
  customer_phone text,
  customer_email text,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'requested' CHECK (
    status IN ('requested', 'approved', 'pickup_scheduled', 'in_transit', 'received', 'inspecting', 'refunded', 'rejected', 'cancelled')
  ),
  reason_category text NOT NULL DEFAULT 'defective',
  reason_title text NOT NULL,
  reason_details text,
  images jsonb DEFAULT '[]'::jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  pickup_method text NOT NULL DEFAULT 'express_pickup' CHECK (pickup_method IN ('express_pickup', 'drop_off')),
  pickup_address text,
  dropoff_branch_name text,
  refund_method text NOT NULL DEFAULT 'mpesa' CHECK (refund_method IN ('mpesa', 'store_credit', 'bank_transfer', 'original_payment')),
  refund_phone text,
  refund_account_name text,
  refund_bank_name text,
  refund_account_number text,
  refund_amount numeric(10,2) NOT NULL DEFAULT 0 CHECK (refund_amount >= 0),
  refund_reference text,
  voucher_code text,
  tracking_number text,
  waybill_number text,
  admin_notes text,
  rejection_reason text,
  inspection_notes text,
  inspection_passed boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS return_requests_order_id_idx ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS return_requests_user_id_idx ON public.return_requests(user_id);
CREATE INDEX IF NOT EXISTS return_requests_status_idx ON public.return_requests(status);

-- 2. Create Return Events Table (Audit & Timeline Tracker)
CREATE TABLE IF NOT EXISTS public.return_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid NOT NULL REFERENCES public.return_requests(id) ON DELETE CASCADE,
  status text NOT NULL,
  title text NOT NULL,
  description text,
  location text,
  actor_name text DEFAULT 'Tindi Automated System',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS return_events_return_id_idx ON public.return_events(return_id);

-- 3. Row Level Security
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_events ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.return_requests TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.return_requests TO authenticated;

GRANT ALL ON public.return_events TO service_role;
GRANT SELECT, INSERT ON public.return_events TO authenticated;

-- Policies
CREATE POLICY "Users can view their own return requests"
  ON public.return_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create return requests"
  ON public.return_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to return requests"
  ON public.return_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Users can view return events for their returns"
  ON public.return_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.return_requests
      WHERE return_requests.id = return_events.return_id AND return_requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins have full access to return events"
  ON public.return_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );
