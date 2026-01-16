"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageCircle,
  X,
  Search,
  Link,
  Coins,
  TrendingUp,
  Wallet,
  ArrowLeftRight,
  Sparkles,
  LayoutGrid,
  RefreshCcw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Bot,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useChatContext } from "@/components/providers/chat-provider"
import { Conversation, ConversationContent } from "@/components/ui/conversation"
import { Message, MessageContent } from "@/components/ui/message"
import { Actions, Action } from "@/components/ui/actions"
import { AgentChatbotService } from "@/lib/agent-builder/chatbot"
import { AgentBlock, ChatMessage as AgentChatMessage } from "@/types/agent-builder"

interface ChatMessage {
  id: string
  from: "user" | "assistant"
  content: string
  avatar: string
  name: string
  blocks?: AgentBlock[]
  suggestions?: string[]
}

export function ChatbotPanel() {
  const { isOpen, closeChat, agentBuilderMode, agentBuilderContext } = useChatContext()
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)

  // Convert messages to agent chat format for context
  const agentMessages: AgentChatMessage[] = React.useMemo(() => {
    return messages.map(m => ({
      id: m.id,
      role: m.from === "user" ? "user" as const : "assistant" as const,
      content: m.content,
      timestamp: new Date().toISOString(),
      blocks: m.blocks,
      suggestions: m.suggestions,
    }))
  }, [messages])

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      from: "user",
      content: inputValue.trim(),
      avatar: "/placeholder-user.png",
      name: "You",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)

    try {
      if (agentBuilderMode && agentBuilderContext) {
        // Use agent builder chatbot service
        const response = await AgentChatbotService.processMessage(
          userMessage.content,
          agentBuilderContext.currentAgent,
          agentMessages
        )

        const assistantMessage: ChatMessage = {
          id: response.id,
          from: "assistant",
          content: response.content,
          avatar: "/ai-avatar.png",
          name: "AI Assistant",
          blocks: response.blocks,
          suggestions: response.suggestions,
        }

        setMessages((prev) => [...prev, assistantMessage])

        // If blocks were generated, notify parent
        if (response.blocks && response.blocks.length > 0 && agentBuilderContext.onBlocksGenerated) {
          agentBuilderContext.onBlocksGenerated(response.blocks, response.connections || [])
        }
      } else {
        // Simulate assistant response for non-agent builder mode
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            from: "assistant",
            content: "I'm your Web3 AI assistant. I can help you with token information, market trends, portfolio management, and swap guidance. How can I assist you today?",
            avatar: "/ai-avatar.png",
            name: "AI Assistant",
          }
          setMessages((prev) => [...prev, assistantMessage])
        }, 1000)
      }
    } catch (error) {
      console.error("Error processing message:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        avatar: "/ai-avatar.png",
        name: "AI Assistant",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt)
    textareaRef.current?.focus()
  }

  const hasMessages = messages.length > 0

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="chatbot-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 420, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 40,
          }}
          className="h-full pt-6 pr-6 pb-6 flex-shrink-0"
        >
      <div className="h-full glass-card rounded-xl flex flex-col overflow-hidden border border-border/50">
        {/* Header */}
        <div className="flex items-center justify-end gap-1 p-3 flex-shrink-0">
          <button
            type="button"
            className="h-8 w-8 p-0 rounded-md flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => closeChat()}
            className="h-8 w-8 p-0 rounded-md flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!hasMessages ? (
            /* Welcome Section - shown when no messages */
            <div className="flex flex-col items-center justify-center space-y-6 p-6 pt-2">
              {/* Sparkle Icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-card border border-border/50 shadow-lg">
                {agentBuilderMode ? (
                  <Bot className="w-6 h-6 text-primary" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-6 h-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M12 3C12 7.97 16.03 12 21 12C16.03 12 12 16.03 12 21C12 16.03 7.97 12 3 12C7.97 12 12 7.97 12 3Z"
                      fill="url(#sparkle-gradient)"
                      stroke="url(#sparkle-gradient)"
                    />
                    <defs>
                      <linearGradient id="sparkle-gradient" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="rgba(255,255,255,0.9)" />
                        <stop offset="1" stopColor="rgba(255,255,255,0.5)" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
              </div>

              {/* Greeting */}
              <div className="flex flex-col space-y-2 text-center">
                <div className="flex flex-col">
                  <h2 className="text-xl font-medium tracking-tight text-muted-foreground">
                    {agentBuilderMode ? "AI Trading Agent Builder" : "Hi there,"}
                  </h2>
                  <h3 className="text-lg font-medium tracking-tight text-foreground">
                    {agentBuilderMode ? "What would you like to build?" : "Welcome back! How can I help?"}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                  {agentBuilderMode
                    ? "I can help you create trading blocks, suggest strategies, and validate your agent logic."
                    : "I'm here to help you with your Web3 tasks. Choose from the prompts below or just tell me what you need!"}
                </p>
              </div>

              {/* Action Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {agentBuilderMode ? (
                  <>
                    <Badge
                      variant="secondary"
                      className="h-7 cursor-pointer gap-1.5 text-xs rounded-md px-2.5 hover:bg-secondary/80 transition-colors"
                      onClick={() => handlePromptClick("Create a buy block when price drops 5%")}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-green-500" />
                      Create buy block
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-7 cursor-pointer gap-1.5 text-xs rounded-md px-2.5 hover:bg-secondary/80 transition-colors"
                      onClick={() => handlePromptClick("Suggest a DCA trading strategy")}
                    >
                      <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                      DCA strategy
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-7 cursor-pointer gap-1.5 text-xs rounded-md px-2.5 hover:bg-secondary/80 transition-colors"
                      onClick={() => handlePromptClick("Validate my agent")}
                    >
                      <Bot className="h-3.5 w-3.5 text-purple-500" />
                      Validate agent
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-7 cursor-pointer gap-1.5 text-xs rounded-md px-2.5 hover:bg-secondary/80 transition-colors"
                      onClick={() => handlePromptClick("Help me get started")}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                      Get started
                    </Badge>
                  </>
                ) : (
                  <>
                    <Badge
                      variant="secondary"
                      className="h-7 cursor-pointer gap-1.5 text-xs rounded-md px-2.5 hover:bg-secondary/80 transition-colors"
                      onClick={() => handlePromptClick("Tell me about the top tokens")}
                    >
                      <Coins className="h-3.5 w-3.5 text-blue-500" />
                      Token info
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-7 cursor-pointer gap-1.5 text-xs rounded-md px-2.5 hover:bg-secondary/80 transition-colors"
                      onClick={() => handlePromptClick("What are the current market trends?")}
                    >
                      <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                      Market trends
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-7 cursor-pointer gap-1.5 text-xs rounded-md px-2.5 hover:bg-secondary/80 transition-colors"
                      onClick={() => handlePromptClick("Help me manage my portfolio")}
                    >
                      <Wallet className="h-3.5 w-3.5 text-green-500" />
                      Portfolio help
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-7 cursor-pointer gap-1.5 text-xs rounded-md px-2.5 hover:bg-secondary/80 transition-colors"
                      onClick={() => handlePromptClick("How do I swap tokens?")}
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5 text-pink-500" />
                      Swap guide
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-7 cursor-pointer gap-1.5 text-xs rounded-md px-2.5 hover:bg-secondary/80 transition-colors"
                      onClick={() => handlePromptClick("What else can you help me with?")}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                      More
                    </Badge>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Conversation - shown when messages exist */
            <Conversation className="flex-1 overflow-y-auto">
              <ConversationContent>
                {messages.map((message) => (
                  <Message key={message.id} from={message.from}>
                    {message.from === "assistant" ? (
                      <div className="flex items-start gap-2">
                        <img
                          src="/logo.png"
                          alt="AI"
                          className="flex-shrink-0 w-8 h-8 rounded-xl"
                        />
                        <div className="flex flex-col gap-1">
                          <MessageContent from={message.from}>
                            {message.content}
                          </MessageContent>
                          {/* Show generated blocks */}
                          {message.blocks && message.blocks.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-xs text-muted-foreground w-full">
                                Generated {message.blocks.length} block(s):
                              </span>
                              {message.blocks.map((block) => (
                                <Badge key={block.id} variant="secondary" className="text-xs">
                                  {block.label}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {/* Show suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {message.suggestions.map((suggestion, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="h-6 cursor-pointer text-xs hover:bg-secondary/80 transition-colors"
                                  onClick={() => handlePromptClick(suggestion)}
                                >
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {suggestion}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Actions className="mt-1">
                            <Action label="Retry">
                              <RefreshCcw className="size-3.5" />
                            </Action>
                            <Action label="Like">
                              <ThumbsUp className="size-3.5" />
                            </Action>
                            <Action label="Dislike">
                              <ThumbsDown className="size-3.5" />
                            </Action>
                            <Action label="Copy" onClick={() => handleCopy(message.content)}>
                              <Copy className="size-3.5" />
                            </Action>
                          </Actions>
                        </div>
                      </div>
                    ) : (
                      <MessageContent from={message.from}>
                        {message.content}
                      </MessageContent>
                    )}
                  </Message>
                ))}
                {/* Processing indicator */}
                {isProcessing && (
                  <Message from="assistant">
                    <div className="flex items-start gap-2">
                      <img
                        src="/logo.png"
                        alt="AI"
                        className="flex-shrink-0 w-8 h-8 rounded-xl"
                      />
                      <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted">
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </Message>
                )}
                <div ref={messagesEndRef} />
              </ConversationContent>
            </Conversation>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0">
          <form onSubmit={handleSubmit} className="relative mx-3 rounded-lg border border-border bg-background">
            <div className="relative">
              <textarea
                ref={textareaRef}
                placeholder={agentBuilderMode ? "Describe what you want to build..." : "Ask me anything..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 resize-none rounded-t-lg p-3 ps-9 pe-9 outline-none min-h-[80px] disabled:opacity-50"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeChat()
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <div className="pointer-events-none absolute left-3 top-[14px] text-muted-foreground/60">
                <Search className="h-4 w-4" />
              </div>
              <button
                type="submit"
                className="absolute right-3 top-[12px] p-1 rounded-md text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>

            {/* Bottom Bar */}
            <div className="flex items-center justify-end rounded-b-lg border-t border-border bg-muted/50 px-3 py-2">
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <Link className="h-3.5 w-3.5" />
                  Attach
                </Button>
                <Button type="button" variant="ghost" className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <span className="flex items-center justify-center h-3.5 w-3.5 rounded border border-current text-[10px] font-medium">/</span>
                  Shortcuts
                </Button>
              </div>
            </div>
          </form>

          <p className="text-xs text-muted-foreground text-center py-3">
            AI can make mistakes, please verify important information.
          </p>
        </div>
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ChatToggleButton() {
  const { isOpen, openChat } = useChatContext()

  if (isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        onClick={openChat}
        className="flex items-center gap-2.5 rounded-full px-5 py-3 bg-card border border-border shadow-lg hover:bg-accent animate-heartbeat-glow text-base"
        variant="ghost"
      >
        <MessageCircle className="h-6 w-6" />
        <span>Ask AI</span>
      </Button>
    </motion.div>
  )
}

export default ChatbotPanel
