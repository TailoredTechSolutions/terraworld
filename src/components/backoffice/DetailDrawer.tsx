import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {(data.name || "U")[0]}
              </div>
              <div>
                <p className="font-semibold text-foreground">{data.name}</p>
                <p className="text-sm text-muted-foreground">{data.email}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Type:</span> <Badge variant="secondary">{data.type}</Badge></div>
              <div><span className="text-muted-foreground">Status:</span> <Badge variant={data.status === "active" ? "default" : "destructive"}>{data.status}</Badge></div>
              <div><span className="text-muted-foreground">KYC:</span> <Badge variant="outline">{data.kyc || "unverified"}</Badge></div>
              <div><span className="text-muted-foreground">Joined:</span> {data.created_at}</div>
            </div>
            <Separator />
            <h4 className="text-sm font-semibold">Activity Timeline</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Placed order ORD-2026-042 — 2h ago</p>
              <p>• Updated profile — 1d ago</p>
              <p>• Submitted KYC documents — 3d ago</p>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Suspend</Button>
              <Button variant="outline" size="sm">Reset Password</Button>
              <Button variant="outline" size="sm">Assign Role</Button>
            </div>
          </div>
        );

      case "order":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{data.order_number}</h3>
              <Badge>{data.status}</Badge>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Buyer:</span> {data.buyer}</div>
              <div><span className="text-muted-foreground">Farmer:</span> {data.farmer}</div>
              <div><span className="text-muted-foreground">Total:</span> ₱{data.total?.toLocaleString()}</div>
              <div><span className="text-muted-foreground">Payment:</span> <Badge variant="outline">{data.payment_status}</Badge></div>
            </div>
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
          </div>
        );

      case "ticket":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{data.ticket_number}</h3>
              <Badge variant={data.status === "open" ? "destructive" : "secondary"}>{data.status}</Badge>
            </div>
            <p className="text-sm text-foreground">{data.subject}</p>
            <Separator />
            <h4 className="text-sm font-semibold">Conversation</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {(data.messages || []).map((m: any, i: number) => (
                <div key={i} className={`p-2.5 rounded-lg text-xs ${m.sender === "user" ? "bg-muted/50" : "bg-primary/5 border border-primary/10"}`}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{m.sender === "user" ? "Customer" : "Admin"}</span>
                    <span className="text-muted-foreground">{m.time}</span>
                  </div>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm">Reply</Button>
              <Button variant="outline" size="sm">Refund</Button>
              <Button variant="outline" size="sm">Close</Button>
            </div>
          </div>
        );

      case "audit":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Audit Entry</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Actor:</span> {data.actor}</div>
              <div><span className="text-muted-foreground">Action:</span> <Badge variant="outline">{data.action}</Badge></div>
              <div><span className="text-muted-foreground">Entity:</span> {data.entity_type}</div>
              <div><span className="text-muted-foreground">Time:</span> {data.timestamp}</div>
            </div>
            {data.reason && (
              <>
                <Separator />
                <div><span className="text-sm text-muted-foreground">Reason:</span> <p className="text-sm">{data.reason}</p></div>
              </>
            )}
            {(data.before || data.after) && (
              <>
                <Separator />
                <h4 className="text-sm font-semibold">Change Diff</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-destructive/5 rounded border border-destructive/10">
                    <p className="font-medium text-destructive mb-1">Before</p>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(data.before, null, 2)}</pre>
                  </div>
                  <div className="p-2 bg-primary/5 rounded border border-primary/10">
                    <p className="font-medium text-primary mb-1">After</p>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(data.after, null, 2)}</pre>
                  </div>
                </div>
              </>
            )}
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
