import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CollateralAsset {
  symbol: string;
  amount: number;
  valueAtLock: number;
  currentValue: number;
  lockedAt: Date;
}

export interface Loan {
  id: string;
  userId: string;
  status: "active" | "repaid" | "liquidated" | "warning";
  collateral: CollateralAsset[];
  totalCollateralValue: number;
  borrowedAmount: number;
  ltvRatio: number;
  currentLtv: number;
  interestRate: number;
  accruedInterest: number;
  totalOwed: number;
  createdAt: Date;
  dueDate: Date;
  lastInterestUpdate: Date;
  repayments: Array<{ id: string; amount: number; timestamp: Date; type: "principal" | "interest" | "full" }>;
  liquidationThreshold: number;
  liquidationWarningThreshold: number;
}

export interface LoanTerms {
  ltvRatio: number;
  interestRate: number;
  liquidationThreshold: number;
  warningThreshold: number;
  minLoanAmount: number;
  maxLoanDuration: number;
}

interface LoansState {
  loans: Loan[];
  mockFiatBalance: number;
  loanTerms: Record<number, LoanTerms>;
  calculateEligibility: (userId: string, kycTier: number, assets: Array<{ symbol: string; balance: number }>, marketPrices: Record<string, { price: number }>, existingLoans: Loan[]) => {
    eligible: boolean; maxLoanAmount: number; availableCollateral: Array<{ symbol: string; amount: number; value: number; maxLoanValue: number }>; ltvRatio: number; interestRate: number; reasons: string[];
  };
  requestLoan: (userId: string, kycTier: number, amount: number, collateralAssets: Array<{ symbol: string; amount: number }>, marketPrices: Record<string, { price: number }>, durationDays: number) => Promise<Loan>;
  repayLoan: (loanId: string, amount: number) => Promise<{ success: boolean; remainingBalance: number }>;
  updateLoanValues: (marketPrices: Record<string, { price: number }>) => void;
  checkLiquidation: (loanId: string) => { shouldLiquidate: boolean; shouldWarn: boolean; currentLtv: number };
  liquidateLoan: (loanId: string, marketPrices: Record<string, { price: number }>) => Promise<{ liquidatedAssets: CollateralAsset[]; recoveredAmount: number }>;
  getUserLoans: (userId: string) => Loan[];
  getTotalBorrowed: (userId: string) => number;
  getLockedCollateral: (userId: string) => CollateralAsset[];
}

const defaultLoanTerms: Record<number, LoanTerms> = {
  0: { ltvRatio: 0, interestRate: 0, liquidationThreshold: 0, warningThreshold: 0, minLoanAmount: 0, maxLoanDuration: 0 },
  1: { ltvRatio: 30, interestRate: 12, liquidationThreshold: 80, warningThreshold: 65, minLoanAmount: 50, maxLoanDuration: 30 },
  2: { ltvRatio: 40, interestRate: 10, liquidationThreshold: 85, warningThreshold: 70, minLoanAmount: 100, maxLoanDuration: 90 },
  3: { ltvRatio: 50, interestRate: 8, liquidationThreshold: 90, warningThreshold: 75, minLoanAmount: 100, maxLoanDuration: 180 },
};

