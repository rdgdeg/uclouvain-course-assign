import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Users, MessageSquare, PlusCircle, ChevronDown, ChevronUp, Menu, AlertTriangle, RefreshCw } from "lucide-react";
import { Header } from "@/components/Header";
import { CourseCard } from "@/components/CourseCard";
import { CourseListView } from "@/components/CourseListView";
import { ViewToggle } from "@/components/ViewToggle";
import { CourseFilter } from "@/components/CourseFilter";
import { AssignmentProposalForm } from "@/components/AssignmentProposalForm";
import { useCourses } from "@/hooks/useCourses";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { CourseCardSkeleton } from "@/components/ui/skeleton";
import { FacultySchoolFilter } from "@/components/ui/FacultySchoolFilter";
// SUPPRIMER import { t } from "../i18n/config";
// SUPPRIMER import { useLanguage } from "../hooks/useLanguage";

const PublicIndex = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showModificationForm, setShowModificationForm] = useState(false);
  const { courses, loading, fetchCourses, error } = useCourses();
  // SUPPRIMER const { lang } = useLanguage();

  const COURSES_PER_PAGE = 12;

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
    // Recherche insensible à la casse dans le titre et le code
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === "" || 
      (course.title && course.title.toLowerCase().includes(searchLower)) ||
      (course.code && course.code.toLowerCase().includes(searchLower)) ||
      (course.faculty && course.faculty.toLowerCase().includes(searchLower)) ||
      (course.subcategory && course.subcategory.toLowerCase().includes(searchLower));
    
    // Filtrage par faculté
    const matchesFaculty = facultyFilter === "all" || course.faculty === facultyFilter;
    
    // Filtrage par école
    const matchesSchool = schoolFilter === "all" || course.subcategory === schoolFilter;
    
    return matchesSearch && matchesFaculty && matchesSchool;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  
  // Réinitialiser la page courante si elle dépasse le nombre total de pages
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  if (validCurrentPage !== currentPage && totalPages > 0) {
    setCurrentPage(validCurrentPage);
  }
  
  const startIndex = (validCurrentPage - 1) * COURSES_PER_PAGE;
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

  const handleFacultyFilter = (faculty: string) => {
    setFacultyFilter(faculty);
    setSchoolFilter("all");
    setCurrentPage(1);
  };

  // Réinitialiser la pagination quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, facultyFilter, schoolFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Header showAdminButton={true} />
      
      <main className="container mx-auto px-4 py-8 pt-24">
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
                    navigate("/demandes-modification");
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
                    navigate("/candidature-libre");
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
              type="text"
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4">
              <Select 
                value={facultyFilter} 
                onValueChange={(value) => {
                  setFacultyFilter(value);
                  setSchoolFilter("all");
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
                  value={schoolFilter} 
                  onValueChange={(value) => {
                    setSchoolFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="École" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les écoles</SelectItem>
                    {getSubcategoryOptions().map(school => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <ViewToggle view={view} onViewChange={setView} />
          </div>
          
          {/* Indicateur de résultats de recherche */}
          {(searchTerm || facultyFilter !== "all" || schoolFilter !== "all") && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>
                {filteredCourses.length} résultat{filteredCourses.length !== 1 ? 's' : ''} trouvé{filteredCourses.length !== 1 ? 's' : ''}
                {searchTerm && ` pour "${searchTerm}"`}
              </span>
              {(searchTerm || facultyFilter !== "all" || schoolFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFacultyFilter("all");
                    setSchoolFilter("all");
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          )}
        </div>

        {/* Liste des cours avec pagination */}
        {loading ? (
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-muted-foreground">Chargement des cours...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Erreur de chargement
              </h3>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
              <Button 
                onClick={fetchCourses}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
            </div>
          </div>
        ) : (
          <>
            {currentCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun cours trouvé
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || facultyFilter !== "all" || schoolFilter !== "all"
                      ? "Aucun cours ne correspond à vos critères de recherche."
                      : "Aucun cours vacant disponible pour le moment."}
                  </p>
                  {(searchTerm || facultyFilter !== "all" || schoolFilter !== "all") && (
                    <Button 
                      onClick={() => {
                        setSearchTerm("");
                        setFacultyFilter("all");
                        setSchoolFilter("all");
                      }}
                      variant="outline"
                      className="mt-4"
                    >
                      Effacer les filtres
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {view === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
                        onFacultyFilter={handleFacultyFilter}
                      />
                    ))}
                  </div>
                ) : (
                  <CourseListView
                    courses={currentCourses}
                    onStatusUpdate={async () => {}}
                    onCourseUpdate={fetchCourses}
                    validateHourDistribution={() => ({ isValid: true })}
                    isAdmin={false}
                  />
                )}
              </>
            )}
          </>
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