-- Create enums for status types
CREATE TYPE public.farmer_status AS ENUM ('active', 'pending', 'suspended');
CREATE TYPE public.driver_status AS ENUM ('online', 'offline', 'delivering');
CREATE TYPE public.order_status AS ENUM ('pending', 'preparing', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE public.vehicle_type AS ENUM ('motorcycle', 'van', 'truck');

-- Create farmers table
CREATE TABLE public.farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating DECIMAL(2,1) DEFAULT 5.0,
  products_count INTEGER DEFAULT 0,
  total_sales DECIMAL(12,2) DEFAULT 0,
  status farmer_status DEFAULT 'pending',
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drivers table
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle vehicle_type NOT NULL DEFAULT 'motorcycle',
  license_plate TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 5.0,
  deliveries_count INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  status driver_status DEFAULT 'offline',
  current_location TEXT,
  current_latitude DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  delivery_latitude DOUBLE PRECISION,
  delivery_longitude DOUBLE PRECISION,
  farmer_id UUID REFERENCES public.farmers(id),
  driver_id UUID REFERENCES public.drivers(id),
  items JSONB NOT NULL DEFAULT '[]',
  items_count INTEGER NOT NULL DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status order_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  is_organic BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farmers (publicly readable for marketplace, admin can modify)
CREATE POLICY "Farmers are viewable by everyone" 
ON public.farmers FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create farmers" 
ON public.farmers FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update farmers" 
ON public.farmers FOR UPDATE 
TO authenticated
USING (true);

-- RLS Policies for drivers (publicly readable for tracking)
CREATE POLICY "Drivers are viewable by everyone" 
ON public.drivers FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create drivers" 
ON public.drivers FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update drivers" 
ON public.drivers FOR UPDATE 
TO authenticated
USING (true);

-- RLS Policies for orders (publicly readable for now, can be restricted later)
CREATE POLICY "Orders are viewable by everyone" 
ON public.orders FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders" 
ON public.orders FOR UPDATE 
TO authenticated
USING (true);

-- RLS Policies for products (publicly readable)
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create products" 
ON public.products FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" 
ON public.products FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete products" 
ON public.products FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_farmers_updated_at
BEFORE UPDATE ON public.farmers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
BEFORE UPDATE ON public.drivers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create trigger for order number generation
CREATE TRIGGER set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
EXECUTE FUNCTION public.generate_order_number();

-- Create indexes for better performance
CREATE INDEX idx_farmers_status ON public.farmers(status);
CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_farmer_id ON public.orders(farmer_id);
CREATE INDEX idx_orders_driver_id ON public.orders(driver_id);
CREATE INDEX idx_products_farmer_id ON public.products(farmer_id);
CREATE INDEX idx_products_category ON public.products(category);