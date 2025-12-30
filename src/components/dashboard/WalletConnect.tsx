import { motion } from "framer-motion";
import { Wallet, ExternalLink, Lock, Copy, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { isMetaMaskInstalled, formatAddress, SUPPORTED_CHAINS } from "@/lib/wallet";

const WalletConnect = () => {
  const { 
    walletConnected, 
    walletInfo, 
    user, 
    connectWallet, 
    disconnectWallet, 
    setCustodyType,
    refreshWalletBalance,
    isConnectingWallet,
    walletError
  } = useAppStore();
  
  const [isMetaMask, setIsMetaMask] = useState(false);

  useEffect(() => {
    setIsMetaMask(isMetaMaskInstalled());
  }, []);

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success("Wallet connected successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect wallet";
      toast.error(message);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.info("Wallet disconnected");
  };

  const handleCopyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
      toast.success("Address copied to clipboard!");
    }
  };

  const handleRefreshBalance = async () => {
    await refreshWalletBalance();
    toast.success("Balance refreshed!");
  };

  const openExplorer = () => {
    if (walletInfo) {
      const chain = SUPPORTED_CHAINS[walletInfo.chainId as keyof typeof SUPPORTED_CHAINS];
      if (chain) {
        window.open(`${chain.explorer}/address/${walletInfo.address}`, "_blank");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-heading font-semibold">Wallet</h3>
      </div>

      {walletConnected && walletInfo ? (
        <div className="space-y-4">
          {/* Connected Wallet */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium">MetaMask</p>
                  <p className="text-xs text-muted-foreground">{walletInfo.chainName}</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-mono text-muted-foreground">
                {formatAddress(walletInfo.address)}
              </p>
              <button onClick={handleCopyAddress} className="text-muted-foreground hover:text-primary">
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button onClick={openExplorer} className="text-muted-foreground hover:text-primary">
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="font-medium">{parseFloat(walletInfo.balance).toFixed(4)} ETH</p>
              </div>
              <button 
                onClick={handleRefreshBalance}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Custody Selection */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Custody Type</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCustodyType("self")}
                className={`p-3 rounded-xl border transition-all ${
                  user?.custodyType === "self"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Wallet className="w-5 h-5 mx-auto mb-1" />
                <p className="text-xs font-medium">Self-Custody</p>
              </button>
              <button
                onClick={() => setCustodyType("vault")}
                className={`p-3 rounded-xl border transition-all ${
                  user?.custodyType === "vault"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Lock className="w-5 h-5 mx-auto mb-1" />
                <p className="text-xs font-medium">Secure Vault</p>
              </button>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto flex items-center justify-center">
            <Wallet className="w-8 h-8 text-muted-foreground" />
          </div>
          
          {!isMetaMask && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-sm font-medium">MetaMask Not Detected</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Please install MetaMask extension to connect your wallet
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Download MetaMask →
              </a>
            </div>
          )}
          
          {walletError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{walletError}</p>
            </div>
          )}
          
          <div>
            <p className="font-medium mb-1">Connect Your Wallet</p>
            <p className="text-sm text-muted-foreground">
              {isMetaMask 
                ? "Connect MetaMask to start trading"
                : "Install MetaMask to get started"}
            </p>
          </div>
          
          <Button
            variant="hero"
            className="w-full"
            onClick={handleConnect}
            disabled={isConnectingWallet || !isMetaMask}
          >
            {isConnectingWallet ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                {isMetaMask ? "Connect MetaMask" : "Install MetaMask"}
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default WalletConnect;
