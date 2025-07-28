import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Search } from "lucide-react";
import { Course, Teacher, CourseAssignment } from "@/hooks/useCourses";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CourseManagementDialogProps {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const CourseManagementDialog = ({ 
  course, 
  open, 
  onOpenChange, 
  onUpdate 
}: CourseManagementDialogProps) => {
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTeacher, setNewTeacher] = useState({
    first_name: "",
    last_name: "",
    email: "",
    status: ""
  });
  const [showNewTeacherForm, setShowNewTeacherForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setAssignments([...course.assignments]);
      fetchTeachers();
    }
  }, [open, course]);

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

    const newAssignment: CourseAssignment = {
      id: Date.now(), // temporary ID
      teacher_id: teacherId,
      is_coordinator: false,
      vol1_hours: 0,
      vol2_hours: 0,
      validated_by_coord: false,
      teacher
    };

    setAssignments(prev => [...prev, newAssignment]);
  };

  const updateAssignment = (index: number, field: keyof CourseAssignment, value: any) => {
    setAssignments(prev => prev.map((assignment, i) => 
      i === index ? { ...assignment, [field]: value } : assignment
    ));
  };

  const removeAssignment = (index: number) => {
    setAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const saveAssignments = async () => {
    try {
      // Delete existing assignments
      await supabase
        .from('course_assignments')
        .delete()
        .eq('course_id', course.id);

      // Insert new assignments
      const assignmentsToInsert = assignments.map(assignment => ({
        course_id: course.id,
        teacher_id: assignment.teacher_id,
        is_coordinator: assignment.is_coordinator,
        vol1_hours: assignment.vol1_hours,
        vol2_hours: assignment.vol2_hours,
        validated_by_coord: assignment.validated_by_coord
      }));

      if (assignmentsToInsert.length > 0) {
        const { error } = await supabase
          .from('course_assignments')
          .insert(assignmentsToInsert);

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Attributions mises à jour avec succès",
      });

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving assignments:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les attributions",
        variant: "destructive",
      });
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableTeachers = filteredTeachers.filter(teacher =>
    !assignments.some(assignment => assignment.teacher_id === teacher.id)
  );

  const totalVol1 = assignments.reduce((sum, assignment) => sum + assignment.vol1_hours, 0);
  const totalVol2 = assignments.reduce((sum, assignment) => sum + assignment.vol2_hours, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestion des attributions - {course.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Volume totals and validation */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label>Volume requis</Label>
              <p>Vol.1: {course.volume_total_vol1}h | Vol.2: {course.volume_total_vol2}h</p>
            </div>
            <div>
              <Label>Volume attribué</Label>
              <p className={`${totalVol1 === course.volume_total_vol1 && totalVol2 === course.volume_total_vol2 ? 'text-green-600' : 'text-red-600'}`}>
                Vol.1: {totalVol1}h | Vol.2: {totalVol2}h
              </p>
            </div>
          </div>

          {/* Current assignments */}
          <div>
            <Label className="text-lg">Équipe pédagogique actuelle</Label>
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

          {/* Add teacher section */}
          <div>
            <Label className="text-lg">Ajouter un enseignant</Label>
            
            <div className="mt-2 space-y-3">
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
                    <Input
                      value={newTeacher.status}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, status: e.target.value }))}
                      placeholder="Professeur, Docteur, etc."
                    />
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <Button onClick={addNewTeacher}>Ajouter</Button>
                    <Button variant="outline" onClick={() => setShowNewTeacherForm(false)}>
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
                          {teacher.status && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {teacher.status}
                            </Badge>
                          )}
                        </div>
                        <Button
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
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={saveAssignments}>
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};