import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Course, Teacher, TeacherAssignment } from "@/types/index";

// Export des types pour la compatibilité
export type { Course, Teacher, TeacherAssignment };

interface FetchCoursesOptions {
  includeAssignments?: boolean;
  academicYear?: string;
  limit?: number;
  offset?: number;
  filters?: {
    faculty?: string;
    search?: string;
    vacant?: boolean;
  };
}

export const useCourses = (options: FetchCoursesOptions = {}) => {
  const { 
    includeAssignments = false, 
    academicYear,
    limit,
    offset = 0,
    filters = {}
  } = options;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Utiliser React Query pour le cache et la gestion d'état
  const { data: courses = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['courses', academicYear, filters, limit, offset, includeAssignments],
    queryFn: async () => {
      // Construire la requête avec colonnes spécifiques uniquement
      let query = supabase
        .from('courses')
        .select(`
          id,
          title,
          code,
          faculty,
          subcategory,
          volume_total_vol1,
          volume_total_vol2,
          vol1_total,
          vol2_total,
          academic_year,
          vacant,
          start_date,
          duration_weeks,
          created_at,
          updated_at
          ${includeAssignments ? `,
          assignments:course_assignments(
            id,
            course_id,
            teacher_id,
            vol1_hours,
            vol2_hours,
            is_coordinator,
            teacher:teachers(
              id,
              first_name,
              last_name,
              email
            )
          )` : ''}
        `);

      // Appliquer les filtres côté serveur
      if (academicYear) {
        query = query.eq('academic_year', academicYear);
      }
      if (filters.faculty && filters.faculty !== 'all') {
        query = query.eq('faculty', filters.faculty);
      }
      if (filters.vacant !== undefined) {
        query = query.eq('vacant', filters.vacant);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
      }

      // Pagination côté serveur
      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      query = query.order('title');

      const { data: coursesData, error: coursesError } = await query;

      if (coursesError) {
        console.error('Erreur lors de la récupération des cours:', coursesError);
        throw new Error(`Erreur base de données: ${coursesError.message}`);
      }

      if (!coursesData) {
        return [];
      }

      // Transformer les données
      return coursesData.map(course => ({
        ...course,
        assignments: course.assignments || []
      })) as Course[];
    },
    staleTime: 30000, // Cache 30 secondes
    gcTime: 5 * 60 * 1000, // Garder en cache 5 minutes
  });

  const fetchCourses = async () => {
    // Invalider le cache pour forcer un refresh
    queryClient.invalidateQueries({ queryKey: ['courses'] });
  };

  const updateCourseStatus = async (courseId: number, vacant: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ vacant })
        .eq('id', courseId);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        throw new Error(`Erreur de mise à jour: ${error.message}`);
      }

      // Mise à jour optimiste de l'état local
      setCourses(prev => prev.map(course => 
        course.id === courseId ? { ...course, vacant } : course
      ));

      toast({
        title: "Statut mis à jour",
        description: `Cours marqué comme ${vacant ? 'vacant' : 'non vacant'}`,
        duration: 3000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Error updating course status:', error);
      
      toast({
        title: "Erreur de mise à jour",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      
      // Recharger les données en cas d'erreur
      await fetchCourses();
    }
  };

  const validateHourDistribution = (course: Course): { isValid: boolean; message?: string } => {
    if (!course.assignments || course.assignments.length === 0) {
      return {
        isValid: false,
        message: "Aucun enseignant assigné à ce cours"
      };
    }

    const totalVol1 = course.assignments.reduce((sum: number, assignment: any) => sum + (assignment.vol1_hours || 0), 0);
    const totalVol2 = course.assignments.reduce((sum: number, assignment: any) => sum + (assignment.vol2_hours || 0), 0);

    if (totalVol1 !== course.volume_total_vol1 || totalVol2 !== course.volume_total_vol2) {
      return {
        isValid: false,
        message: `Volume horaire incorrect. Attendu: Vol.1=${course.volume_total_vol1}h, Vol.2=${course.volume_total_vol2}h. Actuel: Vol.1=${totalVol1}h, Vol.2=${totalVol2}h`
      };
    }

    return { isValid: true };
  };

  // Mutation pour créer un cours
  const createCourse = useMutation({
    mutationFn: async (courseData: any) => {
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select('id,title,code,faculty,subcategory,volume_total_vol1,volume_total_vol2,vol1_total,vol2_total,academic_year,vacant')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Cours créé",
        description: "Le cours a été créé avec succès.",
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour un cours
  const updateCourse = useMutation({
    mutationFn: async ({ id, ...courseData }: Partial<Course> & { id: number }) => {
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select('id,title,code,faculty,subcategory,volume_total_vol1,volume_total_vol2,vol1_total,vol2_total,academic_year,vacant')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Cours mis à jour",
        description: "Les modifications ont été enregistrées.",
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCourseStatus = async (courseId: number, vacant: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ vacant })
        .eq('id', courseId);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        throw new Error(`Erreur de mise à jour: ${error.message}`);
      }

      // Invalider le cache pour recharger
      queryClient.invalidateQueries({ queryKey: ['courses'] });

      toast({
        title: "Statut mis à jour",
        description: `Cours marqué comme ${vacant ? 'vacant' : 'non vacant'}`,
        duration: 2000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Error updating course status:', error);
      
      toast({
        title: "Erreur de mise à jour",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return {
    courses,
    loading,
    isLoading: loading, // Alias pour compatibilité
    error: queryError ? (queryError instanceof Error ? queryError.message : 'Erreur inconnue') : null,
    fetchCourses,
    updateCourseStatus,
    validateHourDistribution,
    createCourse,
    updateCourse
  };
};