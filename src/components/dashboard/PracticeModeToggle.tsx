import { motion } from "framer-motion";
import { FlaskConical, Zap, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/appStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const PracticeModeToggle = () => {
  const { isPracticeMode, togglePracticeMode, practicePortfolio } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl p-4 transition-all ${
        isPracticeMode 
          ? "bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-amber-500/50" 
          : "glass"
      }`}
    >
      {isPracticeMode && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 animate-pulse" />
      )}
      
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isPracticeMode ? "bg-amber-500/30" : "bg-secondary"
          }`}>
            {isPracticeMode ? (
              <FlaskConical className="w-5 h-5 text-amber-500" />
            ) : (
              <Zap className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {isPracticeMode ? "Practice Mode" : "Real Trading"}
              </span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    {isPracticeMode 
                      ? "Practice with $10,000 virtual funds. No real money involved. Perfect for learning!"
                      : "Real trading with actual funds. All transactions are final."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-xs text-muted-foreground">
              {isPracticeMode 
                ? `Virtual Balance: $${practicePortfolio.totalValue.toLocaleString()}`
                : "Live blockchain transactions"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isPracticeMode && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium">
              <FlaskConical className="w-3 h-3" />
              DEMO
            </span>
          )}
          <Switch
            checked={isPracticeMode}
            onCheckedChange={togglePracticeMode}
            className={isPracticeMode ? "data-[state=checked]:bg-amber-500" : ""}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PracticeModeToggle;

