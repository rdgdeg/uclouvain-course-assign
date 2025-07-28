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
import { Trash2, Plus, Search, AlertTriangle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
    onSuccess: () => {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Proposer une équipe - {course.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du soumissionnaire */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations du soumissionnaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Volume totaux et validation */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label>Volume requis</Label>
              <p>Vol.1: {course.volume_total_vol1}h | Vol.2: {course.volume_total_vol2}h</p>
            </div>
            <div>
              <Label>Volume proposé</Label>
              <p className={hasVolumeError ? 'text-destructive font-medium' : 'text-green-600'}>
                Vol.1: {totalVol1}h | Vol.2: {totalVol2}h
              </p>
            </div>
          </div>

          {/* Avertissement volume horaire */}
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

          {/* Équipe pédagogique proposée */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Équipe pédagogique proposée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignments.map((assignment, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <Badge variant="outline">
                      {assignment.teacher_name}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{assignment.teacher_email}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={assignment.is_coordinator}
                      onCheckedChange={(checked) => updateAssignment(index, 'is_coordinator', checked)}
                    />
                    <Label className="text-sm">Coordinateur</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Vol.1:</Label>
                    <Input
                      type="number"
                      value={assignment.vol1_hours}
                      onChange={(e) => updateAssignment(index, 'vol1_hours', parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Vol.2:</Label>
                    <Input
                      type="number"
                      value={assignment.vol2_hours}
                      onChange={(e) => updateAssignment(index, 'vol2_hours', parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAssignment(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ajouter un enseignant */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ajouter un enseignant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un enseignant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewTeacherForm(!showNewTeacherForm)}
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
                <div className="space-y-2">
                  <Label>Enseignants disponibles</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableTeachers.map((teacher) => (
                      <div key={teacher.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <span className="font-medium">{teacher.first_name} {teacher.last_name}</span>
                          <span className="text-sm text-muted-foreground ml-2">({teacher.email})</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addTeacherToAssignment(teacher.id)}
                        >
                          Ajouter
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes additionnelles */}
          <div>
            <Label htmlFor="additional_notes">Notes additionnelles (optionnel)</Label>
            <Textarea
              id="additional_notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Informations complémentaires sur la proposition..."
              rows={3}
            />
          </div>

          {/* Avertissement de soumission */}
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="font-semibold text-red-900 mb-2">⚠️ ATTENTION - Lecture obligatoire</h4>
            <div className="text-sm text-red-800 space-y-2">
              <p className="font-medium">Avant d'envoyer, vérifiez que :</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Toute l'équipe pédagogique est renseignée</li>
                <li>Les volumes horaires sont corrects (si connus)</li>
                <li>Les coordonnées sont exactes</li>
              </ul>
              <p className="font-medium text-red-900 mt-3">
                Une fois envoyée, cette proposition fera DISPARAÎTRE le cours de la liste des cours vacants. 
                Aucune autre proposition ne pourra être soumise jusqu'à validation administrative.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitProposalMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              {submitProposalMutation.isPending ? "Envoi..." : "Envoyer la proposition"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};