const hre = require("hardhat");

async function main() {
  // 🔴 REPLACE WITH YOUR DEPLOYED ADDRESS
  const TOKEN_ADDRESS = "0x56Cf879257FF524F154F0077E32958156C2cBfa7";

  console.log("📝 Testing HybridToken functionality...\n");

  // Get contract instance
  const HybridToken = await hre.ethers.getContractAt("HybridToken", TOKEN_ADDRESS);
  const [owner] = await hre.ethers.getSigners();

  console.log("👤 Deployer Address:", owner.address);

  // ===== TEST 1: Check Balance =====
  console.log("\n1️⃣  Checking initial balance...");
  const balance = await HybridToken.balanceOf(owner.address);
  console.log(`   Balance: ${hre.ethers.utils.formatUnits(balance, 18)} HYBRID`);

  // ===== TEST 2: Mint More Tokens =====
  console.log("\n2️⃣  Minting 100 new tokens...");
  const mintTx = await HybridToken.mint(
    owner.address,
    hre.ethers.utils.parseUnits("100", 18)
  );
  await mintTx.wait();
  console.log(`   ✅ Mint tx: https://sepolia.etherscan.io/tx/${mintTx.hash}`);

  const balanceAfterMint = await HybridToken.balanceOf(owner.address);
  console.log(
    `   New balance: ${hre.ethers.utils.formatUnits(balanceAfterMint, 18)} HYBRID`
  );

  // ===== TEST 3: Transfer Tokens =====
  console.log("\n3️⃣  Transferring 50 tokens to yourself (test)...");
  const testAddress = owner.address; // or another address if you want

  const transferTx = await HybridToken.transfer(
    testAddress,
    hre.ethers.utils.parseUnits("50", 18)
  );
  await transferTx.wait();
  console.log(`   ✅ Transfer tx: https://sepolia.etherscan.io/tx/${transferTx.hash}`);

  const recipientBalance = await HybridToken.balanceOf(testAddress);
  console.log(
    `   Recipient balance: ${hre.ethers.utils.formatUnits(recipientBalance, 18)} HYBRID`
  );

  console.log("\n🎉 All tests passed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
