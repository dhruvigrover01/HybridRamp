import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";

const PortfolioOverview = () => {
  const { assets, marketPrices, fetchMarketPrices, isLoadingPrices } = useAppStore();
  
  // Calculate values using real prices
  const assetsWithPrices = assets.map(asset => {
    const priceData = marketPrices[asset.symbol];
    const price = priceData?.price || asset.price;
    const change24h = priceData?.change24h || asset.change24h;
    const usdValue = asset.balance * price;
    
    return {
      ...asset,
      price,
      change24h,
      usdValue,
    };
  }).filter(asset => asset.balance > 0);
  
  const totalValue = assetsWithPrices.reduce((sum, asset) => sum + asset.usdValue, 0);
  const totalChange = assetsWithPrices.length > 0 
    ? assetsWithPrices.reduce((sum, asset) => sum + (asset.usdValue * asset.change24h / 100), 0) / totalValue * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold">Portfolio</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchMarketPrices()}
            disabled={isLoadingPrices}
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingPrices ? "animate-spin" : ""}`} />
          </Button>
          {totalValue > 0 && (
            <span className={`flex items-center gap-1 text-sm font-medium ${
              totalChange >= 0 ? "text-emerald-500" : "text-red-500"
            }`}>
              {totalChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {totalChange >= 0 ? "+" : ""}{totalChange.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Total Balance */}
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-1">Total Balance</p>
        <div className="text-4xl font-heading font-bold">
          ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-sm text-muted-foreground mt-1">USD</p>
      </div>

      {/* Asset List */}
      {assetsWithPrices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No assets in your portfolio yet</p>
          <p className="text-sm text-muted-foreground mt-1">Buy some crypto to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assetsWithPrices.map((asset, index) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  asset.symbol === "BTC" ? "bg-amber-500/20" :
                  asset.symbol === "ETH" ? "bg-blue-500/20" :
                  asset.symbol === "USDT" ? "bg-emerald-500/20" :
                  asset.symbol === "SOL" ? "bg-violet-500/20" :
                  "bg-muted"
                }`}>
                  <span className={`font-bold ${
                    asset.symbol === "BTC" ? "text-amber-500" :
                    asset.symbol === "ETH" ? "text-blue-500" :
                    asset.symbol === "USDT" ? "text-emerald-500" :
                    asset.symbol === "SOL" ? "text-violet-500" :
                    "text-foreground"
                  }`}>
                    {asset.icon}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{asset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {asset.balance.toFixed(asset.balance < 1 ? 6 : 4)} {asset.symbol}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${asset.usdValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-sm flex items-center justify-end gap-1 ${asset.change24h >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PortfolioOverview;
