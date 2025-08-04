import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "vacant" | "assigned" | "pending" | "error";
  animated?: boolean;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge = ({ 
  status, 
  animated = false, 
  className = "",
  showIcon = true 
}: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "vacant":
        return {
          label: "Vacant",
          icon: UserX,
          className: "bg-red-500 text-white hover:bg-red-600"
        };
      case "assigned":
        return {
          label: "Attribué", 
          icon: UserCheck,
          className: "bg-green-500 text-white hover:bg-green-600"
        };
      case "pending":
        return {
          label: "En attente",
          icon: Clock,
          className: "bg-orange-500 text-white hover:bg-orange-600"
        };
      case "error":
        return {
          label: "Erreur",
          icon: AlertTriangle,
          className: "bg-destructive text-destructive-foreground"
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      className={cn(
        "transition-all-smooth",
        config.className,
        animated && "badge-bounce",
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
};