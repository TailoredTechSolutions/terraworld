
-- Add new product fields for harvest date, availability window, cutoff time, and pause control
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS harvest_date date,
  ADD COLUMN IF NOT EXISTS availability_start date,
  ADD COLUMN IF NOT EXISTS availability_end date,
  ADD COLUMN IF NOT EXISTS cutoff_time time DEFAULT '17:00:00',
  ADD COLUMN IF NOT EXISTS is_paused boolean NOT NULL DEFAULT false;

-- Add index for availability queries
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products (availability_start, availability_end) WHERE is_paused = false;
