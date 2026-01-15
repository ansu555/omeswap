import { Agent, AgentBlock, BlockConnection, ChatMessage } from '@/types/agent-builder';
import { generateBlockId } from './storage';

// Block type to color/icon mapping
const BLOCK_STYLES: Record<string, { color: string; icon: string }> = {
  // Triggers
  trigger: { color: 'emerald', icon: 'Zap' },
  price_trigger: { color: 'emerald', icon: 'TrendingUp' },
  time_trigger: { color: 'emerald', icon: 'Clock' },
  event_trigger: { color: 'emerald', icon: 'Bell' },
  volume_trigger: { color: 'emerald', icon: 'Activity' },
  liquidity_trigger: { color: 'emerald', icon: 'Droplets' },
  
  // Conditions
  condition: { color: 'blue', icon: 'GitBranch' },
  price_condition: { color: 'blue', icon: 'DollarSign' },
  balance_condition: { color: 'blue', icon: 'Wallet' },
  time_condition: { color: 'blue', icon: 'Clock' },
  technical_indicator: { color: 'blue', icon: 'LineChart' },
  
  // Actions
  action: { color: 'purple', icon: 'Play' },
  buy: { color: 'purple', icon: 'ShoppingCart' },
  sell: { color: 'purple', icon: 'DollarSign' },
  swap: { color: 'purple', icon: 'Repeat' },
  limit_order: { color: 'purple', icon: 'Target' },
  stop_loss: { color: 'purple', icon: 'Shield' },
  take_profit: { color: 'purple', icon: 'TrendingUp' },
  cancel_order: { color: 'purple', icon: 'X' },
  
  // Strategies
  strategy: { color: 'amber', icon: 'Compass' },
  dca: { color: 'amber', icon: 'Calendar' },
  grid_trading: { color: 'amber', icon: 'Grid' },
  arbitrage: { color: 'amber', icon: 'ArrowLeftRight' },
  liquidity_provision: { color: 'amber', icon: 'Droplets' },
  rebalancing: { color: 'amber', icon: 'Scale' },
  
  // Indicators
  indicator: { color: 'orange', icon: 'BarChart' },
  moving_average: { color: 'orange', icon: 'TrendingUp' },
  rsi: { color: 'orange', icon: 'Activity' },
  macd: { color: 'orange', icon: 'LineChart' },
  bollinger_bands: { color: 'orange', icon: 'Maximize' },
  volume_analysis: { color: 'orange', icon: 'BarChart3' },
  
  // Utilities
  loop: { color: 'cyan', icon: 'RefreshCw' },
  delay: { color: 'cyan', icon: 'Timer' },
  notification: { color: 'cyan', icon: 'MessageSquare' },
};

function getBlockStyle(subType: string, type: string) {
  return BLOCK_STYLES[subType] || BLOCK_STYLES[type] || { color: 'gray', icon: 'Box' };
}

export class AgentChatbotService {
  static async processMessage(
    message: string,
    currentAgent: Agent | null,
    conversationHistory: ChatMessage[]
  ): Promise<ChatMessage> {
    try {
      // Call the API route
      const response = await fetch('/api/agent-builder/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          currentAgent,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // Transform blocks from API to include ALL required properties
      const blocks: AgentBlock[] = (data.blocks || []).map((block: any, index: number) => {
        const style = getBlockStyle(block.subType, block.type);
        
        return {
          id: generateBlockId(),
          type: block.type,
          subType: block.subType,
          label: block.label,
          description: block.description || '',
          parameters: (block.parameters || []).map((param: any) => ({
            id: generateBlockId(),
            name: param.name,
            value: param.value,
            type: param.type,
            label: param.name.charAt(0).toUpperCase() + param.name.slice(1).replace(/([A-Z])/g, ' $1'),
            required: true,
          })),
          position: {
            x: 300 + index * 250,
            y: 200 + Math.random() * 100,
          },
          color: style.color,
          icon: style.icon,
          isValid: false,
          errors: [],
        };
      });

      // Transform connections from API (using sourceIndex/targetIndex) to actual block IDs
      const connections: BlockConnection[] = (data.connections || []).map((conn: any) => ({
        id: generateBlockId(),
        source: blocks[conn.sourceIndex]?.id || '',
        target: blocks[conn.targetIndex]?.id || '',
        type: conn.type || 'default',
      }));

      return {
        id: generateBlockId(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        blocks,
        connections,
        suggestions: data.suggestions || [],
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      // Fallback to simple response
      return {
        id: generateBlockId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or check your connection.',
        timestamp: new Date().toISOString(),
        suggestions: [
          'Create a DCA bot',
          'Build a grid trading strategy',
          'Add a stop loss block',
        ],
      };
    }
  }
}
