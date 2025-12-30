import { motion, AnimatePresence } from "framer-motion";
import { Brain, AlertTriangle, Lightbulb, Trophy, BarChart3, X, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const AICoachPanel = () => {
  const { aiInsights, tradingBehavior, clearInsights, isPracticeMode, progressionLevel } = useAppStore();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "tip":
        return <Lightbulb className="w-4 h-4" />;
      case "praise":
        return <Trophy className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "tip":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "praise":
        return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
      default:
        return "bg-primary/20 text-primary border-primary/30";
    }
  };

  if (!isPracticeMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold">AI Trading Coach</h3>
            <p className="text-xs text-muted-foreground">Learning from your trades</p>
          </div>
        </div>
        {aiInsights.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearInsights}>
            Clear All
          </Button>
        )}
      </div>

      {/* Behavior Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-secondary/50">
          <p className="text-2xl font-bold">{tradingBehavior.totalTrades}</p>
          <p className="text-xs text-muted-foreground">Total Trades</p>
        </div>
        <div className="p-3 rounded-xl bg-secondary/50">
          <p className="text-2xl font-bold text-amber-500">{tradingBehavior.fomoBuys}</p>
          <p className="text-xs text-muted-foreground">FOMO Buys</p>
        </div>
        <div className="p-3 rounded-xl bg-secondary/50">
          <p className="text-2xl font-bold text-red-500">{tradingBehavior.panicSells}</p>
          <p className="text-xs text-muted-foreground">Panic Sells</p>
        </div>
        <div className="p-3 rounded-xl bg-secondary/50">
          <p className={`text-2xl font-bold ${
            tradingBehavior.riskScore < 40 ? "text-emerald-500" : 
            tradingBehavior.riskScore < 60 ? "text-amber-500" : "text-red-500"
          }`}>
            {tradingBehavior.riskScore}
          </p>
          <p className="text-xs text-muted-foreground">Risk Score</p>
        </div>
      </div>

      {/* Progression Level */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progression Level</span>
          <span className="text-sm text-violet-400">Level {progressionLevel}/5</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(progressionLevel / 5) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {progressionLevel < 5 
            ? "Keep practicing to unlock real trading recommendations"
            : "🎉 You're ready for real trading with small limits!"}
        </p>
      </div>

      {/* Recent Insights */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Recent Insights</p>
        
        {aiInsights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Make some practice trades to get AI feedback</p>
          </div>
        ) : (
          <AnimatePresence>
            {aiInsights.slice(0, 5).map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getInsightColor(insight.type)}`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{insight.title}</p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {format(new Date(insight.timestamp), "h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default AICoachPanel;

