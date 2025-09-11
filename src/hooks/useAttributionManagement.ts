import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CourseCoordinator {
  id: string;
  course_id: number;
  teacher_id: number;
  email: string;
  name: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoordinatorValidation {
  id: string;
  course_id: number;
  coordinator_id: string;
  status: 'pending' | 'validated' | 'needs_correction' | 'rejected';
  comments?: string;
  validated_at?: string;
  sent_at: string;
  reminder_sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface HourAttribution {
  id: string;
  course_id: number;
  teacher_id: number;
  assignment_type: 'coordinator' | 'assistant' | 'lecturer' | 'tp_supervisor';
  vol1_hours: number;
  vol2_hours: number;
  notes?: string;
  status: 'pending' | 'validated' | 'disputed';
  created_at: string;
  updated_at: string;
  teacher?: any;
  course?: any;
}

export interface AttributionSummary {
  course_id: number;
  course_title: string;
  course_code: string;
  total_vol1_expected: number;
  total_vol2_expected: number;
  total_vol1_attributed: number;
  total_vol2_attributed: number;
  validation_status: 'pending' | 'validated' | 'needs_correction' | 'rejected';
  coordinator_name?: string;
  coordinator_email?: string;
  last_sent?: string;
}

export const useAttributionManagement = () => {
  const [coordinators, setCoordinators] = useState<CourseCoordinator[]>([]);
  const [validations, setValidations] = useState<CoordinatorValidation[]>([]);
  const [attributions, setAttributions] = useState<HourAttribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger les données d'attribution
  const fetchAttributionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les coordinateurs avec leurs validations
      const { data: coordinatorsData, error: coordError } = await supabase
        .from('course_coordinators')
        .select(`
          *,
          validations:coordinator_validations(*)
        `)
        .order('name');

      if (coordError) throw coordError;

      // Charger les attributions d'heures
      const { data: attributionsData, error: attrError } = await supabase
        .from('hour_attributions')
        .select(`
          *,
          teacher:teachers(first_name, last_name, email),
          course:courses(title, code)
        `)
        .order('course_id');

      if (attrError) throw attrError;

      // Charger les validations
      const { data: validationsData, error: validError } = await supabase
        .from('coordinator_validations')
        .select('*')
        .order('created_at', { ascending: false });

      if (validError) throw validError;

      setCoordinators(coordinatorsData || []);
      setAttributions(attributionsData as HourAttribution[] || []);
      setValidations(validationsData as CoordinatorValidation[] || []);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors du chargement des attributions:', error);
      setError(errorMessage);
      
      toast({
        title: "Erreur de chargement",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Créer ou mettre à jour un coordinateur
  const upsertCoordinator = async (coordinatorData: any) => {
    try {
      const { data, error } = await supabase
        .from('course_coordinators')
        .upsert(coordinatorData)
        .select()
        .single();

      if (error) throw error;

      await fetchAttributionData();
      
      toast({
        title: "Coordinateur mis à jour",
        description: "Les informations du coordinateur ont été sauvegardées.",
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du coordinateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le coordinateur.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Créer une attribution d'heures
  const createAttribution = async (attributionData: any) => {
    try {
      const { data, error } = await supabase
        .from('hour_attributions')
        .insert(attributionData)
        .select()
        .single();

      if (error) throw error;

      await fetchAttributionData();
      
      toast({
        title: "Attribution créée",
        description: "L'attribution d'heures a été créée avec succès.",
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'attribution:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'attribution d'heures.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Envoyer une demande de validation à un coordinateur
  const sendValidationRequest = async (courseId: number, coordinatorId: string) => {
    try {
      const { data, error } = await supabase
        .from('coordinator_validations')
        .insert({
          course_id: courseId,
          coordinator_id: coordinatorId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAttributionData();
      
      toast({
        title: "Demande envoyée",
        description: "La demande de validation a été envoyée au coordinateur.",
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de validation.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Calculer le résumé des attributions par cours
  const getAttributionSummary = (): AttributionSummary[] => {
    const courseMap = new Map<number, AttributionSummary>();

    // Regrouper les attributions par cours
    attributions.forEach(attr => {
      if (!courseMap.has(attr.course_id)) {
        courseMap.set(attr.course_id, {
          course_id: attr.course_id,
          course_title: attr.course?.title || 'N/A',
          course_code: attr.course?.code || 'N/A',
          total_vol1_expected: 0,
          total_vol2_expected: 0,
          total_vol1_attributed: 0,
          total_vol2_attributed: 0,
          validation_status: 'pending'
        });
      }

      const summary = courseMap.get(attr.course_id)!;
      summary.total_vol1_attributed += attr.vol1_hours;
      summary.total_vol2_attributed += attr.vol2_hours;
    });

    // Ajouter les informations de validation
    validations.forEach(validation => {
      const summary = courseMap.get(validation.course_id);
      if (summary) {
        summary.validation_status = validation.status;
        summary.last_sent = validation.sent_at;
      }
    });

    // Ajouter les informations des coordinateurs
    coordinators.forEach(coord => {
      const summary = courseMap.get(coord.course_id);
      if (summary) {
        summary.coordinator_name = coord.name;
        summary.coordinator_email = coord.email;
      }
    });

    return Array.from(courseMap.values());
  };

  // Calculer les statistiques globales
  const getStats = () => {
    const summary = getAttributionSummary();
    
    return {
      totalCourses: summary.length,
      pendingValidations: summary.filter(s => s.validation_status === 'pending').length,
      validatedCourses: summary.filter(s => s.validation_status === 'validated').length,
      coursesNeedingCorrection: summary.filter(s => s.validation_status === 'needs_correction').length,
      underAttributed: summary.filter(s => 
        s.total_vol1_attributed < s.total_vol1_expected || 
        s.total_vol2_attributed < s.total_vol2_expected
      ).length,
      overAttributed: summary.filter(s => 
        s.total_vol1_attributed > s.total_vol1_expected || 
        s.total_vol2_attributed > s.total_vol2_expected
      ).length
    };
  };

  useEffect(() => {
    fetchAttributionData();
  }, []);

  return {
    coordinators,
    validations,
    attributions,
    loading,
    error,
    fetchAttributionData,
    upsertCoordinator,
    createAttribution,
    sendValidationRequest,
    getAttributionSummary,
    getStats
  };
};