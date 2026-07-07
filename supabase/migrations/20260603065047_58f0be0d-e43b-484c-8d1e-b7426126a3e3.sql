ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_phone text;

CREATE INDEX IF NOT EXISTS orders_payment_reference_idx ON public.orders(payment_reference);