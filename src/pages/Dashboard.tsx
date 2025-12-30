import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PortfolioOverview from "@/components/dashboard/PortfolioOverview";
import KycStatus from "@/components/dashboard/KycStatus";
import TransactionHistory from "@/components/dashboard/TransactionHistory";
import RiskTier from "@/components/dashboard/RiskTier";
import WalletConnect from "@/components/dashboard/WalletConnect";
import BuyCryptoModal from "@/components/dashboard/BuyCryptoModal";
import SellCryptoModal from "@/components/dashboard/SellCryptoModal";
import SwapModal from "@/components/dashboard/SwapModal";
import SendModal from "@/components/dashboard/SendModal";
import PracticeModeToggle from "@/components/dashboard/PracticeModeToggle";
import PracticePortfolio from "@/components/dashboard/PracticePortfolio";
import PracticeTradeModal from "@/components/dashboard/PracticeTradeModal";
import AICoachPanel from "@/components/dashboard/AICoachPanel";
import SafetyWarnings from "@/components/dashboard/SafetyWarnings";
import { 
  WhyModeModal, 
  BehaviorProfileCard, 
  TradeReflectionPanel,
  SafetyGateAlert,
  SafetyGateBlockScreen,
  TimeLockModal,
  HarmPreventionPanel,
  CryptoLicenseGrid,
  LicenseQuizModal
} from "@/components/safety";
import { useAppStore } from "@/store/appStore";
import { useSafetyStore, TradeAlternative, LearningQuiz } from "@/store/safetyStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FlaskConical, Sparkles, RefreshCw, ArrowDownLeft, ArrowUpRight, Send, Shield, BookOpen } from "lucide-react";
import InstitutionalTradeModal from "@/components/dashboard/InstitutionalTradeModal";
import LoanModal from "@/components/loans/LoanModal";

