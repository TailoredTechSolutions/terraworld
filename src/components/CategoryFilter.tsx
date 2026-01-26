import { categories } from "@/data/products";
import { Leaf, Apple, Egg, Package, Beef, Bird } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  Leaf: <Leaf className="h-5 w-5" />,
  Apple: <Apple className="h-5 w-5" />,
  Beef: <Beef className="h-5 w-5" />,
  Bird: <Bird className="h-5 w-5" />,
  Egg: <Egg className="h-5 w-5" />,
  Package: <Package className="h-5 w-5" />,
};

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              isSelected
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {iconMap[category.icon]}
            {category.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
