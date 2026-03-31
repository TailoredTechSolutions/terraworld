import RankActivationPanel from "@/components/business-centre/RankActivationPanel";

const BCRankActivation = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Rank & Activation</h1>
      <p className="text-sm text-muted-foreground mt-1">View your rank status and upgrade your package</p>
    </div>
    <RankActivationPanel />
  </div>
);

export default BCRankActivation;
