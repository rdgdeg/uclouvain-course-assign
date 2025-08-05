import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEmail } from "@/hooks/useEmail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Send } from "lucide-react";

interface Course {
  id: number;
  title: string;
  code: string;
  faculty: string;
}

interface ModificationRequestFormProps {
  course?: Course;
}

export const ModificationRequestForm = ({ course }: ModificationRequestFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    requester_name: "",
    requester_email: "",
    modification_type: "",
    description: "",
    course_id: course?.id.toString() || ""
  });

  const { toast } = useToast();
  const { sendModificationRequestConfirmation, isSending } = useEmail();

  // Récupérer tous les cours si aucun cours n'est pré-sélectionné
  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, code, faculty')
        .order('title');
      if (error) throw error;
      return data;
    },
    enabled: !course
  });

  const createRequestMutation = useMutation({
    mutationFn: async (newRequest: {
      course_id: number;
      requester_name: string;
      requester_email: string;
      modification_type: string;
      description: string;
    }) => {
      const { data, error } = await supabase
        .from('modification_requests')
        .insert([newRequest])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      // Envoyer l'email de confirmation
      const selectedCourse = course || courses.find(c => c.id.toString() === formData.course_id);
      await sendModificationRequestConfirmation(
        formData.requester_email,
        formData.requester_name,
        formData.modification_type,
        selectedCourse?.title
      );

      setIsOpen(false);
      resetForm();
      toast({
        title: "Demande envoyée",
        description: "Votre demande de modification a été envoyée avec succès. Vous recevrez une notification une fois qu'elle aura été traitée.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      requester_name: "",
      requester_email: "",
      modification_type: "",
      description: "",
      course_id: course?.id.toString() || ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course_id || !formData.requester_name || !formData.requester_email || 
        !formData.modification_type || !formData.description) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate({
      course_id: parseInt(formData.course_id),
      requester_name: formData.requester_name,
      requester_email: formData.requester_email,
      modification_type: formData.modification_type,
      description: formData.description
    });
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const selectedCourse = course || courses.find(c => c.id.toString() === formData.course_id);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm" onClick={handleOpen}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Demander une modification
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Demande de modification de cours</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!course && (
            <div>
              <Label htmlFor="course">Cours concerné *</Label>
              <Select 
                value={formData.course_id} 
                onValueChange={(value) => setFormData({ ...formData, course_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un cours" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((courseOption) => (
                    <SelectItem key={courseOption.id} value={courseOption.id.toString()}>
                      {courseOption.title} ({courseOption.code}) - {courseOption.faculty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {course && (
            <div>
              <Label className="font-semibold">Cours concerné</Label>
              <div className="mt-1 p-3 bg-muted rounded-md">
                <p className="font-medium">{course.title}</p>
                <p className="text-sm text-muted-foreground">
                  {course.code} - {course.faculty}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requester_name">Nom complet *</Label>
              <Input
                id="requester_name"
                value={formData.requester_name}
                onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                placeholder="Votre nom et prénom"
                required
              />
            </div>
            <div>
              <Label htmlFor="requester_email">Email *</Label>
              <Input
                id="requester_email"
                type="email"
                value={formData.requester_email}
                onChange={(e) => setFormData({ ...formData, requester_email: e.target.value })}
                placeholder="votre.email@uclouvain.be"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="modification_type">Type de modification *</Label>
            <Select 
              value={formData.modification_type} 
              onValueChange={(value) => setFormData({ ...formData, modification_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type de modification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assignment">Attribution d'enseignant</SelectItem>
                <SelectItem value="content">Modification du contenu</SelectItem>
                <SelectItem value="schedule">Modification des horaires</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description détaillée *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez en détail la modification demandée, la justification et toute information pertinente..."
              rows={4}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Soyez aussi précis que possible pour faciliter le traitement de votre demande.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Informations importantes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Votre demande sera examinée par l'administration</li>
              <li>• Vous recevrez une notification par email une fois traitée</li>
              <li>• Les demandes approuvées seront appliquées automatiquement</li>
              <li>• En cas de questions, l'administration pourra vous contacter</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createRequestMutation.isPending || isSending}>
              <Send className="h-4 w-4 mr-2" />
              {createRequestMutation.isPending || isSending ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};