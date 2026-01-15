'use client';

import React, { useState, useEffect } from 'react';
import { Agent } from '@/types/agent-builder';
import { AgentStorageManager } from '@/lib/agent-builder/storage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  List,
  Plus,
  MoreVertical,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AgentManagerProps {
  currentAgent: Agent;
  onSelectAgent: (agent: Agent) => void;
  onCreateNew: () => void;
}

export default function AgentManager({
  currentAgent,
  onSelectAgent,
  onCreateNew,
}: AgentManagerProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAgents();
  }, [isOpen]);

  const loadAgents = () => {
    const loadedAgents = AgentStorageManager.loadAgents();
    setAgents(loadedAgents);
  };

  const handleSelectAgent = (agent: Agent) => {
    onSelectAgent(agent);
    AgentStorageManager.setActiveAgent(agent.id);
    setIsOpen(false);
    toast.success(`Loaded "${agent.name}"`);
  };

  const handleDuplicate = (agent: Agent) => {
    const duplicated = AgentStorageManager.duplicateAgent(agent);
    AgentStorageManager.saveAgent(duplicated);
    loadAgents();
    toast.success(`Duplicated "${agent.name}"`);
  };

  const handleDelete = (agentId: string) => {
    if (agentId === currentAgent.id) {
      toast.error('Cannot delete active agent');
      return;
    }
    AgentStorageManager.deleteAgent(agentId);
    loadAgents();
    setDeleteTarget(null);
    toast.success('Agent deleted');
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <List className="w-4 h-4" />
            Agents ({agents.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Your Trading Agents</DialogTitle>
            <DialogDescription>
              Manage and switch between your trading agents
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and New */}
            <div className="flex gap-2">
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => {
                  onCreateNew();
                  setIsOpen(false);
                  toast.success('Created new agent');
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                New Agent
              </Button>
            </div>

            {/* Agent List */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredAgents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No agents found' : 'No agents yet'}
                  </div>
                ) : (
                  filteredAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isActive={agent.id === currentAgent.id}
                      onSelect={() => handleSelectAgent(agent)}
                      onDuplicate={() => handleDuplicate(agent)}
                      onDelete={() => setDeleteTarget(agent.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The agent will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function AgentCard({
  agent,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
}: AgentCardProps) {
  const hasErrors = agent.blocks.some((b) => !b.isValid);

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer hover:border-primary/50 transition-all',
        isActive && 'border-primary bg-primary/5'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold truncate">{agent.name}</h4>
            {isActive && (
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {agent.description || 'No description'}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{agent.blocks.length} blocks</span>
            <span>•</span>
            <span>{agent.connections.length} connections</span>
            <span>•</span>
            <span>
              {new Date(agent.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant={agent.isActive ? 'default' : 'secondary'}
              className="text-xs gap-1"
            >
              <Activity className="w-3 h-3" />
              {agent.status}
            </Badge>

            {hasErrors ? (
              <Badge variant="outline" className="text-xs gap-1 text-destructive border-destructive">
                <AlertCircle className="w-3 h-3" />
                Has errors
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs gap-1 text-green-600 border-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Valid
              </Badge>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive"
              disabled={isActive}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
