import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { Zap, CheckCircle2, ArrowRight, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface BuyCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cryptoOptions = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { symbol: "USDT", name: "Tether", icon: "$" },
  { symbol: "MATIC", name: "Polygon", icon: "⬡" },
];

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: "💳", fee: "2.5%" },
  { id: "bank", name: "Bank Transfer", icon: "🏦", fee: "0.5%" },
];

const BuyCryptoModal = ({ isOpen, onClose }: BuyCryptoModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0]);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [executing, setExecuting] = useState(false);
  const [executionPlan, setExecutionPlan] = useState<string[]>([]);

  const { executeTrade, user, marketPrices, isLoadingPrices } = useAppStore();

  // Get real-time price
  const currentPrice = marketPrices[selectedCrypto.symbol]?.price || 0;
  const priceChange = marketPrices[selectedCrypto.symbol]?.change24h || 0;
  const cryptoAmount = amount && currentPrice ? parseFloat(amount) / currentPrice : 0;

  // Get fee based on payment method
  const feePercent = paymentMethod === "card" ? 0.025 : 0.005;
  const fee = amount ? parseFloat(amount) * feePercent : 0;
  const total = amount ? parseFloat(amount) + fee : 0;

  const handleNext = () => {
    if (step === 1 && !amount) {
      toast.error("Please enter an amount");
      return;
    }
    if (step === 1 && parseFloat(amount) < 10) {
      toast.error("Minimum purchase is $10");
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleExecute = async () => {
    if (!amount) return;

    setExecuting(true);
    setStep(3);
    
    const result = await executeTrade(selectedCrypto.symbol, cryptoAmount, "buy");
    setExecutionPlan(result.executionPlan);
    
    if (result.success) {
      toast.success("Trade executed successfully!");
    } else if (result.warning) {
      toast.error(result.warning.message);
    }
    setExecuting(false);
  };

  const handleClose = () => {
    setStep(1);
    setAmount("");
    setExecutionPlan([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">Buy Crypto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${step > s ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Select Amount */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Select Cryptocurrency</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {cryptoOptions.map((crypto) => {
                      const price = marketPrices[crypto.symbol]?.price || 0;
                      const change = marketPrices[crypto.symbol]?.change24h || 0;
                      
                      return (
                        <button
                          key={crypto.symbol}
                          onClick={() => setSelectedCrypto(crypto)}
                          className={`p-3 rounded-xl border transition-all text-left ${
                            selectedCrypto.symbol === crypto.symbol
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{crypto.icon}</span>
                            <span className="text-sm font-medium">{crypto.symbol}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            ${price.toLocaleString()}
                          </p>
                          <p className={`text-xs ${change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Price Display */}
                <div className="p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Price</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${currentPrice.toLocaleString()}</span>
                      <span className={`flex items-center text-xs ${priceChange >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {priceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 h-12 bg-secondary border-border"
                      min="10"
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
                  {[50, 100, 250, 500].map((value) => (
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

                <Button variant="hero" className="w-full" onClick={handleNext}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="space-y-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                          paymentMethod === method.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{method.icon}</span>
                          <span className="font-medium">{method.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Fee: {method.fee}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                  <p className="text-sm font-medium">Order Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You pay</span>
                      <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fee ({paymentMethod === "card" ? "2.5%" : "0.5%"})</span>
                      <span className="font-medium">${fee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-medium">${total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You receive</span>
                      <span className="font-medium text-primary">{cryptoAmount.toFixed(8)} {selectedCrypto.symbol}</span>
                    </div>
                  </div>
                </div>

                {/* KYC Warning */}
                {user && user.kycTier < 2 && parseFloat(amount) > 500 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-500 font-medium">KYC Required</p>
                        <p className="text-xs text-muted-foreground">
                          Upgrade to Tier 2 KYC for purchases above $500
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button variant="hero" className="flex-1" onClick={handleExecute}>
                    <Zap className="w-4 h-4 mr-2" />
                    Buy {selectedCrypto.symbol}
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
                    executing ? "bg-primary/20 animate-pulse" : executionPlan.some(p => p.includes("✓")) ? "bg-primary/20" : "bg-amber-500/20"
                  }`}>
                    {executing ? (
                      <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ) : executionPlan.some(p => p.includes("✓ Trade completed")) ? (
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                    )}
                  </div>
                  <h3 className="font-heading font-semibold mt-4">
                    {executing ? "Processing Purchase..." : executionPlan.some(p => p.includes("✓ Trade completed")) ? "Purchase Complete!" : "Purchase Failed"}
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
                        <span className={step.includes("✓") ? "text-primary" : step.includes("⚠️") ? "text-amber-500" : "text-muted-foreground"}>
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
                  <Button variant="hero" className="w-full" onClick={handleClose}>
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

export default BuyCryptoModal;
