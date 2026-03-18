import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FarmDetail {
  id: string;
  slug: string;
  name: string;
  owner_name: string | null;
  farm_type: string | null;
  municipality: string | null;
  province: string | null;
  land_area_hectares: number | null;
  elevation_meters: number | null;
  established_year: number | null;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  opening_hours: string | null;
  delivery_fee_php: number | null;
  delivery_eta_min: number | null;
  delivery_eta_max: number | null;
  delivery_available: boolean;
  pickup_available: boolean;
  rating: number | null;
  review_count: number;
  certificate_code: string | null;
  certifications: string[];
  specialties: string[];
}

export interface FarmProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  unit: string | null;
  stock_quantity: number;
  is_available: boolean;
  is_featured: boolean;
  category_name: string | null;
  category_slug: string | null;
}

export function useFarmBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["farm", slug],
    queryFn: async (): Promise<FarmDetail | null> => {
      if (!slug) return null;

      const { data: farm, error } = await supabase
        .from("farms")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error || !farm) return null;

      // Fetch certifications
      const { data: certs } = await supabase
        .from("farm_certifications")
        .select("certification_name")
        .eq("farm_id", farm.id);

      // Fetch specialties
      const { data: specs } = await supabase
        .from("farm_specialties")
        .select("specialty_name")
        .eq("farm_id", farm.id);

      return {
        ...farm,
        certifications: certs?.map((c) => c.certification_name) || [],
        specialties: specs?.map((s) => s.specialty_name) || [],
      };
    },
    enabled: !!slug,
  });
}

export function useFarmProducts(farmId: string | undefined) {
  return useQuery({
    queryKey: ["farm-products", farmId],
    queryFn: async (): Promise<FarmProduct[]> => {
      if (!farmId) return [];

      const { data, error } = await supabase
        .from("farm_catalog_products")
        .select(`
          id, slug, name, description, image_url, price, unit,
          stock_quantity, is_available, is_featured, sort_order,
          product_categories ( name, slug )
        `)
        .eq("farm_id", farmId)
        .eq("is_available", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching farm products:", error);
        return [];
      }

      return (data || []).map((p: any) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        image_url: p.image_url,
        price: p.price,
        unit: p.unit,
        stock_quantity: p.stock_quantity,
        is_available: p.is_available,
        is_featured: p.is_featured,
        category_name: p.product_categories?.name || null,
        category_slug: p.product_categories?.slug || null,
      }));
    },
    enabled: !!farmId,
  });
}

export function useAllFarms() {
  return useQuery({
    queryKey: ["farms-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farms")
        .select(`
          *,
          farm_certifications ( certification_name ),
          farm_specialties ( specialty_name )
        `)
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching farms:", error);
        return [];
      }

      return (data || []).map((f: any) => ({
        ...f,
        certifications: f.farm_certifications?.map((c: any) => c.certification_name) || [],
        specialties: f.farm_specialties?.map((s: any) => s.specialty_name) || [],
      }));
    },
  });
}
