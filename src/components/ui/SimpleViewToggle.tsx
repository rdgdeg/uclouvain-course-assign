import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface SimpleViewToggleProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

export const SimpleViewToggle = ({ viewMode, setViewMode }: SimpleViewToggleProps) => {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('grid')}
        className="flex items-center gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        Grille
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('list')}
        className="flex items-center gap-2"
      >
        <List className="h-4 w-4" />
        Liste
      </Button>
    </div>
  );
};