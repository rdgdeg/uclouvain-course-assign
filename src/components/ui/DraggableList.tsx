import React, { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DraggableItem {
  id: string;
  content: React.ReactNode;
  data?: any;
}

interface DraggableListProps {
  items: DraggableItem[];
  onReorder: (items: DraggableItem[]) => void;
  onRemove?: (id: string) => void;
  className?: string;
  disabled?: boolean;
}

export const DraggableList: React.FC<DraggableListProps> = ({
  items,
  onReorder,
  onRemove,
  className,
  disabled = false,
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || disabled) return;

    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    onReorder(reorderedItems);
  };

  if (items.length === 0) {
    return (
      <div className={`text-center py-8 text-muted-foreground ${className}`}>
        Aucun élément à afficher
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="draggable-list" isDropDisabled={disabled}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-2 ${className}`}
          >
            {items.map((item, index) => (
              <Draggable
                key={item.id}
                draggableId={item.id}
                index={index}
                isDragDisabled={disabled}
              >
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`transition-all duration-200 ${
                      snapshot.isDragging ? "shadow-lg rotate-2" : ""
                    } ${disabled ? "opacity-50" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1">
                          {item.content}
                        </div>
                        
                        {onRemove && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(item.id)}
                            disabled={disabled}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}; 