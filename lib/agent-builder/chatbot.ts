import { Agent, AgentBlock, ChatMessage } from '@/types/agent-builder';
import { BLOCK_TEMPLATES } from './block-templates';
import { generateBlockId } from './storage';

export class AgentChatbotService {
  static async processMessage(
    message: string,
    currentAgent: Agent | null,
    _conversationHistory: ChatMessage[]
  ): Promise<ChatMessage> {
    // This is a rule-based chatbot. In production, you'd integrate with an AI service
    const lowerMessage = message.toLowerCase();

    // Check for complete strategy creation
    if (this.isCompleteStrategyRequest(lowerMessage)) {
      return this.handleCompleteStrategy(lowerMessage);
    }

    // Check for block creation requests
    if (this.isBlockCreationRequest(lowerMessage)) {
      return this.handleBlockCreation(lowerMessage, currentAgent);
    }

    // Check for strategy suggestions
    if (this.isStrategySuggestionRequest(lowerMessage)) {
      return this.handleStrategySuggestion(lowerMessage);
    }

    // Check for validation requests
    if (this.isValidationRequest(lowerMessage)) {
      return this.handleValidation(currentAgent);
    }

    // Check for help requests
    if (this.isHelpRequest(lowerMessage)) {
      return this.handleHelp();
    }

    // Default response with suggestions
    return this.generateDefaultResponse(lowerMessage, currentAgent);
  }

  private static isCompleteStrategyRequest(message: string): boolean {
    const strategyPatterns = [
      'full bot', 'complete strategy', 'entire flow', 'whole bot',
      'create agent', 'build bot', 'make strategy', 'trading bot'
    ];
    return strategyPatterns.some(pattern => message.includes(pattern));
  }

  private static isBlockCreationRequest(message: string): boolean {
    const blockKeywords = [
      'create', 'add', 'make', 'build', 'new', 'block',
      'buy', 'sell', 'swap', 'trigger', 'condition', 'strategy'
    ];
    return blockKeywords.some(keyword => message.includes(keyword));
  }

  private static isStrategySuggestionRequest(message: string): boolean {
    const strategyKeywords = ['suggest', 'recommend', 'strategy', 'what should', 'how to'];
    return strategyKeywords.some(keyword => message.includes(keyword));
  }

  private static isValidationRequest(message: string): boolean {
    const validationKeywords = ['validate', 'check', 'correct', 'error', 'fix'];
    return validationKeywords.some(keyword => message.includes(keyword));
  }

  private static isHelpRequest(message: string): boolean {
    const helpKeywords = ['help', 'how', 'what', 'explain'];
    return helpKeywords.some(keyword => message.includes(keyword));
  }

  private static handleBlockCreation(message: string, _currentAgent: Agent | null): ChatMessage {
    const blocks: AgentBlock[] = [];
    let content = '';

    // Detect block type from message
    if (message.includes('buy')) {
      const template = BLOCK_TEMPLATES.find(t => t.subType === 'buy');
      if (template) {
        blocks.push(this.createBlockFromTemplate(template, message));
        content = 'I\'ve created a Buy Token block for you. You can customize the token, amount, and slippage in the block parameters.';
      }
    } else if (message.includes('sell')) {
      const template = BLOCK_TEMPLATES.find(t => t.subType === 'sell');
      if (template) {
        blocks.push(this.createBlockFromTemplate(template, message));
        content = 'I\'ve created a Sell Token block. Configure the token and amount to sell.';
      }
    } else if (message.includes('swap')) {
      const template = BLOCK_TEMPLATES.find(t => t.subType === 'swap');
      if (template) {
        blocks.push(this.createBlockFromTemplate(template, message));
        content = 'I\'ve created a Swap block. Set the tokens you want to swap between.';
      }
    } else if (message.includes('price') && (message.includes('trigger') || message.includes('when'))) {
      const template = BLOCK_TEMPLATES.find(t => t.subType === 'price_threshold');
      if (template) {
        blocks.push(this.createBlockFromTemplate(template, message));
        content = 'I\'ve created a Price Threshold trigger. Set the price condition to activate your strategy.';
      }
    } else if (message.includes('dca')) {
      const template = BLOCK_TEMPLATES.find(t => t.subType === 'dca');
      if (template) {
        blocks.push(this.createBlockFromTemplate(template, message));
        content = 'I\'ve created a DCA (Dollar Cost Averaging) strategy block. Configure the amount and interval.';
      }
    } else if (message.includes('stop loss')) {
      const template = BLOCK_TEMPLATES.find(t => t.subType === 'stop_loss');
      if (template) {
        blocks.push(this.createBlockFromTemplate(template, message));
        content = 'I\'ve created a Stop Loss block to protect your position. Set the trigger price.';
      }
    } else if (message.includes('if') || message.includes('condition')) {
      const template = BLOCK_TEMPLATES.find(t => t.subType === 'if_else');
      if (template) {
        blocks.push(this.createBlockFromTemplate(template, message));
        content = 'I\'ve created an If/Else condition block. Use this to branch your strategy logic.';
      }
    } else {
      content = `I can help you create blocks! Try saying:
- "Create a buy block"
- "Add a price trigger"
- "Make a DCA strategy"
- "Add stop loss"
- "Create swap block"

What would you like to create?`;
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      blocks,
      suggestions: this.generateSuggestions(message),
    };
  }

