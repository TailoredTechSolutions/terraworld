
-- Create delivery booking status enum
CREATE TYPE public.delivery_booking_status AS ENUM (
  'none',
  'pending',
  'confirmed',
  'in_transit',
  'completed',
  'cancelled'
);

-- Create delivery provider enum
CREATE TYPE public.delivery_provider AS ENUM (
  'lalamove',
  'grab'
);

-- Create delivery_bookings table
CREATE TABLE public.delivery_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  provider_type public.delivery_provider NOT NULL,
  external_booking_id TEXT,
  booking_status public.delivery_booking_status NOT NULL DEFAULT 'pending',
  estimated_fee NUMERIC NOT NULL DEFAULT 0,
  final_fee NUMERIC,
  estimated_eta_minutes INTEGER,
  pickup_address TEXT,
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  delivery_address TEXT,
  delivery_latitude DOUBLE PRECISION,
  delivery_longitude DOUBLE PRECISION,
  distance_km NUMERIC,
  driver_name TEXT,
  driver_phone TEXT,
  driver_plate TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  provider_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add delivery_booking_status column to orders table
ALTER TABLE public.orders 
  ADD COLUMN delivery_booking_status public.delivery_booking_status NOT NULL DEFAULT 'none',
  ADD COLUMN delivery_provider public.delivery_provider;

-- Unique constraint: only one active booking per order (PENDING, CONFIRMED, IN_TRANSIT)
-- We use a partial unique index to enforce this at DB level
CREATE UNIQUE INDEX idx_one_active_booking_per_order 
ON public.delivery_bookings (order_id) 
WHERE booking_status IN ('pending', 'confirmed', 'in_transit');

-- Enable RLS
ALTER TABLE public.delivery_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all bookings"
ON public.delivery_bookings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Buyers can view own order bookings"
ON public.delivery_bookings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM orders o WHERE o.id = delivery_bookings.order_id
  AND has_role(auth.uid(), 'buyer'::app_role)
));

CREATE POLICY "Farmers can view assigned order bookings"
ON public.delivery_bookings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM orders o WHERE o.id = delivery_bookings.order_id
  AND o.farmer_id IS NOT NULL
  AND has_role(auth.uid(), 'farmer'::app_role)
));

-- Bookings created via backend only (edge functions)
CREATE POLICY "Bookings created via backend only"
ON public.delivery_bookings FOR INSERT
WITH CHECK (false);

-- Trigger for updated_at
CREATE TRIGGER update_delivery_bookings_updated_at
BEFORE UPDATE ON public.delivery_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
