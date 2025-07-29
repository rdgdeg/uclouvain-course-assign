import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus, Search, AlertTriangle, Send, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmail } from "@/hooks/useEmail";
import { Teacher, Course } from "@/hooks/useCourses";
import type { TeacherAssignment, ProposalData } from "@/types";

interface AssignmentProposalFormProps {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AssignmentProposalForm = ({ 
  course, 
  open, 
  onOpenChange, 
  onSuccess 
}: AssignmentProposalFormProps) => {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [ignoreVolumeWarning, setIgnoreVolumeWarning] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    first_name: "",
    last_name: "",
    email: "",
    status: ""
  });
  const [showNewTeacherForm, setShowNewTeacherForm] = useState(false);
  const { toast } = useToast();
  const { sendTeamProposalConfirmation, isSending } = useEmail();

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

  useEffect(() => {
    if (open) {
      setAssignments([]);
      setSubmitterName("");
      setSubmitterEmail("");
      setAdditionalNotes("");
      setIgnoreVolumeWarning(false);
      fetchTeachers();
    }
  }, [open]);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('last_name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const submitProposalMutation = useMutation({
    mutationFn: async (proposalData: {
      course_id: number;
      submitter_name: string;
      submitter_email: string;
      proposal_data: ProposalData;
    }) => {
      const { data, error } = await supabase
        .from('assignment_proposals')
        .insert([{
          course_id: proposalData.course_id,
          submitter_name: proposalData.submitter_name,
          submitter_email: proposalData.submitter_email,
          proposal_data: proposalData.proposal_data as any,
          status: 'pending',
          submission_date: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      // Envoyer l'email de confirmation
      await sendTeamProposalConfirmation(
        submitterEmail || submitterName, // Utiliser l'email si disponible, sinon le nom
        submitterName,
        course.title,
        course.code || 'N/A'
      );

      toast({
        title: "Proposition envoyée",
        description: "Votre proposition d'équipe a été envoyée avec succès. Le cours ne sera plus visible dans la liste des cours vacants.",
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la proposition. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  });

  const addNewTeacher = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .insert([newTeacher])
        .select()
        .single();

      if (error) throw error;

      setTeachers(prev => [...prev, data]);
      setNewTeacher({ first_name: "", last_name: "", email: "", status: "" });
      setShowNewTeacherForm(false);
      
      toast({
        title: "Succès",
        description: "Enseignant ajouté avec succès",
      });
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'enseignant",
        variant: "destructive",
      });
    }
  };

  const addTeacherToAssignment = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const newAssignment: TeacherAssignment = {
      teacher_id: teacherId,
      teacher_name: `${teacher.first_name} ${teacher.last_name}`,
      teacher_email: teacher.email,
      is_coordinator: false,
      vol1_hours: 0,
      vol2_hours: 0,
    };

    setAssignments(prev => [...prev, newAssignment]);
  };

  const updateAssignment = (index: number, field: keyof TeacherAssignment, value: string | number | boolean) => {
    setAssignments(prev => prev.map((assignment, i) => 
      i === index ? { ...assignment, [field]: value } : assignment
    ));
  };

  const removeAssignment = (index: number) => {
    setAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const totalVol1 = assignments.reduce((sum, assignment) => sum + assignment.vol1_hours, 0);
  const totalVol2 = assignments.reduce((sum, assignment) => sum + assignment.vol2_hours, 0);
  
  const hasVolumeError = totalVol1 !== course.volume_total_vol1 || totalVol2 !== course.volume_total_vol2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submitterName || assignments.length === 0) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir le nom et ajouter au moins un enseignant.",
        variant: "destructive",
      });
      return;
    }

    if (hasVolumeError && !ignoreVolumeWarning) {
      toast({
        title: "Volume horaire incorrect",
        description: "Le volume horaire ne correspond pas au volume requis. Cochez la case pour confirmer ou corrigez les heures.",
        variant: "destructive",
      });
      return;
    }

    const proposalData = {
      assignments,
      additional_notes: additionalNotes,
      ignore_volume_warning: ignoreVolumeWarning,
      total_vol1: totalVol1,
      total_vol2: totalVol2,
      submission_timestamp: new Date().toISOString()
    };

    submitProposalMutation.mutate({
      course_id: course.id,
      submitter_name: submitterName,
      submitter_email: submitterName, // Utiliser le nom comme email temporaire
      proposal_data: proposalData
    });
  };

  const filteredTeachers = teachers.filter(teacher =>
    `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableTeachers = filteredTeachers.filter(teacher =>
    !assignments.some(assignment => assignment.teacher_id === teacher.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Proposer une équipe
          </DialogTitle>
          <p className="text-lg text-gray-600 mt-2">{course.title}</p>
          <p className="text-sm text-gray-500">Code: {course.code}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* En-tête avec informations clés */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Informations du soumissionnaire */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Soumissionnaire
                </h3>
                <div>
                  <Label htmlFor="submitter_name" className="text-sm font-medium text-gray-700">Nom complet *</Label>
                  <Input
                    id="submitter_name"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="Votre nom et prénom"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Volume requis */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Volume requis
                </h3>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Vol.1:</span>
                    <span className="text-lg font-bold text-blue-600">{course.volume_total_vol1}h</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium text-gray-600">Vol.2:</span>
                    <span className="text-lg font-bold text-green-600">{course.volume_total_vol2}h</span>
                  </div>
                </div>
              </div>

              {/* Volume proposé */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Volume proposé
                </h3>
                <div className={`p-3 rounded-lg border ${hasVolumeError ? 'bg-red-50 border-red-200' : 'bg-white border-green-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Vol.1:</span>
                    <span className={`text-lg font-bold ${hasVolumeError ? 'text-red-600' : 'text-blue-600'}`}>{totalVol1}h</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium text-gray-600">Vol.2:</span>
                    <span className={`text-lg font-bold ${hasVolumeError ? 'text-red-600' : 'text-green-600'}`}>{totalVol2}h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Équipe pédagogique proposée */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Équipe pédagogique</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{assignments.length} enseignant(s)</span>
              </div>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Aucun enseignant ajouté</p>
                <p className="text-sm text-gray-400 mt-1">Utilisez la section ci-dessous pour ajouter des enseignants</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      {/* Informations de l'enseignant */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="text-sm font-medium">
                            {assignment.teacher_name}
                          </Badge>
                          {assignment.is_coordinator && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Coordinateur
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{assignment.teacher_email}</p>
                      </div>
                      
                      {/* Volumes horaires */}
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <Label className="text-xs text-gray-500">Vol.1</Label>
                          <Input
                            type="number"
                            value={assignment.vol1_hours}
                            onChange={(e) => updateAssignment(index, 'vol1_hours', parseInt(e.target.value) || 0)}
                            className="w-16 h-8 text-center text-sm"
                            min="0"
                          />
                        </div>
                        
                        <div className="text-center">
                          <Label className="text-xs text-gray-500">Vol.2</Label>
                          <Input
                            type="number"
                            value={assignment.vol2_hours}
                            onChange={(e) => updateAssignment(index, 'vol2_hours', parseInt(e.target.value) || 0)}
                            className="w-16 h-8 text-center text-sm"
                            min="0"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={assignment.is_coordinator}
                            onCheckedChange={(checked) => updateAssignment(index, 'is_coordinator', checked)}
                          />
                          <Label className="text-xs text-gray-600">Coordinateur</Label>
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAssignment(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ajouter un enseignant */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Ajouter des enseignants</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{availableTeachers.length} enseignant(s) disponible(s)</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Barre de recherche et bouton nouvel enseignant */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un enseignant par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewTeacherForm(!showNewTeacherForm)}
                  className="h-12 px-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel enseignant
                </Button>
              </div>

              {showNewTeacherForm && (
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Prénom</Label>
                    <Input
                      value={newTeacher.first_name}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input
                      value={newTeacher.last_name}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newTeacher.email}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Select 
                      value={newTeacher.status} 
                      onValueChange={(value) => setNewTeacher(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le statut" />
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
                  <div className="col-span-2 flex gap-2">
                    <Button type="button" onClick={addNewTeacher}>Ajouter</Button>
                    <Button type="button" variant="outline" onClick={() => setShowNewTeacherForm(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              {availableTeachers.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Enseignants disponibles</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto bg-white rounded-lg border">
                    {availableTeachers.map((teacher) => (
                      <div key={teacher.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                        <div>
                          <span className="font-medium text-gray-900">{teacher.first_name} {teacher.last_name}</span>
                          <span className="text-sm text-gray-500 ml-2">({teacher.email})</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addTeacherToAssignment(teacher.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Avertissement volume horaire - après les enseignants */}
          {hasVolumeError && (
            <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-800">Volume horaire incorrect</h4>
                  <p className="text-orange-700 text-sm mt-1">
                    Le volume horaire proposé ne correspond pas exactement au volume requis. 
                    Vous pouvez tout de même envoyer votre proposition si vous n'avez pas encore 
                    la répartition horaire définitive.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Checkbox
                      id="ignore_warning"
                      checked={ignoreVolumeWarning}
                      onCheckedChange={(checked) => setIgnoreVolumeWarning(checked === true)}
                    />
                    <Label htmlFor="ignore_warning" className="text-sm text-orange-800">
                      Je ne connais pas encore la répartition horaire exacte
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes additionnelles */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Notes additionnelles</h3>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <Label htmlFor="additional_notes" className="text-sm font-medium text-gray-700">Informations complémentaires (optionnel)</Label>
              <Textarea
                id="additional_notes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Précisions sur l'organisation, contraintes particulières, informations importantes..."
                rows={4}
                className="mt-2 resize-none"
              />
            </div>
          </div>

          {/* Avertissement de soumission */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                ⚠️
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-900 text-lg mb-3">ATTENTION - Lecture obligatoire</h4>
                <div className="text-sm text-red-800 space-y-3">
                  <p className="font-medium">Avant d'envoyer, vérifiez que :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Toute l'équipe pédagogique est renseignée</li>
                    <li>Les volumes horaires sont corrects (si connus)</li>
                    <li>Les coordonnées sont exactes</li>
                  </ul>
                  <div className="bg-red-100 p-3 rounded-lg border border-red-200">
                    <p className="font-bold text-red-900">
                      ⚡ Cette proposition sera soumise pour évaluation administrative. 
                      Plusieurs équipes peuvent proposer pour le même cours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-6 py-2"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={submitProposalMutation.isPending || isSending}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 shadow-lg"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitProposalMutation.isPending || isSending ? "Envoi en cours..." : "Envoyer la proposition"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};