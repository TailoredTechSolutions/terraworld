import { useQuery } from "@tanstack/react-query";
import { getProductImage } from "@/data/productImageMap";
import { productApi, farmApi, Product, Farm } from "@/services/api";

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

function computeDeliveryFee(distanceKm: number): number {
  const baseFee = 45;
  const perKm = 8;
  return Math.min(Math.round(baseFee + distanceKm * perKm), 250);
}

export function useAggregatedProducts() {
  return useQuery({
    queryKey: ["aggregated-products"],
    queryFn: async (): Promise<AggregatedProduct[]> => {
      // Fetch all products and farms from backend API
      const [products, farms] = await Promise.all([
        productApi.getAll(),
        farmApi.getAll(),
      ]);

      if (!products || products.length === 0) return [];

      // Create a map of farms by ID
      const farmsMap = new Map<string, Farm>(farms.map(f => [f.id, f]));

      // Group products by name to aggregate same products from different farms
      const aggregationMap = new Map<string, AggregatedProduct>();

      for (const product of products) {
        const farm = farmsMap.get(product.farm_id);
        
        const offer: FarmOffer = {
          farmProductId: product.id,
          farmId: product.farm_id,
          farmName: product.farm_name,
          farmRating: farm?.rating || null,
          farmLatitude: farm?.latitude || null,
          farmLongitude: farm?.longitude || null,
          farmMunicipality: farm?.municipality || "",
          farmCertificate: farm?.certificate || null,
          price: product.price,
          stockQuantity: product.stock,
          isOrganic: product.organic,
          harvestDate: null,
          processingTimeMinutes: 30,
          distanceKm: null,
          etaMinutes: null,
          deliveryFee: 50, // Default flat fee
        };

        // Use product name as the aggregation key
        const aggKey = product.name.toLowerCase().trim();

        if (!aggregationMap.has(aggKey)) {
          aggregationMap.set(aggKey, {
            productId: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            unit: product.unit,
            imageUrl: getProductImage(product.name, product.image),
            lowestPrice: offer.price,
            highestPrice: offer.price,
            farmCount: 1,
            totalStock: offer.stockQuantity,
            hasOrganic: offer.isOrganic,
            offers: [offer],
          });
        } else {
          const agg = aggregationMap.get(aggKey)!;
          agg.offers.push(offer);
          agg.farmCount = agg.offers.length;
          agg.lowestPrice = Math.min(agg.lowestPrice, offer.price);
          agg.highestPrice = Math.max(agg.highestPrice, offer.price);
          agg.totalStock += offer.stockQuantity;
          if (offer.isOrganic) agg.hasOrganic = true;
        }
      }

      // Sort offers within each product by price (lowest first)
      for (const agg of aggregationMap.values()) {
        agg.offers.sort((a, b) => a.price - b.price);
      }

      return Array.from(aggregationMap.values());
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}
