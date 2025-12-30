import { create } from "zustand";
import { persist } from "zustand/middleware";
import { connectWallet as connectMetaMask, disconnectWallet as disconnectMetaMask, getBalance, checkConnection, formatAddress, getChainName, onAccountsChanged, onChainChanged, isMetaMaskInstalled } from "@/lib/wallet";
import { getCryptoPrices, getMarketData, getCoinPrice } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  kycTier: 0 | 1 | 2 | 3;
  riskLevel: "low" | "medium" | "high";
  walletAddress: string | null;
  custodyType: "self" | "vault" | null;
  twoFactorEnabled: boolean;
  phone: string | null;
  kycDocuments: {
    idUploaded: boolean;
    idFile?: string;
    addressProofUploaded: boolean;
    addressProofFile?: string;
    selfieUploaded: boolean;
    selfieFile?: string;
  };
  createdAt: Date;
}

export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  icon: string;
  price: number;
  image?: string;
}

export interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdraw" | "swap";
  asset: string;
  amount: number;
  usdValue: number;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
  txHash?: string;
  isPractice?: boolean;
}

// Practice Mode Types
export interface PracticePortfolio {
  fiatBalance: number;
  assets: Asset[];
  totalValue: number;
}

export interface TradingBehavior {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageHoldTime: number;
  panicSells: number;
  fomoBuys: number;
  overtradingDays: number;
  riskScore: number;
  lastTradeTime: Date | null;
  tradesLast24h: number;
  consecutiveLosses: number;
  largestLoss: number;
  largestGain: number;
}

export interface AICoachInsight {
  id: string;
  type: "warning" | "tip" | "praise" | "analysis";
  title: string;
  message: string;
  timestamp: Date;
  relatedTrade?: string;
}

export interface SafetyWarning {
  id: string;
  type: "kyc_required" | "high_risk" | "large_trade" | "volatility" | "overtrading";
  message: string;
  severity: "low" | "medium" | "high";
  action?: string;
}

interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  chainName: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  assets: Asset[];
  transactions: Transaction[];
  
  // Real Wallet State
  walletConnected: boolean;
  walletInfo: WalletInfo | null;
  isConnectingWallet: boolean;
  walletError: string | null;

  // Practice Mode State
  isPracticeMode: boolean;
  practicePortfolio: PracticePortfolio;
  practiceTransactions: Transaction[];
  tradingBehavior: TradingBehavior;
  aiInsights: AICoachInsight[];
  
  // Safety Layer
  safetyWarnings: SafetyWarning[];
  progressionLevel: number;
  isReadyForRealTrading: boolean;

  // Market Data
  marketPrices: Record<string, { price: number; change24h: number }>;
  isLoadingPrices: boolean;
  lastPriceUpdate: Date | null;

  // Actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  
  // Real Wallet Actions
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  refreshWalletBalance: () => Promise<void>;
  
  updateKycTier: (tier: 0 | 1 | 2 | 3) => void;
  setCustodyType: (type: "self" | "vault") => void;
  addTransaction: (tx: Omit<Transaction, "id" | "timestamp">) => void;
  executeTrade: (asset: string, amount: number, type: "buy" | "sell") => Promise<{ success: boolean; executionPlan: string[]; warning?: SafetyWarning }>;
  
  // Practice Mode Actions
  togglePracticeMode: () => void;
  executePracticeTrade: (asset: string, amount: number, type: "buy" | "sell", price: number) => Promise<{ success: boolean; feedback: AICoachInsight }>;
  resetPracticePortfolio: () => void;
  
  // KYC Actions
  uploadKycDocument: (docType: "id" | "addressProof" | "selfie", file: File) => Promise<boolean>;
  verifyPhone: (phone: string, otp: string) => Promise<boolean>;
  
  // Security Actions
  enableTwoFactor: () => Promise<{ secret: string; qrCode: string }>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  disableTwoFactor: () => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  
  // AI Coach Actions
  addAIInsight: (insight: Omit<AICoachInsight, "id" | "timestamp">) => void;
  clearInsights: () => void;
  
  // Safety Actions
  addSafetyWarning: (warning: Omit<SafetyWarning, "id">) => void;
  dismissWarning: (id: string) => void;
  checkProgressionStatus: () => void;
  
  // Market Actions
  fetchMarketPrices: () => Promise<void>;
  updateMarketPrices: () => void;
}

