import type {
  NodeCategory,
  NodeStatus,
  HandleDef,
  ConfigField,
  ExecutionContext,
} from '@/types'

export abstract class BaseNode {
  id: string
  abstract readonly type: string
  abstract readonly label: string
  abstract readonly description: string
  abstract readonly icon: string
  abstract readonly category: NodeCategory
  abstract readonly color: string        // border + accent color class
  abstract readonly bgColor: string      // background color class
  abstract readonly handles: HandleDef[]
  abstract readonly configSchema: ConfigField[]

  config: Record<string, unknown> = {}
  status: NodeStatus = 'idle'

  constructor(id: string) {
    this.id = id
    // Initialize config from schema defaults
  }

  init() {
    this.configSchema.forEach((field) => {
      if (field.default !== undefined && !(field.key in this.config)) {
        this.config[field.key] = field.default
      }
    })
  }

  setConfig(values: Record<string, unknown>) {
    this.config = { ...this.config, ...values }
  }

  setStatus(status: NodeStatus) {
    this.status = status
  }

  abstract execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>>
}
