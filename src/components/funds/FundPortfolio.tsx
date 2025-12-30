import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw, PieChart, Calendar, Wallet, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FundInvestment, useFundsStore } from "@/store/fundsStore";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";

interface FundPortfolioProps {
  investments: FundInvestment[];
}

const FundPortfolio = ({ investments }: FundPortfolioProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rebalancing, setRebalancing] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  const { getFundById, rebalanceFund, withdrawFromFund } = useFundsStore();
  const { marketPrices } = useAppStore();

  const totalInvested = investments.reduce((sum, i) => sum + i.investedAmount, 0);
  const totalValue = investments.reduce((sum, i) => sum + i.currentValue, 0);
  const totalReturns = totalValue - totalInvested;
  const totalReturnsPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  const handleRebalance = async (investmentId: string) => {
    setRebalancing(investmentId);
    try {
      await rebalanceFund(investmentId, marketPrices);
      toast.success("Portfolio rebalanced successfully!");
    } catch (error) {
      toast.error("Failed to rebalance portfolio");
    } finally {
      setRebalancing(null);
    }
  };

  const handleWithdraw = async (investmentId: string) => {
    setWithdrawing(investmentId);
    try {
      const result = await withdrawFromFund(investmentId, marketPrices);
      toast.success(`Withdrawn $${result.amount.toFixed(2)} successfully!`);
    } catch (error) {
      toast.error("Failed to withdraw");
    } finally {
      setWithdrawing(null);
    }
  };

  if (investments.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-heading font-semibold mb-2">No Fund Investments Yet</h3>
        <p className="text-muted-foreground">
          Start investing in crypto funds to build your portfolio automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Fund Portfolio Summary
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-secondary">
            <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
            <p className="text-2xl font-heading font-bold">${totalInvested.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary">
            <p className="text-sm text-muted-foreground mb-1">Current Value</p>
            <p className="text-2xl font-heading font-bold">${totalValue.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary">
            <p className="text-sm text-muted-foreground mb-1">Total Returns</p>
            <p className={`text-2xl font-heading font-bold ${totalReturns >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {totalReturns >= 0 ? "+" : ""}${totalReturns.toFixed(2)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-secondary">
            <p className="text-sm text-muted-foreground mb-1">Return %</p>
            <p className={`text-2xl font-heading font-bold flex items-center gap-1 ${totalReturnsPercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {totalReturnsPercent >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {totalReturnsPercent >= 0 ? "+" : ""}{totalReturnsPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* Individual Investments */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-semibold">Your Investments</h3>
        {investments.map((investment, index) => {
          const fund = getFundById(investment.fundId);
          if (!fund) return null;

          const isExpanded = expandedId === investment.id;
          const isRebalancing = rebalancing === investment.id;
          const isWithdrawing = withdrawing === investment.id;

          return (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl overflow-hidden"
            >
              {/* Main Row */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : investment.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-xl">
                    {fund.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{fund.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Invested {new Date(investment.investedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold">${investment.currentValue.toFixed(2)}</p>
                    <p className={`text-sm ${investment.returns >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {investment.returns >= 0 ? "+" : ""}{investment.returns.toFixed(2)}%
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border"
                >
                  <div className="p-4 space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-secondary">
                        <p className="text-xs text-muted-foreground">Invested</p>
                        <p className="font-semibold">${investment.investedAmount.toFixed(2)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary">
                        <p className="text-xs text-muted-foreground">Current Value</p>
                        <p className="font-semibold">${investment.currentValue.toFixed(2)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary">
                        <p className="text-xs text-muted-foreground">P&L</p>
                        <p className={`font-semibold ${investment.returnsAmount >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {investment.returnsAmount >= 0 ? "+" : ""}${investment.returnsAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary">
                        <p className="text-xs text-muted-foreground">Shares</p>
                        <p className="font-semibold">{investment.shares.toFixed(4)}</p>
                      </div>
                    </div>

                    {/* Asset Breakdown */}
                    <div>
                      <p className="text-sm font-medium mb-2">Asset Breakdown</p>
                      <div className="space-y-2">
                        {investment.assetBreakdown.map((asset) => {
                          const currentPrice = marketPrices[asset.symbol]?.price || asset.purchasePrice;
                          const currentValue = asset.amount * currentPrice;
                          const pnl = currentValue - asset.value;
                          const pnlPercent = (pnl / asset.value) * 100;

                          return (
                            <div key={asset.symbol} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{asset.symbol}</span>
                                <span className="text-sm text-muted-foreground">
                                  {asset.amount.toFixed(6)}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${currentValue.toFixed(2)}</p>
                                <p className={`text-xs ${pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                  {pnl >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Last Rebalanced */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Last rebalanced: {new Date(investment.lastRebalanced).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRebalance(investment.id);
                        }}
                        disabled={isRebalancing}
                      >
                        {isRebalancing ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Rebalance
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWithdraw(investment.id);
                        }}
                        disabled={isWithdrawing}
                      >
                        {isWithdrawing ? "Withdrawing..." : "Withdraw All"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FundPortfolio;


