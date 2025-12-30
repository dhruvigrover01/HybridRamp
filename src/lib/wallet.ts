import { BrowserProvider, formatEther, parseEther } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      selectedAddress: string | null;
    };
  }
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  error: string | null;
}

export const SUPPORTED_CHAINS = {
  1: { name: "Ethereum Mainnet", symbol: "ETH", explorer: "https://etherscan.io" },
  5: { name: "Goerli Testnet", symbol: "ETH", explorer: "https://goerli.etherscan.io" },
  11155111: { name: "Sepolia Testnet", symbol: "ETH", explorer: "https://sepolia.etherscan.io" },
  137: { name: "Polygon Mainnet", symbol: "MATIC", explorer: "https://polygonscan.com" },
  80001: { name: "Mumbai Testnet", symbol: "MATIC", explorer: "https://mumbai.polygonscan.com" },
  56: { name: "BNB Smart Chain", symbol: "BNB", explorer: "https://bscscan.com" },
  42161: { name: "Arbitrum One", symbol: "ETH", explorer: "https://arbiscan.io" },
  10: { name: "Optimism", symbol: "ETH", explorer: "https://optimistic.etherscan.io" },
};

export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask === true;
};

export const connectWallet = async (): Promise<{ address: string; chainId: number }> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
  }

  try {
    // Request account access
    const accounts = await window.ethereum!.request({
      method: "eth_requestAccounts",
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock MetaMask and try again.");
    }

    // Get current chain ID
    const chainIdHex = await window.ethereum!.request({
      method: "eth_chainId",
    }) as string;

    const chainId = parseInt(chainIdHex, 16);

    return {
      address: accounts[0],
      chainId,
    };
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    
    // User rejected the request
    if (err.code === 4001) {
      throw new Error("Connection rejected. Please click 'Connect' in MetaMask to approve.");
    }
    
    // Request already pending
    if (err.code === -32002) {
      throw new Error("Connection request already pending. Please check MetaMask popup.");
    }
    
    // MetaMask is locked
    if (err.code === -32603) {
      throw new Error("MetaMask is locked. Please unlock it and try again.");
    }
    
    // Generic error with message
    if (err.message) {
      throw new Error(err.message);
    }
    
    throw new Error("Failed to connect wallet. Please try again.");
  }
};

export const disconnectWallet = (): void => {
  // MetaMask doesn't have a disconnect method, but we can clear local state
  // The user needs to disconnect from MetaMask settings manually
  console.log("Wallet disconnected from app state");
};

export const getBalance = async (address: string): Promise<string> => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new BrowserProvider(window.ethereum);
  const balance = await provider.getBalance(address);
  return formatEther(balance);
};

export const switchNetwork = async (chainId: number): Promise<void> => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: unknown) {
    // Chain not added to MetaMask
    if ((error as { code?: number }).code === 4902) {
      throw new Error("This network is not available in your MetaMask. Please add it manually.");
    }
    throw error;
  }
};

export const getChainName = (chainId: number): string => {
  return SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS]?.name || `Unknown Chain (${chainId})`;
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Listen for account changes
export const onAccountsChanged = (callback: (accounts: string[]) => void): (() => void) => {
  if (!window.ethereum) return () => {};
  
  const handler = (accounts: unknown) => callback(accounts as string[]);
  window.ethereum.on("accountsChanged", handler);
  return () => window.ethereum?.removeListener("accountsChanged", handler);
};

// Listen for chain changes
export const onChainChanged = (callback: (chainId: number) => void): (() => void) => {
  if (!window.ethereum) return () => {};
  
  const handler = (chainIdHex: unknown) => callback(parseInt(chainIdHex as string, 16));
  window.ethereum.on("chainChanged", handler);
  return () => window.ethereum?.removeListener("chainChanged", handler);
};

// Check if already connected
export const checkConnection = async (): Promise<{ address: string; chainId: number } | null> => {
  if (!isMetaMaskInstalled()) return null;

  try {
    const accounts = await window.ethereum!.request({
      method: "eth_accounts",
    }) as string[];

    if (accounts && accounts.length > 0) {
      const chainIdHex = await window.ethereum!.request({
        method: "eth_chainId",
      }) as string;

      return {
        address: accounts[0],
        chainId: parseInt(chainIdHex, 16),
      };
    }
    return null;
  } catch {
    return null;
  }
};

// Send transaction
export const sendTransaction = async (
  to: string,
  amount: string
): Promise<string> => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const tx = await signer.sendTransaction({
    to,
    value: parseEther(amount),
  });

  return tx.hash;
};

