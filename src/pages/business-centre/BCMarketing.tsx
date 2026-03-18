import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Download } from "lucide-react";

const BCMarketing = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Marketing Tools</h1>
      <p className="text-sm text-muted-foreground mt-1">Download materials to grow your network</p>
    </div>

    <Card className="border-border/40">
      <CardHeader className="px-5 pt-4 pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> Marketing Assets</CardTitle>
        <CardDescription className="text-xs">Ready-to-use promotional materials</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { title: "Terra Farming Presentation", type: "PDF", size: "2.4 MB", downloads: 342 },
            { title: "Compensation Plan Overview", type: "PDF", size: "1.8 MB", downloads: 567 },
            { title: "Social Media Banner Pack", type: "ZIP", size: "8.2 MB", downloads: 189 },
            { title: "Email Swipe Templates", type: "ZIP", size: "512 KB", downloads: 94 },
            { title: "Product Catalog", type: "PDF", size: "5.1 MB", downloads: 423 },
            { title: "Video Testimonials", type: "MP4", size: "45 MB", downloads: 76 },
          ].map((asset) => (
            <div key={asset.title} className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors">
              <div>
                <p className="font-medium text-xs">{asset.title}</p>
                <p className="text-[10px] text-muted-foreground">{asset.type} • {asset.size} • {asset.downloads} downloads</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0"><Download className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default BCMarketing;
