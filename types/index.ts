// Global type definitions for Mantle Dex

export interface Token {
  id: string;
  symbol: string;
  name?: string;
  price: number;
  change24h: number;
  imageUrl?: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
}

export interface NavItem {
  label: string;
  href?: string;
  dropdown?: { label: string; href: string }[];
}
