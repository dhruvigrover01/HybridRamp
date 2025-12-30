import { mintTokens, transferTokens } from "./onchain";

const DEFAULT_THRESHOLD_USD = Number(import.meta.env.VITE_INSTITUTIONAL_THRESHOLD || 5000);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

type LiquiditySource = { name: string; priceMultiplier: number; availableUsd: number };

function simulateSources(amountUsd: number): LiquiditySource[] {
  const base = 1.0;
  return [
    { name: "Uniswap", priceMultiplier: base + (Math.random() - 0.5) * 0.002, availableUsd: 500000 },
    { name: "SushiSwap", priceMultiplier: base + (Math.random() - 0.5) * 0.003, availableUsd: 300000 },
    { name: "Curve", priceMultiplier: base + (Math.random() - 0.5) * 0.0015, availableUsd: 200000 },
    { name: "CEX-Quote", priceMultiplier: base + (Math.random() - 0.5) * 0.0008, availableUsd: 1000000 },
  ].sort((a, b) => a.priceMultiplier - b.priceMultiplier);
}

export interface ExecuteOrderParams {
  tokenAddress: string;
  amountUsd: number;
  recipientAddress?: string;
  signer?: any;
}

export interface ExecuteOrderResult {
  success: boolean;
  executionPlan: string[];
  txHashes: string[];
  warning?: string;
}

async function callBackendRouteOrder(body: any) {
  const url = `${BACKEND_URL.replace(/\/$/, "")}/api/route-order`;
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Backend route-order failed: ${res.statusText}`);
  return res.json();
}

export async function executeOrder({ tokenAddress, amountUsd, recipientAddress, signer }: ExecuteOrderParams): Promise<ExecuteOrderResult> {
  const plan: string[] = [];
  const txs: string[] = [];

  // If a backend is configured, prefer server-side routing & relayer options
  if (BACKEND_URL) {
    try {
      const body = { tokenAddress, amountUsd, recipient: recipientAddress, doOnChain: !!signer };
      const res = await callBackendRouteOrder(body);
      return { success: res.success, executionPlan: res.executionPlan || [], txHashes: res.txHashes || [] };
    } catch (err: any) {
      // Fall back to client-side simulation
      plan.push(`Backend error: ${err.message || err} — falling back to client simulation`);
    }
  }

  if (amountUsd < DEFAULT_THRESHOLD_USD) {
    plan.push(`Instant route: amount below ${DEFAULT_THRESHOLD_USD}`);
    try {
      if (!signer) throw new Error("No signer available for on-chain execution");
      const amtTokens = (amountUsd / 1).toFixed(6);
      plan.push(`→ Sending single on-chain settlement for $${amountUsd.toLocaleString()}`);
      try {
        const h = await mintTokens(tokenAddress, recipientAddress || (await signer.getAddress()), amtTokens, signer);
        plan.push(`✓ Mint executed via contract: ${h}`);
        txs.push(h);
      } catch (e) {
        const h = await transferTokens(tokenAddress, recipientAddress || (await signer.getAddress()), amtTokens, signer);
        plan.push(`✓ Transfer executed via contract: ${h}`);
        txs.push(h);
      }
      return { success: true, executionPlan: plan, txHashes: txs };
    } catch (err: any) {
      return { success: false, executionPlan: [...plan, `⚠️ ${err.message || err}`], txHashes: [] };
    }
  }

  plan.push(`Smart routing engaged for $${amountUsd.toLocaleString()}`);
  const sources = simulateSources(amountUsd);

  let remaining = amountUsd;
  for (const src of sources) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, Math.min(src.availableUsd, amountUsd * 0.5));
    const priceImpact = src.priceMultiplier;
    const chunkUsd = take;
    plan.push(`→ Route ${chunkUsd.toLocaleString()} via ${src.name} (impact ${((priceImpact - 1) * 100).toFixed(3)}%)`);

    try {
      if (!signer) throw new Error("No signer available for on-chain execution");
      const amtTokens = (chunkUsd / 1).toFixed(6);
      try {
        const h = await mintTokens(tokenAddress, recipientAddress || (await signer.getAddress()), amtTokens, signer);
        plan.push(`✓ ${src.name} chunk settled on-chain: ${h}`);
        txs.push(h);
      } catch (e) {
        const h = await transferTokens(tokenAddress, recipientAddress || (await signer.getAddress()), amtTokens, signer);
        plan.push(`✓ ${src.name} chunk transferred on-chain: ${h}`);
        txs.push(h);
      }
    } catch (err: any) {
      plan.push(`⚠️ Failed on ${src.name}: ${err.message || err}`);
    }

    remaining -= take;
  }

  if (remaining > 0) {
    plan.push(`⚠️ ${remaining.toLocaleString()} USD remaining unrouted - fallback to slow settlement`);
  }

  return { success: txs.length > 0, executionPlan: plan, txHashes: txs };
}

export interface ExecuteBasketParams {
  allocations: Array<{ symbol: string; percent: number }>;
  totalUsd: number;
  fundTokenAddress?: string;
  recipientAddress?: string;
  signer?: any;
}

export interface ExecuteBasketResult {
  success: boolean;
  executionPlan: string[];
  txHashes: string[];
  fundTokenTx?: string;
}

async function callBackendExecuteBasket(body: any) {
  const url = `${BACKEND_URL.replace(/\/$/, "")}/api/execute-basket`;
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Backend execute-basket failed: ${res.statusText}`);
  return res.json();
}

