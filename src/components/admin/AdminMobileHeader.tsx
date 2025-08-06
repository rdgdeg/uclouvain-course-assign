import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Command,
  Download,
  Home,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from './AdminSidebar';

interface AdminMobileHeaderProps {
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

export const AdminMobileHeader: React.FC<AdminMobileHeaderProps> = ({
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

  return (
    <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <AdminSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                onExportCSV={onExportCSV}
                onLogout={onLogout}
                onGoHome={onGoHome}
                onGlobalSearch={onGlobalSearch}
                onOpenNotifications={onOpenNotifications}
                stats={stats}
              />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">ATTRIB Admin</h1>
        </div>
        
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

      {/* Actions rapides */}
      <div className="flex items-center gap-2 mt-3">
        <Button
          onClick={onExportCSV}
          variant="outline"
          size="sm"
          className="flex-1 dark:border-gray-600 dark:text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button
          onClick={onGoHome}
          variant="outline"
          size="sm"
          className="flex-1 dark:border-gray-600 dark:text-white"
        >
          <Home className="h-4 w-4 mr-2" />
          Accueil
        </Button>
        <Button
          onClick={onLogout}
          variant="outline"
          size="sm"
          className="flex-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déco
        </Button>
      </div>
    </div>
  );
}; 