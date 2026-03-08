import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

// Create OpenAI client on each request to ensure correct API key
function getOpenAIClient() {
  const apiKey =
    process.env.OPEN_ROUTER_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENAI_API_KEY;

  return new OpenAI({
    apiKey: apiKey || "dummy-key-for-build",
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "Omeswap Agent Builder",
    },
  });
}

// Structured output schema for agent blocks
const BlockParameterSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  type: z.enum(["text", "number", "select", "boolean"]),
});

const AgentBlockSchema = z.object({
  type: z.string(),
  subType: z.string().optional(),
  label: z.string(),
  description: z.string().optional(),
  parameters: z.array(BlockParameterSchema).optional(),
});

const BlockConnectionSchema = z.object({
  sourceIndex: z.number(),
  targetIndex: z.number(),
  type: z.enum(["default", "conditional", "error"]).optional(),
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
        role: "system",
        content: `You are an expert trading bot builder assistant for a DEX (Decentralized Exchange). 
Help users create automated trading strategies on Avalanche (AVAX) using visual blocks on a flow canvas.

AVAILABLE NODE TYPES (use these exact values for the "type" field):
DATA SOURCES:
- "price_feed": Fetches live token price (params: pair)
- "wallet_balance": Reads wallet token balance (params: token)
- "dex_price": Gets DEX pool price (params: pair)

LOGIC:
- "condition": If/else branch (params: operator, value)
- "threshold": Alert when value crosses threshold (params: threshold, direction)
- "math": Arithmetic on values (params: operation)
- "variable": Store/read a named variable (params: name, value)
- "previous_value": Remember previous tick value
- "accumulator": Running sum/count
- "moving_average": Moving average / indicator (params: period, type)

ACTIONS:
- "swap": Execute a token swap (params: tokenIn, tokenOut, amount) — use for buy AND sell actions
- "limit_order": Place a limit order (params: token, price, amount, side)
- "notification": Send an alert/notification (params: message)
- "add_chart_marker": Add a visual marker on chart (params: label, color, shape)

FLOW CONTROL:
- "start": Entry point of the flow
- "end": Terminal node
- "merge": Merge multiple branches
- "schedule_trigger": Periodic trigger (params: interval) — use for ANY trigger/timer
- "delay": Wait before continuing (params: seconds)

CRITICAL RULES:
- The "type" field MUST be one of the exact node types listed above
- The "subType" can describe the variant (e.g. "rsi", "buy", "sell", "dca") for display purposes
- For buy/sell actions, use type "swap"
- For any periodic trigger, use type "schedule_trigger"
- For RSI, MACD, Bollinger Bands, use type "moving_average" with appropriate subType
- For stop-loss / take-profit, use type "condition" with threshold parameters

When creating blocks, include relevant parameters:
- token/pair: Token symbol (e.g., "AVAX", "ETH", "USDC")
- amount: Number amount
- price/threshold: Price or threshold value
- interval/period: Time interval or period
- operator: Comparison operator (">", "<", ">=", "<=", "==")

IMPORTANT: Always respond in valid JSON format with this structure:
{
  "message": "Your helpful response text",
  "blocks": [array of blocks if user wants to create any],
  "connections": [array of connections between blocks by index],
  "suggestions": [array of 3 helpful next action suggestions]
}

Example block:
{
  "type": "swap",
  "subType": "buy",
  "label": "Buy AVAX",
  "description": "Swap USDC for AVAX",
  "parameters": [
    {"name": "tokenIn", "value": "USDC", "type": "text"},
    {"name": "tokenOut", "value": "AVAX", "type": "text"},
    {"name": "amount", "value": 100, "type": "number"}
  ]
}

Example connections (linking blocks by their index in the blocks array):
[
  {"sourceIndex": 0, "targetIndex": 1, "type": "default"},
  {"sourceIndex": 1, "targetIndex": 2, "type": "default"}
]

CRITICAL: When creating multiple blocks, ALWAYS include connections to link them in order!
For a DCA bot: start → schedule_trigger → swap (buy) → condition (stop loss)
For a grid strategy: start → price_feed → condition (grid levels) → swap

Respond with helpful explanations and generate appropriate blocks when users ask to create strategies.
If user asks for a complete strategy, provide 3-6 connected blocks that form a working flow.
This is an Avalanche DeFi app — default to AVAX-related tokens.`,
      },
    ];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory
        .slice(-6)
        .forEach((msg: { role: string; content: string }) => {
          messages.push({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          });
        });
    }

    // Add current message
    messages.push({
      role: "user",
      content: message,
    });

    // Add agent context if available
    if (currentAgent) {
      messages.push({
        role: "system",
        content: `Current agent has ${currentAgent.blocks?.length || 0} blocks. Agent name: ${currentAgent.name}`,
      });
    }

    // Check for API key at runtime
    const apiKey =
      process.env.OPEN_ROUTER_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "API key not configured. Please set OPEN_ROUTER_API_KEY environment variable.",
        },
        { status: 500 },
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

    const responseText = completion.choices[0].message.content || "{}";

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
      console.error("Validation error:", parseError);
      console.error("Raw response:", responseText);

      // Try to extract blocks manually even if validation fails
      try {
        const parsedResponse = JSON.parse(responseText);
        return NextResponse.json({
          content:
            parsedResponse.message ||
            "I created some blocks for you, but there may be validation issues.",
          blocks: [],
          connections: [],
          suggestions: parsedResponse.suggestions || [
            "Try asking for a specific strategy",
            "Create a DCA bot",
            "Add stop loss",
          ],
        });
      } catch {
        // Complete failure
        return NextResponse.json({
          content:
            responseText ||
            "I encountered an issue processing your request. Please try rephrasing.",
          blocks: [],
          connections: [],
          suggestions: [
            "Create a DCA bot",
            "Build a grid trading strategy",
            "Add a stop loss",
          ],
        });
      }
    }
  } catch (error: any) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
