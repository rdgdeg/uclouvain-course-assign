import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Send, Info, User, Mail, Clock, GraduationCap } from "lucide-react";

const FreeProposal: React.FC = () => {
  const [formData, setFormData] = useState({
    course_id: "",
    applicant_name: "",
    applicant_email: "",
    motivation: "",
    experience: "",
    availability: ""
  });

  const { toast } = useToast();

  // Récupérer les cours vacants
  const { data: vacantCourses = [], isLoading } = useQuery({
    queryKey: ['vacant-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('vacant', true)
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Mutation pour créer une candidature
  const createProposalMutation = useMutation({
    mutationFn: async (proposalData: {
      course_id: number;
      submitter_name: string;
      submitter_email: string;
      proposal_data: any;
    }) => {
      const { data, error } = await supabase
        .from('assignment_proposals')
        .insert([proposalData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été envoyée avec succès. Vous recevrez une confirmation par email.",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la candidature. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      course_id: "",
      applicant_name: "",
      applicant_email: "",
      motivation: "",
      experience: "",
      availability: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course_id || !formData.applicant_name || !formData.applicant_email || 
        !formData.motivation) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const proposalData = {
      course_id: parseInt(formData.course_id),
      submitter_name: formData.applicant_name,
      submitter_email: formData.applicant_email,
      proposal_data: {
        type: "free_proposal",
        applicant: {
          name: formData.applicant_name,
          email: formData.applicant_email
        },
        motivation: formData.motivation,
        experience: formData.experience,
        availability: formData.availability
      }
    };

    createProposalMutation.mutate(proposalData);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 space-y-8 animate-fade-in">
        {/* En-tête */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <PlusCircle className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-primary">Candidature libre</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Proposez votre candidature pour enseigner un cours vacant qui correspond à vos compétences
          </p>
        </div>

        {/* Informations importantes */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Processus de candidature</h3>
                <div className="text-sm text-purple-800 space-y-1">
                  <p>• <strong>Choisissez</strong> un cours vacant dans la liste ci-dessous</p>
                  <p>• <strong>Remplissez</strong> le formulaire avec vos informations et motivation</p>
                  <p>• <strong>Soumettez</strong> votre candidature pour évaluation</p>
                  <p>• <strong>Recevez</strong> une réponse par email sous 5 jours ouvrables</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques des cours vacants */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Cours disponibles</h3>
                  <p className="text-sm text-muted-foreground">
                    {vacantCourses.length} cours {vacantCourses.length > 1 ? 'recherchent' : 'recherche'} un enseignant
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {vacantCourses.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de candidature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Formulaire de candidature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sélection du cours */}
              <div>
                <Label htmlFor="course" className="flex items-center gap-2">
                  Cours souhaité *
                  <HelpTooltip content="Sélectionnez le cours pour lequel vous souhaitez candidater" />
                </Label>
                <Select 
                  value={formData.course_id} 
                  onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un cours vacant" />
                  </SelectTrigger>
                  <SelectContent>
                    {vacantCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{course.title}</span>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="outline" className="text-xs">
                              {course.code}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {course.volume_total_vol1 + course.volume_total_vol2}h
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nom complet *
                  </Label>
                  <Input
                    id="name"
                    value={formData.applicant_name}
                    onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                    placeholder="Votre nom et prénom"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.applicant_email}
                    onChange={(e) => setFormData({ ...formData, applicant_email: e.target.value })}
                    placeholder="votre.email@uclouvain.be"
                    required
                  />
                </div>
              </div>

              {/* Motivation */}
              <div>
                <Label htmlFor="motivation">
                  Lettre de motivation *
                  <HelpTooltip content="Expliquez pourquoi vous souhaitez enseigner ce cours et ce qui vous motive" />
                </Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  placeholder="Décrivez votre motivation pour enseigner ce cours, vos objectifs pédagogiques..."
                  rows={4}
                  required
                />
              </div>

              {/* Expérience */}
              <div>
                <Label htmlFor="experience">
                  Expérience et qualifications
                  <HelpTooltip content="Décrivez votre formation et expérience pertinente pour ce cours" />
                </Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Formation académique, expérience professionnelle, publications, certifications..."
                  rows={3}
                />
              </div>

              {/* Disponibilités */}
              <div>
                <Label htmlFor="availability" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Disponibilités
                  <HelpTooltip content="Précisez vos créneaux de disponibilité pour l'enseignement" />
                </Label>
                <Textarea
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  placeholder="Jours et horaires de disponibilité, contraintes particulières..."
                  rows={2}
                />
              </div>

              {/* Zone d'information */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Informations importantes</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Votre candidature sera examinée par le comité pédagogique</li>
                  <li>• Vous recevrez une réponse par email sous 5 jours ouvrables</li>
                  <li>• Les candidatures retenues seront contactées pour un entretien</li>
                  <li>• L'attribution finale dépend de l'adéquation profil/cours</li>
                </ul>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Réinitialiser
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProposalMutation.isPending}
                  className="min-w-[140px]"
                >
                  {createProposalMutation.isPending ? (
                    <>
                      <LoadingSpinner />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer ma candidature
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Message si aucun cours vacant */}
        {vacantCourses.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun cours vacant disponible</h3>
              <p className="text-muted-foreground">
                Il n'y a actuellement aucun cours vacant nécessitant un enseignant. 
                Revenez régulièrement pour vérifier les nouvelles opportunités.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default FreeProposal;