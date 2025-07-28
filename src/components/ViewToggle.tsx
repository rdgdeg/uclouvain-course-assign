
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  view: 'cards' | 'list';
  onViewChange: (view: 'cards' | 'list') => void;
}

export const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
      <Button
        variant={view === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className="flex items-center gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        Cartes
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="flex items-center gap-2"
      >
        <List className="h-4 w-4" />
        Liste
      </Button>
    </div>
  );
};
