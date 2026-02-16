import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Package, Search, Loader2, Check, X, Eye, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  is_organic: boolean | null;
  is_paused: boolean;
  image_url: string | null;
  farmer_id: string;
  created_at: string;
  farmer_name?: string;
}

const ProductApprovalPanel = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data: productsData, error } = await supabase
        .from("products")
        .select("*, farmers!products_farmer_id_fkey(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;

      setProducts((productsData || []).map((p: any) => ({
        ...p,
        farmer_name: p.farmers?.name || "Unknown",
      })));
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePause = async (productId: string, isPaused: boolean) => {
    const { error } = await supabase.from("products").update({ is_paused: !isPaused }).eq("id", productId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isPaused ? "Product Activated" : "Product Paused" });
      fetchProducts();
    }
  };

  const categories = [...new Set(products.map((p) => p.category))];
  const filtered = products.filter((p) => {
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.farmer_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCount = products.filter(p => !p.is_paused && p.stock > 0).length;
  const pausedCount = products.filter(p => p.is_paused).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{products.length}</p><p className="text-xs text-muted-foreground">Total Products</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-primary">{activeCount}</p><p className="text-xs text-muted-foreground">Active Listings</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-muted-foreground">{pausedCount}</p><p className="text-xs text-muted-foreground">Paused</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-destructive">{outOfStockCount}</p><p className="text-xs text-muted-foreground">Out of Stock</p></CardContent></Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" />Product Management</CardTitle>
              <CardDescription>Review, approve, and manage all marketplace products</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-[200px]" /></div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No products found</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><Image className="h-4 w-4 text-muted-foreground" /></div>
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.unit} • {product.is_organic ? "🌿 Organic" : ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{product.farmer_name}</TableCell>
                    <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                    <TableCell className="font-medium">₱{Number(product.price).toLocaleString()}</TableCell>
                    <TableCell>
                      {product.stock === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : (
                        <span>{product.stock} {product.unit}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.is_paused ? (
                        <Badge variant="secondary">Paused</Badge>
                      ) : product.stock === 0 ? (
                        <Badge variant="destructive">Unavailable</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => togglePause(product.id, product.is_paused)}>
                          {product.is_paused ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedProduct?.name}</DialogTitle></DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              {selectedProduct.image_url && <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-48 object-cover rounded-lg" />}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Farmer</p><p className="font-medium">{selectedProduct.farmer_name}</p></div>
                <div><p className="text-muted-foreground">Category</p><p className="font-medium">{selectedProduct.category}</p></div>
                <div><p className="text-muted-foreground">Base Price</p><p className="font-medium">₱{Number(selectedProduct.price).toLocaleString()}/{selectedProduct.unit}</p></div>
                <div><p className="text-muted-foreground">Stock</p><p className="font-medium">{selectedProduct.stock} {selectedProduct.unit}</p></div>
                <div><p className="text-muted-foreground">Organic</p><p className="font-medium">{selectedProduct.is_organic ? "Yes" : "No"}</p></div>
                <div><p className="text-muted-foreground">Status</p>{selectedProduct.is_paused ? <Badge variant="secondary">Paused</Badge> : <Badge variant="default">Active</Badge>}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedProduct && (
              <Button onClick={() => { togglePause(selectedProduct.id, selectedProduct.is_paused); setSelectedProduct(null); }}>
                {selectedProduct.is_paused ? "Activate Product" : "Pause Product"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductApprovalPanel;
