// Contract addresses on Mantle Sepolia Testnet
export const CONTRACT_ADDRESSES = {
  POOLS: '0xe63514C2B0842B58A16Ced0C63668BAA91B033Af',
  ROUTER: '0xFe2108798dC74481d5cCE1588cBD00801758dD6d',
} as const;

// Test token addresses
export const TOKEN_ADDRESSES = {
  tUSDC: '0x6D13968b1Fe787ed0237D3645D094161CC165E4c',
  tUSDT: '0x0828b7774ea41Db0fCbf13ADe31b5F61624A1364',
  tDAI: '0x907fF6a35a3E030c11a02e937527402F0d3333ee',
  tWETH: '0x95829976c0cd4a58fBaA4802410d10BDe15E3CA0',
  tWBTC: '0xD781bf79d86112215F7bF141277f5782640cad5D',
  tLINK: '0xCEbBd58F40c8CE0739327fDde1A52bb67557e37a',
  tUNI: '0xe771E51F90D7176B6bd17a123f7D78c2231158a0',
  tAAVE: '0x6b1F4e0Eea462745750dddaEB11FB85B968a87F6',
  tCRV: '0xa6bAeA5811Bd070AeF343537b03A909597002526',
  tMKR: '0x4296e3e1d3efbb5bac66a66f1E463BAc25Ec6189',
} as const;

// Token metadata
export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo?: string;
}

export const TOKENS: Record<string, TokenInfo> = {
  tUSDC: {
    symbol: 'tUSDC',
    name: 'Test USDC',
    address: TOKEN_ADDRESSES.tUSDC,
    decimals: 18,
  },
  tUSDT: {
    symbol: 'tUSDT',
    name: 'Test USDT',
    address: TOKEN_ADDRESSES.tUSDT,
    decimals: 18,
  },
  tDAI: {
    symbol: 'tDAI',
    name: 'Test DAI',
    address: TOKEN_ADDRESSES.tDAI,
    decimals: 18,
  },
  tWETH: {
    symbol: 'tWETH',
    name: 'Test WETH',
    address: TOKEN_ADDRESSES.tWETH,
    decimals: 18,
  },
  tWBTC: {
    symbol: 'tWBTC',
    name: 'Test WBTC',
    address: TOKEN_ADDRESSES.tWBTC,
    decimals: 18,
  },
  tLINK: {
    symbol: 'tLINK',
    name: 'Test LINK',
    address: TOKEN_ADDRESSES.tLINK,
    decimals: 18,
  },
  tUNI: {
    symbol: 'tUNI',
    name: 'Test UNI',
    address: TOKEN_ADDRESSES.tUNI,
    decimals: 18,
  },
  tAAVE: {
    symbol: 'tAAVE',
    name: 'Test AAVE',
    address: TOKEN_ADDRESSES.tAAVE,
    decimals: 18,
  },
  tCRV: {
    symbol: 'tCRV',
    name: 'Test CRV',
    address: TOKEN_ADDRESSES.tCRV,
    decimals: 18,
  },
  tMKR: {
    symbol: 'tMKR',
    name: 'Test MKR',
    address: TOKEN_ADDRESSES.tMKR,
    decimals: 18,
  },
};

export const TOKEN_LIST = Object.values(TOKENS);

