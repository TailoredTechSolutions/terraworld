import CouponsPanel from "@/components/business-centre/CouponsPanel";

const BCCoupons = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Coupons</h1>
      <p className="text-sm text-muted-foreground mt-1">Purchase, manage, and track your coupon packages</p>
    </div>
    <CouponsPanel />
  </div>
);

export default BCCoupons;