const initialPracticePortfolio: PracticePortfolio = {
  fiatBalance: 10000,
  assets: [],
  totalValue: 10000,
};

const initialTradingBehavior: TradingBehavior = {
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
  averageHoldTime: 0,
  panicSells: 0,
  fomoBuys: 0,
  overtradingDays: 0,
  riskScore: 50,
  lastTradeTime: null,
  tradesLast24h: 0,
  consecutiveLosses: 0,
  largestLoss: 0,
  largestGain: 0,
};

const defaultAssets: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", balance: 0, usdValue: 0, change24h: 0, icon: "₿", price: 0 },
  { symbol: "ETH", name: "Ethereum", balance: 0, usdValue: 0, change24h: 0, icon: "Ξ", price: 0 },
  { symbol: "USDT", name: "Tether", balance: 0, usdValue: 0, change24h: 0, icon: "$", price: 1 },
  { symbol: "MATIC", name: "Polygon", balance: 0, usdValue: 0, change24h: 0, icon: "⬡", price: 0 },
];

// AI Coach Analysis Functions
const analyzeTradeForFeedback = (
  type: "buy" | "sell",
  asset: string,
  amount: number,
  price: number,
  behavior: TradingBehavior,
  portfolio: PracticePortfolio,
  marketPrices: Record<string, { price: number; change24h: number }>
): AICoachInsight => {
  const tradeValue = amount * price;
  const portfolioPercentage = (tradeValue / portfolio.totalValue) * 100;
  const assetData = marketPrices[asset];
  
  if (type === "buy" && assetData && assetData.change24h > 10) {
    return {
      id: "",
      type: "warning",
      title: "Potential FOMO Alert",
      message: `${asset} is up ${assetData.change24h.toFixed(1)}% in 24h. Buying after a big pump often leads to buying at local highs. Consider waiting for a pullback or dollar-cost averaging instead.`,
      timestamp: new Date(),
    };
  }
  
  if (type === "sell" && assetData && assetData.change24h < -8) {
    return {
      id: "",
      type: "warning",
      title: "Panic Sell Warning",
      message: `${asset} is down ${Math.abs(assetData.change24h).toFixed(1)}% today. Selling during sharp drops often locks in losses. Unless your thesis has changed, consider holding or buying more at lower prices.`,
      timestamp: new Date(),
    };
  }
  
  if (behavior.tradesLast24h >= 5) {
    return {
      id: "",
      type: "warning",
      title: "Overtrading Detected",
      message: `You've made ${behavior.tradesLast24h} trades in the last 24 hours. Frequent trading often leads to higher fees and emotional decisions. Consider setting specific entry/exit points and sticking to them.`,
      timestamp: new Date(),
    };
  }
  
  if (portfolioPercentage > 30) {
    return {
      id: "",
      type: "warning",
      title: "Large Position Size",
      message: `This trade represents ${portfolioPercentage.toFixed(1)}% of your portfolio. Consider keeping individual positions under 20-25% to manage risk. Diversification helps protect against single-asset volatility.`,
      timestamp: new Date(),
    };
  }
  
  if (behavior.consecutiveLosses >= 3) {
    return {
      id: "",
      type: "tip",
      title: "Take a Break",
      message: `You've had ${behavior.consecutiveLosses} losing trades in a row. This is normal, but it might be a good time to step back, review your strategy, and avoid revenge trading.`,
      timestamp: new Date(),
    };
  }
  
  if (portfolioPercentage < 10 && portfolioPercentage > 0) {
    return {
      id: "",
      type: "praise",
      title: "Good Risk Management",
      message: `Nice! You're keeping this position size at ${portfolioPercentage.toFixed(1)}% of your portfolio. This is a smart approach to managing risk while still participating in potential upside.`,
      timestamp: new Date(),
    };
  }
  
  return {
    id: "",
    type: "analysis",
    title: "Trade Executed",
    message: `Your ${type} order for ${amount} ${asset} at $${price.toLocaleString()} has been executed. Remember to set mental stop-losses and take-profit levels for every trade.`,
    timestamp: new Date(),
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  user: null,
  isAuthenticated: false,
      assets: defaultAssets,
      transactions: [],
      
      // Wallet State
  walletConnected: false,
      walletInfo: null,
      isConnectingWallet: false,
      walletError: null,
      
      // Practice Mode Initial State
      isPracticeMode: false,
      practicePortfolio: initialPracticePortfolio,
      practiceTransactions: [],
      tradingBehavior: initialTradingBehavior,
      aiInsights: [],
      
      // Safety Layer Initial State
      safetyWarnings: [],
      progressionLevel: 1,
      isReadyForRealTrading: false,
      
      // Market Data
      marketPrices: {},
      isLoadingPrices: false,
      lastPriceUpdate: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email: string, password: string) => {
        // In production, this would call your backend API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
        // Normalize email to lowercase for consistent matching
        const normalizedEmail = email.toLowerCase().trim();
        
        // Check localStorage for registered users
        const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        const existingUser = users.find((u: { email: string; password: string }) => 
          u.email.toLowerCase().trim() === normalizedEmail && u.password === password
        );
        
        // Allow demo account for testing
        const isDemoAccount = normalizedEmail === "demo@example.com";
        
        if (!existingUser && !isDemoAccount) {
          throw new Error("Invalid email or password. Please check your credentials or sign up for a new account.");
        }
        
        const user: User = existingUser ? {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          kycTier: existingUser.kycTier || 0,
          riskLevel: "low",
          walletAddress: existingUser.walletAddress || null,
          custodyType: existingUser.custodyType || null,
          twoFactorEnabled: existingUser.twoFactorEnabled || false,
          phone: existingUser.phone || null,
          kycDocuments: existingUser.kycDocuments || {
            idUploaded: false,
            addressProofUploaded: false,
            selfieUploaded: false,
          },
          createdAt: new Date(existingUser.createdAt),
        } : {
          id: "demo-user",
      email: normalizedEmail,
      name: "Demo User",
          kycTier: 1,
          riskLevel: "low",
          walletAddress: null,
          custodyType: null,
          twoFactorEnabled: false,
          phone: null,
          kycDocuments: {
            idUploaded: false,
            addressProofUploaded: false,
            selfieUploaded: false,
          },
          createdAt: new Date(),
        };
        
        set({ user, isAuthenticated: true });
        
        // Fetch market prices on login
        get().fetchMarketPrices();
        
        return true;
      },

      register: async (email: string, password: string, name: string) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Normalize email to lowercase for consistent storage
        const normalizedEmail = email.toLowerCase().trim();
        
        const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        
        // Check if email already exists (case-insensitive)
        if (users.find((u: { email: string }) => u.email.toLowerCase().trim() === normalizedEmail)) {
          throw new Error("This email is already registered. Please sign in instead.");
        }
        
        const newUser = {
          id: `user-${Date.now()}`,
          email: normalizedEmail,
          password,
          name: name.trim(),
          kycTier: 0,
          riskLevel: "low",
          walletAddress: null,
          custodyType: null,
          twoFactorEnabled: false,
          phone: null,
          kycDocuments: {
            idUploaded: false,
            addressProofUploaded: false,
            selfieUploaded: false,
          },
          createdAt: new Date().toISOString(),
        };
        
        users.push(newUser);
        localStorage.setItem("registeredUsers", JSON.stringify(users));
        
        const user: User = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          kycTier: 0,
      riskLevel: "low",
      walletAddress: null,
      custodyType: null,
          twoFactorEnabled: false,
          phone: null,
          kycDocuments: {
            idUploaded: false,
            addressProofUploaded: false,
            selfieUploaded: false,
          },
          createdAt: new Date(),
    };
    
    set({ user, isAuthenticated: true });
        get().fetchMarketPrices();
        
    return true;
  },

  logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          walletConnected: false,
          walletInfo: null,
          isPracticeMode: false,
        });
      },

      // Real MetaMask Wallet Connection
      connectWallet: async () => {
        set({ isConnectingWallet: true, walletError: null });
        
        try {
          if (!isMetaMaskInstalled()) {
            throw new Error("MetaMask is not installed. Please install MetaMask extension to connect your wallet.");
          }
          
          const { address, chainId } = await connectMetaMask();
          const balance = await getBalance(address);
          const chainName = getChainName(chainId);
          
          const walletInfo: WalletInfo = {
            address,
            balance,
            chainId,
            chainName,
          };
          
          // Update user's wallet address
    const { user } = get();
    if (user) {
      set({
        user: { ...user, walletAddress: address },
        walletConnected: true,
              walletInfo,
              isConnectingWallet: false,
            });
          } else {
            set({
              walletConnected: true,
              walletInfo,
              isConnectingWallet: false,
            });
          }
          
          // Set up listeners for account/chain changes
          onAccountsChanged(async (accounts) => {
            if (accounts.length === 0) {
              get().disconnectWallet();
            } else {
              const newBalance = await getBalance(accounts[0]);
              set((state) => ({
                walletInfo: state.walletInfo ? {
                  ...state.walletInfo,
                  address: accounts[0],
                  balance: newBalance,
                } : null,
                user: state.user ? { ...state.user, walletAddress: accounts[0] } : null,
              }));
            }
          });
          
          onChainChanged(async (newChainId) => {
            const { walletInfo } = get();
            if (walletInfo) {
              const newBalance = await getBalance(walletInfo.address);
              set({
                walletInfo: {
                  ...walletInfo,
                  chainId: newChainId,
                  chainName: getChainName(newChainId),
                  balance: newBalance,
                },
              });
            }
          });
          
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to connect wallet";
          set({ walletError: message, isConnectingWallet: false });
          throw error;
    }
  },

  disconnectWallet: () => {
        disconnectMetaMask();
    const { user } = get();
    if (user) {
      set({
        user: { ...user, walletAddress: null },
        walletConnected: false,
            walletInfo: null,
          });
        } else {
          set({
            walletConnected: false,
            walletInfo: null,
      });
    }
  },

      refreshWalletBalance: async () => {
        const { walletInfo } = get();
        if (walletInfo) {
          try {
            const balance = await getBalance(walletInfo.address);
            set({
              walletInfo: { ...walletInfo, balance },
            });
          } catch (error) {
            console.error("Failed to refresh balance:", error);
          }
        }
      },

  updateKycTier: (tier) => {
        const { user, checkProgressionStatus } = get();
    if (user) {
          // Save to localStorage
          const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
          const userIndex = users.findIndex((u: { email: string }) => u.email === user.email);
          if (userIndex >= 0) {
            users[userIndex].kycTier = tier;
            localStorage.setItem("registeredUsers", JSON.stringify(users));
          }
          
      set({ user: { ...user, kycTier: tier } });
          checkProgressionStatus();
    }
  },

  setCustodyType: (type) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, custodyType: type } });
    }
  },

  addTransaction: (tx) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      timestamp: new Date(),
    };
    set((state) => ({ transactions: [newTx, ...state.transactions] }));
  },

  executeTrade: async (asset: string, amount: number, type: "buy" | "sell") => {
        const { user, addTransaction, addSafetyWarning, marketPrices, assets } = get();
    
        const price = marketPrices[asset]?.price || 0;
        const tradeValue = amount * price;
    const executionPlan: string[] = [];
        let warning: SafetyWarning | undefined;
    
    if (tradeValue > 10000) {
      const chunks = Math.ceil(tradeValue / 5000);
      executionPlan.push(`Trade size detected: $${tradeValue.toLocaleString()}`);
      executionPlan.push(`Splitting into ${chunks} smaller orders to minimize slippage`);
      executionPlan.push(`Using smart routing across multiple liquidity sources`);
    } else {
      executionPlan.push(`Trade size: $${tradeValue.toLocaleString()}`);
      executionPlan.push(`Executing instantly via primary liquidity pool`);
    }

    if (user) {
          const tierLimits = { 0: 100, 1: 500, 2: 5000, 3: Infinity };
          const limit = tierLimits[user.kycTier];
          
          if (tradeValue > limit) {
            const tierName = user.kycTier === 0 ? "Unverified" : user.kycTier === 1 ? "Basic" : user.kycTier === 2 ? "Verified" : "Premium";
            warning = {
              id: `warning-${Date.now()}`,
              type: "kyc_required",
              message: `Your current KYC tier (${tierName}) allows trades up to $${limit.toLocaleString()}. Please upgrade to trade larger amounts.`,
              severity: "high",
              action: "Upgrade KYC",
            };
            addSafetyWarning(warning);
            executionPlan.push(`⚠️ KYC Tier ${user.kycTier + 1} required for trades above $${limit.toLocaleString()}`);
            return { success: false, executionPlan, warning };
          }
          
          const assetData = marketPrices[asset];
          if (assetData && Math.abs(assetData.change24h) > 10) {
            warning = {
              id: `warning-${Date.now()}`,
              type: "volatility",
              message: `${asset} has moved ${assetData.change24h > 0 ? '+' : ''}${assetData.change24h.toFixed(1)}% in 24h. High volatility increases risk.`,
              severity: "medium",
            };
            addSafetyWarning(warning);
            executionPlan.push(`⚠️ High volatility detected: ${assetData.change24h.toFixed(1)}% 24h change`);
      }
    }

    executionPlan.push(`✓ Risk assessment passed`);
    executionPlan.push(`✓ Order submitted to blockchain`);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    addTransaction({
      type,
      asset,
      amount,
      usdValue: tradeValue,
      status: "completed",
          txHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
        });

        // Update assets
        set((state) => {
          const existingAsset = state.assets.find(a => a.symbol === asset);
          if (type === "buy") {
            if (existingAsset) {
              return {
                assets: state.assets.map(a => 
                  a.symbol === asset 
                    ? { ...a, balance: a.balance + amount, usdValue: (a.balance + amount) * price }
                    : a
                ),
              };
            } else {
              return {
                assets: [...state.assets, {
                  symbol: asset,
                  name: asset,
                  balance: amount,
                  usdValue: tradeValue,
                  change24h: marketPrices[asset]?.change24h || 0,
                  icon: asset === "BTC" ? "₿" : asset === "ETH" ? "Ξ" : "$",
                  price,
                }],
              };
            }
          } else {
            if (existingAsset) {
              const newBalance = Math.max(0, existingAsset.balance - amount);
              return {
                assets: state.assets.map(a => 
                  a.symbol === asset 
                    ? { ...a, balance: newBalance, usdValue: newBalance * price }
                    : a
                ),
              };
            }
          }
          return state;
    });

    executionPlan.push(`✓ Trade completed successfully!`);
        return { success: true, executionPlan, warning };
      },
      
      togglePracticeMode: () => {
        set((state) => ({ isPracticeMode: !state.isPracticeMode }));
      },
      
      executePracticeTrade: async (asset: string, amount: number, type: "buy" | "sell", price: number) => {
        const { practicePortfolio, tradingBehavior, marketPrices, addAIInsight } = get();
        const tradeValue = amount * price;
        
        if (type === "buy" && tradeValue > practicePortfolio.fiatBalance) {
          return {
            success: false,
            feedback: {
              id: `insight-${Date.now()}`,
              type: "warning" as const,
              title: "Insufficient Funds",
              message: `You don't have enough practice funds. Available: $${practicePortfolio.fiatBalance.toLocaleString()}`,
              timestamp: new Date(),
            },
          };
        }
        
        if (type === "sell") {
          const holding = practicePortfolio.assets.find(a => a.symbol === asset);
          if (!holding || holding.balance < amount) {
            return {
              success: false,
              feedback: {
                id: `insight-${Date.now()}`,
                type: "warning" as const,
                title: "Insufficient Holdings",
                message: `You don't have enough ${asset} to sell. Available: ${holding?.balance || 0}`,
                timestamp: new Date(),
              },
            };
          }
        }
        
        const feedback = analyzeTradeForFeedback(type, asset, amount, price, tradingBehavior, practicePortfolio, marketPrices);
        feedback.id = `insight-${Date.now()}`;
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        set((state) => {
          const newAssets = [...state.practicePortfolio.assets];
          const existingIndex = newAssets.findIndex(a => a.symbol === asset);
          
          if (type === "buy") {
            if (existingIndex >= 0) {
              const existing = newAssets[existingIndex];
              const newBalance = existing.balance + amount;
              newAssets[existingIndex] = {
                ...existing,
                balance: newBalance,
                usdValue: newBalance * price,
                price,
              };
            } else {
              newAssets.push({
                symbol: asset,
                name: asset,
                balance: amount,
                usdValue: tradeValue,
                change24h: marketPrices[asset]?.change24h || 0,
                icon: asset === "BTC" ? "₿" : asset === "ETH" ? "Ξ" : "$",
                price,
              });
            }
          } else {
            if (existingIndex >= 0) {
              const existing = newAssets[existingIndex];
              const newBalance = existing.balance - amount;
              if (newBalance <= 0) {
                newAssets.splice(existingIndex, 1);
              } else {
                newAssets[existingIndex] = {
                  ...existing,
                  balance: newBalance,
                  usdValue: newBalance * price,
                };
              }
            }
          }
          
          const newFiatBalance = type === "buy" 
            ? state.practicePortfolio.fiatBalance - tradeValue
            : state.practicePortfolio.fiatBalance + tradeValue;
          
          const totalAssetValue = newAssets.reduce((sum, a) => sum + a.usdValue, 0);
          
          return {
            practicePortfolio: {
              fiatBalance: newFiatBalance,
              assets: newAssets,
              totalValue: newFiatBalance + totalAssetValue,
            },
            practiceTransactions: [
              {
                id: `ptx-${Date.now()}`,
                type,
                asset,
                amount,
                usdValue: tradeValue,
                status: "completed" as const,
                timestamp: new Date(),
                isPractice: true,
              },
              ...state.practiceTransactions,
            ],
            tradingBehavior: {
              ...state.tradingBehavior,
              totalTrades: state.tradingBehavior.totalTrades + 1,
              tradesLast24h: state.tradingBehavior.tradesLast24h + 1,
              lastTradeTime: new Date(),
              fomoBuys: feedback.type === "warning" && feedback.title.includes("FOMO") 
                ? state.tradingBehavior.fomoBuys + 1 
                : state.tradingBehavior.fomoBuys,
              panicSells: feedback.type === "warning" && feedback.title.includes("Panic")
                ? state.tradingBehavior.panicSells + 1
                : state.tradingBehavior.panicSells,
            },
          };
        });
        
        addAIInsight(feedback);
        get().checkProgressionStatus();
        
        return { success: true, feedback };
      },
      
      resetPracticePortfolio: () => {
        set({
          practicePortfolio: initialPracticePortfolio,
          practiceTransactions: [],
          tradingBehavior: initialTradingBehavior,
          aiInsights: [],
        });
      },
      
      uploadKycDocument: async (docType, file) => {
        // In production, upload to your server/cloud storage
        // For demo, we simulate the upload without storing large file data
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Simulate successful upload - in production, you'd get a URL back from your server
        const uploadSuccess = file.size > 0 && file.size < 10 * 1024 * 1024; // Max 10MB
        
        if (!uploadSuccess) {
          throw new Error("File too large. Maximum size is 10MB.");
        }
        
        set((state) => {
          if (!state.user) return state;
          
          // Only store upload status, not the actual file data
          const newDocs = { ...state.user.kycDocuments };
          if (docType === "id") {
            newDocs.idUploaded = true;
            // In production: newDocs.idFile = serverReturnedUrl;
          }
          if (docType === "addressProof") {
            newDocs.addressProofUploaded = true;
          }
          if (docType === "selfie") {
            newDocs.selfieUploaded = true;
          }
          
          let newTier = state.user.kycTier;
          if (newDocs.idUploaded && newTier < 2) newTier = 2;
          if (newDocs.idUploaded && newDocs.addressProofUploaded && newDocs.selfieUploaded && newTier < 3) newTier = 3;
          
          // Save to localStorage (without file data)
          const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
          const userIndex = users.findIndex((u: { email: string }) => u.email === state.user!.email);
          if (userIndex >= 0) {
            users[userIndex].kycDocuments = {
              idUploaded: newDocs.idUploaded,
              addressProofUploaded: newDocs.addressProofUploaded,
              selfieUploaded: newDocs.selfieUploaded,
            };
            users[userIndex].kycTier = newTier;
            localStorage.setItem("registeredUsers", JSON.stringify(users));
          }
          
          return {
            user: {
              ...state.user,
              kycDocuments: newDocs,
              kycTier: newTier as 0 | 1 | 2 | 3,
            },
          };
        });
        
        get().checkProgressionStatus();
        return true;
      },
      
      verifyPhone: async (phone, otp) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // In production, verify OTP with your backend
        if (otp.length !== 6) {
          throw new Error("Invalid OTP");
        }
        
        set((state) => {
          if (!state.user) return state;
          
          let newTier = state.user.kycTier;
          if (newTier === 0) newTier = 1;
          
          // Save to localStorage
          const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
          const userIndex = users.findIndex((u: { email: string }) => u.email === state.user!.email);
          if (userIndex >= 0) {
            users[userIndex].phone = phone;
            users[userIndex].kycTier = newTier;
            localStorage.setItem("registeredUsers", JSON.stringify(users));
          }
          
          return {
            user: {
              ...state.user,
              phone,
              kycTier: newTier as 0 | 1 | 2 | 3,
            },
          };
        });
        
        return true;
      },
      
      enableTwoFactor: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Generate a mock secret (in production, generate on server)
        const secret = "JBSWY3DPEHPK3PXP"; // Demo secret
        const qrCode = `otpauth://totp/HybridRampX:${get().user?.email}?secret=${secret}&issuer=HybridRampX`;
        
        return { secret, qrCode };
      },
      
      verifyTwoFactor: async (code) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // In production, verify TOTP code on server
        if (code.length !== 6) {
          throw new Error("Invalid code");
        }
        
        set((state) => {
          if (!state.user) return state;
          
          const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
          const userIndex = users.findIndex((u: { email: string }) => u.email === state.user!.email);
          if (userIndex >= 0) {
            users[userIndex].twoFactorEnabled = true;
            localStorage.setItem("registeredUsers", JSON.stringify(users));
          }
          
          return {
            user: { ...state.user, twoFactorEnabled: true },
          };
        });
        
        return true;
      },
      
      disableTwoFactor: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        set((state) => {
          if (!state.user) return state;
          
          const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
          const userIndex = users.findIndex((u: { email: string }) => u.email === state.user!.email);
          if (userIndex >= 0) {
            users[userIndex].twoFactorEnabled = false;
            localStorage.setItem("registeredUsers", JSON.stringify(users));
          }
          
          return {
            user: { ...state.user, twoFactorEnabled: false },
          };
        });
        
        return true;
      },
      
      changePassword: async (currentPassword, newPassword) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const { user } = get();
        if (!user) throw new Error("Not logged in");
        
        const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        const userIndex = users.findIndex((u: { email: string; password: string }) => 
          u.email === user.email && u.password === currentPassword
        );
        
        if (userIndex < 0) {
          throw new Error("Current password is incorrect");
        }
        
        users[userIndex].password = newPassword;
        localStorage.setItem("registeredUsers", JSON.stringify(users));
        
        return true;
      },
      
      addAIInsight: (insight) => {
        const newInsight: AICoachInsight = {
          ...insight,
          id: `insight-${Date.now()}`,
          timestamp: new Date(),
        };
        set((state) => ({
          aiInsights: [newInsight, ...state.aiInsights].slice(0, 50),
        }));
      },
      
      clearInsights: () => {
        set({ aiInsights: [] });
      },
      
      addSafetyWarning: (warning) => {
        const newWarning: SafetyWarning = {
          ...warning,
          id: `warning-${Date.now()}`,
        };
        set((state) => ({
          safetyWarnings: [newWarning, ...state.safetyWarnings].slice(0, 20),
        }));
      },
      
      dismissWarning: (id) => {
        set((state) => ({
          safetyWarnings: state.safetyWarnings.filter(w => w.id !== id),
        }));
      },
      
      checkProgressionStatus: () => {
        const { user, tradingBehavior } = get();
        
        let level = 1;
        let ready = false;
        
        if (tradingBehavior.totalTrades >= 5) level = 2;
        if (level >= 2 && tradingBehavior.fomoBuys <= 2 && tradingBehavior.panicSells <= 2) level = 3;
        if (level >= 3 && user && user.kycTier >= 2) level = 4;
        if (level >= 4 && tradingBehavior.totalTrades >= 10 && tradingBehavior.riskScore < 40) {
          level = 5;
          ready = true;
        }
        
        const riskScore = Math.min(100, Math.max(0,
          50 +
          (tradingBehavior.fomoBuys * 5) +
          (tradingBehavior.panicSells * 5) +
          (tradingBehavior.overtradingDays * 3) -
          (tradingBehavior.totalTrades >= 10 ? 10 : 0) -
          (user?.kycTier ? user.kycTier * 5 : 0)
        ));
        
        set({
          progressionLevel: level,
          isReadyForRealTrading: ready,
          tradingBehavior: {
            ...get().tradingBehavior,
            riskScore,
          },
        });
      },
      
      // Fetch real prices from CoinGecko
      fetchMarketPrices: async () => {
        set({ isLoadingPrices: true });
        
        try {
          const symbols = ["BTC", "ETH", "USDT", "MATIC", "SOL", "DOGE", "BNB", "XRP", "ADA"];
          const marketData = await getMarketData(symbols);
          
          const prices: Record<string, { price: number; change24h: number }> = {};
          marketData.forEach((coin) => {
            const symbol = coin.symbol.toUpperCase();
            prices[symbol] = {
              price: coin.current_price,
              change24h: coin.price_change_percentage_24h,
            };
          });
          
          // Update assets with real prices
          set((state) => ({
            marketPrices: prices,
            isLoadingPrices: false,
            lastPriceUpdate: new Date(),
            assets: state.assets.map(asset => {
              const priceData = prices[asset.symbol];
              if (priceData) {
                return {
                  ...asset,
                  price: priceData.price,
                  change24h: priceData.change24h,
                  usdValue: asset.balance * priceData.price,
                };
              }
              return asset;
            }),
          }));
        } catch (error) {
          console.error("Failed to fetch market prices:", error);
          set({ isLoadingPrices: false });
          
          // Fallback to mock prices
          const fallbackPrices = {
            BTC: { price: 43250, change24h: 2.5 },
            ETH: { price: 2280, change24h: 3.1 },
            USDT: { price: 1, change24h: 0.01 },
            MATIC: { price: 0.85, change24h: -1.2 },
            SOL: { price: 98, change24h: 5.4 },
            DOGE: { price: 0.082, change24h: -2.1 },
          };
          set({ marketPrices: fallbackPrices });
        }
      },
      
      updateMarketPrices: () => {
        // Trigger a fresh fetch
        get().fetchMarketPrices();
      },
    }),
    {
      name: "hybrid-ramp-storage",
      partialize: (state) => {
        // Create a sanitized user object without large file data
        const sanitizedUser = state.user ? {
          ...state.user,
          kycDocuments: {
            idUploaded: state.user.kycDocuments.idUploaded,
            addressProofUploaded: state.user.kycDocuments.addressProofUploaded,
            selfieUploaded: state.user.kycDocuments.selfieUploaded,
            // Don't persist actual file data - too large for localStorage
          },
        } : null;

        return {
          user: sanitizedUser,
          isAuthenticated: state.isAuthenticated,
          assets: state.assets,
          // Only keep last 20 transactions to prevent storage bloat
          transactions: state.transactions.slice(0, 20),
          practicePortfolio: {
            ...state.practicePortfolio,
            // Limit practice assets
            assets: state.practicePortfolio.assets.slice(0, 10),
          },
          // Only keep last 20 practice transactions
          practiceTransactions: state.practiceTransactions.slice(0, 20),
          tradingBehavior: state.tradingBehavior,
          progressionLevel: state.progressionLevel,
        };
      },
    }
  )
);
