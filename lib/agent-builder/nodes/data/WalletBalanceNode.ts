import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types/agent-builder-canvas'
import { ethers } from 'ethers'

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

export class WalletBalanceNode extends BaseNode {
  readonly type = 'wallet_balance'
  readonly label = 'Wallet Balance'
  readonly description = 'Reads token balance from connected wallet'
  readonly icon = 'Wallet'
  readonly category = 'data' as const
  readonly color = 'border-blue-500'
  readonly bgColor = 'bg-blue-950'

  readonly handles: HandleDef[] = [
    { id: 'balance', label: 'Balance', position: 'right', type: 'source', dataType: 'number' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'token',
      label: 'Token',
      type: 'select',
      options: ['AVAX', 'WAVAX', 'USDC.e', 'USDT.e', 'JOE', 'PNG'],
      default: 'AVAX',
    },
  ]

  async execute(
    _inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    if (!context.walletAddress || !context.provider) {
      throw new Error('Wallet not connected')
    }

    const token = (this.config.token as string) || 'AVAX'
    context.addLog(`[WalletBalance] Checking ${token} balance...`)

    const provider = context.provider as ethers.BrowserProvider

    if (token === 'AVAX') {
      const raw = await provider.getBalance(context.walletAddress)
      const balance = parseFloat(ethers.formatEther(raw))
      context.addLog(`[WalletBalance] AVAX balance: ${balance}`)
      return { balance }
    }

    // ERC-20 token
    const TOKEN_ADDRESSES: Record<string, string> = {
      WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      'USDC.e': '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
      'USDT.e': '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
      JOE: '0x6e84a6216eA6daCC71eE8E6b0a5B7322EEbC0fDd',
      PNG: '0x60781C2586D68229fde47564546784ab3fACA982',
    }

    const address = TOKEN_ADDRESSES[token]
    if (!address) throw new Error(`Unknown token: ${token}`)

    const contract = new ethers.Contract(address, ERC20_ABI, provider)
    const [raw, decimals] = await Promise.all([
      contract.balanceOf(context.walletAddress),
      contract.decimals(),
    ])
    const balance = parseFloat(ethers.formatUnits(raw, decimals))
    context.addLog(`[WalletBalance] ${token} balance: ${balance}`)
    return { balance }
  }
}
