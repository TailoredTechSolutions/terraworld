import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, UserPlus, Package, DollarSign, LifeBuoy, Wallet, Loader2,
} from "lucide-react";

type ModalType = "user" | "product" | "payout" | "ticket" | "adjustment" | null;

const AdminCreateActions = () => {
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── New User form state
  const [userForm, setUserForm] = useState({
    full_name: "", email: "", phone: "", role: "buyer", password: "",
  });

  // ── New Product form state
  const [productForm, setProductForm] = useState({
    name: "", category: "vegetables", price: "", stock: "", unit: "kg", description: "",
  });

  // ── New Payout Run
  const [payoutForm, setPayoutForm] = useState({
    period: new Date().toISOString().split("T")[0], user_type: "farmers", notes: "",
  });

  // ── New Ticket
  const [ticketForm, setTicketForm] = useState({
    subject: "", category: "general", priority: "normal", description: "",
  });

  // ── Manual Adjustment
  const [adjustForm, setAdjustForm] = useState({
    user_email: "", type: "credit", amount: "", reason: "",
  });

  const resetForms = () => {
    setUserForm({ full_name: "", email: "", phone: "", role: "buyer", password: "" });
    setProductForm({ name: "", category: "vegetables", price: "", stock: "", unit: "kg", description: "" });
    setPayoutForm({ period: new Date().toISOString().split("T")[0], user_type: "farmers", notes: "" });
    setTicketForm({ subject: "", category: "general", priority: "normal", description: "" });
    setAdjustForm({ user_email: "", type: "credit", amount: "", reason: "" });
  };

  const close = () => { setActiveModal(null); resetForms(); };

  // ── Handlers
  const handleCreateUser = async () => {
    if (!userForm.email || !userForm.full_name || !userForm.password) {
      toast({ title: "Missing fields", description: "Name, email & password are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: userForm.email,
        password: userForm.password,
        options: {
          data: {
            full_name: userForm.full_name,
            registration_role: userForm.role,
          },
        },
      });
      if (error) throw error;
      toast({ title: "User created", description: `${userForm.full_name} (${userForm.role}) added` });
      close();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleCreateProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast({ title: "Missing fields", description: "Name and price are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Get first active farmer to associate
      const { data: farmer } = await supabase.from("farmers").select("id").eq("status", "active").limit(1).single();
      if (!farmer) throw new Error("No active farmer found to associate product with");
      const { error } = await supabase.from("products").insert({
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock || "0"),
        unit: productForm.unit,
        description: productForm.description,
        farmer_id: farmer.id,
      });
      if (error) throw error;
      toast({ title: "Product created", description: `${productForm.name} added to listings` });
      close();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleCreatePayout = async () => {
    setSubmitting(true);
    try {
      // Insert audit log entry for payout run
      await supabase.from("audit_log").insert({
        action: "payout_run_initiated",
        entity_type: "payout",
        details: { period: payoutForm.period, user_type: payoutForm.user_type, notes: payoutForm.notes },
      });
      toast({ title: "Payout run initiated", description: `Payout for ${payoutForm.user_type} scheduled for ${payoutForm.period}` });
      close();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleCreateTicket = async () => {
    if (!ticketForm.subject) {
      toast({ title: "Missing fields", description: "Subject is required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        subject: ticketForm.subject,
        category: ticketForm.category,
        priority: ticketForm.priority,
      });
      if (error) throw error;
      toast({ title: "Ticket created", description: `"${ticketForm.subject}" added` });
      close();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleManualAdjustment = async () => {
    if (!adjustForm.user_email || !adjustForm.amount || !adjustForm.reason) {
      toast({ title: "Missing fields", description: "All fields are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Find user by email
      const { data: profile } = await supabase.from("profiles").select("user_id").eq("email", adjustForm.user_email).single();
      if (!profile) throw new Error("User not found with that email");

      const amount = parseFloat(adjustForm.amount) * (adjustForm.type === "debit" ? -1 : 1);
      const { error } = await supabase.rpc("post_wallet_entry", {
        p_user_id: profile.user_id,
        p_transaction_type: `manual_${adjustForm.type}`,
        p_amount: amount,
        p_description: adjustForm.reason,
      });
      if (error) throw error;

      // Audit log
      await supabase.from("audit_log").insert({
        action: "manual_adjustment",
        entity_type: "wallet",
        entity_id: profile.user_id,
        details: { type: adjustForm.type, amount: adjustForm.amount, reason: adjustForm.reason },
      });

      toast({ title: "Adjustment applied", description: `₱${adjustForm.amount} ${adjustForm.type} to ${adjustForm.user_email}` });
      close();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="gap-2 btn-primary-gradient">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setActiveModal("user")}>
            <UserPlus className="h-4 w-4 mr-2" /> New User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveModal("product")}>
            <Package className="h-4 w-4 mr-2" /> New Product
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveModal("payout")}>
            <DollarSign className="h-4 w-4 mr-2" /> New Payout Run
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveModal("ticket")}>
            <LifeBuoy className="h-4 w-4 mr-2" /> New Ticket
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveModal("adjustment")}>
            <Wallet className="h-4 w-4 mr-2" /> Manual Adjustment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── New User Modal ── */}
      <Dialog open={activeModal === "user"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new platform user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name *</Label><Input value={userForm.full_name} onChange={(e) => setUserForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Juan Dela Cruz" /></div>
            <div><Label>Email *</Label><Input type="email" value={userForm.email} onChange={(e) => setUserForm(p => ({ ...p, email: e.target.value }))} placeholder="juan@example.com" /></div>
            <div><Label>Phone</Label><Input value={userForm.phone} onChange={(e) => setUserForm(p => ({ ...p, phone: e.target.value }))} placeholder="+63 912 345 6789" /></div>
            <div>
              <Label>Role *</Label>
              <Select value={userForm.role} onValueChange={(v) => setUserForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Password *</Label><Input type="password" value={userForm.password} onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))} placeholder="Minimum 6 characters" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={handleCreateUser} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── New Product Modal ── */}
      <Dialog open={activeModal === "product"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>Add a product to the marketplace</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Product Name *</Label><Input value={productForm.name} onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))} placeholder="Fresh Tomatoes" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={productForm.category} onValueChange={(v) => setProductForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="meat">Meat</SelectItem>
                    <SelectItem value="grains">Grains</SelectItem>
                    <SelectItem value="specialty">Specialty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={productForm.unit} onValueChange={(v) => setProductForm(p => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="piece">piece</SelectItem>
                    <SelectItem value="crate">crate</SelectItem>
                    <SelectItem value="bundle">bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price (₱) *</Label><Input type="number" value={productForm.price} onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" /></div>
              <div><Label>Stock</Label><Input type="number" value={productForm.stock} onChange={(e) => setProductForm(p => ({ ...p, stock: e.target.value }))} placeholder="0" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={productForm.description} onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))} placeholder="Product description..." rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={handleCreateProduct} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── New Payout Run Modal ── */}
      <Dialog open={activeModal === "payout"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Payout Run</DialogTitle>
            <DialogDescription>Generate a payout cycle for platform users</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Payout Period</Label><Input type="date" value={payoutForm.period} onChange={(e) => setPayoutForm(p => ({ ...p, period: e.target.value }))} /></div>
            <div>
              <Label>User Type</Label>
              <Select value={payoutForm.user_type} onValueChange={(v) => setPayoutForm(p => ({ ...p, user_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmers">Farmers</SelectItem>
                  <SelectItem value="drivers">Drivers</SelectItem>
                  <SelectItem value="affiliates">Affiliates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Textarea value={payoutForm.notes} onChange={(e) => setPayoutForm(p => ({ ...p, notes: e.target.value }))} placeholder="Payout notes..." rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={handleCreatePayout} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Initiate Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── New Ticket Modal ── */}
      <Dialog open={activeModal === "ticket"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>Open a new support or internal ticket</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Subject *</Label><Input value={ticketForm.subject} onChange={(e) => setTicketForm(p => ({ ...p, subject: e.target.value }))} placeholder="Ticket subject" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={ticketForm.category} onValueChange={(v) => setTicketForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="order">Order Issue</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={ticketForm.priority} onValueChange={(v) => setTicketForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea value={ticketForm.description} onChange={(e) => setTicketForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the issue..." rows={4} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={handleCreateTicket} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Manual Adjustment Modal ── */}
      <Dialog open={activeModal === "adjustment"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Adjustment</DialogTitle>
            <DialogDescription>Credit or debit a user's wallet balance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>User Email *</Label><Input type="email" value={adjustForm.user_email} onChange={(e) => setAdjustForm(p => ({ ...p, user_email: e.target.value }))} placeholder="user@example.com" /></div>
            <div>
              <Label>Adjustment Type</Label>
              <Select value={adjustForm.type} onValueChange={(v) => setAdjustForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit (Add funds)</SelectItem>
                  <SelectItem value="debit">Debit (Remove funds)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Amount (₱) *</Label><Input type="number" value={adjustForm.amount} onChange={(e) => setAdjustForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" /></div>
            <div><Label>Reason *</Label><Textarea value={adjustForm.reason} onChange={(e) => setAdjustForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for adjustment..." rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={handleManualAdjustment} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminCreateActions;
