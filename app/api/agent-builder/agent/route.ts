import { NextRequest } from 'next/server'
import { buildSystemPrompt } from '@/lib/agent-builder/agent/systemPrompt'
import { AGENT_TOOLS } from '@/lib/agent-builder/agent/tools'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { messages, canvasState } = await req.json() as {
    messages: { role: string; content: string }[]
    canvasState: { nodeCount: number; nodes: unknown[]; edges: unknown[] }
  }

  const systemPrompt = buildSystemPrompt()

  const canvasContext = `Current canvas state: ${JSON.stringify(canvasState)}
Nodes on canvas: ${canvasState.nodeCount}. Use this to understand what's already built if the user asks to extend or modify.`

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://avax-agent.local',
      'X-Title': 'AVAX Bot Builder',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-5',
      stream: true,
      tools: AGENT_TOOLS,
      tool_choice: 'auto',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: canvasContext },
        ...messages,
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return new Response(JSON.stringify({ error: err }), { status: 500 })
  }

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
