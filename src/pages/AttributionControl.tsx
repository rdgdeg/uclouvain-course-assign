import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Plus
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

        {/* Liste des cours avec attributions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Cours et attributions ({filteredCourses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredCourses.map((course) => (
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
                        
                        {/* Informations académiques */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">Année académique</div>
                            <div className="text-gray-600">{course.academic_year || '2024-2025'}</div>
                          </div>
                          {course.faculty && (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">Faculté</div>
                              <div className="text-gray-600">{course.faculty}</div>
                            </div>
                          )}
                          {course.subcategory && (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">Sous-catégorie</div>
                              <div className="text-gray-600">{course.subcategory}</div>
                            </div>
                          )}
                        </div>
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
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Volumes horaires */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Volumes horaires
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {(course.vol1_total || 0) + (course.vol2_total || 0)}h
                          </div>
                          <div className="text-sm text-gray-600">Volume total</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Assigné: {course.total_assigned_vol1 + course.total_assigned_vol2}h
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{course.vol1_total || 0}h</div>
                          <div className="text-sm text-gray-600">Volume 1</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Assigné: {course.total_assigned_vol1}h
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{course.vol2_total || 0}h</div>
                          <div className="text-sm text-gray-600">Volume 2</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Assigné: {course.total_assigned_vol2}h
                          </div>
                        </div>
                      </div>
                      
                      {course.has_volume_mismatch && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="flex items-center gap-2 text-sm text-yellow-800">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-medium">
                              Incohérence détectée - Volumes assignés différents des volumes prévus
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Coordinateur */}
                    {course.coordinator_name && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Coordinateur
                        </h4>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-blue-900">{course.coordinator_name}</div>
                              <div className="text-sm text-blue-700">{course.coordinator_email}</div>
                            </div>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                              Coordinateur
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Équipe enseignante */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Équipe enseignante ({course.attributions.length})
                      </h4>
                      
                      {course.attributions.length > 0 ? (
                        <div className="space-y-3">
                          {course.attributions.map((attribution) => (
                            <div key={attribution.id} className="p-4 border rounded-lg hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="font-medium text-gray-900">{attribution.teacher_name}</div>
                                    {attribution.is_coordinator && (
                                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                        Coordinateur
                                      </Badge>
                                    )}
                                    {attribution.candidature_status && (
                                      <Badge 
                                        variant={attribution.candidature_status === 'Non retenu' ? 'destructive' : 'default'}
                                      >
                                        {attribution.candidature_status}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-2">{attribution.teacher_email}</div>
                                  {attribution.assignment_type && (
                                    <div className="text-sm text-gray-500">
                                      <strong>Type:</strong> {attribution.assignment_type}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-900">
                                    Total: {attribution.vol1_hours + attribution.vol2_hours}h
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Vol1: {attribution.vol1_hours}h • Vol2: {attribution.vol2_hours}h
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Résumé des attributions */}
                          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                            <div className="text-sm text-gray-600">
                              <strong>Résumé:</strong> {course.attributions.length} enseignant(s), 
                              Total assigné: {course.total_assigned_vol1 + course.total_assigned_vol2}h 
                              (Vol1: {course.total_assigned_vol1}h, Vol2: {course.total_assigned_vol2}h)
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                          <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 font-medium">Aucune attribution définie</p>
                          <p className="text-sm text-gray-500">Ce cours n'a pas encore d'équipe enseignante assignée</p>
                        </div>
                      )}
                    </div>

                    {/* Informations supplémentaires du cours */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Informations détaillées</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Code du cours:</span>
                          <span className="ml-2 text-gray-600">{course.code}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Statut:</span>
                          <span className="ml-2 text-gray-600">
                            {course.vacant ? 'Poste vacant' : 'Poste pourvu'}
                          </span>
                        </div>
                        {course.start_date && (
                          <div>
                            <span className="font-medium text-gray-700">Date de début:</span>
                            <span className="ml-2 text-gray-600">
                              {new Date(course.start_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {course.duration_weeks && (
                          <div>
                            <span className="font-medium text-gray-700">Durée:</span>
                            <span className="ml-2 text-gray-600">{course.duration_weeks} semaines</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredCourses.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Aucun cours trouvé</p>
                  <p>Essayez de modifier vos critères de recherche</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AttributionControl;