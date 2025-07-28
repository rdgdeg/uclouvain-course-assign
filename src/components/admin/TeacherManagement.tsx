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
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
}

export const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    status: "Académique"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les statuts disponibles
  const { data: availableStatuses = [] } = useQuery({
    queryKey: ['teacher-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_statuses')
        .select('name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: teachers = [], isLoading } = useQuery({
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

  const createTeacherMutation = useMutation({
    mutationFn: async (newTeacher: Omit<Teacher, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('teachers')
        .insert([newTeacher])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Enseignant créé",
        description: "L'enseignant a été ajouté avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'enseignant.",
        variant: "destructive",
      });
    }
  });

  const updateTeacherMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Teacher> & { id: number }) => {
      const { data, error } = await supabase
        .from('teachers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setIsDialogOpen(false);
      setEditingTeacher(null);
      resetForm();
      toast({
        title: "Enseignant modifié",
        description: "Les informations ont été mises à jour.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'enseignant.",
        variant: "destructive",
      });
    }
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Enseignant supprimé",
        description: "L'enseignant a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'enseignant.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      status: availableStatuses.length > 0 ? availableStatuses[0].name : "Académique"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      updateTeacherMutation.mutate({ id: editingTeacher.id, ...formData });
    } else {
      createTeacherMutation.mutate(formData);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
      status: teacher.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (teacher: Teacher) => {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'enseignant ${teacher.first_name} ${teacher.last_name} ?\n\nCette action est irréversible et supprimera également toutes ses attributions de cours.`;
    
    if (window.confirm(confirmMessage)) {
      deleteTeacherMutation.mutate(teacher.id);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gestion des Enseignants</span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingTeacher(null); resetForm(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel Enseignant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTeacher ? "Modifier l'enseignant" : "Nouvel enseignant"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="first_name">Prénom</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Nom</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.map((status) => (
                          <SelectItem key={status.name} value={status.name}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingTeacher ? "Modifier" : "Créer"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un enseignant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <p>Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.last_name}</TableCell>
                    <TableCell>{teacher.first_name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {teacher.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(teacher)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(teacher)}>
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
};