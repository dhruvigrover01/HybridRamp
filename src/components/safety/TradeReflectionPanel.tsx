import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Target,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ArrowRight,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradeReflection, WhatIfScenario } from "@/store/safetyStore";

interface TradeReflectionPanelProps {
  reflections: TradeReflection[];
  onGenerateReflection?: (tradeId: string) => void;
}

const getOutcomeColor = (outcome: string) => {
  switch (outcome) {
    case "better": return "text-emerald-500 bg-emerald-500/10";
    case "worse": return "text-red-500 bg-red-500/10";
    default: return "text-blue-500 bg-blue-500/10";
  }
};

const getOutcomeIcon = (outcome: string) => {
  switch (outcome) {
    case "better": return TrendingUp;
    case "worse": return TrendingDown;
    default: return Target;
  }
};

const TradeReflectionCard = ({ reflection }: { reflection: TradeReflection }) => {
  const [expanded, setExpanded] = useState(false);
  const trade = reflection.originalTrade;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            trade.type === "buy" ? "bg-emerald-500/20" : "bg-red-500/20"
          }`}>
            {trade.type === "buy" ? (
              <TrendingUp className={`w-5 h-5 ${trade.type === "buy" ? "text-emerald-500" : "text-red-500"}`} />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className="text-left">
            <p className="font-medium">
              {trade.type.toUpperCase()} {trade.amount} {trade.asset}
            </p>
            <p className="text-sm text-muted-foreground">
              @ ${trade.price.toLocaleString()} • {new Date(trade.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {reflection.scenarios.length} scenarios
          </span>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            {/* Insight */}
            <div className="px-4 py-3 bg-primary/5 border-b border-border">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-sm">{reflection.insight}</p>
              </div>
            </div>

            {/* Scenarios */}
            <div className="p-4 space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">
                WHAT-IF SCENARIOS
              </h4>
              
              {reflection.scenarios.map((scenario) => {
                const Icon = getOutcomeIcon(scenario.outcome);
                return (
                  <div
                    key={scenario.id}
                    className={`p-3 rounded-lg border ${getOutcomeColor(scenario.outcome)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <Icon className="w-4 h-4 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{scenario.label}</p>
                          <p className="text-xs opacity-80 mt-0.5">{scenario.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          scenario.difference >= 0 ? "text-emerald-500" : "text-red-500"
                        }`}>
                          {scenario.difference >= 0 ? "+" : ""}{scenario.percentageDiff.toFixed(1)}%
                        </p>
                        <p className="text-xs opacity-60">
                          ${Math.abs(scenario.difference).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const TradeReflectionPanel = ({ reflections, onGenerateReflection }: TradeReflectionPanelProps) => {
  if (reflections.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
          <History className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-heading font-semibold text-lg mb-2">
          Trade Reflection Simulator
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
          After you make trades, we'll show you "what if" scenarios to help you learn from every decision.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Reflections appear after trades</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-lg">
            Trade Reflections
          </h3>
          <p className="text-sm text-muted-foreground">
            Learn from your past decisions
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
          <Lightbulb className="w-4 h-4" />
          <span>{reflections.length} insights</span>
        </div>
      </div>

      {/* Reflections List */}
      <div className="space-y-3">
        {reflections.map((reflection) => (
          <TradeReflectionCard key={reflection.id} reflection={reflection} />
        ))}
      </div>
    </motion.div>
  );
};

export default TradeReflectionPanel;

