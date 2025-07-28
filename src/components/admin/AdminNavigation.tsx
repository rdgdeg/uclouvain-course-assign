import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  FileText, 
  UserCheck, 
  BarChart3,
  Download,
  ArrowLeft,
  Upload 
} from "lucide-react";

interface AdminNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExportCSV: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export const AdminNavigation = ({ 
  activeTab, 
  onTabChange, 
  onExportCSV, 
  onLogout, 
  onGoHome 
}: AdminNavigationProps) => {
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'teachers', label: 'Enseignants', icon: Users },
    { id: 'import', label: 'Import Excel', icon: Upload },
    { id: 'proposals', label: 'Propositions', icon: FileText },
    { id: 'courses-proposals', label: 'Cours & Attributions', icon: BookOpen },
    { id: 'assignments', label: 'Attributions', icon: UserCheck },
    { id: 'requests', label: 'Demandes', icon: FileText },
  ];

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
            <Button variant="outline" size="sm" onClick={onGoHome}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button variant="destructive" size="sm" onClick={onLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};