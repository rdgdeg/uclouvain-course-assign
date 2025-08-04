import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";

interface HelpTooltipProps {
  content: string;
  children?: React.ReactNode;
  icon?: "help" | "info";
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const HelpTooltip = ({ 
  content, 
  children, 
  icon = "help",
  side = "top",
  className = ""
}: HelpTooltipProps) => {
  const IconComponent = icon === "help" ? HelpCircle : Info;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <button className={`inline-flex items-center justify-center transition-all-smooth hover-scale ${className}`}>
              <IconComponent className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs animate-fade-in">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};