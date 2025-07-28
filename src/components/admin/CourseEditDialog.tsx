import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Save, Trash2 } from "lucide-react";

interface Course {
  id: number;
  title: string;
  code: string;
  faculty: string;
  subcategory: string;
  volume_total_vol1: number;
  volume_total_vol2: number;
  vacant: boolean;
}

interface CourseEditDialogProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CourseEditDialog = ({ course, isOpen, onClose }: CourseEditDialogProps) => {
  const [formData, setFormData] = useState({
    title: course?.title || "",
    code: course?.code || "",
    faculty: course?.faculty || "",
    subcategory: course?.subcategory || "",
    volume_total_vol1: course?.volume_total_vol1 || 0,
    volume_total_vol2: course?.volume_total_vol2 || 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCourseMutation = useMutation({
    mutationFn: async (updates: Partial<Course>) => {
      if (!course) return;
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', course.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['vacant-courses'] });
      onClose();
      toast({
        title: "Cours modifié",
        description: "Les informations du cours ont été mises à jour.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le cours.",
        variant: "destructive",
      });
    }
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async () => {
      if (!course) return;
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', course.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['vacant-courses'] });
      onClose();
      toast({
        title: "Cours supprimé",
        description: "Le cours a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le cours.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCourseMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (!course) return;
    
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer le cours "${course.title}" ?\n\nCette action supprimera également toutes les attributions associées et est irréversible.`;
    
    if (window.confirm(confirmMessage)) {
      deleteCourseMutation.mutate();
    }
  };

  // Mettre à jour les données du formulaire quand le cours change
  React.useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        code: course.code || "",
        faculty: course.faculty || "",
        subcategory: course.subcategory || "",
        volume_total_vol1: course.volume_total_vol1,
        volume_total_vol2: course.volume_total_vol2
      });
    }
  }, [course]);

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier le cours</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre du cours *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Code du cours</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="faculty">Faculté</Label>
              <Input
                id="faculty"
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="subcategory">Sous-catégorie</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vol1">Volume 1 (heures)</Label>
              <Input
                id="vol1"
                type="number"
                min="0"
                value={formData.volume_total_vol1}
                onChange={(e) => setFormData({ ...formData, volume_total_vol1: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="vol2">Volume 2 (heures)</Label>
              <Input
                id="vol2"
                type="number"
                min="0"
                value={formData.volume_total_vol2}
                onChange={(e) => setFormData({ ...formData, volume_total_vol2: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCourseMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteCourseMutation.isPending ? "Suppression..." : "Supprimer le cours"}
            </Button>
            
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={updateCourseMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateCourseMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};