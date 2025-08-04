import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourses } from "@/hooks/useCourses";
import { CourseManagementDialog } from "@/components/CourseManagementDialog";
import { Course } from "@/types";
import { Calendar, Clock, Users, BookOpen } from "lucide-react";

export const ComprehensiveCourseManagement: React.FC = () => {
  const { courses, isLoading } = useCourses();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.code && course.code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFaculty = facultyFilter === "all" || course.faculty === facultyFilter;
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "vacant" && course.vacant) ||
      (statusFilter === "assigned" && !course.vacant);
    
    return matchesSearch && matchesFaculty && matchesStatus;
  }) || [];

  const faculties = courses ? [...new Set(courses.map(c => c.faculty).filter(Boolean))] : [];
  
  const stats = {
    total: courses?.length || 0,
    vacant: courses?.filter(c => c.vacant).length || 0,
    assigned: courses?.filter(c => !c.vacant).length || 0,
    withAssignments: courses?.filter(c => c.assignments && c.assignments.length > 0).length || 0
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleCreateCourse = () => {
    setSelectedCourse(undefined);
    setDialogMode('create');
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Chargement des cours...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Vacants</p>
                <p className="text-2xl font-bold">{stats.vacant}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Attribués</p>
                <p className="text-2xl font-bold">{stats.assigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Avec attributions</p>
                <p className="text-2xl font-bold">{stats.withAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion Complète des Cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            
            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Toutes les facultés" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les facultés</SelectItem>
                {faculties.map(faculty => (
                  <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="vacant">Vacants</SelectItem>
                <SelectItem value="assigned">Attribués</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleCreateCourse}>
              Nouveau cours
            </Button>
          </div>

          {/* Liste des cours */}
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{course.title}</h3>
                        {course.code && (
                          <Badge variant="outline">{course.code}</Badge>
                        )}
                        <Badge variant={course.vacant ? "destructive" : "default"}>
                          {course.vacant ? "Vacant" : "Attribué"}
                        </Badge>
                        {course.faculty && (
                          <Badge variant="secondary">{course.faculty}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          {course.subcategory && <p>Sous-catégorie: {course.subcategory}</p>}
                          {course.academic_year && <p>Année: {course.academic_year}</p>}
                        </div>
                        
                        <div>
                          {course.start_date && (
                            <p>Début: {new Date(course.start_date).toLocaleDateString()}</p>
                          )}
                          {course.duration_weeks && <p>Durée: {course.duration_weeks} semaines</p>}
                        </div>
                        
                        <div>
                          <div className="flex gap-4">
                            {course.volume_total_vol1 && (
                              <span>Vol1: {course.volume_total_vol1}h</span>
                            )}
                            {course.volume_total_vol2 && (
                              <span>Vol2: {course.volume_total_vol2}h</span>
                            )}
                          </div>
                          {course.assignments && course.assignments.length > 0 && (
                            <p>{course.assignments.length} attribution(s)</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Affichage des attributions */}
                      {course.assignments && course.assignments.length > 0 && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Attributions:</h4>
                          <div className="space-y-1">
                            {course.assignments.map((assignment) => (
                              <div key={assignment.id} className="text-sm flex justify-between">
                                <span>
                                  {assignment.teacher ? 
                                    `${assignment.teacher.first_name} ${assignment.teacher.last_name}` :
                                    `Enseignant ID: ${assignment.teacher_id}`
                                  }
                                  {assignment.is_coordinator && " (Coordinateur)"}
                                </span>
                                <span>
                                  Vol1: {assignment.vol1_hours || 0}h, Vol2: {assignment.vol2_hours || 0}h
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCourse(course)}
                    >
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredCourses.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Aucun cours trouvé</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      <CourseManagementDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        course={selectedCourse}
        mode={dialogMode}
      />
    </div>
  );
};