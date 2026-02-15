import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight } from "lucide-react";

const BuyerShopPanel = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <ShoppingBag className="h-12 w-12 mx-auto text-primary" />
            <h3 className="text-lg font-semibold">Browse the Marketplace</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Explore fresh produce from verified farmers across the Philippines. 
              Filter by category, organic status, and price range.
            </p>
            <Button asChild className="gap-2">
              <Link to="/shop">
                Go to Shop
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerShopPanel;
