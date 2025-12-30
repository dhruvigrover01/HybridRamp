// relayer-example.js
// Simple Node.js script showing how the server could use a relayer private key
// to mint tokens on a contract. This is demo code — do NOT expose private keys in production.

const { ethers } = require('ethers');

async function main() {
  const pk = process.env.RELAYER_PRIVATE_KEY;
  const rpc = process.env.RPC_URL;
  const tokenAddr = process.env.ERC20_ADDRESS;
  const abiString = process.env.ERC20_ABI;

  if (!pk || !rpc || !tokenAddr || !abiString) {
    console.error('Please set RELAYER_PRIVATE_KEY, RPC_URL, ERC20_ADDRESS and ERC20_ABI in env');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);
  const abi = JSON.parse(abiString);
  const contract = new ethers.Contract(tokenAddr, abi, wallet);

  const to = wallet.address; // mint to relayer for demo
  const amount = ethers.parseUnits('1.0', 18);

  console.log('Sending mint tx...');
  try {
    const tx = await contract.mint(to, amount);
    console.log('Tx submitted:', tx.hash);
    const receipt = await tx.wait();
    console.log('Receipt:', receipt.transactionHash);
  } catch (err) {
    console.error('Mint failed:', err);
  }
}

main();
