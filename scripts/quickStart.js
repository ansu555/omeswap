const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();

  console.log("🚀 AVALANCHE DEX - QUICK START SETUP");
  console.log("=================================");
  console.log("Account:", signer.address);
  console.log("Network:", hre.network.name);
  console.log("");

  const POOLS_ADDRESS = "0xe63514C2B0842B58A16Ced0C63668BAA91B033Af";

  // Token addresses
  const tokens = {
    USDC: "0x6D13968b1Fe787ed0237D3645D094161CC165E4c",
    USDTe: "0x0828b7774ea41Db0fCbf13ADe31b5F61624A1364",
    WETHe: "0x95829976c0cd4a58fBaA4802410d10BDe15E3CA0",
  };

  // Step 1: Mint tokens
  console.log("1️⃣  MINTING TEST TOKENS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━");

  const mintAmounts = {
    USDC: "10000",
    USDTe: "10000",
    WETHe: "100",
  };

  for (const [symbol, address] of Object.entries(tokens)) {
    try {
      const token = await hre.ethers.getContractAt("TestERC20Token", address);
      const amount = hre.ethers.parseEther(mintAmounts[symbol]);

      console.log(`Minting ${mintAmounts[symbol]} ${symbol}...`);
      const tx = await token.mint(signer.address, amount);
      await tx.wait();

      const balance = await token.balanceOf(signer.address);
      console.log(`✅ ${symbol}: ${hre.ethers.formatEther(balance)}`);
    } catch (error) {
      console.error(`❌ Error minting ${symbol}:`, error.message);
    }
  }

  console.log("");

  // Step 2: Add liquidity
  console.log("2️⃣  ADDING LIQUIDITY TO POOLS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const pools = await hre.ethers.getContractAt("MultiTokenLiquidityPools", POOLS_ADDRESS);

  const liquidityPairs = [
    {
      token0: { symbol: "USDC", address: tokens.USDC, amount: "5000" },
      token1: { symbol: "USDTe", address: tokens.USDTe, amount: "5000" },
    },
    {
      token0: { symbol: "WETHe", address: tokens.WETHe, amount: "10" },
      token1: { symbol: "USDC", address: tokens.USDC, amount: "25000" },
    },
  ];

  for (const pair of liquidityPairs) {
    try {
      console.log(`\nAdding ${pair.token0.symbol}/${pair.token1.symbol} liquidity...`);

      const token0Contract = await hre.ethers.getContractAt("TestERC20Token", pair.token0.address);
      const token1Contract = await hre.ethers.getContractAt("TestERC20Token", pair.token1.address);

      const amount0 = hre.ethers.parseEther(pair.token0.amount);
      const amount1 = hre.ethers.parseEther(pair.token1.amount);

      // Get pool ID
      const poolId = await pools.getPoolId(pair.token0.address, pair.token1.address);

      // Approve
      await (await token0Contract.approve(POOLS_ADDRESS, amount0)).wait();
      await (await token1Contract.approve(POOLS_ADDRESS, amount1)).wait();

      // Add liquidity
      const tx = await pools.addLiquidity(poolId, amount0, amount1, 0, 0);
      await tx.wait();

      console.log(`✅ Liquidity added to ${pair.token0.symbol}/${pair.token1.symbol}`);
      console.log(`   ${pair.token0.amount} ${pair.token0.symbol} + ${pair.token1.amount} ${pair.token1.symbol}`);
    } catch (error) {
      console.error(`❌ Error:`, error.message);
    }
  }

  console.log("");

  // Step 3: Display summary
  console.log("3️⃣  SETUP COMPLETE!");
  console.log("━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("✅ What you can do now:");
  console.log("   • Visit the frontend: npm run dev");
  console.log("   • Swap tokens: npm run swap");
  console.log("   • Try multi-hop: npm run multihop");
  console.log("   • Check your wallet balances");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log(`   Pools: ${POOLS_ADDRESS}`);
  console.log(`   USDC: ${tokens.USDC}`);
  console.log(`   USDTe: ${tokens.USDTe}`);
  console.log(`   WETHe: ${tokens.WETHe}`);
  console.log("");
  console.log("🔗 Explorer:");
  console.log("   https://snowtrace.io");
  console.log("");
  console.log("🎉 Happy Trading!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

