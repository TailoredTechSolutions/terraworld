import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StatusChip from "@/components/backoffice/StatusChip";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Package, Leaf, Loader2, Pause, Play, ImageIcon } from "lucide-react";
import ProductImageUploader from "./ProductImageUploader";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type ProductInsert = TablesInsert<"products">;
type ProductUpdate = TablesUpdate<"products">;

interface FarmerProductsPanelProps {
  farmerId: string;
}

const CATEGORIES = [
  "Vegetables", "Fruits", "Meat & Poultry", "Dairy & Eggs", "Pantry",
];

const UNITS = ["kg", "g", "piece", "pack", "bundle", "dozen", "liter", "ml"];

const initialFormState = {
  name: "",
  description: "",
  category: "Vegetables",
  price: "",
  unit: "kg",
  stock: "",
  image_url: "",
  is_organic: false,
  harvest_date: "",
  availability_start: "",
  availability_end: "",
  cutoff_time: "17:00",
};

const FarmerProductsPanel = ({ farmerId }: FarmerProductsPanelProps) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [showImageUploader, setShowImageUploader] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["farmer-products", farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase.from("products").insert(product).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["farmer-products", farmerId] });
      toast({ title: "Product created successfully" });
      handleCloseDialog();
      setShowImageUploader(data.id);
    },
    onError: (error) => {
      toast({ title: "Failed to create product", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, product }: { id: string; product: ProductUpdate }) => {
      const { data, error } = await supabase.from("products").update(product).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-products", farmerId] });
      toast({ title: "Product updated successfully" });
      handleCloseDialog();
    },
    onError: (error) => {
      toast({ title: "Failed to update product", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-products", farmerId] });
      toast({ title: "Product deleted successfully" });
      setIsDeleteDialogOpen(false);
      setDeletingProduct(null);
    },
    onError: (error) => {
      toast({ title: "Failed to delete product", description: error.message, variant: "destructive" });
    },
  });

  const togglePauseMutation = useMutation({
    mutationFn: async ({ id, is_paused }: { id: string; is_paused: boolean }) => {
      const { error } = await supabase.from("products").update({ is_paused } as ProductUpdate).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-products", farmerId] });
      toast({ title: "Product listing updated" });
    },
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      stock: product.stock.toString(),
      image_url: product.image_url || "",
      is_organic: product.is_organic || false,
      harvest_date: (product as any).harvest_date || "",
      availability_start: (product as any).availability_start || "",
      availability_end: (product as any).availability_end || "",
      cutoff_time: (product as any).cutoff_time?.substring(0, 5) || "17:00",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData(initialFormState);
  };

  const handleSubmit = () => {
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock, 10);

    if (!formData.name.trim()) {
      toast({ title: "Product name is required", variant: "destructive" });
      return;
    }
    if (isNaN(price) || price < 0) {
      toast({ title: "Please enter a valid price", variant: "destructive" });
      return;
    }
    if (isNaN(stock) || stock < 0) {
      toast({ title: "Please enter a valid stock quantity", variant: "destructive" });
      return;
    }

    const productData: any = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      category: formData.category,
      price,
      unit: formData.unit,
      stock,
      image_url: formData.image_url.trim() || null,
      is_organic: formData.is_organic,
      farmer_id: farmerId,
      harvest_date: formData.harvest_date || null,
      availability_start: formData.availability_start || null,
      availability_end: formData.availability_end || null,
      cutoff_time: formData.cutoff_time ? `${formData.cutoff_time}:00` : null,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, product: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  const getProductStatus = (product: Product): string => {
    if ((product as any).is_paused) return "paused";
    if (product.stock <= 0) return "out of stock";
    return "active";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Listings
            </CardTitle>
            <CardDescription>Manage your farm products and inventory</CardDescription>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts?.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              {searchQuery ? "No products found matching your search" : "No products yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery ? "Try a different search term" : "Add your first product to get started!"}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product) => {
                  const isPaused = (product as any).is_paused;
                  const isOutOfStock = product.stock <= 0;
                  return (
                    <TableRow key={product.id} className={isPaused ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              {product.name}
                              {product.is_organic && <Leaf className="h-3 w-3 text-green-600" />}
                            </div>
                            {product.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">{product.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={product.category} />
                      </TableCell>
                      <TableCell className="text-right">₱{product.price.toFixed(2)}/{product.unit}</TableCell>
                      <TableCell className="text-right">
                        <span className={isOutOfStock ? "text-destructive font-medium" : product.stock <= 10 ? "text-amber-600 font-medium" : ""}>
                          {product.stock} {product.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusChip status={getProductStatus(product)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={isPaused ? "Resume Listing" : "Pause Listing"}
                            onClick={() => togglePauseMutation.mutate({ id: product.id, is_paused: !isPaused })}
                          >
                            {isPaused ? <Play className="h-4 w-4 text-green-600" /> : <Pause className="h-4 w-4 text-amber-600" />}
                          </Button>
                          <Button variant="ghost" size="icon" title="Manage Photos" onClick={() => setShowImageUploader(showImageUploader === product.id ? null : product.id)}>
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setDeletingProduct(product); setIsDeleteDialogOpen(true); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        {showImageUploader === product.id && (
                          <div className="mt-3 text-left">
                            <ProductImageUploader productId={product.id} farmerId={farmerId} />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>{editingProduct ? "Update your product information" : "Add a new product to your listings"}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" placeholder="e.g., Fresh Strawberries" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your product..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (<SelectItem key={unit} value={unit}>{unit}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Base Price (₱) *</Label>
                <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Available Quantity *</Label>
                <Input id="stock" type="number" min="0" placeholder="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="harvest_date">Harvest Date</Label>
              <Input id="harvest_date" type="date" value={formData.harvest_date} onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="avail_start">Available From</Label>
                <Input id="avail_start" type="date" value={formData.availability_start} onChange={(e) => setFormData({ ...formData, availability_start: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="avail_end">Available Until</Label>
                <Input id="avail_end" type="date" value={formData.availability_end} onChange={(e) => setFormData({ ...formData, availability_end: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cutoff_time">Daily Cutoff Time</Label>
              <Input id="cutoff_time" type="time" value={formData.cutoff_time} onChange={(e) => setFormData({ ...formData, cutoff_time: e.target.value })} />
              <p className="text-xs text-muted-foreground">Orders placed after this time will be scheduled for the next day</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image_url">Cover Image URL</Label>
              <Input id="image_url" placeholder="https://example.com/image.jpg" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
              <p className="text-xs text-muted-foreground">You can add multiple photos after saving using the photo manager</p>
            </div>

            <div className="flex items-center gap-3">
              <Switch id="is_organic" checked={formData.is_organic} onCheckedChange={(checked) => setFormData({ ...formData, is_organic: checked })} />
              <Label htmlFor="is_organic" className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" /> Organic Product
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingProduct ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingProduct && deleteMutation.mutate(deletingProduct.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default FarmerProductsPanel;
