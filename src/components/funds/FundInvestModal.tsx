import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, AlertCircle, Check, Loader2, PieChart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CryptoFund, useFundsStore } from "@/store/fundsStore";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";

interface FundInvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  fund: CryptoFund | null;
}

const FundInvestModal = ({ isOpen, onClose, fund }: FundInvestModalProps) => {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"input" | "confirm" | "processing" | "success">("input");
  
  const { investInFund, isInvesting } = useFundsStore();
  const { user, marketPrices } = useAppStore();

  if (!fund) return null;

  const numAmount = parseFloat(amount) || 0;
  const isValidAmount = numAmount >= fund.minInvestment;
  
  // Calculate allocation breakdown
  const allocationBreakdown = fund.assets.map(asset => {
    const allocationAmount = (numAmount * asset.allocation) / 100;
    const price = marketPrices[asset.symbol]?.price || 1;
    const cryptoAmount = allocationAmount / price;
    return {
      ...asset,
      usdAmount: allocationAmount,
      cryptoAmount,
      price,
    };
  });

  const handleInvest = async () => {
    if (!user || !isValidAmount) return;

    setStep("processing");

    try {
      await investInFund(fund.id, numAmount, user.id, marketPrices);
      setStep("success");
      toast.success(`Successfully invested $${numAmount.toLocaleString()} in ${fund.name}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Investment failed";
      toast.error(message);
      setStep("input");
    }
  };

  const handleClose = () => {
    setStep("input");
    setAmount("");
    onClose();
  };

  const quickAmounts = [100, 250, 500, 1000];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">
                  {fund.icon}
                </div>
                <div>
                  <h2 className="font-heading font-semibold">Invest in {fund.name}</h2>
                  <p className="text-sm text-muted-foreground">{fund.riskLevel} risk • {fund.managementFee}% fee</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {step === "input" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Investment Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={fund.minInvestment.toString()}
                        className="pl-8 h-14 text-xl font-semibold"
                        min={fund.minInvestment}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum investment: ${fund.minInvestment}
                    </p>
                  </div>

                  {/* Quick Amounts */}
                  <div className="flex gap-2">
                    {quickAmounts.map((qa) => (
                      <button
                        key={qa}
                        onClick={() => setAmount(qa.toString())}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          numAmount === qa
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        ${qa}
                      </button>
                    ))}
                  </div>

                  {/* Allocation Preview */}
                  {numAmount > 0 && (
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-2 mb-3">
                        <PieChart className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium">Allocation Preview</p>
                      </div>
                      <div className="space-y-2">
                        {allocationBreakdown.map((asset) => (
                          <div key={asset.symbol} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {asset.symbol} ({asset.allocation}%)
                            </span>
                            <span>
                              ${asset.usdAmount.toFixed(2)} ≈ {asset.cryptoAmount.toFixed(6)} {asset.symbol}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fund Info */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-primary mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-primary">About This Fund</p>
                        <p className="text-muted-foreground mt-1">{fund.description}</p>
                        <div className="flex gap-4 mt-2">
                          <span>Historical Return: <strong className="text-emerald-500">+{fund.historicalReturn}%</strong></span>
                          <span>Volatility: <strong>{fund.volatility}%</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isValidAmount && numAmount > 0 && (
                    <div className="flex items-center gap-2 text-amber-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Amount must be at least ${fund.minInvestment}</span>
                    </div>
                  )}

                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={!isValidAmount}
                    onClick={() => setStep("confirm")}
                  >
                    Continue to Confirm
                  </Button>
                </motion.div>
              )}

              {step === "confirm" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl mx-auto mb-4">
                      {fund.icon}
                    </div>
                    <h3 className="text-xl font-heading font-semibold mb-1">Confirm Investment</h3>
                    <p className="text-muted-foreground">Review your investment details</p>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fund</span>
                      <span className="font-medium">{fund.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">${numAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Management Fee</span>
                      <span className="font-medium">{fund.managementFee}% annually</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk Level</span>
                      <span className="font-medium capitalize">{fund.riskLevel}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                      <p className="text-sm text-amber-500">
                        By investing, you agree that crypto investments carry risk and past performance does not guarantee future returns.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep("input")}>
                      Back
                    </Button>
                    <Button variant="hero" className="flex-1" onClick={handleInvest}>
                      Confirm Investment
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "processing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-heading font-semibold mb-2">Processing Investment</h3>
                  <p className="text-muted-foreground">Allocating funds across assets...</p>
                  <div className="mt-6 space-y-2">
                    {allocationBreakdown.map((asset, index) => (
                      <motion.div
                        key={asset.symbol}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.3 }}
                        className="flex items-center justify-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Buying {asset.cryptoAmount.toFixed(6)} {asset.symbol}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-2">Investment Successful!</h3>
                  <p className="text-muted-foreground mb-6">
                    You've invested ${numAmount.toLocaleString()} in {fund.name}
                  </p>
                  <div className="p-4 rounded-xl bg-secondary mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Your investment is now active</p>
                    <p className="text-2xl font-heading font-bold">${numAmount.toLocaleString()}</p>
                  </div>
                  <Button variant="hero" onClick={handleClose} className="w-full">
                    View My Investments
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FundInvestModal;


