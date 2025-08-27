import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, 
  Users, 
  Clock, 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AttributionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: any;
  onSuccess?: () => void;
}

interface Attribution {
  id: string;
  teacher_id: number;
  assignment_type: string;
  vol1_hours: number;
  vol2_hours: number;
  notes?: string;
  status: string;
  teacher: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Validation {
  id: string;
  status: string;
  comments?: string;
  validated_at?: string;
  sent_at: string;
  coordinator: {
    name: string;
    email: string;
  };
}

export const AttributionDetailDialog: React.FC<AttributionDetailDialogProps> = ({
  open,
  onOpenChange,
  course,
  onSuccess
}) => {
  const [attributions, setAttributions] = useState<Attribution[]>([]);
  const [validations, setValidations] = useState<Validation[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminComments, setAdminComments] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const fetchDetails = async () => {
    if (!course) return;

    try {
      setLoading(true);

      // Charger les attributions détaillées
      const { data: attributionsData, error: attrError } = await supabase
        .from('hour_attributions')
        .select(`
          *,
          teacher:teachers(first_name, last_name, email)
        `)
        .eq('course_id', course.course_id)
        .order('assignment_type');

      if (attrError) throw attrError;

      // Charger les validations
      const { data: validationsData, error: validError } = await supabase
        .from('coordinator_validations')
        .select(`
          *,
          coordinator:course_coordinators(name, email)
        `)
        .eq('course_id', course.course_id)
        .order('created_at', { ascending: false });

      if (validError) throw validError;

      setAttributions(attributionsData || []);
      setValidations(validationsData || []);

    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du cours.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateValidationStatus = async (validationId: string, status: string) => {
    try {
      setUpdating(true);

      const updateData: any = {
        status,
        validated_at: status === 'validated' ? new Date().toISOString() : null
      };

      if (adminComments.trim()) {
        updateData.comments = adminComments.trim();
      }

      const { error } = await supabase
        .from('coordinator_validations')
        .update(updateData)
        .eq('id', validationId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `La validation a été marquée comme ${status === 'validated' ? 'validée' : status === 'rejected' ? 'rejetée' : 'à corriger'}.`,
      });

      setAdminComments('');
      fetchDetails();
      onSuccess?.();

    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getAssignmentTypeLabel = (type: string) => {
    switch (type) {
      case 'coordinator': return 'Coordinateur';
      case 'assistant': return 'Assistant';
      case 'lecturer': return 'Chargé de cours';
      case 'tp_supervisor': return 'Superviseur TP';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'text-green-600 bg-green-50';
      case 'needs_correction': return 'text-orange-600 bg-orange-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'needs_correction': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalVol1 = attributions.reduce((sum, attr) => sum + attr.vol1_hours, 0);
  const totalVol2 = attributions.reduce((sum, attr) => sum + attr.vol2_hours, 0);

  useEffect(() => {
    if (open && course) {
      fetchDetails();
    }
  }, [open, course]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Détails du cours - {course?.course_title}
          </DialogTitle>
          <DialogDescription>
            Code: {course?.course_code} • Coordinateur: {course?.coordinator_name}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <Tabs defaultValue="attributions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="attributions">Attributions</TabsTrigger>
              <TabsTrigger value="validations">Validations</TabsTrigger>
            </TabsList>

            <TabsContent value="attributions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des heures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{totalVol1}h</div>
                      <div className="text-sm text-blue-600">Volume 1</div>
                      {course.total_vol1_expected > 0 && (
                        <div className="text-xs text-gray-500">
                          Attendu: {course.total_vol1_expected}h
                        </div>
                      )}
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{totalVol2}h</div>
                      <div className="text-sm text-green-600">Volume 2</div>
                      {course.total_vol2_expected > 0 && (
                        <div className="text-xs text-gray-500">
                          Attendu: {course.total_vol2_expected}h
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {attributions.map((attribution) => (
                      <div key={attribution.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">
                                {attribution.teacher.first_name} {attribution.teacher.last_name}
                              </span>
                              <Badge variant="outline">
                                {getAssignmentTypeLabel(attribution.assignment_type)}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>{attribution.teacher.email}</div>
                              <div>
                                <strong>Vol.1:</strong> {attribution.vol1_hours}h • 
                                <strong> Vol.2:</strong> {attribution.vol2_hours}h
                              </div>
                              {attribution.notes && (
                                <div className="text-gray-500">
                                  <strong>Notes:</strong> {attribution.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(attribution.status)}>
                            {attribution.status === 'validated' ? 'Validé' : 
                             attribution.status === 'disputed' ? 'Contesté' : 'En attente'}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {attributions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Aucune attribution trouvée</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validations" className="space-y-4">
              <div className="space-y-4">
                {validations.map((validation) => (
                  <Card key={validation.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(validation.status)}
                          Validation par {validation.coordinator.name}
                        </CardTitle>
                        <Badge className={getStatusColor(validation.status)}>
                          {validation.status === 'validated' ? 'Validé' : 
                           validation.status === 'rejected' ? 'Rejeté' : 
                           validation.status === 'needs_correction' ? 'À corriger' : 'En attente'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span>{validation.coordinator.email}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>Envoyé le {new Date(validation.sent_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {validation.comments && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center gap-1 mb-2">
                            <MessageSquare className="h-4 w-4" />
                            <span className="font-medium">Commentaires:</span>
                          </div>
                          <p className="text-sm">{validation.comments}</p>
                        </div>
                      )}

                      {validation.validated_at && (
                        <div className="text-sm text-gray-600">
                          Validé le {new Date(validation.validated_at).toLocaleDateString()}
                        </div>
                      )}

                      {validation.status === 'pending' && (
                        <div className="border-t pt-4 space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Commentaires administrateur
                            </label>
                            <Textarea
                              value={adminComments}
                              onChange={(e) => setAdminComments(e.target.value)}
                              placeholder="Ajoutez des commentaires (optionnel)..."
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateValidationStatus(validation.id, 'validated')}
                              disabled={updating}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Valider
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateValidationStatus(validation.id, 'needs_correction')}
                              disabled={updating}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              À corriger
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateValidationStatus(validation.id, 'rejected')}
                              disabled={updating}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejeter
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {validations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune validation trouvée</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};