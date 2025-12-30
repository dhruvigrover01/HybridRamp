import { motion } from "framer-motion";
import { AlertTriangle, Shield, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/store/appStore";

const RiskTier = () => {
  const user = useAppStore((state) => state.user);
  const riskLevel = user?.riskLevel || "low";

  const getRiskConfig = (level: string) => {
    switch (level) {
      case "low":
        return {
          icon: ShieldCheck,
          color: "text-primary",
          bgColor: "bg-primary/20",
          label: "Low Risk",
          description: "Your account has been verified and shows healthy trading patterns.",
          factors: [
            { label: "KYC Verified", positive: true },
            { label: "Normal Trade Volume", positive: true },
            { label: "Secure Session", positive: true },
          ],
        };
      case "medium":
        return {
          icon: Shield,
          color: "text-warning",
          bgColor: "bg-warning/20",
          label: "Medium Risk",
          description: "Some factors require attention for full platform access.",
          factors: [
            { label: "KYC Pending", positive: false },
            { label: "Normal Trade Volume", positive: true },
            { label: "Secure Session", positive: true },
          ],
        };
      case "high":
        return {
          icon: AlertTriangle,
          color: "text-destructive",
          bgColor: "bg-destructive/20",
          label: "High Risk",
          description: "Your account requires additional verification.",
          factors: [
            { label: "KYC Required", positive: false },
            { label: "High Trade Volume", positive: false },
            { label: "New Session", positive: false },
          ],
        };
      default:
        return {
          icon: Shield,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          label: "Unknown",
          description: "Risk level could not be determined.",
          factors: [],
        };
    }
  };

  const config = getRiskConfig(riskLevel);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div>
          <h3 className="font-heading font-semibold">Risk Assessment</h3>
          <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{config.description}</p>

      <div className="space-y-2">
        {config.factors.map((factor, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <span className="text-sm text-muted-foreground">{factor.label}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              factor.positive
                ? "bg-primary/20 text-primary"
                : "bg-warning/20 text-warning"
            }`}>
              {factor.positive ? "✓" : "!"}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RiskTier;
