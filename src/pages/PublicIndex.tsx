import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Users, MessageSquare, PlusCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { CourseCard } from "@/components/CourseCard";
import { CourseListView } from "@/components/CourseListView";
import { ViewToggle } from "@/components/ViewToggle";
import { CourseFilter } from "@/components/CourseFilter";
import { ModificationRequestForm } from "@/components/ModificationRequestForm";
import { AssignmentProposalForm } from "@/components/AssignmentProposalForm";
import { useCourses } from "@/hooks/useCourses";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FreeCourseProposalForm } from "@/components/admin/FreeCourseProposalForm";

const PublicIndex = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const { courses, loading, fetchCourses } = useCourses();

  // Récupérer les cours avec propositions en attente pour les masquer
  const { data: pendingProposals = [] } = useQuery({
    queryKey: ['pending-proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignment_proposals')
        .select('course_id')
        .eq('status', 'pending');
      if (error) throw error;
      return data.map(p => p.course_id);
    }
  });

  // Options de facultés et sous-catégories
  const facultyOptions = [
    { value: "FSM", label: "FSM", subcategories: ["EDPH", "KINE"] },
    { value: "FSP", label: "FSP", subcategories: [] },
    { value: "FASB", label: "FASB", subcategories: ["FARM", "SBIM"] },
    { value: "MEDE", label: "MEDE", subcategories: ["MED", "MDEN"] }
  ];

  const getSubcategoryOptions = () => {
    if (facultyFilter === "all") return [];
    const faculty = facultyOptions.find(f => f.value === facultyFilter);
    return faculty?.subcategories || [];
  };

  // Filtrer les cours : seulement ceux vacants ET sans proposition en attente
  const availableCourses = courses.filter(course => 
    course.vacant && !pendingProposals.includes(course.id)
  );

  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.code || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFaculty = facultyFilter === "all" || course.faculty === facultyFilter;
    const matchesSubcategory = subcategoryFilter === "all" || course.subcategory === subcategoryFilter;
    
    return matchesSearch && matchesFaculty && matchesSubcategory;
  });

  const handleProposalSuccess = () => {
    fetchCourses();
    setSelectedCourse(null);
    setShowProposalForm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showAdminButton={true} />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête avec titre et actions principales */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Portail de Gestion des Cours
          </h1>
          <p className="text-muted-foreground mb-8">
            Année académique 2024-2025
          </p>
          
          {/* Actions principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <PlusCircle className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold">Proposer une équipe</h3>
                    <p className="text-sm text-muted-foreground">
                      Pour un cours vacant
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Proposez une équipe pédagogique pour un cours actuellement vacant. 
                  Renseignez les enseignants et la répartition des heures.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {availableCourses.length} cours disponibles
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold">Demander une modification</h3>
                    <p className="text-sm text-muted-foreground">
                      Pour un cours existant
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Demandez une modification sur un cours déjà attribué : 
                  changement d'enseignant, d'horaires, de contenu, etc.
                </p>
                <div className="flex justify-end">
                  <ModificationRequestForm />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <PlusCircle className="h-8 w-8 text-purple-600 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold">Candidature libre</h3>
                    <p className="text-sm text-muted-foreground">
                      Pour un cours non répertorié
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Proposez une équipe pour un cours qui n'est pas dans la liste. 
                  Renseignez les informations du cours et de l'équipe.
                </p>
                <div className="flex justify-end">
                  <FreeCourseProposalForm />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section des cours vacants disponibles */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Cours vacants disponibles</h2>
          
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <BookOpen className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <p className="text-2xl font-bold">{availableCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Cours disponibles</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <p className="text-2xl font-bold">{pendingProposals.length}</p>
                  <p className="text-sm text-muted-foreground">Propositions en attente</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <MessageSquare className="h-8 w-8 text-orange-600 mr-4" />
                <div>
                  <p className="text-2xl font-bold">
                    {courses.filter(c => !c.vacant && c.assignments.length > 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Cours attribués</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par code ou titre de cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4">
              <Select 
                value={facultyFilter} 
                onValueChange={(value) => {
                  setFacultyFilter(value);
                  setSubcategoryFilter("all");
                }}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Faculté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les facultés</SelectItem>
                  {facultyOptions.map(faculty => (
                    <SelectItem key={faculty.value} value={faculty.value}>
                      {faculty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {getSubcategoryOptions().length > 0 && (
                <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Sous-catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les sous-catégories</SelectItem>
                    {getSubcategoryOptions().map(subcategory => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </div>

        {/* Liste des cours */}
        {loading ? (
          <div className="text-center py-12">
            <p>Chargement des cours...</p>
          </div>
        ) : (
          <>
            {view === 'cards' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onStatusUpdate={async () => {}}
                    onCourseUpdate={fetchCourses}
                    validateHourDistribution={() => ({ isValid: true })}
                    isAdmin={false}
                    onProposeTeam={() => {
                      setSelectedCourse(course);
                      setShowProposalForm(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.code} - {course.faculty}
                        {course.subcategory && ` / ${course.subcategory}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vol.1: {course.volume_total_vol1}h | Vol.2: {course.volume_total_vol2}h
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowProposalForm(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Proposer équipe
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Aucun cours vacant disponible
            </p>
            <p className="text-muted-foreground">
              {availableCourses.length === 0 
                ? "Tous les cours ont une proposition en attente ou sont déjà attribués."
                : "Essayez de modifier vos critères de recherche."
              }
            </p>
          </div>
        )}
      </main>

      {/* Formulaire de proposition d'équipe */}
      {selectedCourse && (
        <AssignmentProposalForm
          course={selectedCourse}
          open={showProposalForm}
          onOpenChange={setShowProposalForm}
          onSuccess={handleProposalSuccess}
        />
      )}
    </div>
  );
};

export default PublicIndex;