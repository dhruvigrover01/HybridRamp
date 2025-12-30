import { motion } from "framer-motion";
import { 
  User, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Heart, 
  Shield, 
  BookOpen,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { BehaviorProfile, BehaviorTrait } from "@/store/safetyStore";

interface BehaviorProfileCardProps {
  profile: BehaviorProfile;
  compact?: boolean;
}

const getTraitIcon = (id: string) => {
  switch (id) {
    case "fomo": return TrendingUp;
    case "panic": return TrendingDown;
    case "overtrading": return Zap;
    case "risk_aware": return Shield;
    case "learner": return BookOpen;
    default: return User;
  }
};

const getTraitColor = (impact: string) => {
  switch (impact) {
    case "positive": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "negative": return "text-red-500 bg-red-500/10 border-red-500/20";
    default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
  }
};

const getFrequencyBadge = (frequency: string) => {
  switch (frequency) {
    case "frequent": return { label: "Frequent", color: "bg-red-500/20 text-red-500" };
    case "occasional": return { label: "Occasional", color: "bg-amber-500/20 text-amber-500" };
    default: return { label: "Rare", color: "bg-emerald-500/20 text-emerald-500" };
  }
};

const getRiskScoreColor = (score: number) => {
  if (score <= 30) return "text-emerald-500";
  if (score <= 50) return "text-blue-500";
  if (score <= 70) return "text-amber-500";
  return "text-red-500";
};

const getRiskScoreGradient = (score: number) => {
  if (score <= 30) return "from-emerald-500 to-green-400";
  if (score <= 50) return "from-blue-500 to-cyan-400";
  if (score <= 70) return "from-amber-500 to-yellow-400";
  return "from-red-500 to-orange-400";
};

const BehaviorProfileCard = ({ profile, compact = false }: BehaviorProfileCardProps) => {
  const positiveTraits = profile.traits.filter(t => t.impact === "positive");
  const negativeTraits = profile.traits.filter(t => t.impact === "negative");

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRiskScoreGradient(profile.riskScore)} flex items-center justify-center`}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{profile.label}</h3>
              <p className="text-xs text-muted-foreground">Trading Profile</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getRiskScoreColor(profile.riskScore)}`}>
              {profile.riskScore}
            </p>
            <p className="text-xs text-muted-foreground">Risk Score</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          {positiveTraits.length > 0 && (
            <span className="flex items-center gap-1 text-emerald-500">
              <CheckCircle className="w-4 h-4" />
              {positiveTraits.length} good
            </span>
          )}
          {negativeTraits.length > 0 && (
            <span className="flex items-center gap-1 text-red-500">
              <AlertCircle className="w-4 h-4" />
              {negativeTraits.length} to improve
            </span>
          )}
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
      <div className={`px-6 py-5 bg-gradient-to-r ${getRiskScoreGradient(profile.riskScore)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-white">
                {profile.label}
              </h2>
              <p className="text-white/80 text-sm">
                {profile.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-white">
              {profile.riskScore}
            </p>
            <p className="text-white/80 text-sm">Risk Score</p>
          </div>
        </div>
      </div>

      {/* Risk Score Bar */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Risk Level</span>
          <span className={getRiskScoreColor(profile.riskScore)}>
            {profile.riskScore <= 30 ? "Low Risk" 
              : profile.riskScore <= 50 ? "Moderate Risk"
              : profile.riskScore <= 70 ? "Elevated Risk"
              : "High Risk"}
          </span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${profile.riskScore}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${getRiskScoreGradient(profile.riskScore)} rounded-full`}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Safe</span>
          <span>Risky</span>
        </div>
      </div>

      {/* Traits */}
      <div className="p-6">
        {profile.traits.length === 0 ? (
          <div className="text-center py-8">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Make some trades to see your behavior profile
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              We'll analyze your patterns to help you improve
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">
              YOUR TRADING TRAITS
            </h3>
            <div className="space-y-3">
              {profile.traits.map((trait, index) => {
                const Icon = getTraitIcon(trait.id);
                const badge = getFrequencyBadge(trait.frequency);
                return (
                  <motion.div
                    key={trait.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border ${getTraitColor(trait.impact)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{trait.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-sm opacity-80 mt-1">{trait.description}</p>
                        </div>
                      </div>
                      <span className="text-sm opacity-60">
                        {trait.count}x
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Learning Progress */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Learning Progress</span>
            <span className="font-medium">{profile.learningProgress}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profile.learningProgress}%` }}
              className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BehaviorProfileCard;

