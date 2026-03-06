import { ethers } from 'ethers'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any
  }
}

export const AVALANCHE_CHAIN_ID = 43114
export const AVALANCHE_RPC = 'https://api.avax.network/ext/bc/C/rpc'

export const AVALANCHE_CHAIN_PARAMS = {
  chainId: `0x${AVALANCHE_CHAIN_ID.toString(16)}`,
  chainName: 'Avalanche C-Chain',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrls: [AVALANCHE_RPC],
  blockExplorerUrls: ['https://snowtrace.io/'],
}

export function getPublicProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(AVALANCHE_RPC)
}

function getMetaMaskProvider(): NonNullable<Window['ethereum']> {
  if (!window.ethereum) throw new Error('MetaMask not installed')

  // When multiple wallets are installed, MetaMask injects itself into
  // window.ethereum.providers[] array. Find the one flagged isMetaMask.
  if (window.ethereum.providers?.length) {
    const mm = window.ethereum.providers.find((p: { isMetaMask?: boolean }) => p.isMetaMask)
    if (mm) return mm
  }

  // Single wallet scenario — check it's actually MetaMask
  if (window.ethereum.isMetaMask) return window.ethereum

  throw new Error('MetaMask not found. Please install MetaMask or disable other wallets.')
}

export async function connectMetaMask(): Promise<{
  provider: ethers.BrowserProvider
  signer: ethers.Signer
  address: string
}> {
  const mmProvider = getMetaMaskProvider()
  const provider = new ethers.BrowserProvider(mmProvider)

  // Request accounts directly on the MetaMask provider
  await mmProvider.request({ method: 'eth_requestAccounts' })

  // Switch to Avalanche C-Chain — use mmProvider.request directly to avoid
  // ethers wrapping the error code in a way that loses the 4902 value
  try {
    await mmProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: AVALANCHE_CHAIN_PARAMS.chainId }],
    })
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code
    if (code === 4902) {
      // Chain not yet in MetaMask — add it, then switch
      await mmProvider.request({
        method: 'wallet_addEthereumChain',
        params: [AVALANCHE_CHAIN_PARAMS],
      })
      // After adding, explicitly switch to it
      await mmProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AVALANCHE_CHAIN_PARAMS.chainId }],
      })
    } else {
      throw err
    }
  }

  const signer = await provider.getSigner()
  const address = await signer.getAddress()

  return { provider, signer, address }
}
