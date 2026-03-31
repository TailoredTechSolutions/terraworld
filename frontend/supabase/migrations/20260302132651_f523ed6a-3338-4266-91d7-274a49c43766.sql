
-- Create farm_products junction table for multi-farm product aggregation
CREATE TABLE public.farm_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  harvest_date DATE,
  is_organic BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  processing_time_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(farm_id, product_id)
);

-- Enable RLS
ALTER TABLE public.farm_products ENABLE ROW LEVEL SECURITY;

-- Everyone can view available farm products
CREATE POLICY "Farm products viewable by everyone"
  ON public.farm_products FOR SELECT
  USING (true);

-- Farmers can manage their own farm products
CREATE POLICY "Farmers can insert own farm products"
  ON public.farm_products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farmers f 
      WHERE f.id = farm_products.farm_id 
      AND f.email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY "Farmers can update own farm products"
  ON public.farm_products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM farmers f 
      WHERE f.id = farm_products.farm_id 
      AND f.email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY "Farmers can delete own farm products"
  ON public.farm_products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM farmers f 
      WHERE f.id = farm_products.farm_id 
      AND f.email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
    )
  );

-- Admins can manage all
CREATE POLICY "Admins can manage farm products"
  ON public.farm_products FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_farm_products_updated_at
  BEFORE UPDATE ON public.farm_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
