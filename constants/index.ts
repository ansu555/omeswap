// Application constants

export const APP_NAME = 'Omeswap';

export const CHAIN_IDS = {
  AVALANCHE_MAINNET: 43114,
  AVALANCHE_FUJI: 43113,
} as const;

export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  TRADE: '/trade',
  PORTFOLIO: '/portfolio',
  TOKENS: '/cryptocurrencies',
  TRANSACTIONS: '/transactions',
} as const;

export const EXTERNAL_LINKS = {
  DOCS: 'https://docs.avax.network',
  GITHUB: 'https://github.com/ava-labs',
} as const;
