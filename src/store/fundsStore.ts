import { create } from "zustand";
import { persist } from "zustand/middleware";

// Fund Types
export interface FundAsset {
  symbol: string;
  name: string;
  allocation: number; // Percentage (0-100)
  currentPrice?: number;
}

export interface CryptoFund {
  id: string;
  name: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  category: "safe" | "growth" | "beginner" | "aggressive";
  minInvestment: number;
  managementFee: number; // Annual percentage
  assets: FundAsset[];
  historicalReturn: number; // Simulated annual return %
  volatility: number; // Standard deviation %
  icon: string;
  color: string;
}

export interface FundInvestment {
  id: string;
  fundId: string;
  userId: string;
  investedAmount: number;
  investedAt: Date;
  currentValue: number;
  shares: number; // Virtual shares in the fund
  assetBreakdown: Array<{
    symbol: string;
    amount: number;
    value: number;
    purchasePrice: number;
  }>;
  status: "active" | "withdrawn" | "rebalancing";
  lastRebalanced: Date;
  returns: number; // Percentage
  returnsAmount: number; // USD
  fundTokenTx?: string;
}

export interface RebalanceEvent {
  id: string;
  investmentId: string;
  timestamp: Date;
  beforeValue: number;
  afterValue: number;
  trades: Array<{
    asset: string;
    action: "buy" | "sell";
    amount: number;
    price: number;
  }>;
}

interface FundsState {
  // Available funds
  funds: CryptoFund[];
  
  // User investments
  investments: FundInvestment[];
  rebalanceHistory: RebalanceEvent[];
  
  // UI State
  isInvesting: boolean;
  selectedFund: CryptoFund | null;
  
  // Actions
  investInFund: (fundId: string, amount: number, userId: string, marketPrices: Record<string, { price: number }>, opts?: { signer?: any; onChain?: boolean }) => Promise<FundInvestment>;
  withdrawFromFund: (investmentId: string, marketPrices: Record<string, { price: number }>) => Promise<{ amount: number; breakdown: Array<{ symbol: string; amount: number; value: number }> }>;
  rebalanceFund: (investmentId: string, marketPrices: Record<string, { price: number }>) => Promise<RebalanceEvent>;
  updateInvestmentValues: (marketPrices: Record<string, { price: number }>) => void;
  getFundById: (fundId: string) => CryptoFund | undefined;
  getUserInvestments: (userId: string) => FundInvestment[];
  getTotalInvestedValue: (userId: string) => number;
  setSelectedFund: (fund: CryptoFund | null) => void;
}

// Predefined Crypto Funds
const predefinedFunds: CryptoFund[] = [
  {
    id: "safe-fund",
    name: "Safe Harbor Fund",
    description: "A conservative fund focused on established cryptocurrencies and stablecoins. Ideal for risk-averse investors seeking stability.",
    riskLevel: "low",
    category: "safe",
    minInvestment: 50,
    managementFee: 0.5,
    assets: [
      { symbol: "BTC", name: "Bitcoin", allocation: 40 },
      { symbol: "ETH", name: "Ethereum", allocation: 30 },
      { symbol: "USDT", name: "Tether", allocation: 20 },
      { symbol: "USDC", name: "USD Coin", allocation: 10 },
    ],
    historicalReturn: 8.5,
    volatility: 12,
    icon: "🛡️",
    color: "emerald",
  },
  {
    id: "growth-fund",
    name: "Growth Accelerator Fund",
    description: "A balanced fund targeting long-term growth through a mix of large-cap cryptocurrencies with proven track records.",
    riskLevel: "medium",
    category: "growth",
    minInvestment: 100,
    managementFee: 1.0,
    assets: [
      { symbol: "BTC", name: "Bitcoin", allocation: 35 },
      { symbol: "ETH", name: "Ethereum", allocation: 35 },
      { symbol: "SOL", name: "Solana", allocation: 15 },
      { symbol: "MATIC", name: "Polygon", allocation: 15 },
    ],
    historicalReturn: 18.5,
    volatility: 28,
    icon: "📈",
    color: "blue",
  },
  {
    id: "beginner-fund",
    name: "Beginner's Starter Fund",
    description: "Perfect for crypto newcomers. Ultra-low volatility with heavy stablecoin allocation and minimal exposure to price swings.",
    riskLevel: "low",
    category: "beginner",
    minInvestment: 25,
    managementFee: 0.25,
    assets: [
      { symbol: "USDT", name: "Tether", allocation: 50 },
      { symbol: "BTC", name: "Bitcoin", allocation: 30 },
      { symbol: "ETH", name: "Ethereum", allocation: 20 },
    ],
    historicalReturn: 5.2,
    volatility: 6,
    icon: "🌱",
    color: "green",
  },
  {
    id: "aggressive-fund",
    name: "High Growth Fund",
    description: "For experienced investors seeking maximum returns. Higher risk with exposure to emerging cryptocurrencies.",
    riskLevel: "high",
    category: "aggressive",
    minInvestment: 250,
    managementFee: 1.5,
    assets: [
      { symbol: "ETH", name: "Ethereum", allocation: 30 },
      { symbol: "SOL", name: "Solana", allocation: 25 },
      { symbol: "MATIC", name: "Polygon", allocation: 20 },
      { symbol: "DOGE", name: "Dogecoin", allocation: 15 },
      { symbol: "BTC", name: "Bitcoin", allocation: 10 },
    ],
    historicalReturn: 35.0,
    volatility: 55,
    icon: "🚀",
    color: "purple",
  },
  {
    id: "defi-fund",
    name: "DeFi Innovation Fund",
    description: "Focused on decentralized finance protocols and layer-2 solutions. For investors bullish on DeFi ecosystem.",
    riskLevel: "high",
    category: "aggressive",
    minInvestment: 200,
    managementFee: 1.25,
    assets: [
      { symbol: "ETH", name: "Ethereum", allocation: 40 },
      { symbol: "MATIC", name: "Polygon", allocation: 25 },
      { symbol: "SOL", name: "Solana", allocation: 20 },
      { symbol: "LINK", name: "Chainlink", allocation: 15 },
    ],
    historicalReturn: 28.0,
    volatility: 45,
    icon: "🔗",
    color: "indigo",
  },
];

