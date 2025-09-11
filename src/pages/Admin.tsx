import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Download, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  Eye, 
  Search,
  Filter,
  RefreshCw,
  Settings,
  Bell,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  FileText,
  Upload,
  UserCheck,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Database,
  HelpCircle,
  Send
} from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileHeader } from "@/components/admin/AdminMobileHeader";
import { PageHeader } from "@/components/admin/PageHeader";
import { TeacherManagement } from "@/components/admin/TeacherManagement";
import { ModificationRequests } from "@/components/admin/ModificationRequests";
import { AssignmentManagement } from "@/components/admin/AssignmentManagement";
import { TeacherImportAndStatus } from "@/components/admin/TeacherImportAndStatus";
import { ProposalManagement } from "@/components/admin/ProposalManagement";
import { CourseProposalManagement } from "@/components/admin/CourseProposalManagement";
import { CourseImportDialog } from "@/components/admin/CourseImportDialog";
import { ProposalReviewPanel } from "@/components/admin/ProposalReviewPanel";
import { DatabaseTestPanel } from "@/components/admin/DatabaseTestPanel";
import { EmailTestPanel } from "@/components/admin/EmailTestPanel";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UnifiedCourseManagement } from "@/components/admin/UnifiedCourseManagement";
import { UnifiedTeacherManagement } from "@/components/admin/UnifiedTeacherManagement";
import { UnifiedToolsPanel } from "@/components/admin/UnifiedToolsPanel";
import { ErrorBoundary, DefaultErrorFallback } from "@/components/ErrorBoundary";
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { AttributionImportPanel } from "@/components/admin/AttributionImportPanel";

