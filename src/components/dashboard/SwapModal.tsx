import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { RefreshCw, ArrowDown, CheckCircle2 } from "lucide-react";

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cryptoOptions = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { symbol: "USDT", name: "Tether", icon: "$" },
  { symbol: "MATIC", name: "Polygon", icon: "⬡" },
];

const SwapModal = ({ isOpen, onClose }: SwapModalProps) => {
  const [fromAsset, setFromAsset] = useState("BTC");
  const [toAsset, setToAsset] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [executing, setExecuting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { assets, marketPrices, addTransaction } = useAppStore();

  const fromAssetData = assets.find(a => a.symbol === fromAsset);
  const fromPrice = marketPrices[fromAsset]?.price || 0;
  const toPrice = marketPrices[toAsset]?.price || 0;
  
  const fromAmount = amount ? parseFloat(amount) : 0;
  const toAmount = fromPrice && toPrice ? (fromAmount * fromPrice) / toPrice : 0;
  const maxAmount = fromAssetData?.balance || 0;

  const handleSwapDirection = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setAmount("");
  };

  const handleExecute = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > maxAmount) {
      toast.error(`Insufficient ${fromAsset} balance`);
      return;
    }

    setExecuting(true);
    
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Add swap transaction
    addTransaction({
      type: "swap",
      asset: `${fromAsset}→${toAsset}`,
      amount: fromAmount,
      usdValue: fromAmount * fromPrice,
      status: "completed",
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...`,
    });

    setCompleted(true);
    setExecuting(false);
    toast.success("Swap completed successfully!");
  };

  const handleClose = () => {
    setAmount("");
    setCompleted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            Swap Crypto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!completed ? (
            <>
              {/* From Asset */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>From</Label>
                  <span className="text-xs text-muted-foreground">
                    Balance: {maxAmount.toFixed(6)} {fromAsset}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                  <div className="flex gap-2">
                    {cryptoOptions.map((crypto) => (
                      <button
                        key={crypto.symbol}
                        onClick={() => {
                          if (crypto.symbol !== toAsset) {
                            setFromAsset(crypto.symbol);
                          }
                        }}
                        disabled={crypto.symbol === toAsset}
                        className={`flex-1 p-2 rounded-lg border transition-all ${
                          fromAsset === crypto.symbol
                            ? "border-primary bg-primary/10"
                            : crypto.symbol === toAsset
                            ? "border-border opacity-50 cursor-not-allowed"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-sm">{crypto.icon}</span>
                        <p className="text-xs font-medium">{crypto.symbol}</p>
                      </button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 text-lg font-medium bg-transparent border-0 focus-visible:ring-0 p-0"
                  />
                  <p className="text-sm text-muted-foreground">
                    ≈ ${(fromAmount * fromPrice).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center -my-2">
                <button
                  onClick={handleSwapDirection}
                  className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-all"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>

              {/* To Asset */}
              <div className="space-y-2">
                <Label>To</Label>
                <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                  <div className="flex gap-2">
                    {cryptoOptions.map((crypto) => (
                      <button
                        key={crypto.symbol}
                        onClick={() => {
                          if (crypto.symbol !== fromAsset) {
                            setToAsset(crypto.symbol);
                          }
                        }}
                        disabled={crypto.symbol === fromAsset}
                        className={`flex-1 p-2 rounded-lg border transition-all ${
                          toAsset === crypto.symbol
                            ? "border-primary bg-primary/10"
                            : crypto.symbol === fromAsset
                            ? "border-border opacity-50 cursor-not-allowed"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-sm">{crypto.icon}</span>
                        <p className="text-xs font-medium">{crypto.symbol}</p>
                      </button>
                    ))}
                  </div>
                  <div className="h-12 flex items-center text-lg font-medium">
                    {toAmount.toFixed(6)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ≈ ${(toAmount * toPrice).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Exchange Rate */}
              <div className="p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="font-medium">
                    1 {fromAsset} = {(fromPrice / toPrice).toFixed(6)} {toAsset}
                  </span>
                </div>
              </div>

              {/* Execute Button */}
              <Button
                variant="hero"
                className="w-full"
                onClick={handleExecute}
                disabled={executing || !amount}
              >
                {executing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Swapping...
                  </span>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Swap {fromAsset} for {toAsset}
                  </>
                )}
              </Button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Swap Complete!</h3>
              <p className="text-muted-foreground mb-6">
                Successfully swapped {fromAmount} {fromAsset} for {toAmount.toFixed(6)} {toAsset}
              </p>
              <Button variant="hero" className="w-full" onClick={handleClose}>
                Done
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SwapModal;

