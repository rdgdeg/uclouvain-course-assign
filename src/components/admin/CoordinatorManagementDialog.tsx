import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Edit, Trash2, Mail, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface CoordinatorManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Coordinator {
  id: string;
  course_id: number;
  teacher_id: number;
  email: string;
  name: string;
  is_primary: boolean;
  course?: {
    title: string;
    code: string;
  };
  teacher?: {
    first_name: string;
    last_name: string;
  };
}

interface Course {
  id: number;
  title: string;
  code: string;
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export const CoordinatorManagementDialog: React.FC<CoordinatorManagementDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Formulaire
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(true);
  const [editingCoordinator, setEditingCoordinator] = useState<Coordinator | null>(null);
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);

      // Charger les coordinateurs avec leurs relations
      const { data: coordinatorsData, error: coordError } = await supabase
        .from('course_coordinators')
        .select(`
          *,
          course:courses(title, code),
          teacher:teachers(first_name, last_name)
        `)
        .order('name');

      if (coordError) throw coordError;

      // Charger les cours
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, code')
        .order('title');

      if (coursesError) throw coursesError;

      // Charger les enseignants
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('id, first_name, last_name, email')
        .order('last_name');

      if (teachersError) throw teachersError;

      setCoordinators(coordinatorsData || []);
      setCourses(coursesData || []);
      setTeachers(teachersData || []);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCourse('');
    setSelectedTeacher('');
    setManualName('');
    setManualEmail('');
    setIsPrimary(true);
    setEditingCoordinator(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      let coordinatorData: any = {
        is_primary: isPrimary
      };

      if (selectedCourse) {
        coordinatorData.course_id = parseInt(selectedCourse);
      }

      if (selectedTeacher) {
        const teacher = teachers.find(t => t.id === parseInt(selectedTeacher));
        if (teacher) {
          coordinatorData.teacher_id = teacher.id;
          coordinatorData.name = `${teacher.first_name} ${teacher.last_name}`;
          coordinatorData.email = teacher.email;
        }
      } else if (manualName && manualEmail) {
        coordinatorData.name = manualName;
        coordinatorData.email = manualEmail;
      } else {
        throw new Error('Veuillez sélectionner un enseignant ou saisir les informations manuellement');
      }

      if (editingCoordinator) {
        // Mise à jour
        const { error } = await supabase
          .from('course_coordinators')
          .update(coordinatorData)
          .eq('id', editingCoordinator.id);

        if (error) throw error;

        toast({
          title: "Coordinateur mis à jour",
          description: "Les informations ont été sauvegardées.",
        });
      } else {
        // Création
        const { error } = await supabase
          .from('course_coordinators')
          .insert(coordinatorData);

        if (error) throw error;

        toast({
          title: "Coordinateur ajouté",
          description: "Le coordinateur a été créé avec succès.",
        });
      }

      resetForm();
      fetchData();
      onSuccess?.();

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coordinator: Coordinator) => {
    setEditingCoordinator(coordinator);
    setSelectedCourse(coordinator.course_id.toString());
    setSelectedTeacher(coordinator.teacher_id?.toString() || '');
    setManualName(coordinator.name);
    setManualEmail(coordinator.email);
    setIsPrimary(coordinator.is_primary);
  };

  const handleDelete = async (coordinatorId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce coordinateur ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('course_coordinators')
        .delete()
        .eq('id', coordinatorId);

      if (error) throw error;

      toast({
        title: "Coordinateur supprimé",
        description: "Le coordinateur a été supprimé avec succès.",
      });

      fetchData();
      onSuccess?.();

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le coordinateur.",
        variant: "destructive",
      });
    }
  };

  const filteredCoordinators = coordinators.filter(coord =>
    coord.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coord.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coord.course?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coord.course?.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des coordinateurs
          </DialogTitle>
          <DialogDescription>
            Gérez les coordinateurs de cours et leurs informations de contact
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Liste des coordinateurs</TabsTrigger>
              <TabsTrigger value="add">
                {editingCoordinator ? 'Modifier coordinateur' : 'Ajouter coordinateur'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Rechercher coordinateur, cours..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Badge variant="outline">
                  {filteredCoordinators.length} coordinateurs
                </Badge>
              </div>

              <div className="space-y-3">
                {filteredCoordinators.map((coordinator) => (
                  <Card key={coordinator.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{coordinator.name}</h4>
                            {coordinator.is_primary && (
                              <Badge variant="default">Principal</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{coordinator.email}</span>
                            </div>
                            <div>
                              <strong>Cours:</strong> {coordinator.course?.title} ({coordinator.course?.code})
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(coordinator)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(coordinator.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredCoordinators.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun coordinateur trouvé</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingCoordinator ? 'Modifier le coordinateur' : 'Ajouter un coordinateur'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="course">Cours *</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un cours" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title} ({course.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-base font-medium">Enseignant</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Sélectionnez un enseignant existant ou saisissez les informations manuellement
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="teacher">Enseignant existant</Label>
                        <Select 
                          value={selectedTeacher} 
                          onValueChange={(value) => {
                            setSelectedTeacher(value);
                            if (value) {
                              setManualName('');
                              setManualEmail('');
                            }
                          }}
                        >
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

                      <div className="text-center text-sm text-gray-500">
                        ou
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="manual-name">Nom complet</Label>
                          <Input
                            id="manual-name"
                            value={manualName}
                            onChange={(e) => {
                              setManualName(e.target.value);
                              if (e.target.value) {
                                setSelectedTeacher('');
                              }
                            }}
                            placeholder="Nom complet du coordinateur"
                          />
                        </div>
                        <div>
                          <Label htmlFor="manual-email">Email</Label>
                          <Input
                            id="manual-email"
                            type="email"
                            value={manualEmail}
                            onChange={(e) => {
                              setManualEmail(e.target.value);
                              if (e.target.value) {
                                setSelectedTeacher('');
                              }
                            }}
                            placeholder="email@exemple.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-primary"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="is-primary">Coordinateur principal</Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={resetForm}>
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={saving || !selectedCourse || (!selectedTeacher && (!manualName || !manualEmail))}
                    >
                      {saving ? (
                        <>
                          <LoadingSpinner />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          {editingCoordinator ? 'Modifier' : 'Ajouter'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};