  private static handleStrategySuggestion(message: string): ChatMessage {
    let content = '';
    let suggestions: string[] = [];

    if (message.includes('beginner') || message.includes('start')) {
      content = `For beginners, I recommend starting with a simple strategy:

1. **Price Alert + Buy**: Trigger when price drops, then buy
2. **DCA Strategy**: Invest fixed amount regularly
3. **Take Profit**: Sell when target price is reached

Would you like me to create any of these?`;
      suggestions = ['Create price alert', 'Setup DCA', 'Add take profit'];
    } else if (message.includes('profit') || message.includes('trading')) {
      content = `Here are some popular trading strategies:

1. **Grid Trading**: Buy low, sell high automatically
2. **DCA + Take Profit**: Regular buys with profit targets
3. **RSI Strategy**: Trade based on overbought/oversold signals
4. **Trailing Stop**: Lock in profits as price rises

Which strategy interests you?`;
      suggestions = ['Create grid trading', 'Setup DCA strategy', 'Add RSI indicator', 'Create trailing stop'];
    } else {
      content = `I can help you build various trading strategies:

**Conservative**:
- Dollar Cost Averaging (DCA)
- Simple buy and hold with stop loss

**Active Trading**:
- Grid trading for range-bound markets
- RSI-based entries and exits
- Breakout strategies

**Risk Management**:
- Stop loss and take profit
- Trailing stops
- Portfolio rebalancing

What type of strategy are you interested in?`;
      suggestions = ['Conservative strategy', 'Active trading', 'Risk management'];
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      suggestions,
    };
  }

