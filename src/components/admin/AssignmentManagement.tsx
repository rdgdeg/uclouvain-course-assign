import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, UserPlus, Search, Trash2, Edit } from "lucide-react";
import { CourseEditDialog } from "./CourseEditDialog";

interface Course {
  id: number;
  title: string;
  code: string;
  faculty: string;
  subcategory: string;
  vacant: boolean;
  volume_total_vol1: number;
  volume_total_vol2: number;
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

interface Assignment {
  id: number;
  course_id: number;
  teacher_id: number;
  vol1_hours: number;
  vol2_hours: number;
  is_coordinator: boolean;
  validated_by_coord: boolean;
  teachers: Teacher;
  courses: Course;
}

export const AssignmentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCourseEditOpen, setIsCourseEditOpen] = useState(false);
  const [showVolumeWarning, setShowVolumeWarning] = useState(false);
  const [ignoreVolumeCheck, setIgnoreVolumeCheck] = useState(false);
  const [formData, setFormData] = useState({
    teacher_id: "",
    vol1_hours: 0,
    vol2_hours: 0,
    is_coordinator: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les cours vacants
  const { data: vacantCourses = [] } = useQuery({
    queryKey: ['vacant-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('vacant', true)
        .order('title');
      if (error) throw error;
      return data;
    }
  });

  // Récupérer les enseignants actifs (sans afficher le statut)
  const { data: teachers = [] } = useQuery({
    queryKey: ['active-teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, first_name, last_name, email')  // Retirer 'status' de la sélection
        .eq('status', 'active')
        .order('last_name');
      if (error) throw error;
      return data;
    }
  });

  // Récupérer toutes les attributions
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_assignments')
        .select(`
          *,
          teachers (
            id,
            first_name,
            last_name,
            email,
            status
          ),
          courses (
            id,
            title,
            code,
            faculty,
            vacant,
            volume_total_vol1,
            volume_total_vol2
          )
        `)
        .order('id', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (newAssignment: {
      course_id: number;
      teacher_id: number;
      vol1_hours: number;
      vol2_hours: number;
      is_coordinator: boolean;
    }) => {
      const { data, error } = await supabase
        .from('course_assignments')
        .insert([newAssignment])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      // Marquer le cours comme non vacant si c'est une attribution
      if (selectedCourse) {
        await supabase
          .from('courses')
          .update({ vacant: false })
          .eq('id', selectedCourse.id);
      }
      
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['vacant-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      
      setIsDialogOpen(false);
      setSelectedCourse(null);
      resetForm();
      
      toast({
        title: "Attribution créée",
        description: "L'enseignant a été attribué au cours avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'attribution.",
        variant: "destructive",
      });
    }
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('course_assignments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['vacant-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      
      toast({
        title: "Attribution supprimée",
        description: "L'attribution a été supprimée avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'attribution.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      teacher_id: "",
      vol1_hours: 0,
      vol2_hours: 0,
      is_coordinator: false
    });
    setShowVolumeWarning(false);
    setIgnoreVolumeCheck(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !formData.teacher_id) return;

    // Vérifier la cohérence des volumes
    const totalAssigned = formData.vol1_hours + formData.vol2_hours;
    const totalExpected = selectedCourse.volume_total_vol1 + selectedCourse.volume_total_vol2;
    
    if (!ignoreVolumeCheck && totalAssigned !== totalExpected) {
      setShowVolumeWarning(true);
      return;
    }

    // Afficher un message de confirmation avant la sauvegarde
    const confirmMessage = `Cette attribution va être sauvegardée et le cours "${selectedCourse.title}" ne sera plus visible dans la liste des cours vacants.\n\nVoulez-vous continuer ?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    createAssignmentMutation.mutate({
      course_id: selectedCourse.id,
      teacher_id: parseInt(formData.teacher_id),
      vol1_hours: formData.vol1_hours,
      vol2_hours: formData.vol2_hours,
      is_coordinator: formData.is_coordinator
    });
  };

  const handleCreateAssignment = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      ...formData,
      vol1_hours: course.volume_total_vol1,
      vol2_hours: course.volume_total_vol2
    });
    setShowVolumeWarning(false);
    setIgnoreVolumeCheck(false);
    setIsDialogOpen(true);
  };

  const handleDeleteAssignment = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette attribution ?")) {
      deleteAssignmentMutation.mutate(id);
    }
  };

  const filteredVacantCourses = vacantCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.faculty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignments = assignments.filter(assignment =>
    assignment.courses?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.courses?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${assignment.teachers?.first_name} ${assignment.teachers?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un cours ou un enseignant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Cours vacants */}
      <Card>
        <CardHeader>
          <CardTitle>Cours Vacants ({filteredVacantCourses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVacantCourses.length === 0 ? (
            <p className="text-muted-foreground">Aucun cours vacant trouvé.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cours</TableHead>
                  <TableHead>Faculté</TableHead>
                  <TableHead>Vol.1</TableHead>
                  <TableHead>Vol.2</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVacantCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">{course.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>{course.faculty}</TableCell>
                    <TableCell>{course.volume_total_vol1}h</TableCell>
                    <TableCell>{course.volume_total_vol2}h</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCourse(course);
                            setIsCourseEditOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCreateAssignment(course)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Attribuer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Attributions existantes */}
      <Card>
        <CardHeader>
          <CardTitle>Attributions Existantes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cours</TableHead>
                  <TableHead>Enseignant</TableHead>
                  <TableHead>Vol.1</TableHead>
                  <TableHead>Vol.2</TableHead>
                  <TableHead>Coordinateur</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.courses?.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.courses?.code} - {assignment.courses?.faculty}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {assignment.teachers?.first_name} {assignment.teachers?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.teachers?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{assignment.vol1_hours}h</TableCell>
                    <TableCell>{assignment.vol2_hours}h</TableCell>
                    <TableCell>
                      {assignment.is_coordinator && (
                        <Badge variant="default">Coordinateur</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'attribution */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attribuer un enseignant</DialogTitle>
          </DialogHeader>
          
          {selectedCourse && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Cours sélectionné</Label>
                <p className="font-medium">{selectedCourse.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCourse.code} - {selectedCourse.faculty}
                </p>
              </div>

              <div>
                <Label htmlFor="teacher">Enseignant</Label>
                <Select value={formData.teacher_id} onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un enseignant" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.first_name} {teacher.last_name} ({teacher.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vol1_hours">Volume 1 (heures)</Label>
                  <Input
                    id="vol1_hours"
                    type="number"
                    value={formData.vol1_hours}
                    onChange={(e) => {
                      setFormData({ ...formData, vol1_hours: parseInt(e.target.value) || 0 });
                      setShowVolumeWarning(false);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="vol2_hours">Volume 2 (heures)</Label>
                  <Input
                    id="vol2_hours"
                    type="number"
                    value={formData.vol2_hours}
                    onChange={(e) => {
                      setFormData({ ...formData, vol2_hours: parseInt(e.target.value) || 0 });
                      setShowVolumeWarning(false);
                    }}
                  />
                </div>
              </div>

              {/* Avertissement volume */}
              {showVolumeWarning && (
                <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-orange-800">
                        Volume horaire incohérent
                      </h3>
                      <div className="mt-2 text-sm text-orange-700">
                        <p>
                          Le volume attribué ({formData.vol1_hours + formData.vol2_hours}h) ne correspond pas au volume total du cours ({selectedCourse?.volume_total_vol1 + selectedCourse?.volume_total_vol2}h).
                        </p>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center">
                          <Checkbox
                            id="ignore-volume"
                            checked={ignoreVolumeCheck}
                            onCheckedChange={(checked) => setIgnoreVolumeCheck(checked as boolean)}
                          />
                          <Label htmlFor="ignore-volume" className="ml-2 text-sm text-orange-700">
                            Je ne connais pas encore la répartition horaire exacte
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_coordinator"
                  checked={formData.is_coordinator}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_coordinator: checked as boolean })}
                />
                <Label htmlFor="is_coordinator">Coordinateur du cours</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Attribuer
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition de cours */}
      <CourseEditDialog
        course={editingCourse}
        isOpen={isCourseEditOpen}
        onClose={() => {
          setIsCourseEditOpen(false);
          setEditingCourse(null);
        }}
      />
    </div>
  );
};