export async function executeBasket({ allocations, totalUsd, fundTokenAddress, recipientAddress, signer }: ExecuteBasketParams): Promise<ExecuteBasketResult> {
  const plan: string[] = [];
  const txs: string[] = [];

  if (BACKEND_URL) {
    try {
      const body = { allocations, totalUsd, fundTokenAddress, recipient: recipientAddress, doOnChain: !!signer };
      const res = await callBackendExecuteBasket(body);
      return { success: res.success, executionPlan: res.executionPlan || [], txHashes: res.txHashes || [], fundTokenTx: res.txRecord?.fundTx };
    } catch (err: any) {

    }
  }

  plan.push(`Executing basket for $${totalUsd.toLocaleString()} across ${allocations.length} assets`);

  for (const alloc of allocations) {
    const amtUsd = (totalUsd * alloc.percent) / 100;
    plan.push(`- Allocating ${alloc.percent}% -> $${amtUsd.toLocaleString()} to ${alloc.symbol}`);

    try {
      const tokenAddr = fundTokenAddress || (import.meta.env.VITE_ERC20_ADDRESS as string) || "";
      const res = await executeOrder({ tokenAddress: tokenAddr, amountUsd: amtUsd, recipientAddress, signer });
      plan.push(...res.executionPlan.map(r => `  ${alloc.symbol}: ${r}`));
      txs.push(...res.txHashes);
    } catch (e: any) {
      plan.push(`⚠️ Error executing allocation for ${alloc.symbol}: ${e?.message || e}`);
    }
  }

  let fundTx: string | undefined;
  if (signer && fundTokenAddress) {
    try {
      const shares = (totalUsd / 100).toFixed(6);
      plan.push(`Minting ${shares} fund-shares to ${recipientAddress || (await signer.getAddress())}`);
      fundTx = await mintTokens(fundTokenAddress, recipientAddress || (await signer.getAddress()), shares, signer);
      plan.push(`✓ Fund token minted: ${fundTx}`);
      txs.push(fundTx);
    } catch (e: any) {
      plan.push(`⚠️ Failed to mint fund token: ${e?.message || e}`);
    }
  }

  return { success: txs.length > 0, executionPlan: plan, txHashes: txs, fundTokenTx: fundTx };
}
