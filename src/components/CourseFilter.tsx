
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CourseFilterProps {
  showOnlyVacant: boolean;
  onToggle: (showOnlyVacant: boolean) => void;
  vacantCount: number;
  totalCount: number;
  isAdmin?: boolean;
}

export const CourseFilter = ({ 
  showOnlyVacant, 
  onToggle, 
  vacantCount, 
  totalCount,
  isAdmin = false 
}: CourseFilterProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Affichage :</span>
        <div className="flex items-center gap-2 bg-background rounded-lg p-1">
          <Button
            variant={showOnlyVacant ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToggle(true)}
            className="flex items-center gap-2"
          >
            Cours vacants
            <Badge variant="secondary" className="ml-1">
              {vacantCount}
            </Badge>
          </Button>
          <Button
            variant={!showOnlyVacant ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToggle(false)}
            className="flex items-center gap-2"
          >
            Tous les cours
            <Badge variant="secondary" className="ml-1">
              {totalCount}
            </Badge>
          </Button>
        </div>
      </div>
      
      {isAdmin && showOnlyVacant && (
        <div className="text-sm text-muted-foreground">
          Mode administrateur : vous pouvez marquer les cours comme vacants ou non vacants
        </div>
      )}
    </div>
  );
};
