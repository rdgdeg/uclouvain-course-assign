import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Course } from "@/types";
import { useCourses } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";

interface CourseManagementDialogProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  course?: Course;
  mode?: 'create' | 'edit';
  onUpdate?: () => void;
}

export const CourseManagementDialog: React.FC<CourseManagementDialogProps> = ({
  open,
  onClose,
  onOpenChange,
  course,
  mode = 'create',
  onUpdate
}) => {
  const { createCourse, updateCourse } = useCourses();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: course?.title || '',
    code: course?.code || '',
    faculty: course?.faculty || '',
    subcategory: course?.subcategory || '',
    academic_year: course?.academic_year || '2026-2027',
    start_date: course?.start_date || '',
    duration_weeks: course?.duration_weeks || '',
    volume_total_vol1: course?.volume_total_vol1 || '',
    volume_total_vol2: course?.volume_total_vol2 || '',
    vacant: course?.vacant ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const courseData = {
        ...formData,
        duration_weeks: formData.duration_weeks ? Number(formData.duration_weeks) : null,
        volume_total_vol1: formData.volume_total_vol1 ? Number(formData.volume_total_vol1) : null,
        volume_total_vol2: formData.volume_total_vol2 ? Number(formData.volume_total_vol2) : null
      };

      if (mode === 'create') {
        await createCourse.mutateAsync(courseData);
        toast({
          title: "Cours créé",
          description: "Le cours a été créé avec succès."
        });
      } else if (course?.id) {
        await updateCourse.mutateAsync({ id: course.id, ...courseData });
        toast({
          title: "Cours modifié",
          description: "Le cours a été modifié avec succès."
        });
      }
      
      if (onClose) onClose();
      if (onOpenChange) onOpenChange(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération.",
        variant: "destructive"
      });
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange || onClose || (() => {})}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Créer un cours' : 'Modifier le cours'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="faculty">Faculté</Label>
              <Select value={formData.faculty} onValueChange={(value) => handleChange('faculty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une faculté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Médecine">Médecine</SelectItem>
                  <SelectItem value="Sciences">Sciences</SelectItem>
                  <SelectItem value="Lettres">Lettres</SelectItem>
                  <SelectItem value="Droit">Droit</SelectItem>
                  <SelectItem value="Économie">Économie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subcategory">Sous-catégorie</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => handleChange('subcategory', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="academic_year">Année académique</Label>
              <Input
                id="academic_year"
                value={formData.academic_year}
                onChange={(e) => handleChange('academic_year', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="start_date">Date de début</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="duration_weeks">Durée (semaines)</Label>
              <Input
                id="duration_weeks"
                type="number"
                value={formData.duration_weeks}
                onChange={(e) => handleChange('duration_weeks', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="volume_total_vol1">Volume Vol1 (h)</Label>
              <Input
                id="volume_total_vol1"
                type="number"
                value={formData.volume_total_vol1}
                onChange={(e) => handleChange('volume_total_vol1', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="volume_total_vol2">Volume Vol2 (h)</Label>
              <Input
                id="volume_total_vol2"
                type="number"
                value={formData.volume_total_vol2}
                onChange={(e) => handleChange('volume_total_vol2', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="vacant">Statut</Label>
              <Select 
                value={formData.vacant ? 'vacant' : 'assigned'} 
                onValueChange={(value) => handleChange('vacant', value === 'vacant')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="assigned">Attribué</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose || (() => onOpenChange?.(false))}>
              Annuler
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Créer' : 'Modifier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};