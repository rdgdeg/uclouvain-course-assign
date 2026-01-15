import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CourseWithAttributions {
  id: number;
  code: string;
  title: string;
  faculty: string;
  subcategory?: string;
  vol1_total: number;
  vol2_total: number;
  volume_total_vol1: number;
  volume_total_vol2: number;
  academic_year: string;
  vacant?: boolean;
  start_date?: string;
  duration_weeks?: number;
  created_at: string;
  updated_at: string;
  attributions: {
    id: string;
    teacher_name: string;
    teacher_email: string;
    teacher_status?: string;
    vol1_hours: number;
    vol2_hours: number;
    candidature_status: string;
    is_coordinator: boolean;
    assignment_type: string;
    status?: string;
    notes?: string;
    faculty?: string;
  }[];
  total_assigned_vol1: number;
  total_assigned_vol2: number;
  validation_status: 'pending' | 'validated' | 'needs_correction' | 'rejected';
  coordinator_name?: string;
  coordinator_email?: string;
  has_volume_mismatch: boolean;
}

export const useCourseAttributions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Utiliser React Query pour le cache et la gestion d'état
  const { data: courses = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['course-attributions'],
    queryFn: async () => {
      // Récupérer les cours (colonnes spécifiques uniquement)
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id,code,title,faculty,subcategory,vol1_total,vol2_total,volume_total_vol1,volume_total_vol2,academic_year,vacant,start_date,duration_weeks,created_at,updated_at')
        .order('code');

      if (coursesError) throw coursesError;

      // Récupérer les attributions avec colonnes limitées
      const { data: attributionsData, error: attributionsError } = await supabase
        .from('hour_attributions')
        .select(`
          id,
          course_id,
          teacher_id,
          vol1_hours,
          vol2_hours,
          is_coordinator,
          candidature_status,
          assignment_type,
          status,
          faculty,
          teachers:teacher_id (
            first_name,
            last_name,
            email
          )
        `);

      if (attributionsError) throw attributionsError;

      // Récupérer les coordinateurs (colonnes limitées)
      const { data: coordinatorsData, error: coordinatorsError } = await supabase
        .from('course_coordinators')
        .select('id,course_id,name,email');

      if (coordinatorsError) throw coordinatorsError;

      // Récupérer les validations (colonnes limitées)
      const { data: validationsData, error: validationsError } = await supabase
        .from('coordinator_validations')
        .select('id,course_id,status');

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
            teacher_status: '',
            vol1_hours: Number(attr.vol1_hours) || 0,
            vol2_hours: Number(attr.vol2_hours) || 0,
            candidature_status: attr.candidature_status || '',
            is_coordinator: attr.is_coordinator || false,
            assignment_type: attr.assignment_type || '',
            status: attr.status || '',
            notes: '',
            faculty: attr.faculty || ''
          }));

        const total_assigned_vol1 = courseAttributions.reduce((sum, attr) => sum + attr.vol1_hours, 0);
        const total_assigned_vol2 = courseAttributions.reduce((sum, attr) => sum + attr.vol2_hours, 0);

        // Trouver le coordinateur du cours
        const coordinator = coordinatorsData.find(coord => coord.course_id === course.id);
        
        // Trouver la validation du cours
        const validation = validationsData.find(val => val.course_id === course.id);
        const validationStatus = validation?.status as 'pending' | 'validated' | 'needs_correction' | 'rejected' || 'pending';
        
        const has_volume_mismatch = 
          total_assigned_vol1 !== (course.volume_total_vol1 || 0) || 
          total_assigned_vol2 !== (course.volume_total_vol2 || 0);

        return {
          ...course,
          // Mapper correctement les volumes
          vol1_total: course.volume_total_vol1 || 0,
          vol2_total: course.volume_total_vol2 || 0,
          attributions: courseAttributions,
          total_assigned_vol1,
          total_assigned_vol2,
          validation_status: validationStatus,
          coordinator_name: coordinator?.name,
          coordinator_email: coordinator?.email,
          has_volume_mismatch
        };
      });

      return coursesWithAttributions;
    },
    staleTime: 30000, // Cache 30 secondes
    gcTime: 5 * 60 * 1000, // Garder en cache 5 minutes
  });

  const fetchCourses = async () => {
    queryClient.invalidateQueries({ queryKey: ['course-attributions'] });
  };

  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Erreur inconnue') : null;

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

  return {
    courses,
    loading,
    error,
    fetchCourses,
    getStats
  };
};