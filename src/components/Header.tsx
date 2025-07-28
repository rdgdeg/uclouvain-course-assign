import { Button } from "@/components/ui/button";
import { Settings, FileUp, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onAdminClick?: () => void;
  showAdminButton?: boolean;
}

export const Header = ({ onAdminClick, showAdminButton = true }: HeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <h1 className="text-2xl font-bold text-primary">UCLouvain</h1>
          <p className="text-sm text-muted-foreground">Gestion des cours</p>
        </div>
        {showAdminButton && (
          <Button variant="outline" onClick={onAdminClick || (() => navigate("/admin"))}>
            <Settings className="h-4 w-4 mr-2" />
            Administration
          </Button>
        )}
      </div>
    </header>
  );
};