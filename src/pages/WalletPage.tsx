import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import BuyCryptoModal from "@/components/dashboard/BuyCryptoModal";
import SellCryptoModal from "@/components/dashboard/SellCryptoModal";
import SendModal from "@/components/dashboard/SendModal";
import { isMetaMaskInstalled, formatAddress, SUPPORTED_CHAINS } from "@/lib/wallet";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  RefreshCw,
  ExternalLink,
  Copy,
  AlertTriangle
} from "lucide-react";

const WalletPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [isMetaMask, setIsMetaMask] = useState(false);

  const navigate = useNavigate();
  const { 
    assets, 
    walletConnected, 
    walletInfo,
    connectWallet, 
    disconnectWallet,
    refreshWalletBalance,
    isConnectingWallet,
    walletError,
    isAuthenticated,
    marketPrices,
    fetchMarketPrices
  } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    setIsMetaMask(isMetaMaskInstalled());
    fetchMarketPrices();
  }, [isAuthenticated, navigate, fetchMarketPrices]);

  // Calculate with real prices
  const assetsWithPrices = assets.map(asset => {
    const priceData = marketPrices[asset.symbol];
    const price = priceData?.price || asset.price;
    const change24h = priceData?.change24h || asset.change24h;
    const usdValue = asset.balance * price;
    return { ...asset, price, change24h, usdValue };
  });
  
  const totalValue = assetsWithPrices.reduce((sum, asset) => sum + asset.usdValue, 0);
  const totalChange = totalValue > 0 
    ? assetsWithPrices.reduce((sum, asset) => sum + (asset.usdValue * asset.change24h / 100), 0) / totalValue * 100
    : 0;

  const handleConnect = async () => {
    if (!isMetaMask) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    
    try {
      await connectWallet();
      toast.success("Wallet connected successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect wallet";
      // Don't show error toast if user just rejected - they know what they did
      if (!message.includes("rejected")) {
        toast.error(message);
      }
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

  const handleRefresh = async () => {
    await refreshWalletBalance();
    await fetchMarketPrices();
    toast.success("Data refreshed!");
  };

  const openExplorer = () => {
    if (walletInfo) {
      const chain = SUPPORTED_CHAINS[walletInfo.chainId as keyof typeof SUPPORTED_CHAINS];
      if (chain) {
        window.open(`${chain.explorer}/address/${walletInfo.address}`, "_blank");
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Wallet - HybridRampX</title>
      </Helmet>

      <div className="min-h-screen bg-background flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 lg:ml-64">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} onBuyClick={() => setBuyModalOpen(true)} />

          <main className="p-4 lg:p-8 pt-24">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div>
                  <h1 className="text-2xl lg:text-3xl font-heading font-bold mb-2">
                    Wallet
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your crypto assets and transactions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setBuyModalOpen(true)}>
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Buy
                  </Button>
                  <Button variant="outline" onClick={() => setSellModalOpen(true)}>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Sell
                  </Button>
                  <Button variant="outline" onClick={() => setSendModalOpen(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </motion.div>

              {/* Wallet Connection */}
              {!walletConnected ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-2xl p-8 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-primary/20 mx-auto flex items-center justify-center mb-6">
                    <Wallet className="w-10 h-10 text-primary" />
                  </div>
                  
                  {!isMetaMask && (
                    <div className="max-w-md mx-auto mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2 text-amber-500 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        <p className="font-medium">MetaMask Not Detected</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Please install MetaMask extension to connect your wallet
                      </p>
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-2 inline-block"
                      >
                        Download MetaMask →
                      </a>
                    </div>
                  )}
                  
                  {walletError && (
                    <div className="max-w-md mx-auto mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">{walletError}</p>
                    </div>
                  )}
                  
                  <h2 className="text-xl font-heading font-semibold mb-2">Connect Your Wallet</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {isMetaMask 
                      ? "Connect MetaMask to view your portfolio and enable seamless transactions"
                      : "Install MetaMask to get started with crypto trading"}
                  </p>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    onClick={handleConnect}
                    disabled={isConnectingWallet || !isMetaMask}
                  >
                    {isConnectingWallet ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Connecting...
                      </span>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5 mr-2" />
                        {isMetaMask ? "Connect MetaMask" : "Install MetaMask"}
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <>
                  {/* Connected Wallet Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                          <Wallet className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm text-muted-foreground">MetaMask</p>
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                              {walletInfo?.chainName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-medium">
                              {walletInfo?.address ? formatAddress(walletInfo.address) : ""}
                            </p>
                            <button onClick={handleCopyAddress} className="text-muted-foreground hover:text-primary">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={openExplorer} className="text-muted-foreground hover:text-primary">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Balance: {parseFloat(walletInfo?.balance || "0").toFixed(4)} ETH
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-500 text-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Connected
                        </span>
                        <Button variant="outline" size="sm" onClick={handleDisconnect}>
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Portfolio Value */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-muted-foreground">Total Portfolio Value</p>
                      {totalValue > 0 && (
                        <span className={`flex items-center gap-1 text-sm font-medium ${
                          totalChange >= 0 ? "text-emerald-500" : "text-red-500"
                        }`}>
                          {totalChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {totalChange >= 0 ? "+" : ""}{totalChange.toFixed(2)}% (24h)
                        </span>
                      )}
                    </div>
                    <div className="text-4xl lg:text-5xl font-heading font-bold">
                      ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </motion.div>
                </>
              )}

              {/* Assets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-heading font-semibold">Your Assets</h3>
                  <Button variant="ghost" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {assetsWithPrices.filter(a => a.balance > 0).length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No assets in your portfolio yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Buy some crypto to get started!</p>
                    <Button variant="hero" className="mt-4" onClick={() => setBuyModalOpen(true)}>
                      <ArrowDownLeft className="w-4 h-4 mr-2" />
                      Buy Crypto
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="pb-4 font-medium">Asset</th>
                          <th className="pb-4 font-medium">Balance</th>
                          <th className="pb-4 font-medium">Price</th>
                          <th className="pb-4 font-medium">24h Change</th>
                          <th className="pb-4 font-medium">Value</th>
                          <th className="pb-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assetsWithPrices.filter(a => a.balance > 0).map((asset, index) => (
                          <motion.tr
                            key={asset.symbol}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  asset.symbol === "BTC" ? "bg-amber-500/20" :
                                  asset.symbol === "ETH" ? "bg-blue-500/20" :
                                  asset.symbol === "USDT" ? "bg-emerald-500/20" :
                                  "bg-violet-500/20"
                                }`}>
                                  <span className={`font-bold ${
                                    asset.symbol === "BTC" ? "text-amber-500" :
                                    asset.symbol === "ETH" ? "text-blue-500" :
                                    asset.symbol === "USDT" ? "text-emerald-500" :
                                    "text-violet-500"
                                  }`}>
                                    {asset.icon}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{asset.name}</p>
                                  <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <p className="font-medium">{asset.balance.toFixed(asset.balance < 1 ? 6 : 4)}</p>
                              <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                            </td>
                            <td className="py-4">
                              <p className="font-medium">${asset.price.toLocaleString()}</p>
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex items-center gap-1 ${
                                asset.change24h >= 0 ? "text-emerald-500" : "text-red-500"
                              }`}>
                                {asset.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-4">
                              <p className="font-medium">${asset.usdValue.toLocaleString()}</p>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setBuyModalOpen(true)}>
                                  Buy
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setSellModalOpen(true)}>
                                  Sell
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </div>
          </main>
        </div>

        <BuyCryptoModal isOpen={buyModalOpen} onClose={() => setBuyModalOpen(false)} />
        <SellCryptoModal isOpen={sellModalOpen} onClose={() => setSellModalOpen(false)} />
        <SendModal isOpen={sendModalOpen} onClose={() => setSendModalOpen(false)} />
      </div>
    </>
  );
};

export default WalletPage;
