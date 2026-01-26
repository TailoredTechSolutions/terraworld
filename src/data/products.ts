import lettuceImg from "@/assets/products/lettuce.jpg";
import carrotsImg from "@/assets/products/carrots.jpg";
import strawberriesImg from "@/assets/products/strawberries.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  farmId: string;
  farmName: string;
  image: string;
  category: string;
  stock: number;
  organic: boolean;
  description: string;
}

export interface Farm {
  id: string;
  name: string;
  owner: string;
  latitude: number;
  longitude: number;
  distance?: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  products: string[];
}

// Baguio/Benguet Highland Vegetables - Real market data
export const products: Product[] = [
  // Sunrise Organic (Baguio City) products
  {
    id: "1",
    name: "Cabbage (Repolyo)",
    price: 30.00,
    unit: "kg",
    farmId: "02acf12e-516a-4865-87ae-581c3d47dae7",
    farmName: "Sunrise Organic",
    image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800",
    category: "Vegetables",
    stock: 150,
    organic: true,
    description: "Fresh highland cabbage from Baguio. Crisp and sweet, perfect for salads and stir-fry. Farm wholesale price: ₱25-₱35/kg.",
  },
  {
    id: "2",
    name: "Chinese Cabbage",
    price: 140.00,
    unit: "kg",
    farmId: "02acf12e-516a-4865-87ae-581c3d47dae7",
    farmName: "Sunrise Organic",
    image: "https://images.unsplash.com/photo-1598030343246-eec71cb44cb6?w=800",
    category: "Vegetables",
    stock: 80,
    organic: true,
    description: "Tender Chinese cabbage (wombok) grown in Baguio highlands. Great for soups and stir-fries.",
  },
  {
    id: "3",
    name: "Baguio Beans",
    price: 160.00,
    unit: "kg",
    farmId: "02acf12e-516a-4865-87ae-581c3d47dae7",
    farmName: "Sunrise Organic",
    image: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=800",
    category: "Vegetables",
    stock: 60,
    organic: true,
    description: "Premium Baguio string beans. Crisp and flavorful, harvested at peak freshness. Best during cool season.",
  },
  {
    id: "4",
    name: "Broccoli",
    price: 38.00,
    unit: "kg",
    farmId: "02acf12e-516a-4865-87ae-581c3d47dae7",
    farmName: "Sunrise Organic",
    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800",
    category: "Vegetables",
    stock: 45,
    organic: true,
    description: "Fresh organic broccoli from Baguio highlands. Rich in nutrients, farm wholesale price: ₱35-₱40/kg.",
  },
  {
    id: "5",
    name: "Celery",
    price: 28.00,
    unit: "kg",
    farmId: "02acf12e-516a-4865-87ae-581c3d47dae7",
    farmName: "Sunrise Organic",
    image: "https://images.unsplash.com/photo-1580391564590-aeca65c5e2d3?w=800",
    category: "Vegetables",
    stock: 70,
    organic: true,
    description: "Aromatic Baguio celery. Perfect for soups, salads, and cooking. Farm price: ₱25-₱30/kg.",
  },
  {
    id: "6",
    name: "Potatoes",
    price: 46.00,
    unit: "kg",
    farmId: "02acf12e-516a-4865-87ae-581c3d47dae7",
    farmName: "Sunrise Organic",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82ber89?w=800",
    category: "Vegetables",
    stock: 200,
    organic: true,
    description: "Highland potatoes from Benguet farms. Excellent for any potato dish. Wholesale: ₱43-₱49/kg.",
  },
  // Mountain Fresh (La Trinidad, Benguet) products
  {
    id: "7",
    name: "Radish",
    price: 160.00,
    unit: "kg",
    farmId: "22dc8b21-8400-4de0-8bd0-014641004dec",
    farmName: "Mountain Fresh",
    image: "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=800",
    category: "Vegetables",
    stock: 90,
    organic: true,
    description: "Fresh Benguet radish. Crisp and slightly peppery, great for salads and pickling.",
  },
  {
    id: "8",
    name: "Korean Radish",
    price: 160.00,
    unit: "kg",
    farmId: "22dc8b21-8400-4de0-8bd0-014641004dec",
    farmName: "Mountain Fresh",
    image: "https://images.unsplash.com/photo-1585243416340-d90c1f09f8b3?w=800",
    category: "Vegetables",
    stock: 55,
    organic: true,
    description: "Large Korean radish (mu) from La Trinidad. Perfect for kimchi and soups.",
  },
  {
    id: "9",
    name: "Cauliflower",
    price: 12.00,
    unit: "kg",
    farmId: "22dc8b21-8400-4de0-8bd0-014641004dec",
    farmName: "Mountain Fresh",
    image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800",
    category: "Vegetables",
    stock: 65,
    organic: true,
    description: "White cauliflower from Benguet highlands. Mild and versatile. Farm price: ₱10-₱15/kg.",
  },
  {
    id: "10",
    name: "Sayote (Chayote)",
    price: 10.00,
    unit: "kg",
    farmId: "22dc8b21-8400-4de0-8bd0-014641004dec",
    farmName: "Mountain Fresh",
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800",
    category: "Vegetables",
    stock: 180,
    organic: true,
    description: "Fresh sayote from Benguet. Mild flavor, great for soups and stir-fries. Year-round availability.",
  },
  {
    id: "11",
    name: "Onion Leeks",
    price: 28.00,
    unit: "kg",
    farmId: "22dc8b21-8400-4de0-8bd0-014641004dec",
    farmName: "Mountain Fresh",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
    category: "Vegetables",
    stock: 50,
    organic: true,
    description: "Aromatic leeks from La Trinidad farms. Excellent for soups and garnishing. ₱25-₱30/kg.",
  },
  {
    id: "12",
    name: "Baguio Pechay",
    price: 35.00,
    unit: "kg",
    farmId: "22dc8b21-8400-4de0-8bd0-014641004dec",
    farmName: "Mountain Fresh",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
    category: "Vegetables",
    stock: 100,
    organic: true,
    description: "Tender Baguio pechay. Quick-cooking leafy green, perfect for stir-fries and soups.",
  },
  {
    id: "13",
    name: "Carrots",
    price: 55.00,
    unit: "kg",
    farmId: "22dc8b21-8400-4de0-8bd0-014641004dec",
    farmName: "Mountain Fresh",
    image: carrotsImg,
    category: "Vegetables",
    stock: 120,
    organic: true,
    description: "Sweet highland carrots from Benguet. Naturally sweet and crunchy.",
  },
  {
    id: "14",
    name: "Lettuce",
    price: 85.00,
    unit: "kg",
    farmId: "22dc8b21-8400-4de0-8bd0-014641004dec",
    farmName: "Mountain Fresh",
    image: lettuceImg,
    category: "Vegetables",
    stock: 40,
    organic: true,
    description: "Fresh iceberg and romaine lettuce from La Trinidad. Crisp and refreshing for salads.",
  },
  {
    id: "15",
    name: "Strawberries",
    price: 350.00,
    unit: "kg",
    farmId: "22dc8b21-8400-4de0-8bd0-014641004dec",
    farmName: "Mountain Fresh",
    image: strawberriesImg,
    category: "Fruits",
    stock: 25,
    organic: true,
    description: "Sweet La Trinidad strawberries. Seasonal highland fruit, locally grown.",
  },
];

