import tomatoesImg from "@/assets/products/tomatoes.jpg";
import lettuceImg from "@/assets/products/lettuce.jpg";
import carrotsImg from "@/assets/products/carrots.jpg";
import eggsImg from "@/assets/products/eggs.jpg";
import strawberriesImg from "@/assets/products/strawberries.jpg";
import honeyImg from "@/assets/products/honey.jpg";

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

export const products: Product[] = [
  {
    id: "1",
    name: "Organic Heirloom Tomatoes",
    price: 4.99,
    unit: "lb",
    farmId: "farm1",
    farmName: "Green Valley Farm",
    image: tomatoesImg,
    category: "Vegetables",
    stock: 150,
    organic: true,
    description: "Vine-ripened heirloom tomatoes grown with love. Perfect for salads, sandwiches, or fresh eating.",
  },
  {
    id: "2",
    name: "Fresh Butter Lettuce",
    price: 3.49,
    unit: "head",
    farmId: "farm2",
    farmName: "Sunrise Organics",
    image: lettuceImg,
    category: "Vegetables",
    stock: 80,
    organic: true,
    description: "Crisp, tender butter lettuce harvested fresh daily. Grown without pesticides.",
  },
  {
    id: "3",
    name: "Rainbow Carrots Bundle",
    price: 5.99,
    unit: "bunch",
    farmId: "farm1",
    farmName: "Green Valley Farm",
    image: carrotsImg,
    category: "Vegetables",
    stock: 60,
    organic: true,
    description: "A colorful mix of orange, purple, and yellow carrots. Sweet and perfect for roasting.",
  },
  {
    id: "4",
    name: "Farm Fresh Eggs",
    price: 7.99,
    unit: "dozen",
    farmId: "farm3",
    farmName: "Happy Hen Homestead",
    image: eggsImg,
    category: "Dairy & Eggs",
    stock: 45,
    organic: true,
    description: "Free-range eggs from pasture-raised hens. Rich, golden yolks full of flavor.",
  },
  {
    id: "5",
    name: "Sweet Strawberries",
    price: 6.99,
    unit: "pint",
    farmId: "farm2",
    farmName: "Sunrise Organics",
    image: strawberriesImg,
    category: "Fruits",
    stock: 35,
    organic: true,
    description: "Hand-picked strawberries at peak ripeness. Bursting with natural sweetness.",
  },
  {
    id: "6",
    name: "Raw Wildflower Honey",
    price: 12.99,
    unit: "jar",
    farmId: "farm4",
    farmName: "Buzzy Bee Apiary",
    image: honeyImg,
    category: "Pantry",
    stock: 25,
    organic: true,
    description: "Pure, unfiltered honey from local wildflowers. A natural sweetener with health benefits.",
  },
];

export const farms: Farm[] = [
  {
    id: "farm1",
    name: "Green Valley Farm",
    owner: "Maria Santos",
    latitude: 14.5995,
    longitude: 120.9842,
    distance: 2.3,
    rating: 4.9,
    reviewCount: 128,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
    description: "Family-owned organic farm specializing in heirloom vegetables since 1985.",
    products: ["Tomatoes", "Carrots", "Peppers", "Squash"],
  },
  {
    id: "farm2",
    name: "Sunrise Organics",
    owner: "Juan Reyes",
    latitude: 14.6042,
    longitude: 120.9822,
    distance: 3.8,
    rating: 4.7,
    reviewCount: 94,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
    description: "Sustainable farming with a focus on leafy greens and berries.",
    products: ["Lettuce", "Spinach", "Strawberries", "Blueberries"],
  },
  {
    id: "farm3",
    name: "Happy Hen Homestead",
    owner: "Elena Cruz",
    latitude: 14.5890,
    longitude: 120.9900,
    distance: 5.1,
    rating: 4.8,
    reviewCount: 76,
    image: "https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=800",
    description: "Free-range poultry farm with the happiest hens in the region.",
    products: ["Eggs", "Chicken", "Duck Eggs"],
  },
  {
    id: "farm4",
    name: "Buzzy Bee Apiary",
    owner: "Pedro Mendoza",
    latitude: 14.6100,
    longitude: 120.9750,
    distance: 6.2,
    rating: 5.0,
    reviewCount: 52,
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800",
    description: "Artisanal honey and bee products from healthy, thriving hives.",
    products: ["Honey", "Beeswax", "Royal Jelly"],
  },
];

export const categories = [
  { id: "all", name: "All Products", icon: "Grid3X3" },
  { id: "vegetables", name: "Vegetables", icon: "Leaf" },
  { id: "fruits", name: "Fruits", icon: "Apple" },
  { id: "dairy", name: "Dairy & Eggs", icon: "Egg" },
  { id: "pantry", name: "Pantry", icon: "Package" },
];
