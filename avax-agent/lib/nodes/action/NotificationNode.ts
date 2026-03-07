import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types'

export class NotificationNode extends BaseNode {
  readonly type = 'notification'
  readonly label = 'Notification'
  readonly description = 'Sends an alert via toast or webhook'
  readonly icon = 'BellRing'
  readonly category = 'action' as const
  readonly color = 'border-green-500'
  readonly bgColor = 'bg-green-950'

  readonly handles: HandleDef[] = [
    { id: 'signal', label: 'Trigger', position: 'left', type: 'target', dataType: 'signal' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'message',
      label: 'Message',
      type: 'text',
      default: 'Alert triggered!',
      placeholder: 'Enter notification message',
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: ['toast', 'webhook'],
      default: 'toast',
    },
    {
      key: 'webhookUrl',
      label: 'Webhook URL',
      type: 'text',
      default: '',
      placeholder: 'https://...',
    },
  ]

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    if (!inputs.signal) return {}

    const message = (this.config.message as string) || 'Alert triggered!'
    const type = (this.config.type as string) || 'toast'
    const webhookUrl = this.config.webhookUrl as string

    context.addLog(`[Notification] ${message}`)

    if (type === 'toast') {
      context.showToast(message)
    } else if (type === 'webhook' && webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, timestamp: new Date().toISOString() }),
      })
      context.addLog(`[Notification] Webhook sent to ${webhookUrl}`)
    }

    return {}
  }
}
