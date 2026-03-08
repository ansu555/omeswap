import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Lazy initialize OpenAI client to avoid build-time errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    
    openaiClient = new OpenAI({
      apiKey: apiKey || 'dummy-key-for-build',
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Omeswap Agent Builder',
      },
    });
  }
  return openaiClient;
}

// Structured output schema for agent blocks
const BlockParameterSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  type: z.enum(['text', 'number', 'select', 'boolean']),
});

const AgentBlockSchema = z.object({
  type: z.enum(['trigger', 'condition', 'action', 'strategy', 'indicator', 'loop', 'delay']),
  subType: z.string(),
  label: z.string(),
  description: z.string().optional(),
  parameters: z.array(BlockParameterSchema).optional(),
});

const BlockConnectionSchema = z.object({
  sourceIndex: z.number(),
  targetIndex: z.number(),
  type: z.enum(['default', 'conditional', 'error']).optional(),
});

const ChatResponseSchema = z.object({
  message: z.string(),
  blocks: z.array(AgentBlockSchema).optional(),
  connections: z.array(BlockConnectionSchema).optional(),
  suggestions: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, currentAgent } = await request.json();

    // Build context from conversation history
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an expert trading bot builder assistant for a DEX (Decentralized Exchange). 
Help users create automated trading strategies using visual blocks.

Available block types:
1. TRIGGERS (type: "trigger"): price_trigger, time_trigger, event_trigger, volume_trigger, liquidity_trigger
2. CONDITIONS (type: "condition"): price_condition, balance_condition, time_condition, technical_indicator
3. ACTIONS (type: "action"): buy, sell, swap, limit_order, stop_loss, take_profit, cancel_order
4. STRATEGIES (type: "strategy"): dca, grid_trading, arbitrage, liquidity_provision, rebalancing
5. INDICATORS (type: "indicator"): moving_average, rsi, macd, bollinger_bands, volume_analysis
6. UTILITIES (type: "delay" or type: "loop"): delay blocks pause execution, loop blocks repeat actions

CRITICAL RULES FOR BLOCK TYPES:
- The "type" field MUST be one of: trigger, condition, action, strategy, indicator, loop, delay
- DO NOT use "utilities" or "notification" as a type
- If you need notifications, use "action" type with custom subType
- The "subType" field specifies the specific block variant

When creating blocks, be specific and include relevant parameters like:
- token: Token symbol (e.g., "ETH", "BTC", "USDC")
- amount: Number amount
- price: Price value
- percentage: Percentage value
- interval: Time interval
- threshold: Threshold value

IMPORTANT: Always respond in valid JSON format with this structure:
{
  "message": "Your helpful response text",
  "blocks": [array of blocks if user wants to create any],
  "connections": [array of connections between blocks by index],
  "suggestions": [array of 3 helpful next action suggestions]
}

Example block structure:
{
  "type": "action",
  "subType": "buy",
  "label": "Buy ETH",
  "description": "Buy Ethereum token",
  "parameters": [
    {"name": "token", "value": "ETH", "type": "text"},
    {"name": "amount", "value": 1, "type": "number"}
  ]
}

Example connections (connecting blocks by their index in the blocks array):
[
  {"sourceIndex": 0, "targetIndex": 1, "type": "default"},
  {"sourceIndex": 1, "targetIndex": 2, "type": "default"}
]

CRITICAL: When creating multiple blocks for a strategy, ALWAYS include connections array to link them together in order!
For example, if creating 3 blocks for a DCA bot:
- Block 0 (trigger) connects to Block 1 (buy action)
- Block 1 (buy action) connects to Block 2 (stop loss)
This creates a flow: Trigger → Buy → Stop Loss

Respond with helpful explanations and generate appropriate blocks when users ask to create strategies.
If user asks for a complete strategy, provide 3-5 connected blocks that form a working flow.`,
      },
    ];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.slice(-6).forEach((msg: { role: string; content: string }) => {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    // Add agent context if available
    if (currentAgent) {
      messages.push({
        role: 'system',
        content: `Current agent has ${currentAgent.blocks?.length || 0} blocks. Agent name: ${currentAgent.name}`,
      });
    }

    // Check for API key at runtime
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please set OPENROUTER_API_KEY or OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Call OpenRouter with JSON mode
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-lite", // Free model from OpenRouter
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0].message.content || '{}';
    
    try {
      const parsedResponse = JSON.parse(responseText);
      const validatedResponse = ChatResponseSchema.parse(parsedResponse);
      
      return NextResponse.json({
        content: validatedResponse.message,
        blocks: validatedResponse.blocks || [],
        connections: validatedResponse.connections || [],
        suggestions: validatedResponse.suggestions || [],
      });
    } catch (parseError: any) {
      console.error('Validation error:', parseError);
      console.error('Raw response:', responseText);
      
      // Try to extract blocks manually even if validation fails
      try {
        const parsedResponse = JSON.parse(responseText);
        return NextResponse.json({
          content: parsedResponse.message || 'I created some blocks for you, but there may be validation issues.',
          blocks: [],
          connections: [],
          suggestions: parsedResponse.suggestions || ['Try asking for a specific strategy', 'Create a DCA bot', 'Add stop loss'],
        });
      } catch {
        // Complete failure
        return NextResponse.json({
          content: responseText || 'I encountered an issue processing your request. Please try rephrasing.',
          blocks: [],
          connections: [],
          suggestions: ['Create a DCA bot', 'Build a grid trading strategy', 'Add a stop loss'],
        });
      }
    }

  } catch (error: any) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
