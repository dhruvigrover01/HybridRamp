import { motion } from "framer-motion";
import { 
  Shield, 
  TrendingDown, 
  AlertTriangle, 
  Heart, 
  Clock, 
  FlaskConical,
  DollarSign,
  Award,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { HarmPreventionMetrics } from "@/store/safetyStore";

interface HarmPreventionPanelProps {
  metrics: HarmPreventionMetrics;
  compact?: boolean;
}

const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subtext,
  color 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  subtext?: string;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 rounded-xl bg-card border border-border"
  >
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
        )}
      </div>
    </div>
  </motion.div>
);

const HarmPreventionPanel = ({ metrics, compact = false }: HarmPreventionPanelProps) => {
  const hasActivity = metrics.riskyTradesPrevented > 0 || 
                      metrics.safetyGuidanceCount > 0 || 
                      metrics.totalValueProtected > 0;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Protection Stats</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {metrics.streakDaysWithoutRiskyTrade} day streak
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <p className="text-lg font-bold text-emerald-500">
              ${metrics.lossesAvoided.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Saved</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10">
            <p className="text-lg font-bold text-amber-500">
              {metrics.riskyTradesPrevented}
            </p>
            <p className="text-xs text-muted-foreground">Prevented</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10">
            <p className="text-lg font-bold text-blue-500">
              {metrics.safetyGuidanceCount}
            </p>
            <p className="text-xs text-muted-foreground">Guided</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-white">
                Protection Dashboard
              </h2>
              <p className="text-white/80 text-sm">
                How HybridRampX is keeping you safe
              </p>
            </div>
          </div>
          {metrics.streakDaysWithoutRiskyTrade > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-white">
                <Sparkles className="w-5 h-5" />
                <span className="text-2xl font-bold">{metrics.streakDaysWithoutRiskyTrade}</span>
              </div>
              <p className="text-white/80 text-xs">day safe streak</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-6">
        {!hasActivity ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">You're Protected</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              As you trade, we'll show you how our safety features are protecting your portfolio from risky decisions.
            </p>
          </div>
        ) : (
          <>
            {/* Hero Stat */}
            <div className="text-center mb-6 p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <p className="text-sm text-muted-foreground mb-1">Estimated Losses Avoided</p>
              <p className="text-4xl font-bold text-emerald-500">
                ${metrics.lossesAvoided.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Based on prevented high-risk trades
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <MetricCard
                icon={AlertTriangle}
                label="Risky Trades Prevented"
                value={metrics.riskyTradesPrevented}
                subtext="Trades we helped you avoid"
                color="bg-amber-500/20 text-amber-500"
              />
              <MetricCard
                icon={Heart}
                label="Safety Guidance"
                value={metrics.safetyGuidanceCount}
                subtext="Times we guided you"
                color="bg-rose-500/20 text-rose-500"
              />
              <MetricCard
                icon={FlaskConical}
                label="Practice Mode Saves"
                value={metrics.practiceModeSaves}
                subtext="Redirected to practice"
                color="bg-violet-500/20 text-violet-500"
              />
              <MetricCard
                icon={Clock}
                label="Time-Lock Interventions"
                value={metrics.timeLockInterventions}
                subtext="Cooling-off periods"
                color="bg-blue-500/20 text-blue-500"
              />
            </div>

            {/* Additional Stats */}
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium">Emotional Trading Blocked</p>
                    <p className="text-sm text-muted-foreground">
                      {metrics.emotionalTradingBlocked} times we paused trading
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Total Protected Value */}
            {metrics.totalValueProtected > 0 && (
              <div className="mt-4 p-4 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Value Protected</span>
                  </div>
                  <span className="font-bold text-lg">
                    ${metrics.totalValueProtected.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border bg-secondary/30">
        <p className="text-xs text-muted-foreground text-center">
          HybridRampX prioritizes your safety over trading volume. These metrics show how we're different.
        </p>
      </div>
    </motion.div>
  );
};

export default HarmPreventionPanel;

