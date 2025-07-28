import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Users, MessageSquare, PlusCircle, ChevronDown, ChevronUp, Menu } from "lucide-react";
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PublicIndex = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showModificationForm, setShowModificationForm] = useState(false);
  const [showFreeProposalForm, setShowFreeProposalForm] = useState(false);
  const { courses, loading, fetchCourses } = useCourses();

  const COURSES_PER_PAGE = 10;

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

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const endIndex = startIndex + COURSES_PER_PAGE;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const handleProposalSuccess = () => {
    fetchCourses();
    setSelectedCourse(null);
    setShowProposalForm(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showAdminButton={true} />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête avec titre et menu d'actions */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Portail de Gestion des Cours
          </h1>
          <p className="text-muted-foreground mb-6">
            Année académique 2024-2025
          </p>
          
          {/* Menu d'actions principales */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <DropdownMenu open={showActionsMenu} onOpenChange={setShowActionsMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Menu className="h-4 w-4 mr-2" />
                  Actions disponibles
                  {showActionsMenu ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <DropdownMenuItem 
                  className="flex items-start p-4 cursor-pointer"
                  onClick={() => setShowActionsMenu(false)}
                >
                  <div className="flex items-start">
                    <PlusCircle className="h-6 w-6 text-green-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold">Proposer une équipe</h3>
                      <p className="text-sm text-muted-foreground">
                        Pour un cours vacant de la liste
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="flex items-start p-4 cursor-pointer"
                  onClick={() => {
                    setShowActionsMenu(false);
                    setShowModificationForm(true);
                  }}
                >
                  <div className="flex items-start">
                    <MessageSquare className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold">Demander une modification</h3>
                      <p className="text-sm text-muted-foreground">
                        Pour un cours existant
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="flex items-start p-4 cursor-pointer"
                  onClick={() => {
                    setShowActionsMenu(false);
                    setShowFreeProposalForm(true);
                  }}
                >
                  <div className="flex items-start">
                    <PlusCircle className="h-6 w-6 text-purple-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold">Candidature libre</h3>
                      <p className="text-sm text-muted-foreground">
                        Pour un cours non répertorié
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Statistiques rapides */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {availableCourses.length} cours disponibles
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {pendingProposals.length} propositions en attente
              </div>
            </div>
          </div>
        </div>

        {/* Section des cours vacants disponibles */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Cours vacants disponibles</h2>
          
          {/* Statistiques détaillées */}
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
                    {courses.filter(c => !c.vacant && c.assignments?.length > 0).length}
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
                  setCurrentPage(1);
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
                <Select 
                  value={subcategoryFilter} 
                  onValueChange={(value) => {
                    setSubcategoryFilter(value);
                    setCurrentPage(1);
                  }}
                >
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

        {/* Liste des cours avec pagination */}
        {loading ? (
          <div className="text-center py-12">
            <p>Chargement des cours...</p>
          </div>
        ) : (
          <>
            {view === 'cards' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {currentCourses.map((course) => (
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
              <div className="space-y-4 mb-6">
                {currentCourses.map((course) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mb-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            {/* Informations de pagination */}
            {filteredCourses.length > 0 && (
              <div className="text-center text-sm text-muted-foreground mb-6">
                Affichage de {startIndex + 1} à {Math.min(endIndex, filteredCourses.length)} 
                sur {filteredCourses.length} cours
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

      {/* Formulaire de demande de modification */}
      <ModificationRequestForm />

      {/* Formulaire de candidature libre */}
      <FreeCourseProposalForm />
    </div>
  );
};

export default PublicIndex;