  private static handleValidation(currentAgent: Agent | null): ChatMessage {
    if (!currentAgent || currentAgent.blocks.length === 0) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Your agent is empty. Start by adding a trigger block to define when your strategy should activate.',
        timestamp: new Date().toISOString(),
        suggestions: ['Add price trigger', 'Add time trigger', 'Add manual trigger'],
      };
    }

    // Basic validation
    const hasTrigger = currentAgent.blocks.some(b => b.type === 'trigger');
    const hasAction = currentAgent.blocks.some(b => b.type === 'action');
    const hasConnections = currentAgent.connections.length > 0;

    let content = '**Validation Results:**\n\n';
    const suggestions: string[] = [];

    if (!hasTrigger) {
      content += '❌ Missing trigger block - Add a trigger to start your strategy\n';
      suggestions.push('Add trigger block');
    } else {
      content += '✅ Has trigger block\n';
    }

    if (!hasAction) {
      content += '⚠️ No action blocks - Add buy/sell/swap blocks to execute trades\n';
      suggestions.push('Add action block');
    } else {
      content += '✅ Has action block\n';
    }

    if (!hasConnections && currentAgent.blocks.length > 1) {
      content += '❌ Blocks are not connected - Connect blocks to create flow\n';
      suggestions.push('Connect blocks');
    } else if (hasConnections) {
      content += '✅ Blocks are connected\n';
    }

    if (hasTrigger && hasAction && hasConnections) {
      content += '\n✅ Your agent looks good! You can now test or activate it.';
      suggestions.push('Test agent', 'Activate agent');
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      suggestions,
    };
  }

  private static handleHelp(): ChatMessage {
    const content = `**Agent Builder Help**

**Block Types:**
- **Triggers**: Start your strategy (price, time, manual)
- **Conditions**: Add logic (if/else, comparisons)
- **Actions**: Execute trades (buy, sell, swap)
- **Strategies**: Pre-built patterns (DCA, grid, trailing stop)
- **Indicators**: Technical analysis (RSI, MA, Bollinger Bands)

**How to Build:**
1. Drag blocks from the left panel to the canvas
2. Connect blocks by dragging from output to input
3. Configure each block's parameters
4. Test your agent before activating

**Tips:**
- Start with a trigger block
- Always add stop loss for risk management
- Test with small amounts first
- Monitor execution logs

Ask me anything like:
- "Create a buy block"
- "Suggest a trading strategy"
- "Validate my agent"`;

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      suggestions: ['Show block types', 'Suggest strategy', 'Validate agent'],
    };
  }

  private static generateDefaultResponse(_message: string, currentAgent: Agent | null): ChatMessage {
    const blockCount = currentAgent?.blocks.length || 0;
    
    let content = `I'm here to help you build trading agents! `;
    
    if (blockCount === 0) {
      content += `Let's start by creating your first block. What would you like to do?`;
    } else {
      content += `Your agent has ${blockCount} block(s). What would you like to add or modify?`;
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      suggestions: [
        'Create a buy block',
        'Add price trigger',
        'Suggest a strategy',
        'Validate my agent',
        'Show help',
      ],
    };
  }

  private static createBlockFromTemplate(template: any, _message: string): AgentBlock {
    return {
      id: generateBlockId(),
      type: template.type,
      subType: template.subType,
      label: template.label,
      description: template.description,
      parameters: template.defaultParameters.map((param: any, index: number) => ({
        id: `param_${Date.now()}_${index}`,
        ...param,
      })),
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      color: template.color,
      icon: template.icon,
      isValid: false,
      errors: [],
    };
  }

  private static handleCompleteStrategy(message: string): ChatMessage {
    const blocks: AgentBlock[] = [];
    let content = '';

    // DCA Strategy with protection
    if (message.includes('dca') || message.includes('dollar cost')) {
      
      // 1. Time trigger
      const triggerTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'time_based');
      if (triggerTemplate) blocks.push(this.createBlockFromTemplate(triggerTemplate, message));
      
      // 2. Buy action
      const buyTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'buy');
      if (buyTemplate) blocks.push(this.createBlockFromTemplate(buyTemplate, message));
      
      // 3. Stop loss
      const stopLossTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'stop_loss');
      if (stopLossTemplate) blocks.push(this.createBlockFromTemplate(stopLossTemplate, message));

      content = `✨ Created a complete **DCA with Stop Loss** strategy!

**Strategy Flow:**
1. ⏰ Time Trigger - Executes daily
2. 🛒 Buy Token - Regular purchase
3. 🛡️ Stop Loss - Risk protection

Connect them in order and configure the parameters. This strategy will automatically buy at regular intervals while protecting your downside.`;
    }
    // Price dip buying strategy
    else if (message.includes('dip') || message.includes('drop') || message.includes('low')) {
      
      // 1. Price change trigger
      const triggerTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'price_change');
      if (triggerTemplate) blocks.push(this.createBlockFromTemplate(triggerTemplate, message));
      
      // 2. Condition check
      const conditionTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'if_else');
      if (conditionTemplate) blocks.push(this.createBlockFromTemplate(conditionTemplate, message));
      
      // 3. Buy action
      const buyTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'buy');
      if (buyTemplate) blocks.push(this.createBlockFromTemplate(buyTemplate, message));
      
      // 4. Take profit
      const takeProfitTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'take_profit');
      if (takeProfitTemplate) blocks.push(this.createBlockFromTemplate(takeProfitTemplate, message));

      content = `✨ Created a complete **Buy the Dip** strategy!

**Strategy Flow:**
1. 📉 Price Change Trigger - Detects price drops
2. ❓ Condition Check - Validates the dip
3. 🛒 Buy Token - Purchase at lower price
4. 💰 Take Profit - Lock in gains

This strategy automatically buys when prices drop and takes profit when they recover!`;
    }
    // Grid trading strategy
    else if (message.includes('grid') || message.includes('range')) {
      
      // 1. Manual trigger
      const triggerTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'manual');
      if (triggerTemplate) blocks.push(this.createBlockFromTemplate(triggerTemplate, message));
      
      // 2. Grid strategy
      const gridTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'grid_trading');
      if (gridTemplate) blocks.push(this.createBlockFromTemplate(gridTemplate, message));

      content = `✨ Created a complete **Grid Trading** strategy!

**Strategy Flow:**
1. ▶️ Manual Trigger - Start when ready
2. 📊 Grid Trading - Automated buy/sell in range

This strategy profits from price volatility by buying low and selling high automatically within a price range!`;
    }
    // RSI-based trading
    else if (message.includes('rsi') || message.includes('indicator') || message.includes('technical')) {
      
      // 1. Time trigger
      const triggerTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'time_based');
      if (triggerTemplate) blocks.push(this.createBlockFromTemplate(triggerTemplate, message));
      
      // 2. RSI indicator
      const rsiTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'rsi');
      if (rsiTemplate) blocks.push(this.createBlockFromTemplate(rsiTemplate, message));
      
      // 3. Condition
      const conditionTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'if_else');
      if (conditionTemplate) blocks.push(this.createBlockFromTemplate(conditionTemplate, message));
      
      // 4. Buy action
      const buyTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'buy');
      if (buyTemplate) blocks.push(this.createBlockFromTemplate(buyTemplate, message));
      
      // 5. Sell action
      const sellTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'sell');
      if (sellTemplate) blocks.push(this.createBlockFromTemplate(sellTemplate, message));

      content = `✨ Created a complete **RSI Trading** strategy!

**Strategy Flow:**
1. ⏰ Time Trigger - Check every 15 minutes
2. 📈 RSI Indicator - Calculate RSI value
3. ❓ Condition - Check if oversold/overbought
4. 🛒 Buy Token - When RSI < 30 (oversold)
5. 💰 Sell Token - When RSI > 70 (overbought)

This strategy uses technical analysis to find optimal entry and exit points!`;
    }
    // Trailing stop profit taking
    else if (message.includes('trail') || message.includes('profit lock')) {
      
      // 1. Manual trigger
      const triggerTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'manual');
      if (triggerTemplate) blocks.push(this.createBlockFromTemplate(triggerTemplate, message));
      
      // 2. Buy action
      const buyTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'buy');
      if (buyTemplate) blocks.push(this.createBlockFromTemplate(buyTemplate, message));
      
      // 3. Trailing stop
      const trailingTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'trailing_stop');
      if (trailingTemplate) blocks.push(this.createBlockFromTemplate(trailingTemplate, message));

      content = `✨ Created a complete **Trailing Stop** strategy!

**Strategy Flow:**
1. ▶️ Manual Trigger - Start when ready
2. 🛒 Buy Token - Initial purchase
3. 📈 Trailing Stop - Locks in profits as price rises

This strategy automatically sells if price drops by a set percentage from its peak, securing your profits!`;
    }
    // Generic complete strategy
    else {
      
      // Create a basic flow: Trigger -> Buy -> Stop Loss -> Take Profit
      const triggerTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'price_threshold');
      const buyTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'buy');
      const stopLossTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'stop_loss');
      const takeProfitTemplate = BLOCK_TEMPLATES.find(t => t.subType === 'take_profit');
      
      if (triggerTemplate) blocks.push(this.createBlockFromTemplate(triggerTemplate, message));
      if (buyTemplate) blocks.push(this.createBlockFromTemplate(buyTemplate, message));
      if (stopLossTemplate) blocks.push(this.createBlockFromTemplate(stopLossTemplate, message));
      if (takeProfitTemplate) blocks.push(this.createBlockFromTemplate(takeProfitTemplate, message));

      content = `✨ Created a complete **Trading Bot** for you!

**Strategy Flow:**
1. 🎯 Price Threshold - Trigger condition
2. 🛒 Buy Token - Execute purchase
3. 🛡️ Stop Loss - Risk management
4. 💰 Take Profit - Profit taking

Connect these blocks and configure the parameters. This is a solid foundation for any trading strategy!`;
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      blocks,
      suggestions: [
        'Configure parameters',
        'Add another strategy',
        'Validate agent',
      ],
    };
  }

  private static generateSuggestions(message: string): string[] {
    const suggestions: string[] = [];
    
    if (message.includes('buy')) {
      suggestions.push('Add stop loss', 'Add take profit', 'Connect to trigger');
    } else if (message.includes('trigger')) {
      suggestions.push('Add buy action', 'Add condition', 'Add sell action');
    } else if (message.includes('strategy')) {
      suggestions.push('Add risk management', 'Configure parameters', 'Test strategy');
    }
    
    return suggestions.length > 0 ? suggestions : ['What else can I help with?'];
  }
}
