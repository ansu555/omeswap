# 🌊 Mantle DEX

A fully functional decentralized exchange (DEX) built on Mantle Network with multi-hop routing capabilities.

![Mantle DEX](https://img.shields.io/badge/Mantle-DEX-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue)

## ✨ Features

- 🔄 **Uniswap V2 AMM** - Constant product market maker
- 🛣️ **Multi-Hop Routing** - Route through multiple pools in a single transaction
- 💧 **Liquidity Provision** - Add/remove liquidity and earn 0.3% fees
- 🪙 **Test Token Minting** - Mint test tokens for experimentation
- 💰 **Low Gas Fees** - Built on Mantle L2 for 100x cheaper transactions
- 🎨 **Modern UI** - Beautiful, responsive interface with shadcn/ui
- 🔐 **Wallet Integration** - Connect with MetaMask, WalletConnect, and more

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Get your WalletConnect Project ID from: https://cloud.walletconnect.com/

### 3. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

### 4. Connect & Trade

1. **Connect Wallet** (top right corner)
2. **Switch to Mantle Sepolia Testnet**
3. **Get testnet MNT** from https://faucet.sepolia.mantle.xyz
4. **Mint test tokens** (Mint Tokens tab)
5. **Add liquidity** or **start swapping**!

## 📋 Prerequisites

- Node.js 18+
- MetaMask or compatible wallet
- Testnet MNT (for gas fees)

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS + shadcn/ui
- **Web3:** wagmi v2 + viem v2
- **Wallet:** RainbowKit

### Smart Contracts
- **Language:** Solidity 0.8.20
- **Framework:** Hardhat
- **Network:** Mantle Sepolia Testnet
- **Testing:** Chai + Ethers.js

## 📝 Smart Contracts

### Deployed on Mantle Sepolia

| Contract | Address |
|----------|---------|
| **Liquidity Pools** | `0xe63514C2B0842B58A16Ced0C63668BAA91B033Af` |
| **Swap Router** | `0xFe2108798dC74481d5cCE1588cBD00801758dD6d` |

[View on Explorer →](https://explorer.sepolia.mantle.xyz)

## 🎯 Use Cases

### For Traders
- Swap tokens with minimal slippage
- Multi-hop routing finds best paths
- Low gas costs on L2

### For Liquidity Providers
- Earn 0.3% on all swaps
- Receive LP tokens
- Remove liquidity anytime

### For Developers
- Learn AMM mechanics
- Study DeFi integration
- Fork and customize

## 📚 Documentation

- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Complete technical overview and implementation details

## 🧪 Testing

### Frontend Testing
```bash
npm run dev
```

### Smart Contract Testing
```bash
cd ../Mantel_contract
npx hardhat test
```

### Backend Scripts
```bash
# Mint test tokens
npm run hardhat:mint

# Add liquidity
npm run hardhat:liquidity

# Execute swap
npm run hardhat:swap

# Multi-hop swap
npm run hardhat:multihop

# Complete setup
npm run hardhat:quickstart
```

## 🔒 Security

⚠️ **Testnet Only**: This DEX is deployed on Mantle Sepolia Testnet. All tokens are for testing purposes and have **no real value**.

For production use:
- Professional security audit required
- Implement additional safety checks
- Add protocol fee mechanism
- Enable emergency pause functionality

## 🛠️ Development

### Project Structure

```
Mantle_Dex/
├── app/                  # Next.js pages
├── components/           # React components
│   ├── trade/           # DEX trading components
│   ├── portfolio/       # Portfolio management
│   └── features/        # Wallet integration
├── contracts/           # Contract ABIs & config
├── hooks/               # Custom React hooks
├── lib/                 # Utilities
└── scripts/             # Hardhat interaction scripts
```

### Available Scripts

```bash
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run linter
npm run hardhat:*       # Hardhat operations
```

## 🌐 Network Configuration

### Mantle Sepolia Testnet

- **Chain ID:** 5003
- **RPC URL:** https://rpc.sepolia.mantle.xyz
- **Explorer:** https://explorer.sepolia.mantle.xyz
- **Faucet:** https://faucet.sepolia.mantle.xyz

Add to MetaMask:
1. Networks → Add Network → Add Manually
2. Enter the details above
3. Save

## 🎨 Features Walkthrough

### 1. Token Swapping
- Select input/output tokens
- Enter amount
- Review estimated output
- Approve & swap
- Track transaction on explorer

### 2. Liquidity Management
- Choose token pair
- Enter amounts (auto-calculated ratio)
- Approve both tokens
- Add liquidity
- Receive LP tokens

### 3. Multi-Hop Routing
- Swap tokens without direct pools
- Example: DAI → USDC → WETH → WBTC
- Atomic transaction (all-or-nothing)
- Automatic path finding

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 🙏 Acknowledgments

- Uniswap V2 for the AMM design
- Mantle Network for L2 infrastructure
- shadcn/ui for beautiful components
- wagmi & viem for Web3 integration

## 📞 Support

- **Issues:** GitHub Issues
- **Docs:** [Integration Guide](./DEX_INTEGRATION_GUIDE.md)
- **Explorer:** https://explorer.sepolia.mantle.xyz

## 🎉 Getting Started

Ready to try it out?

```bash
npm install
npm run dev
```

Then visit **http://localhost:3000/trade** and start trading!

---

**Built with ❤️ on Mantle Network**

⭐ Star this repo if you found it helpful!
