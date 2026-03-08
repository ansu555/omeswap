import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types/agent-builder-canvas'
import { ethers } from 'ethers'

const ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
]

const TOKEN_ADDRESSES: Record<string, { address: string; decimals: number }> = {
  WAVAX: { address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', decimals: 18 },
  'USDC.e': { address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', decimals: 6 },
  'USDT.e': { address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', decimals: 6 },
  JOE: { address: '0x6e84a6216eA6daCC71eE8E6b0a5B7322EEbC0fDd', decimals: 18 },
  PNG: { address: '0x60781C2586D68229fde47564546784ab3fACA982', decimals: 18 },
}

const DEX_ROUTERS: Record<string, string> = {
  'Trader Joe': '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
  Pangolin: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
}

export class DEXPriceNode extends BaseNode {
  readonly type = 'dex_price'
  readonly label = 'DEX Price'
  readonly description = 'Gets swap quote from Trader Joe or Pangolin'
  readonly icon = 'ArrowLeftRight'
  readonly category = 'data' as const
  readonly color = 'border-blue-500'
  readonly bgColor = 'bg-blue-950'

  readonly handles: HandleDef[] = [
    { id: 'price', label: 'Price', position: 'right', type: 'source', dataType: 'number' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'dex',
      label: 'DEX',
      type: 'select',
      options: ['Trader Joe', 'Pangolin'],
      default: 'Trader Joe',
    },
    {
      key: 'tokenIn',
      label: 'Token In',
      type: 'select',
      options: Object.keys(TOKEN_ADDRESSES),
      default: 'WAVAX',
    },
    {
      key: 'tokenOut',
      label: 'Token Out',
      type: 'select',
      options: Object.keys(TOKEN_ADDRESSES),
      default: 'USDC.e',
    },
    {
      key: 'amountIn',
      label: 'Amount In',
      type: 'number',
      default: 1,
    },
  ]

  async execute(
    _inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const dex = (this.config.dex as string) || 'Trader Joe'
    const tokenIn = (this.config.tokenIn as string) || 'WAVAX'
    const tokenOut = (this.config.tokenOut as string) || 'USDC.e'
    const amountIn = (this.config.amountIn as number) || 1

    const routerAddress = DEX_ROUTERS[dex]
    const inToken = TOKEN_ADDRESSES[tokenIn]
    const outToken = TOKEN_ADDRESSES[tokenOut]

    if (!inToken || !outToken) throw new Error('Unknown token')

    context.addLog(`[DEXPrice] Getting ${dex} quote: ${amountIn} ${tokenIn} → ${tokenOut}`)

    const provider = context.provider as ethers.BrowserProvider
    const router = new ethers.Contract(routerAddress, ROUTER_ABI, provider)

    const amountInWei = ethers.parseUnits(amountIn.toString(), inToken.decimals)
    const amounts = await router.getAmountsOut(amountInWei, [inToken.address, outToken.address])
    const amountOut = parseFloat(ethers.formatUnits(amounts[1], outToken.decimals))
    const price = amountOut / amountIn

    context.addLog(`[DEXPrice] 1 ${tokenIn} = ${price} ${tokenOut} on ${dex}`)
    return { price }
  }
}
