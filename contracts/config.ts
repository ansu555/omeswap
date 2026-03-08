import { Address } from 'viem';

export const CONTRACT_ADDRESSES = {
  // TODO: Deploy contracts to Avalanche mainnet and update these addresses
  POOLS: '0x0000000000000000000000000000000000000000' as Address,
  ROUTER: '0x0000000000000000000000000000000000000000' as Address,
};

// Avalanche mainnet DEX routers (UniswapV2-compatible)
export const DEX_ROUTERS = {
  TRADER_JOE: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4' as Address, // JoeRouter02 V1
  PANGOLIN: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106' as Address, // Pangolin Router
} as const;

// TraderJoe V2 (Liquidity Book) — supports native USDC
export const TRADER_JOE_V2 = {
  ROUTER: '0xb4315e873dBcf96Ffd0acd8EA43f689D8c20fB30' as Address, // LBRouter V2.2
  QUOTER: '0xd76019A16606FDa4651f636D9751f500Ed776250' as Address, // LBQuoter V2.2
} as const;

export const WAVAX_ADDRESS = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' as Address;

// Avalanche mainnet token addresses
// Note: USDC.e (bridged) is used for V1 DEX compatibility (TraderJoe V1, Pangolin)
// USDC native is listed separately but may lack V1 AMM pools
export const TOKEN_ADDRESSES: { [key: string]: { address: Address; name: string; symbol: string; decimals: number; } } = {
  WAVAX: { address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' as Address, name: 'Wrapped AVAX', symbol: 'WAVAX', decimals: 18 },
  USDC: { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6' as Address, name: 'USD Coin', symbol: 'USDC', decimals: 6 }, // Native USDC (Circle)
  "USDC.e": { address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664' as Address, name: 'USD Coin.e', symbol: 'USDC.e', decimals: 6 }, // USDC.e — best V1 liquidity
  USDTe: { address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118' as Address, name: 'Tether USD.e', symbol: 'USDT.e', decimals: 6 },
  DAIe: { address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70' as Address, name: 'Dai Stablecoin', symbol: 'DAI.e', decimals: 18 },
  WETHe: { address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB' as Address, name: 'Wrapped Ether', symbol: 'WETH.e', decimals: 18 },
  WBTCe: { address: '0x50b7545627a5162F82A992c33b87aDc75187B218' as Address, name: 'Wrapped Bitcoin', symbol: 'WBTC.e', decimals: 8 },
  LINKe: { address: '0x5947BB275c521040051D82396192181b413227A3' as Address, name: 'Chainlink', symbol: 'LINK.e', decimals: 18 },
  JOE: { address: '0x6e84a6216eA6daCC71eE8E6b0a5B7322EEbC0fDd' as Address, name: 'JoeToken', symbol: 'JOE', decimals: 18 },
  PNG: { address: '0x60781C2586D68229fde47564546784ab3fACA982' as Address, name: 'Pangolin', symbol: 'PNG', decimals: 18 },
  AAVEe: { address: '0x63a72806098Bd3D9520cC43356dD78afe5D386D9' as Address, name: 'Aave Token', symbol: 'AAVE.e', decimals: 18 },
  // Legacy Aliases for backward compatibility
  tUSDC: { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' as Address, name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  tUSDT: { address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118' as Address, name: 'Tether USD.e', symbol: 'USDT.e', decimals: 6 },
};

export const TOKENS = TOKEN_ADDRESSES;
export const MAINNET_TOKENS = TOKEN_ADDRESSES;

export const TOKEN_LIST = Object.values(TOKEN_ADDRESSES);
