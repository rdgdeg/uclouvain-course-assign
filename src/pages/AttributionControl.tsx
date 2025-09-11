import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Mail,
  Calendar,
  GraduationCap,
  Plus,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useCourseAttributions } from "@/hooks/useCourseAttributions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const AttributionControl = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const {
    courses,
    loading,
    error,
    getStats
  } = useCourseAttributions();

  const stats = getStats();

  // Filtrer les cours selon les critères
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.coordinator_name && course.coordinator_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || course.validation_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  // Fonctions pour gérer l'expansion des cours
  const toggleCourseExpansion = (courseId: number) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const expandAll = () => {
    setExpandedCourses(new Set(paginatedCourses.map(c => c.id)));
  };

  const collapseAll = () => {
    setExpandedCourses(new Set());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs_correction': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated': return 'Validé';
      case 'needs_correction': return 'À corriger';
      case 'rejected': return 'Rejeté';
      default: return 'En attente';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Chargement des attributions..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <GraduationCap className="h-8 w-8" />
              Contrôle des Attributions
            </h1>
            <p className="text-muted-foreground">Année académique 2024-2025 • Consultez et demandez des modifications</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Cours total</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Validés</p>
                  <p className="text-3xl font-bold text-green-600">{stats.validatedCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingValidations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Anomalies</p>
                  <p className="text-3xl font-bold text-red-600">{stats.underAttributed + stats.overAttributed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action principale */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Demander une modification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Vous avez identifié une erreur ou souhaitez proposer un ajustement ? Utilisez le formulaire de demande de modification.
            </p>
            <Button onClick={() => navigate('/demandes-modification')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle demande de modification
            </Button>
          </CardContent>
        </Card>

        {/* Filtres et recherche */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par cours, code ou coordinateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="validated">Validés</SelectItem>
                  <SelectItem value="needs_correction">À corriger</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions de gestion des vues */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={expandAll}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Tout déplier
            </Button>
            <Button
              onClick={collapseAll}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <EyeOff className="h-4 w-4" />
              Tout replier
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} • {filteredCourses.length} cours au total
          </div>
        </div>

        {/* Liste des cours avec attributions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Cours et attributions ({paginatedCourses.length} sur {filteredCourses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {paginatedCourses.map((course) => {
                const isExpanded = expandedCourses.has(course.id);
                
                return (
                  <Card key={course.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-bold text-primary">{course.code}</h2>
                            <Badge className={`border ${getStatusColor(course.validation_status)}`}>
                              {getStatusLabel(course.validation_status)}
                            </Badge>
                            {course.faculty && (
                              <Badge variant="secondary">{course.faculty}</Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-medium text-gray-700 mb-3">{course.title}</h3>
                          
                          {/* Vue compacte - informations principales */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">Volume Total</div>
                              <div className="text-2xl font-bold text-blue-600">
                                {(course.vol1_total || 0) + (course.vol2_total || 0)}h
                              </div>
                              <div className="text-xs text-gray-500">
                                Assigné: {course.total_assigned_vol1 + course.total_assigned_vol2}h
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">Volume 1</div>
                              <div className="text-xl font-bold text-green-600">{course.vol1_total || 0}h</div>
                              <div className="text-xs text-gray-500">
                                Assigné: {course.total_assigned_vol1}h
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">Volume 2</div>
                              <div className="text-xl font-bold text-purple-600">{course.vol2_total || 0}h</div>
                              <div className="text-xs text-gray-500">
                                Assigné: {course.total_assigned_vol2}h
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">Équipe</div>
                              <div className="text-xl font-bold text-orange-600">{course.attributions.length}</div>
                              <div className="text-xs text-gray-500">
                                {course.coordinator_name ? `Coord: ${course.coordinator_name}` : 'Pas de coordinateur'}
                              </div>
                            </div>
                          </div>

                          {/* Indicateur d'incohérence en vue compacte */}
                          {course.has_volume_mismatch && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                              <div className="flex items-center gap-2 text-sm text-yellow-800">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">Incohérence volumes détectée</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => navigate('/demandes-modification', { 
                              state: { courseId: course.id, courseCode: course.code, courseTitle: course.title }
                            })}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Demander une modification
                          </Button>
                          
                          <Button
                            onClick={() => toggleCourseExpansion(course.id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                Masquer détails
                              </>
                            ) : (
                              <>
                                <ChevronRight className="h-4 w-4" />
                                Voir détails
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {/* Détails étendus - Affiché seulement si étendu */}
                    {isExpanded && (
                      <CardContent className="space-y-6">
                        {/* Équipe enseignante détaillée */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Équipe enseignante ({course.attributions.length})
                          </h4>
                          
                          {course.attributions.length > 0 ? (
                            <div className="space-y-3">
                              {course.attributions.map((attribution) => (
                                <div key={attribution.id} className="p-4 border rounded-lg hover:bg-gray-50">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-3 flex-wrap">
                                        <div className="font-medium text-gray-900 text-lg">{attribution.teacher_name}</div>
                                        {attribution.is_coordinator && (
                                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                            <Users className="h-3 w-3 mr-1" />
                                            Coordinateur
                                          </Badge>
                                        )}
                                        {attribution.assignment_type && (
                                          <Badge variant="secondary" className="text-xs">
                                            {attribution.assignment_type}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="h-4 w-4" />
                                        <span>{attribution.teacher_email}</span>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="text-lg font-bold text-primary mb-1">
                                        {attribution.vol1_hours + attribution.vol2_hours}h
                                      </div>
                                      <div className="text-xs text-gray-600 space-y-1">
                                        <div>Vol1: {attribution.vol1_hours}h</div>
                                        <div>Vol2: {attribution.vol2_hours}h</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600 font-medium">Aucune attribution définie</p>
                              <p className="text-sm text-gray-500">Ce cours n'a pas encore d'équipe enseignante assignée</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
              
              {paginatedCourses.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Aucun cours trouvé</p>
                  <p>Essayez de modifier vos critères de recherche</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AttributionControl;