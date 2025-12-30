import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { connectWallet, getExplorerTxUrl } from "@/lib/onchain";
import { executeOrder } from "@/lib/smartExecution";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const InstitutionalTradeModal = ({ isOpen, onClose }: Props) => {
  const [amount, setAmount] = useState<string>("10000");
  const [executing, setExecuting] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [txs, setTxs] = useState<string[]>([]);

  const tokenAddress = (import.meta.env.VITE_ERC20_ADDRESS as string) || "";

  const handleExecute = async () => {
    setLog([]);
    setTxs([]);

    const signer = await connectWallet();
    if (!signer) {
      toast.error("Please connect a Web3 wallet (e.g., MetaMask) to proceed.");
      return;
    }

    setExecuting(true);
    const amt = parseFloat(amount || "0");
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid USD amount");
      setExecuting(false);
      return;
    }

    setLog((l) => [...l, `Starting institutional execution for $${amt.toLocaleString()}`]);

    try {
      const res = await executeOrder({ tokenAddress, amountUsd: amt, signer });
      res.executionPlan.forEach((s) => setLog((l) => [...l, s]));
      setTxs(res.txHashes || []);
      if (res.success) {
        toast.success("Execution started — view on-chain transactions below.");
      } else {
        toast.error("Execution finished with warnings — check the execution log.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Execution failed");
      setLog((l) => [...l, `⚠️ ${e?.message || e}`]);
    }

    setExecuting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">Institutional Smart Execution</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Token (on-chain)</Label>
              <Input value={tokenAddress} readOnly className="bg-secondary" />
            </div>
            <div>
              <Label>Amount (USD)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-secondary/50 max-h-48 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Execution Log</p>
            <div className="space-y-2 text-sm">
              {log.length === 0 && <p className="text-muted-foreground">No actions yet.</p>}
              {log.map((l, i) => (
                <div key={i} className="break-words">{l}</div>
              ))}
            </div>
          </div>

          {txs.length > 0 && (
            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">On-chain Transactions</p>
              <div className="space-y-2 text-sm">
                {txs.map((t) => (
                  <a key={t} href={getExplorerTxUrl(t)} target="_blank" rel="noreferrer" className="text-primary underline">
                    {t}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={executing}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleExecute} className="flex-1" disabled={executing}>
              {executing ? "Executing…" : "Execute Smart Order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstitutionalTradeModal;