export const useFundsStore = create<FundsState>()(
  persist(
    (set, get) => ({
      funds: predefinedFunds,
      investments: [],
      rebalanceHistory: [],
      isInvesting: false,
      selectedFund: null,

      investInFund: async (fundId, amount, userId, marketPrices, opts) => {
        set({ isInvesting: true });
        
        const fund = get().funds.find(f => f.id === fundId);
        if (!fund) {
          set({ isInvesting: false });
          throw new Error("Fund not found");
        }

        if (amount < fund.minInvestment) {
          set({ isInvesting: false });
          throw new Error(`Minimum investment is $${fund.minInvestment}`);
        }

        // Calculate asset breakdown based on allocation
        const assetBreakdown = fund.assets.map(asset => {
          const allocationAmount = (amount * asset.allocation) / 100;
          const price = marketPrices[asset.symbol]?.price || 1;
          const cryptoAmount = allocationAmount / price;
          
          return {
            symbol: asset.symbol,
            amount: cryptoAmount,
            value: allocationAmount,
            purchasePrice: price,
          };
        });
        // If on-chain settlement requested, attempt to execute basket and mint fund token
        let fundTokenTx: string | undefined;
        if (opts?.onChain && opts.signer) {
          try {
            const { executeBasket } = await import("@/lib/smartExecution");
            const allocations = fund.assets.map(a => ({ symbol: a.symbol, percent: a.allocation }));
            const res = await executeBasket({
              allocations,
              totalUsd: amount,
              fundTokenAddress: (import.meta.env.VITE_FUND_TOKEN_ADDRESS as string) || (import.meta.env.VITE_ERC20_ADDRESS as string),
              recipientAddress: await opts.signer.getAddress(),
              signer: opts.signer,
            });
            if (res.fundTokenTx) fundTokenTx = res.fundTokenTx;
          } catch (e) {
            // swallow on-chain errors and continue with simulated allocation
          }
        }

        // Calculate virtual shares (1 share = $100 NAV)
        const sharePrice = 100;
        const shares = amount / sharePrice;

        const investment: FundInvestment = {
          id: `inv-${Date.now()}`,
          fundId,
          userId,
          investedAmount: amount,
          investedAt: new Date(),
          currentValue: amount,
          shares,
          assetBreakdown,
          status: "active",
          lastRebalanced: new Date(),
          returns: 0,
          returnsAmount: 0,
          // optional on-chain fund token tx
          // @ts-ignore allow dynamic prop
          fundTokenTx,
        };

        set(state => ({
          investments: [...state.investments, investment],
          isInvesting: false,
        }));

        return investment;
      },

      withdrawFromFund: async (investmentId, marketPrices) => {
        const investment = get().investments.find(i => i.id === investmentId);
        if (!investment) {
          throw new Error("Investment not found");
        }

        // Calculate current value
        const breakdown = investment.assetBreakdown.map(asset => {
          const currentPrice = marketPrices[asset.symbol]?.price || asset.purchasePrice;
          return {
            symbol: asset.symbol,
            amount: asset.amount,
            value: asset.amount * currentPrice,
          };
        });

        const totalValue = breakdown.reduce((sum, a) => sum + a.value, 0);

        // Update investment status
        set(state => ({
          investments: state.investments.map(i =>
            i.id === investmentId
              ? { ...i, status: "withdrawn" as const, currentValue: totalValue }
              : i
          ),
        }));

        return { amount: totalValue, breakdown };
      },

      rebalanceFund: async (investmentId, marketPrices) => {
        const investment = get().investments.find(i => i.id === investmentId);
        const fund = get().funds.find(f => f.id === investment?.fundId);
        
        if (!investment || !fund) {
          throw new Error("Investment or fund not found");
        }

        const beforeValue = investment.currentValue;
        const trades: RebalanceEvent["trades"] = [];

        // Calculate current values and target allocations
        const currentTotal = investment.assetBreakdown.reduce((sum, asset) => {
          const price = marketPrices[asset.symbol]?.price || asset.purchasePrice;
          return sum + (asset.amount * price);
        }, 0);

        // Generate rebalancing trades
        const newBreakdown = fund.assets.map(fundAsset => {
          const currentAsset = investment.assetBreakdown.find(a => a.symbol === fundAsset.symbol);
          const targetValue = (currentTotal * fundAsset.allocation) / 100;
          const currentPrice = marketPrices[fundAsset.symbol]?.price || 1;
          const currentValue = currentAsset ? currentAsset.amount * currentPrice : 0;
          
          const difference = targetValue - currentValue;
          
          if (Math.abs(difference) > 1) { // Only trade if difference > $1
            trades.push({
              asset: fundAsset.symbol,
              action: difference > 0 ? "buy" : "sell",
              amount: Math.abs(difference) / currentPrice,
              price: currentPrice,
            });
          }

          return {
            symbol: fundAsset.symbol,
            amount: targetValue / currentPrice,
            value: targetValue,
            purchasePrice: currentPrice,
          };
        });

        const rebalanceEvent: RebalanceEvent = {
          id: `reb-${Date.now()}`,
          investmentId,
          timestamp: new Date(),
          beforeValue,
          afterValue: currentTotal,
          trades,
        };

        set(state => ({
          investments: state.investments.map(i =>
            i.id === investmentId
              ? {
                  ...i,
                  assetBreakdown: newBreakdown,
                  currentValue: currentTotal,
                  lastRebalanced: new Date(),
                }
              : i
          ),
          rebalanceHistory: [...state.rebalanceHistory, rebalanceEvent],
        }));

        return rebalanceEvent;
      },

      updateInvestmentValues: (marketPrices) => {
        set(state => ({
          investments: state.investments.map(investment => {
            if (investment.status !== "active") return investment;

            const currentValue = investment.assetBreakdown.reduce((sum, asset) => {
              const price = marketPrices[asset.symbol]?.price || asset.purchasePrice;
              return sum + (asset.amount * price);
            }, 0);

            const returnsAmount = currentValue - investment.investedAmount;
            const returns = (returnsAmount / investment.investedAmount) * 100;

            return {
              ...investment,
              currentValue,
              returns,
              returnsAmount,
            };
          }),
        }));
      },

      getFundById: (fundId) => {
        return get().funds.find(f => f.id === fundId);
      },

      getUserInvestments: (userId) => {
        return get().investments.filter(i => i.userId === userId && i.status === "active");
      },

      getTotalInvestedValue: (userId) => {
        return get().investments
          .filter(i => i.userId === userId && i.status === "active")
          .reduce((sum, i) => sum + i.currentValue, 0);
      },

      setSelectedFund: (fund) => {
        set({ selectedFund: fund });
      },
    }),
    {
      name: "hybrid-ramp-funds-storage",
      partialize: (state) => ({
        investments: state.investments.slice(0, 50),
        rebalanceHistory: state.rebalanceHistory.slice(0, 100),
      }),
    }
  )
);


