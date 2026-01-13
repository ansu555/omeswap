// Application constants

export const APP_NAME = 'Mantle Dex';

export const CHAIN_IDS = {
  MANTLE_MAINNET: 5000,
  MANTLE_SEPOLIA: 5003,
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
  DOCS: 'https://docs.mantle.xyz',
  GITHUB: 'https://github.com/mantlenetworkio',
} as const;
