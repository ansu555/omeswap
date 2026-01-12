# Mantle Wallet Integration

This project includes a complete wallet connection setup for Mantle chain using wagmi, viem, and RainbowKit.

## Features

- ✅ Connect to MetaMask, WalletConnect, Coinbase Wallet, and other popular wallets
- ✅ Support for Mantle Mainnet and Testnet
- ✅ Network switching
- ✅ Account management with dropdown menu
- ✅ Balance display
- ✅ Copy address functionality
- ✅ View on block explorer
- ✅ Responsive design with shadcn/ui components

## Setup

1. **Get a WalletConnect Project ID**
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy your Project ID

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   Then add your WalletConnect Project ID:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

3. **Install Dependencies** (Already done)
   ```bash
   npm install wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
   ```

## Usage

### Basic Usage in Components

The wallet connect button is already integrated in the Header component. To use it in other components:

```tsx
import MantleWalletConnect from '@/components/features/mantle/mantle-wallet-connect';

export default function MyComponent() {
  return <MantleWalletConnect variant="default" />;
}
```

### Using the Wallet Hook

```tsx
'use client';

import { useMantleWallet } from '@/hooks/use-mantle-wallet';

export default function MyComponent() {
  const { address, isConnected, balance, chain } = useMantleWallet();

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div>
      <p>Connected: {address}</p>
      <p>Balance: {balance?.formatted} {balance?.symbol}</p>
      <p>Chain: {chain?.name}</p>
    </div>
  );
}
```

### Using wagmi Hooks Directly

```tsx
'use client';

import { useAccount, useBalance } from 'wagmi';

export default function MyComponent() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  return (
    <div>
      {isConnected ? (
        <p>{address} has {balance?.formatted} {balance?.symbol}</p>
      ) : (
        <p>Not connected</p>
      )}
    </div>
  );
}
```

## Components

### MantleWalletConnect
Main wallet connect button with full features (dropdown menu, network switching, etc.)

Props:
- `variant`: 'default' | 'outline' | 'ghost' (optional, defaults to 'default')

### SimpleMantleWalletConnect
A simpler version without the dropdown menu

Props:
- `variant`: 'default' | 'outline' | 'ghost' (optional, defaults to 'default')

## Network Configuration

The following networks are configured:

- **Mantle Mainnet** (Chain ID: 5000)
  - RPC: https://rpc.mantle.xyz
  - Explorer: https://explorer.mantle.xyz

- **Mantle Sepolia Testnet** (Chain ID: 5003)
  - RPC: https://rpc.sepolia.mantle.xyz
  - Explorer: https://explorer.sepolia.mantle.xyz

You can modify the network configuration in `lib/chains/mantle.ts`.

## Supported Wallets

- MetaMask
- WalletConnect (any WalletConnect-compatible wallet)
- Coinbase Wallet
- Rainbow
- Trust Wallet
- And many more...

## Styling

The wallet button uses shadcn/ui components and is styled with Tailwind CSS. The RainbowKit modal theme is automatically synced with your app's theme.

## Documentation

- [wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Mantle Documentation](https://docs.mantle.xyz/)
