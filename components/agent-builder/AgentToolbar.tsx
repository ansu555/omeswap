'use client';

import React from 'react';
import { Agent } from '@/types/agent-builder';
import { AgentValidator } from '@/lib/agent-builder/storage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Play,
  Pause,
  RotateCcw,
  Save,
  Download,
  Upload,
  Settings,
  CheckCircle2,
  AlertCircle,
  Activity,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';

interface AgentToolbarProps {
  agent: Agent;
  onAgentUpdate: (updates: Partial<Agent>) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function AgentToolbar({
  agent,
  onAgentUpdate,
  onSave,
  onReset,
}: AgentToolbarProps) {
  const [showResetDialog, setShowResetDialog] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(false);

  const handleToggleActive = () => {
    if (!agent.isActive) {
      // Validate before activating
      const validation = AgentValidator.validate(agent);
      if (!validation.isValid) {
        toast.error('Cannot activate agent', {
          description: validation.errors[0],
        });
        return;
      }
    }

    onAgentUpdate({
      isActive: !agent.isActive,
      status: !agent.isActive ? 'active' : 'paused',
    });

    toast.success(
      agent.isActive ? 'Agent paused' : 'Agent activated',
      {
        description: agent.isActive
          ? 'Your agent has been paused'
          : 'Your agent is now running',
      }
    );
  };

  const handleValidate = () => {
    setIsValidating(true);
    
    setTimeout(() => {
      const validation = AgentValidator.validate(agent);
      
      if (validation.isValid) {
        toast.success('Validation passed!', {
          description: 'Your agent is ready to run',
        });
      } else {
        toast.error('Validation failed', {
          description: validation.errors.join(', '),
        });
      }

      if (validation.warnings.length > 0) {
        toast.warning('Warnings found', {
          description: validation.warnings.join(', '),
        });
      }

      setIsValidating(false);
    }, 500);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(agent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${agent.name.replace(/\s+/g, '_')}_agent.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Agent exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          // Basic validation
          if (imported.blocks && imported.connections) {
            onAgentUpdate({
              blocks: imported.blocks,
              connections: imported.connections,
            });
            toast.success('Agent imported successfully');
          } else {
            toast.error('Invalid agent file');
          }
        } catch (error) {
          toast.error('Failed to import agent');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    setShowResetDialog(false);
    onReset();
    toast.success('Agent reset');
  };

  const validation = AgentValidator.validate(agent);

  return (
    <>
      <Card className="flex items-center justify-between p-3 border-b rounded-none">
        {/* Agent Info */}
        <div className="flex items-center gap-4 flex-1">
          <Input
            value={agent.name}
            onChange={(e) => onAgentUpdate({ name: e.target.value })}
            className="max-w-xs font-semibold"
            placeholder="Agent name"
          />

          <div className="flex items-center gap-2">
            <Badge
              variant={agent.isActive ? 'default' : 'secondary'}
              className="gap-1"
            >
              <Activity className="w-3 h-3" />
              {agent.status}
            </Badge>

            {validation.isValid ? (
              <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Valid
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-destructive border-destructive">
                <AlertCircle className="w-3 h-3" />
                {validation.errors.length} error(s)
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant={agent.isActive ? 'destructive' : 'default'}
            size="sm"
            onClick={handleToggleActive}
            className="gap-2"
          >
            {agent.isActive ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Activate
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={isValidating}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Validate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export Agent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImport}>
                <Upload className="w-4 h-4 mr-2" />
                Import Agent
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowResetDialog(true)}
                className="text-destructive"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all blocks and connections. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
