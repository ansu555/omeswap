'use client';

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Agent, AgentBlock } from '@/types/agent-builder';
import { generateBlockId, generateConnectionId } from '@/lib/agent-builder/storage';
import AgentBlockNode from './AgentBlockNode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

const nodeTypes = {
  agentBlock: AgentBlockNode,
};

interface FlowCanvasProps {
  agent: Agent;
  onAgentUpdate: (updates: Partial<Agent>) => void;
}

function FlowCanvasInner({ agent, onAgentUpdate }: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Initialize nodes and edges from agent
  React.useEffect(() => {
    const flowNodes: Node[] = agent.blocks.map((block) => ({
      id: block.id,
      type: 'agentBlock',
      position: block.position,
      data: {
        ...block,
        onUpdate: handleBlockUpdate,
        onDelete: handleBlockDelete,
      },
    }));

    const flowEdges: Edge[] = agent.connections.map((conn) => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      sourceHandle: conn.sourceHandle,
      targetHandle: conn.targetHandle,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      label: conn.label,
      style: {
        stroke: conn.type === 'error' ? '#ef4444' : conn.sourceHandle === 'true' ? '#10b981' : conn.sourceHandle === 'false' ? '#ef4444' : '#6366f1',
        strokeWidth: 2,
      },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [agent.blocks, agent.connections]);

  const handleBlockUpdate = useCallback((id: string, updates: Partial<AgentBlock>) => {
    const updatedBlocks = agent.blocks.map((block) =>
      block.id === id ? { ...block, ...updates } : block
    );
    onAgentUpdate({ blocks: updatedBlocks });
  }, [agent.blocks, onAgentUpdate]);

  const handleBlockDelete = useCallback((id: string) => {
    const updatedBlocks = agent.blocks.filter((block) => block.id !== id);
    const updatedConnections = agent.connections.filter(
      (conn) => conn.source !== id && conn.target !== id
    );
    onAgentUpdate({
      blocks: updatedBlocks,
      connections: updatedConnections,
    });
    toast.success('Block deleted');
  }, [agent.blocks, agent.connections, onAgentUpdate]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newConnection = {
        id: generateConnectionId(),
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        type: 'default' as const,
      };

      const updatedConnections = [...agent.connections, newConnection];
      onAgentUpdate({ connections: updatedConnections });

      toast.success('Blocks connected');
    },
    [agent.connections, onAgentUpdate]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const templateData = event.dataTransfer.getData('application/reactflow');

      if (!templateData || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const template = JSON.parse(templateData);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newBlock: AgentBlock = {
        id: generateBlockId(),
        type: template.type,
        subType: template.subType,
        label: template.label,
        description: template.description,
        parameters: template.defaultParameters.map((param: any, index: number) => ({
          id: `param_${Date.now()}_${index}`,
          ...param,
        })),
        position,
        color: template.color,
        icon: template.icon,
        isValid: false,
        errors: [],
      };

      const updatedBlocks = [...agent.blocks, newBlock];
      onAgentUpdate({ blocks: updatedBlocks });

      toast.success(`Added ${template.label} block`);
    },
    [reactFlowInstance, agent.blocks, onAgentUpdate]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);

      // Update positions in agent data
      const positionChanges = changes.filter((change: any) => change.type === 'position' && change.position);
      if (positionChanges.length > 0) {
        const updatedBlocks = agent.blocks.map((block) => {
          const positionChange = positionChanges.find((change: any) => change.id === block.id);
          if (positionChange && positionChange.position) {
            return { ...block, position: positionChange.position };
          }
          return block;
        });
        onAgentUpdate({ blocks: updatedBlocks });
      }
    },
    [onNodesChange, agent.blocks, onAgentUpdate]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);

      // Handle edge removal
      const removedEdges = changes.filter((change: any) => change.type === 'remove');
      if (removedEdges.length > 0) {
        const updatedConnections = agent.connections.filter(
          (conn) => !removedEdges.some((edge: any) => edge.id === conn.id)
        );
        onAgentUpdate({ connections: updatedConnections });
      }
    },
    [onEdgesChange, agent.connections, onAgentUpdate]
  );

  const handleFitView = () => {
    reactFlowInstance?.fitView({ padding: 0.2 });
  };

  const handleZoomIn = () => {
    reactFlowInstance?.zoomIn();
  };

  const handleZoomOut = () => {
    reactFlowInstance?.zoomOut();
  };

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="bg-muted/30"
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2 },
        }}
      >
        <Background />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const blockData = node.data as AgentBlock;
            return blockData.color || '#6366f1';
          }}
          className="!bg-card !border-2"
        />

        <Panel position="top-right">
          <Card className="flex gap-1 p-1">
            <Button size="icon" variant="ghost" onClick={handleZoomIn} className="h-8 w-8">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleZoomOut} className="h-8 w-8">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleFitView} className="h-8 w-8">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </Card>
        </Panel>

        {nodes.length === 0 && (
          <Panel position="top-left" className="max-w-md">
            <Card className="p-6 bg-card/95 backdrop-blur">
              <h3 className="font-semibold mb-2">👋 Welcome to Agent Builder!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start building your trading agent by dragging blocks from the left panel onto the canvas.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  <span>Drag a <strong>Trigger</strong> block to start</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  <span>Add <strong>Action</strong> blocks to execute trades</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-primary">3.</span>
                  <span>Connect blocks by dragging from output to input</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-primary">4.</span>
                  <span>Configure each block's parameters</span>
                </div>
              </div>
            </Card>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export default function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