const Admin = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const navigate = useNavigate();
  const { courses, loading, validateHourDistribution, updateCourseStatus, fetchCourses } = useCourses();
  const { toast } = useToast();

  // Mot de passe sécurisé via variable d'environnement
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "woluwe1200";

  // Timeout de session automatique (30 min)
  useEffect(() => {
    if (!isAuthenticated) return;
    const timeout = setTimeout(() => {
      handleLogout();
      toast({
        title: "Session expirée",
        description: "Votre session a expiré. Veuillez vous reconnecter.",
        variant: "destructive",
      });
    }, 30 * 60 * 1000); // 30 minutes
    return () => clearTimeout(timeout);
  }, [isAuthenticated, lastActivity]);

  useEffect(() => {
    const authStatus = localStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_authenticated", "true");
      setLastActivity(new Date());
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans l'interface d'administration",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Mot de passe incorrect",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_authenticated");
    navigate("/");
  };

  const resetAuth = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_authenticated");
    setPassword("");
  };



  // Calcul des statistiques globales
  const globalStats = useMemo(() => {
    const total = courses.length;
    const vacant = courses.filter(c => c.vacant).length;
    const assigned = courses.filter(c => !c.vacant && c.assignments && c.assignments.length > 0).length;
    const pending = courses.filter(c => !c.vacant && (!c.assignments || c.assignments.length === 0)).length;
    const issues = courses.filter(c => !validateHourDistribution(c).isValid).length;
    const completionRate = total > 0 ? Math.round((assigned / total) * 100) : 0;

    return {
      total,
      vacant,
      assigned,
      pending,
      issues,
      completionRate
    };
  }, [courses, validateHourDistribution]);





  const exportToCSV = () => {
    // Logique d'export CSV
    toast({
      title: "Export en cours",
      description: "Le fichier CSV est en cours de génération...",
    });
  };



  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'activity':
        return <div className="text-center py-8">
          <p className="text-gray-600">Page des activités récentes en cours de développement</p>
        </div>;
      case 'teachers':
        return <UnifiedTeacherManagement />;
      case 'teacher-import':
        return <TeacherImportAndStatus />;
      case 'proposals':
        return <ProposalManagement />;
      case 'proposal-review':
        return <ProposalReviewPanel />;
      case 'database-test':
        return <DatabaseTestPanel />;
      case 'email-test':
        return <EmailTestPanel />;
      case 'courses-proposals':
        return <CourseProposalManagement />;
      case 'assignments':
        return <AssignmentManagement />;
      case 'requests':
        return <ModificationRequests />;
      case 'courses-management':
        return <UnifiedCourseManagement />;
      case 'tools':
        return <UnifiedToolsPanel />;
      case 'attribution-import':
        return <AttributionImportPanel />;
      case 'settings':
        return <div className="text-center py-8">
          <p className="text-gray-600">Page des paramètres en cours de développement</p>
        </div>;
      case 'help':
        return <div className="text-center py-8">
          <p className="text-gray-600">Page d'aide et support en cours de développement</p>
        </div>;
      default:
        return <AdminDashboard />;
    }
  };



  // Gestion des raccourcis clavier
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault();
          // Focus sur la barre de recherche
          const searchInput = document.querySelector('input[placeholder*="Recherche globale"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
          break;
        case '1':
          e.preventDefault();
          setActiveTab('dashboard');
          break;
        case '2':
          e.preventDefault();
          setActiveTab('courses');
          break;
        case '3':
          e.preventDefault();
          setActiveTab('teachers');
          break;
        case '4':
          e.preventDefault();
          setActiveTab('proposals');
          break;
        case '5':
          e.preventDefault();
          setActiveTab('requests');
          break;
        case '6':
          e.preventDefault();
          setActiveTab('settings');
          break;
      }
    }
    // Raccourci pour ouvrir les notifications
    if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setIsNotificationsOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Gestion de la recherche globale
  const handleGlobalSearch = useCallback((query: string) => {
    setGlobalSearchQuery(query);
    // Si on est sur la gestion des cours, on peut filtrer directement
    if (activeTab === 'courses') {
      // La recherche sera gérée par le composant CentralizedCourseManagement
      // via les props ou un contexte global
    }
    // Pour les autres onglets, on peut implémenter une recherche spécifique
  }, [activeTab]);


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Administration</CardTitle>
            <p className="text-muted-foreground">Accès sécurisé à l'interface d'administration</p>
            <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              💡 Mot de passe : <strong>woluwe1200</strong>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Mot de passe d'administration"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="text-center"
              />
            </div>
            <Button onClick={handleLogin} className="w-full" size="lg">
              <Shield className="h-4 w-4 mr-2" />
              Se connecter
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
            <Button variant="ghost" onClick={resetAuth} className="w-full text-sm text-gray-500">
              <RefreshCw className="h-3 w-3 mr-1" />
              Réinitialiser l'authentification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }



  return (
    <ErrorBoundary fallback={DefaultErrorFallback}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar desktop */}
        <div className="hidden lg:block">
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onExportCSV={exportToCSV}
            onLogout={handleLogout}
            onGoHome={() => navigate("/")}
            onGlobalSearch={handleGlobalSearch}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            stats={{
              total: globalStats.total,
              vacant: globalStats.vacant,
              assigned: globalStats.assigned,
              issues: globalStats.issues,
              proposals: 0,
              requests: 0,
            }}
          />
        </div>
        {/* Contenu principal */}
        <div className="flex-1 flex flex-col">
          {/* Header mobile */}
          <AdminMobileHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onExportCSV={exportToCSV}
            onLogout={handleLogout}
            onGoHome={() => navigate("/")}
            onGlobalSearch={handleGlobalSearch}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            stats={{
              total: globalStats.total,
              vacant: globalStats.vacant,
              assigned: globalStats.assigned,
              issues: globalStats.issues,
              proposals: 0,
              requests: 0,
            }}
          />
          {/* Contenu */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-6">
              <PageHeader activeTab={activeTab} />
              {renderContent()}
            </div>
          </div>
        </div>

        {/* Centre de notifications */}
        <AdminNotifications
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Admin;
