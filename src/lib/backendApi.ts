const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

function baseUrl(path: string) {
  if (!BACKEND_URL) throw new Error("VITE_BACKEND_URL is not set in your environment");
  return `${BACKEND_URL.replace(/\/$/, "")}${path}`;
}

async function post(path: string, body: any) {
  const url = baseUrl(path);
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export async function quote(amountUsd: number) {
  return post('/api/quote', { amountUsd });
}

export async function routeOrder(params: { tokenAddress: string; amountUsd: number; recipient?: string; doOnChain?: boolean }) {
  return post('/api/route-order', params);
}

export async function executeBasket(params: { allocations: Array<{ symbol: string; percent: number }>; totalUsd: number; fundTokenAddress?: string; recipient?: string; doOnChain?: boolean }) {
  return post('/api/execute-basket', params);
}

export async function getTxs() {
  const url = baseUrl('/api/txs');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch txs: ${res.statusText}`);
  return res.json();
}

export async function kyc(userId: string) {
  return post('/api/kyc', { userId });
}

export default { quote, routeOrder, executeBasket, getTxs, kyc };
