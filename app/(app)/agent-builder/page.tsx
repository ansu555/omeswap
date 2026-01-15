'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Agent, AgentBlock, BlockConnection } from '@/types/agent-builder';
import { AgentStorageManager, generateAgentId } from '@/lib/agent-builder/storage';
import { AgentToolbar, BlockPalette, ChatbotPanel, FlowCanvas } from '@/components/agent-builder';
import AgentManager from '@/components/agent-builder/AgentManager';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { toast } from 'sonner';

export default function AgentBuilderPage() {
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isChatbotCollapsed, setIsChatbotCollapsed] = useState(false);
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);

  // Initialize or load agent
  useEffect(() => {
    const activeAgentId = AgentStorageManager.getActiveAgentId();
    let agent: Agent | null = null;

    if (activeAgentId) {
      agent = AgentStorageManager.loadAgent(activeAgentId);
    }

    if (!agent) {
      // Create new agent
      agent = createNewAgent();
      AgentStorageManager.saveAgent(agent);
      AgentStorageManager.setActiveAgent(agent.id);
    }

    setCurrentAgent(agent);
  }, []);

  // Auto-save agent on changes
  useEffect(() => {
    if (currentAgent) {
      const timeoutId = setTimeout(() => {
        AgentStorageManager.saveAgent(currentAgent);
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [currentAgent]);

  const createNewAgent = (): Agent => {
    return {
      id: generateAgentId(),
      name: 'New Trading Agent',
      description: 'A custom trading agent',
      blocks: [],
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: false,
      status: 'draft',
      executionCount: 0,
      tags: [],
    };
  };

  const handleCreateNewAgent = useCallback(() => {
    const newAgent = createNewAgent();
    AgentStorageManager.saveAgent(newAgent);
    AgentStorageManager.setActiveAgent(newAgent.id);
    setCurrentAgent(newAgent);
  }, []);

  const handleAgentUpdate = useCallback((updates: Partial<Agent>) => {
    setCurrentAgent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const handleSave = useCallback(() => {
    if (currentAgent) {
      AgentStorageManager.saveAgent(currentAgent);
      toast.success('Agent saved successfully');
    }
  }, [currentAgent]);

  const handleReset = useCallback(() => {
    setCurrentAgent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: [],
        connections: [],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const handleBlocksGenerated = useCallback((blocks: AgentBlock[], connections: BlockConnection[]) => {
    if (!currentAgent) return;

    // Blocks already have positions from the chatbot service, so we don't need to recalculate

    setCurrentAgent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: [...prev.blocks, ...blocks],
        connections: [...prev.connections, ...connections],
        updatedAt: new Date().toISOString(),
      };
    });

    const connectionText = connections.length > 0 ? ` and ${connections.length} connection(s)` : '';
    toast.success(`Added ${blocks.length} block(s)${connectionText} to canvas`);
  }, [currentAgent]);

  if (!currentAgent) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Agent Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <AgentToolbar
          agent={currentAgent}
          onAgentUpdate={handleAgentUpdate}
          onSave={handleSave}
          onReset={handleReset}
        />
        <div className="absolute right-4 top-3 z-10">
          <AgentManager
            currentAgent={currentAgent}
            onSelectAgent={(agent) => setCurrentAgent(agent)}
            onCreateNew={handleCreateNewAgent}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* @ts-ignore - direction prop is valid for react-resizable-panels */}
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Block Palette */}
          {!isPaletteCollapsed && (
            <>
              <ResizablePanel defaultSize={20} minSize={3}>
                <BlockPalette onToggleCollapse={() => setIsPaletteCollapsed(true)} />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Flow Canvas */}
          <ResizablePanel minSize={3}>
            <div className="relative h-full">
              <FlowCanvas agent={currentAgent} onAgentUpdate={handleAgentUpdate} />
              
              {/* Collapse/Expand Buttons */}
              {isPaletteCollapsed && (
                <button
                  onClick={() => setIsPaletteCollapsed(false)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-card border-2 border-primary/20 shadow-xl hover:bg-primary/10 hover:border-primary/40 transition-all hover:scale-110 group"
                  title="Show Block Palette"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary group-hover:translate-x-1 transition-transform">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
              )}
              
              {isChatbotCollapsed && (
                <button
                  onClick={() => setIsChatbotCollapsed(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-card border-2 border-primary/20 shadow-xl hover:bg-primary/10 hover:border-primary/40 transition-all hover:scale-110 group"
                  title="Show AI Assistant"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary group-hover:-translate-x-1 transition-transform">
                    <path d="M12 8V4H8"></path>
                    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                    <path d="M2 14h2"></path>
                    <path d="M20 14h2"></path>
                    <path d="M15 13v2"></path>
                    <path d="M9 13v2"></path>
                  </svg>
                </button>
              )}
            </div>
          </ResizablePanel>

          {/* Chatbot Panel */}
          {!isChatbotCollapsed && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={3}>
                <ChatbotPanel
                  currentAgent={currentAgent}
                  onBlocksGenerated={handleBlocksGenerated}
                  isCollapsed={isChatbotCollapsed}
                  onToggleCollapse={() => setIsChatbotCollapsed(true)}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
