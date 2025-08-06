import React, { useState, useMemo } from "react";
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
    school: "all",
    status: "all",
    academicYear: "2024-2025",
    search: ""
  });
  
  const [sort, setSort] = useState<CourseSort>({
    field: "title",
    direction: "asc"
  });
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);
  
  // Récupérer tous les cours avec leurs données complètes
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['centralized-courses', filters.academicYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          assignments:course_assignments(
            *,
            teacher:teachers(*)
          )
        `)
        .eq('academic_year', filters.academicYear)
        .order('title');

      if (error) throw error;
      return data || [];
    }
  });

  // Après récupération des cours (data: courses = []), on mappe pour garantir la présence de 'school'
  const normalizedCourses = courses.map((course: any) => ({
    ...course,
    school: course.school ?? null,
  }));

  // Récupérer les demandes de modification
  const { data: modificationRequests = [] } = useQuery({
    queryKey: ['modification-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modification_requests')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  // Récupérer tous les enseignants
  const { data: teachers = [] } = useQuery({
    queryKey: ['all-teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('last_name');
      if (error) throw error;
      return data || [];
    }
  });

  // Calculer le statut détaillé de chaque cours
  const coursesWithStatus = useMemo(() => {
    return normalizedCourses.map(course => {
      const assignments = course.assignments || [];
      const totalVol1 = course.volume_total_vol1 || 0;
      const totalVol2 = course.volume_total_vol2 || 0;
      const assignedVol1 = assignments.reduce((sum, a) => sum + (a.vol1_hours || 0), 0);
      const assignedVol2 = assignments.reduce((sum, a) => sum + (a.vol2_hours || 0), 0);
      const totalVolume = totalVol1 + totalVol2;
      const assignedVolume = assignedVol1 + assignedVol2;
      
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
        assignments: assignments.length,
        totalVolume,
        assignedVolume,
        hasIssues,
        modificationRequests: courseModificationRequests,
        validationStatus
      };

      return { ...course, status };
    });
  }, [normalizedCourses, modificationRequests]);

  // Calcul des cours filtrés et triés
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = coursesWithStatus;

    // Filtre de recherche
    if (filters.search) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (course.code || "").toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtre par faculté
    if (filters.faculty !== "all") {
      filtered = filtered.filter(course => course.faculty === filters.faculty);
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

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredAndSortedCourses.length / pageSize);
  const paginatedCourses = filteredAndSortedCourses.slice((page - 1) * pageSize, page * pageSize);
  
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
    mutationFn: async (courseData: Partial<Course>) => {
      if (!selectedCourse) throw new Error("No course selected");
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', selectedCourse.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centralized-courses'] });
      toast({ title: "Succès", description: "Cours mis à jour avec succès." });
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
      toast({ title: "Succès", description: "Statut du cours mis à jour." });
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Rechercher par titre ou code..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="md:col-span-2"
            />
            <Select
              value={filters.faculty}
              onValueChange={(value) => setFilters(prev => ({ ...prev, faculty: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Faculté" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les facultés</SelectItem>
                {Array.from(new Set(normalizedCourses.map(c => c.faculty).filter(Boolean))).map(faculty => (
                  <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                        <Edit className="h-4 w-4" />
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Faculté</Label>
                      <p className="text-sm font-medium">{course.faculty || 'Non définie'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">École</Label>
                      <p className="text-sm font-medium">{course.school ? course.school : (course.subcategory || 'Non définie')}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Enseignants</Label>
                      <p className="text-sm font-medium">{course.status.assignments}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Volume</Label>
                      <p className="text-sm font-medium">
                        {course.status.assignedVolume}/{course.status.totalVolume}h
                      </p>
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
                            {course.assignments && course.assignments.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Enseignant</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Vol1 (h)</TableHead>
                                    <TableHead>Vol2 (h)</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {course.assignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                      <TableCell>
                                        {assignment.teacher?.first_name} {assignment.teacher?.last_name}
                                      </TableCell>
                                      <TableCell>
                                        {assignment.is_coordinator ? (
                                          <Badge variant="default">Coordinateur</Badge>
                                        ) : (
                                          <Badge variant="secondary">Enseignant</Badge>
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
                                      value={(course.status.assignedVolume / course.status.totalVolume) * 100} 
                                      className="flex-1"
                                    />
                                    <span className="text-sm">
                                      {course.assignments?.reduce((sum, a) => sum + (a.vol1_hours || 0), 0) || 0}/
                                      {course.volume_total_vol1 || 0}h
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Volume Vol2</Label>
                                  <div className="flex items-center gap-2">
                                    <Progress 
                                      value={(course.status.assignedVolume / course.status.totalVolume) * 100} 
                                      className="flex-1"
                                    />
                                    <span className="text-sm">
                                      {course.assignments?.reduce((sum, a) => sum + (a.vol2_hours || 0), 0) || 0}/
                                      {course.volume_total_vol2 || 0}h
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
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}>«</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>‹</Button>
            <span className="px-2 text-sm">Page {page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>›</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</Button>
          </div>
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
                  <Label>École</Label>
                  <Input
                    value={selectedCourse.school || ''}
                    onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, school: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label>Volume Vol1 (h)</Label>
                  <Input
                    type="number"
                    value={selectedCourse.volume_total_vol1 || 0}
                    onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, volume_total_vol1: Number(e.target.value) } : null)}
                  />
                </div>
                <div>
                  <Label>Volume Vol2 (h)</Label>
                  <Input
                    type="number"
                    value={selectedCourse.volume_total_vol2 || 0}
                    onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, volume_total_vol2: Number(e.target.value) } : null)}
                  />
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

      {/* Dialog d'ajout d'enseignant */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un enseignant</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Fonctionnalité d'ajout d'enseignant à implémenter
              </p>
              <div className="flex justify-end">
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