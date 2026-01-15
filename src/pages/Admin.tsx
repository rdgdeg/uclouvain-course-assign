import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react";
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
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileHeader } from "@/components/admin/AdminMobileHeader";
import { PageHeader } from "@/components/admin/PageHeader";
import { ErrorBoundary, DefaultErrorFallback } from "@/components/ErrorBoundary";
import { AdminNotifications } from '@/components/admin/AdminNotifications';

// Lazy-load des composants admin lourds
const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const CentralizedCourseManagement = lazy(() => import("@/components/admin/CentralizedCourseManagement").then(m => ({ default: m.CentralizedCourseManagement })));
const UnifiedTeacherManagement = lazy(() => import("@/components/admin/UnifiedTeacherManagement").then(m => ({ default: m.UnifiedTeacherManagement })));
const UnifiedToolsPanel = lazy(() => import("@/components/admin/UnifiedToolsPanel").then(m => ({ default: m.UnifiedToolsPanel })));
const TeacherImportAndStatus = lazy(() => import("@/components/admin/TeacherImportAndStatus").then(m => ({ default: m.TeacherImportAndStatus })));
const ProposalManagement = lazy(() => import("@/components/admin/ProposalManagement").then(m => ({ default: m.ProposalManagement })));
const CourseProposalManagement = lazy(() => import("@/components/admin/CourseProposalManagement").then(m => ({ default: m.CourseProposalManagement })));
const ProposalReviewPanel = lazy(() => import("@/components/admin/ProposalReviewPanel").then(m => ({ default: m.ProposalReviewPanel })));
const AssignmentManagement = lazy(() => import("@/components/admin/AssignmentManagement").then(m => ({ default: m.AssignmentManagement })));
const ModificationRequests = lazy(() => import("@/components/admin/ModificationRequests").then(m => ({ default: m.ModificationRequests })));
const AttributionImportPanel = lazy(() => import("@/components/admin/AttributionImportPanel").then(m => ({ default: m.AttributionImportPanel })));
const ImportedCoursesPanel = lazy(() => import("@/components/admin/ImportedCoursesPanel").then(m => ({ default: m.ImportedCoursesPanel })));
const DatabaseTestPanel = lazy(() => import("@/components/admin/DatabaseTestPanel").then(m => ({ default: m.DatabaseTestPanel })));
const EmailTestPanel = lazy(() => import("@/components/admin/EmailTestPanel").then(m => ({ default: m.EmailTestPanel })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="lg" text="Chargement..." />
  </div>
);

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
        return <React.Suspense fallback={<LoadingFallback />}><AdminDashboard /></React.Suspense>;
      case 'activity':
        return <div className="text-center py-8">
          <p className="text-gray-600">Page des activités récentes en cours de développement</p>
        </div>;
      case 'teachers':
        return <React.Suspense fallback={<LoadingFallback />}><UnifiedTeacherManagement /></React.Suspense>;
      case 'teacher-import':
        return <React.Suspense fallback={<LoadingFallback />}><TeacherImportAndStatus /></React.Suspense>;
      case 'proposals':
        return <React.Suspense fallback={<LoadingFallback />}><ProposalManagement /></React.Suspense>;
      case 'proposal-review':
        return <React.Suspense fallback={<LoadingFallback />}><ProposalReviewPanel /></React.Suspense>;
      case 'database-test':
        return <React.Suspense fallback={<LoadingFallback />}><DatabaseTestPanel /></React.Suspense>;
      case 'email-test':
        return <React.Suspense fallback={<LoadingFallback />}><EmailTestPanel /></React.Suspense>;
      case 'courses-proposals':
        return <React.Suspense fallback={<LoadingFallback />}><CourseProposalManagement /></React.Suspense>;
      case 'assignments':
        return <React.Suspense fallback={<LoadingFallback />}><AssignmentManagement /></React.Suspense>;
      case 'requests':
        return <React.Suspense fallback={<LoadingFallback />}><ModificationRequests /></React.Suspense>;
      case 'courses':
      case 'courses-management':
        return <React.Suspense fallback={<LoadingFallback />}><CentralizedCourseManagement /></React.Suspense>;
      case 'tools':
        return <React.Suspense fallback={<LoadingFallback />}><UnifiedToolsPanel /></React.Suspense>;
      case 'attribution-import':
        return <React.Suspense fallback={<LoadingFallback />}><AttributionImportPanel /></React.Suspense>;
      case 'imported-courses':
        return <React.Suspense fallback={<LoadingFallback />}><ImportedCoursesPanel /></React.Suspense>;
      case 'settings':
        return <div className="text-center py-8">
          <p className="text-gray-600">Page des paramètres en cours de développement</p>
        </div>;
      case 'help':
        return <div className="text-center py-8">
          <p className="text-gray-600">Page d'aide et support en cours de développement</p>
        </div>;
      default:
        return <React.Suspense fallback={<LoadingFallback />}><AdminDashboard /></React.Suspense>;
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
