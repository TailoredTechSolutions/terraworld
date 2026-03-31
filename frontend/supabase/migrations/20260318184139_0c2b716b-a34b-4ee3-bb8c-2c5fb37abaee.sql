
-- ============================================================
-- PHASE 2: Marketplace Farms & Products Schema
-- Creates storefront farm catalog separate from farmer accounts
-- ============================================================

-- TABLE: farms (public storefront catalog)
CREATE TABLE public.farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  owner_name text,
  farm_type text,
  municipality text,
  province text,
  land_area_hectares numeric(10,2),
  elevation_meters integer,
  established_year integer,
  description text,
  image_url text,
  banner_url text,
  latitude double precision,
  longitude double precision,
  phone text,
  opening_hours text,
  delivery_fee_php numeric(10,2),
  delivery_eta_min integer,
  delivery_eta_max integer,
  delivery_available boolean DEFAULT true,
  pickup_available boolean DEFAULT false,
  rating numeric(3,2),
  review_count integer DEFAULT 0,
  distance_km numeric(10,1),
  certificate_code text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABLE: farm_certifications
CREATE TABLE public.farm_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  certification_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(farm_id, certification_name)
);

-- TABLE: farm_specialties
CREATE TABLE public.farm_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  specialty_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(farm_id, specialty_name)
);

-- TABLE: product_categories (storefront categories)
CREATE TABLE public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- TABLE: farm_catalog_products (storefront products per farm)
CREATE TABLE public.farm_catalog_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.product_categories(id) ON DELETE SET NULL,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  price numeric(10,2),
  unit text,
  stock_quantity integer DEFAULT 100,
  is_available boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(farm_id, slug)
);

-- INDEXES
CREATE INDEX idx_farms_slug ON public.farms(slug);
CREATE INDEX idx_farms_municipality ON public.farms(municipality, province);
CREATE INDEX idx_farm_catalog_products_farm_id ON public.farm_catalog_products(farm_id);
CREATE INDEX idx_farm_catalog_products_category_id ON public.farm_catalog_products(category_id);
CREATE INDEX idx_farm_catalog_products_available ON public.farm_catalog_products(is_available);
CREATE INDEX idx_farm_catalog_products_farm_available ON public.farm_catalog_products(farm_id, is_available);

-- TRIGGERS: updated_at
CREATE TRIGGER set_farms_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_farm_catalog_products_updated_at
  BEFORE UPDATE ON public.farm_catalog_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: Public read access for storefront
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_catalog_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read farms" ON public.farms FOR SELECT USING (true);
CREATE POLICY "Public read farm_certifications" ON public.farm_certifications FOR SELECT USING (true);
CREATE POLICY "Public read farm_specialties" ON public.farm_specialties FOR SELECT USING (true);
CREATE POLICY "Public read product_categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Public read farm_catalog_products" ON public.farm_catalog_products FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admin manage farms" ON public.farms FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage farm_certifications" ON public.farm_certifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage farm_specialties" ON public.farm_specialties FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage product_categories" ON public.product_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage farm_catalog_products" ON public.farm_catalog_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
