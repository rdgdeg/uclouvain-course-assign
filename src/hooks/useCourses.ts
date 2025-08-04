import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Course, Teacher, TeacherAssignment } from "@/types/index";

// Export des types pour la compatibilité
export type { Course, Teacher, TeacherAssignment };

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Requête optimisée avec jointure
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          assignments:course_assignments(
            *,
            teacher:teachers(*)
          )
        `)
        .order('title');

      if (coursesError) {
        console.error('Erreur lors de la récupération des cours:', coursesError);
        throw new Error(`Erreur base de données: ${coursesError.message}`);
      }

      if (!coursesData) {
        throw new Error('Aucune donnée reçue du serveur');
      }

      // Transformer les données pour correspondre à l'interface
      const coursesWithAssignments = coursesData.map(course => ({
        ...course,
        assignments: course.assignments || []
      }));

      setCourses(coursesWithAssignments);
      
      // Notification de succès discrète
      toast({
        title: "Données mises à jour",
        description: `${coursesWithAssignments.length} cours chargés`,
        duration: 2000,
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Error fetching courses:', error);
      setError(errorMessage);
      
      toast({
        title: "Erreur de chargement",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    updateCourseStatus,
    validateHourDistribution
  };
};