import { categories } from "@/data/products";
import { Leaf, Apple, Egg, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  Leaf: <Leaf className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
  Apple: <Apple className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
  Egg: <Egg className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
  Package: <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
};

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <>
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200",
              isSelected
                ? "bg-primary text-primary-foreground shadow-glow-primary"
                : "glass-badge hover:bg-glass/80 backdrop-blur-sm"
            )}
          >
            {iconMap[category.icon]}
            <span className="hidden sm:inline">{category.name}</span>
            <span className="sm:hidden">{category.name.split(' ')[0]}</span>
          </button>
        );
      })}
    </>
  );
};

export default CategoryFilter;