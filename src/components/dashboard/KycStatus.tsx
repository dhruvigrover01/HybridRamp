import { motion } from "framer-motion";
import { CheckCircle2, Circle, ChevronRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { useState } from "react";
import { toast } from "sonner";

const tiers = [
  {
    tier: 1,
    name: "Basic",
    requirements: "Email & Phone verification",
    limits: "Up to $500/day",
  },
  {
    tier: 2,
    name: "Verified",
    requirements: "Government ID upload",
    limits: "Up to $5,000/day",
  },
  {
    tier: 3,
    name: "Premium",
    requirements: "Full KYC + Address proof",
    limits: "Unlimited",
  },
];

const KycStatus = () => {
  const user = useAppStore((state) => state.user);
  const updateKycTier = useAppStore((state) => state.updateKycTier);
  const [upgrading, setUpgrading] = useState(false);

  const currentTier = user?.kycTier || 0;

  const handleUpgrade = async (targetTier: number) => {
    if (targetTier <= currentTier) return;
    
    setUpgrading(true);
    // Simulate KYC verification
    await new Promise((resolve) => setTimeout(resolve, 2000));
    updateKycTier(targetTier as 0 | 1 | 2 | 3);
    toast.success(`KYC upgraded to Tier ${targetTier}!`);
    setUpgrading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-heading font-semibold">KYC Status</h3>
      </div>

      <div className="space-y-4">
        {tiers.map((tier, index) => {
          const isCompleted = currentTier >= tier.tier;
          const isNext = currentTier === tier.tier - 1;
          
          return (
            <div
              key={tier.tier}
              className={`p-4 rounded-xl transition-all ${
                isCompleted
                  ? "bg-primary/10 border border-primary/20"
                  : isNext
                  ? "bg-secondary border border-border"
                  : "bg-secondary/50 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Tier {tier.tier}: {tier.name}</p>
                    {isCompleted && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{tier.requirements}</p>
                  <p className="text-xs text-primary mt-1">{tier.limits}</p>
                  
                  {isNext && (
                    <Button
                      variant="hero"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => handleUpgrade(tier.tier)}
                      disabled={upgrading}
                    >
                      {upgrading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        <>
                          Upgrade Now
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default KycStatus;