// Highland farms from Baguio/Benguet region
export const farms: Farm[] = [
  {
    id: "02acf12e-516a-4865-87ae-581c3d47dae7",
    name: "Sunrise Organic",
    owner: "Juan Cruz",
    latitude: 16.4023,
    longitude: 120.596,
    rating: 4.9,
    reviewCount: 128,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
    description: "Sustainable highland farm in Baguio City specializing in temperate vegetables since 1998.",
    products: ["Cabbage", "Chinese Cabbage", "Baguio Beans", "Broccoli", "Celery", "Potatoes"],
  },
  {
    id: "22dc8b21-8400-4de0-8bd0-014641004dec",
    name: "Mountain Fresh",
    owner: "Ana Reyes",
    latitude: 16.4618,
    longitude: 120.5874,
    rating: 4.6,
    reviewCount: 94,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
    description: "La Trinidad farm growing premium Benguet vegetables and famous strawberries.",
    products: ["Radish", "Korean Radish", "Cauliflower", "Sayote", "Leeks", "Pechay", "Carrots", "Lettuce", "Strawberries"],
  },
  {
    id: "4e067b8e-a788-461b-b83e-234f750bc9bb",
    name: "Green Valley Farm",
    owner: "Maria Santos",
    latitude: 14.1153,
    longitude: 120.9621,
    rating: 4.8,
    reviewCount: 76,
    image: "https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=800",
    description: "Family-owned organic farm in Tagaytay specializing in highland produce.",
    products: ["Vegetables", "Herbs"],
  },
  {
    id: "58f7fccf-63af-4c79-b402-0c086dfbcab3",
    name: "Happy Hens Farm",
    owner: "Pedro Garcia",
    latitude: 13.7565,
    longitude: 121.0583,
    rating: 4.7,
    reviewCount: 52,
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800",
    description: "Free-range poultry and egg farm in Batangas with the happiest hens.",
    products: ["Eggs", "Chicken"],
  },
];

export const categories = [
  { id: "all", name: "All Products", icon: "Grid3X3" },
  { id: "vegetables", name: "Vegetables", icon: "Leaf" },
  { id: "fruits", name: "Fruits", icon: "Apple" },
  { id: "dairy", name: "Dairy & Eggs", icon: "Egg" },
  { id: "pantry", name: "Pantry", icon: "Package" },
];
