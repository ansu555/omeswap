// Agent Builder Types

export type BlockType = 
  | 'trigger'
  | 'condition'
  | 'action'
  | 'strategy'
  | 'indicator'
  | 'loop'
  | 'delay';

export type TriggerSubType =
  | 'price_threshold'
  | 'price_change'
  | 'time_based'
  | 'manual'
  | 'event';

export type ConditionSubType =
  | 'if_else'
  | 'compare'
  | 'and_or'
  | 'range_check';

export type ActionSubType =
  | 'buy'
  | 'sell'
  | 'swap'
  | 'limit_order'
  | 'stop_loss'
  | 'take_profit';

export type StrategySubType =
  | 'dca'
  | 'grid_trading'
  | 'arbitrage'
  | 'market_making'
  | 'trailing_stop';

export type IndicatorSubType =
  | 'rsi'
  | 'macd'
  | 'moving_average'
  | 'bollinger_bands'
  | 'volume';

export interface BlockParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'token' | 'percentage' | 'time' | 'boolean' | 'select';
  value: any;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
}

export interface AgentBlock {
  id: string;
  type: BlockType;
  subType: string;
  label: string;
  description: string;
  parameters: BlockParameter[];
  position: { x: number; y: number };
  color: string;
  icon: string;
  isValid: boolean;
  errors: string[];
}

export interface BlockConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: 'default' | 'conditional' | 'error';
  label?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  blocks: AgentBlock[];
  connections: BlockConnection[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  status: 'draft' | 'testing' | 'active' | 'paused' | 'error';
  executionCount: number;
  lastExecuted?: string;
  tags: string[];
}

export interface BlockTemplate {
  type: BlockType;
  subType: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultParameters: Omit<BlockParameter, 'id'>[];
  category: string;
}

export interface AgentExecutionLog {
  id: string;
  agentId: string;
  timestamp: string;
  blockId: string;
  action: string;
  status: 'success' | 'error' | 'skipped';
  details: any;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  blocks?: AgentBlock[];
  connections?: BlockConnection[];
  suggestions?: string[];
}

export interface AgentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
