import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/appStore";
import { useFundsStore } from "@/store/fundsStore";
import { useLoansStore } from "@/store/loansStore";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void }

const LoanModal = ({ isOpen, onClose }: Props) => {
  const { assets, marketPrices, user } = useAppStore();
  const { getUserInvestments } = useFundsStore();
  const { createLoan, getUserLoans, repayLoan } = useLoansStore();

  const [symbol, setSymbol] = useState(assets[0]?.symbol || "");
  const [amountCollateral, setAmountCollateral] = useState<string>("");
  const [borrowAmount, setBorrowAmount] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  if (!user) return null;

  const price = marketPrices[symbol]?.price || 0;
  const collateralUsd = parseFloat(amountCollateral || "0") * price;

  const maxBorrow = collateralUsd * 0.6; // use default 60% LTV for preview

  const handleBorrow = async () => {
    if (!user) return;
    const p = parseFloat(borrowAmount || "0");
    if (isNaN(p) || p <= 0) return toast.error("Enter a borrow amount");
    if (p > maxBorrow) return toast.error(`Exceeds max borrow of $${maxBorrow.toFixed(2)}`);

    setProcessing(true);
    try {
      const collateral = [{ symbol, amount: parseFloat(amountCollateral || "0"), valueUsd: collateralUsd }];
      const loan = await createLoan(user.id, p, collateral, { ltv: 0.6 });
      toast.success(`Loan approved: $${p.toFixed(2)}. Collateral locked.`);
      setBorrowAmount("");
      setAmountCollateral("");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Loan request failed");
    }
    setProcessing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">Borrow Against Crypto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div>
            <Label>Collateral Asset</Label>
            <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full p-2 rounded-md bg-secondary">
              {assets.map(a => (
                <option key={a.symbol} value={a.symbol}>{a.symbol} — balance: {a.balance}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Amount of Collateral</Label>
            <Input value={amountCollateral} onChange={(e) => setAmountCollateral(e.target.value)} placeholder="0" />
            <p className="text-xs text-muted-foreground">Estimated collateral value: ${collateralUsd.toFixed(2)}</p>
          </div>

          <div>
            <Label>Requested Loan Amount (USD)</Label>
            <Input value={borrowAmount} onChange={(e) => setBorrowAmount(e.target.value)} placeholder={`Max ${maxBorrow.toFixed(2)}`} />
            <p className="text-xs text-muted-foreground">Max based on 60% LTV: ${maxBorrow.toFixed(2)}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={processing}>Cancel</Button>
            <Button variant="hero" onClick={handleBorrow} className="flex-1" disabled={processing}>Request Loan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoanModal;
