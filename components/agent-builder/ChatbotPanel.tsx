'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Agent, ChatMessage } from '@/types/agent-builder';
import { AgentChatbotService } from '@/lib/agent-builder/chatbot';
import { Send, Bot, User, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatbotPanelProps {
  currentAgent: Agent | null;
  onBlocksGenerated: (blocks: any[]) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ChatbotPanel({
  currentAgent,
  onBlocksGenerated,
  isCollapsed,
  onToggleCollapse,
}: ChatbotPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hi! I'm your AI Trading Agent Builder assistant.

I can help you:
- Create trading blocks with natural language
- Suggest trading strategies
- Validate your agent logic
- Answer questions about trading bots

Try saying:
"Create a buy block when price drops 5%"
"Suggest a DCA strategy"
"Validate my agent"

What would you like to build?`,
      timestamp: new Date().toISOString(),
      suggestions: [
        'Create a buy block',
        'Suggest trading strategy',
        'Help me get started',
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent || isProcessing) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Process message with chatbot service
      const response = await AgentChatbotService.processMessage(
        messageContent,
        currentAgent,
        messages
      );

      setMessages((prev) => [...prev, response]);

      // If blocks were generated, notify parent
      if (response.blocks && response.blocks.length > 0) {
        onBlocksGenerated(response.blocks);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isCollapsed) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 border-l">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-12 w-12 hover:bg-muted rounded-full"
          title="Show AI Assistant"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col border-l">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/20">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary"
          title="Collapse Panel"
        >
          <span className="text-xs">Hide</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                </div>
              )}

              <div
                className={cn(
                  'max-w-[85%] space-y-2',
                  message.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.blocks && message.blocks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground px-2">
                      Generated {message.blocks.length} block(s):
                    </p>
                    {message.blocks.map((block) => (
                      <Badge key={block.id} variant="secondary" className="mr-1">
                        {block.label}
                      </Badge>
                    ))}
                  </div>
                )}

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="h-7 text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground px-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex gap-3 justify-start">
              <div className="shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary animate-pulse" />
                </div>
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isProcessing}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
}
