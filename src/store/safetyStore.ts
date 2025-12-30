import { create } from "zustand";
import { persist } from "zustand/middleware";

// WHY Mode Types
export interface RiskExplanation {
  id: string;
  tradeType: "buy" | "sell";
  asset: string;
  amount: number;
  usdValue: number;
  reasons: RiskReason[];
  alternatives: TradeAlternative[];
  overallRisk: "low" | "medium" | "high" | "critical";
  timestamp: Date;
}

export interface RiskReason {
  type: "large_amount" | "volatility" | "timing" | "overtrading" | "emotional" | "fomo" | "panic";
  title: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

export interface TradeAlternative {
  id: string;
  label: string;
  description: string;
  action: "reduce_amount" | "wait" | "practice_mode" | "dca" | "set_limit";
  suggestedValue?: number;
}

// Behavior Profile Types
export interface BehaviorProfile {
  label: string;
  description: string;
  traits: BehaviorTrait[];
  riskScore: number;
  learningProgress: number;
  lastUpdated: Date;
}

export interface BehaviorTrait {
  id: string;
  name: string;
  description: string;
  frequency: "rare" | "occasional" | "frequent";
  impact: "positive" | "neutral" | "negative";
  count: number;
}

// Trade Reflection Types
export interface TradeReflection {
  id: string;
  originalTrade: {
    asset: string;
    type: "buy" | "sell";
    amount: number;
    price: number;
    timestamp: Date;
  };
  scenarios: WhatIfScenario[];
  insight: string;
  createdAt: Date;
}

export interface WhatIfScenario {
  id: string;
  label: string;
  description: string;
  hypotheticalPrice: number;
  hypotheticalValue: number;
  difference: number;
  percentageDiff: number;
  outcome: "better" | "worse" | "same";
}

// Crypto License Types
export interface CryptoLicense {
  asset: string;
  tier: 0 | 1 | 2 | 3; // 0 = locked, 1 = basic, 2 = intermediate, 3 = full
  unlocked: boolean;
  requirements: LicenseRequirement[];
  unlockedAt?: Date;
}

export interface LicenseRequirement {
  id: string;
  type: "paper_trades" | "risk_score" | "quiz" | "hold_time" | "no_panic_sells";
  label: string;
  description: string;
  current: number;
  required: number;
  completed: boolean;
}

// AI Safety Gate Types
export interface SafetyGateStatus {
  isBlocked: boolean;
  blockReason?: string;
  blockUntil?: Date;
  redirectToPractice: boolean;
  emotionalState: "calm" | "cautious" | "risky" | "dangerous";
  recentPatterns: EmotionalPattern[];
}

export interface EmotionalPattern {
  type: "consecutive_losses" | "rapid_trading" | "increasing_amounts" | "revenge_trading";
  detected: boolean;
  severity: number;
  description: string;
}

// Time-Lock Types
export interface TimeLockConfirmation {
  id: string;
  tradeDetails: {
    asset: string;
    type: "buy" | "sell";
    amount: number;
    usdValue: number;
  };
  cooldownSeconds: number;
  startedAt: Date;
  expiresAt: Date;
  riskSummary: string[];
  confirmed: boolean;
}

// Harm Prevention Metrics
export interface HarmPreventionMetrics {
  lossesAvoided: number;
  riskyTradesPrevented: number;
  safetyGuidanceCount: number;
  practiceModeSaves: number;
  timeLockInterventions: number;
  emotionalTradingBlocked: number;
  totalValueProtected: number;
  streakDaysWithoutRiskyTrade: number;
  lastRiskyTradeAttempt?: Date;
}

// Learning Quiz Types
export interface LearningQuiz {
  id: string;
  asset: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

interface SafetyState {
  // WHY Mode
  pendingRiskExplanation: RiskExplanation | null;
  whyModeEnabled: boolean;
  
  // Behavior Profile
  behaviorProfile: BehaviorProfile;
  
  // Trade Reflections
  tradeReflections: TradeReflection[];
  
  // Crypto Licenses
  cryptoLicenses: Record<string, CryptoLicense>;
  
  // AI Safety Gate
  safetyGateStatus: SafetyGateStatus;
  
  // Time-Lock
  pendingTimeLock: TimeLockConfirmation | null;
  
  // Harm Prevention
  harmPreventionMetrics: HarmPreventionMetrics;
  
  // Learning
  completedQuizzes: string[];
  
