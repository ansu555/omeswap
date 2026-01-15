import { Address } from 'viem';

export const CONTRACT_ADDRESSES = {
  POOLS: '0xe63514C2B0842B58A16Ced0C63668BAA91B033Af' as Address,
  ROUTER: '0xFe2108798dC74481d5cCE1588cBD00801758dD6d' as Address,
};

export const TOKEN_ADDRESSES: { [key: string]: { address: Address; name: string; symbol: string; decimals: number; } } = {
  tUSDC: { address: '0x6D13968b1Fe787ed0237D3645D094161CC165E4c' as Address, name: 'Test USDC', symbol: 'tUSDC', decimals: 18 },
  tUSDT: { address: '0x0828b7774ea41Db0fCbf13ADe31b5F61624A1364' as Address, name: 'Test USDT', symbol: 'tUSDT', decimals: 18 },
  tDAI: { address: '0x907fF6a35a3E030c11a02e937527402F0d3333ee' as Address, name: 'Test DAI', symbol: 'tDAI', decimals: 18 },
  tWETH: { address: '0x95829976c0cd4a58fBaA4802410d10BDe15E3CA0' as Address, name: 'Test WETH', symbol: 'tWETH', decimals: 18 },
  tWBTC: { address: '0xD781bf79d86112215F7bF141277f5782640cad5D' as Address, name: 'Test WBTC', symbol: 'tWBTC', decimals: 18 },
  tLINK: { address: '0xCEbBd58F40c8CE0739327fDde1A52bb67557e37a' as Address, name: 'Test LINK', symbol: 'tLINK', decimals: 18 },
  tUNI: { address: '0xe771E51F90D7176B6bd17a123f7D78c2231158a0' as Address, name: 'Test UNI', symbol: 'tUNI', decimals: 18 },
  tAAVE: { address: '0x6b1F4e0Eea462745750dddaEB11FB85B968a87F6' as Address, name: 'Test AAVE', symbol: 'tAAVE', decimals: 18 },
  tCRV: { address: '0xa6bAeA5811Bd070AeF343537b03A909597002526' as Address, name: 'Test CRV', symbol: 'tCRV', decimals: 18 },
  tMKR: { address: '0x4296e3e1d3efbb5bac66a66f1E463BAc25Ec6189' as Address, name: 'Test MKR', symbol: 'tMKR', decimals: 18 },
};

export const TOKENS = TOKEN_ADDRESSES;

export const TOKEN_LIST = Object.values(TOKEN_ADDRESSES);
