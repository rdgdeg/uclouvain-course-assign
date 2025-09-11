import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Search, Mail, FileText, Users, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface CourseDetail {
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
  coordinator?: {
    name: string;
    email: string;
  };
}

export const CourseVerificationPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDetail[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(null);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [correctionForm, setCorrectionForm] = useState({
    requesterName: "",
    requesterEmail: "",
    correctionType: "",
    description: ""
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const searchCourses = async () => {
    if (!searchTerm.trim()) {
      setFilteredCourses([]);
      return;
    }

    try {
      setLoading(true);

      // Recherche des cours
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .or(`code.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`)
        .order('code');

      if (coursesError) throw coursesError;

      if (!coursesData || coursesData.length === 0) {
        setFilteredCourses([]);
        return;
      }

      // Récupérer les attributions pour ces cours
      const courseIds = coursesData.map(c => c.id);
      const { data: attributionsData, error: attributionsError } = await supabase
        .from('hour_attributions')
        .select(`
          *,
          teachers:teacher_id (
            first_name,
            last_name,
            email
          )
        `)
        .in('course_id', courseIds);

      if (attributionsError) throw attributionsError;

      // Récupérer les coordinateurs
      const { data: coordinatorsData, error: coordinatorsError } = await supabase
        .from('course_coordinators')
        .select('*')
        .in('course_id', courseIds);

      if (coordinatorsError) throw coordinatorsError;

      // Construire les détails des cours
      const coursesWithDetails: CourseDetail[] = coursesData.map(course => {
        const courseAttributions = (attributionsData || [])
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

        const coordinator = coordinatorsData?.find(c => c.course_id === course.id);

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
          has_volume_mismatch,
          coordinator: coordinator ? {
            name: coordinator.name,
            email: coordinator.email
          } : undefined
        };
      });

      setFilteredCourses(coursesWithDetails);
      
      // Mettre à jour les facultés
      const uniqueFaculties = [...new Set(coursesWithDetails.map(c => c.faculty).filter(Boolean))];
      setFaculties(uniqueFaculties);

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rechercher les cours",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitCorrection = async () => {
    if (!selectedCourse || !correctionForm.requesterName || !correctionForm.requesterEmail || !correctionForm.correctionType || !correctionForm.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('course_corrections')
        .insert({
          course_id: selectedCourse.id,
          requester_name: correctionForm.requesterName,
          requester_email: correctionForm.requesterEmail,
          correction_type: correctionForm.correctionType,
          description: correctionForm.description
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée",
        description: "Votre demande de correction a été transmise à l'administration",
      });

      setCorrectionForm({
        requesterName: "",
        requesterEmail: "",
        correctionType: "",
        description: ""
      });
      setIsDialogOpen(false);

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Filtrer par faculté si un filtre est appliqué
    if (facultyFilter !== "all") {
      const filtered = courses.filter(course => course.faculty === facultyFilter);
      setFilteredCourses(filtered);
    }
  }, [facultyFilter, courses]);

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

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Vérification des Attributions</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Recherchez un cours pour consulter les attributions d'heures et signaler d'éventuelles corrections
        </p>
      </div>

      {/* Recherche */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche de cours
          </CardTitle>
          <CardDescription>
            Recherchez par code de cours, titre ou nom d'enseignant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Entrez le code du cours (ex: INFO1234) ou le titre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCourses()}
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
            <Button onClick={searchCourses} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      {filteredCourses.length > 0 && (
        <div className="max-w-6xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold">
            Résultats de recherche ({filteredCourses.length})
          </h2>
          
          <div className="grid gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="w-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{course.code}</CardTitle>
                        <Badge variant="outline">{course.faculty}</Badge>
                        {course.has_volume_mismatch && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Incohérence détectée
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">
                        {course.title}
                      </CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedCourse(course)}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Signaler une correction
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Demande de correction</DialogTitle>
                          <DialogDescription>
                            Cours: {selectedCourse?.code} - {selectedCourse?.title}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input
                              id="name"
                              value={correctionForm.requesterName}
                              onChange={(e) => setCorrectionForm(prev => ({...prev, requesterName: e.target.value}))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={correctionForm.requesterEmail}
                              onChange={(e) => setCorrectionForm(prev => ({...prev, requesterEmail: e.target.value}))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="type">Type de correction</Label>
                            <Select
                              value={correctionForm.correctionType}
                              onValueChange={(value) => setCorrectionForm(prev => ({...prev, correctionType: value}))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="volumes">Erreur dans les volumes</SelectItem>
                                <SelectItem value="enseignant">Erreur d'enseignant</SelectItem>
                                <SelectItem value="coordinator">Erreur de coordinateur</SelectItem>
                                <SelectItem value="other">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description détaillée</Label>
                            <Textarea
                              id="description"
                              rows={4}
                              value={correctionForm.description}
                              onChange={(e) => setCorrectionForm(prev => ({...prev, description: e.target.value}))}
                              placeholder="Décrivez précisément la correction à apporter..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={submitCorrection} className="flex-1">
                              Envoyer la demande
                            </Button>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Annuler
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Alerte incohérence */}
                  {course.has_volume_mismatch && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Incohérence détectée :</strong> Les volumes attribués aux enseignants ne correspondent pas aux volumes totaux du cours.
                        <br />
                        <strong>Vol1:</strong> {course.total_assigned_vol1}h attribués vs {course.vol1_total}h total
                        <br />
                        <strong>Vol2:</strong> {course.total_assigned_vol2}h attribués vs {course.vol2_total}h total
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Volumes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Volume total Vol1</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{course.vol1_total}h</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Volume total Vol2</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{course.vol2_total}h</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Équipe enseignante</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{course.attributions.length}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Coordinateur */}
                  {course.coordinator && (
                    <div>
                      <h4 className="font-medium mb-2">Coordinateur</h4>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{course.coordinator.name}</span>
                        <span className="text-muted-foreground">({course.coordinator.email})</span>
                      </div>
                    </div>
                  )}

                  {/* Équipe enseignante */}
                  <div>
                    <h4 className="font-medium mb-3">Répartition des heures</h4>
                    <div className="space-y-3">
                      {course.attributions.map((attribution) => (
                        <div key={attribution.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">{attribution.teacher_name}</div>
                              <div className="text-sm text-muted-foreground">{attribution.teacher_email}</div>
                            </div>
                            <div className="flex gap-2">
                              {attribution.is_coordinator && (
                                <Badge variant="secondary">Coordinateur</Badge>
                              )}
                              {getCandidatureBadge(attribution.candidature_status)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              Vol1: {attribution.vol1_hours}h | Vol2: {attribution.vol2_hours}h
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total: {attribution.vol1_hours + attribution.vol2_hours}h
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Résumé */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Résumé des attributions</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Vol1 attribué:</span>
                        <span className="ml-2 font-medium">{course.total_assigned_vol1}h / {course.vol1_total}h</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vol2 attribué:</span>
                        <span className="ml-2 font-medium">{course.total_assigned_vol2}h / {course.vol2_total}h</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* État vide */}
      {searchTerm && !loading && filteredCourses.length === 0 && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun cours trouvé</h3>
            <p className="text-muted-foreground">
              Aucun cours ne correspond à votre recherche "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};