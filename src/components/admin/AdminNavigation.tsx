import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  FileText, 
  UserCheck, 
  BarChart3,
  Download,
  ArrowLeft,
  Upload,
  Settings,
  Database,
  Bell,
  Activity,
  Zap,
  Shield,
  HelpCircle,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";

interface AdminNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExportCSV: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  stats?: {
    total: number;
    vacant: number;
    assigned: number;
    issues: number;
    proposals: number;
    requests: number;
  };
}

export const AdminNavigation = ({ 
  activeTab, 
  onTabChange, 
  onExportCSV, 
  onLogout, 
  onGoHome,
  stats
}: AdminNavigationProps) => {
  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Tableau de bord', 
      icon: BarChart3,
      description: 'Vue centralisée',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: (stats?.proposals || 0) + (stats?.requests || 0)
    },
    { 
      id: 'courses', 
      label: 'Cours', 
      icon: BookOpen,
      description: 'Gestion des cours',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badge: stats?.total
    },
    { 
      id: 'teachers', 
      label: 'Enseignants', 
      icon: Users,
      description: 'Gestion des enseignants',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      id: 'proposals', 
      label: 'Propositions', 
      icon: FileText,
      description: 'Validation des propositions',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      badge: stats?.proposals
    },
    { 
      id: 'assignments', 
      label: 'Attributions', 
      icon: UserCheck,
      description: 'Gestion des attributions',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    { 
      id: 'requests', 
      label: 'Demandes', 
      icon: Activity,
      description: 'Demandes de modification',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      badge: stats?.requests
    },
    { 
      id: 'import', 
      label: 'Import', 
      icon: Upload,
      description: 'Import de données',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: Settings,
      description: 'Configuration',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
  ];

  const getTabStyle = (tab: typeof tabs[0]) => {
    const isActive = activeTab === tab.id;
    return {
      button: `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? `${tab.bgColor} ${tab.color} border-2 border-current shadow-sm` 
          : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
      }`,
      icon: `h-5 w-5 ${isActive ? 'text-current' : 'text-gray-400'}`,
      label: `font-medium ${isActive ? 'text-current' : 'text-gray-700'}`,
      description: `text-xs ${isActive ? 'text-current/70' : 'text-gray-500'}`
    };
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Navigation principale */}
        <div className="flex items-center justify-between py-4">
          {/* Onglets principaux */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const styles = getTabStyle(tab);
              
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  className={styles.button}
                >
                  <Icon className={styles.icon} />
                  <div className="flex flex-col items-start">
                    <span className={styles.label}>{tab.label}</span>
                    <span className={styles.description}>{tab.description}</span>
                  </div>
                  {tab.badge && (
                    <Badge 
                      variant="secondary" 
                      className={`ml-2 ${
                        activeTab === tab.id 
                          ? 'bg-current text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
          
          {/* Actions rapides */}
          <div className="flex items-center space-x-2">
            {/* Indicateurs de statut */}
            {stats && (
              <div className="hidden lg:flex items-center space-x-4 mr-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">{stats.vacant} vacants</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">{stats.assigned} attribués</span>
                </div>
                {stats.issues > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">{stats.issues} problèmes</span>
                  </div>
                )}
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExportCSV}
                className="hidden sm:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onGoHome}
                className="hidden sm:flex"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={onLogout}
              >
                <Shield className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation mobile (version compacte) */}
        <div className="lg:hidden pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {tabs.slice(0, 4).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onTabChange(tab.id)}
                    className="flex-shrink-0"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="ml-1 hidden xs:inline">{tab.label}</span>
                    {tab.badge && (
                      <Badge variant="secondary" className="ml-1">
                        {tab.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange('settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};