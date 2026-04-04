import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ImageUpload from "@/components/ImageUpload";
import {
  Leaf,
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  MapPin,
  Phone,
  Clock,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { farmerApi, FarmerStats, Product } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const FarmerManagementPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [farmerStats, setFarmerStats] = useState<FarmerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [farmId, setFarmId] = useState<string | null>(null);

  // Product form state
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    unit: "kg",
    category: "Vegetables",
    stock: "",
    organic: true,
    description: "",
    image: "/images/products/default.jpg",
  });
  const [saving, setSaving] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  // Demo: Use first farm as the farmer's farm
  const DEMO_FARM_ID = "saymayat-vegetable";

  const fetchData = async (id: string) => {
    try {
      const [stats, prods, ords] = await Promise.all([
        farmerApi.getStats(id),
        farmerApi.getProducts(id),
        farmerApi.getOrders(id),
      ]);
      setFarmerStats(stats);
      setProducts(prods);
      setOrders(ords);
    } catch (error) {
      console.error("Failed to fetch farmer data:", error);
      toast({
        title: "Error",
        description: "Failed to load farm data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // In real app, would get farm_id from user profile
    const savedFarmId = localStorage.getItem("terra_farmer_farm_id") || DEMO_FARM_ID;
    setFarmId(savedFarmId);
    fetchData(savedFarmId);
  }, [user]);

  const resetProductForm = () => {
    setProductForm({
      name: "",
      price: "",
      unit: "kg",
      category: "Vegetables",
      stock: "",
      organic: true,
      description: "",
      image: "/images/products/default.jpg",
    });
    setEditingProduct(null);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: String(product.price),
      unit: product.unit,
      category: product.category,
      stock: String(product.stock),
      organic: product.organic,
      description: product.description,
      image: product.image,
    });
    setShowProductDialog(true);
  };

  const handleSaveProduct = async () => {
    if (!farmId || !productForm.name || !productForm.price || !productForm.stock) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        unit: productForm.unit,
        category: productForm.category,
        stock: parseInt(productForm.stock),
        organic: productForm.organic,
        description: productForm.description,
        image: productForm.image,
      };

      if (editingProduct) {
        await farmerApi.updateProduct(farmId, editingProduct.id, productData);
        toast({ title: "Product updated successfully" });
      } else {
        await farmerApi.addProduct(farmId, productData as any);
        toast({ title: "Product added successfully" });
      }

      setShowProductDialog(false);
      resetProductForm();
      fetchData(farmId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!farmId || !deleteProductId) return;

    try {
      await farmerApi.deleteProduct(farmId, deleteProductId);
      toast({ title: "Product deleted successfully" });
      setDeleteProductId(null);
      fetchData(farmId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        {/* Farm Header */}
        {farmerStats && (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <Leaf className="h-7 w-7 text-primary" />
                  {farmerStats.farm.name}
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {farmerStats.farm.municipality}, {farmerStats.farm.province}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={farmerStats.farm.organic_certified ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                  {farmerStats.farm.organic_certified ? "Organic Certified" : "Standard"}
                </Badge>
                <Badge className="bg-primary/10 text-primary">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {farmerStats.farm.rating?.toFixed(1) || "5.0"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {farmerStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                    <p className="text-xl font-bold text-primary">₱{farmerStats.total_revenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                    <p className="text-xl font-bold">{farmerStats.total_orders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Products</p>
                    <p className="text-xl font-bold">{farmerStats.product_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Order</p>
                    <p className="text-xl font-bold">
                      ₱{farmerStats.total_orders > 0 ? (farmerStats.total_revenue / farmerStats.total_orders).toFixed(0) : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders ({orders.length})
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Manage Products</h2>
              <Button onClick={() => { resetProductForm(); setShowProductDialog(true); }} className="btn-liquid">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {products.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No products yet</p>
                  <Button onClick={() => { resetProductForm(); setShowProductDialog(true); }} className="mt-4">
                    Add Your First Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-video bg-secondary relative">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                      {product.organic && (
                        <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                          <Leaf className="h-3 w-3 mr-1" />
                          Organic
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <p className="text-lg font-bold text-primary">₱{product.price}/{product.unit}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={cn(
                          "font-medium",
                          product.stock < 10 ? "text-red-600" : "text-green-600"
                        )}>
                          Stock: {product.stock} {product.unit}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteProductId(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            
            {orders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No orders yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.order_id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              order.order_status === "delivered" && "bg-green-500/10 text-green-600",
                              order.order_status === "pending" && "bg-yellow-500/10 text-yellow-600",
                              order.order_status === "out_for_delivery" && "bg-purple-500/10 text-purple-600",
                              order.order_status === "cancelled" && "bg-red-500/10 text-red-600"
                            )}>
                              {order.order_status.replace("_", " ").toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Order #{order.order_id.slice(0, 8)}
                            </span>
                          </div>
                          <p className="text-sm">
                            {order.items.map((i: any) => `${i.product_name} (×${i.quantity})`).join(", ")}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.delivery_address.city}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">₱{order.farm_subtotal.toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update your product details" : "Add a new product to your farm's inventory"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g., Fresh Cabbage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Dairy & Eggs">Dairy & Eggs</option>
                  <option value="Pantry">Pantry</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₱) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <select
                  id="unit"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={productForm.unit}
                  onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                >
                  <option value="kg">kg</option>
                  <option value="g">grams</option>
                  <option value="pc">piece</option>
                  <option value="bundle">bundle</option>
                  <option value="L">liter</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Describe your product..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="organic" className="flex items-center gap-2 cursor-pointer">
                <Leaf className="h-4 w-4 text-green-600" />
                Organic Product
              </Label>
              <Switch
                id="organic"
                checked={productForm.organic}
                onCheckedChange={(checked) => setProductForm({ ...productForm, organic: checked })}
              />
            </div>

            <ImageUpload
              label="Product Image"
              currentImage={productForm.image !== "/images/products/default.jpg" ? productForm.image : undefined}
              onUpload={(result) => setProductForm({ ...productForm, image: result.url })}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct} disabled={saving} className="btn-liquid">
              {saving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteProduct}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default FarmerManagementPage;
