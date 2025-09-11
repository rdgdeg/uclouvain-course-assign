import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, BookOpen, Users, Clock, Search, Filter, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CourseWithAttributions {
  id: number;
  code: string;
  title: string;
  faculty: string;
  vol1_total: number;
  vol2_total: number;
  attributions: {
    id: string;
    teacher_name: string;
    teacher_email: string;
    vol1_hours: number;
    vol2_hours: number;
    candidature_status: string;
    is_coordinator: boolean;
    assignment_type: string;
  }[];
  total_assigned_vol1: number;
  total_assigned_vol2: number;
  has_volume_mismatch: boolean;
}

export const ImportedCoursesPanel: React.FC = () => {
  const [courses, setCourses] = useState<CourseWithAttributions[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseWithAttributions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [candidatureFilter, setCandidatureFilter] = useState("all");
  const [faculties, setFaculties] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Récupérer les cours avec leurs attributions
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('code');

      if (coursesError) throw coursesError;

      const { data: attributionsData, error: attributionsError } = await supabase
        .from('hour_attributions')
        .select(`
          *,
          teachers:teacher_id (
            first_name,
            last_name,
            email
          )
        `);

      if (attributionsError) throw attributionsError;

      // Grouper les attributions par cours
      const coursesWithAttributions: CourseWithAttributions[] = coursesData.map(course => {
        const courseAttributions = attributionsData
          .filter(attr => attr.course_id === course.id)
          .map(attr => ({
            id: attr.id,
            teacher_name: attr.teachers ? `${attr.teachers.first_name} ${attr.teachers.last_name}` : 'N/A',
            teacher_email: attr.teachers?.email || '',
            vol1_hours: Number(attr.vol1_hours) || 0,
            vol2_hours: Number(attr.vol2_hours) || 0,
            candidature_status: attr.candidature_status || '',
            is_coordinator: attr.is_coordinator || false,
            assignment_type: attr.assignment_type || ''
          }));

        const total_assigned_vol1 = courseAttributions.reduce((sum, attr) => sum + attr.vol1_hours, 0);
        const total_assigned_vol2 = courseAttributions.reduce((sum, attr) => sum + attr.vol2_hours, 0);
        
        const has_volume_mismatch = 
          total_assigned_vol1 !== (course.vol1_total || 0) || 
          total_assigned_vol2 !== (course.vol2_total || 0);

        return {
          ...course,
          attributions: courseAttributions,
          total_assigned_vol1,
          total_assigned_vol2,
          has_volume_mismatch
        };
      });

      setCourses(coursesWithAttributions);
      
      // Extraire les facultés uniques
      const uniqueFaculties = [...new Set(coursesWithAttributions.map(c => c.faculty).filter(Boolean))];
      setFaculties(uniqueFaculties);

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les cours",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.attributions.some(attr => 
          attr.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtre par faculté
    if (facultyFilter !== "all") {
      filtered = filtered.filter(course => course.faculty === facultyFilter);
    }

    // Filtre par candidature
    if (candidatureFilter !== "all") {
      if (candidatureFilter === "mismatch") {
        filtered = filtered.filter(course => course.has_volume_mismatch);
      }
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, facultyFilter, candidatureFilter]);

  const getCandidatureBadge = (status: string) => {
    switch (status) {
      case "Non retenu":
        return <Badge variant="destructive">Non retenu</Badge>;
      case "Candidature soumise":
        return <Badge variant="secondary">Candidature soumise</Badge>;
      default:
        return <Badge variant="default">Retenu</Badge>;
    }
  };

  const stats = {
    totalCourses: courses.length,
    totalAttributions: courses.reduce((sum, c) => sum + c.attributions.length, 0),
    coursesWithMismatch: courses.filter(c => c.has_volume_mismatch).length,
    coordinators: courses.reduce((sum, c) => sum + c.attributions.filter(a => a.is_coordinator).length, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Cours Importés</h1>
        <p className="text-muted-foreground">
          Gestion et vérification des cours et attributions importés
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours importés</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attributions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttributions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coordinateurs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coordinators}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incohérences</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.coursesWithMismatch}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={fetchCourses} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
        <Button onClick={clearAllData} variant="destructive">
          Effacer toutes les données
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par code, titre ou enseignant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={facultyFilter} onValueChange={setFacultyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Faculté" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les facultés</SelectItem>
            {faculties.map(faculty => (
              <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={candidatureFilter} onValueChange={setCandidatureFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="mismatch">Incohérences volumes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des cours */}
      <Card>
        <CardHeader>
          <CardTitle>Cours et attributions ({filteredCourses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Chargement des cours...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {courses.length === 0 ? "Aucun cours importé" : "Aucun cours ne correspond aux filtres"}
              </p>
              {courses.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Utilisez l'import CSV pour charger des cours
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="border-l-4 border-l-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium text-lg">{course.code}</div>
                          <div className="text-sm text-muted-foreground">{course.title}</div>
                        </div>
                        <Badge variant="outline">{course.faculty || 'Non définie'}</Badge>
                        {course.has_volume_mismatch && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Incohérence volumes
                          </Badge>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">Volumes</div>
                        <div className="text-muted-foreground">
                          Vol1: {course.total_assigned_vol1 || 0}/{course.vol1_total || 0}h
                        </div>
                        <div className="text-muted-foreground">
                          Vol2: {course.total_assigned_vol2 || 0}/{course.vol2_total || 0}h
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {course.has_volume_mismatch && (
                      <Alert className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Incohérence détectée - Vol1: {course.total_assigned_vol1} attribué vs {course.vol1_total} prévu, 
                          Vol2: {course.total_assigned_vol2} attribué vs {course.vol2_total} prévu
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Équipe enseignante</h4>
                        <Badge variant="outline">{course.attributions.length} enseignant(s)</Badge>
                      </div>
                      
                      {course.attributions.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">Aucune attribution définie</p>
                      ) : (
                        <div className="grid gap-2">
                          {course.attributions.map((attribution) => (
                            <div key={attribution.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="font-medium">{attribution.teacher_name || 'Nom non défini'}</div>
                                  <div className="text-sm text-muted-foreground">{attribution.teacher_email || 'Email non défini'}</div>
                                </div>
                                {attribution.is_coordinator && (
                                  <Badge variant="secondary">Coordinateur</Badge>
                                )}
                                {attribution.candidature_status && getCandidatureBadge(attribution.candidature_status)}
                              </div>
                              <div className="text-right text-sm">
                                <div>Vol1: {attribution.vol1_hours || 0}h</div>
                                <div>Vol2: {attribution.vol2_hours || 0}h</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};