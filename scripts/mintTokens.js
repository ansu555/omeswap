const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const yourAddress = signer.address;
  
  console.log("🪙 Minting tokens to:", yourAddress);
  console.log("Network:", hre.network.name);
  console.log("");

  // Token addresses from deployment
  const tokens = {
    tUSDC: "0x6D13968b1Fe787ed0237D3645D094161CC165E4c",
    tUSDT: "0x0828b7774ea41Db0fCbf13ADe31b5F61624A1364",
    tDAI: "0x907fF6a35a3E030c11a02e937527402F0d3333ee",
    tWETH: "0x95829976c0cd4a58fBaA4802410d10BDe15E3CA0",
    tWBTC: "0xD781bf79d86112215F7bF141277f5782640cad5D",
    tLINK: "0xCEbBd58F40c8CE0739327fDde1A52bb67557e37a",
    tUNI: "0xe771E51F90D7176B6bd17a123f7D78c2231158a0",
    tAAVE: "0x6b1F4e0Eea462745750dddaEB11FB85B968a87F6",
    tCRV: "0xa6bAeA5811Bd070AeF343537b03A909597002526",
    tMKR: "0x4296e3e1d3efbb5bac66a66f1E463BAc25Ec6189",
  };

  // Mint amounts (in tokens)
  const amounts = {
    tUSDC: "10000",   // 10,000 USDC
    tUSDT: "10000",   // 10,000 USDT
    tDAI: "10000",    // 10,000 DAI
    tWETH: "100",     // 100 WETH
    tWBTC: "1",       // 1 WBTC
    tLINK: "5000",    // 5,000 LINK
    tUNI: "1000",     // 1,000 UNI
    tAAVE: "500",     // 500 AAVE
    tCRV: "10000",    // 10,000 CRV
    tMKR: "50",       // 50 MKR
  };

  for (const [symbol, address] of Object.entries(tokens)) {
    try {
      const token = await hre.ethers.getContractAt("TestERC20Token", address);
      const amount = hre.ethers.parseEther(amounts[symbol]);
      
      console.log(`Minting ${amounts[symbol]} ${symbol}...`);
      const tx = await token.mint(yourAddress, amount);
      await tx.wait();
      
      const balance = await token.balanceOf(yourAddress);
      console.log(`✅ Balance: ${hre.ethers.formatEther(balance)} ${symbol}`);
      console.log(`   Tx: ${tx.hash}\n`);
    } catch (error) {
      console.error(`❌ Error minting ${symbol}:`, error.message);
    }
  }

  console.log("🎉 Token minting complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

