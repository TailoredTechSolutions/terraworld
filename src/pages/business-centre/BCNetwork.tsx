import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const BCNetwork = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold font-display">Network</h1>
        <p className="text-sm text-muted-foreground mt-1">Direct Referrals: <span className="font-bold text-foreground">24</span> • Total Downline: <span className="font-bold text-foreground">142</span></p>
      </div>
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search members..." className="pl-9 h-9 text-sm" />
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Left Leg Total", value: "78" },
        { label: "Right Leg Total", value: "64" },
        { label: "Active Members", value: "118" },
        { label: "New This Month", value: "12" },
      ].map((s) => (
        <div key={s.label} className="text-center p-3 rounded-xl border border-border/40 bg-card">
          <p className="text-xl font-bold font-display">{s.value}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>

    <Card className="border-border/40">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs">Name</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs hidden sm:table-cell">Join Date</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs">Leg</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs">Package</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs hidden md:table-cell">Product BV</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Alex Rivera", date: "Jan 02", leg: "Left", pkg: "Pro", bv: "4,200", active: true },
                { name: "Maria Santos", date: "Jan 05", leg: "Right", pkg: "Elite", bv: "8,750", active: true },
                { name: "Daniel Cho", date: "Jan 10", leg: "Left", pkg: "Basic", bv: "1,800", active: true },
                { name: "Emily Cruz", date: "Jan 14", leg: "Right", pkg: "Basic", bv: "1,200", active: true },
                { name: "Jake Tan", date: "Jan 18", leg: "Left", pkg: "Starter", bv: "650", active: true },
                { name: "Sophia Lee", date: "Jan 22", leg: "Right", pkg: "Pro", bv: "3,100", active: true },
                { name: "Carlos Reyes", date: "Feb 01", leg: "Left", pkg: "Starter", bv: "320", active: false },
                { name: "Lena Park", date: "Feb 08", leg: "Right", pkg: "Free", bv: "0", active: false },
              ].map((m, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-xs">{m.name}</td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs hidden sm:table-cell">{m.date}</td>
                  <td className="py-2.5 px-4">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", m.leg === "Left" ? "border-emerald-500/40 text-emerald-600" : "border-blue-500/40 text-blue-600")}>
                      {m.leg}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge className={cn("text-[10px] px-1.5 py-0",
                      m.pkg === "Elite" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                      m.pkg === "Pro" && "bg-purple-500/10 text-purple-600 border-purple-500/30",
                      m.pkg === "Basic" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                      m.pkg === "Starter" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                      m.pkg === "Free" && "bg-muted text-muted-foreground",
                    )} variant="outline">{m.pkg}</Badge>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-xs hidden md:table-cell">{m.bv}</td>
                  <td className="py-2.5 px-4">
                    <Badge variant={m.active ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">{m.active ? "Active" : "Inactive"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default BCNetwork;
