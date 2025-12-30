import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  Heart, 
  FlaskConical,
  X,
  TrendingDown,
  Zap,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafetyGateStatus, EmotionalPattern } from "@/store/safetyStore";

interface SafetyGateAlertProps {
  status: SafetyGateStatus;
  onSwitchToPractice: () => void;
  onDismiss?: () => void;
  onWaitComplete?: () => void;
}

const getPatternIcon = (type: string) => {
  switch (type) {
    case "consecutive_losses": return TrendingDown;
    case "rapid_trading": return Zap;
    case "increasing_amounts": return DollarSign;
    case "revenge_trading": return RefreshCw;
    default: return AlertTriangle;
  }
};

const getEmotionalStateColor = (state: string) => {
  switch (state) {
    case "calm": return "from-emerald-500 to-green-500";
    case "cautious": return "from-amber-500 to-yellow-500";
    case "risky": return "from-orange-500 to-red-400";
    case "dangerous": return "from-red-600 to-red-800";
    default: return "from-gray-500 to-gray-600";
  }
};

const getEmotionalStateLabel = (state: string) => {
  switch (state) {
    case "calm": return "Trading State: Calm";
    case "cautious": return "Trading State: Cautious";
    case "risky": return "Trading State: Elevated Risk";
    case "dangerous": return "Trading State: High Risk";
    default: return "Trading State: Unknown";
  }
};

// Compact Status Indicator
export const SafetyGateIndicator = ({ status }: { status: SafetyGateStatus }) => {
  if (status.emotionalState === "calm") return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getEmotionalStateColor(status.emotionalState)} text-white text-sm`}
    >
      <Heart className="w-4 h-4" />
      <span className="font-medium">
        {status.emotionalState === "cautious" ? "Take Care" 
          : status.emotionalState === "risky" ? "High Alert"
          : "Trading Paused"}
      </span>
    </motion.div>
  );
};

// Full Block Screen
export const SafetyGateBlockScreen = ({ 
  status, 
  onSwitchToPractice,
  onUnblock 
}: { 
  status: SafetyGateStatus;
  onSwitchToPractice: () => void;
  onUnblock?: () => void;
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (status.blockUntil) {
      const updateTimer = () => {
        const remaining = Math.max(0, new Date(status.blockUntil!).getTime() - Date.now());
        setTimeRemaining(Math.ceil(remaining / 1000));
        
        if (remaining <= 0 && onUnblock) {
          onUnblock();
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [status.blockUntil, onUnblock]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md text-center"
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 mx-auto flex items-center justify-center mb-6"
        >
          <Shield className="w-12 h-12 text-white" />
        </motion.div>

        {/* Title */}
        <h2 className="text-2xl font-heading font-bold mb-2">
          Trading Temporarily Paused
        </h2>
        <p className="text-muted-foreground mb-6">
          {status.blockReason || "We've detected patterns that suggest emotional trading. Take a break to protect your portfolio."}
        </p>

        {/* Timer */}
        {timeRemaining !== null && timeRemaining > 0 && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="font-mono text-xl font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              until trading resumes
            </p>
          </div>
        )}

        {/* Detected Patterns */}
        {status.recentPatterns.filter(p => p.detected).length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left">
            <h4 className="text-sm font-semibold text-red-500 mb-2">
              Detected Patterns
            </h4>
            <div className="space-y-2">
              {status.recentPatterns.filter(p => p.detected).map((pattern, index) => {
                const Icon = getPatternIcon(pattern.type);
                return (
                  <div key={index} className="flex items-center gap-2 text-sm text-red-400">
                    <Icon className="w-4 h-4" />
                    <span>{pattern.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={onSwitchToPractice}
          >
            <FlaskConical className="w-5 h-5 mr-2" />
            Switch to Practice Mode
          </Button>
          <p className="text-xs text-muted-foreground">
            Practice Mode lets you trade with virtual funds while you cool down
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Warning Banner
const SafetyGateAlert = ({ status, onSwitchToPractice, onDismiss }: SafetyGateAlertProps) => {
  if (status.emotionalState === "calm" || status.isBlocked) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`rounded-xl overflow-hidden border ${
          status.emotionalState === "dangerous" 
            ? "bg-red-500/10 border-red-500/30"
            : status.emotionalState === "risky"
            ? "bg-orange-500/10 border-orange-500/30"
            : "bg-amber-500/10 border-amber-500/30"
        }`}
      >
        {/* Header */}
        <div className={`px-4 py-3 bg-gradient-to-r ${getEmotionalStateColor(status.emotionalState)} flex items-center justify-between`}>
          <div className="flex items-center gap-2 text-white">
            <Heart className="w-5 h-5" />
            <span className="font-semibold">{getEmotionalStateLabel(status.emotionalState)}</span>
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className="p-1 rounded-full hover:bg-white/20">
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm mb-3">
            {status.emotionalState === "dangerous"
              ? "We strongly recommend pausing real trading. Your recent patterns suggest emotional decision-making."
              : status.emotionalState === "risky"
              ? "Your trading patterns show elevated risk. Consider slowing down or switching to Practice Mode."
              : "We've noticed some concerning patterns. Take a moment to review your strategy."}
          </p>

          {/* Patterns */}
          {status.recentPatterns.filter(p => p.detected).length > 0 && (
            <div className="space-y-2 mb-4">
              {status.recentPatterns.filter(p => p.detected).map((pattern, index) => {
                const Icon = getPatternIcon(pattern.type);
                return (
                  <div 
                    key={index} 
                    className={`flex items-center gap-2 text-sm ${
                      pattern.severity >= 3 ? "text-red-500" 
                        : pattern.severity >= 2 ? "text-orange-500"
                        : "text-amber-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{pattern.description}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action */}
          {status.redirectToPractice && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToPractice}
              className="w-full"
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              Switch to Practice Mode
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SafetyGateAlert;

