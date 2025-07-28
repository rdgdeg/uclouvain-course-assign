import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Users, BookOpen, AlertTriangle, Eye } from "lucide-react";
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

const Admin = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'overview' | 'courses'>('overview');
  const [facultyFilter, setFacultyFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'vacant' | 'assigned' | 'issues'>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedVolumeValidation, setSelectedVolumeValidation] = useState("all");
  
  const navigate = useNavigate();
  const { courses, loading, validateHourDistribution, updateCourseStatus, fetchCourses } = useCourses();
  const { toast } = useToast();

  // Mot de passe simple pour l'accès admin
  const ADMIN_PASSWORD = "admin2025";

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

  const filteredCourses = useMemo(() => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(term) ||
        course.code?.toLowerCase().includes(term) ||
        course.assignments.some(a => 
          `${a.teacher.first_name} ${a.teacher.last_name}`.toLowerCase().includes(term)
        )
      );
    }

    // Faculty filter
    if (selectedFaculty !== "all") {
      filtered = filtered.filter(course => course.faculty === selectedFaculty);
    }

    if (facultyFilter) {
      filtered = filtered.filter(course => course.faculty === facultyFilter);
    }

    // Status filter
    if (selectedStatus !== "all" || statusFilter !== 'all') {
      const status = selectedStatus !== "all" ? selectedStatus : statusFilter;
      filtered = filtered.filter(course => {
        switch (status) {
          case "vacant":
            return course.vacant;
          case "assigned":
            return !course.vacant && course.assignments.length > 0;
          case "pending":
            return !course.vacant && course.assignments.length === 0;
          case "issues":
            return !validateHourDistribution(course).isValid;
          default:
            return true;
        }
      });
    }

    // Subcategory filter
    if (selectedSubcategory !== "all") {
      filtered = filtered.filter(course => course.subcategory === selectedSubcategory);
    }

    // Volume validation filter
    if (selectedVolumeValidation !== "all") {
      filtered = filtered.filter(course => {
        const validation = validateHourDistribution(course);
        return selectedVolumeValidation === "valid" ? validation.isValid : !validation.isValid;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "code":
          aValue = a.code || "";
          bValue = b.code || "";
          break;
        case "faculty":
          aValue = a.faculty || "";
          bValue = b.faculty || "";
          break;
        case "subcategory":
          aValue = a.subcategory || "";
          bValue = b.subcategory || "";
          break;
        case "status":
          aValue = a.vacant ? "vacant" : (a.assignments.length > 0 ? "assigned" : "pending");
          bValue = b.vacant ? "vacant" : (b.assignments.length > 0 ? "assigned" : "pending");
          break;
        case "start_date":
          aValue = a.start_date || "";
          bValue = b.start_date || "";
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [courses, searchTerm, selectedFaculty, selectedStatus, selectedSubcategory, selectedVolumeValidation, facultyFilter, statusFilter, sortBy, sortOrder, validateHourDistribution]);

  const handleViewCourses = (faculty: string, filter: 'all' | 'vacant' | 'assigned' | 'issues') => {
    setFacultyFilter(faculty === "Non définie" ? "" : faculty);
    setStatusFilter(filter);
    setActiveTab('courses');
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedFaculty("all");
    setSelectedStatus("all");
    setSelectedSubcategory("all");
    setSelectedVolumeValidation("all");
    setFacultyFilter("");
    setStatusFilter('all');
  };

  const exportToCSV = () => {
    const headers = [
      "ID", "Titre", "Code", "Faculté", "Sous-catégorie", "Statut", 
      "Date début", "Durée (sem)", "Vol.1 (h)", "Vol.2 (h)", 
      "Nb enseignants", "Volume valide"
    ];
    
    const rows = filteredCourses.map(course => {
      const validation = validateHourDistribution(course);
      return [
        course.id,
        course.title,
        course.code || "",
        course.faculty || "",
        course.subcategory || "",
        course.vacant ? "Vacant" : "Attribué",
        course.start_date || "",
        course.duration_weeks || 0,
        course.volume_total_vol1,
        course.volume_total_vol2,
        course.assignments.length,
        validation.isValid ? "Oui" : "Non"
      ];
    });

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(",")
    ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `cours_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Accès Administration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Se connecter
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const coursesWithIssues = courses.filter(course => !validateHourDistribution(course).isValid);
  const totalTeachers = new Set(courses.flatMap(c => c.assignments.map(a => a.teacher_id))).size;

  const renderContent = () => {
    switch (activeTab) {
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
      case 'courses-proposals':
        return <CourseProposalManagement />;
      case 'assignments':
        return <AssignmentManagement />;
      case 'requests':
        return <ModificationRequests />;
      case 'courses':
        return renderCoursesTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Global statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-sm text-muted-foreground">Total cours</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{totalTeachers}</p>
              <p className="text-sm text-muted-foreground">Enseignants uniques</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-orange-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{coursesWithIssues.length}</p>
              <p className="text-sm text-muted-foreground">Problèmes de volume</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {Math.round((courses.filter(c => !c.vacant).length / courses.length) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Taux d'attribution</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faculty cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Vue par Faculté</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <div className="mb-4">
        <CourseImportDialog />
      </div>
    </div>
  );

  const renderCoursesTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <AdminFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedFaculty={selectedFaculty}
        onFacultyChange={setSelectedFaculty}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedSubcategory={selectedSubcategory}
        onSubcategoryChange={setSelectedSubcategory}
        selectedVolumeValidation={selectedVolumeValidation}
        onVolumeValidationChange={setSelectedVolumeValidation}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        faculties={faculties}
        subcategories={subcategories}
        onClearFilters={handleClearFilters}
      />

      {/* Results summary */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {filteredCourses.length} cours trouvé{filteredCourses.length > 1 ? 's' : ''}
          {facultyFilter && ` dans la faculté ${facultyFilter}`}
        </p>
        {(facultyFilter || statusFilter !== 'all') && (
          <Button variant="outline" size="sm" onClick={() => setActiveTab('overview')}>
            <Eye className="h-4 w-4 mr-2" />
            Retour à la vue d'ensemble
          </Button>
        )}
      </div>

      {/* Course cards */}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Interface d'Administration
            </h1>
            <p className="text-muted-foreground">
              Vue d'ensemble et gestion des cours - Année académique 2024-2025
            </p>
          </div>
        </div>

        {/* Navigation */}
        <AdminNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onExportCSV={exportToCSV}
          onLogout={handleLogout}
          onGoHome={() => navigate("/")}
        />

        {/* Content */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
