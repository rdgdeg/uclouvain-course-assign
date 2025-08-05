import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { CourseCard } from "@/components/CourseCard";
import { SearchAndFilter } from "@/components/ui/SearchAndFilter";
import { SimpleViewToggle } from "@/components/ui/SimpleViewToggle";
import { CourseListView } from "@/components/CourseListView";
import { ModificationRequestForm } from "@/components/ModificationRequestForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Info, Filter, Grid, List, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ModificationRequests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses-modification'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          assignments:course_assignments(
            id,
            course_id,
            teacher_id,
            is_coordinator,
            vol1_hours,
            vol2_hours,
            validated_by_coord,
            created_at,
            updated_at,
            teacher:teachers(*)
          )
        `)
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Filtrage des cours
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = selectedFaculty === "all" || course.faculty === selectedFaculty;
    return matchesSearch && matchesFaculty;
  });

  // Pagination
  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  const faculties = Array.from(new Set(courses.map(course => course.faculty)));

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
      <div className="container mx-auto px-4 space-y-6 animate-fade-in">
        {/* En-tête avec titre et description */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-primary">Demandes de modification</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Consultez les cours existants et demandez des modifications d'attribution ou de contenu
          </p>
        </div>

        {/* Zone d'information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Comment procéder ?</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>Parcourez</strong> la liste des cours ci-dessous</p>
                  <p>• <strong>Utilisez les filtres</strong> pour trouver un cours spécifique</p>
                  <p>• <strong>Cliquez</strong> sur "Demander une modification" pour soumettre votre demande</p>
                  <p>• <strong>Pour un cours non répertorié</strong>, utilisez le bouton ci-dessous</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-4 justify-center">
          <HelpTooltip content="Demander une modification pour un cours qui n'apparaît pas dans la liste">
            <ModificationRequestForm />
          </HelpTooltip>
        </div>

        {/* Filtres et contrôles */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtres :</span>
            </div>
            <SearchAndFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedFaculty={selectedFaculty}
              setSelectedFaculty={setSelectedFaculty}
              faculties={faculties}
            />
          </div>
          
          <SimpleViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        {/* Informations sur les résultats */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, totalItems)} sur {totalItems} cours
          </span>
          <span>{totalPages} page{totalPages > 1 ? 's' : ''}</span>
        </div>

        {/* Liste des cours */}
        {paginatedCourses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun cours trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche ou contactez l'administration.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCourses.map((course) => (
                  <Card key={course.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {course.code} • {course.faculty}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {course.volume_total_vol1 + course.volume_total_vol2}h
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.assignments?.length || 0} enseignant(s)
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <Badge 
                            variant={course.vacant ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {course.vacant ? "Vacant" : "Attribué"}
                          </Badge>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ModificationRequestForm course={course} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="p-4 font-semibold">Cours</th>
                          <th className="p-4 font-semibold">Faculté</th>
                          <th className="p-4 font-semibold">Volume</th>
                          <th className="p-4 font-semibold">Statut</th>
                          <th className="p-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCourses.map((course) => (
                          <tr key={course.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{course.title}</p>
                                <p className="text-sm text-muted-foreground">{course.code}</p>
                              </div>
                            </td>
                            <td className="p-4 text-sm">{course.faculty}</td>
                            <td className="p-4 text-sm">
                              {course.volume_total_vol1 + course.volume_total_vol2}h
                            </td>
                            <td className="p-4">
                              <Badge 
                                variant={course.vacant ? "destructive" : "default"}
                                className="text-xs"
                              >
                                {course.vacant ? "Vacant" : "Attribué"}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <ModificationRequestForm course={course} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = Math.max(1, currentPage - 2) + i;
              if (pageNumber > totalPages) return null;
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ModificationRequests;