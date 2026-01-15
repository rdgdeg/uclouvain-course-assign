import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserPlus,
  FileText,
  MessageSquare,
  Calendar,
  GraduationCap,
  Building,
  Volume2,
  Settings,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity
} from "lucide-react";
import { Course, Teacher, TeacherAssignment } from "@/types/index";
import { CourseCardSkeleton, TableRowSkeleton } from "@/components/ui/skeleton";

interface CourseStatus {
  vacant: 'full' | 'partial' | 'none';
  assignments: number;
  totalVolume: number;
  assignedVolume: number;
  hasIssues: boolean;
  modificationRequests: number;
  validationStatus: 'valid' | 'warning' | 'error';
}

interface CourseFilters {
  faculty: string;
  attributionFaculty: string; // Faculté d'attribution depuis hour_attributions
  school: string;
  status: 'all' | 'vacant' | 'partial' | 'assigned' | 'with_issues';
  academicYear: string;
  search: string;
}

interface CourseSort {
  field: 'title' | 'code' | 'faculty' | 'vacant' | 'assignments' | 'volume';
  direction: 'asc' | 'desc';
}

export const CentralizedCourseManagement: React.FC = () => {
  const [filters, setFilters] = useState<CourseFilters>({
    faculty: "all",
    attributionFaculty: "all",
    school: "all",
    status: "all",
    academicYear: "all", // Par défaut, afficher toutes les années
    search: ""
  });
  const [searchInput, setSearchInput] = useState("");
  
  const [sort, setSort] = useState<CourseSort>({
    field: "title",
    direction: "asc"
  });
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);
  
  // Pagination state (locale uniquement)
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Récupérer TOUS les cours (sans pagination serveur pour permettre filtrage complet)
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['centralized-courses-all', filters.academicYear, filters.faculty, filters.search],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select(`
          id,
          title,
          code,
          faculty,
          subcategory,
          volume_total_vol1,
          volume_total_vol2,
          vol1_total,
          vol2_total,
          academic_year,
          vacant,
          start_date,
          duration_weeks,
          created_at,
          updated_at,
          assignments:course_assignments(
            id,
            course_id,
            teacher_id,
            vol1_hours,
            vol2_hours,
            is_coordinator,
            teacher:teachers(
              id,
              first_name,
              last_name,
              email
            )
          ),
          hour_attributions(
            id,
            course_id,
            teacher_id,
            vol1_hours,
            vol2_hours,
            is_coordinator,
            faculty,
            teacher:teachers(
              id,
              first_name,
              last_name,
              email
            )
          )
        `);

      // Filtrer par année académique seulement si spécifiée
      if (filters.academicYear && filters.academicYear !== 'all') {
        query = query.eq('academic_year', filters.academicYear);
      }

      // Filtrer côté serveur (faculty et search)
      if (filters.faculty !== 'all') {
        query = query.eq('faculty', filters.faculty);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
      }

      query = query.order('title');

      // Supabase limite par défaut à 1000 résultats
      // On récupère tous les résultats par lots si nécessaire
      let allData: any[] = [];
      let hasMore = true;
      let offset = 0;
      const batchSize = 1000;

      while (hasMore) {
        const batchQuery = query.range(offset, offset + batchSize - 1);
        const { data, error } = await batchQuery;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          allData = [...allData, ...data];
          offset += batchSize;
          hasMore = data.length === batchSize; // Continue si on a récupéré exactement batchSize résultats
        } else {
          hasMore = false;
        }
      }

      return allData;
    },
    staleTime: 30000, // Cache 30 secondes
  });

  const courses = coursesData || [];

  // Après récupération des cours, on mappe pour garantir la présence de 'school'
  const normalizedCourses = courses.map((course: any) => ({
    ...course,
    school: course.school ?? null,
  }));

  // Récupérer les demandes de modification (colonnes limitées)
  const { data: modificationRequests = [] } = useQuery({
    queryKey: ['modification-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modification_requests')
        .select('id,course_id,status,created_at');
      if (error) throw error;
      return data;
    },
    staleTime: 60000, // Cache 1 minute
  });

  // Récupérer tous les enseignants (colonnes limitées, chargé seulement si nécessaire)
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('id,first_name,last_name,email')
        .order('last_name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    enabled: false, // Chargé seulement sur demande
  });

  // Calculer le statut détaillé de chaque cours
  const coursesWithStatus = useMemo(() => {
    return normalizedCourses.map(course => {
      // Combiner les attributions de course_assignments et hour_attributions
      const assignments = course.assignments || [];
      const hourAttributions = course.hour_attributions || [];
      
      // Utiliser les volumes totaux du cours (vol1_total/vol2_total ou volume_total_vol1/volume_total_vol2)
      const totalVol1 = course.vol1_total || course.volume_total_vol1 || 0;
      const totalVol2 = course.vol2_total || course.volume_total_vol2 || 0;
      
      // Calculer les volumes attribués depuis hour_attributions (priorité) ou course_assignments
      const assignedVol1FromHour = hourAttributions.reduce((sum, a) => sum + (Number(a.vol1_hours) || 0), 0);
      const assignedVol2FromHour = hourAttributions.reduce((sum, a) => sum + (Number(a.vol2_hours) || 0), 0);
      const assignedVol1FromAssignments = assignments.reduce((sum, a) => sum + (a.vol1_hours || 0), 0);
      const assignedVol2FromAssignments = assignments.reduce((sum, a) => sum + (a.vol2_hours || 0), 0);
      
      // Utiliser hour_attributions si disponible, sinon course_assignments
      const assignedVol1 = assignedVol1FromHour > 0 ? assignedVol1FromHour : assignedVol1FromAssignments;
      const assignedVol2 = assignedVol2FromHour > 0 ? assignedVol2FromHour : assignedVol2FromAssignments;
      
      const totalVolume = totalVol1 + totalVol2;
      const assignedVolume = assignedVol1 + assignedVol2;
      
      // Combiner les enseignants des deux sources
      const allTeachers = [
        ...hourAttributions
          .filter(ha => ha.teacher_id !== null) // Exclure les lignes avec teacher_id null (Non Attr.)
          .map(ha => ({
            id: ha.id,
            teacher: ha.teacher,
            vol1_hours: Number(ha.vol1_hours) || 0,
            vol2_hours: Number(ha.vol2_hours) || 0,
            is_coordinator: ha.is_coordinator || false,
            assignment_type: ha.assignment_type,
            source: 'hour_attributions'
          })),
        ...assignments
          .filter(a => a.teacher_id !== null) // Exclure les lignes avec teacher_id null
          .map(a => ({
            id: a.id,
            teacher: a.teacher,
            vol1_hours: a.vol1_hours || 0,
            vol2_hours: a.vol2_hours || 0,
            is_coordinator: a.is_coordinator || false,
            assignment_type: null,
            source: 'course_assignments'
          }))
      ];
      
      // Calculer les volumes non attribués (Non Attr.)
      const nonAttributedVol1 = Math.max(0, totalVol1 - assignedVol1);
      const nonAttributedVol2 = Math.max(0, totalVol2 - assignedVol2);
      
      // Ajouter une ligne "Non Attr." si il y a du volume non attribué
      if (nonAttributedVol1 > 0 || nonAttributedVol2 > 0) {
        allTeachers.push({
          id: `non-attributed-${course.id}`,
          teacher: null, // null pour indiquer "Non Attr."
          vol1_hours: nonAttributedVol1,
          vol2_hours: nonAttributedVol2,
          is_coordinator: false,
          assignment_type: null,
          source: 'non-attributed'
        });
      }
      
      let vacant: CourseStatus['vacant'] = 'none';
      if (course.vacant) {
        vacant = 'full';
      } else if (assignedVolume < totalVolume) {
        vacant = 'partial';
      }

      const hasIssues = assignedVol1 !== totalVol1 || assignedVol2 !== totalVol2;
      const courseModificationRequests = modificationRequests.filter(req => req.course_id === course.id).length;
      
      let validationStatus: CourseStatus['validationStatus'] = 'valid';
      if (hasIssues) validationStatus = 'error';
      else if (vacant === 'partial') validationStatus = 'warning';

      const status: CourseStatus = {
        vacant,
        assignments: allTeachers.length,
        totalVolume,
        assignedVolume,
        hasIssues,
        modificationRequests: courseModificationRequests,
        validationStatus
      };

      return { ...course, status, allTeachers };
    });
  }, [normalizedCourses, modificationRequests]);

  // Tri et filtrage côté client (sur les données paginées)
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = [...coursesWithStatus];

    // Filtres supplémentaires côté client (attributionFaculty, status, school)
    // Note: Les filtres faculty et search sont déjà appliqués côté serveur

    // Filtre par faculté d'attribution
    if (filters.attributionFaculty !== "all") {
      filtered = filtered.filter(course => {
        const attributionFaculties = course.allTeachers
          ?.map((t: any) => t.faculty || course.faculty)
          .filter(Boolean) || [];
        return attributionFaculties.includes(filters.attributionFaculty) || 
               (attributionFaculties.length === 0 && course.faculty === filters.attributionFaculty);
      });
    }

    // Filtre par école
    if (filters.school !== "all") {
      filtered = filtered.filter(course => (course.school || course.subcategory) === filters.school);
    }

    // Filtre par statut
    if (filters.status !== "all") {
      filtered = filtered.filter(course => {
        switch (filters.status) {
          case "vacant":
            return course.status.vacant === 'full';
          case "partial":
            return course.status.vacant === 'partial';
          case "assigned":
            return course.status.vacant === 'none';
          case "with_issues":
            return course.status.hasIssues;
          default:
            return true;
        }
      });
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sort.field) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "code":
          aValue = a.code;
          bValue = b.code;
          break;
        case "faculty":
          aValue = a.faculty;
          bValue = b.faculty;
          break;
        case "vacant":
          aValue = a.status.vacant;
          bValue = b.status.vacant;
          break;
        case "assignments":
          aValue = a.status.assignments;
          bValue = b.status.assignments;
          break;
        case "volume":
          aValue = a.status.totalVolume;
          bValue = b.status.totalVolume;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sort.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sort.direction === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [coursesWithStatus, filters, sort]);

  // Débouncer la recherche pour éviter un rafraîchissement à chaque lettre
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Pagination locale sur les cours filtrés et triés (après filtrage côté client)
  const totalPages = Math.ceil(filteredAndSortedCourses.length / pageSize);
  const paginatedCourses = filteredAndSortedCourses.slice((page - 1) * pageSize, page * pageSize);
  
  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [filters.academicYear, filters.faculty, filters.status, filters.search, filters.attributionFaculty, filters.school]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Statistiques globales
  const stats = useMemo(() => {
    const total = coursesWithStatus.length;
    const vacant = coursesWithStatus.filter(c => c.status.vacant === 'full').length;
    const partial = coursesWithStatus.filter(c => c.status.vacant === 'partial').length;
    const assigned = coursesWithStatus.filter(c => c.status.vacant === 'none').length;
    const withIssues = coursesWithStatus.filter(c => c.status.hasIssues).length;
    const totalRequests = modificationRequests.length;

    return {
      total,
      vacant,
      partial,
      assigned,
      withIssues,
      totalRequests,
      completionRate: total > 0 ? Math.round(((assigned + partial) / total) * 100) : 0
    };
  }, [coursesWithStatus, modificationRequests]);

  // Mutations
  const updateCourseMutation = useMutation({
    mutationFn: async (courseData: Partial<Course> & { vol1_total?: number; vol2_total?: number }) => {
      if (!selectedCourse) throw new Error("No course selected");
      const { data, error } = await supabase
        .from('courses')
        .update({
          ...courseData,
          vol1_total: courseData.vol1_total ?? courseData.volume_total_vol1,
          vol2_total: courseData.vol2_total ?? courseData.volume_total_vol2,
        })
        .eq('id', selectedCourse.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centralized-courses'] });
      toast({ 
        title: "Succès", 
        description: "Cours mis à jour avec succès.",
        duration: 2000
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: `Impossible de mettre à jour le cours: ${error.message}`, 
        variant: "destructive" 
      });
    }
  });

  const toggleVacantMutation = useMutation({
    mutationFn: async ({ courseId, vacant }: { courseId: number; vacant: boolean }) => {
      const { data, error } = await supabase
        .from('courses')
        .update({ vacant })
        .eq('id', courseId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centralized-courses'] });
      toast({ 
        title: "Succès", 
        description: "Statut du cours mis à jour.",
        duration: 2000
      });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: `Impossible de mettre à jour le statut: ${error.message}`, 
        variant: "destructive" 
      });
    }
  });

  // Fonctions utilitaires
  const getStatusBadge = (status: CourseStatus) => {
    switch (status.vacant) {
      case 'full':
        return <Badge variant="destructive">Vacant</Badge>;
      case 'partial':
        return <Badge variant="secondary">Partiellement vacant</Badge>;
      case 'none':
        return <Badge variant="default">Attribué</Badge>;
    }
  };

  const getValidationIcon = (status: CourseStatus) => {
    switch (status.validationStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const handleToggleExpanded = (courseId: string) => {
    setExpandedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const exportToCSV = () => {
    const headers = ['Titre', 'Code', 'Faculté', 'École', 'Statut', 'Enseignants', 'Volume Total', 'Volume Attribué', 'Problèmes'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedCourses.map(course => [
        course.title,
        course.code || '',
        course.faculty || '',
        course.school || '',
        course.status.vacant,
        course.status.assignments,
        course.status.totalVolume,
        course.status.assignedVolume,
        course.status.hasIssues ? 'Oui' : 'Non'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cours_${filters.academicYear}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des cours...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Gestion Centralisée des Cours
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['centralized-courses'] })}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-800">Total</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.vacant}</div>
              <div className="text-sm text-red-800">Vacants</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
              <div className="text-sm text-yellow-800">Partiels</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.assigned}</div>
              <div className="text-sm text-green-800">Attribués</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.withIssues}</div>
              <div className="text-sm text-orange-800">Problèmes</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
              <div className="text-sm text-purple-800">Complétion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres et Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs text-muted-foreground">Recherche</Label>
              <Input
                placeholder="Rechercher par titre ou code..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Année académique</Label>
              <Select
                value={filters.academicYear}
                onValueChange={(value) => {
                  setFilters(prev => ({ ...prev, academicYear: value }));
                  setPage(1); // Réinitialiser la pagination
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Année académique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les années</SelectItem>
                  {Array.from(new Set(normalizedCourses.map(c => c.academic_year).filter(Boolean))).sort().reverse().map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Faculté cours</Label>
              <Select
                value={filters.faculty}
                onValueChange={(value) => setFilters(prev => ({ ...prev, faculty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Faculté cours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les facultés</SelectItem>
                  {Array.from(new Set(normalizedCourses.map(c => c.faculty).filter(Boolean))).map(faculty => (
                    <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Faculté attribution</Label>
              <Select
                value={filters.attributionFaculty}
                onValueChange={(value) => setFilters(prev => ({ ...prev, attributionFaculty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Faculté attribution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les facultés</SelectItem>
                  {Array.from(new Set(
                    coursesWithStatus.flatMap(c => 
                      c.allTeachers?.map((t: any) => t.faculty || c.faculty).filter(Boolean) || [c.faculty].filter(Boolean)
                    )
                  )).map(faculty => (
                    <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Statut</Label>
              <Select
                value={filters.status}
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="vacant">Vacants</SelectItem>
                  <SelectItem value="partial">Partiellement vacants</SelectItem>
                  <SelectItem value="assigned">Attribués</SelectItem>
                  <SelectItem value="with_issues">Avec problèmes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Tri</Label>
              <Select
                value={sort.field}
                onValueChange={(value: any) => setSort(prev => ({ ...prev, field: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Titre</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="faculty">Faculté</SelectItem>
                  <SelectItem value="vacant">Statut</SelectItem>
                  <SelectItem value="assignments">Enseignants</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSort(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }))}
            >
              {sort.direction === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
            <span className="text-sm text-muted-foreground">
              {filteredAndSortedCourses.length} cours trouvé(s)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Liste des cours avec accordéons */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredAndSortedCourses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun cours trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {courses.length === 0 
                ? "Aucun cours n'a été importé. Utilisez l'import pour ajouter des cours."
                : "Aucun cours ne correspond aux filtres sélectionnés. Essayez de modifier vos critères de recherche."}
            </p>
            {courses.length === 0 && (
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['centralized-courses'] })}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(course.status)}
                        {getValidationIcon(course.status)}
                        {course.status.modificationRequests > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {course.status.modificationRequests}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleExpanded(course.id.toString())}
                      >
                        {expandedCourses.includes(course.id.toString()) ? 'Masquer' : 'Détails'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse({ ...course, school: course.school ?? null });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier cours
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse({ ...course, school: course.school ?? null });
                          setIsAssignmentDialogOpen(true);
                        }}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Gérer enseignants
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleVacantMutation.mutate({
                          courseId: course.id,
                          vacant: !course.vacant
                        })}
                      >
                        {course.vacant ? 'Marquer non vacant' : 'Marquer vacant'}
                      </Button>
                    </div>
                  </div>

                  {/* Informations de base */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Faculté</Label>
                      <p className="text-sm font-medium">{course.faculty || 'Non définie'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">École</Label>
                      <p className="text-sm font-medium">{course.school ? course.school : (course.subcategory || 'Non définie')}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Vol1 Total</Label>
                      <p className="text-sm font-medium">
                        {course.vol1_total || course.volume_total_vol1 || 0}h
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Vol2 Total</Label>
                      <p className="text-sm font-medium">
                        {course.vol2_total || course.volume_total_vol2 || 0}h
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Enseignants</Label>
                      <p className="text-sm font-medium">{course.status.assignments}</p>
                    </div>
                  </div>

                  {/* Accordéon avec détails */}
                  {expandedCourses.includes(course.id.toString()) && (
                    <div className="border-t pt-4">
                      <Accordion type="multiple" defaultValue={["assignments", "volumes", "notes"]}>
                        
                        {/* Enseignants assignés */}
                        <AccordionItem value="assignments">
                          <AccordionTrigger className="text-sm">
                            <Users className="h-4 w-4 mr-2" />
                            Enseignants assignés ({course.status.assignments})
                          </AccordionTrigger>
                          <AccordionContent>
                            {course.allTeachers && course.allTeachers.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Enseignant</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Vol1 (h)</TableHead>
                                    <TableHead>Vol2 (h)</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {course.allTeachers.map((assignment: any) => (
                                    <TableRow key={assignment.id}>
                                      <TableCell>
                                        {assignment.teacher ? (
                                          `${assignment.teacher?.first_name || assignment.teacher?.prenom || ''} ${assignment.teacher?.last_name || assignment.teacher?.nom || ''}`
                                        ) : (
                                          <span className="text-muted-foreground italic">Non Attr.</span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        {assignment.teacher?.email || '-'}
                                      </TableCell>
                                      <TableCell>
                                        {assignment.teacher ? (
                                          assignment.is_coordinator ? (
                                            <Badge variant="default">Coordinateur</Badge>
                                          ) : assignment.assignment_type ? (
                                            <Badge variant="secondary">{assignment.assignment_type}</Badge>
                                          ) : (
                                          <Badge variant="secondary">Cotitulaire</Badge>
                                          )
                                        ) : (
                                          <Badge variant="outline" className="text-muted-foreground">Non attribué</Badge>
                                        )}
                                      </TableCell>
                                      <TableCell>{assignment.vol1_hours || 0}</TableCell>
                                      <TableCell>{assignment.vol2_hours || 0}</TableCell>
                                      <TableCell>
                                        <Button variant="outline" size="sm">
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                Aucun enseignant assigné
                              </div>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => {
                                setSelectedCourse(course);
                                setIsAssignmentDialogOpen(true);
                              }}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Ajouter un enseignant
                            </Button>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Détails des volumes */}
                        <AccordionItem value="volumes">
                          <AccordionTrigger className="text-sm">
                            <Volume2 className="h-4 w-4 mr-2" />
                            Détails des volumes
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Volume Vol1</Label>
                                  <div className="flex items-center gap-2">
                                    <Progress 
                                      value={((course.vol1_total || course.volume_total_vol1 || 0) > 0) 
                                        ? ((course.allTeachers?.reduce((sum: number, a: any) => sum + (a.vol1_hours || 0), 0) || 0) / (course.vol1_total || course.volume_total_vol1 || 1)) * 100
                                        : 0} 
                                      className="flex-1"
                                    />
                                    <span className="text-sm">
                                      {course.allTeachers?.reduce((sum: number, a: any) => sum + (a.vol1_hours || 0), 0) || 0}/
                                      {course.vol1_total || course.volume_total_vol1 || 0}h
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Volume Vol2</Label>
                                  <div className="flex items-center gap-2">
                                    <Progress 
                                      value={((course.vol2_total || course.volume_total_vol2 || 0) > 0)
                                        ? ((course.allTeachers?.reduce((sum: number, a: any) => sum + (a.vol2_hours || 0), 0) || 0) / (course.vol2_total || course.volume_total_vol2 || 1)) * 100
                                        : 0} 
                                      className="flex-1"
                                    />
                                    <span className="text-sm">
                                      {course.allTeachers?.reduce((sum: number, a: any) => sum + (a.vol2_hours || 0), 0) || 0}/
                                      {course.vol2_total || course.volume_total_vol2 || 0}h
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {course.status.hasIssues && (
                                <Alert variant="destructive">
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                    Les volumes attribués ne correspondent pas aux volumes totaux du cours.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Notes et remarques */}
                        <AccordionItem value="notes">
                          <AccordionTrigger className="text-sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Notes et remarques
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              {(course as any).analysis_notes && (
                                <div>
                                  <Label className="text-sm font-medium">Notes d'analyse</Label>
                                  <p className="text-sm p-2 bg-gray-50 rounded">{(course as any).analysis_notes}</p>
                                </div>
                              )}
                              {(course as any).commission_notes && (
                                <div>
                                  <Label className="text-sm font-medium">Notes de commission</Label>
                                  <p className="text-sm p-2 bg-gray-50 rounded">{(course as any).commission_notes}</p>
                                </div>
                              )}
                              {!(course as any).analysis_notes && !(course as any).commission_notes && (
                                <p className="text-sm text-muted-foreground">Aucune note disponible</p>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}>«</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>‹</Button>
              <span className="px-2 text-sm">Page {page} / {totalPages} ({filteredAndSortedCourses.length} cours au total)</span>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>›</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</Button>
            </div>
          )}
        </>
      )}

      {/* Dialog d'édition de cours */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le cours</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={selectedCourse.title}
                    onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label>Code</Label>
                  <Input
                    value={selectedCourse.code || ''}
                    onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, code: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label>Faculté</Label>
                  <Input
                    value={selectedCourse.faculty || ''}
                    onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, faculty: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label>Sous-catégorie</Label>
                  <Input
                    value={selectedCourse.subcategory || ''}
                    onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, subcategory: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label>Volume Total Vol1 (h)</Label>
                  <Input
                    type="number"
                    value={selectedCourse.volume_total_vol1 || 0}
                    onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, volume_total_vol1: Number(e.target.value) } : null)}
                  />
                </div>
                <div>
                  <Label>Volume Total Vol2 (h)</Label>
                  <Input
                    type="number"
                    value={selectedCourse.volume_total_vol2 || 0}
                    onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, volume_total_vol2: Number(e.target.value) } : null)}
                  />
                </div>
                <div>
                  <Label>Vol1 Total (h)</Label>
                  <Input
                    type="number"
                    value={selectedCourse.vol1_total || 0}
                    onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, vol1_total: Number(e.target.value) } : null)}
                  />
                </div>
                <div>
                  <Label>Vol2 Total (h)</Label>
                  <Input
                    type="number"
                    value={selectedCourse.vol2_total || 0}
                    onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, vol2_total: Number(e.target.value) } : null)}
                  />
                </div>
                <div>
                  <Label>Année académique</Label>
                  <Input
                    value={selectedCourse.academic_year || ''}
                    onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, academic_year: e.target.value } : null)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedCourse.vacant || false}
                    onCheckedChange={(checked) => setSelectedCourse(prev => prev ? { ...prev, vacant: !!checked } : null)}
                  />
                  <Label>Vacant</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={() => updateCourseMutation.mutate(selectedCourse)}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de gestion des enseignants */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestion des enseignants - {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              {/* Informations du cours */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations du cours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Code</Label>
                      <p className="text-sm font-medium">{selectedCourse.code}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Faculté</Label>
                      <p className="text-sm font-medium">{selectedCourse.faculty || 'Non définie'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Vol1 Total</Label>
                      <p className="text-sm font-medium">{selectedCourse.vol1_total || selectedCourse.volume_total_vol1 || 0}h</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Vol2 Total</Label>
                      <p className="text-sm font-medium">{selectedCourse.vol2_total || selectedCourse.volume_total_vol2 || 0}h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des enseignants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Enseignants assignés ({selectedCourse.allTeachers?.length || 0})</span>
                    <Button size="sm" onClick={() => {
                      // TODO: Implémenter l'ajout d'enseignant
                      toast({
                        title: "Fonctionnalité à venir",
                        description: "L'ajout d'enseignant sera disponible prochainement.",
                      });
                    }}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCourse.allTeachers && selectedCourse.allTeachers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Enseignant</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead>Faculté</TableHead>
                          <TableHead>Vol1 (h)</TableHead>
                          <TableHead>Vol2 (h)</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCourse.allTeachers.map((assignment: any) => (
                          <TableRow key={assignment.id}>
                            <TableCell>
                              {assignment.teacher ? (
                                `${assignment.teacher?.first_name || assignment.teacher?.prenom || ''} ${assignment.teacher?.last_name || assignment.teacher?.nom || ''}`
                              ) : (
                                <span className="text-muted-foreground italic">Non Attr.</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs">
                              {assignment.teacher?.email || '-'}
                            </TableCell>
                            <TableCell>
                              {assignment.is_coordinator ? (
                                <Badge variant="default">Coordinateur</Badge>
                              ) : assignment.assignment_type ? (
                                <Badge variant="secondary">{assignment.assignment_type}</Badge>
                              ) : (
                                <Badge variant="secondary">Cotitulaire</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {assignment.faculty || selectedCourse.faculty || '-'}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={assignment.vol1_hours || 0}
                                onChange={(e) => {
                                  // Mettre à jour localement pour l'affichage
                                  const updatedTeachers = selectedCourse.allTeachers?.map((t: any) =>
                                    t.id === assignment.id ? { ...t, vol1_hours: Number(e.target.value) } : t
                                  );
                                  setSelectedCourse(prev => prev ? { ...prev, allTeachers: updatedTeachers } : null);
                                }}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={assignment.vol2_hours || 0}
                                onChange={(e) => {
                                  const updatedTeachers = selectedCourse.allTeachers?.map((t: any) =>
                                    t.id === assignment.id ? { ...t, vol2_hours: Number(e.target.value) } : t
                                  );
                                  setSelectedCourse(prev => prev ? { ...prev, allTeachers: updatedTeachers } : null);
                                }}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      if (assignment.source === 'hour_attributions') {
                                        const { error } = await supabase
                                          .from('hour_attributions')
                                          .update({
                                            vol1_hours: assignment.vol1_hours,
                                            vol2_hours: assignment.vol2_hours
                                          })
                                          .eq('id', assignment.id);
                                        if (error) throw error;
                                      } else {
                                        const { error } = await supabase
                                          .from('course_assignments')
                                          .update({
                                            vol1_hours: assignment.vol1_hours,
                                            vol2_hours: assignment.vol2_hours
                                          })
                                          .eq('id', assignment.id);
                                        if (error) throw error;
                                      }
                                      queryClient.invalidateQueries({ queryKey: ['centralized-courses'] });
                                      toast({
                                        title: "Volumes mis à jour",
                                        description: "Les volumes de l'enseignant ont été mis à jour.",
                                        duration: 2000
                                      });
                                    } catch (error: any) {
                                      toast({
                                        title: "Erreur",
                                        description: error.message,
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    if (confirm("Êtes-vous sûr de vouloir supprimer cette attribution ?")) {
                                      try {
                                        if (assignment.source === 'hour_attributions') {
                                          const { error } = await supabase
                                            .from('hour_attributions')
                                            .delete()
                                            .eq('id', assignment.id);
                                          if (error) throw error;
                                        } else {
                                          const { error } = await supabase
                                            .from('course_assignments')
                                            .delete()
                                            .eq('id', assignment.id);
                                          if (error) throw error;
                                        }
                                        queryClient.invalidateQueries({ queryKey: ['centralized-courses'] });
                                        toast({
                                          title: "Attribution supprimée",
                                          description: "L'attribution a été supprimée avec succès.",
                                          duration: 2000
                                        });
                                        setIsAssignmentDialogOpen(false);
                                      } catch (error: any) {
                                        toast({
                                          title: "Erreur",
                                          description: error.message,
                                          variant: "destructive",
                                        });
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun enseignant assigné à ce cours
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 