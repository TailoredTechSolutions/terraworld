
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (wrapped in DO block to handle duplicates)
DO $$
BEGIN
  -- SELECT policy
  BEGIN
    CREATE POLICY "Product images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  -- INSERT policy
  BEGIN
    CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  -- UPDATE policy
  BEGIN
    CREATE POLICY "Users can update own product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  -- DELETE policy
  BEGIN
    CREATE POLICY "Users can delete own product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Create product_images table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  BEGIN
    CREATE POLICY "Product images viewable by everyone" ON public.product_images FOR SELECT USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE POLICY "Farmers can insert own product images" ON public.product_images FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM products p WHERE p.id = product_images.product_id AND has_role(auth.uid(), 'farmer'::app_role)));
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE POLICY "Farmers can delete own product images" ON public.product_images FOR DELETE
    USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_images.product_id AND has_role(auth.uid(), 'farmer'::app_role)));
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Allow farmers to update their own farmer profile
DROP POLICY IF EXISTS "Farmers update denied until auth implemented" ON public.farmers;
DROP POLICY IF EXISTS "Farmers can update own profile" ON public.farmers;

CREATE POLICY "Farmers can update own profile"
ON public.farmers FOR UPDATE
USING (email = (SELECT email FROM profiles WHERE user_id = auth.uid() LIMIT 1));
