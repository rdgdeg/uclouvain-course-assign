
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, BookOpen, Users, Clock, X } from "lucide-react";
import { Header } from "@/components/Header";
import { CourseCard } from "@/components/CourseCard";
import { CourseListView } from "@/components/CourseListView";
import { ViewToggle } from "@/components/ViewToggle";
import { CourseFilter } from "@/components/CourseFilter";
import { useCourses } from "@/hooks/useCourses";
import { FacultySchoolFilter } from "@/components/ui/FacultySchoolFilter";

const Index = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [showOnlyVacant, setShowOnlyVacant] = useState(true);
  const [isAdmin] = useState(false); // TODO: Implement real admin check
  const { courses, loading, fetchCourses, updateCourseStatus, validateHourDistribution } = useCourses();



  const filteredCourses = courses.filter(course => {
    // Filtre d'affichage principal (vacant ou tous)
    if (showOnlyVacant && !course.vacant) return false;
    
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.assignments && course.assignments.some(assignment => 
        assignment.teacher ? `${assignment.teacher.first_name} ${assignment.teacher.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) : false
      ));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "vacant" && course.vacant) ||
      (statusFilter === "assigned" && !course.vacant && course.assignments && course.assignments.length > 0) ||
      (statusFilter === "pending" && !course.vacant && (!course.assignments || course.assignments.length === 0));

    const matchesFaculty = facultyFilter === "all" || course.faculty === facultyFilter;
    
    const matchesSchool = schoolFilter === "all" || course.subcategory === schoolFilter;
    

    
    return matchesSearch && matchesStatus && matchesFaculty && matchesSchool;
  });

  const vacantCount = courses.filter(c => c.vacant).length;

  return (
    <div className="min-h-screen bg-background">
      <Header onAdminClick={() => navigate("/admin")} />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête avec titre et statistiques */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Gestion des Cours Vacants
          </h1>
          <p className="text-muted-foreground mb-6">
            Année académique 2024-2025
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <BookOpen className="h-8 w-8 text-accent mr-4" />
                <div>
                  <p className="text-2xl font-bold">
                    {courses.filter(c => c.vacant).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Cours vacants</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <p className="text-2xl font-bold">
                    {courses.filter(c => !c.vacant && c.assignments && c.assignments.length > 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Cours attribués</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <Clock className="h-8 w-8 text-orange-500 mr-4" />
                <div>
                  <p className="text-2xl font-bold">
                    {courses.filter(c => !c.vacant && (!c.assignments || c.assignments.length === 0)).length}
                  </p>
                  <p className="text-sm text-muted-foreground">En attente</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtre principal : cours vacants vs tous les cours */}
        <div className="mb-6">
          <CourseFilter 
            showOnlyVacant={showOnlyVacant}
            onToggle={setShowOnlyVacant}
            vacantCount={vacantCount}
            totalCount={courses.length}
            isAdmin={isAdmin}
          />
        </div>

        {/* Barre de recherche et filtres */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom d'enseignant, code ou titre de cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {filteredCourses.length} résultat(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="assigned">Attribué</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>

              <FacultySchoolFilter
                facultyFilter={facultyFilter}
                onFacultyChange={setFacultyFilter}
                schoolFilter={schoolFilter}
                onSchoolChange={setSchoolFilter}
              />
            </div>

            {/* Sélecteur de vue */}
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
                    onStatusUpdate={updateCourseStatus}
                    onCourseUpdate={fetchCourses}
                    validateHourDistribution={validateHourDistribution}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            ) : (
              <CourseListView
                courses={filteredCourses}
                onStatusUpdate={updateCourseStatus}
                onCourseUpdate={fetchCourses}
                validateHourDistribution={validateHourDistribution}
                isAdmin={isAdmin}
              />
            )}
          </>
        )}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Aucun cours trouvé
            </p>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