export const useLoansStore = create<LoansState>()(
  persist((set, get) => ({
    loans: [],
    mockFiatBalance: 0,
    loanTerms: defaultLoanTerms,

    calculateEligibility: (userId, kycTier, assets, marketPrices, existingLoans) => {
      const terms = get().loanTerms[kycTier];
      const reasons: string[] = [];

      if (kycTier === 0) {
        return { eligible: false, maxLoanAmount: 0, availableCollateral: [], ltvRatio: 0, interestRate: 0, reasons: ["KYC verification required to access loans. Please complete at least Tier 1 verification."] };
      }

      const lockedAssets = get().getLockedCollateral(userId);
      const lockedBySymbol = lockedAssets.reduce((acc, a) => { acc[a.symbol] = (acc[a.symbol] || 0) + a.amount; return acc; }, {} as Record<string, number>);

      const availableCollateral = assets.filter(a => a.balance > 0).map(asset => {
        const locked = lockedBySymbol[asset.symbol] || 0;
        const available = Math.max(0, asset.balance - locked);
        const price = marketPrices[asset.symbol]?.price || 0;
        const value = available * price;
        const maxLoanValue = (value * terms.ltvRatio) / 100;
        return { symbol: asset.symbol, amount: available, value, maxLoanValue };
      }).filter(a => a.value > 0);

      const totalCollateralValue = availableCollateral.reduce((sum, a) => sum + a.value, 0);
      const maxLoanAmount = (totalCollateralValue * terms.ltvRatio) / 100;

      const activeLoans = existingLoans.filter(l => l.status === "active");
      const totalExistingDebt = activeLoans.reduce((sum, l) => sum + (l as any).totalOwed || 0, 0);

      const adjustedMaxLoan = Math.max(0, maxLoanAmount - totalExistingDebt);

      if (availableCollateral.length === 0) reasons.push("No eligible collateral assets available.");
      if (totalCollateralValue < 100) reasons.push("Minimum collateral value of $100 required.");
      if (adjustedMaxLoan < terms.minLoanAmount) reasons.push(`Maximum loan amount ($${adjustedMaxLoan.toFixed(2)}) is below minimum ($${terms.minLoanAmount}).`);
      if (activeLoans.length >= 3) reasons.push("Maximum of 3 active loans allowed.");

      const eligible = reasons.length === 0 && adjustedMaxLoan >= terms.minLoanAmount;

      return { eligible, maxLoanAmount: adjustedMaxLoan, availableCollateral, ltvRatio: terms.ltvRatio, interestRate: terms.interestRate, reasons };
    },

    requestLoan: async (userId, kycTier, amount, collateralAssets, marketPrices, durationDays) => {
      const terms = get().loanTerms[kycTier];
      if (!terms || terms.ltvRatio === 0) throw new Error("KYC verification required for loans");
      if (amount < terms.minLoanAmount) throw new Error(`Minimum loan amount is $${terms.minLoanAmount}`);
      if (durationDays > terms.maxLoanDuration) throw new Error(`Maximum loan duration is ${terms.maxLoanDuration} days`);

      const collateral: CollateralAsset[] = collateralAssets.map(asset => {
        const price = marketPrices[asset.symbol]?.price || 0; const value = asset.amount * price;
        return { symbol: asset.symbol, amount: asset.amount, valueAtLock: value, currentValue: value, lockedAt: new Date() };
      });

      const totalCollateralValue = collateral.reduce((sum, c) => sum + c.valueAtLock, 0);
      const maxLoanForCollateral = (totalCollateralValue * terms.ltvRatio) / 100;
      if (amount > maxLoanForCollateral) throw new Error(`Requested amount exceeds maximum loan value for provided collateral ($${maxLoanForCollateral.toFixed(2)})`);

      const ltvAtOrigination = (amount / totalCollateralValue) * 100;
      await new Promise(resolve => setTimeout(resolve, 2000));

      const loan: Loan = {
        id: `loan-${Date.now()}`,
        userId,
        status: "active",
        collateral,
        totalCollateralValue,
        borrowedAmount: amount,
        ltvRatio: ltvAtOrigination,
        currentLtv: ltvAtOrigination,
        interestRate: terms.interestRate,
        accruedInterest: 0,
        totalOwed: amount,
        createdAt: new Date(),
        dueDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        lastInterestUpdate: new Date(),
        repayments: [],
        liquidationThreshold: terms.liquidationThreshold,
        liquidationWarningThreshold: terms.warningThreshold,
      };

      set(state => ({ loans: [...state.loans, loan], mockFiatBalance: state.mockFiatBalance + amount }));
      return loan;
    },

    repayLoan: async (loanId, amount) => {
      const loan = get().loans.find(l => l.id === loanId);
      if (!loan) throw new Error("Loan not found");
      if (loan.status !== "active") throw new Error("Loan is not active");

      await new Promise(resolve => setTimeout(resolve, 1000));

      const repaymentAmount = Math.min(amount, loan.totalOwed);
      const remainingBalance = loan.totalOwed - repaymentAmount;
      const isFullRepayment = remainingBalance <= 0.01;

      const repayment = { id: `rep-${Date.now()}`, amount: repaymentAmount, timestamp: new Date(), type: isFullRepayment ? "full" as const : "principal" as const };

      set(state => ({ loans: state.loans.map(l => l.id === loanId ? { ...l, totalOwed: remainingBalance, status: isFullRepayment ? "repaid" as const : l.status, repayments: [...l.repayments, repayment] } : l), mockFiatBalance: Math.max(0, state.mockFiatBalance - repaymentAmount) }));

      return { success: true, remainingBalance };
    },

    updateLoanValues: (marketPrices) => {
      const now = new Date();
      set(state => ({ loans: state.loans.map(loan => {
        if (loan.status !== "active") return loan;
        const updatedCollateral = loan.collateral.map(c => ({ ...c, currentValue: c.amount * (marketPrices[c.symbol]?.price || c.valueAtLock / c.amount) }));
        const newCollateralValue = updatedCollateral.reduce((sum, c) => sum + c.currentValue, 0);
        const newLtv = (loan.totalOwed / newCollateralValue) * 100;
        const daysSinceLastUpdate = (now.getTime() - new Date(loan.lastInterestUpdate).getTime()) / (1000 * 60 * 60 * 24);
        const dailyRate = loan.interestRate / 365 / 100;
        const newInterest = loan.totalOwed * dailyRate * daysSinceLastUpdate;
        const newTotalOwed = loan.totalOwed + newInterest;
        let newStatus = loan.status;
        if (newLtv >= loan.liquidationThreshold) newStatus = "liquidated";
        else if (newLtv >= loan.liquidationWarningThreshold) newStatus = "warning";
        return { ...loan, collateral: updatedCollateral, totalCollateralValue: newCollateralValue, currentLtv: newLtv, accruedInterest: loan.accruedInterest + newInterest, totalOwed: newTotalOwed, lastInterestUpdate: now, status: newStatus };
      }) }));
    },

    checkLiquidation: (loanId) => {
      const loan = get().loans.find(l => l.id === loanId);
      if (!loan) return { shouldLiquidate: false, shouldWarn: false, currentLtv: 0 };
      return { shouldLiquidate: loan.currentLtv >= loan.liquidationThreshold, shouldWarn: loan.currentLtv >= loan.liquidationWarningThreshold, currentLtv: loan.currentLtv };
    },

    liquidateLoan: async (loanId, marketPrices) => {
      const loan = get().loans.find(l => l.id === loanId);
      if (!loan) throw new Error("Loan not found");
      await new Promise(resolve => setTimeout(resolve, 1500));
      const debtToCover = loan.totalOwed; let recoveredAmount = 0; const liquidatedAssets: CollateralAsset[] = [];
      for (const collateral of loan.collateral) {
        if (recoveredAmount >= debtToCover) break;
        const currentPrice = marketPrices[collateral.symbol]?.price || collateral.currentValue / collateral.amount;
        const needed = debtToCover - recoveredAmount;
        const amountToSell = Math.min(collateral.amount, needed / currentPrice);
        const valueRecovered = amountToSell * currentPrice;
        liquidatedAssets.push({ ...collateral, amount: amountToSell, currentValue: valueRecovered });
        recoveredAmount += valueRecovered;
      }
      set(state => ({ loans: state.loans.map(l => l.id === loanId ? { ...l, status: "liquidated" as const, totalOwed: 0 } : l) }));
      return { liquidatedAssets, recoveredAmount };
    },

    getUserLoans: (userId) => get().loans.filter(l => l.userId === userId),

    getTotalBorrowed: (userId) => get().loans.filter(l => l.userId === userId && l.status === "active").reduce((sum, l) => sum + l.borrowedAmount, 0),

    getLockedCollateral: (userId) => get().loans.filter(l => l.userId === userId && l.status === "active").flatMap(l => l.collateral),

  }), { name: "hybrid-ramp-loans-storage", partialize: (state) => ({ loans: state.loans.slice(0, 50), mockFiatBalance: state.mockFiatBalance }) })
);

