import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  Users, 
  Clock, 
  MessageSquare, 
  Send,
  Plus,
  User,
  Building,
  GraduationCap,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: number;
  title: string;
  code: string;
  faculty: string;
  subcategory?: string;
  volume_total_vol1: number;
  volume_total_vol2: number;
  vacant: boolean;
  assignments?: CourseAssignment[];
}

interface CourseAssignment {
  id: number;
  teacher: Teacher;
  is_coordinator: boolean;
  vol1_hours: number;
  vol2_hours: number;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  entity: string;
  status: string;
}

interface ModificationRequest {
  course_id?: number;
  requester_name: string;
  requester_email: string;
  modification_type: string;
  description: string;
  course_info?: {
    code: string;
    title: string;
    faculty: string;
    description: string;
  };
}

const ModificationRequests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showCustomRequestDialog, setShowCustomRequestDialog] = useState(false);
  const [requestForm, setRequestForm] = useState<ModificationRequest>({
    requester_name: "",
    requester_email: "",
    modification_type: "",
    description: ""
  });

  // Récupérer tous les cours avec leurs attributions
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses-with-assignments'],
    queryFn: async () => {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('title');
      
      if (coursesError) throw coursesError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          is_coordinator,
          vol1_hours,
          vol2_hours,
          teacher:teachers(*)
        `);
      
      if (assignmentsError) throw assignmentsError;

      // Combiner les données
      return coursesData.map(course => ({
        ...course,
        assignments: assignmentsData.filter(a => a.course_id === course.id)
      }));
    }
  });

  // Mutation pour créer une demande de modification
  const createRequestMutation = useMutation({
    mutationFn: async (request: ModificationRequest) => {
      const requestData = {
        course_id: request.course_id,
        requester_name: request.requester_name,
        requester_email: request.requester_email,
        modification_type: request.modification_type,
        description: request.description,
        course_info: request.course_info,
        status: 'pending',
        submission_date: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('modification_requests')
        .insert([requestData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setShowRequestDialog(false);
      setShowCustomRequestDialog(false);
      resetForm();
      toast({
        title: "Demande envoyée",
        description: "Votre demande de modification a été envoyée avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setRequestForm({
      requester_name: "",
      requester_email: "",
      modification_type: "",
      description: ""
    });
  };

  const handleCourseRequest = (course: Course) => {
    setSelectedCourse(course);
    setRequestForm(prev => ({ ...prev, course_id: course.id }));
    setShowRequestDialog(true);
  };

  const handleCustomRequest = () => {
    setShowCustomRequestDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestForm.requester_name || !requestForm.requester_email || 
        !requestForm.modification_type || !requestForm.description) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate(requestForm);
  };

  // Filtrage des cours
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = facultyFilter === "all" || course.faculty === facultyFilter;
    return matchesSearch && matchesFaculty;
  });

  const facultyOptions = [
    { value: "all", label: "Toutes les facultés" },
    { value: "FSM", label: "FSM" },
    { value: "FSP", label: "FSP" },
    { value: "FASB", label: "FASB" },
    { value: "MEDE", label: "MEDE" }
  ];

  const modificationTypes = [
    { value: "assignment", label: "Attribution d'enseignant" },
    { value: "content", label: "Modification du contenu" },
    { value: "schedule", label: "Modification des horaires" },
    { value: "volume", label: "Modification des volumes horaires" },
    { value: "other", label: "Autre" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        {/* En-tête de la page */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Demandes de Modification
            </h1>
            <p className="text-lg text-gray-600">
              Consultez les cours et demandez des modifications
            </p>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par code ou titre de cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par faculté" />
                </SelectTrigger>
                <SelectContent>
                  {facultyOptions.map((faculty) => (
                    <SelectItem key={faculty.value} value={faculty.value}>
                      {faculty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={handleCustomRequest}
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cours non répertorié
            </Button>
          </div>
        </div>

        {/* Liste des cours */}
        {isLoading ? (
          <div className="text-center py-12">
            <p>Chargement des cours...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{course.code}</Badge>
                        <Badge variant="secondary">{course.faculty}</Badge>
                        {course.subcategory && (
                          <Badge variant="outline">{course.subcategory}</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCourseRequest(course)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Demander modification
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Volumes horaires */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Volumes horaires :</span>
                    </div>
                    <Badge variant="outline">
                      Vol.1: {course.volume_total_vol1}h
                    </Badge>
                    <Badge variant="outline">
                      Vol.2: {course.volume_total_vol2}h
                    </Badge>
                  </div>

                  {/* Statut du cours */}
                  <div className="flex items-center gap-2">
                    <Badge variant={course.vacant ? "destructive" : "default"}>
                      {course.vacant ? "Vacant" : "Attribué"}
                    </Badge>
                  </div>

                  {/* Enseignants assignés */}
                  {course.assignments && course.assignments.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Équipe d'enseignement :</span>
                      </div>
                      <div className="space-y-1">
                        {course.assignments.map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {assignment.teacher.name}
                              </span>
                              {assignment.is_coordinator && (
                                <Badge variant="default" className="text-xs">
                                  Coord.
                                </Badge>
                              )}
                              <span className="text-muted-foreground">
                                ({assignment.teacher.status})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span>Vol.1: {assignment.vol1_hours}h</span>
                              <span>Vol.2: {assignment.vol2_hours}h</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!course.assignments || course.assignments.length === 0) && (
                    <div className="text-sm text-muted-foreground">
                      Aucun enseignant assigné
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredCourses.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Aucun cours trouvé
            </p>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche ou utilisez le bouton "Cours non répertorié".
            </p>
          </div>
        )}
      </main>

      {/* Dialog pour demande de modification d'un cours existant */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Demande de modification - {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations du cours */}
            {selectedCourse && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Cours concerné</h4>
                <p className="font-medium">{selectedCourse.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCourse.code} - {selectedCourse.faculty}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline">
                    Vol.1: {selectedCourse.volume_total_vol1}h
                  </Badge>
                  <Badge variant="outline">
                    Vol.2: {selectedCourse.volume_total_vol2}h
                  </Badge>
                </div>
              </div>
            )}

            {/* Informations du demandeur */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requester_name">Nom complet *</Label>
                <Input
                  id="requester_name"
                  value={requestForm.requester_name}
                  onChange={(e) => setRequestForm({ ...requestForm, requester_name: e.target.value })}
                  placeholder="Votre nom et prénom"
                  required
                />
              </div>
              <div>
                <Label htmlFor="requester_email">Email *</Label>
                <Input
                  id="requester_email"
                  type="email"
                  value={requestForm.requester_email}
                  onChange={(e) => setRequestForm({ ...requestForm, requester_email: e.target.value })}
                  placeholder="votre.email@uclouvain.be"
                  required
                />
              </div>
            </div>

            {/* Type de modification */}
            <div>
              <Label htmlFor="modification_type">Type de modification *</Label>
              <Select 
                value={requestForm.modification_type} 
                onValueChange={(value) => setRequestForm({ ...requestForm, modification_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type de modification" />
                </SelectTrigger>
                <SelectContent>
                  {modificationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description détaillée *</Label>
              <Textarea
                id="description"
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                placeholder="Décrivez en détail la modification demandée, la justification et toute information pertinente..."
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowRequestDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createRequestMutation.isPending}>
                <Send className="h-4 w-4 mr-2" />
                {createRequestMutation.isPending ? "Envoi..." : "Envoyer la demande"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog pour demande de modification d'un cours non répertorié */}
      <Dialog open={showCustomRequestDialog} onOpenChange={setShowCustomRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Demande de modification - Cours non répertorié</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations du cours non répertorié */}
            <div className="space-y-4">
              <h4 className="font-semibold">Informations du cours concerné</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course_code">Code du cours</Label>
                  <Input
                    id="course_code"
                    value={requestForm.course_info?.code || ""}
                    onChange={(e) => setRequestForm({
                      ...requestForm,
                      course_info: { ...requestForm.course_info, code: e.target.value }
                    })}
                    placeholder="Ex: LINFO1001"
                  />
                </div>
                <div>
                  <Label htmlFor="course_faculty">Faculté</Label>
                  <Select 
                    value={requestForm.course_info?.faculty || ""} 
                    onValueChange={(value) => setRequestForm({
                      ...requestForm,
                      course_info: { ...requestForm.course_info, faculty: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une faculté" />
                    </SelectTrigger>
                    <SelectContent>
                      {facultyOptions.slice(1).map((faculty) => (
                        <SelectItem key={faculty.value} value={faculty.value}>
                          {faculty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="course_title">Titre du cours</Label>
                <Input
                  id="course_title"
                  value={requestForm.course_info?.title || ""}
                  onChange={(e) => setRequestForm({
                    ...requestForm,
                    course_info: { ...requestForm.course_info, title: e.target.value }
                  })}
                  placeholder="Titre du cours"
                />
              </div>
              <div>
                <Label htmlFor="course_description">Description du cours</Label>
                <Textarea
                  id="course_description"
                  value={requestForm.course_info?.description || ""}
                  onChange={(e) => setRequestForm({
                    ...requestForm,
                    course_info: { ...requestForm.course_info, description: e.target.value }
                  })}
                  placeholder="Description du cours concerné..."
                  rows={2}
                />
              </div>
            </div>

            {/* Informations du demandeur */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custom_requester_name">Nom complet *</Label>
                <Input
                  id="custom_requester_name"
                  value={requestForm.requester_name}
                  onChange={(e) => setRequestForm({ ...requestForm, requester_name: e.target.value })}
                  placeholder="Votre nom et prénom"
                  required
                />
              </div>
              <div>
                <Label htmlFor="custom_requester_email">Email *</Label>
                <Input
                  id="custom_requester_email"
                  type="email"
                  value={requestForm.requester_email}
                  onChange={(e) => setRequestForm({ ...requestForm, requester_email: e.target.value })}
                  placeholder="votre.email@uclouvain.be"
                  required
                />
              </div>
            </div>

            {/* Type de modification */}
            <div>
              <Label htmlFor="custom_modification_type">Type de modification *</Label>
              <Select 
                value={requestForm.modification_type} 
                onValueChange={(value) => setRequestForm({ ...requestForm, modification_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type de modification" />
                </SelectTrigger>
                <SelectContent>
                  {modificationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="custom_description">Description détaillée *</Label>
              <Textarea
                id="custom_description"
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                placeholder="Décrivez en détail la modification demandée, la justification et toute information pertinente..."
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCustomRequestDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createRequestMutation.isPending}>
                <Send className="h-4 w-4 mr-2" />
                {createRequestMutation.isPending ? "Envoi..." : "Envoyer la demande"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModificationRequests; 