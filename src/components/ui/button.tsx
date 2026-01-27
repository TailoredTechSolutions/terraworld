import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ripple-container",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Liquid Glass variants
        glass: "bg-glass backdrop-blur-glass border border-glass-border text-foreground hover:bg-glass/80 hover:-translate-y-0.5 shadow-glass",
        "glass-primary": "bg-primary/15 backdrop-blur-glass border border-primary/30 text-primary hover:bg-primary/25 hover:shadow-glow-primary hover:-translate-y-0.5",
        "glass-accent": "bg-accent/15 backdrop-blur-glass border border-accent/30 text-accent hover:bg-accent/25 hover:shadow-glow-accent hover:-translate-y-0.5",
        liquid: "btn-liquid",
        "liquid-accent": "btn-liquid-accent",
        "liquid-gold": "btn-liquid-gold",
        "liquid-outline": "btn-liquid-outline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        xl: "h-12 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// Determine ripple color based on variant
const getRippleClass = (variant: string | null | undefined): string => {
  switch (variant) {
    case "default":
    case "liquid":
      return "ripple-light";
    case "destructive":
    case "liquid-accent":
    case "glass-accent":
      return "ripple-light";
    case "liquid-gold":
      return "ripple-gold";
    case "outline":
    case "secondary":
    case "ghost":
    case "glass":
    case "glass-primary":
      return "ripple-primary";
    default:
      return "ripple-light";
  }
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  disableRipple?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disableRipple = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableRipple && !asChild) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement("span");
        ripple.className = `ripple ${getRippleClass(variant)}`;
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        ripple.addEventListener("animationend", () => {
          ripple.remove();
        });
      }

      onClick?.(event);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
