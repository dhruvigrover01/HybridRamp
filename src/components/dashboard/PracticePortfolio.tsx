import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, FlaskConical, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";

const PracticePortfolio = () => {
  const { practicePortfolio, resetPracticePortfolio, isPracticeMode } = useAppStore();
  
  if (!isPracticeMode) return null;

  const initialValue = 10000;
  const pnl = practicePortfolio.totalValue - initialValue;
  const pnlPercent = ((pnl / initialValue) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-6 border-2 border-amber-500/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-heading font-semibold">Practice Portfolio</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetPracticePortfolio}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Total Balance */}
      <div className="mb-6">
        <p className="text-muted-foreground text-sm mb-1">Virtual Balance</p>
        <div className="flex items-end gap-3">
          <div className="text-4xl font-heading font-bold">
            ${practicePortfolio.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className={`flex items-center gap-1 text-sm font-medium pb-1 ${
            pnl >= 0 ? "text-emerald-500" : "text-red-500"
          }`}>
            {pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {pnl >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          P&L: <span className={pnl >= 0 ? "text-emerald-500" : "text-red-500"}>
            {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
          </span>
        </p>
      </div>

      {/* Fiat Balance */}
      <div className="p-4 rounded-xl bg-secondary/50 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-500 font-bold">$</span>
            </div>
            <div>
              <p className="font-medium">USD (Virtual)</p>
              <p className="text-sm text-muted-foreground">Available to trade</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">
              ${practicePortfolio.fiatBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Asset List */}
      {practicePortfolio.assets.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Holdings</p>
          {practicePortfolio.assets.map((asset, index) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  asset.symbol === "BTC" ? "bg-amber-500/20" :
                  asset.symbol === "ETH" ? "bg-blue-500/20" :
                  "bg-muted"
                }`}>
                  <span className={`font-bold ${
                    asset.symbol === "BTC" ? "text-amber-500" :
                    asset.symbol === "ETH" ? "text-blue-500" :
                    "text-foreground"
                  }`}>
                    {asset.icon}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{asset.symbol}</p>
                  <p className="text-sm text-muted-foreground">
                    {asset.balance.toFixed(6)} @ ${asset.price.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${asset.usdValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-sm ${asset.change24h >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <p>No crypto holdings yet</p>
          <p className="text-sm">Start practicing by buying some crypto!</p>
        </div>
      )}
    </motion.div>
  );
};

export default PracticePortfolio;

