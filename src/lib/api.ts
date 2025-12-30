// CoinGecko API for real crypto prices
const COINGECKO_API = "https://api.coingecko.com/api/v3";

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export interface CryptoPriceSimple {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

// Map of common symbols to CoinGecko IDs
const COIN_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  SOL: "solana",
  MATIC: "matic-network",
  DOT: "polkadot",
  SHIB: "shiba-inu",
  LTC: "litecoin",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  XLM: "stellar",
  ETC: "ethereum-classic",
  FIL: "filecoin",
};

// Get prices for multiple coins
export const getCryptoPrices = async (symbols: string[]): Promise<CryptoPriceSimple> => {
  const ids = symbols.map(s => COIN_IDS[s.toUpperCase()] || s.toLowerCase()).join(",");
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch prices");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    throw error;
  }
};

// Get detailed market data
export const getMarketData = async (symbols: string[]): Promise<CryptoPrice[]> => {
  const ids = symbols.map(s => COIN_IDS[s.toUpperCase()] || s.toLowerCase()).join(",");
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch market data");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching market data:", error);
    throw error;
  }
};

// Get top coins by market cap
export const getTopCoins = async (limit: number = 20): Promise<CryptoPrice[]> => {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch top coins");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching top coins:", error);
    throw error;
  }
};

// Get price for a single coin
export const getCoinPrice = async (symbol: string): Promise<{ price: number; change24h: number }> => {
  const id = COIN_IDS[symbol.toUpperCase()] || symbol.toLowerCase();
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch price");
    }
    
    const data = await response.json();
    const coinData = data[id];
    
    if (!coinData) {
      throw new Error(`Price not found for ${symbol}`);
    }
    
    return {
      price: coinData.usd,
      change24h: coinData.usd_24h_change || 0,
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    throw error;
  }
};

// Get historical price data
export const getHistoricalPrices = async (
  symbol: string,
  days: number = 7
): Promise<{ prices: [number, number][] }> => {
  const id = COIN_IDS[symbol.toUpperCase()] || symbol.toLowerCase();
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch historical prices");
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching historical prices for ${symbol}:`, error);
    throw error;
  }
};

// Currency conversion rates (fiat)
export const getFiatRates = async (): Promise<Record<string, number>> => {
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch fiat rates");
    }
    
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error("Error fetching fiat rates:", error);
    // Return default rates if API fails
    return {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      INR: 83.12,
      JPY: 149.50,
    };
  }
};

// Validate wallet address
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Get gas price estimate
export const getGasPrice = async (): Promise<{ slow: number; average: number; fast: number }> => {
  try {
    // Using Etherscan Gas Tracker API (free tier)
    const response = await fetch(
      "https://api.etherscan.io/api?module=gastracker&action=gasoracle"
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch gas price");
    }
    
    const data = await response.json();
    
    if (data.status === "1" && data.result) {
      return {
        slow: parseInt(data.result.SafeGasPrice),
        average: parseInt(data.result.ProposeGasPrice),
        fast: parseInt(data.result.FastGasPrice),
      };
    }
    
    // Default gas prices if API fails
    return { slow: 20, average: 30, fast: 50 };
  } catch (error) {
    console.error("Error fetching gas price:", error);
    return { slow: 20, average: 30, fast: 50 };
  }
};

