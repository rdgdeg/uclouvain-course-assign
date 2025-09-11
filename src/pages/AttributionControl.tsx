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
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <Badge variant="outline" className="text-xs">{course.code}</Badge>
                        <Badge className={`border ${getStatusColor(course.validation_status)}`}>
                          {getStatusLabel(course.validation_status)}
                        </Badge>
                        {course.faculty && (
                          <Badge variant="secondary">{course.faculty}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              <strong>Vol.1:</strong> {course.total_assigned_vol1}h 
                              {course.vol1_total > 0 && ` / ${course.vol1_total}h`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              <strong>Vol.2:</strong> {course.total_assigned_vol2}h 
                              {course.vol2_total > 0 && ` / ${course.vol2_total}h`}
                            </span>
                          </div>
                        </div>
                        
                        {course.coordinator_name && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span><strong>Coordinateur:</strong> {course.coordinator_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span className="text-xs">{course.coordinator_email}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Afficher les attributions si disponibles */}
                      {course.attributions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Équipe enseignante :</h4>
                          <div className="space-y-1">
                            {course.attributions.map((attribution) => (
                              <div key={attribution.id} className="text-xs text-gray-600 flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                <span>{attribution.teacher_name}</span>
                                {attribution.is_coordinator && (
                                  <Badge variant="outline" className="text-xs">Coord.</Badge>
                                )}
                                <span className="ml-auto">
                                  Vol1: {attribution.vol1_hours}h, Vol2: {attribution.vol2_hours}h
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Indicateurs visuels pour les anomalies */}
                  {course.has_volume_mismatch && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center gap-2 text-sm text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Volume horaire non conforme aux attentes</span>
                      </div>
                    </div>
                  )}
                </div>
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