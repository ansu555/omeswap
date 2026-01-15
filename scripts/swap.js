const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  
  console.log("💱 Executing swap with account:", signer.address);
  console.log("Network:", hre.network.name);
  console.log("");

  const POOLS_ADDRESS = "0xe63514C2B0842B58A16Ced0C63668BAA91B033Af";
  const ROUTER_ADDRESS = "0xFe2108798dC74481d5cCE1588cBD00801758dD6d";
  
  const tUSDC = "0x6D13968b1Fe787ed0237D3645D094161CC165E4c";
  const tUSDT = "0x0828b7774ea41Db0fCbf13ADe31b5F61624A1364";
  
  // Get contracts
  const router = await hre.ethers.getContractAt("MultiHopSwapRouter", ROUTER_ADDRESS);
  const usdc = await hre.ethers.getContractAt("TestERC20Token", tUSDC);
  const usdt = await hre.ethers.getContractAt("TestERC20Token", tUSDT);
  
  // Get balances before
  const usdcBefore = await usdc.balanceOf(signer.address);
  const usdtBefore = await usdt.balanceOf(signer.address);
  
  console.log("📊 Before Swap:");
  console.log(`  tUSDC: ${hre.ethers.formatEther(usdcBefore)}`);
  console.log(`  tUSDT: ${hre.ethers.formatEther(usdtBefore)}`);
  console.log("");
  
  // Swap parameters
  const swapAmount = hre.ethers.parseEther("100");
  
  // Get estimated output
  const estimatedOutput = await router.getAmountOut(swapAmount, tUSDC, tUSDT);
  console.log(`💡 Estimated output: ${hre.ethers.formatEther(estimatedOutput)} tUSDT`);
  
  // Calculate minimum output (0.5% slippage)
  const minAmountOut = (estimatedOutput * 995n) / 1000n;
  console.log(`   Minimum output (0.5% slippage): ${hre.ethers.formatEther(minAmountOut)} tUSDT`);
  console.log("");
  
  // Approve
  console.log("🔐 Approving tUSDC...");
  const approveTx = await usdc.approve(ROUTER_ADDRESS, swapAmount);
  await approveTx.wait();
  console.log("✅ Approved");
  console.log("");
  
  // Execute swap
  console.log("💱 Executing swap...");
  const swapTx = await router.singleHopSwap(
    tUSDC,
    tUSDT,
    swapAmount,
    minAmountOut
  );
  const receipt = await swapTx.wait();
  console.log("✅ Swap completed!");
  console.log(`   Tx: ${swapTx.hash}`);
  console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
  console.log("");
  
  // Get balances after
  const usdcAfter = await usdc.balanceOf(signer.address);
  const usdtAfter = await usdt.balanceOf(signer.address);
  
  console.log("📊 After Swap:");
  console.log(`  tUSDC: ${hre.ethers.formatEther(usdcAfter)}`);
  console.log(`  tUSDT: ${hre.ethers.formatEther(usdtAfter)}`);
  console.log("");
  
  const usdcDiff = usdcBefore - usdcAfter;
  const usdtDiff = usdtAfter - usdtBefore;
  
  console.log("📈 Changes:");
  console.log(`  Sent: ${hre.ethers.formatEther(usdcDiff)} tUSDC`);
  console.log(`  Received: ${hre.ethers.formatEther(usdtDiff)} tUSDT`);
  
  const effectivePrice = (usdtDiff * hre.ethers.parseEther("1")) / usdcDiff;
  console.log(`  Effective price: ${hre.ethers.formatEther(effectivePrice)} tUSDT per tUSDC`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

