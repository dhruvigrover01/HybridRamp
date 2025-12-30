import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { ArrowUpRight, CheckCircle2, AlertCircle, Wallet } from "lucide-react";

interface SellCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SellCryptoModal = ({ isOpen, onClose }: SellCryptoModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [executing, setExecuting] = useState(false);
  const [executionPlan, setExecutionPlan] = useState<string[]>([]);

  const { assets, executeTrade, marketPrices } = useAppStore();

  const selectedAssetData = assets.find(a => a.symbol === selectedAsset);
  const currentPrice = selectedAsset ? marketPrices[selectedAsset]?.price || selectedAssetData?.price || 0 : 0;
  const cryptoAmount = amount && currentPrice ? parseFloat(amount) / currentPrice : 0;
  const maxSellValue = selectedAssetData ? selectedAssetData.balance * currentPrice : 0;

  const handleNext = () => {
    if (step === 1 && !selectedAsset) {
      toast.error("Please select an asset to sell");
      return;
    }
    if (step === 2 && !amount) {
      toast.error("Please enter an amount");
      return;
    }
    if (step === 2 && parseFloat(amount) > maxSellValue) {
      toast.error(`Maximum sell amount is $${maxSellValue.toFixed(2)}`);
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleExecute = async () => {
    if (!amount || !selectedAsset) return;

    setExecuting(true);
    setStep(3);
    
    const result = await executeTrade(selectedAsset, cryptoAmount, "sell");
    setExecutionPlan(result.executionPlan);
    
    if (result.success) {
      toast.success("Sell order executed successfully!");
    }
    setExecuting(false);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedAsset(null);
    setAmount("");
    setExecutionPlan([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-red-500" />
            Sell Crypto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? "bg-red-500 text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${step > s ? "bg-red-500" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Select Asset */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Label>Select Asset to Sell</Label>
                {assets.filter(a => a.balance > 0).length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No assets available to sell</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assets.filter(a => a.balance > 0).map((asset) => (
                      <button
                        key={asset.symbol}
                        onClick={() => setSelectedAsset(asset.symbol)}
                        className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                          selectedAsset === asset.symbol
                            ? "border-red-500 bg-red-500/10"
                            : "border-border hover:border-red-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <span className="font-bold">{asset.icon}</span>
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {asset.balance.toFixed(6)} {asset.symbol}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${asset.usdValue.toLocaleString()}</p>
                          <p className={`text-sm ${asset.change24h >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {asset.change24h >= 0 ? "+" : ""}{asset.change24h}%
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10" 
                  onClick={handleNext}
                  disabled={!selectedAsset}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 2: Enter Amount */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <span className="text-xs text-muted-foreground">
                      Max: ${maxSellValue.toFixed(2)}
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
                  {amount && (
                    <p className="text-sm text-muted-foreground">
                      ≈ {cryptoAmount.toFixed(6)} {selectedAsset}
                    </p>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <Button
                      key={percent}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setAmount((maxSellValue * percent / 100).toFixed(2))}
                    >
                      {percent}%
                    </Button>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You sell</span>
                    <span className="font-medium">{cryptoAmount.toFixed(6)} {selectedAsset}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You receive</span>
                    <span className="font-medium">${amount || "0"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-medium text-primary">$0 (Demo)</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-red-500 hover:bg-red-600" 
                    onClick={handleExecute}
                  >
                    Sell {selectedAsset}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Execution */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                    executing ? "bg-red-500/20 animate-pulse" : executionPlan.some(p => p.includes("✓")) ? "bg-red-500/20" : "bg-amber-500/20"
                  }`}>
                    {executing ? (
                      <span className="w-8 h-8 border-3 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    ) : executionPlan.some(p => p.includes("✓ Trade completed")) ? (
                      <CheckCircle2 className="w-8 h-8 text-red-500" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                    )}
                  </div>
                  <h3 className="font-heading font-semibold mt-4">
                    {executing ? "Processing Sale..." : "Sale Complete"}
                  </h3>
                </div>

                {/* Execution Log */}
                <div className="p-4 rounded-xl bg-secondary/50 max-h-48 overflow-y-auto">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Execution Log</p>
                  <div className="space-y-2">
                    {executionPlan.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.3 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className={step.includes("✓") ? "text-emerald-500" : step.includes("⚠️") ? "text-amber-500" : "text-muted-foreground"}>
                          {step.includes("✓") ? "✓" : step.includes("⚠️") ? "⚠️" : "→"}
                        </span>
                        <span className={step.includes("⚠️") ? "text-amber-500" : "text-foreground"}>
                          {step.replace("✓ ", "").replace("⚠️ ", "")}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {!executing && (
                  <Button className="w-full bg-red-500 hover:bg-red-600" onClick={handleClose}>
                    Done
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellCryptoModal;