const Dashboard = () => {
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [practiceTradeOpen, setPracticeTradeOpen] = useState(false);
  const [practiceTradeType, setPracticeTradeType] = useState<"buy" | "sell">("buy");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [timeLockOpen, setTimeLockOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [institutionalOpen, setInstitutionalOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<LearningQuiz | null>(null);
  const [pendingTradeAction, setPendingTradeAction] = useState<(() => void) | null>(null);
  
  const { 
    isAuthenticated, 
    user, 
    isPracticeMode, 
    isReadyForRealTrading, 
    fetchMarketPrices,
    isLoadingPrices,
    lastPriceUpdate,
    marketPrices,
    tradingBehavior,
    transactions,
    togglePracticeMode,
    practicePortfolio,
    assets
  } = useAppStore();
  
  const {
    whyModeEnabled,
    pendingRiskExplanation,
    analyzeTradeRisk,
    dismissRiskExplanation,
    behaviorProfile,
    tradeReflections,
    cryptoLicenses,
    checkLicenseForAsset,
    safetyGateStatus,
    checkSafetyGate,
    pendingTimeLock,
    createTimeLock,
    confirmTimeLock,
    cancelTimeLock,
    harmPreventionMetrics,
    recordPreventedRisk,
    generateQuiz,
    completeQuiz,
    updateLicenseProgress
  } = useSafetyStore();
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    
    // Fetch real market prices on mount
    fetchMarketPrices();
    
    // Refresh prices every 60 seconds
    const interval = setInterval(() => {
      fetchMarketPrices();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate, fetchMarketPrices]);

  // Check safety gate when trading behavior changes
  useEffect(() => {
    if (!isPracticeMode) {
      checkSafetyGate(tradingBehavior, transactions.slice(0, 10));
    }
  }, [tradingBehavior, transactions, isPracticeMode, checkSafetyGate]);

  const calculatePortfolioValue = () => {
    if (isPracticeMode) {
      return practicePortfolio.totalValue;
    }
    return assets.reduce((sum, asset) => {
      const price = marketPrices[asset.symbol]?.price || asset.price;
      return sum + (asset.balance * price);
    }, 0);
  };

  const handleTradeWithSafety = (
    type: "buy" | "sell",
    asset: string,
    amount: number,
    openModal: () => void
  ) => {
    // Skip safety checks in practice mode
    if (isPracticeMode) {
      openModal();
      return;
    }

    // Check if blocked by safety gate
    if (safetyGateStatus.isBlocked) {
      toast.error("Trading is temporarily paused. Please wait or switch to Practice Mode.");
      return;
    }

    const price = marketPrices[asset]?.price || 0;
    const usdValue = amount * price;
    const portfolioValue = calculatePortfolioValue();

    // Check license for high-risk assets
    const license = checkLicenseForAsset(asset);
    if (!license.unlocked) {
      toast.error(`You need to unlock the ${asset} license first. Complete the requirements to trade this asset.`);
      return;
    }

    // WHY Mode check for risky trades
    if (whyModeEnabled) {
      const riskAnalysis = analyzeTradeRisk(
        asset, amount, type, price, portfolioValue, tradingBehavior, marketPrices
      );

      if (riskAnalysis.overallRisk !== "low") {
        setPendingTradeAction(() => () => {
          // Check if time-lock needed for large trades
          if (usdValue > 500) {
            createTimeLock(asset, amount, type, usdValue);
            setTimeLockOpen(true);
          } else {
            openModal();
          }
        });
        setWhyModalOpen(true);
        return;
      }
    }

    // Time-lock for large trades
    if (usdValue > 500) {
      createTimeLock(asset, amount, type, usdValue);
      setTimeLockOpen(true);
      setPendingTradeAction(() => openModal);
      return;
    }

    openModal();
  };

  const handleQuickAction = (action: string) => {
    if (isPracticeMode) {
      if (action === "buy" || action === "sell") {
        setPracticeTradeType(action);
        setPracticeTradeOpen(true);
      }
    } else {
      // For quick actions, we'll open the modal directly
      // The actual trade execution will go through safety checks
      switch (action) {
        case "buy":
          setBuyModalOpen(true);
          break;
        case "institutional":
          setInstitutionalOpen(true);
          break;
          case "borrow":
            setLoanOpen(true);
            break;
        case "sell":
          setSellModalOpen(true);
          break;
        case "swap":
          setSwapModalOpen(true);
          break;
        case "send":
          setSendModalOpen(true);
          break;
      }
    }
  };

  const handleWhyModeAlternative = (alternative: TradeAlternative) => {
    dismissRiskExplanation();
    setWhyModalOpen(false);
    recordPreventedRisk("why_mode", pendingRiskExplanation?.usdValue || 0);

    switch (alternative.action) {
      case "practice_mode":
        togglePracticeMode();
        toast.success("Switched to Practice Mode. Try your strategy with virtual funds!");
        break;
      case "reduce_amount":
        toast.info(`Consider reducing your trade to $${alternative.suggestedValue?.toLocaleString()}`);
        break;
      case "wait":
        toast.info("Good choice! Wait for the market to stabilize before trading.");
        break;
      case "dca":
        toast.info("Dollar-cost averaging is a great strategy. Split your purchase over time.");
        break;
      case "set_limit":
        toast.info("Setting a limit order can help you get a better price.");
        break;
    }
  };

  const handleWhyModeProceed = () => {
    dismissRiskExplanation();
    setWhyModalOpen(false);
    if (pendingTradeAction) {
      pendingTradeAction();
      setPendingTradeAction(null);
    }
  };

  const handleTimeLockConfirm = () => {
    if (pendingTimeLock) {
      confirmTimeLock(pendingTimeLock.id);
      setTimeLockOpen(false);
      if (pendingTradeAction) {
        pendingTradeAction();
        setPendingTradeAction(null);
      }
    }
  };

  const handleTimeLockCancel = () => {
    cancelTimeLock();
    setTimeLockOpen(false);
    setPendingTradeAction(null);
    toast.info("Trade cancelled. Take your time to reconsider.");
  };

  const handleStartQuiz = (asset: string) => {
    const quiz = generateQuiz(asset);
    setCurrentQuiz(quiz);
    setQuizModalOpen(true);
  };

  const handleQuizComplete = (correct: boolean) => {
    if (correct && currentQuiz) {
      completeQuiz(currentQuiz.id, currentQuiz.asset);
      updateLicenseProgress(currentQuiz.asset, "quiz", 1);
      toast.success("Quiz completed! Progress updated.");
    }
    setQuizModalOpen(false);
    setCurrentQuiz(null);
  };

  const handleSwitchToPractice = () => {
    if (!isPracticeMode) {
      togglePracticeMode();
      toast.success("Switched to Practice Mode for your safety.");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Show block screen if trading is blocked
  if (safetyGateStatus.isBlocked && !isPracticeMode) {
    return (
      <SafetyGateBlockScreen 
        status={safetyGateStatus}
        onSwitchToPractice={handleSwitchToPractice}
        onUnblock={() => {}}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - HybridRampX</title>
        <meta name="description" content="Manage your crypto portfolio, view transactions, and trade securely." />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <DashboardHeader 
            onMenuClick={() => setSidebarOpen(true)} 
            onBuyClick={() => isPracticeMode ? (setPracticeTradeType("buy"), setPracticeTradeOpen(true)) : setBuyModalOpen(true)} 
          />

          <main className="p-4 lg:p-8 pt-24">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Welcome Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div>
                  <h1 className="text-2xl lg:text-3xl font-heading font-bold">
                    Welcome back, {user?.name || "User"} 👋
                  </h1>
                  <p className="text-muted-foreground">
                    Here's what's happening with your portfolio today.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isLoadingPrices && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                  {lastPriceUpdate && (
                    <span>
                      Prices updated: {new Date(lastPriceUpdate).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Practice Mode Toggle */}
              <PracticeModeToggle />

              {/* Safety Gate Alert */}
              {!isPracticeMode && safetyGateStatus.emotionalState !== "calm" && (
                <SafetyGateAlert 
                  status={safetyGateStatus}
                  onSwitchToPractice={handleSwitchToPractice}
                />
              )}

              {/* Ready for Real Trading Banner */}
              {isPracticeMode && isReadyForRealTrading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-emerald-500">You're Ready for Real Trading!</p>
                      <p className="text-sm text-muted-foreground">
                        Based on your practice performance, you've demonstrated good trading habits. Start with small amounts when you switch to real trading.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Safety Warnings */}
              <SafetyWarnings />

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {[
                  { 
                    icon: ArrowDownLeft, 
                    label: isPracticeMode ? "Practice Buy" : "Buy", 
                    color: isPracticeMode ? "bg-amber-500/20 text-amber-500" : "bg-primary/20 text-primary", 
                    action: "buy" 
                  },
                  { 
                    icon: ArrowUpRight, 
                    label: isPracticeMode ? "Practice Sell" : "Sell", 
                    color: "bg-destructive/20 text-destructive", 
                    action: "sell" 
                  },
                  { 
                    icon: RefreshCw, 
                    label: "Swap", 
                    color: "bg-blue-500/20 text-blue-500", 
                    action: "swap",
                    disabled: isPracticeMode
                  },
                  { 
                    icon: Send, 
                    label: "Send", 
                    color: "bg-amber-500/20 text-amber-500", 
                    action: "send",
                    disabled: isPracticeMode
                  },
                  {
                    icon: Sparkles,
                    label: "Institutional",
                    color: "bg-indigo-500/20 text-indigo-500",
                    action: "institutional",
                    disabled: isPracticeMode
                  },
                  {
                    icon: BookOpen,
                    label: "Borrow",
                    color: "bg-amber-500/20 text-amber-500",
                    action: "borrow",
                    disabled: isPracticeMode
                  },
                ].map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    onClick={() => !item.disabled && handleQuickAction(item.action)}
                    disabled={item.disabled}
                    className={`glass rounded-2xl p-6 hover:glow-sm transition-all group ${
                      item.disabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-center">{item.label}</p>
                    {item.disabled && isPracticeMode && (
                      <p className="text-xs text-muted-foreground text-center mt-1">Real mode only</p>
                    )}
                  </motion.button>
                ))}
              </motion.div>

              {/* Main Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Portfolio - Takes 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                  {isPracticeMode ? (
                    <>
                      <PracticePortfolio />
                      <AICoachPanel />
                      <TradeReflectionPanel reflections={tradeReflections} />
                    </>
                  ) : (
                    <>
                      <PortfolioOverview />
                      <TransactionHistory />
                      
                      {/* Harm Prevention Panel */}
                      <HarmPreventionPanel metrics={harmPreventionMetrics} />
                    </>
                  )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {!isPracticeMode && <WalletConnect />}
                  
                  {/* Behavior Profile */}
                  <BehaviorProfileCard profile={behaviorProfile} compact />
                  
                  <KycStatus />
                  <RiskTier />
                  
                  {/* Crypto Licenses - Compact View */}
                  {Object.keys(cryptoLicenses).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-2xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Asset Licenses</h3>
                      </div>
                      <div className="space-y-2">
                        {Object.values(cryptoLicenses).slice(0, 3).map(license => (
                          <div 
                            key={license.asset}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              license.unlocked ? "bg-emerald-500/10" : "bg-secondary"
                            }`}
                          >
                            <span className="font-medium">{license.asset}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              license.unlocked 
                                ? "bg-emerald-500/20 text-emerald-500" 
                                : "bg-amber-500/20 text-amber-500"
                            }`}>
                              {license.unlocked ? "Unlocked" : "Locked"}
                            </span>
                          </div>
                        ))}
                      </div>
                      {Object.keys(cryptoLicenses).length > 3 && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          +{Object.keys(cryptoLicenses).length - 3} more
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Practice Mode Transactions */}
              {isPracticeMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <FlaskConical className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-heading font-semibold">Practice Transactions</h3>
                  </div>
                  <TransactionHistory />
                </motion.div>
              )}

              {/* Full Crypto License Grid (if user has licenses) */}
              {Object.keys(cryptoLicenses).length > 0 && (
                <CryptoLicenseGrid 
                  licenses={cryptoLicenses}
                  onStartQuiz={handleStartQuiz}
                  onViewRequirements={(asset) => toast.info(`View requirements for ${asset}`)}
                />
              )}
            </div>
          </main>
        </div>

        {/* Modals */}
        <BuyCryptoModal isOpen={buyModalOpen} onClose={() => setBuyModalOpen(false)} />
        <SellCryptoModal isOpen={sellModalOpen} onClose={() => setSellModalOpen(false)} />
        <SwapModal isOpen={swapModalOpen} onClose={() => setSwapModalOpen(false)} />
        <SendModal isOpen={sendModalOpen} onClose={() => setSendModalOpen(false)} />
        <PracticeTradeModal 
          isOpen={practiceTradeOpen} 
          onClose={() => setPracticeTradeOpen(false)} 
          defaultTab={practiceTradeType}
        />
        <InstitutionalTradeModal isOpen={institutionalOpen} onClose={() => setInstitutionalOpen(false)} />
        <LoanModal isOpen={loanOpen} onClose={() => setLoanOpen(false)} />
        
        {/* Safety Modals */}
        <WhyModeModal
          isOpen={whyModalOpen}
          onClose={() => {
            setWhyModalOpen(false);
            dismissRiskExplanation();
            setPendingTradeAction(null);
          }}
          riskExplanation={pendingRiskExplanation}
          onProceed={handleWhyModeProceed}
          onAlternative={handleWhyModeAlternative}
        />
        
        <TimeLockModal
          isOpen={timeLockOpen}
          timeLock={pendingTimeLock}
          onConfirm={handleTimeLockConfirm}
          onCancel={handleTimeLockCancel}
        />
        
        <LicenseQuizModal
          isOpen={quizModalOpen}
          onClose={() => {
            setQuizModalOpen(false);
            setCurrentQuiz(null);
          }}
          quiz={currentQuiz}
          onComplete={handleQuizComplete}
        />
      </div>
    </>
  );
};

export default Dashboard;
