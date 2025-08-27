import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Mail,
  Eye,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttributionManagement } from '@/hooks/useAttributionManagement';
import { CourseImportDialog } from './CourseImportDialog';
import { AttributionImportDialog } from './AttributionImportDialog';
import { CoordinatorManagementDialog } from './CoordinatorManagementDialog';
import { AttributionDetailDialog } from './AttributionDetailDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const AttributionManagementPanel: React.FC = () => {
  const {
    coordinators,
    validations,
    attributions,
    loading,
    error,
    fetchAttributionData,
    sendValidationRequest,
    getAttributionSummary,
    getStats
  } = useAttributionManagement();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAttributionImport, setShowAttributionImport] = useState(false);
  const [showCoordinatorDialog, setShowCoordinatorDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const stats = getStats();
  const summary = getAttributionSummary();

  // Filtrer les cours selon les critères
  const filteredSummary = summary.filter(course => {
    const matchesSearch = 
      course.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.coordinator_name && course.coordinator_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || course.validation_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'text-green-600 bg-green-50';
      case 'needs_correction': return 'text-orange-600 bg-orange-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
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

  const handleSendValidation = async (courseId: number, coordinatorId: string) => {
    try {
      await sendValidationRequest(courseId, coordinatorId);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    }
  };

  const handleViewDetails = (course: any) => {
    setSelectedCourse(course);
    setShowDetailDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchAttributionData}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Cours total</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold">{stats.pendingValidations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Validés</p>
                <p className="text-2xl font-bold">{stats.validatedCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Anomalies</p>
                <p className="text-2xl font-bold">{stats.underAttributed + stats.overAttributed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions principales */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des attributions de cours</CardTitle>
          <CardDescription>
            Importez les cours, gérez les coordinateurs et suivez les validations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setShowImportDialog(true)}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Importer cours
            </Button>
            <Button 
              onClick={() => setShowAttributionImport(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Importer attributions
            </Button>
            <Button 
              onClick={() => setShowCoordinatorDialog(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Gérer coordinateurs
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter rapport
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un cours, code ou coordinateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
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
          <CardTitle>Cours et attributions</CardTitle>
          <CardDescription>
            {filteredSummary.length} cours trouvés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSummary.map((course) => (
              <div
                key={course.course_id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{course.course_title}</h3>
                      <Badge variant="outline">{course.course_code}</Badge>
                      <Badge className={getStatusColor(course.validation_status)}>
                        {getStatusLabel(course.validation_status)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-4">
                        <span>
                          <strong>Vol.1:</strong> {course.total_vol1_attributed}h 
                          {course.total_vol1_expected > 0 && ` / ${course.total_vol1_expected}h`}
                        </span>
                        <span>
                          <strong>Vol.2:</strong> {course.total_vol2_attributed}h 
                          {course.total_vol2_expected > 0 && ` / ${course.total_vol2_expected}h`}
                        </span>
                      </div>
                      
                      {course.coordinator_name && (
                        <div>
                          <strong>Coordinateur:</strong> {course.coordinator_name} ({course.coordinator_email})
                        </div>
                      )}
                      
                      {course.last_sent && (
                        <div>
                          <strong>Dernière demande:</strong> {new Date(course.last_sent).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(course)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Détails
                    </Button>
                    
                    {course.coordinator_email && course.validation_status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const coordinator = coordinators.find(c => c.course_id === course.course_id);
                          if (coordinator) {
                            handleSendValidation(course.course_id, coordinator.id);
                          }
                        }}
                        className="flex items-center gap-1"
                      >
                        <Mail className="h-4 w-4" />
                        Envoyer
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Indicateurs visuels pour les anomalies */}
                {(course.total_vol1_attributed !== course.total_vol1_expected || 
                  course.total_vol2_attributed !== course.total_vol2_expected) && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    Volume horaire non conforme aux attentes
                  </div>
                )}
              </div>
            ))}
            
            {filteredSummary.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun cours trouvé avec ces critères</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CourseImportDialog />
      
      <AttributionImportDialog
        open={showAttributionImport}
        onOpenChange={setShowAttributionImport}
        onSuccess={fetchAttributionData}
      />
      
      <CoordinatorManagementDialog
        open={showCoordinatorDialog}
        onOpenChange={setShowCoordinatorDialog}
        onSuccess={fetchAttributionData}
      />
      
      {selectedCourse && (
        <AttributionDetailDialog
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          course={selectedCourse}
          onSuccess={fetchAttributionData}
        />
      )}
    </div>
  );
};

export default AttributionManagementPanel;