  // Actions
  analyzeTradeRisk: (asset: string, amount: number, type: "buy" | "sell", price: number, portfolioValue: number, behavior: any, marketPrices: any) => RiskExplanation;
  dismissRiskExplanation: () => void;
  toggleWhyMode: () => void;
  
  updateBehaviorProfile: (tradeData: any) => void;
  
  generateTradeReflection: (trade: any, currentPrice: number) => TradeReflection;
  addTradeReflection: (reflection: TradeReflection) => void;
  
  checkLicenseForAsset: (asset: string) => CryptoLicense;
  updateLicenseProgress: (asset: string, requirementId: string, progress: number) => void;
  unlockLicense: (asset: string, tier: 1 | 2 | 3) => void;
  
  checkSafetyGate: (behavior: any, recentTrades: any[]) => SafetyGateStatus;
  blockTrading: (reason: string, durationMinutes: number) => void;
  unblockTrading: () => void;
  
  createTimeLock: (asset: string, amount: number, type: "buy" | "sell", usdValue: number) => TimeLockConfirmation;
  confirmTimeLock: (id: string) => void;
  cancelTimeLock: () => void;
  
  recordPreventedRisk: (type: string, valueProtected: number) => void;
  
  completeQuiz: (quizId: string, asset: string) => void;
  generateQuiz: (asset: string) => LearningQuiz;
}

const initialBehaviorProfile: BehaviorProfile = {
  label: "Beginner Trader",
  description: "You're just starting your trading journey. Focus on learning and building good habits.",
  traits: [],
  riskScore: 50,
  learningProgress: 0,
  lastUpdated: new Date(),
};

const initialSafetyGateStatus: SafetyGateStatus = {
  isBlocked: false,
  redirectToPractice: false,
  emotionalState: "calm",
  recentPatterns: [],
};

const initialHarmPreventionMetrics: HarmPreventionMetrics = {
  lossesAvoided: 0,
  riskyTradesPrevented: 0,
  safetyGuidanceCount: 0,
  practiceModeSaves: 0,
  timeLockInterventions: 0,
  emotionalTradingBlocked: 0,
  totalValueProtected: 0,
  streakDaysWithoutRiskyTrade: 0,
};

// High-risk assets that require licenses
const HIGH_RISK_ASSETS = ["DOGE", "SHIB", "PEPE", "FLOKI", "BONK"];
const MEDIUM_RISK_ASSETS = ["SOL", "AVAX", "MATIC", "DOT", "LINK"];
const LOW_RISK_ASSETS = ["BTC", "ETH", "USDT", "USDC"];

// Quiz questions database
const QUIZ_DATABASE: Record<string, LearningQuiz[]> = {
  BTC: [
    {
      id: "btc-1",
      asset: "BTC",
      question: "What is the maximum supply of Bitcoin?",
      options: ["21 million", "100 million", "Unlimited", "18 million"],
      correctAnswer: 0,
      explanation: "Bitcoin has a hard cap of 21 million coins, making it a deflationary asset.",
      difficulty: "easy",
    },
    {
      id: "btc-2",
      asset: "BTC",
      question: "What happens during a Bitcoin 'halving'?",
      options: ["Price doubles", "Block reward is cut in half", "Transaction fees double", "Mining stops"],
      correctAnswer: 1,
      explanation: "Bitcoin halving reduces the block reward by 50%, occurring approximately every 4 years.",
      difficulty: "medium",
    },
  ],
  ETH: [
    {
      id: "eth-1",
      asset: "ETH",
      question: "What is Ethereum primarily used for?",
      options: ["Only payments", "Smart contracts and dApps", "Email", "Gaming only"],
      correctAnswer: 1,
      explanation: "Ethereum is a platform for smart contracts and decentralized applications (dApps).",
      difficulty: "easy",
    },
  ],
  DOGE: [
    {
      id: "doge-1",
      asset: "DOGE",
      question: "Why is DOGE considered high-risk?",
      options: ["Low market cap", "Unlimited supply and high volatility", "Not on exchanges", "Illegal"],
      correctAnswer: 1,
      explanation: "DOGE has unlimited supply and is highly influenced by social media, making it very volatile.",
      difficulty: "medium",
    },
  ],
};

export const useSafetyStore = create<SafetyState>()(
  persist(
    (set, get) => ({
      pendingRiskExplanation: null,
      whyModeEnabled: true,
      behaviorProfile: initialBehaviorProfile,
      tradeReflections: [],
      cryptoLicenses: {},
      safetyGateStatus: initialSafetyGateStatus,
      pendingTimeLock: null,
      harmPreventionMetrics: initialHarmPreventionMetrics,
      completedQuizzes: [],

      analyzeTradeRisk: (asset, amount, type, price, portfolioValue, behavior, marketPrices) => {
        const usdValue = amount * price;
        const reasons: RiskReason[] = [];
        const alternatives: TradeAlternative[] = [];
        
        const assetData = marketPrices[asset];
        const change24h = assetData?.change24h || 0;
        const portfolioPercentage = (usdValue / portfolioValue) * 100;
        
        // Check for large trade
        if (usdValue > 1000 || portfolioPercentage > 25) {
          reasons.push({
            type: "large_amount",
            title: "Large Position Size",
            explanation: `This trade represents ${portfolioPercentage.toFixed(1)}% of your portfolio ($${usdValue.toLocaleString()}). Large positions increase your exposure to potential losses.`,
            severity: portfolioPercentage > 40 ? "high" : "medium",
          });
          alternatives.push({
            id: "reduce",
            label: "Reduce Amount",
            description: `Consider investing ${(usdValue * 0.5).toFixed(0)} instead (50% less)`,
            action: "reduce_amount",
            suggestedValue: usdValue * 0.5,
          });
        }
        
        // Check for volatility
        if (Math.abs(change24h) > 8) {
          reasons.push({
            type: "volatility",
            title: "High Volatility Detected",
            explanation: `${asset} has moved ${change24h > 0 ? '+' : ''}${change24h.toFixed(1)}% in the last 24 hours. ${type === "buy" && change24h > 0 ? "Buying after a pump often means buying at local highs." : type === "sell" && change24h < 0 ? "Selling during a dip often locks in losses." : "High volatility increases unpredictability."}`,
            severity: Math.abs(change24h) > 15 ? "high" : "medium",
          });
          alternatives.push({
            id: "wait",
            label: "Wait for Stability",
            description: "Consider waiting 24-48 hours for the market to stabilize",
            action: "wait",
          });
        }
        
        // Check for FOMO buying
        if (type === "buy" && change24h > 10) {
          reasons.push({
            type: "fomo",
            title: "Potential FOMO Trade",
            explanation: `${asset} is up ${change24h.toFixed(1)}% today. Buying during strong rallies often results in buying at temporary peaks. Historical data shows most retail buyers enter near local tops.`,
            severity: "high",
          });
          alternatives.push({
            id: "dca",
            label: "Dollar-Cost Average",
            description: "Split your purchase into 3-4 smaller buys over the next week",
            action: "dca",
          });
        }
        
        // Check for panic selling
        if (type === "sell" && change24h < -8) {
          reasons.push({
            type: "panic",
            title: "Panic Sell Warning",
            explanation: `Selling ${asset} while it's down ${Math.abs(change24h).toFixed(1)}% may lock in losses. Unless your investment thesis has fundamentally changed, consider if this is an emotional decision.`,
            severity: "high",
          });
          alternatives.push({
            id: "limit",
            label: "Set a Limit Order",
            description: "Place a limit sell order at a better price point",
            action: "set_limit",
          });
        }
        
        // Check for overtrading
        if (behavior.tradesLast24h >= 5) {
          reasons.push({
            type: "overtrading",
            title: "Overtrading Pattern",
            explanation: `You've made ${behavior.tradesLast24h} trades in the last 24 hours. Frequent trading typically leads to higher fees and worse outcomes due to emotional decision-making.`,
            severity: behavior.tradesLast24h >= 8 ? "high" : "medium",
          });
          alternatives.push({
            id: "practice",
            label: "Switch to Practice Mode",
            description: "Test your strategy in Practice Mode without risking real funds",
            action: "practice_mode",
          });
        }
        
        // Check emotional state based on recent behavior
        if (behavior.consecutiveLosses >= 2) {
          reasons.push({
            type: "emotional",
            title: "Emotional Trading Risk",
            explanation: `You've had ${behavior.consecutiveLosses} consecutive losing trades. Trading while trying to recover losses often leads to 'revenge trading' and bigger losses.`,
            severity: behavior.consecutiveLosses >= 4 ? "high" : "medium",
          });
        }
        
        // Always offer practice mode
        if (!alternatives.find(a => a.action === "practice_mode")) {
          alternatives.push({
            id: "practice",
            label: "Try in Practice Mode",
            description: "Execute this trade with virtual funds to see how it plays out",
            action: "practice_mode",
          });
        }
        
        // Determine overall risk
        let overallRisk: "low" | "medium" | "high" | "critical" = "low";
        const highSeverityCount = reasons.filter(r => r.severity === "high").length;
        const mediumSeverityCount = reasons.filter(r => r.severity === "medium").length;
        
        if (highSeverityCount >= 2 || (highSeverityCount >= 1 && mediumSeverityCount >= 2)) {
          overallRisk = "critical";
        } else if (highSeverityCount >= 1) {
          overallRisk = "high";
        } else if (mediumSeverityCount >= 1) {
          overallRisk = "medium";
        }
        
        const explanation: RiskExplanation = {
          id: `risk-${Date.now()}`,
          tradeType: type,
          asset,
          amount,
          usdValue,
          reasons,
          alternatives,
          overallRisk,
          timestamp: new Date(),
        };
        
        set({ pendingRiskExplanation: explanation });
        return explanation;
      },

      dismissRiskExplanation: () => {
        set({ pendingRiskExplanation: null });
      },

      toggleWhyMode: () => {
        set((state) => ({ whyModeEnabled: !state.whyModeEnabled }));
      },

      updateBehaviorProfile: (tradeData) => {
        set((state) => {
          const traits = [...state.behaviorProfile.traits];
          
          // Update or add traits based on trade patterns
          const updateTrait = (id: string, name: string, desc: string, impact: "positive" | "neutral" | "negative") => {
            const existing = traits.find(t => t.id === id);
            if (existing) {
              existing.count++;
              existing.frequency = existing.count > 10 ? "frequent" : existing.count > 3 ? "occasional" : "rare";
            } else {
              traits.push({
                id,
                name,
                description: desc,
                frequency: "rare",
                impact,
                count: 1,
              });
            }
          };
          
          if (tradeData.isFomo) {
            updateTrait("fomo", "Hype Chaser", "Tends to buy when prices are rising sharply", "negative");
          }
          if (tradeData.isPanicSell) {
            updateTrait("panic", "Panic Seller", "Sells during market dips", "negative");
          }
          if (tradeData.isOvertrading) {
            updateTrait("overtrading", "Frequent Trader", "Makes many trades in short periods", "negative");
          }
          if (tradeData.isSmallPosition) {
            updateTrait("risk_aware", "Risk Conscious", "Keeps position sizes manageable", "positive");
          }
          if (tradeData.usedPracticeFirst) {
            updateTrait("learner", "Practice First", "Tests strategies in Practice Mode", "positive");
          }
          
          // Calculate label based on traits
          const negativeTraits = traits.filter(t => t.impact === "negative" && t.frequency !== "rare").length;
          const positiveTraits = traits.filter(t => t.impact === "positive" && t.frequency !== "rare").length;
          
          let label = "Beginner Trader";
          let description = "You're learning the ropes. Keep practicing!";
          
          if (positiveTraits >= 3 && negativeTraits === 0) {
            label = "Disciplined Trader";
            description = "You show excellent trading discipline and risk management.";
          } else if (positiveTraits > negativeTraits) {
            label = "Improving Trader";
            description = "You're developing good habits. Keep building on your strengths.";
          } else if (negativeTraits >= 2) {
            label = "Emotional Trader";
            description = "Your trading shows emotional patterns. Focus on patience and planning.";
          } else if (traits.find(t => t.id === "overtrading" && t.frequency === "frequent")) {
            label = "Active Trader";
            description = "You trade frequently. Consider if each trade is truly necessary.";
          }
          
          const riskScore = Math.min(100, Math.max(0,
            50 +
            (negativeTraits * 10) -
            (positiveTraits * 8)
          ));
          
          return {
            behaviorProfile: {
              ...state.behaviorProfile,
              label,
              description,
              traits,
              riskScore,
              lastUpdated: new Date(),
            },
          };
        });
      },

      generateTradeReflection: (trade, currentPrice) => {
        const originalValue = trade.amount * trade.price;
        const currentValue = trade.amount * currentPrice;
        const priceDiff = currentPrice - trade.price;
        
        const scenarios: WhatIfScenario[] = [];
        
        // What if waited 1 day scenario (simulated)
        const waitedPrice = trade.price * (1 + (Math.random() * 0.1 - 0.05));
        const waitedValue = trade.amount * waitedPrice;
        scenarios.push({
          id: "waited",
          label: "If you had waited 24 hours",
          description: `The price would have been ~$${waitedPrice.toLocaleString()}`,
          hypotheticalPrice: waitedPrice,
          hypotheticalValue: waitedValue,
          difference: waitedValue - originalValue,
          percentageDiff: ((waitedValue - originalValue) / originalValue) * 100,
          outcome: waitedValue > originalValue ? "better" : waitedValue < originalValue ? "worse" : "same",
        });
        
        // What if invested half
        const halfValue = (trade.amount / 2) * currentPrice;
        const halfOriginal = (trade.amount / 2) * trade.price;
        scenarios.push({
          id: "half",
          label: "If you had invested 50% less",
          description: `Your exposure would be $${halfOriginal.toLocaleString()} instead of $${originalValue.toLocaleString()}`,
          hypotheticalPrice: currentPrice,
          hypotheticalValue: halfValue,
          difference: (currentValue - originalValue) / 2,
          percentageDiff: ((currentValue - originalValue) / originalValue) * 100,
          outcome: currentValue > originalValue ? "better" : "worse",
        });
        
        // What if DCA'd
        const dcaPrice = (trade.price + currentPrice) / 2;
        const dcaValue = trade.amount * currentPrice;
        const dcaCost = trade.amount * dcaPrice;
        scenarios.push({
          id: "dca",
          label: "If you had dollar-cost averaged",
          description: `Average entry would be ~$${dcaPrice.toLocaleString()}`,
          hypotheticalPrice: dcaPrice,
          hypotheticalValue: dcaValue,
          difference: dcaValue - dcaCost,
          percentageDiff: ((dcaValue - dcaCost) / dcaCost) * 100,
          outcome: dcaValue > dcaCost ? "better" : "worse",
        });
        
        // Generate insight
        let insight = "";
        if (currentValue > originalValue) {
          insight = `Good timing! Your ${trade.type} is currently ${((currentValue - originalValue) / originalValue * 100).toFixed(1)}% in profit. Remember, unrealized gains aren't locked in until you close the position.`;
        } else {
          insight = `This trade is currently ${((originalValue - currentValue) / originalValue * 100).toFixed(1)}% down. This is normal volatility - consider your original thesis before making emotional decisions.`;
        }
        
        const reflection: TradeReflection = {
          id: `reflection-${Date.now()}`,
          originalTrade: {
            asset: trade.asset,
            type: trade.type,
            amount: trade.amount,
            price: trade.price,
            timestamp: trade.timestamp,
          },
          scenarios,
          insight,
          createdAt: new Date(),
        };
        
        return reflection;
      },

      addTradeReflection: (reflection) => {
        set((state) => ({
          tradeReflections: [reflection, ...state.tradeReflections].slice(0, 20),
        }));
      },

      checkLicenseForAsset: (asset) => {
        const { cryptoLicenses, completedQuizzes } = get();
        
        if (cryptoLicenses[asset]) {
          return cryptoLicenses[asset];
        }
        
        // Determine risk tier
        let defaultTier: 0 | 1 | 2 | 3 = 1;
        let requirements: LicenseRequirement[] = [];
        
        if (HIGH_RISK_ASSETS.includes(asset)) {
          defaultTier = 0; // Locked by default
          requirements = [
            { id: "paper_trades", type: "paper_trades", label: "Complete 5 Practice Trades", description: "Execute 5 trades in Practice Mode", current: 0, required: 5, completed: false },
            { id: "risk_score", type: "risk_score", label: "Risk Score Below 60", description: "Maintain a healthy risk score", current: 50, required: 60, completed: false },
            { id: "quiz", type: "quiz", label: "Pass Knowledge Quiz", description: `Complete the ${asset} risk awareness quiz`, current: 0, required: 1, completed: completedQuizzes.includes(`${asset.toLowerCase()}-1`) },
            { id: "no_panic", type: "no_panic_sells", label: "No Panic Sells (7 days)", description: "Avoid panic selling for 7 days", current: 0, required: 7, completed: false },
          ];
        } else if (MEDIUM_RISK_ASSETS.includes(asset)) {
          defaultTier = 0;
          requirements = [
            { id: "paper_trades", type: "paper_trades", label: "Complete 3 Practice Trades", description: "Execute 3 trades in Practice Mode", current: 0, required: 3, completed: false },
            { id: "quiz", type: "quiz", label: "Pass Knowledge Quiz", description: `Complete the ${asset} basics quiz`, current: 0, required: 1, completed: false },
          ];
        } else {
          defaultTier = 1; // Low risk assets unlocked by default
          requirements = [];
        }
        
        const license: CryptoLicense = {
          asset,
          tier: defaultTier,
          unlocked: defaultTier > 0,
          requirements,
        };
        
        set((state) => ({
          cryptoLicenses: { ...state.cryptoLicenses, [asset]: license },
        }));
        
        return license;
      },

      updateLicenseProgress: (asset, requirementId, progress) => {
        set((state) => {
          const license = state.cryptoLicenses[asset];
          if (!license) return state;
          
          const updatedRequirements = license.requirements.map(req => {
            if (req.id === requirementId) {
              const newCurrent = Math.min(progress, req.required);
              return {
                ...req,
                current: newCurrent,
                completed: newCurrent >= req.required,
              };
            }
            return req;
          });
          
          // Check if all requirements are met
          const allCompleted = updatedRequirements.every(r => r.completed);
          
          return {
            cryptoLicenses: {
              ...state.cryptoLicenses,
              [asset]: {
                ...license,
                requirements: updatedRequirements,
                unlocked: allCompleted || license.unlocked,
                tier: allCompleted && license.tier === 0 ? 1 : license.tier,
                unlockedAt: allCompleted && !license.unlocked ? new Date() : license.unlockedAt,
              },
            },
          };
        });
      },

      unlockLicense: (asset, tier) => {
        set((state) => ({
          cryptoLicenses: {
            ...state.cryptoLicenses,
            [asset]: {
              ...state.cryptoLicenses[asset],
              tier,
              unlocked: true,
              unlockedAt: new Date(),
            },
          },
        }));
      },

      checkSafetyGate: (behavior, recentTrades) => {
        const patterns: EmotionalPattern[] = [];
        let emotionalState: "calm" | "cautious" | "risky" | "dangerous" = "calm";
        let shouldBlock = false;
        let blockReason = "";
        
        // Check consecutive losses
        if (behavior.consecutiveLosses >= 3) {
          patterns.push({
            type: "consecutive_losses",
            detected: true,
            severity: behavior.consecutiveLosses >= 5 ? 3 : 2,
            description: `${behavior.consecutiveLosses} consecutive losing trades detected`,
          });
          if (behavior.consecutiveLosses >= 5) {
            shouldBlock = true;
            blockReason = "Multiple consecutive losses detected. Take a break to avoid revenge trading.";
          }
        }
        
        // Check rapid trading
        if (behavior.tradesLast24h >= 8) {
          patterns.push({
            type: "rapid_trading",
            detected: true,
            severity: behavior.tradesLast24h >= 12 ? 3 : 2,
            description: `${behavior.tradesLast24h} trades in the last 24 hours`,
          });
          if (behavior.tradesLast24h >= 12) {
            shouldBlock = true;
            blockReason = "Excessive trading detected. This pattern often leads to losses.";
          }
        }
        
        // Check for increasing trade amounts (potential revenge trading)
        if (recentTrades.length >= 3) {
          const amounts = recentTrades.slice(0, 3).map(t => t.usdValue);
          if (amounts[0] > amounts[1] * 1.5 && amounts[1] > amounts[2] * 1.5) {
            patterns.push({
              type: "increasing_amounts",
              detected: true,
              severity: 2,
              description: "Trade sizes increasing rapidly - potential revenge trading",
            });
          }
        }
        
        // Determine emotional state
        const totalSeverity = patterns.reduce((sum, p) => sum + (p.detected ? p.severity : 0), 0);
        if (totalSeverity >= 5) {
          emotionalState = "dangerous";
        } else if (totalSeverity >= 3) {
          emotionalState = "risky";
        } else if (totalSeverity >= 1) {
          emotionalState = "cautious";
        }
        
        const status: SafetyGateStatus = {
          isBlocked: shouldBlock,
          blockReason: shouldBlock ? blockReason : undefined,
          redirectToPractice: emotionalState === "risky" || emotionalState === "dangerous",
          emotionalState,
          recentPatterns: patterns,
        };
        
        set({ safetyGateStatus: status });
        
        if (shouldBlock) {
          get().recordPreventedRisk("emotional_block", 0);
        }
        
        return status;
      },

      blockTrading: (reason, durationMinutes) => {
        const blockUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
        set({
          safetyGateStatus: {
            ...get().safetyGateStatus,
            isBlocked: true,
            blockReason: reason,
            blockUntil,
            redirectToPractice: true,
          },
        });
        
        set((state) => ({
          harmPreventionMetrics: {
            ...state.harmPreventionMetrics,
            emotionalTradingBlocked: state.harmPreventionMetrics.emotionalTradingBlocked + 1,
          },
        }));
      },

      unblockTrading: () => {
        set({
          safetyGateStatus: {
            ...get().safetyGateStatus,
            isBlocked: false,
            blockReason: undefined,
            blockUntil: undefined,
          },
        });
      },

      createTimeLock: (asset, amount, type, usdValue) => {
        // Cooldown based on trade size
        let cooldownSeconds = 30;
        if (usdValue > 5000) cooldownSeconds = 120;
        else if (usdValue > 1000) cooldownSeconds = 60;
        
        const riskSummary: string[] = [];
        riskSummary.push(`Trade: ${type.toUpperCase()} ${amount} ${asset}`);
        riskSummary.push(`Value: $${usdValue.toLocaleString()}`);
        
        if (usdValue > 1000) {
          riskSummary.push("⚠️ Large trade - review carefully");
        }
        
        const timeLock: TimeLockConfirmation = {
          id: `lock-${Date.now()}`,
          tradeDetails: { asset, type, amount, usdValue },
          cooldownSeconds,
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + cooldownSeconds * 1000),
          riskSummary,
          confirmed: false,
        };
        
        set({ pendingTimeLock: timeLock });
        
        set((state) => ({
          harmPreventionMetrics: {
            ...state.harmPreventionMetrics,
            timeLockInterventions: state.harmPreventionMetrics.timeLockInterventions + 1,
          },
        }));
        
        return timeLock;
      },

      confirmTimeLock: (id) => {
        set((state) => {
          if (state.pendingTimeLock?.id === id) {
            return { pendingTimeLock: { ...state.pendingTimeLock, confirmed: true } };
          }
          return state;
        });
      },

      cancelTimeLock: () => {
        const { pendingTimeLock } = get();
        if (pendingTimeLock) {
          get().recordPreventedRisk("time_lock_cancel", pendingTimeLock.tradeDetails.usdValue);
        }
        set({ pendingTimeLock: null });
      },

      recordPreventedRisk: (type, valueProtected) => {
        set((state) => ({
          harmPreventionMetrics: {
            ...state.harmPreventionMetrics,
            riskyTradesPrevented: state.harmPreventionMetrics.riskyTradesPrevented + 1,
            totalValueProtected: state.harmPreventionMetrics.totalValueProtected + valueProtected,
            safetyGuidanceCount: state.harmPreventionMetrics.safetyGuidanceCount + 1,
            lossesAvoided: state.harmPreventionMetrics.lossesAvoided + (valueProtected * 0.1), // Estimate 10% potential loss
          },
        }));
      },

      completeQuiz: (quizId, asset) => {
        set((state) => {
          const newCompleted = [...state.completedQuizzes, quizId];
          
          // Update license progress
          const license = state.cryptoLicenses[asset];
          if (license) {
            const updatedRequirements = license.requirements.map(req => {
              if (req.type === "quiz") {
                return { ...req, current: 1, completed: true };
              }
              return req;
            });
            
            return {
              completedQuizzes: newCompleted,
              cryptoLicenses: {
                ...state.cryptoLicenses,
                [asset]: { ...license, requirements: updatedRequirements },
              },
            };
          }
          
          return { completedQuizzes: newCompleted };
        });
      },

      generateQuiz: (asset) => {
        const quizzes = QUIZ_DATABASE[asset] || QUIZ_DATABASE["BTC"];
        const { completedQuizzes } = get();
        
        // Find an uncompleted quiz
        const uncompleted = quizzes.find(q => !completedQuizzes.includes(q.id));
        return uncompleted || quizzes[0];
      },
    }),
    {
      name: "hybrid-ramp-safety-storage",
      partialize: (state) => ({
        whyModeEnabled: state.whyModeEnabled,
        behaviorProfile: state.behaviorProfile,
        tradeReflections: state.tradeReflections,
        cryptoLicenses: state.cryptoLicenses,
        harmPreventionMetrics: state.harmPreventionMetrics,
        completedQuizzes: state.completedQuizzes,
      }),
    }
  )
);

