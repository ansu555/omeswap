"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { Agent, AgentBlock, BlockConnection } from "@/types/agent-builder"

interface AgentBuilderContext {
  currentAgent: Agent | null
  onBlocksGenerated: ((blocks: AgentBlock[], connections: BlockConnection[]) => void) | null
}

interface ChatContextType {
  isOpen: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  // Agent builder mode
  agentBuilderMode: boolean
  agentBuilderContext: AgentBuilderContext | null
  setAgentBuilderMode: (enabled: boolean, context?: AgentBuilderContext) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [agentBuilderMode, setAgentBuilderModeState] = useState(false)
  const [agentBuilderContext, setAgentBuilderContext] = useState<AgentBuilderContext | null>(null)

  const openChat = useCallback(() => setIsOpen(true), [])
  const closeChat = useCallback(() => setIsOpen(false), [])
  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), [])

  const setAgentBuilderMode = useCallback((enabled: boolean, context?: AgentBuilderContext) => {
    setAgentBuilderModeState(enabled)
    setAgentBuilderContext(enabled && context ? context : null)
  }, [])

  return (
    <ChatContext.Provider value={{
      isOpen,
      openChat,
      closeChat,
      toggleChat,
      agentBuilderMode,
      agentBuilderContext,
      setAgentBuilderMode
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
