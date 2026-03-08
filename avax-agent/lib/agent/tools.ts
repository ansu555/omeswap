// OpenAI-compatible tool definitions for the canvas agent

export const AGENT_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'add_node',
      description: 'Place a node on the canvas. Returns the node ID to use in connect_nodes calls.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'The node type string (e.g. "price_feed", "condition", "swap")',
          },
          x: {
            type: 'number',
            description: 'X position on canvas. Data nodes: -200 to 0. Logic: 200-400. Action: 500-700. Flow: -400.',
          },
          y: {
            type: 'number',
            description: 'Y position on canvas. Spread vertically: 0, 150, 300... for multiple nodes at same x.',
          },
          label: {
            type: 'string',
            description: 'Optional short human label to identify this node in your own reasoning (not shown on canvas)',
          },
        },
        required: ['type'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'connect_nodes',
      description: 'Draw an edge between two nodes. Use the IDs returned by add_node.',
      parameters: {
        type: 'object',
        properties: {
          sourceId: { type: 'string', description: 'ID of the source node (returned by add_node)' },
          sourceHandle: { type: 'string', description: 'Handle ID on the source node (e.g. "price", "true", "signal")' },
          targetId: { type: 'string', description: 'ID of the target node' },
          targetHandle: { type: 'string', description: 'Handle ID on the target node (e.g. "value", "signal", "threshold")' },
        },
        required: ['sourceId', 'sourceHandle', 'targetId', 'targetHandle'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'configure_node',
      description: 'Set configuration values on a node after it has been placed.',
      parameters: {
        type: 'object',
        properties: {
          nodeId: { type: 'string', description: 'ID of the node to configure (returned by add_node)' },
          config: {
            type: 'object',
            description: 'Key-value config pairs matching the node\'s configSchema keys',
            additionalProperties: true,
          },
        },
        required: ['nodeId', 'config'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'ask_user',
      description: 'Pause and ask the user a clarifying question before continuing. Use when the strategy is ambiguous.',
      parameters: {
        type: 'object',
        properties: {
          question: { type: 'string', description: 'The question to ask the user' },
        },
        required: ['question'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'clear_canvas',
      description: 'Remove all nodes and edges from the canvas. Call this before building a completely new workflow.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
]
