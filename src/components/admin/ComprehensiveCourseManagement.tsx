import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Course, Teacher, TeacherAssignment, CourseFilters, CourseSort, FacultyRemarks, SchoolRemarks } from "@/types/index";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Icons
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Edit, 
  Save, 
  Eye, 
  Users, 
  BookOpen, 
  GraduationCap,
  Building,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  MessageSquare,
  Download,
  RefreshCw
} from "lucide-react";

interface ComprehensiveCourseManagementProps {
  academicYear?: string;
}

export const ComprehensiveCourseManagement: React.FC<ComprehensiveCourseManagementProps> = ({ 
  academicYear = "2024-2025" 
}) => {
  const [filters, setFilters] = useState<CourseFilters>({
    faculty: "all",
    school: "all",
    status: "all",
    academic_year: academicYear,
    search: ""
  });
  
  const [sort, setSort] = useState<CourseSort>({
    field: "title",
    direction: "asc"
  });
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isRemarksDialogOpen, setIsRemarksDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer tous les cours avec leurs données complètes
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['comprehensive-courses', academicYear],
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
        .eq('academic_year', academicYear)
        .order('title');

      if (error) throw error;
      return data || [];
    }
  });

  // Récupérer les demandes de modification
  const { data: modificationRequests = [] } = useQuery({
    queryKey: ['modification-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modification_requests')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Mutation pour sauvegarder les notes d'analyse
  const saveAnalysisNotesMutation = useMutation({
    mutationFn: async ({ courseId, notes }: { courseId: number; notes: string }) => {
      const { error } = await supabase
        .from('courses')
        .update({ 
          analysis_notes: notes,
          analysis_date: new Date().toISOString()
        })
        .eq('id', courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprehensive-courses'] });
      toast({
        title: "Notes d'analyse sauvegardées",
        description: "Les notes ont été enregistrées avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive",
      });
    }
  });

  // Mutation pour sauvegarder les notes de commission
  const saveCommissionNotesMutation = useMutation({
    mutationFn: async ({ courseId, notes }: { courseId: number; notes: string }) => {
      const { error } = await supabase
        .from('courses')
        .update({ 
          commission_notes: notes,
          commission_date: new Date().toISOString()
        })
        .eq('id', courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprehensive-courses'] });
      toast({
        title: "Notes de commission sauvegardées",
        description: "Les notes ont été enregistrées avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive",
      });
    }
  });

  // Filtrer et trier les cours
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      // Filtre par recherche
      if (filters.search && !course.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !course.code?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Filtre par faculté
      if (filters.faculty !== "all" && course.faculty !== filters.faculty) {
        return false;
      }

      // Filtre par école
      if (filters.school !== "all" && course.school !== filters.school) {
        return false;
      }

      // Filtre par statut
      const hasAssignments = course.assignments && course.assignments.length > 0;
      const hasModificationRequest = modificationRequests.some(req => req.course_id === course.id);
      
      switch (filters.status) {
        case "vacant":
          return course.vacant;
        case "assigned":
          return !course.vacant && hasAssignments;
        case "pending":
          return !course.vacant && !hasAssignments;
        case "with_issues":
          return !validateHourDistribution(course).isValid;
        case "with_modifications":
          return hasModificationRequest;
        default:
          return true;
      }
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: any = a[sort.field];
      let bValue: any = b[sort.field];

      if (sort.field === 'vacant') {
        aValue = a.vacant ? 1 : 0;
        bValue = b.vacant ? 1 : 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [courses, filters, sort, modificationRequests]);

  // Calculer les statistiques par faculté
  const facultyStats = useMemo(() => {
    const stats: { [key: string]: FacultyRemarks } = {};
    
    courses.forEach(course => {
      const faculty = course.faculty || "Non définie";
      if (!stats[faculty]) {
        stats[faculty] = {
          faculty,
          analysis_remarks: [],
          commission_remarks: [],
          total_courses: 0,
          vacant_courses: 0,
          assigned_courses: 0,
          courses_with_issues: 0
        };
      }

      stats[faculty].total_courses++;
      
      if (course.vacant) {
        stats[faculty].vacant_courses++;
      } else if (course.assignments && course.assignments.length > 0) {
        stats[faculty].assigned_courses++;
      }

      if (!validateHourDistribution(course).isValid) {
        stats[faculty].courses_with_issues++;
      }

      if (course.analysis_notes) {
        stats[faculty].analysis_remarks.push(`${course.code || course.title}: ${course.analysis_notes}`);
      }

      if (course.commission_notes) {
        stats[faculty].commission_remarks.push(`${course.code || course.title}: ${course.commission_notes}`);
      }
    });

    return Object.values(stats);
  }, [courses]);

  // Calculer les statistiques par école
  const schoolStats = useMemo(() => {
    const stats: { [key: string]: SchoolRemarks } = {};
    
    courses.forEach(course => {
      const school = course.school || "Non définie";
      const faculty = course.faculty || "Non définie";
      
      if (!stats[school]) {
        stats[school] = {
          school,
          faculty,
          analysis_remarks: [],
          commission_remarks: [],
          total_courses: 0,
          vacant_courses: 0,
          assigned_courses: 0
        };
      }

      stats[school].total_courses++;
      
      if (course.vacant) {
        stats[school].vacant_courses++;
      } else if (course.assignments && course.assignments.length > 0) {
        stats[school].assigned_courses++;
      }

      if (course.analysis_notes) {
        stats[school].analysis_remarks.push(`${course.code || course.title}: ${course.analysis_notes}`);
      }

      if (course.commission_notes) {
        stats[school].commission_remarks.push(`${course.code || course.title}: ${course.commission_notes}`);
      }
    });

    return Object.values(stats);
  }, [courses]);

  // Obtenir les facultés et écoles uniques
  const faculties = useMemo(() => {
    const facultySet = new Set(courses.map(c => c.faculty).filter(Boolean));
    return Array.from(facultySet).sort();
  }, [courses]);

  const schools = useMemo(() => {
    const schoolSet = new Set(courses.map(c => c.school).filter(Boolean));
    return Array.from(schoolSet).sort();
  }, [courses]);

  // Fonction de validation des heures
  const validateHourDistribution = (course: Course) => {
    if (!course.assignments || course.assignments.length === 0) {
      return { isValid: true, message: "Aucune attribution" };
    }

    const totalVol1 = course.assignments.reduce((sum, a) => sum + (a.vol1_hours || 0), 0);
    const totalVol2 = course.assignments.reduce((sum, a) => sum + (a.vol2_hours || 0), 0);

    const expectedVol1 = course.volume_total_vol1 || 0;
    const expectedVol2 = course.volume_total_vol2 || 0;

    if (totalVol1 !== expectedVol1 || totalVol2 !== expectedVol2) {
      return {
        isValid: false,
        message: `Vol1: ${totalVol1}/${expectedVol1}h, Vol2: ${totalVol2}/${expectedVol2}h`
      };
    }

    return { isValid: true, message: "OK" };
  };

  const openCourseDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsCourseDialogOpen(true);
  };

  const handleSaveAnalysisNotes = (notes: string) => {
    if (!selectedCourse) return;
    saveAnalysisNotesMutation.mutate({ courseId: selectedCourse.id, notes });
  };

  const handleSaveCommissionNotes = (notes: string) => {
    if (!selectedCourse) return;
    saveCommissionNotesMutation.mutate({ courseId: selectedCourse.id, notes });
  };

  const exportToCSV = () => {
    const headers = [
      "Code", "Titre", "Faculté", "École", "Statut", "Vol1 Total", "Vol2 Total",
      "Enseignants", "Coordinateur", "Notes Analyse", "Notes Commission",
      "Demande Modification", "Problèmes"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredAndSortedCourses.map(course => {
        const validation = validateHourDistribution(course);
        const hasModificationRequest = modificationRequests.some(req => req.course_id === course.id);
        const teachers = course.assignments?.map(a => a.teacher_name).join("; ") || "";
        const coordinator = course.assignments?.find(a => a.is_coordinator)?.teacher_name || "";
        
        return [
          course.code || "",
          `"${course.title}"`,
          course.faculty || "",
          course.school || "",
          course.vacant ? "Vacant" : (course.assignments && course.assignments.length > 0 ? "Attribué" : "En attente"),
          course.volume_total_vol1 || 0,
          course.volume_total_vol2 || 0,
          `"${teachers}"`,
          `"${coordinator}"`,
          `"${course.analysis_notes || ""}"`,
          `"${course.commission_notes || ""}"`,
          hasModificationRequest ? "Oui" : "Non",
          validation.isValid ? "" : validation.message
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `cours_${academicYear}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement des cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <AlertTriangle className="h-8 w-8 text-red-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {courses.filter(c => c.vacant).length}
              </p>
              <p className="text-sm text-muted-foreground">Cours vacants</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {courses.filter(c => !c.vacant && c.assignments && c.assignments.length > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Cours attribués</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <MessageSquare className="h-8 w-8 text-orange-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{modificationRequests.length}</p>
              <p className="text-sm text-muted-foreground">Demandes modif.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre ou code..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Faculté</Label>
              <Select value={filters.faculty} onValueChange={(value) => setFilters(prev => ({ ...prev, faculty: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>École</Label>
              <Select value={filters.school} onValueChange={(value) => setFilters(prev => ({ ...prev, school: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {schools.map(school => (
                    <SelectItem key={school} value={school}>{school}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Statut</Label>
              <Select value={filters.status} onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="vacant">Vacants</SelectItem>
                  <SelectItem value="assigned">Attribués</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="with_issues">Avec problèmes</SelectItem>
                  <SelectItem value="with_modifications">Avec demandes modif.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Tri</Label>
              <div className="flex gap-1">
                <Select value={sort.field} onValueChange={(value: any) => setSort(prev => ({ ...prev, field: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Titre</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="faculty">Faculté</SelectItem>
                    <SelectItem value="school">École</SelectItem>
                    <SelectItem value="vacant">Statut</SelectItem>
                    <SelectItem value="analysis_date">Date analyse</SelectItem>
                    <SelectItem value="commission_date">Date commission</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSort(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                >
                  {sort.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses">Cours ({filteredAndSortedCourses.length})</TabsTrigger>
          <TabsTrigger value="faculty-remarks">Remarques par Faculté</TabsTrigger>
          <TabsTrigger value="school-remarks">Remarques par École</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['comprehensive-courses'] })}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
            <Button onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>

          {/* Tableau des cours */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Faculté</TableHead>
                    <TableHead>École</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Enseignants</TableHead>
                    <TableHead>Volumes</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCourses.map((course) => {
                    const validation = validateHourDistribution(course);
                    const hasModificationRequest = modificationRequests.some(req => req.course_id === course.id);
                    const teachersCount = course.assignments?.length || 0;
                    
                    return (
                      <TableRow key={course.id}>
                        <TableCell className="font-mono text-sm">
                          {course.code || "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {course.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.faculty || "Non définie"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.school || "Non définie"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge className={course.vacant ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                              {course.vacant ? "Vacant" : (course.assignments && course.assignments.length > 0 ? "Attribué" : "En attente")}
                            </Badge>
                            {hasModificationRequest && (
                              <Badge variant="secondary" className="text-xs">Demande modif.</Badge>
                            )}
                            {!validation.isValid && (
                              <Badge variant="destructive" className="text-xs">Problème volumes</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">{teachersCount} enseignant(s)</span>
                            {course.assignments && course.assignments.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {course.assignments.map((assignment, index) => (
                                  <div key={index} className="flex items-center gap-1">
                                    <span>{assignment.teacher_name}</span>
                                    {assignment.is_coordinator && (
                                      <Badge variant="outline" className="text-xs">Coord.</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Vol1: {course.volume_total_vol1 || 0}h</div>
                            <div>Vol2: {course.volume_total_vol2 || 0}h</div>
                            {!validation.isValid && (
                              <div className="text-red-600 text-xs">{validation.message}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {course.analysis_notes && (
                              <Badge variant="outline" className="text-xs">Analyse</Badge>
                            )}
                            {course.commission_notes && (
                              <Badge variant="outline" className="text-xs">Commission</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openCourseDialog(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty-remarks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facultyStats.map((faculty) => (
              <Card key={faculty.faculty}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {faculty.faculty}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total:</span> {faculty.total_courses}
                      </div>
                      <div>
                        <span className="font-medium">Vacants:</span> {faculty.vacant_courses}
                      </div>
                      <div>
                        <span className="font-medium">Attribués:</span> {faculty.assigned_courses}
                      </div>
                      <div>
                        <span className="font-medium">Problèmes:</span> {faculty.courses_with_issues}
                      </div>
                    </div>
                    
                    {faculty.analysis_remarks.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Notes d'analyse ({faculty.analysis_remarks.length})</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {faculty.analysis_remarks.slice(0, 3).map((remark, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded">
                              {remark}
                            </div>
                          ))}
                          {faculty.analysis_remarks.length > 3 && (
                            <div className="text-xs text-blue-600">
                              +{faculty.analysis_remarks.length - 3} autres...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {faculty.commission_remarks.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Notes de commission ({faculty.commission_remarks.length})</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {faculty.commission_remarks.slice(0, 3).map((remark, index) => (
                            <div key={index} className="p-2 bg-blue-50 rounded">
                              {remark}
                            </div>
                          ))}
                          {faculty.commission_remarks.length > 3 && (
                            <div className="text-xs text-blue-600">
                              +{faculty.commission_remarks.length - 3} autres...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="school-remarks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schoolStats.map((school) => (
              <Card key={school.school}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {school.school}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{school.faculty}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total:</span> {school.total_courses}
                      </div>
                      <div>
                        <span className="font-medium">Vacants:</span> {school.vacant_courses}
                      </div>
                      <div>
                        <span className="font-medium">Attribués:</span> {school.assigned_courses}
                      </div>
                    </div>
                    
                    {school.analysis_remarks.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Notes d'analyse ({school.analysis_remarks.length})</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {school.analysis_remarks.slice(0, 3).map((remark, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded">
                              {remark}
                            </div>
                          ))}
                          {school.analysis_remarks.length > 3 && (
                            <div className="text-xs text-blue-600">
                              +{school.analysis_remarks.length - 3} autres...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {school.commission_remarks.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Notes de commission ({school.commission_remarks.length})</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {school.commission_remarks.slice(0, 3).map((remark, index) => (
                            <div key={index} className="p-2 bg-blue-50 rounded">
                              {remark}
                            </div>
                          ))}
                          {school.commission_remarks.length > 3 && (
                            <div className="text-xs text-blue-600">
                              +{school.commission_remarks.length - 3} autres...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog pour éditer un cours */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse?.code} - {selectedCourse?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="space-y-6">
              {/* Informations du cours */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations du cours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Faculté</Label>
                      <p className="text-sm">{selectedCourse.faculty || "Non définie"}</p>
                    </div>
                    <div>
                      <Label>École</Label>
                      <p className="text-sm">{selectedCourse.school || "Non définie"}</p>
                    </div>
                    <div>
                      <Label>Volume Vol1</Label>
                      <p className="text-sm">{selectedCourse.volume_total_vol1 || 0}h</p>
                    </div>
                    <div>
                      <Label>Volume Vol2</Label>
                      <p className="text-sm">{selectedCourse.volume_total_vol2 || 0}h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enseignants attribués */}
              <Card>
                <CardHeader>
                  <CardTitle>Enseignants attribués</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCourse.assignments && selectedCourse.assignments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCourse.assignments.map((assignment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{assignment.teacher_name}</div>
                            <div className="text-sm text-muted-foreground">
                              Vol1: {assignment.vol1_hours || 0}h | Vol2: {assignment.vol2_hours || 0}h
                            </div>
                          </div>
                          {assignment.is_coordinator && (
                            <Badge>Coordinateur</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucun enseignant attribué</p>
                  )}
                </CardContent>
              </Card>

              {/* Notes d'analyse */}
              <Card>
                <CardHeader>
                  <CardTitle>Notes d'analyse</CardTitle>
                  {selectedCourse.analysis_date && (
                    <p className="text-sm text-muted-foreground">
                      Dernière mise à jour: {new Date(selectedCourse.analysis_date).toLocaleDateString()}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ajouter des notes d'analyse..."
                    value={selectedCourse.analysis_notes || ""}
                    onChange={(e) => {
                      setSelectedCourse(prev => prev ? { ...prev, analysis_notes: e.target.value } : null);
                    }}
                    rows={4}
                  />
                  <Button 
                    className="mt-2"
                    onClick={() => handleSaveAnalysisNotes(selectedCourse.analysis_notes || "")}
                    disabled={saveAnalysisNotesMutation.isPending}
                  >
                    {saveAnalysisNotesMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Sauvegarder les notes d'analyse
                  </Button>
                </CardContent>
              </Card>

              {/* Notes de commission */}
              <Card>
                <CardHeader>
                  <CardTitle>Notes de commission</CardTitle>
                  {selectedCourse.commission_date && (
                    <p className="text-sm text-muted-foreground">
                      Dernière mise à jour: {new Date(selectedCourse.commission_date).toLocaleDateString()}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ajouter des notes de commission..."
                    value={selectedCourse.commission_notes || ""}
                    onChange={(e) => {
                      setSelectedCourse(prev => prev ? { ...prev, commission_notes: e.target.value } : null);
                    }}
                    rows={4}
                  />
                  <Button 
                    className="mt-2"
                    onClick={() => handleSaveCommissionNotes(selectedCourse.commission_notes || "")}
                    disabled={saveCommissionNotesMutation.isPending}
                  >
                    {saveCommissionNotesMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Sauvegarder les notes de commission
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 