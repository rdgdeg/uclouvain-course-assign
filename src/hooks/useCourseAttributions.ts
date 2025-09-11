import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CourseWithAttributions {
  id: number;
  code: string;
  title: string;
  faculty: string;
  vol1_total: number;
  vol2_total: number;
  academic_year: string;
  attributions: {
    id: string;
    teacher_name: string;
    teacher_email: string;
    vol1_hours: number;
    vol2_hours: number;
    candidature_status: string;
    is_coordinator: boolean;
    assignment_type: string;
  }[];
  total_assigned_vol1: number;
  total_assigned_vol2: number;
  validation_status: 'pending' | 'validated' | 'needs_correction' | 'rejected';
  coordinator_name?: string;
  coordinator_email?: string;
  has_volume_mismatch: boolean;
}

export const useCourseAttributions = () => {
  const [courses, setCourses] = useState<CourseWithAttributions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les cours
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('code');

      if (coursesError) throw coursesError;

      // Récupérer les attributions
      const { data: attributionsData, error: attributionsError } = await supabase
        .from('hour_attributions')
        .select(`
          *,
          teachers:teacher_id (
            first_name,
            last_name,
            email
          )
        `);

      if (attributionsError) throw attributionsError;

      // Récupérer les coordinateurs
      const { data: coordinatorsData, error: coordinatorsError } = await supabase
        .from('course_coordinators')
        .select('*');

      if (coordinatorsError) throw coordinatorsError;

      // Récupérer les validations
      const { data: validationsData, error: validationsError } = await supabase
        .from('coordinator_validations')
        .select('*');

      if (validationsError) throw validationsError;

      // Grouper les données par cours
      const coursesWithAttributions: CourseWithAttributions[] = coursesData.map(course => {
        const courseAttributions = attributionsData
          .filter(attr => attr.course_id === course.id)
          .map(attr => ({
            id: attr.id,
            teacher_name: attr.teachers ? 
              `${attr.teachers.first_name} ${attr.teachers.last_name}` : 'N/A',
            teacher_email: attr.teachers?.email || '',
            vol1_hours: Number(attr.vol1_hours) || 0,
            vol2_hours: Number(attr.vol2_hours) || 0,
            candidature_status: attr.candidature_status || '',
            is_coordinator: attr.is_coordinator || false,
            assignment_type: attr.assignment_type || ''
          }));

        const total_assigned_vol1 = courseAttributions.reduce((sum, attr) => sum + attr.vol1_hours, 0);
        const total_assigned_vol2 = courseAttributions.reduce((sum, attr) => sum + attr.vol2_hours, 0);

        // Trouver le coordinateur du cours
        const coordinator = coordinatorsData.find(coord => coord.course_id === course.id);
        
        // Trouver la validation du cours
        const validation = validationsData.find(val => val.course_id === course.id);
        const validationStatus = validation?.status as 'pending' | 'validated' | 'needs_correction' | 'rejected' || 'pending';
        
        const has_volume_mismatch = 
          total_assigned_vol1 !== (course.vol1_total || 0) || 
          total_assigned_vol2 !== (course.vol2_total || 0);

        return {
          ...course,
          attributions: courseAttributions,
          total_assigned_vol1,
          total_assigned_vol2,
          validation_status: validationStatus,
          coordinator_name: coordinator?.name,
          coordinator_email: coordinator?.email,
          has_volume_mismatch
        };
      });

      setCourses(coursesWithAttributions);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors du chargement des cours:', error);
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

  const getStats = () => {
    return {
      totalCourses: courses.length,
      validatedCourses: courses.filter(c => c.validation_status === 'validated').length,
      pendingValidations: courses.filter(c => c.validation_status === 'pending').length,
      coursesNeedingCorrection: courses.filter(c => c.validation_status === 'needs_correction').length,
      underAttributed: courses.filter(c => 
        c.total_assigned_vol1 < c.vol1_total || 
        c.total_assigned_vol2 < c.vol2_total
      ).length,
      overAttributed: courses.filter(c => 
        c.total_assigned_vol1 > c.vol1_total || 
        c.total_assigned_vol2 > c.vol2_total
      ).length
    };
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    getStats
  };
};