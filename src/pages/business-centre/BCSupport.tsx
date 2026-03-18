import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BCSupport = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Support</h1>
      <p className="text-sm text-muted-foreground mt-1">Get help with your Business Centre</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border-border/40">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-sm">Submit a Ticket</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-xs">Subject</Label>
            <Input id="subject" placeholder="Brief description of your issue" className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs">Category</Label>
            <Select>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="commission">Commission Issues</SelectItem>
                <SelectItem value="binary">Binary Tree / BV</SelectItem>
                <SelectItem value="payout">Payout & Withdrawals</SelectItem>
                <SelectItem value="membership">Membership / Package</SelectItem>
                <SelectItem value="tokens">Token Rewards</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs">Message</Label>
            <Textarea id="message" placeholder="Describe your issue..." rows={3} className="text-sm" />
          </div>
          <Button className="w-full h-9 text-sm">Submit Ticket</Button>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-xs">Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-2">
          {[
            { id: "#TK-1245", subject: "Binary volume not updating", date: "Feb 28", status: "Open" },
            { id: "#TK-1198", subject: "Withdrawal delayed", date: "Feb 20", status: "Resolved" },
            { id: "#TK-1142", subject: "Package upgrade question", date: "Feb 10", status: "Closed" },
          ].map((t, i) => (
            <div key={i} className="p-2.5 rounded-lg border border-border/30 flex items-center justify-between hover:bg-muted/20 transition-colors">
              <div>
                <p className="font-medium text-xs">{t.id} — {t.subject}</p>
                <p className="text-[10px] text-muted-foreground">{t.date}</p>
              </div>
              <Badge variant={t.status === "Open" ? "default" : t.status === "Resolved" ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">{t.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

export default BCSupport;
