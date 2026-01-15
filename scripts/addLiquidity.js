const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  
  console.log("💧 Adding liquidity with account:", signer.address);
  console.log("Network:", hre.network.name);
  console.log("");

  const POOLS_ADDRESS = "0xe63514C2B0842B58A16Ced0C63668BAA91B033Af";
  
  // Token addresses
  const tokens = {
    tUSDC: "0x6D13968b1Fe787ed0237D3645D094161CC165E4c",
    tUSDT: "0x0828b7774ea41Db0fCbf13ADe31b5F61624A1364",
    tWETH: "0x95829976c0cd4a58fBaA4802410d10BDe15E3CA0",
    tWBTC: "0xD781bf79d86112215F7bF141277f5782640cad5D",
  };

  // Get contracts
  const pools = await hre.ethers.getContractAt("MultiTokenLiquidityPools", POOLS_ADDRESS);

  // Define liquidity pairs
  const liquidityPairs = [
    {
      token0: { symbol: "tUSDC", address: tokens.tUSDC, amount: "5000" },
      token1: { symbol: "tUSDT", address: tokens.tUSDT, amount: "5000" },
    },
    {
      token0: { symbol: "tWETH", address: tokens.tWETH, amount: "10" },
      token1: { symbol: "tUSDC", address: tokens.tUSDC, amount: "25000" },
    },
    {
      token0: { symbol: "tWBTC", address: tokens.tWBTC, amount: "0.5" },
      token1: { symbol: "tWETH", address: tokens.tWETH, amount: "10" },
    },
  ];

  for (const pair of liquidityPairs) {
    console.log(`\n📊 Adding liquidity: ${pair.token0.symbol}/${pair.token1.symbol}`);
    
    try {
      // Get token contracts
      const token0Contract = await hre.ethers.getContractAt("TestERC20Token", pair.token0.address);
      const token1Contract = await hre.ethers.getContractAt("TestERC20Token", pair.token1.address);
      
      const amount0 = hre.ethers.parseEther(pair.token0.amount);
      const amount1 = hre.ethers.parseEther(pair.token1.amount);
      
      // Check balances
      const balance0 = await token0Contract.balanceOf(signer.address);
      const balance1 = await token1Contract.balanceOf(signer.address);
      
      console.log(`Current balances:`);
      console.log(`  ${pair.token0.symbol}: ${hre.ethers.formatEther(balance0)}`);
      console.log(`  ${pair.token1.symbol}: ${hre.ethers.formatEther(balance1)}`);
      
      if (balance0 < amount0 || balance1 < amount1) {
        console.log("❌ Insufficient balance. Minting tokens...");
        
        if (balance0 < amount0) {
          const tx = await token0Contract.mint(signer.address, amount0);
          await tx.wait();
          console.log(`  Minted ${pair.token0.amount} ${pair.token0.symbol}`);
        }
        
        if (balance1 < amount1) {
          const tx = await token1Contract.mint(signer.address, amount1);
          await tx.wait();
          console.log(`  Minted ${pair.token1.amount} ${pair.token1.symbol}`);
        }
      }
      
      // Get pool ID
      const poolId = await pools.getPoolId(pair.token0.address, pair.token1.address);
      console.log(`Pool ID: ${poolId.toString()}`);
      
      // Approve tokens
      console.log(`Approving tokens...`);
      const approveTx0 = await token0Contract.approve(POOLS_ADDRESS, amount0);
      await approveTx0.wait();
      const approveTx1 = await token1Contract.approve(POOLS_ADDRESS, amount1);
      await approveTx1.wait();
      console.log(`✅ Tokens approved`);
      
      // Add liquidity
      console.log(`Adding liquidity...`);
      const addLiqTx = await pools.addLiquidity(
        poolId,
        amount0,
        amount1,
        0, // min amount0
        0  // min amount1
      );
      const receipt = await addLiqTx.wait();
      console.log(`✅ Liquidity added!`);
      console.log(`   Tx: ${addLiqTx.hash}`);
      
      // Check position
      const position = await pools.getUserPosition(poolId, signer.address);
      console.log(`\n📊 Your Position:`);
      console.log(`  LP Tokens: ${hre.ethers.formatEther(position[0])}`);
      console.log(`  ${pair.token0.symbol} Deposited: ${hre.ethers.formatEther(position[1])}`);
      console.log(`  ${pair.token1.symbol} Deposited: ${hre.ethers.formatEther(position[2])}`);
    } catch (error) {
      console.error(`❌ Error adding liquidity:`, error.message);
    }
  }
  
  console.log("\n🎉 All liquidity added successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

