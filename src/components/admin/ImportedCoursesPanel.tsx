import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Mail,
  Calendar,
  GraduationCap,
  Plus,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2
} from "lucide-react";
import { useCourseAttributions } from "@/hooks/useCourseAttributions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ImportedCoursesPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();
  
  const {
    courses,
    loading,
    error,
    getStats,
    fetchCourses
  } = useCourseAttributions();

  const stats = getStats();

  // Filtrer les cours selon les critères
  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return courses.filter(course => {
      const matchesSearch = 
        course.title.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        (course.coordinator_name && course.coordinator_name.toLowerCase().includes(query));
      
      const matchesStatus = statusFilter === 'all' || course.validation_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchQuery, statusFilter]);

  // Aplatir : une ligne par attribution (ou une ligne "Non attribué" si aucune attribution)
  const flattenedAttributions = useMemo(() => {
    const rows: Array<{
      courseId: number;
      courseCode: string;
      courseTitle: string;
      faculty: string;
      vol1Total: number;
      vol2Total: number;
      teacherName: string;
      teacherEmail: string;
      vol1Hours: number;
      vol2Hours: number;
    }> = [];

    filteredCourses.forEach(course => {
      if (!course.attributions || course.attributions.length === 0) {
        rows.push({
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          faculty: course.faculty,
          vol1Total: course.vol1_total || 0,
          vol2Total: course.vol2_total || 0,
          teacherName: "Non attribué",
          teacherEmail: "",
          vol1Hours: 0,
          vol2Hours: 0,
        });
      } else {
        course.attributions.forEach(attr => {
          rows.push({
            courseId: course.id,
            courseCode: course.code,
            courseTitle: course.title,
            faculty: attr.faculty || course.faculty,
            vol1Total: course.vol1_total || 0,
            vol2Total: course.vol2_total || 0,
            teacherName: attr.teacher_name || "Non attribué",
            teacherEmail: attr.teacher_email,
            vol1Hours: attr.vol1_hours,
            vol2Hours: attr.vol2_hours,
          });
        });
      }
    });

    return rows;
  }, [filteredCourses]);

  // Pagination sur les lignes aplaties
  const totalPages = Math.max(1, Math.ceil(flattenedAttributions.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = flattenedAttributions.slice(startIndex, startIndex + itemsPerPage);

  // Fonctions pour gérer l'expansion des cours
  const toggleCourseExpansion = (courseId: number) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const expandAll = () => {
    // plus utilisé dans la vue tableau compacte, conservé pour compatibilité éventuelle
    setExpandedCourses(new Set());
  };

  const collapseAll = () => {
    setExpandedCourses(new Set());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs_correction': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated': return 'Validé';
      case 'needs_correction': return 'À corriger';
      case 'rejected': return 'Rejeté';
      default: return 'En attente';
    }
  };

  const clearAllData = async () => {
    try {
      // Confirmation
      if (!confirm("Êtes-vous sûr de vouloir effacer toutes les données importées ? Cette action est irréversible.")) {
        return;
      }

      // Supprimer dans l'ordre pour respecter les contraintes
      await supabase.from('hour_attributions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('course_coordinators').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('assignment_proposals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('coordinator_validations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('course_assignments').delete().neq('id', 0);
      await supabase.from('courses').delete().neq('id', 0);
      await supabase.from('teachers').delete().neq('id', 0);

      toast({
        title: "Données effacées",
        description: "Toutes les données ont été supprimées avec succès",
      });

      await fetchCourses();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'effacer les données",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Chargement des cours importés..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Cours Importés</h1>
        <p className="text-muted-foreground">
          Gestion et vérification des cours et attributions importés - Interface d'administration
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Cours total</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Validés</p>
                <p className="text-3xl font-bold text-green-600">{stats.validatedCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingValidations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Anomalies</p>
                <p className="text-3xl font-bold text-red-600">{stats.underAttributed + stats.overAttributed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions d'administration */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <GraduationCap className="h-5 w-5" />
            Actions d'administration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={fetchCourses} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser les données
            </Button>
            <Button onClick={clearAllData} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Effacer toutes les données
            </Button>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            ⚠️ Note : Les attributions détaillées par enseignant ne sont pas encore importées. 
            Utilisez l'import d'attributions pour compléter les données.
          </p>
        </CardContent>
      </Card>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par cours, code ou coordinateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="validated">Validés</SelectItem>
                <SelectItem value="needs_correction">À corriger</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Résumé pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {flattenedAttributions.length} lignes d'attribution • Page {currentPage} sur {totalPages}
        </div>
      </div>

      {/* Liste des cours et attributions en vue tableau compacte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Cours et attributions ({paginatedRows.length} sur {flattenedAttributions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[80px]">Code</TableHead>
                  <TableHead className="min-w-[200px] max-w-[200px]">Intitulé</TableHead>
                  <TableHead className="min-w-[80px]">Faculté</TableHead>
                  <TableHead className="min-w-[70px] text-right">Vol1</TableHead>
                  <TableHead className="min-w-[70px] text-right">Vol2</TableHead>
                  <TableHead className="min-w-[150px] max-w-[150px]">Enseignant</TableHead>
                  <TableHead className="min-w-[70px] text-right">Vol1 attr.</TableHead>
                  <TableHead className="min-w-[70px] text-right">Vol2 attr.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((row, idx) => (
                  <TableRow key={`${row.courseId}-${idx}`}>
                    <TableCell className="text-xs font-medium whitespace-nowrap">
                      {row.courseCode}
                    </TableCell>
                    <TableCell className="text-xs truncate max-w-[200px]" title={row.courseTitle}>
                      {row.courseTitle}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {row.faculty || "-"}
                    </TableCell>
                    <TableCell className="text-xs text-right whitespace-nowrap">{row.vol1Total}h</TableCell>
                    <TableCell className="text-xs text-right whitespace-nowrap">{row.vol2Total}h</TableCell>
                    <TableCell className="text-xs truncate max-w-[150px]" title={row.teacherEmail || ''}>
                      {row.teacherName}
                    </TableCell>
                    <TableCell className="text-xs text-right whitespace-nowrap">{row.vol1Hours}h</TableCell>
                    <TableCell className="text-xs text-right whitespace-nowrap">{row.vol2Hours}h</TableCell>
                  </TableRow>
                ))}
                {paginatedRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                      Aucun résultat. Modifiez vos filtres ou votre recherche.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};