const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  
  console.log("🔀 Executing multi-hop swap with account:", signer.address);
  console.log("Network:", hre.network.name);
  console.log("");

  const ROUTER_ADDRESS = "0xFe2108798dC74481d5cCE1588cBD00801758dD6d";
  
  // Token addresses
  const tDAI = "0x907fF6a35a3E030c11a02e937527402F0d3333ee";
  const tUSDC = "0x6D13968b1Fe787ed0237D3645D094161CC165E4c";
  const tWETH = "0x95829976c0cd4a58fBaA4802410d10BDe15E3CA0";
  const tWBTC = "0xD781bf79d86112215F7bF141277f5782640cad5D";
  
  // Get contracts
  const router = await hre.ethers.getContractAt("MultiHopSwapRouter", ROUTER_ADDRESS);
  const dai = await hre.ethers.getContractAt("TestERC20Token", tDAI);
  const wbtc = await hre.ethers.getContractAt("TestERC20Token", tWBTC);
  
  // Get balances before
  const daiBefore = await dai.balanceOf(signer.address);
  const wbtcBefore = await wbtc.balanceOf(signer.address);
  
  console.log("📊 Before Swap:");
  console.log(`  tDAI: ${hre.ethers.formatEther(daiBefore)}`);
  console.log(`  tWBTC: ${hre.ethers.formatEther(wbtcBefore)}`);
  console.log("");
  
  // Swap parameters (DAI → USDC → WETH → WBTC)
  const swapAmount = hre.ethers.parseEther("1000");
  
  console.log("🛣️  Route: tDAI → tUSDC → tWETH → tWBTC (3-hop swap)");
  console.log("");
  
  // Get estimated output for 3-hop
  const estimatedOutput = await router.getAmountOutThreeHop(
    swapAmount,
    tDAI,
    tUSDC,
    tWETH,
    tWBTC
  );
  console.log(`💡 Estimated output: ${hre.ethers.formatEther(estimatedOutput)} tWBTC`);
  
  // Calculate minimum output (1% slippage for multi-hop)
  const minAmountOut = (estimatedOutput * 99n) / 100n;
  console.log(`   Minimum output (1% slippage): ${hre.ethers.formatEther(minAmountOut)} tWBTC`);
  console.log("");
  
  // Check DAI balance, mint if needed
  if (daiBefore < swapAmount) {
    console.log("💰 Insufficient DAI balance, minting...");
    const mintTx = await dai.mint(signer.address, swapAmount);
    await mintTx.wait();
    console.log("✅ Minted 1000 tDAI");
    console.log("");
  }
  
  // Approve
  console.log("🔐 Approving tDAI...");
  const approveTx = await dai.approve(ROUTER_ADDRESS, swapAmount);
  await approveTx.wait();
  console.log("✅ Approved");
  console.log("");
  
  // Execute 3-hop swap
  console.log("🔀 Executing 3-hop swap...");
  const swapTx = await router.threeHopSwap(
    tDAI,
    tUSDC,
    tWETH,
    tWBTC,
    swapAmount,
    minAmountOut
  );
  const receipt = await swapTx.wait();
  console.log("✅ Swap completed!");
  console.log(`   Tx: ${swapTx.hash}`);
  console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
  console.log("");
  
  // Get balances after
  const daiAfter = await dai.balanceOf(signer.address);
  const wbtcAfter = await wbtc.balanceOf(signer.address);
  
  console.log("📊 After Swap:");
  console.log(`  tDAI: ${hre.ethers.formatEther(daiAfter)}`);
  console.log(`  tWBTC: ${hre.ethers.formatEther(wbtcAfter)}`);
  console.log("");
  
  const daiDiff = daiBefore - daiAfter;
  const wbtcDiff = wbtcAfter - wbtcBefore;
  
  console.log("📈 Changes:");
  console.log(`  Sent: ${hre.ethers.formatEther(daiDiff)} tDAI`);
  console.log(`  Received: ${hre.ethers.formatEther(wbtcDiff)} tWBTC`);
  
  const effectivePrice = (daiDiff * hre.ethers.parseEther("1")) / wbtcDiff;
  console.log(`  Effective price: ${hre.ethers.formatEther(effectivePrice)} tDAI per tWBTC`);
  
  console.log("\n🎉 Multi-hop swap successful!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

