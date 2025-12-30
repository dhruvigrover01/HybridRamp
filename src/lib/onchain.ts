import { BrowserProvider, Contract, parseUnits, type Signer } from "ethers";

const ERC20_MINIMAL_ABI = [
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
];

export async function connectWallet(): Promise<Signer | null> {
  if ((window as any).ethereum) {
    const provider = new BrowserProvider((window as any).ethereum);
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    return provider.getSigner();
  }

  return null;
}

async function getDecimals(tokenAddress: string, signerOrProvider: any) {
  try {
    const c = new Contract(tokenAddress, ERC20_MINIMAL_ABI, signerOrProvider);
    return await c.decimals();
  } catch (e) {
    return 18;
  }
}

export async function mintTokens(tokenAddress: string, to: string, amountTokens: string, signer: Signer) {
  const decimals = await getDecimals(tokenAddress, signer);
  const value = parseUnits(amountTokens, decimals);
  const contract = new Contract(tokenAddress, ERC20_MINIMAL_ABI, signer);
  const tx = await contract.mint(to, value);
  return tx.hash;
}

export async function transferTokens(tokenAddress: string, to: string, amountTokens: string, signer: Signer) {
  const decimals = await getDecimals(tokenAddress, signer);
  const value = parseUnits(amountTokens, decimals);
  const contract = new Contract(tokenAddress, ERC20_MINIMAL_ABI, signer);
  const tx = await contract.transfer(to, value);
  return tx.hash;
}

export function getExplorerTxUrl(txHash: string) {
  const explorer = (import.meta.env.VITE_EXPLORER_URL as string) || "https://sepolia.etherscan.io/tx";
  return `${explorer.replace(/\/$/, "")}/${txHash}`;
}
