import { useState, useEffect, useMemo } from "react";
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
import { FacultyStatsCard } from "@/components/admin/FacultyStatsCard";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { CourseCard } from "@/components/CourseCard";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
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
import { ComprehensiveCourseManagement } from "@/components/admin/ComprehensiveCourseManagement";
import { AdminTestPanel } from "@/components/admin/AdminTestPanel";

const Admin = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'overview' | 'courses'>('overview');
  const [facultyFilter, setFacultyFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'vacant' | 'assigned' | 'issues'>('all');
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedVolumeValidation, setSelectedVolumeValidation] = useState("all");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  
  const navigate = useNavigate();
  const { courses, loading, validateHourDistribution, updateCourseStatus, fetchCourses } = useCourses();
  const { toast } = useToast();

  // Mot de passe simple pour l'accès admin
  const ADMIN_PASSWORD = "woluwe1200";

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

  // Get unique faculties and subcategories
  const faculties = useMemo(() => {
    const facultySet = new Set(courses.map(c => c.faculty).filter(Boolean));
    return Array.from(facultySet).sort();
  }, [courses]);

  const subcategories = useMemo(() => {
    const subcategorySet = new Set(courses.map(c => c.subcategory).filter(Boolean));
    return Array.from(subcategorySet).sort();
  }, [courses]);

  // Group courses by faculty
  const coursesByFaculty = useMemo(() => {
    const grouped: { [key: string]: typeof courses } = {};
    courses.forEach(course => {
      const faculty = course.faculty || "Non définie";
      if (!grouped[faculty]) {
        grouped[faculty] = [];
      }
      grouped[faculty].push(course);
    });
    return grouped;
  }, [courses]);

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

  // Activités récentes simulées
  const recentActivities = useMemo(() => [
    { id: 1, action: "Nouvelle proposition reçue", course: "LINFO1101", time: "2 min", type: "proposal" },
    { id: 2, action: "Cours attribué", course: "LMATH1101", time: "15 min", type: "assignment" },
    { id: 3, action: "Demande de modification", course: "LPHYS1101", time: "1h", type: "request" },
    { id: 4, action: "Import d'enseignants", course: "Batch", time: "2h", type: "import" },
  ], []);

  const handleViewCourses = (faculty: string, filter: 'all' | 'vacant' | 'assigned' | 'issues') => {
    setFacultyFilter(faculty);
    setStatusFilter(filter);
    setActiveTab('courses');
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedFaculty("all");
    setSelectedStatus("all");
    setFacultyFilter("");
    setStatusFilter('all');
    setSelectedSchool("all");
    setSelectedVolumeValidation("all");
  };

  const exportToCSV = () => {
    // Logique d'export CSV
    toast({
      title: "Export en cours",
      description: "Le fichier CSV est en cours de génération...",
    });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'refresh':
        fetchCourses();
        toast({
          title: "Actualisation",
          description: "Données mises à jour",
        });
        break;
      case 'import':
        setActiveTab('import');
        break;
      case 'proposals':
        setActiveTab('proposals');
        break;
      case 'settings':
        setActiveTab('settings');
        break;
    }
    setShowQuickActions(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'teachers':
        return <TeacherManagement />;
      case 'import':
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
      case 'courses':
        return renderCoursesTab();
      case 'comprehensive-courses':
        return <ComprehensiveCourseManagement academicYear="2024-2025" />;
      case 'test-panel':
        return <AdminTestPanel />;
      case 'settings':
        return renderSettingsTab();
      default:
        return <AdminDashboard />;
    }
  };

  const renderDashboardTab = () => (
    <div className="space-y-6">
      {/* En-tête du tableau de bord */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord</h2>
          <p className="text-gray-600">Vue d'ensemble de la gestion des cours</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuickActions(!showQuickActions)}
          >
            <Zap className="h-4 w-4 mr-2" />
            Actions rapides
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCourses}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Actions rapides */}
      {showQuickActions && (
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('refresh')}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('import')}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('proposals')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Propositions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('settings')}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Paramètres
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('email-test')}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Test Emails
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cours</p>
                <p className="text-2xl font-bold text-gray-900">{globalStats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cours Vacants</p>
                <p className="text-2xl font-bold text-gray-900">{globalStats.vacant}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attribués</p>
                <p className="text-2xl font-bold text-gray-900">{globalStats.assigned}</p>
                <p className="text-sm text-green-600">{globalStats.completionRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Problèmes</p>
                <p className="text-2xl font-bold text-gray-900">{globalStats.issues}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activités récentes et statistiques par faculté */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activités récentes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activités récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'proposal' ? 'bg-blue-500' :
                    activity.type === 'assignment' ? 'bg-green-500' :
                    activity.type === 'request' ? 'bg-orange-500' : 'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.course} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistiques par faculté */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Statistiques par Faculté</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(coursesByFaculty).map(([faculty, facultyCourses]) => (
              <FacultyStatsCard
                key={faculty}
                faculty={faculty}
                courses={facultyCourses}
                onViewCourses={handleViewCourses}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCoursesTab = () => (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Cours</h2>
          <p className="text-gray-600">Filtrez et gérez les cours</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Effacer filtres
          </Button>
          <Button variant="outline" size="sm" onClick={fetchCourses}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres avancés */}
      <AdminFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedFaculty={selectedFaculty}
        onFacultyChange={setSelectedFaculty}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedSchool={selectedSchool}
        onSchoolChange={setSelectedSchool}
        selectedVolumeValidation={selectedVolumeValidation}
        onVolumeValidationChange={setSelectedVolumeValidation}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onClearFilters={handleClearFilters}
      />

      {/* Affichage des cours */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des cours...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses
            .filter(course => {
              if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return course.title.toLowerCase().includes(term) ||
                       course.code?.toLowerCase().includes(term);
              }
              if (selectedFaculty !== "all") {
                return course.faculty === selectedFaculty;
              }
              if (selectedStatus !== "all") {
                switch (selectedStatus) {
                  case "vacant":
                    return course.vacant;
                  case "assigned":
                            return !course.vacant && course.assignments && course.assignments.length > 0;
      case "pending":
        return !course.vacant && (!course.assignments || course.assignments.length === 0);
                  default:
                    return true;
                }
              }
              return true;
            })
            .map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onStatusUpdate={updateCourseStatus}
                onCourseUpdate={fetchCourses}
                validateHourDistribution={validateHourDistribution}
                isAdmin={true}
              />
            ))}
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
        <p className="text-gray-600">Configuration de l'interface d'administration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations de session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Dernière activité</p>
              <p className="text-sm text-gray-600">{lastActivity.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Statut</p>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Connecté
              </Badge>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Se déconnecter
            </Button>
          </CardContent>
        </Card>

        {/* Statistiques système */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Version</p>
              <p className="text-sm text-gray-600">1.0.0</p>
            </div>
            <div>
              <p className="text-sm font-medium">Environnement</p>
              <p className="text-sm text-gray-600">Développement</p>
            </div>
            <div>
              <p className="text-sm font-medium">Base de données</p>
              <p className="text-sm text-gray-600">Supabase</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

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

  const coursesWithIssues = courses.filter(course => !validateHourDistribution(course).isValid);
  const totalTeachers = new Set(courses.flatMap(c => c.assignments.map(a => a.teacher_id))).size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header principal */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Interface d'Administration
              </h1>
              <p className="text-gray-600">
                Gestion des cours - Année académique 2024-2025
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bell className="h-4 w-4" />
                <span>{globalStats.vacant} cours vacants</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Dernière activité: {lastActivity.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <AdminNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExportCSV={exportToCSV}
        onLogout={handleLogout}
        onGoHome={() => navigate("/")}
        stats={{
          total: globalStats.total,
          vacant: globalStats.vacant,
          assigned: globalStats.assigned,
          issues: globalStats.issues,
          proposals: 0, // À implémenter avec les vraies données
          requests: 0,  // À implémenter avec les vraies données
        }}
      />

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;
