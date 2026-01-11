const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying HybridToken to Sepolia...\n");

  const HybridToken = await hre.ethers.getContractFactory("HybridToken");
  console.log("Got contract factory");

  const token = await HybridToken.deploy();      // send deploy tx
  await token.deployed();                        // wait until mined
  console.log("Deployment confirmed");

  const tokenAddress = token.address;            // get deployed address

  console.log("✅ HybridToken deployed to:", tokenAddress);
  console.log("\n📊 Token Details:");
  console.log("   Name: HybridRamp Token");
  console.log("   Symbol: HYBRID");
  console.log("   Initial Supply: 1,000,000 HYBRID");
  console.log("\n🔗 View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/token/${tokenAddress}`);
  console.log("\n💾 Save this address! You'll need it for frontend integration.");
}

main()
  .then(() => {
    setTimeout(() => process.exit(0), 1000);
  })
  .catch((error) => {
    console.error(error);
    setTimeout(() => process.exit(1), 1000);
  });
