import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Shield, X, ChevronRight, Info } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";

const SafetyWarnings = () => {
  const { safetyWarnings, dismissWarning, user } = useAppStore();

  if (safetyWarnings.length === 0) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 border-red-500/30 text-red-500";
      case "medium":
        return "bg-amber-500/10 border-amber-500/30 text-amber-500";
      default:
        return "bg-blue-500/10 border-blue-500/30 text-blue-500";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="w-5 h-5" />;
      case "medium":
        return <Shield className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <AnimatePresence>
        {safetyWarnings.slice(0, 3).map((warning) => (
          <motion.div
            key={warning.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`p-4 rounded-xl border ${getSeverityColor(warning.severity)}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getSeverityColor(warning.severity)}`}>
                {getSeverityIcon(warning.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{warning.message}</p>
                {warning.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-8 px-3 text-xs"
                  >
                    {warning.action}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
              <button
                onClick={() => dismissWarning(warning.id)}
                className="p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default SafetyWarnings;

