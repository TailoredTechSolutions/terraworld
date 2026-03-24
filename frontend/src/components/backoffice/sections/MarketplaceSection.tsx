import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DataTable from "../DataTable";
import StatusChip from "../StatusChip";
import { Search, CheckCircle, XCircle, Download, AlertTriangle } from "lucide-react";

const MOCK_PRODUCTS = [
  { id: "1", name: "Baguio Lettuce", farmer: "Aling Rosa", category: "Vegetables", price: 85, stock: 120, status: "approved", organic: true },
  { id: "2", name: "Arabica Coffee", farmer: "Kuya Ben", category: "Specialty", price: 450, stock: 45, status: "approved", organic: true },
  { id: "3", name: "Dragon Fruit", farmer: "Maria Santos", category: "Fruits", price: 180, stock: 3, status: "approved", organic: false },
  { id: "4", name: "Wild Honey", farmer: "Pedro Farm", category: "Specialty", price: 320, stock: 0, status: "approved", organic: true },
  { id: "5", name: "Muscovado Sugar", farmer: "Rosa Mendoza", category: "Processed", price: 95, stock: 200, status: "pending_approval", organic: false },
  { id: "6", name: "Tablea Chocolate", farmer: "Kuya Ben", category: "Processed", price: 75, stock: 150, status: "pending_approval", organic: true },
  { id: "7", name: "Fresh Eggs", farmer: "Ana Farm", category: "Poultry", price: 12, stock: 500, status: "rejected", organic: false },
];

const MOCK_CATEGORIES = [
  { id: "1", name: "Vegetables", products: 28, status: "active" },
  { id: "2", name: "Fruits", products: 22, status: "active" },
  { id: "3", name: "Specialty", products: 15, status: "active" },
  { id: "4", name: "Processed", products: 12, status: "active" },
  { id: "5", name: "Poultry & Eggs", products: 8, status: "active" },
  { id: "6", name: "Meat", products: 10, status: "active" },
  { id: "7", name: "Dairy", products: 6, status: "active" },
];

interface Props { openDrawer: (type: string, data: any) => void; }

const MarketplaceSection = ({ openDrawer }: Props) => {
  const [search, setSearch] = useState("");

  const pendingProducts = MOCK_PRODUCTS.filter(p => p.status === "pending_approval");
  const lowStock = MOCK_PRODUCTS.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStock = MOCK_PRODUCTS.filter(p => p.stock === 0);

  return (
    <div className="space-y-4">
      {/* Inventory flags */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs gap-1 px-2.5 py-1 border-yellow-300 bg-yellow-50 text-yellow-800">
          <AlertTriangle className="h-3 w-3" /> {pendingProducts.length} Pending Approval
        </Badge>
        <Badge variant="outline" className="text-xs gap-1 px-2.5 py-1 border-orange-300 bg-orange-50 text-orange-800">
          {lowStock.length} Low Stock
        </Badge>
        <Badge variant="outline" className="text-xs gap-1 px-2.5 py-1 border-red-300 bg-red-50 text-red-800">
          {outOfStock.length} Out of Stock
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="h-8">
          <TabsTrigger value="products" className="text-xs h-7">Products</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs h-7">Pending Approval ({pendingProducts.length})</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs h-7">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-3">
          <DataTable
            columns={[
              { key: "name", label: "Product" },
              { key: "farmer", label: "Farmer" },
              { key: "category", label: "Category" },
              { key: "price", label: "Price", render: (r) => `₱${r.price}` },
              { key: "stock", label: "Stock", render: (r) => (
                <span className={r.stock === 0 ? "text-red-500 font-medium" : r.stock <= 5 ? "text-orange-500" : ""}>{r.stock}</span>
              )},
              { key: "organic", label: "Organic", render: (r) => r.organic ? "🌿 Yes" : "No" },
              { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
            ]}
            data={MOCK_PRODUCTS.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))}
            onRowClick={(row) => openDrawer("product", row)}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-3">
          <div className="space-y-3">
            {pendingProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/60 gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">By {p.farmer} · ₱{p.price} · Category: {p.category}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" className="h-7 text-xs gap-1"><CheckCircle className="h-3 w-3" /> Approve</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive"><XCircle className="h-3 w-3" /> Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-3">
          <DataTable
            columns={[
              { key: "name", label: "Category" },
              { key: "products", label: "Products" },
              { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
            ]}
            data={MOCK_CATEGORIES}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplaceSection;
