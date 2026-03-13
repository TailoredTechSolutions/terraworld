import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import StatusChip from "./StatusChip";
import type { DrawerState } from "@/pages/AdminBackOffice";

interface Props {
  state: DrawerState;
  onClose: () => void;
}

const DetailDrawer = ({ state, onClose }: Props) => {
  const { open, type, data } = state;

  const renderContent = () => {
    if (!data) return null;

    switch (type) {
      case "user":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                {(data.name || "U")[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground break-words">{data.name}</p>
                <p className="text-sm text-muted-foreground break-all">{data.email}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground block text-xs mb-0.5">Type</span> <Badge variant="secondary">{data.type}</Badge></div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">Status</span> <StatusChip status={data.status || "active"} /></div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">KYC</span> <StatusChip status={data.kyc || "unverified"} /></div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">Region</span> <span className="text-sm">{data.region || "—"}</span></div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">Joined</span> <span className="text-sm">{data.created_at}</span></div>
            </div>
            <Separator />
            <h4 className="text-sm font-semibold">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                {data.status === "suspended" ? "Reactivate" : "Suspend"}
              </Button>
              <Button variant="outline" size="sm">Reset Password</Button>
              <Button variant="outline" size="sm">Assign Role</Button>
              <Button variant="outline" size="sm">View Orders</Button>
            </div>
            <Separator />
            <h4 className="text-sm font-semibold">Activity Timeline</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Placed order ORD-2026-042 — 2h ago</p>
              <p>• Updated profile — 1d ago</p>
              <p>• Submitted KYC documents — 3d ago</p>
            </div>
          </div>
        );

      case "order":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-semibold break-all">{data.order_number}</h3>
              <StatusChip status={data.status} />
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Buyer</span><span className="font-medium break-words text-right">{data.buyer}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Farmer</span><span className="font-medium break-words text-right">{data.farmer}</span></div>
              {data.driver && data.driver !== "—" && (
                <div className="flex justify-between"><span className="text-muted-foreground">Driver</span><span className="font-medium">{data.driver}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">₱{data.total?.toLocaleString()}</span></div>
              {data.payment_status && (
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Payment</span><StatusChip status={data.payment_status} /></div>
              )}
              {data.delivery_status && (
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Delivery</span><StatusChip status={data.delivery_status} /></div>
              )}
              {data.zone && (
                <div className="flex justify-between"><span className="text-muted-foreground">Zone</span><span>{data.zone}</span></div>
              )}
              {data.date && (
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{data.date}</span></div>
              )}
            </div>
            {(data.subtotal || data.platform_fee) && (
              <>
                <Separator />
                <h4 className="text-sm font-semibold">Pricing Breakdown</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>Base Price</span><span>₱{data.subtotal?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Platform Fee</span><span>₱{data.platform_fee?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>₱{data.tax?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Transport</span><span>₱{data.delivery_fee?.toLocaleString()}</span></div>
                  <Separator />
                  <div className="flex justify-between font-semibold"><span>Total</span><span>₱{data.total?.toLocaleString()}</span></div>
                </div>
              </>
            )}
            <Separator />
            <h4 className="text-sm font-semibold">Order Actions</h4>
            <div className="flex flex-wrap gap-2">
              {data.status === "pending" && <Button size="sm">Mark Preparing</Button>}
              {data.status === "preparing" && <Button size="sm">Mark In Transit</Button>}
              {data.status === "in_transit" && <Button size="sm">Mark Delivered</Button>}
              {data.status !== "cancelled" && data.status !== "delivered" && (
                <Button variant="outline" size="sm" className="text-destructive">Cancel Order</Button>
              )}
              <Button variant="outline" size="sm">Assign Driver</Button>
              <Button variant="outline" size="sm">Contact Buyer</Button>
            </div>
          </div>
        );

      case "ticket":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-semibold">{data.ticket_number}</h3>
              <StatusChip status={data.status} />
            </div>
            <p className="text-sm text-foreground">{data.subject}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">User:</span> {data.user}</div>
              <div><span className="text-muted-foreground">Category:</span> {data.category}</div>
              <div><span className="text-muted-foreground">Priority:</span> <Badge variant={data.priority === "high" ? "destructive" : "secondary"} className="text-[10px]">{data.priority}</Badge></div>
              <div><span className="text-muted-foreground">Assigned:</span> {data.assigned}</div>
              <div><span className="text-muted-foreground">SLA:</span> {data.sla}</div>
              <div><span className="text-muted-foreground">Created:</span> {data.created}</div>
            </div>
            <Separator />
            <h4 className="text-sm font-semibold">Conversation</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {(data.messages || []).length === 0 ? (
                <p className="text-xs text-muted-foreground">No messages yet.</p>
              ) : (
                (data.messages || []).map((m: any, i: number) => (
                  <div key={i} className={`p-2.5 rounded-lg text-xs ${m.sender === "user" ? "bg-muted/50" : "bg-primary/5 border border-primary/10"}`}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{m.sender === "user" ? "Customer" : "Admin"}</span>
                      <span className="text-muted-foreground">{m.time}</span>
                    </div>
                    <p className="break-words">{m.text}</p>
                  </div>
                ))
              )}
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Reply</Button>
              {data.status === "open" && <Button variant="outline" size="sm">Escalate</Button>}
              <Button variant="outline" size="sm">Refund</Button>
              {data.status !== "closed" && <Button variant="outline" size="sm">Close Ticket</Button>}
            </div>
          </div>
        );

      case "audit":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Audit Entry</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground block text-xs mb-0.5">Actor</span> {data.actor}</div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">Action</span> <Badge variant="outline" className="capitalize">{data.action?.replace(/_/g, " ")}</Badge></div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">Entity</span> {data.entity_type}</div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">Entity ID</span> <span className="break-all">{data.entity_id}</span></div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">Time</span> {data.timestamp}</div>
              {data.ip && <div><span className="text-muted-foreground block text-xs mb-0.5">IP</span> {data.ip}</div>}
            </div>
            {data.reason && (
              <>
                <Separator />
                <div><span className="text-sm text-muted-foreground">Reason:</span> <p className="text-sm mt-0.5">{data.reason}</p></div>
              </>
            )}
            {(data.before || data.after) && (
              <>
                <Separator />
                <h4 className="text-sm font-semibold">Change Diff</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {data.before && (
                    <div className="p-2 bg-destructive/5 rounded border border-destructive/10">
                      <p className="font-medium text-destructive mb-1">Before</p>
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(data.before, null, 2)}</pre>
                    </div>
                  )}
                  {data.after && (
                    <div className="p-2 bg-primary/5 rounded border border-primary/10">
                      <p className="font-medium text-primary mb-1">After</p>
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(data.after, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );

      case "product":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">{data.name}</h3>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground block text-xs mb-0.5">Farmer</span> {data.farmer}</div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">Category</span> {data.category}</div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">Price</span> ₱{data.price}</div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">Stock</span> {data.stock}</div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">Organic</span> {data.organic ? "Yes 🌿" : "No"}</div>
              <div><span className="text-muted-foreground block text-xs mb-0.5">Status</span> <StatusChip status={data.status} /></div>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              {data.status === "pending_approval" && (
                <>
                  <Button size="sm">Approve</Button>
                  <Button variant="outline" size="sm" className="text-destructive">Reject</Button>
                </>
              )}
              <Button variant="outline" size="sm">Edit Product</Button>
              {data.stock === 0 && <Button variant="outline" size="sm">Notify Farmer</Button>}
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-muted-foreground">Details panel for: {type}</p>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[420px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="capitalize">{type} Details</SheetTitle>
          <SheetDescription>View and manage {type} information</SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DetailDrawer;
