'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { AgentBlock } from '@/types/agent-builder';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Settings, Trash2 } from 'lucide-react';

interface BlockNodeData extends AgentBlock {
  onUpdate: (id: string, updates: Partial<AgentBlock>) => void;
  onDelete: (id: string) => void;
}

const AgentBlockNode = memo(({ data, selected }: NodeProps<BlockNodeData>) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Get the icon component dynamically
  const IconComponent = (Icons as any)[data.icon] || Icons.Box;

  const handleParameterChange = (paramId: string, value: any) => {
    const updatedParams = data.parameters.map(param =>
      param.id === paramId ? { ...param, value } : param
    );
    data.onUpdate(data.id, { parameters: updatedParams });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onDelete(data.id);
  };

  const getHandleColor = () => {
    switch (data.type) {
      case 'trigger': return '#10b981';
      case 'condition': return '#f59e0b';
      case 'action': return '#3b82f6';
      case 'strategy': return '#8b5cf6';
      case 'indicator': return '#ec4899';
      default: return '#6366f1';
    }
  };

  return (
    <Card
      className={cn(
        'min-w-[220px] max-w-[280px] transition-all duration-200',
        'border-2 shadow-lg hover:shadow-xl',
        selected ? 'ring-2 ring-primary ring-offset-2' : '',
        !data.isValid && 'border-destructive'
      )}
      style={{
        borderColor: selected ? data.color : undefined,
        backgroundColor: 'hsl(var(--card))',
      }}
    >
      {/* Input Handle */}
      {data.type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !border-2"
          style={{ background: getHandleColor() }}
        />
      )}

      {/* Block Header */}
      <div
        className="flex items-center gap-2 p-3 rounded-t-lg"
        style={{ backgroundColor: `${data.color}15` }}
      >
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: data.color }}
        >
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{data.label}</div>
          <Badge variant="outline" className="text-xs mt-0.5">
            {data.type}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Popover open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={(e) => e.stopPropagation()}
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 max-h-[400px] overflow-y-auto"
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{data.label}</h4>
                  <p className="text-sm text-muted-foreground">{data.description}</p>
                </div>

                {data.parameters.map((param) => (
                  <div key={param.id} className="space-y-2">
                    <Label className="text-xs">
                      {param.name}
                      {param.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    
                    {param.type === 'select' ? (
                      <Select
                        value={param.value}
                        onValueChange={(value) => handleParameterChange(param.id, value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={param.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {param.options?.map((option) => (
                            <SelectItem key={option} value={option} className="text-xs">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : param.type === 'boolean' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={param.value}
                          onChange={(e) => handleParameterChange(param.id, e.target.checked)}
                          className="rounded"
                        />
                      </div>
                    ) : param.type === 'number' || param.type === 'percentage' ? (
                      <Input
                        type="number"
                        value={param.value}
                        onChange={(e) => handleParameterChange(param.id, parseFloat(e.target.value) || 0)}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        placeholder={param.placeholder}
                        className="h-8 text-xs"
                      />
                    ) : (
                      <Input
                        type="text"
                        value={param.value}
                        onChange={(e) => handleParameterChange(param.id, e.target.value)}
                        placeholder={param.placeholder}
                        className="h-8 text-xs"
                      />
                    )}
                    
                    {param.description && (
                      <p className="text-xs text-muted-foreground">{param.description}</p>
                    )}
                  </div>
                ))}

                {data.errors.length > 0 && (
                  <div className="p-2 bg-destructive/10 rounded-md">
                    <p className="text-xs font-semibold text-destructive mb-1">Errors:</p>
                    {data.errors.map((error, i) => (
                      <p key={i} className="text-xs text-destructive">• {error}</p>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Block Body */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {data.description}
        </p>
        
        {data.parameters.length > 0 && (
          <div className="space-y-1">
            {data.parameters.slice(0, 2).map((param) => (
              <div key={param.id} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{param.name}:</span>
                <span className="font-medium truncate ml-2 max-w-[120px]">
                  {param.value || '-'}
                </span>
              </div>
            ))}
            {data.parameters.length > 2 && (
              <p className="text-xs text-muted-foreground italic">
                +{data.parameters.length - 2} more
              </p>
            )}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2"
        style={{ background: getHandleColor() }}
      />

      {/* Condition handles for branching */}
      {data.type === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="!w-3 !h-3 !border-2 !top-1/2"
            style={{ background: '#10b981' }}
          />
          <Handle
            type="source"
            position={Position.Left}
            id="false"
            className="!w-3 !h-3 !border-2 !top-1/2"
            style={{ background: '#ef4444' }}
          />
        </>
      )}
    </Card>
  );
});

AgentBlockNode.displayName = 'AgentBlockNode';

export default AgentBlockNode;
