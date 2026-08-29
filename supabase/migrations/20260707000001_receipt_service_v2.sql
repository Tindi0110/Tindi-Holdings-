-- 1. Create Document Type Enum
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

-- 2. Create Receipt Builder Config Table
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

-- 3. Alter receipts table to support document_type and company_id
ALTER TABLE public.receipts 
  ADD COLUMN IF NOT EXISTS document_type public.document_type NOT NULL DEFAULT 'sales_receipt',
  ADD COLUMN IF NOT EXISTS company_id uuid,
  ADD COLUMN IF NOT EXISTS company_name text NOT NULL DEFAULT 'Tindi Holdings Ltd';

CREATE INDEX IF NOT EXISTS receipts_document_type_idx ON public.receipts(document_type);

-- 4. Enable RLS on receipt builder config
ALTER TABLE public.receipt_builder_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read receipt builder config" ON public.receipt_builder_config
  FOR SELECT USING (true);

CREATE POLICY "Admins manage receipt builder config" ON public.receipt_builder_config
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Insert Global Default Builder Config
INSERT INTO public.receipt_builder_config (branch_id, company_id)
VALUES (NULL, NULL)
ON CONFLICT (branch_id) DO NOTHING;
