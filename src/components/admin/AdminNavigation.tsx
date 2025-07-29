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
  XCircle,
  TestTube,
  Grid3X3,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw
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
  // Navigation optimisée - 6 onglets principaux au lieu de 12
  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Vue d\'ensemble', 
      icon: BarChart3,
      description: 'Tableau de bord central',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: (stats?.proposals || 0) + (stats?.requests || 0),
      priority: 1
    },
    { 
      id: 'courses-management', 
      label: 'Gestion Cours', 
      icon: BookOpen,
      description: 'Cours + Attributions + Import',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badge: stats?.total,
      priority: 1
    },
    { 
      id: 'proposals', 
      label: 'Propositions', 
      icon: FileText,
      description: 'Validation des équipes',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      badge: stats?.proposals,
      priority: 1
    },
    { 
      id: 'requests', 
      label: 'Demandes', 
      icon: Activity,
      description: 'Modifications en attente',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      badge: stats?.requests,
      priority: 1
    },
    { 
      id: 'teachers', 
      label: 'Enseignants', 
      icon: Users,
      description: 'Gestion + Import',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      priority: 2
    },
    { 
      id: 'tools', 
      label: 'Outils', 
      icon: Settings,
      description: 'Tests + Configuration',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      priority: 3
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

  // Actions rapides contextuelles
  const getQuickActions = () => {
    switch (activeTab) {
      case 'dashboard':
        return [
          { label: 'Actualiser', icon: RefreshCw, action: () => window.location.reload() },
          { label: 'Exporter', icon: Download, action: onExportCSV },
        ];
      case 'courses-management':
        return [
          { label: 'Import CSV', icon: Upload, action: () => onTabChange('courses-management') },
          { label: 'Nouveau cours', icon: Plus, action: () => onTabChange('courses-management') },
          { label: 'Exporter', icon: Download, action: onExportCSV },
        ];
      case 'proposals':
        return [
          { label: 'Toutes', icon: Eye, action: () => onTabChange('proposals') },
          { label: 'En attente', icon: Clock, action: () => onTabChange('proposals') },
        ];
      case 'requests':
        return [
          { label: 'Toutes', icon: Eye, action: () => onTabChange('requests') },
          { label: 'En attente', icon: Clock, action: () => onTabChange('requests') },
        ];
      case 'teachers':
        return [
          { label: 'Import', icon: Upload, action: () => onTabChange('teachers') },
          { label: 'Nouveau', icon: Plus, action: () => onTabChange('teachers') },
        ];
      default:
        return [
          { label: 'Actualiser', icon: RefreshCw, action: () => window.location.reload() },
        ];
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Navigation principale optimisée */}
        <div className="flex items-center justify-between py-4">
          {/* Onglets principaux - réduits à 6 */}
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
          
          {/* Actions rapides contextuelles */}
          <div className="flex items-center space-x-2">
            {/* Indicateurs de statut compacts */}
            {stats && (
              <div className="hidden lg:flex items-center space-x-3 mr-4">
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">{stats.vacant}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">{stats.assigned}</span>
                </div>
                {stats.issues > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">{stats.issues}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions rapides contextuelles */}
            <div className="flex items-center space-x-1">
              {getQuickActions().map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="hidden sm:flex"
                >
                  <action.icon className="h-4 w-4 mr-1" />
                  {action.label}
                </Button>
              ))}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onGoHome}
                className="hidden sm:flex"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Accueil
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

        {/* Navigation mobile optimisée */}
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
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange('tools')}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
              >
                <Shield className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};