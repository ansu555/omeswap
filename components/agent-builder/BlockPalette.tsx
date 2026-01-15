'use client';

import React, { useState } from 'react';
import { BLOCK_TEMPLATES, BLOCK_CATEGORIES } from '@/lib/agent-builder/block-templates';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import * as Icons from 'lucide-react';
import { Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockPaletteProps {
  onToggleCollapse?: () => void;
}

export default function BlockPalette({ onToggleCollapse }: BlockPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredBlocks = BLOCK_TEMPLATES.filter(block => {
    const matchesSearch = block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         block.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || block.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (event: React.DragEvent, template: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="h-full flex flex-col border-r">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Block Library</h3>
          {onToggleCollapse && (
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
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <div className="border-b px-2">
          <ScrollArea className="w-full">
            <TabsList className="w-full justify-start h-auto p-2 bg-transparent">
              {BLOCK_CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-xs px-3 py-1.5"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        {BLOCK_CATEGORIES.map((category) => (
          <TabsContent key={category} value={category} className="flex-1 m-0 mt-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-2">
                {filteredBlocks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No blocks found
                  </div>
                ) : (
                  filteredBlocks.map((template) => (
                    <BlockPaletteItem
                      key={`${template.type}-${template.subType}`}
                      template={template}
                      onDragStart={handleDragStart}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}

interface BlockPaletteItemProps {
  template: any;
  onDragStart: (event: React.DragEvent, template: any) => void;
}

function BlockPaletteItem({ template, onDragStart }: BlockPaletteItemProps) {
  const IconComponent = (Icons as any)[template.icon] || Icons.Box;

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, template)}
      className={cn(
        'p-3 cursor-grab active:cursor-grabbing',
        'hover:shadow-md transition-all duration-200',
        'hover:scale-[1.02] border-l-4'
      )}
      style={{ borderLeftColor: template.color }}
    >
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg shrink-0"
          style={{ backgroundColor: `${template.color}20` }}
        >
          <IconComponent
            className="w-4 h-4"
            style={{ color: template.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{template.label}</span>
            <Badge variant="secondary" className="text-xs shrink-0">
              {template.type}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
