import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  X,
  Shield,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeLockConfirmation } from "@/store/safetyStore";

interface TimeLockModalProps {
  isOpen: boolean;
  timeLock: TimeLockConfirmation | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const TimeLockModal = ({ isOpen, timeLock, onConfirm, onCancel }: TimeLockModalProps) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canConfirm, setCanConfirm] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen && timeLock) {
      setTimeRemaining(timeLock.cooldownSeconds);
      setCanConfirm(false);
      setProgress(0);

      const startTime = Date.now();
      const totalTime = timeLock.cooldownSeconds * 1000;

      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, totalTime - elapsed);
        const currentProgress = Math.min(100, (elapsed / totalTime) * 100);
        
        setTimeRemaining(Math.ceil(remaining / 1000));
        setProgress(currentProgress);

        if (remaining <= 0) {
          clearInterval(timer);
          setCanConfirm(true);
        }
      }, 100);

      return () => clearInterval(timer);
    }
  }, [isOpen, timeLock]);

  if (!timeLock) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-orange-500">
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-white">
                    Confirmation Cooldown
                  </h2>
                  <p className="text-white/80 text-sm">
                    Large trade protection
                  </p>
                </div>
              </div>
            </div>

            {/* Trade Details */}
            <div className="px-6 py-4 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trade</p>
                  <p className="font-semibold">
                    {timeLock.tradeDetails.type.toUpperCase()} {timeLock.tradeDetails.amount} {timeLock.tradeDetails.asset}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Value</p>
                  <p className="font-semibold text-lg">
                    ${timeLock.tradeDetails.usdValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="px-6 py-6">
              <div className="text-center mb-6">
                {/* Circular Progress */}
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-secondary"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      className="text-primary"
                      style={{
                        strokeDasharray: 352,
                        strokeDashoffset: 352 - (352 * progress) / 100,
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {canConfirm ? (
                      <CheckCircle className="w-12 h-12 text-emerald-500" />
                    ) : (
                      <span className="text-3xl font-mono font-bold">
                        {formatTime(timeRemaining)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground">
                  {canConfirm 
                    ? "You can now confirm your trade"
                    : "Please wait and review your trade"}
                </p>
              </div>

              {/* Risk Summary */}
              <div className="p-4 rounded-xl bg-secondary/50 mb-6">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Risk Summary
                </h4>
                <ul className="space-y-1">
                  {timeLock.riskSummary.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why This Cooldown */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-500">Why the wait?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Large trades benefit from a brief pause. This helps prevent impulsive decisions and gives you time to reconsider.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-border flex items-center gap-4">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel Trade
              </Button>
              <Button
                variant={canConfirm ? "hero" : "secondary"}
                onClick={onConfirm}
                disabled={!canConfirm}
                className="flex-1"
              >
                {canConfirm ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Trade
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Waiting...
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimeLockModal;

