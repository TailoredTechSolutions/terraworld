import { useState, useEffect } from "react";
import { Award, ChevronRight, Lock, Check, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface Rank {
  id: string;
  rank_order: number;
  name: string;
  required_personal_bv: number;
  required_left_leg_bv: number;
  required_right_leg_bv: number;
  required_direct_referrals: number;
  binary_match_percent: number;
  matching_bonus_depth: number;
  daily_cap: number;
  badge_color: string;
}

interface RankProgressProps {
  userId: string;
  currentRankId?: string;
  personalBV: number;
  leftLegBV: number;
  rightLegBV: number;
  directReferrals: number;
}

const BADGE_COLORS: Record<string, string> = {
  gray: "bg-muted text-muted-foreground",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  slate: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const RankProgress = ({
  userId,
  currentRankId,
  personalBV,
  leftLegBV,
  rightLegBV,
  directReferrals,
}: RankProgressProps) => {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanks();
  }, []);

  const fetchRanks = async () => {
    try {
      const { data, error } = await supabase
        .from("ranks")
        .select("*")
        .order("rank_order", { ascending: true });

      if (error) throw error;
      setRanks(data || []);
    } catch (error) {
      console.error("Error fetching ranks:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentRank = ranks.find((r) => r.id === currentRankId) || ranks[0];
  const currentRankOrder = currentRank?.rank_order || 1;
  const nextRank = ranks.find((r) => r.rank_order === currentRankOrder + 1);

  // Calculate progress to next rank
  const calculateProgress = (current: number, required: number) => {
    if (required === 0) return 100;
    return Math.min((current / required) * 100, 100);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Rank & Career Path</CardTitle>
              <CardDescription>Your progression through the ranks</CardDescription>
            </div>
          </div>
          {currentRank && (
            <Badge className={BADGE_COLORS[currentRank.badge_color] || BADGE_COLORS.gray}>
              {currentRank.name}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Rank Benefits */}
        {currentRank && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h4 className="font-medium mb-2">Current Benefits</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-primary">{currentRank.binary_match_percent}%</p>
                <p className="text-xs text-muted-foreground">Binary Match</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{currentRank.matching_bonus_depth}</p>
                <p className="text-xs text-muted-foreground">Matching Depth</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">
                  ₱{currentRank.daily_cap.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Daily Cap</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress to Next Rank */}
        {nextRank && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Progress to {nextRank.name}</h4>
            </div>

            <div className="space-y-3">
              {/* Personal BV */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Personal BV</span>
                  <span>
                    {personalBV.toLocaleString()} / {nextRank.required_personal_bv.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={calculateProgress(personalBV, nextRank.required_personal_bv)}
                  className="h-2"
                />
              </div>

              {/* Left Leg BV */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Left Leg BV</span>
                  <span>
                    {leftLegBV.toLocaleString()} / {nextRank.required_left_leg_bv.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={calculateProgress(leftLegBV, nextRank.required_left_leg_bv)}
                  className="h-2"
                />
              </div>

              {/* Right Leg BV */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Right Leg BV</span>
                  <span>
                    {rightLegBV.toLocaleString()} / {nextRank.required_right_leg_bv.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={calculateProgress(rightLegBV, nextRank.required_right_leg_bv)}
                  className="h-2"
                />
              </div>

              {/* Direct Referrals */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Direct Referrals</span>
                  <span>
                    {directReferrals} / {nextRank.required_direct_referrals}
                  </span>
                </div>
                <Progress
                  value={calculateProgress(directReferrals, nextRank.required_direct_referrals)}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Rank Ladder */}
        <div>
          <h4 className="font-medium mb-3">All Ranks</h4>
          <div className="space-y-2">
            {ranks.map((rank, index) => {
              const isCurrentRank = rank.id === currentRankId;
              const isAchieved = rank.rank_order <= currentRankOrder;
              const isNext = rank.rank_order === currentRankOrder + 1;

              return (
                <div
                  key={rank.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    isCurrentRank
                      ? "bg-primary/10 border-2 border-primary"
                      : isAchieved
                      ? "bg-muted/50"
                      : isNext
                      ? "bg-accent/5 border border-dashed border-accent"
                      : "bg-muted/20 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isAchieved
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isAchieved ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rank.name}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${BADGE_COLORS[rank.badge_color]}`}
                        >
                          Rank {rank.rank_order}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {rank.binary_match_percent}% binary • Depth {rank.matching_bonus_depth} •
                        Cap ₱{rank.daily_cap.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {isNext && (
                    <ChevronRight className="h-5 w-5 text-accent animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RankProgress;
