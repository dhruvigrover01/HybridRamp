import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap,
  Heart,
  DollarSign,
  X,
  ChevronRight,
  FlaskConical,
  Minus,
  Timer,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskExplanation, TradeAlternative } from "@/store/safetyStore";

interface WhyModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskExplanation: RiskExplanation | null;
  onProceed: () => void;
  onAlternative: (alternative: TradeAlternative) => void;
}

const getRiskIcon = (type: string) => {
  switch (type) {
    case "large_amount": return DollarSign;
    case "volatility": return TrendingUp;
    case "timing": return Clock;
    case "overtrading": return Zap;
    case "emotional": return Heart;
    case "fomo": return TrendingUp;
    case "panic": return TrendingDown;
    default: return AlertTriangle;
  }
};

const getRiskColor = (severity: string) => {
  switch (severity) {
    case "high": return "text-red-500 bg-red-500/10 border-red-500/20";
    case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
  }
};

const getOverallRiskColor = (risk: string) => {
  switch (risk) {
    case "critical": return "from-red-600 to-red-800";
    case "high": return "from-red-500 to-orange-500";
    case "medium": return "from-amber-500 to-yellow-500";
    default: return "from-emerald-500 to-green-500";
  }
};

const getAlternativeIcon = (action: string) => {
  switch (action) {
    case "reduce_amount": return Minus;
    case "wait": return Timer;
    case "practice_mode": return FlaskConical;
    case "dca": return Target;
    case "set_limit": return Target;
    default: return ChevronRight;
  }
};

const WhyModeModal = ({ isOpen, onClose, riskExplanation, onProceed, onAlternative }: WhyModeModalProps) => {
  const [countdown, setCountdown] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    if (isOpen && riskExplanation) {
      // Set countdown based on risk level
      const countdownTime = riskExplanation.overallRisk === "critical" ? 10 
        : riskExplanation.overallRisk === "high" ? 5 
        : 3;
      setCountdown(countdownTime);
      setCanProceed(false);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanProceed(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, riskExplanation]);

  if (!riskExplanation) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with risk level gradient */}
            <div className={`relative px-6 py-5 bg-gradient-to-r ${getOverallRiskColor(riskExplanation.overallRisk)}`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-white">
                    Wait — Let's Think About This
                  </h2>
                  <p className="text-white/80 text-sm">
                    {riskExplanation.overallRisk.charAt(0).toUpperCase() + riskExplanation.overallRisk.slice(1)} Risk Detected
                  </p>
                </div>
              </div>
            </div>

            {/* Trade Summary */}
            <div className="px-6 py-4 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Trade</p>
                  <p className="font-semibold">
                    {riskExplanation.tradeType.toUpperCase()} {riskExplanation.amount} {riskExplanation.asset}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Value</p>
                  <p className="font-semibold text-lg">
                    ${riskExplanation.usdValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Reasons */}
            <div className="px-6 py-4 max-h-64 overflow-y-auto">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                WHY THIS MIGHT BE RISKY
              </h3>
              <div className="space-y-3">
                {riskExplanation.reasons.map((reason, index) => {
                  const Icon = getRiskIcon(reason.type);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-xl border ${getRiskColor(reason.severity)}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{reason.title}</p>
                          <p className="text-sm opacity-80 mt-1">{reason.explanation}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Alternatives */}
            <div className="px-6 py-4 border-t border-border bg-secondary/20">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                SAFER ALTERNATIVES
              </h3>
              <div className="grid gap-2">
                {riskExplanation.alternatives.map((alt) => {
                  const Icon = getAlternativeIcon(alt.action);
                  return (
                    <button
                      key={alt.id}
                      onClick={() => onAlternative(alt)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{alt.label}</p>
                        <p className="text-sm text-muted-foreground">{alt.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel Trade
              </Button>
              <Button
                variant={canProceed ? "destructive" : "secondary"}
                onClick={onProceed}
                disabled={!canProceed}
                className="flex-1"
              >
                {canProceed ? (
                  "I Understand, Proceed"
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                      {countdown}
                    </span>
                    Read Above
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhyModeModal;

