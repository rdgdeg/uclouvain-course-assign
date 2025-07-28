import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Edit, Eye, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourseWithProposals {
  id: number;
  title: string;
  code: string;
  faculty: string;
  subcategory?: string;
  volume_total_vol1: number;
  volume_total_vol2: number;
  vacant: boolean;
  assignments: any[];
  proposals: any[];
}

export const CourseProposalManagement = () => {
  const [selectedCourse, setSelectedCourse] = useState<CourseWithProposals | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les cours avec propositions et attributions
  const { data: coursesWithProposals = [], isLoading } = useQuery({
    queryKey: ['courses-with-proposals'],
    queryFn: async () => {
      // Récupérer tous les cours
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('title');
      
      if (coursesError) throw coursesError;

      // Récupérer les propositions
      const { data: proposals, error: proposalsError } = await supabase
        .from('assignment_proposals')
        .select('*')
        .order('submission_date', { ascending: false });
      
      if (proposalsError) throw proposalsError;

      // Récupérer les attributions avec enseignants
      const { data: assignments, error: assignmentsError } = await supabase
        .from('course_assignments')
        .select(`
          *,
          teacher:teachers(*)
        `);
      
      if (assignmentsError) throw assignmentsError;

      // Combiner les données
      const coursesWithData = courses.map(course => ({
        ...course,
        proposals: proposals.filter(p => p.course_id === course.id),
        assignments: assignments.filter(a => a.course_id === course.id)
      }));

      // Filtrer seulement les cours qui ont des propositions OU des attributions
      return coursesWithData.filter(course => 
        course.proposals.length > 0 || course.assignments.length > 0
      );
    }
  });

  // Récupérer les enseignants
  const { data: allTeachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('last_name');
      if (error) throw error;
      return data;
    }
  });

  // Mutation pour sauvegarder les modifications
  const saveAssignmentsMutation = useMutation({
    mutationFn: async ({ courseId, newAssignments }: { courseId: number; newAssignments: any[] }) => {
      // Supprimer les anciennes attributions
      await supabase
        .from('course_assignments')
        .delete()
        .eq('course_id', courseId);

      // Insérer les nouvelles attributions
      if (newAssignments.length > 0) {
        const assignmentsToInsert = newAssignments.map(assignment => ({
          course_id: courseId,
          teacher_id: assignment.teacher_id,
          is_coordinator: assignment.is_coordinator,
          vol1_hours: assignment.vol1_hours,
          vol2_hours: assignment.vol2_hours,
          validated_by_coord: assignment.validated_by_coord || false
        }));

        const { error } = await supabase
          .from('course_assignments')
          .insert(assignmentsToInsert);
        
        if (error) throw error;
      }

      // Mettre à jour le statut vacant du cours
      await supabase
        .from('courses')
        .update({ vacant: newAssignments.length === 0 })
        .eq('id', courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses-with-proposals'] });
      setShowEditDialog(false);
      toast({
        title: "Succès",
        description: "Attributions mises à jour avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive",
      });
    }
  });

  const openEditDialog = (course: CourseWithProposals) => {
    setSelectedCourse(course);
    setAssignments([...course.assignments]);
    setTeachers(allTeachers);
    setShowEditDialog(true);
  };

  const addTeacher = (teacherId: number) => {
    const teacher = allTeachers.find(t => t.id === teacherId);
    if (!teacher || assignments.some(a => a.teacher_id === teacherId)) return;

    const newAssignment = {
      id: Date.now(),
      teacher_id: teacherId,
      teacher,
      is_coordinator: false,
      vol1_hours: 0,
      vol2_hours: 0,
      validated_by_coord: false
    };

    setAssignments(prev => [...prev, newAssignment]);
  };

  const updateAssignment = (index: number, field: string, value: any) => {
    setAssignments(prev => prev.map((assignment, i) => 
      i === index ? { ...assignment, [field]: value } : assignment
    ));
  };

  const removeAssignment = (index: number) => {
    setAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!selectedCourse) return;
    
    saveAssignmentsMutation.mutate({
      courseId: selectedCourse.id,
      newAssignments: assignments
    });
  };

  const filteredCourses = coursesWithProposals.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "with-proposals" && course.proposals.length > 0) ||
      (statusFilter === "with-assignments" && course.assignments.length > 0) ||
      (statusFilter === "pending-proposals" && course.proposals.some(p => p.status === 'pending'));

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (course: CourseWithProposals) => {
    if (course.proposals.some(p => p.status === 'pending')) {
      return <Badge className="bg-orange-100 text-orange-800">Proposition en attente</Badge>;
    }
    if (course.assignments.length > 0) {
      return <Badge className="bg-green-100 text-green-800">Attribué</Badge>;
    }
    if (course.proposals.length > 0) {
      return <Badge className="bg-blue-100 text-blue-800">Proposition traitée</Badge>;
    }
    return null;
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Cours avec Propositions/Attributions</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="with-proposals">Avec propositions</SelectItem>
              <SelectItem value="with-assignments">Avec attributions</SelectItem>
              <SelectItem value="pending-proposals">Propositions en attente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredCourses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {course.code} - {course.faculty}
                    {course.subcategory && ` / ${course.subcategory}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vol.1: {course.volume_total_vol1}h | Vol.2: {course.volume_total_vol2}h
                  </p>
                </div>
                {getStatusIcon(course)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Propositions */}
                {course.proposals.length > 0 && (
                  <div>
                    <Label className="font-medium">Propositions ({course.proposals.length})</Label>
                    <div className="space-y-2 mt-2">
                      {course.proposals.map((proposal) => (
                        <div key={proposal.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <span className="text-sm font-medium">{proposal.submitter_name}</span>
                            <Badge className="ml-2" variant="outline">
                              {proposal.status === 'pending' && 'En attente'}
                              {proposal.status === 'approved' && 'Approuvée'}
                              {proposal.status === 'rejected' && 'Rejetée'}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(proposal.submission_date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attributions actuelles */}
                {course.assignments.length > 0 && (
                  <div>
                    <Label className="font-medium">Équipe attribuée ({course.assignments.length})</Label>
                    <div className="space-y-2 mt-2">
                      {course.assignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <div>
                            <span className="text-sm font-medium">
                              {assignment.teacher.first_name} {assignment.teacher.last_name}
                            </span>
                            {assignment.is_coordinator && (
                              <Badge className="ml-2" variant="secondary">Coordinateur</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Vol.1: {assignment.vol1_hours}h | Vol.2: {assignment.vol2_hours}h
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(course)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier attributions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground">
            Aucun cours trouvé
          </p>
          <p className="text-muted-foreground">
            Aucun cours avec propositions ou attributions ne correspond aux critères.
          </p>
        </div>
      )}

      {/* Dialog d'édition */}
      {selectedCourse && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Modifier les attributions - {selectedCourse.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Équipe actuelle */}
              <div>
                <Label className="text-lg">Équipe pédagogique</Label>
                <div className="space-y-3 mt-2">
                  {assignments.map((assignment, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Badge variant="outline">
                          {assignment.teacher.first_name} {assignment.teacher.last_name}
                        </Badge>
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
                        variant="outline"
                        size="sm"
                        onClick={() => removeAssignment(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ajouter un enseignant */}
              <div>
                <Label className="text-lg">Ajouter un enseignant</Label>
                <Select onValueChange={(value) => addTeacher(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un enseignant" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTeachers
                      .filter(teacher => !assignments.some(a => a.teacher_id === teacher.id))
                      .map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                          {teacher.first_name} {teacher.last_name} ({teacher.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saveAssignmentsMutation.isPending}
                >
                  {saveAssignmentsMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};