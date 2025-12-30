const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// In-memory "database" for demo purposes
const DB = {
  txs: [],
  funds: [],
  users: {}, // userId -> { kycTier }
};

function simulateSources(amountUsd) {
  const base = 1.0;
  return [
    { name: 'Uniswap', priceMultiplier: base + (Math.random() - 0.5) * 0.002, availableUsd: 500000 },
    { name: 'SushiSwap', priceMultiplier: base + (Math.random() - 0.5) * 0.003, availableUsd: 300000 },
    { name: 'Curve', priceMultiplier: base + (Math.random() - 0.5) * 0.0015, availableUsd: 200000 },
    { name: 'CEX-Quote', priceMultiplier: base + (Math.random() - 0.5) * 0.0008, availableUsd: 1000000 },
  ].sort((a, b) => a.priceMultiplier - b.priceMultiplier);
}

// Helper to create a fake tx hash
function fakeTxHash() {
  return '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// Quote liquidity sources and simple allocation suggestion
app.post('/api/quote', (req, res) => {
  const { amountUsd } = req.body;
  if (!amountUsd) return res.status(400).json({ error: 'amountUsd required' });
  const sources = simulateSources(amountUsd);
  res.json({ amountUsd, sources });
});

// Route-order: create execution plan and optionally perform on-chain settlement if server has signer configured
app.post('/api/route-order', async (req, res) => {
  const { tokenAddress, amountUsd, recipient, doOnChain } = req.body;
  if (!tokenAddress || !amountUsd) return res.status(400).json({ error: 'tokenAddress and amountUsd required' });

  const plan = [];
  const txHashes = [];

  const DEFAULT_THRESHOLD_USD = Number(process.env.INSTITUTIONAL_THRESHOLD || 5000);

  if (amountUsd < DEFAULT_THRESHOLD_USD) {
    plan.push(`Instant route: amount below ${DEFAULT_THRESHOLD_USD}`);
    plan.push(`→ Single settlement for $${amountUsd}`);

    if (doOnChain && process.env.RELAYER_PRIVATE_KEY && process.env.RPC_URL && process.env.ERC20_ABI) {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);
        const abi = JSON.parse(process.env.ERC20_ABI);
        const contract = new ethers.Contract(tokenAddress, abi, wallet);
        // attempt mint then transfer
        let h = null;
        try {
          const tx = await contract.mint(recipient || wallet.address, ethers.parseUnits(String(amountUsd), 18));
          h = tx.hash;
        } catch (e) {
          const tx = await contract.transfer(recipient || wallet.address, ethers.parseUnits(String(amountUsd), 18));
          h = tx.hash;
        }
        plan.push(`✓ Settled on-chain: ${h}`);
        txHashes.push(h);
      } catch (err) {
        plan.push(`⚠️ Server on-chain settlement failed: ${String(err)}`);
      }
    } else {
      // simulated
      const h = fakeTxHash();
      plan.push(`(sim) Settled: ${h}`);
      txHashes.push(h);
    }

    const txRecord = { id: DB.txs.length + 1, tokenAddress, amountUsd, plan, txHashes, ts: Date.now() };
    DB.txs.push(txRecord);
    return res.json({ success: true, executionPlan: plan, txHashes, txRecord });
  }

  plan.push(`Smart routing for $${amountUsd}`);
  const sources = simulateSources(amountUsd);
  let remaining = amountUsd;
  for (const s of sources) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, Math.min(s.availableUsd, amountUsd * 0.5));
    plan.push(`→ Route $${take} via ${s.name} (impact ${( (s.priceMultiplier - 1) * 100).toFixed(3)}%)`);
    // simulate tx
    const h = fakeTxHash();
    plan.push(`✓ ${s.name} chunk simulated: ${h}`);
    txHashes.push(h);
    remaining -= take;
  }

  if (remaining > 0) {
    plan.push(`⚠️ $${remaining} remaining unrouted`);
  }

  const txRecord = { id: DB.txs.length + 1, tokenAddress, amountUsd, plan, txHashes, ts: Date.now() };
  DB.txs.push(txRecord);

  res.json({ success: txHashes.length > 0, executionPlan: plan, txHashes, txRecord });
});

// Execute basket allocations
app.post('/api/execute-basket', async (req, res) => {
  const { allocations, totalUsd, fundTokenAddress, recipient, doOnChain } = req.body;
  if (!allocations || !totalUsd) return res.status(400).json({ error: 'allocations and totalUsd required' });

  const plan = [];
  const txHashes = [];

  plan.push(`Executing basket for $${totalUsd} across ${allocations.length} assets`);

  for (const alloc of allocations) {
    const amtUsd = (totalUsd * alloc.percent) / 100;
    plan.push(`- ${alloc.symbol}: $${amtUsd}`);
    // call route-order internally (simulation)
    const routeRes = await new Promise(resolve => {
      const body = { tokenAddress: fundTokenAddress || process.env.ERC20_ADDRESS || '0x', amountUsd: amtUsd, recipient, doOnChain };
      // reuse simulate
      const sources = simulateSources(amtUsd);
      const chunkTxs = sources.slice(0, 2).map(() => fakeTxHash());
      resolve({ success: true, executionPlan: [`simulated ${alloc.symbol}`], txHashes: chunkTxs });
    });

    plan.push(...(routeRes.executionPlan || []).map(r => `  ${alloc.symbol}: ${r}`));
    (routeRes.txHashes || []).forEach(h => txHashes.push(h));
  }

  // optionally mint fund token to represent shares (simulated)
  let fundTx;
  if (fundTokenAddress) {
    fundTx = fakeTxHash();
    plan.push(`Minted fund token (sim): ${fundTx}`);
    txHashes.push(fundTx);
  }

  const txRecord = { id: DB.txs.length + 1, type: 'basket', allocations, totalUsd, plan, txHashes, ts: Date.now() };
  DB.txs.push(txRecord);

  res.json({ success: true, executionPlan: plan, txHashes, txRecord });
});

// Simple transaction indexer - list
app.get('/api/txs', (req, res) => {
  res.json({ txs: DB.txs.slice().reverse() });
});

// KYC / Auth simulation
app.post('/api/kyc', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  let tier = DB.users[userId]?.kycTier;
  if (!tier) {
    tier = 1; // default basic
    DB.users[userId] = { kycTier: tier };
  }
  res.json({ userId, kycTier: tier, rules: { ltv: tier === 1 ? 30 : tier === 2 ? 40 : 50 } });
});

app.listen(PORT, () => {
  console.log(`Hybrid Ramp backend running on port ${PORT}`);
});
