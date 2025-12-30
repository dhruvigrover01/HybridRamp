import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { useSafetyStore, LearningQuiz } from "@/store/safetyStore";
import { toast } from "sonner";
import {
  BehaviorProfileCard,
  TradeReflectionPanel,
  HarmPreventionPanel,
  CryptoLicenseGrid,
  LicenseQuizModal,
  SafetyGateIndicator
} from "@/components/safety";
import { 
  Shield, 
  BookOpen, 
  Award, 
  TrendingUp,
  Heart,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";

const SafetyPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<LearningQuiz | null>(null);
  
  const navigate = useNavigate();
  const { isAuthenticated, isPracticeMode, togglePracticeMode } = useAppStore();
  
  const {
    whyModeEnabled,
    toggleWhyMode,
    behaviorProfile,
    tradeReflections,
    cryptoLicenses,
    safetyGateStatus,
    harmPreventionMetrics,
    generateQuiz,
    completeQuiz,
    updateLicenseProgress
  } = useSafetyStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Safety & Learning - HybridRampX</title>
      </Helmet>

      <div className="min-h-screen bg-background flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 lg:ml-64">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} onBuyClick={() => {}} />

          <main className="p-4 lg:p-8 pt-24">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div>
                  <h1 className="text-2xl lg:text-3xl font-heading font-bold mb-2 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary" />
                    Safety & Learning Center
                  </h1>
                  <p className="text-muted-foreground">
                    Your personal trading coach and protection dashboard
                  </p>
                </div>
                <SafetyGateIndicator status={safetyGateStatus} />
              </motion.div>

              {/* Safety Features Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* WHY Mode Toggle */}
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold">WHY Mode</h3>
                    </div>
                    <button
                      onClick={toggleWhyMode}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        whyModeEnabled ? "bg-primary" : "bg-secondary"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                        whyModeEnabled ? "translate-x-6" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get explanations before risky trades. Helps you understand why a trade might be dangerous.
                  </p>
                </div>

                {/* Practice Mode */}
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-500" />
                      <h3 className="font-semibold">Practice Mode</h3>
                    </div>
                    <button
                      onClick={togglePracticeMode}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        isPracticeMode ? "bg-amber-500" : "bg-secondary"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                        isPracticeMode ? "translate-x-6" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trade with virtual funds to practice strategies without risking real money.
                  </p>
                </div>

                {/* Emotional State */}
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <h3 className="font-semibold">Emotional State</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      safetyGateStatus.emotionalState === "calm" 
                        ? "bg-emerald-500/20 text-emerald-500"
                        : safetyGateStatus.emotionalState === "cautious"
                        ? "bg-amber-500/20 text-amber-500"
                        : "bg-red-500/20 text-red-500"
                    }`}>
                      {safetyGateStatus.emotionalState.charAt(0).toUpperCase() + safetyGateStatus.emotionalState.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We monitor your trading patterns to detect emotional decision-making.
                  </p>
                </div>
              </motion.div>

              {/* How It Works */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  How HybridRampX Protects You
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      icon: AlertTriangle,
                      title: "WHY Mode",
                      description: "Before risky trades, we explain why it might be dangerous and offer safer alternatives.",
                      color: "text-amber-500 bg-amber-500/10"
                    },
                    {
                      icon: Clock,
                      title: "Time-Lock",
                      description: "Large trades have a cooling-off period to prevent impulsive decisions.",
                      color: "text-blue-500 bg-blue-500/10"
                    },
                    {
                      icon: Shield,
                      title: "Safety Gate",
                      description: "If we detect emotional trading patterns, we'll pause and redirect you to practice mode.",
                      color: "text-rose-500 bg-rose-500/10"
                    },
                    {
                      icon: Award,
                      title: "Crypto Licenses",
                      description: "Unlock high-risk assets by proving you understand the risks through quizzes and practice.",
                      color: "text-violet-500 bg-violet-500/10"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="p-4 rounded-xl bg-secondary/50">
                      <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-medium mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Behavior Profile - Full */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <BehaviorProfileCard profile={behaviorProfile} />
                </motion.div>

                {/* Harm Prevention Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <HarmPreventionPanel metrics={harmPreventionMetrics} />
                </motion.div>
              </div>

              {/* Crypto Licenses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CryptoLicenseGrid 
                  licenses={cryptoLicenses}
                  onStartQuiz={handleStartQuiz}
                  onViewRequirements={(asset) => toast.info(`View all requirements for ${asset}`)}
                />
              </motion.div>

              {/* Trade Reflections */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <TradeReflectionPanel reflections={tradeReflections} />
              </motion.div>

              {/* Learning Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Trading Tips
                </h2>
                <div className="space-y-3">
                  {[
                    "Never invest more than you can afford to lose",
                    "Don't chase pumps - buying after a 10%+ gain often means buying the top",
                    "Set stop-losses before entering a trade, not after",
                    "Dollar-cost averaging reduces the impact of volatility",
                    "Take breaks after losses to avoid revenge trading",
                    "Keep a trading journal to learn from your decisions"
                  ].map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </main>
        </div>

        {/* Quiz Modal */}
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

export default SafetyPage;

