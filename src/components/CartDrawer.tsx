import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore, CartItem } from "@/store/cartStore";
import { Minus, Plus, Trash2, ShoppingBag, Truck, Ticket } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const PLATFORM_FEE_RATE = 0.20;
const COMMISSION_RATE = 0.10;
const VAT_RATE = 0.12;

const CartItemRow = ({ item }: { item: CartItem }) => {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-4">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-glass-border glass-card">
        <img
          src={item.product.image}
          alt={item.product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <h4 className="font-medium text-foreground text-sm line-clamp-1">
              {item.product.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.product.farmName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive glass-hover rounded-lg"
            onClick={() => removeItem(item.product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 rounded-lg border border-glass-border glass-card p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 glass-hover rounded-md"
              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 glass-hover rounded-md"
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <span className="font-semibold text-primary">
            ₱{(item.product.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

const CartDrawer = () => {
  const navigate = useNavigate();
  const { isOpen, setCartOpen, items, couponItems, getTotalPrice, getCouponSubtotal, clearCart, removeCoupon, hasItems } = useCartStore();
  const farmerSubtotal = getTotalPrice();
  const couponSubtotal = getCouponSubtotal();
  const platformFee = farmerSubtotal * PLATFORM_FEE_RATE;
  const commission = farmerSubtotal * COMMISSION_RATE;
  const subtotalBeforeVAT = farmerSubtotal + platformFee + commission;
  const vat = subtotalBeforeVAT * VAT_RATE;
  const deliveryFee = farmerSubtotal > 0 ? 45 : 0;
  const total = subtotalBeforeVAT + vat + deliveryFee + couponSubtotal;

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md glass-card border-l border-glass-border bg-background/80 backdrop-blur-glass">
        <SheetHeader className="space-y-1 pb-4">
          <SheetTitle className="flex items-center gap-2 font-display text-xl">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="h-20 w-20 rounded-full glass-card flex items-center justify-center mb-4 shadow-glow-primary">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Browse our marketplace and add some fresh produce!
            </p>
            <Button
              className="mt-6 btn-liquid rounded-xl"
              onClick={() => setCartOpen(false)}
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6">
              <div className="divide-y divide-glass-border">
                {items.map((item) => (
                  <CartItemRow key={item.product.id} item={item} />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-glass-border space-y-4">
              {/* Delivery Estimate */}
              <div className="flex items-center gap-3 p-3 rounded-xl glass-card">
                <Truck className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Delivery in 45-60 min
                  </p>
                  <p className="text-xs text-muted-foreground">
                    From farms near you
                  </p>
                </div>
              </div>

              {/* Summary with full breakdown */}
              <div className="space-y-1.5 text-sm glass-card p-4 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Price</span>
                  <span className="font-medium">₱{farmerSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (20%)</span>
                  <span className="text-xs">₱{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission (10%)</span>
                  <span className="text-xs">₱{commission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (12%)</span>
                  <span className="text-xs">₱{vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Delivery</span>
                  <span className="text-xs">₱{deliveryFee.toFixed(2)}</span>
                </div>
                <Separator className="bg-glass-border" />
                <div className="flex justify-between text-base pt-1">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">₱{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  className="w-full btn-liquid-accent h-12 rounded-xl text-base font-semibold"
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/checkout");
                  }}
                >
                  Checkout — ₱{total.toFixed(2)}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-destructive glass-hover rounded-xl"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
