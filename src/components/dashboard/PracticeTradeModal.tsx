import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { FlaskConical, ArrowDownLeft, ArrowUpRight, Brain, AlertTriangle, Trophy, Lightbulb, TrendingUp, TrendingDown } from "lucide-react";

interface PracticeTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "buy" | "sell";
}

const cryptoOptions = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { symbol: "SOL", name: "Solana", icon: "◎" },
  { symbol: "MATIC", name: "Polygon", icon: "⬡" },
  { symbol: "DOGE", name: "Dogecoin", icon: "Ð" },
];

const PracticeTradeModal = ({ isOpen, onClose, defaultTab = "buy" }: PracticeTradeModalProps) => {
  const [tab, setTab] = useState<"buy" | "sell">(defaultTab);
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0]);
  const [amount, setAmount] = useState("");
  const [executing, setExecuting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: string;
    title: string;
    message: string;
  } | null>(null);

  const { 
    executePracticeTrade, 
    practicePortfolio, 
    marketPrices,
    fetchMarketPrices,
    isLoadingPrices
  } = useAppStore();

  // Get real price from market data
  const currentPrice = marketPrices[selectedCrypto.symbol]?.price || 0;
  const change24h = marketPrices[selectedCrypto.symbol]?.change24h || 0;
  const cryptoAmount = amount && currentPrice ? parseFloat(amount) / currentPrice : 0;

  // Get holdings for sell tab
  const holdings = practicePortfolio.assets.find(a => a.symbol === selectedCrypto.symbol);

  useEffect(() => {
    if (isOpen) {
      fetchMarketPrices();
    }
  }, [isOpen, fetchMarketPrices]);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (currentPrice === 0) {
      toast.error("Price data unavailable. Please try again.");
      return;
    }

    setExecuting(true);
    setFeedback(null);

    const result = await executePracticeTrade(
      selectedCrypto.symbol,
      cryptoAmount,
      tab,
      currentPrice
    );

    setFeedback({
      type: result.feedback.type,
      title: result.feedback.title,
      message: result.feedback.message,
    });

    if (result.success) {
      toast.success(`Practice ${tab} executed!`);
      setAmount("");
    } else {
      toast.error(result.feedback.title);
    }

    setExecuting(false);
  };

  const handleClose = () => {
    setAmount("");
    setFeedback(null);
    onClose();
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "praise":
        return <Trophy className="w-5 h-5" />;
      case "tip":
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getFeedbackColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-amber-500/20 border-amber-500/50 text-amber-500";
      case "praise":
        return "bg-emerald-500/20 border-emerald-500/50 text-emerald-500";
      case "tip":
        return "bg-blue-500/20 border-blue-500/50 text-blue-500";
      default:
        return "bg-primary/20 border-primary/50 text-primary";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-500" />
            Practice Trade
            <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">
              DEMO
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "buy" | "sell")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="gap-2">
              <ArrowDownLeft className="w-4 h-4" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Sell
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            {/* Crypto Selection */}
            <div className="space-y-2">
              <Label>Select Cryptocurrency</Label>
              <div className="grid grid-cols-5 gap-2">
                {cryptoOptions.map((crypto) => {
                  const price = marketPrices[crypto.symbol]?.price || 0;
                  return (
                    <button
                      key={crypto.symbol}
                      onClick={() => setSelectedCrypto(crypto)}
                      className={`p-2 rounded-xl border transition-all ${
                        selectedCrypto.symbol === crypto.symbol
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-lg">{crypto.icon}</span>
                      <p className="text-xs font-medium mt-1">{crypto.symbol}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Info */}
            <div className="p-3 rounded-xl bg-secondary/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Price</span>
                <div className="text-right">
                  {isLoadingPrices ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    <>
                      <span className="font-medium">${currentPrice.toLocaleString()}</span>
                      <span className={`ml-2 text-xs flex items-center gap-1 ${change24h >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Amount (USD)</Label>
                <span className="text-xs text-muted-foreground">
                  Available: ${practicePortfolio.fiatBalance.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 h-12 bg-secondary border-border"
                />
              </div>
              {amount && currentPrice > 0 && (
                <p className="text-sm text-muted-foreground">
                  ≈ {cryptoAmount.toFixed(8)} {selectedCrypto.symbol}
                </p>
              )}
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2">
              {[100, 500, 1000, 2500].map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setAmount(value.toString())}
                >
                  ${value}
                </Button>
              ))}
            </div>

            {/* Holdings (for sell) */}
            {tab === "sell" && holdings && (
              <div className="p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Holdings</span>
                  <span className="font-medium">
                    {holdings.balance.toFixed(6)} {selectedCrypto.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Value</span>
                  <span className="text-sm">
                    ${(holdings.balance * currentPrice).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {tab === "sell" && !holdings && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-500">
                  You don't have any {selectedCrypto.symbol} to sell. Buy some first!
                </p>
              </div>
            )}

            {/* AI Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-xl border ${getFeedbackColor(feedback.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFeedbackColor(feedback.type)}`}>
                      {getFeedbackIcon(feedback.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{feedback.title}</p>
                      <p className="text-sm opacity-80 mt-1">{feedback.message}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Execute Button */}
            <Button
              variant="hero"
              className={`w-full ${tab === "sell" ? "bg-red-500 hover:bg-red-600" : ""}`}
              onClick={handleTrade}
              disabled={executing || !amount || currentPrice === 0 || (tab === "sell" && !holdings)}
            >
              {executing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Executing...
                </span>
              ) : (
                <>
                  {tab === "buy" ? <ArrowDownLeft className="w-4 h-4 mr-2" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
                  {tab === "buy" ? "Buy" : "Sell"} {selectedCrypto.symbol}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This is a practice trade with virtual funds. No real money involved.
            </p>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PracticeTradeModal;
