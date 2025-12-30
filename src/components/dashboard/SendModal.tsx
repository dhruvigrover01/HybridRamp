import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { Send, CheckCircle2, AlertTriangle, Wallet } from "lucide-react";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SendModal = ({ isOpen, onClose }: SendModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [executing, setExecuting] = useState(false);

  const { assets, addTransaction, marketPrices, user } = useAppStore();

  const selectedAssetData = assets.find(a => a.symbol === selectedAsset);
  const currentPrice = selectedAsset ? marketPrices[selectedAsset]?.price || 0 : 0;
  const maxAmount = selectedAssetData?.balance || 0;

  const handleNext = () => {
    if (step === 1 && !selectedAsset) {
      toast.error("Please select an asset to send");
      return;
    }
    if (step === 2) {
      if (!amount || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      if (parseFloat(amount) > maxAmount) {
        toast.error(`Maximum amount is ${maxAmount} ${selectedAsset}`);
        return;
      }
      if (!address || address.length < 10) {
        toast.error("Please enter a valid wallet address");
        return;
      }
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    
    await new Promise((resolve) => setTimeout(resolve, 2000));

    addTransaction({
      type: "withdraw",
      asset: selectedAsset!,
      amount: parseFloat(amount),
      usdValue: parseFloat(amount) * currentPrice,
      status: "completed",
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...`,
    });

    setStep(3);
    setExecuting(false);
    toast.success("Transaction sent successfully!");
  };

  const handleClose = () => {
    setStep(1);
    setSelectedAsset(null);
    setAmount("");
    setAddress("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-500" />
            Send Crypto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? "bg-amber-500 text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${step > s ? "bg-amber-500" : "bg-border"}`} />
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
                <Label>Select Asset to Send</Label>
                {assets.filter(a => a.balance > 0).length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No assets available to send</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assets.filter(a => a.balance > 0).map((asset) => (
                      <button
                        key={asset.symbol}
                        onClick={() => setSelectedAsset(asset.symbol)}
                        className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                          selectedAsset === asset.symbol
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-border hover:border-amber-500/50"
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
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <Button 
                  className="w-full bg-amber-500 hover:bg-amber-600" 
                  onClick={handleNext}
                  disabled={!selectedAsset}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 2: Enter Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Recipient Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Recipient Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-12 bg-secondary border-border font-mono text-sm"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="amount">Amount ({selectedAsset})</Label>
                    <span className="text-xs text-muted-foreground">
                      Max: {maxAmount.toFixed(6)}
                    </span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 bg-secondary border-border"
                  />
                  {amount && (
                    <p className="text-sm text-muted-foreground">
                      ≈ ${(parseFloat(amount) * currentPrice).toLocaleString()}
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
                      onClick={() => setAmount((maxAmount * percent / 100).toFixed(6))}
                    >
                      {percent}%
                    </Button>
                  ))}
                </div>

                {/* Warning */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-500">
                      Always double-check the recipient address. Crypto transactions cannot be reversed.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-amber-500 hover:bg-amber-600" 
                    onClick={handleExecute}
                    disabled={executing}
                  >
                    {executing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send {selectedAsset}
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">Transaction Sent!</h3>
                <p className="text-muted-foreground mb-2">
                  Sent {amount} {selectedAsset} to
                </p>
                <p className="text-xs font-mono text-muted-foreground mb-6 break-all">
                  {address}
                </p>
                <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={handleClose}>
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendModal;

