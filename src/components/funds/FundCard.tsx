import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Shield, Zap, Leaf, Rocket, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CryptoFund } from "@/store/fundsStore";

interface FundCardProps {
  fund: CryptoFund;
  onInvest: (fund: CryptoFund) => void;
  delay?: number;
}

const riskColors = {
  low: "text-emerald-500 bg-emerald-500/20",
  medium: "text-amber-500 bg-amber-500/20",
  high: "text-red-500 bg-red-500/20",
};

const categoryIcons = {
  safe: Shield,
  growth: TrendingUp,
  beginner: Leaf,
  aggressive: Rocket,
};

const fundColors: Record<string, string> = {
  emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  green: "from-green-500/20 to-green-600/10 border-green-500/30",
  purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30",
};

const FundCard = ({ fund, onInvest, delay = 0 }: FundCardProps) => {
  const CategoryIcon = categoryIcons[fund.category] || TrendingUp;
  const colorClass = fundColors[fund.color] || fundColors.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`glass rounded-2xl p-6 border bg-gradient-to-br ${colorClass} hover:glow-sm transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center text-2xl">
            {fund.icon}
          </div>
          <div>
            <h3 className="font-heading font-semibold">{fund.name}</h3>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${riskColors[fund.riskLevel]}`}>
              <CategoryIcon className="w-3 h-3" />
              {fund.riskLevel.charAt(0).toUpperCase() + fund.riskLevel.slice(1)} Risk
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {fund.description}
      </p>

      {/* Asset Allocation */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Asset Allocation</p>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-secondary">
          {fund.assets.map((asset, index) => (
            <div
              key={asset.symbol}
              className={`h-full ${
                index === 0 ? "bg-primary" :
                index === 1 ? "bg-blue-500" :
                index === 2 ? "bg-amber-500" :
                index === 3 ? "bg-purple-500" :
                "bg-emerald-500"
              }`}
              style={{ width: `${asset.allocation}%` }}
              title={`${asset.symbol}: ${asset.allocation}%`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {fund.assets.map((asset, index) => (
            <span key={asset.symbol} className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${
                index === 0 ? "bg-primary" :
                index === 1 ? "bg-blue-500" :
                index === 2 ? "bg-amber-500" :
                index === 3 ? "bg-purple-500" :
                "bg-emerald-500"
              }`} />
              {asset.symbol} {asset.allocation}%
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 rounded-xl bg-background/30">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Historical Return</p>
          <p className={`font-semibold ${fund.historicalReturn >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {fund.historicalReturn >= 0 ? "+" : ""}{fund.historicalReturn}%
          </p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-xs text-muted-foreground">Volatility</p>
          <p className="font-semibold">{fund.volatility}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Mgmt Fee</p>
          <p className="font-semibold">{fund.managementFee}%</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Min Investment</p>
          <p className="font-semibold">${fund.minInvestment}</p>
        </div>
        <Button variant="hero" size="sm" onClick={() => onInvest(fund)}>
          Invest Now
        </Button>
      </div>
    </motion.div>
  );
};

export default FundCard;


