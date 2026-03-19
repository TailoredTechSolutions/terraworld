import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserLocation, calculateDistance } from "@/hooks/useUserLocation";
import { getProductImage } from "@/data/productImageMap";

export interface FarmOffer {
  farmProductId: string;
  farmId: string;
  farmName: string;
  farmRating: number | null;
  farmLatitude: number | null;
  farmLongitude: number | null;
  farmMunicipality: string;
  farmCertificate: string | null;
  price: number;
  stockQuantity: number;
  isOrganic: boolean;
  harvestDate: string | null;
  processingTimeMinutes: number;
  distanceKm: number | null;
  etaMinutes: number | null;
  deliveryFee: number | null;
}

export interface AggregatedProduct {
  productId: string;
  name: string;
  description: string | null;
  category: string;
  unit: string;
  imageUrl: string | null;
  lowestPrice: number;
  highestPrice: number;
  farmCount: number;
  totalStock: number;
  hasOrganic: boolean;
  offers: FarmOffer[];
}

function computeETA(distanceKm: number, processingMinutes: number): number {
  const travelMinutes = (distanceKm / 25) * 60; // ~25km/h average
  const buffer = 15;
  return Math.round(processingMinutes + travelMinutes + buffer);
}

function computeDeliveryFee(distanceKm: number): number {
  const baseFee = 45;
  const perKm = 8;
  return Math.min(Math.round(baseFee + distanceKm * perKm), 250);
}

export function useAggregatedProducts() {
  const { location } = useUserLocation();

  return useQuery({
    queryKey: ["aggregated-products", location?.lat, location?.lng],
    queryFn: async (): Promise<AggregatedProduct[]> => {
      // Fetch all available farm products with their product and farm details
      const { data: farmProducts, error } = await supabase
        .from("farm_products" as any)
        .select(`
          id,
          farm_id,
          product_id,
          price,
          stock_quantity,
          is_organic,
          harvest_date,
          processing_time_minutes,
          is_available
        `)
        .eq("is_available", true);

      if (error) throw error;
      if (!farmProducts || farmProducts.length === 0) return [];

      // Get unique product IDs and farm IDs
      const productIds = [...new Set((farmProducts as any[]).map((fp: any) => fp.product_id))];
      const farmIds = [...new Set((farmProducts as any[]).map((fp: any) => fp.farm_id))];

      // Fetch products and farms in parallel
      const [productsRes, farmersRes] = await Promise.all([
        supabase.from("products").select("id, name, description, category, unit, image_url").in("id", productIds),
        supabase.from("farmers_public").select("id, name, rating, location").in("id", farmIds),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (farmersRes.error) throw farmersRes.error;

      const productsMap = new Map(productsRes.data.map(p => [p.id, p]));
      const farmersMap = new Map(farmersRes.data.map(f => [f.id, f]));

      // Aggregate by product
      const aggregationMap = new Map<string, AggregatedProduct>();

      for (const fp of (farmProducts as any[])) {
        const product = productsMap.get(fp.product_id);
        const farm = farmersMap.get(fp.farm_id);
        if (!product || !farm) continue;

        let distanceKm: number | null = null;
        let etaMinutes: number | null = null;
        let deliveryFee: number | null = null;

        // Coordinates removed from public view for security; distance features unavailable here

        const offer: FarmOffer = {
          farmProductId: fp.id,
          farmId: fp.farm_id,
          farmName: farm.name,
          farmRating: farm.rating,
          farmLatitude: null,
          farmLongitude: null,
          farmMunicipality: farm.location || "",
          farmCertificate: null,
          price: Number(fp.price),
          stockQuantity: fp.stock_quantity,
          isOrganic: fp.is_organic,
          harvestDate: fp.harvest_date,
          processingTimeMinutes: fp.processing_time_minutes || 30,
          distanceKm,
          etaMinutes,
          deliveryFee,
        };

        if (!aggregationMap.has(fp.product_id)) {
          aggregationMap.set(fp.product_id, {
            productId: fp.product_id,
            name: product.name,
            description: product.description,
            category: product.category,
            unit: product.unit,
            imageUrl: getProductImage(product.name, product.image_url),
            lowestPrice: offer.price,
            highestPrice: offer.price,
            farmCount: 1,
            totalStock: offer.stockQuantity,
            hasOrganic: offer.isOrganic,
            offers: [offer],
          });
        } else {
          const agg = aggregationMap.get(fp.product_id)!;
          agg.offers.push(offer);
          agg.farmCount = agg.offers.length;
          agg.lowestPrice = Math.min(agg.lowestPrice, offer.price);
          agg.highestPrice = Math.max(agg.highestPrice, offer.price);
          agg.totalStock += offer.stockQuantity;
          if (offer.isOrganic) agg.hasOrganic = true;
        }
      }

      // Sort offers within each product by distance (closest first), then price
      for (const agg of aggregationMap.values()) {
        agg.offers.sort((a, b) => {
          if (a.distanceKm !== null && b.distanceKm !== null) {
            return a.distanceKm - b.distanceKm;
          }
          return a.price - b.price;
        });
      }

      return Array.from(aggregationMap.values());
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}
