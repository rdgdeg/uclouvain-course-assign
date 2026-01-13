import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, CheckCircle, AlertTriangle, Users, BookOpen, Edit } from "lucide-react";
import { Course, Teacher } from "@/types";

interface TeamMember {
  teacher_id?: number;
  nom: string;
  prenom: string;
  email: string;
  status?: string;
  vol1: number;
  vol2: number;
  is_coordinator: boolean;
}

const TeamApplication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [showNewTeacherDialog, setShowNewTeacherDialog] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    first_name: "",
    last_name: "",
    email: "",
    status: ""
  });
  const [existingProposal, setExistingProposal] = useState<any>(null);

  // Charger les cours
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('title');
      if (error) throw error;
      return data as Course[];
    }
  });

  // Charger les enseignants
  const { data: teachers = [], refetch: refetchTeachers } = useQuery({
    queryKey: ['teachers-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('last_name');
      if (error) throw error;
      return data as Teacher[];
    }
  });

  // Charger les statuts d'enseignants
  const { data: teacherStatuses = [] } = useQuery({
    queryKey: ['teacher-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_statuses')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Charger la proposition existante pour le cours sélectionné
  useEffect(() => {
    if (selectedCourseId) {
      const loadExistingProposal = async () => {
        const { data, error } = await supabase
          .from('assignment_proposals')
          .select('*')
          .eq('course_id', selectedCourseId)
          .eq('status', 'pending')
          .order('submission_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading proposal:', error);
          return;
        }

        if (data) {
          setExistingProposal(data);
          // Charger l'équipe existante
          if (data.proposal_data?.assignments) {
            const members: TeamMember[] = data.proposal_data.assignments.map((a: any) => ({
              teacher_id: a.teacher_id,
              nom: a.teacher_name?.split(' ').slice(1).join(' ') || '',
              prenom: a.teacher_name?.split(' ')[0] || '',
              email: a.teacher_email || '',
              status: a.status || '',
              vol1: a.vol1_hours || a.vol1 || 0,
              vol2: a.vol2_hours || a.vol2 || 0,
              is_coordinator: a.is_coordinator || false
            }));
            setTeamMembers(members);
          }
        } else {
          setExistingProposal(null);
          setTeamMembers([]);
        }
      };

      loadExistingProposal();
    } else {
      setExistingProposal(null);
      setTeamMembers([]);
    }
  }, [selectedCourseId]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // Filtrer les cours par faculté
  const filteredCourses = facultyFilter === "all" 
    ? courses 
    : courses.filter(c => c.faculty === facultyFilter);

  // Obtenir les facultés uniques
  const faculties = Array.from(new Set(courses.map(c => c.faculty).filter(Boolean))).sort();

  // Calculer les totaux
  const totalVol1 = teamMembers.reduce((sum, member) => sum + (member.vol1 || 0), 0);
  const totalVol2 = teamMembers.reduce((sum, member) => sum + (member.vol2 || 0), 0);

  // Vérifier si les volumes correspondent
  const volumesMatch = selectedCourse 
    ? totalVol1 === (selectedCourse.volume_total_vol1 || 0) && 
      totalVol2 === (selectedCourse.volume_total_vol2 || 0)
    : false;

  // Vérifier qu'il y a un coordinateur
  const hasCoordinator = teamMembers.some(m => m.is_coordinator);

  // Ajouter un enseignant depuis la liste
  const addTeacherFromList = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    // Vérifier si l'enseignant n'est pas déjà dans l'équipe
    if (teamMembers.some(m => m.teacher_id === teacherId)) {
      toast({
        title: "Enseignant déjà ajouté",
        description: "Cet enseignant fait déjà partie de l'équipe.",
        variant: "destructive",
      });
      return;
    }

    setTeamMembers([...teamMembers, {
      teacher_id: teacher.id,
      nom: teacher.last_name,
      prenom: teacher.first_name,
      email: teacher.email,
      status: teacher.status || '',
      vol1: 0,
      vol2: 0,
      is_coordinator: false
    }]);
  };

  // Ajouter un nouveau membre (nouvel enseignant)
  const addNewMember = () => {
    setShowNewTeacherDialog(true);
  };

  // Créer un nouvel enseignant et l'ajouter à l'équipe
  const createAndAddTeacher = useMutation({
    mutationFn: async () => {
      if (!newTeacher.first_name || !newTeacher.last_name || !newTeacher.email) {
        throw new Error("Veuillez remplir tous les champs");
      }

      const { data, error } = await supabase
        .from('teachers')
        .insert([{
          first_name: newTeacher.first_name,
          last_name: newTeacher.last_name,
          email: newTeacher.email,
          status: newTeacher.status || null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newTeacherData) => {
      // Ajouter à l'équipe
      setTeamMembers([...teamMembers, {
        teacher_id: newTeacherData.id,
        nom: newTeacherData.last_name,
        prenom: newTeacherData.first_name,
        email: newTeacherData.email,
        status: newTeacherData.status || '',
        vol1: 0,
        vol2: 0,
        is_coordinator: false
      }]);
      
      // Réinitialiser et fermer
      setNewTeacher({ first_name: "", last_name: "", email: "", status: "" });
      setShowNewTeacherDialog(false);
      refetchTeachers();
      
      toast({
        title: "Enseignant ajouté",
        description: "L'enseignant a été créé et ajouté à l'équipe.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'enseignant.",
        variant: "destructive",
      });
    }
  });

  // Mettre à jour un membre
  const updateMember = (index: number, field: keyof TeamMember, value: string | number | boolean) => {
    setTeamMembers(prev => prev.map((member, i) => {
      if (i === index) {
        // Si on définit un nouveau coordinateur, retirer le statut des autres
        if (field === 'is_coordinator' && value === true) {
          return { ...member, [field]: value };
        }
        return { ...member, [field]: value };
      }
      // Retirer le statut de coordinateur des autres si on en définit un nouveau
      if (field === 'is_coordinator' && value === true && member.is_coordinator) {
        return { ...member, is_coordinator: false };
      }
      return member;
    }));
  };

  // Supprimer un membre
  const removeMember = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  // Soumettre la candidature
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCourseId || !selectedCourse) {
        throw new Error("Veuillez sélectionner un cours");
      }

      if (teamMembers.length === 0) {
        throw new Error("Veuillez ajouter au moins un membre à l'équipe");
      }

      if (!hasCoordinator) {
        throw new Error("Veuillez désigner un coordinateur");
      }

      if (!volumesMatch) {
        throw new Error("Les volumes horaires ne correspondent pas au volume du cours");
      }

      if (!submitterName || !submitterEmail) {
        throw new Error("Veuillez renseigner vos coordonnées");
      }

      // Préparer les données de la proposition
      const assignments = teamMembers.map(member => ({
        teacher_id: member.teacher_id,
        teacher_name: `${member.prenom} ${member.nom}`,
        teacher_email: member.email,
        is_coordinator: member.is_coordinator,
        vol1_hours: member.vol1,
        vol2_hours: member.vol2,
        status: member.status
      }));

      const proposalData = {
        assignments,
        additional_notes: "",
        ignore_volume_warning: false,
        total_vol1: totalVol1,
        total_vol2: totalVol2,
        submission_timestamp: new Date().toISOString()
      };

      // Si une proposition existe déjà, la mettre à jour
      if (existingProposal) {
        const { data, error } = await supabase
          .from('assignment_proposals')
          .update({
            submitter_name: submitterName,
            submitter_email: submitterEmail,
            proposal_data: proposalData as any,
            submission_date: new Date().toISOString()
          })
          .eq('id', existingProposal.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Créer une nouvelle proposition
        const { data, error } = await supabase
          .from('assignment_proposals')
          .insert([{
            course_id: selectedCourseId,
            submitter_name: submitterName,
            submitter_email: submitterEmail,
            proposal_data: proposalData as any,
            status: 'pending',
            submission_date: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: existingProposal ? "Équipe mise à jour" : "Candidature envoyée",
        description: existingProposal 
          ? "L'équipe a été mise à jour avec succès."
          : "Votre candidature a été enregistrée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['assignment-proposals'] });
      // Ne pas réinitialiser, permettre de continuer à modifier
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer la candidature.",
        variant: "destructive",
      });
    }
  });

  // Enseignants disponibles (pas encore dans l'équipe)
  const availableTeachers = teachers.filter(teacher => 
    !teamMembers.some(member => member.teacher_id === teacher.id)
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Gestion d'équipe pour un cours
          </h1>
          <p className="text-muted-foreground">
            Sélectionnez un cours et gérez l'équipe pédagogique
          </p>
        </div>

        {/* Informations du soumissionnaire */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vos coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="submitter_name">Nom complet *</Label>
                <Input
                  id="submitter_name"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="Votre nom et prénom"
                  required
                />
              </div>
              <div>
                <Label htmlFor="submitter_email">Email *</Label>
                <Input
                  id="submitter_email"
                  type="email"
                  value={submitterEmail}
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                  placeholder="votre.email@uclouvain.be"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sélection du cours */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Sélectionner un cours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Filtrer par faculté</Label>
              <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les facultés" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les facultés</SelectItem>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty} value={faculty || ""}>
                      {faculty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {coursesLoading ? (
              <div className="text-center py-8">Chargement des cours...</div>
            ) : (
              <div>
                <Label>Cours</Label>
                <Select 
                  value={selectedCourseId?.toString() || ""} 
                  onValueChange={(value) => setSelectedCourseId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un cours" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCourses.map(course => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title} {course.code && `(${course.code})`}
                        {course.faculty && ` - ${course.faculty}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedCourse && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900">{selectedCourse.title}</h3>
                    {selectedCourse.code && (
                      <p className="text-sm text-blue-700">Code: {selectedCourse.code}</p>
                    )}
                    {selectedCourse.faculty && (
                      <p className="text-sm text-blue-700">Faculté: {selectedCourse.faculty}</p>
                    )}
                    <div className="mt-2 flex gap-4">
                      <div>
                        <span className="text-sm font-medium text-blue-700">Volume Vol.1: </span>
                        <span className="text-sm font-bold text-blue-900">
                          {selectedCourse.volume_total_vol1 || 0}h
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-700">Volume Vol.2: </span>
                        <span className="text-sm font-bold text-blue-900">
                          {selectedCourse.volume_total_vol2 || 0}h
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {existingProposal && (
                  <div className="mt-3 pt-3 border-t border-blue-300">
                    <Badge variant="outline" className="bg-yellow-50">
                      <Edit className="h-3 w-3 mr-1" />
                      Équipe existante - Vous pouvez modifier
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Composition de l'équipe */}
        {selectedCourse && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>2. Composition de l'équipe</CardTitle>
                <div className="flex gap-2">
                  {availableTeachers.length > 0 && (
                    <Select onValueChange={(value) => addTeacherFromList(parseInt(value))}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Ajouter un enseignant" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTeachers.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.first_name} {teacher.last_name} ({teacher.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewMember}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvel enseignant
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun membre ajouté. Ajoutez des enseignants pour commencer.</p>
                </div>
              ) : (
                <>
                  {teamMembers.map((member, index) => (
                    <Card key={index} className="border-2">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label>Prénom *</Label>
                            <Input
                              value={member.prenom}
                              onChange={(e) => updateMember(index, 'prenom', e.target.value)}
                              placeholder="Prénom"
                              required
                            />
                          </div>
                          <div>
                            <Label>Nom *</Label>
                            <Input
                              value={member.nom}
                              onChange={(e) => updateMember(index, 'nom', e.target.value)}
                              placeholder="Nom"
                              required
                            />
                          </div>
                          <div>
                            <Label>Email *</Label>
                            <Input
                              type="email"
                              value={member.email}
                              onChange={(e) => updateMember(index, 'email', e.target.value)}
                              placeholder="email@uclouvain.be"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label>Volume Vol.1 (heures) *</Label>
                            <Input
                              type="number"
                              min="0"
                              value={member.vol1 || ""}
                              onChange={(e) => updateMember(index, 'vol1', parseFloat(e.target.value) || 0)}
                              required
                            />
                          </div>
                          <div>
                            <Label>Volume Vol.2 (heures) *</Label>
                            <Input
                              type="number"
                              min="0"
                              value={member.vol2 || ""}
                              onChange={(e) => updateMember(index, 'vol2', parseFloat(e.target.value) || 0)}
                              required
                            />
                          </div>
                          <div className="flex items-end gap-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={member.is_coordinator}
                                onChange={(e) => updateMember(index, 'is_coordinator', e.target.checked)}
                                className="w-4 h-4"
                              />
                              <Label>Coordinateur</Label>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMember(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {member.is_coordinator && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Coordinateur
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {/* Résumé des volumes */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                    <h3 className="font-semibold mb-3">Résumé des volumes</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Total Vol.1 proposé:</span>
                          <span className={`font-bold ${volumesMatch ? 'text-green-600' : 'text-red-600'}`}>
                            {totalVol1}h
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Requis:</span>
                          <span className="text-sm font-medium">
                            {selectedCourse.volume_total_vol1 || 0}h
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Total Vol.2 proposé:</span>
                          <span className={`font-bold ${volumesMatch ? 'text-green-600' : 'text-red-600'}`}>
                            {totalVol2}h
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Requis:</span>
                          <span className="text-sm font-medium">
                            {selectedCourse.volume_total_vol2 || 0}h
                          </span>
                        </div>
                      </div>
                    </div>
                    {volumesMatch ? (
                      <Alert className="mt-4 bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Les volumes horaires correspondent au volume du cours.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="mt-4 bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Les volumes horaires ne correspondent pas. Veuillez ajuster les volumes pour qu'ils correspondent exactement au volume du cours.
                        </AlertDescription>
                      </Alert>
                    )}
                    {!hasCoordinator && teamMembers.length > 0 && (
                      <Alert className="mt-4 bg-orange-50 border-orange-200">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          Veuillez désigner un coordinateur pour l'équipe.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bouton de soumission */}
        {selectedCourse && teamMembers.length > 0 && (
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Annuler
            </Button>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || !volumesMatch || !hasCoordinator}
              className="min-w-[200px]"
            >
              {submitMutation.isPending 
                ? "Envoi en cours..." 
                : existingProposal 
                  ? "Mettre à jour l'équipe" 
                  : "Enregistrer l'équipe"}
            </Button>
          </div>
        )}

        {/* Dialog pour ajouter un nouvel enseignant */}
        <Dialog open={showNewTeacherDialog} onOpenChange={setShowNewTeacherDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel enseignant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Prénom *</Label>
                <Input
                  value={newTeacher.first_name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, first_name: e.target.value })}
                  placeholder="Prénom"
                />
              </div>
              <div>
                <Label>Nom *</Label>
                <Input
                  value={newTeacher.last_name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, last_name: e.target.value })}
                  placeholder="Nom"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  placeholder="email@uclouvain.be"
                />
              </div>
              <div>
                <Label>Fonction / Statut</Label>
                <Select 
                  value={newTeacher.status} 
                  onValueChange={(value) => setNewTeacher({ ...newTeacher, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une fonction" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.name}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewTeacherDialog(false);
                    setNewTeacher({ first_name: "", last_name: "", email: "", status: "" });
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => createAndAddTeacher.mutate()}
                  disabled={createAndAddTeacher.isPending}
                >
                  {createAndAddTeacher.isPending ? "Création..." : "Créer et ajouter"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default TeamApplication;
