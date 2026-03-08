import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types'

export class ScheduleTriggerNode extends BaseNode {
  readonly type = 'schedule_trigger'
  readonly label = 'Schedule Trigger'
  readonly description = 'Runs the flow repeatedly on a fixed interval'
  readonly icon = 'Clock'
  readonly category = 'flow' as const
  readonly color = 'border-orange-400'
  readonly bgColor = 'bg-orange-950'

  readonly handles: HandleDef[] = [
    { id: 'signal', label: 'Out', position: 'right', type: 'source', dataType: 'signal' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'interval',
      label: 'Interval (seconds)',
      type: 'number',
      default: 30,
      placeholder: '30',
    },
    {
      key: 'maxRuns',
      label: 'Max Runs (0 = infinite)',
      type: 'number',
      default: 0,
    },
  ]

  // Tracks how many times it has fired across runs
  runCount = 0

  getInterval(): number {
    return Math.max(1, (this.config.interval as number) || 30)
  }

  getMaxRuns(): number {
    return (this.config.maxRuns as number) ?? 0
  }

  shouldContinue(): boolean {
    const max = this.getMaxRuns()
    return max === 0 || this.runCount < max
  }

  async execute(
    _inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    this.runCount++
    const max = this.getMaxRuns()
    context.addLog(
      `[Schedule] Tick #${this.runCount}${max > 0 ? ` / ${max}` : ''} — interval ${this.getInterval()}s`
    )
    return { signal: 'signal' }
  }

  reset() {
    this.runCount = 0
  }
}
