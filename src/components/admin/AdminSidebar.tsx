import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Home, 
  Download,
  Search,
  Bell,
  Sun,
  Moon,
  Command,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExportCSV: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  onGlobalSearch?: (query: string) => void;
  onOpenNotifications?: () => void;
  stats: {
    total: number;
    vacant: number;
    assigned: number;
    issues: number;
    proposals: number;
    requests: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  onExportCSV,
  onLogout,
  onGoHome,
  onGlobalSearch,
  onOpenNotifications,
  stats
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onGlobalSearch) {
      onGlobalSearch(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    toast({
      title: "Mode sombre",
      description: isDarkMode ? "Mode clair activé" : "Mode sombre activé",
    });
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: BookOpen,
      description: 'Vue d\'ensemble'
    },
    {
      id: 'courses',
      label: 'Gestion des cours',
      icon: FileText,
      description: 'Cours et attributions',
      badge: stats.total
    },
    {
      id: 'teachers',
      label: 'Gestion enseignants',
      icon: Users,
      description: 'Enseignants et statuts'
    },
    {
      id: 'proposals',
      label: 'Propositions',
      icon: FileText,
      description: 'Candidatures et demandes',
      badge: stats.proposals
    },
    {
      id: 'requests',
      label: 'Demandes modification',
      icon: FileText,
      description: 'Modifications en attente',
      badge: stats.requests
    },
    {
      id: 'attribution-import',
      label: 'Import Attributions',
      icon: Upload,
      description: 'Import fichier Excel'
    },
    {
      id: 'imported-courses',
      label: 'Cours importés',
      icon: BookOpen,
      description: 'Liste des cours importés',
      badge: stats.total
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      description: 'Configuration système'
    }
  ];

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">ATTRIB Admin</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="h-8 w-8 p-0"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenNotifications}
              className="h-8 w-8 p-0 relative"
            >
              <Bell className="h-4 w-4" />
              {stats.requests > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                  {stats.requests}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Barre de recherche globale */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Recherche globale (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-4 h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
              activeTab === item.id
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
              </div>
            </div>
            {item.badge && (
              <Badge variant="secondary" className="ml-2">
                {item.badge}
              </Badge>
            )}
          </button>
        ))}
      </nav>

      {/* Statistiques rapides */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Statistiques rapides</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Total cours</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.vacant}</div>
            <div className="text-xs text-orange-600 dark:text-orange-400">Cours vacants</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.assigned}</div>
            <div className="text-xs text-green-600 dark:text-green-400">Assignés</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.issues}</div>
            <div className="text-xs text-red-600 dark:text-red-400">Problèmes</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Button
          onClick={onExportCSV}
          variant="outline"
          className="w-full justify-start dark:border-gray-600 dark:text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
        <Button
          onClick={onGoHome}
          variant="outline"
          className="w-full justify-start dark:border-gray-600 dark:text-white"
        >
          <Home className="h-4 w-4 mr-2" />
          Retour accueil
        </Button>
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}; 