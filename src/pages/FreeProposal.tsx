import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProposals } from "@/hooks/useProposals";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VolumeValidation } from "@/components/VolumeValidation";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  BookOpen, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Send,
  User,
  Building,
  GraduationCap,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Member {
  nom: string;
  prenom: string;
  entite: string;
  statut: string;
  vol1: number;
  vol2: number;
  email?: string;
  telephone?: string;
}

interface CourseInfo {
  code: string;
  nom_fr: string;
  nom_en: string;
  faculte: string;
  sous_categorie: string;
  volume_total_vol1: number;
  volume_total_vol2: number;
  description?: string;
  prerequis?: string;
  objectifs?: string;
}

const FreeProposal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submitFreeProposal } = useProposals();

  const [courseInfo, setCourseInfo] = useState<CourseInfo>({
    code: "",
    nom_fr: "",
    nom_en: "",
    faculte: "",
    sous_categorie: "",
    volume_total_vol1: 0,
    volume_total_vol2: 0,
    description: "",
    prerequis: "",
    objectifs: ""
  });

  const [coordo, setCoordo] = useState<Member>({ 
    nom: "", 
    prenom: "", 
    entite: "", 
    statut: "", 
    vol1: 0, 
    vol2: 0,
    email: "",
    telephone: ""
  });

  const [cotitulaires, setCotitulaires] = useState<Member[]>([]);
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTeacherSelection, setShowTeacherSelection] = useState(false);

  // Options pour les facultés et statuts
  const facultyOptions = [
    { value: "FSM", label: "Faculté des Sciences de la Motricité (FSM)" },
    { value: "FSP", label: "Faculté de Santé Publique (FSP)" },
    { value: "FASB", label: "Faculté d'Architecture et d'Urbanisme (FASB)" },
    { value: "MEDE", label: "Faculté de Médecine et Médecine Dentaire (MEDE)" }
  ];

  const statusOptions = [
    { value: "PROF", label: "Professeur" },
    { value: "CHARG", label: "Chargé de cours" },
    { value: "MAITRE", label: "Maître de conférences" },
    { value: "ASSIST", label: "Assistant" },
    { value: "DOCT", label: "Docteur" },
    { value: "AUTRE", label: "Autre" }
  ];

  // Récupérer les enseignants existants
  const { data: existingTeachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('last_name');
      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    setTeachers(existingTeachers);
  }, [existingTeachers]);

  const handleCourseChange = (field: keyof CourseInfo, value: string | number) => {
    setCourseInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCoordoChange = (field: keyof Member, value: string | number) => {
    setCoordo(prev => ({ ...prev, [field]: value }));
  };

  const handleCotitChange = (idx: number, field: keyof Member, value: string | number) => {
    const newCotits = [...cotitulaires];
    newCotits[idx] = { ...newCotits[idx], [field]: value };
    setCotitulaires(newCotits);
  };

  const addCotitulaire = () => {
    setCotitulaires([...cotitulaires, { 
      nom: "", 
      prenom: "", 
      entite: "", 
      statut: "", 
      vol1: 0, 
      vol2: 0,
      email: "",
      telephone: ""
    }]);
  };

  const removeCotitulaire = (idx: number) => {
    setCotitulaires(cotitulaires.filter((_, i) => i !== idx));
  };

  const selectExistingTeacher = (teacher: any) => {
    const newCotit: Member = {
      nom: teacher.last_name,
      prenom: teacher.first_name,
      entite: teacher.entity || "",
      statut: teacher.status || "AUTRE",
      vol1: 0,
      vol2: 0,
      email: teacher.email,
      telephone: ""
    };
    setCotitulaires(prev => [...prev, newCotit]);
    setShowTeacherSelection(false);
    setSearchTerm("");
  };

  const filteredTeachers = teachers.filter(teacher =>
    `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableTeachers = filteredTeachers.filter(teacher =>
    !cotitulaires.some(cotit => 
      cotit.nom === teacher.last_name && cotit.prenom === teacher.first_name
    )
  );

  const sumVol1 = Number(coordo.vol1) + cotitulaires.reduce((s, m) => s + Number(m.vol1), 0);
  const sumVol2 = Number(coordo.vol2) + cotitulaires.reduce((s, m) => s + Number(m.vol2), 0);

  const isValid = sumVol1 === Number(courseInfo.volume_total_vol1) && 
                 sumVol2 === Number(courseInfo.volume_total_vol2) && 
                 submitterName && 
                 submitterEmail &&
                 courseInfo.code &&
                 courseInfo.nom_fr &&
                 courseInfo.faculte &&
                 coordo.nom && 
                 coordo.prenom && 
                 coordo.entite && 
                 coordo.statut;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires et vérifier les volumes horaires.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitFreeProposal.mutateAsync({
        courseInfo,
        coordonnateur: coordo,
        cotitulaires,
        submitterName,
        submitterEmail
      });

      toast({
        title: "Candidature soumise avec succès",
        description: "Votre candidature libre a été enregistrée et sera examinée par l'administration.",
      });

      // Rediriger vers la page d'accueil après soumission
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      toast({
        title: "Erreur lors de la soumission",
        description: "Une erreur est survenue lors de la soumission de votre candidature.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        {/* En-tête de la page */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Candidature Libre
            </h1>
            <p className="text-lg text-gray-600">
              Proposez un cours non répertorié avec votre équipe d'enseignement
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations du soumissionnaire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Vos informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submitterName">Nom complet *</Label>
                  <Input
                    id="submitterName"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="Votre nom et prénom"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="submitterEmail">Email *</Label>
                  <Input
                    id="submitterEmail"
                    type="email"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    placeholder="votre.email@uclouvain.be"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations du cours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Informations du cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseCode">Code du cours *</Label>
                  <Input
                    id="courseCode"
                    value={courseInfo.code}
                    onChange={(e) => handleCourseChange('code', e.target.value)}
                    placeholder="Ex: LINFO1001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="faculty">Faculté *</Label>
                  <Select value={courseInfo.faculte} onValueChange={(value) => handleCourseChange('faculte', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une faculté" />
                    </SelectTrigger>
                    <SelectContent>
                      {facultyOptions.map((faculty) => (
                        <SelectItem key={faculty.value} value={faculty.value}>
                          {faculty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseNameFr">Nom du cours (français) *</Label>
                  <Input
                    id="courseNameFr"
                    value={courseInfo.nom_fr}
                    onChange={(e) => handleCourseChange('nom_fr', e.target.value)}
                    placeholder="Nom du cours en français"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="courseNameEn">Nom du cours (anglais)</Label>
                  <Input
                    id="courseNameEn"
                    value={courseInfo.nom_en}
                    onChange={(e) => handleCourseChange('nom_en', e.target.value)}
                    placeholder="Course name in English"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="subcategory">Sous-catégorie</Label>
                  <Input
                    id="subcategory"
                    value={courseInfo.sous_categorie}
                    onChange={(e) => handleCourseChange('sous_categorie', e.target.value)}
                    placeholder="Ex: EDPH, KINE, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="volumeVol1">Volume horaire Vol.1 *</Label>
                  <Input
                    id="volumeVol1"
                    type="number"
                    min="0"
                    value={courseInfo.volume_total_vol1}
                    onChange={(e) => handleCourseChange('volume_total_vol1', Number(e.target.value))}
                    placeholder="Heures"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="volumeVol2">Volume horaire Vol.2 *</Label>
                  <Input
                    id="volumeVol2"
                    type="number"
                    min="0"
                    value={courseInfo.volume_total_vol2}
                    onChange={(e) => handleCourseChange('volume_total_vol2', Number(e.target.value))}
                    placeholder="Heures"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description du cours</Label>
                  <Textarea
                    id="description"
                    value={courseInfo.description}
                    onChange={(e) => handleCourseChange('description', e.target.value)}
                    placeholder="Description détaillée du contenu du cours..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prerequis">Prérequis</Label>
                    <Textarea
                      id="prerequis"
                      value={courseInfo.prerequis}
                      onChange={(e) => handleCourseChange('prerequis', e.target.value)}
                      placeholder="Prérequis pour suivre ce cours..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="objectifs">Objectifs d'apprentissage</Label>
                    <Textarea
                      id="objectifs"
                      value={courseInfo.objectifs}
                      onChange={(e) => handleCourseChange('objectifs', e.target.value)}
                      placeholder="Objectifs d'apprentissage..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coordonnateur */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Coordonnateur du cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coordoNom">Nom *</Label>
                  <Input
                    id="coordoNom"
                    value={coordo.nom}
                    onChange={(e) => handleCoordoChange('nom', e.target.value)}
                    placeholder="Nom du coordonnateur"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="coordoPrenom">Prénom *</Label>
                  <Input
                    id="coordoPrenom"
                    value={coordo.prenom}
                    onChange={(e) => handleCoordoChange('prenom', e.target.value)}
                    placeholder="Prénom du coordonnateur"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="coordoEntite">Entité *</Label>
                  <Input
                    id="coordoEntite"
                    value={coordo.entite}
                    onChange={(e) => handleCoordoChange('entite', e.target.value)}
                    placeholder="Institut, département, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="coordoStatut">Statut *</Label>
                  <Select value={coordo.statut} onValueChange={(value) => handleCoordoChange('statut', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="coordoEmail">Email</Label>
                  <Input
                    id="coordoEmail"
                    type="email"
                    value={coordo.email}
                    onChange={(e) => handleCoordoChange('email', e.target.value)}
                    placeholder="email@uclouvain.be"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="coordoTelephone">Téléphone</Label>
                  <Input
                    id="coordoTelephone"
                    type="tel"
                    value={coordo.telephone}
                    onChange={(e) => handleCoordoChange('telephone', e.target.value)}
                    placeholder="+32 10 47..."
                  />
                </div>
                <div>
                  <Label htmlFor="coordoVol1">Volume Vol.1 *</Label>
                  <Input
                    id="coordoVol1"
                    type="number"
                    min="0"
                    value={coordo.vol1}
                    onChange={(e) => handleCoordoChange('vol1', Number(e.target.value))}
                    placeholder="Heures"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="coordoVol2">Volume Vol.2 *</Label>
                  <Input
                    id="coordoVol2"
                    type="number"
                    min="0"
                    value={coordo.vol2}
                    onChange={(e) => handleCoordoChange('vol2', Number(e.target.value))}
                    placeholder="Heures"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cotitulaires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cotitulaires
                <Badge variant="secondary">{cotitulaires.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bouton pour ajouter un cotitulaire */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCotitulaire}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un cotitulaire
                </Button>
                <Button
                  type="button"
                  variant={showTeacherSelection ? "default" : "outline"}
                  onClick={() => setShowTeacherSelection(!showTeacherSelection)}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {showTeacherSelection ? "Masquer la sélection" : "Sélectionner un enseignant existant"}
                  {!showTeacherSelection && availableTeachers.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {availableTeachers.length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Sélection d'enseignant existant */}
              {showTeacherSelection && (
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-base font-medium">Rechercher un enseignant existant</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTeacherSelection(false)}
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par nom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {teachers.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Chargement des enseignants...</p>
                    </div>
                  ) : availableTeachers.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      <p className="text-xs text-muted-foreground mb-2">
                        {availableTeachers.length} enseignant{availableTeachers.length !== 1 ? 's' : ''} disponible{availableTeachers.length !== 1 ? 's' : ''}
                      </p>
                      {availableTeachers.map((teacher) => (
                        <div key={teacher.id} className="flex justify-between items-center p-3 border rounded bg-white hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="font-medium">{teacher.first_name} {teacher.last_name}</div>
                            <div className="text-sm text-muted-foreground">{teacher.email}</div>
                            {teacher.status && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {teacher.status}
                              </Badge>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => selectExistingTeacher(teacher)}
                            className="ml-2"
                          >
                            Sélectionner
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? "Aucun enseignant trouvé pour cette recherche" : "Tous les enseignants ont déjà été sélectionnés"}
                      </p>
                      {searchTerm && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchTerm("")}
                          className="mt-2"
                        >
                          Effacer la recherche
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {cotitulaires.map((cotit, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Cotitulaire {idx + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeCotitulaire(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Nom</Label>
                      <Input
                        value={cotit.nom}
                        onChange={(e) => handleCotitChange(idx, 'nom', e.target.value)}
                        placeholder="Nom du cotitulaire"
                      />
                    </div>
                    <div>
                      <Label>Prénom</Label>
                      <Input
                        value={cotit.prenom}
                        onChange={(e) => handleCotitChange(idx, 'prenom', e.target.value)}
                        placeholder="Prénom du cotitulaire"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label>Entité</Label>
                      <Input
                        value={cotit.entite}
                        onChange={(e) => handleCotitChange(idx, 'entite', e.target.value)}
                        placeholder="Institut, département, etc."
                      />
                    </div>
                    <div>
                      <Label>Statut</Label>
                      <Select value={cotit.statut} onValueChange={(value) => handleCotitChange(idx, 'statut', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={cotit.email}
                        onChange={(e) => handleCotitChange(idx, 'email', e.target.value)}
                        placeholder="email@uclouvain.be"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Téléphone</Label>
                      <Input
                        type="tel"
                        value={cotit.telephone}
                        onChange={(e) => handleCotitChange(idx, 'telephone', e.target.value)}
                        placeholder="+32 10 47..."
                      />
                    </div>
                    <div>
                      <Label>Volume Vol.1</Label>
                      <Input
                        type="number"
                        min="0"
                        value={cotit.vol1}
                        onChange={(e) => handleCotitChange(idx, 'vol1', Number(e.target.value))}
                        placeholder="Heures"
                      />
                    </div>
                    <div>
                      <Label>Volume Vol.2</Label>
                      <Input
                        type="number"
                        min="0"
                        value={cotit.vol2}
                        onChange={(e) => handleCotitChange(idx, 'vol2', Number(e.target.value))}
                        placeholder="Heures"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addCotitulaire}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un cotitulaire
              </Button>
            </CardContent>
          </Card>

          {/* Validation des volumes */}
          <VolumeValidation
            requiredVol1={courseInfo.volume_total_vol1}
            requiredVol2={courseInfo.volume_total_vol2}
            proposedVol1={sumVol1}
            proposedVol2={sumVol2}
            isValid={isValid}
          />

          {/* Bouton de soumission */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={!isValid || submitFreeProposal.isPending}
              className="min-w-[200px]"
            >
              {submitFreeProposal.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Soumission en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Soumettre la candidature
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default FreeProposal; 