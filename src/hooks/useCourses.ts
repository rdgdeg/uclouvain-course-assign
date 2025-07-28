import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status?: string;
}

export interface CourseAssignment {
  id: number;
  teacher_id: number;
  is_coordinator: boolean;
  vol1_hours: number;
  vol2_hours: number;
  validated_by_coord: boolean;
  teacher: Teacher;
}

export interface Course {
  id: number;
  title: string;
  code?: string;
  start_date?: string;
  duration_weeks?: number;
  volume_total_vol1: number;
  volume_total_vol2: number;
  vacant: boolean;
  academic_year?: string;
  faculty?: string;
  subcategory?: string;
  assignments: CourseAssignment[];
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('title');

      if (coursesError) throw coursesError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('course_assignments')
        .select(`
          *,
          teacher:teachers(*)
        `);

      if (assignmentsError) throw assignmentsError;

      const coursesWithAssignments = coursesData.map(course => ({
        ...course,
        assignments: assignmentsData
          .filter(assignment => assignment.course_id === course.id)
          .map(assignment => ({
            ...assignment,
            teacher: assignment.teacher as Teacher
          }))
      }));

      setCourses(coursesWithAssignments);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les cours",
        variant: "destructive",
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

      if (error) throw error;

      setCourses(prev => prev.map(course => 
        course.id === courseId ? { ...course, vacant } : course
      ));

      toast({
        title: "Succès",
        description: `Cours marqué comme ${vacant ? 'vacant' : 'non vacant'}`,
      });
    } catch (error) {
      console.error('Error updating course status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du cours",
        variant: "destructive",
      });
    }
  };

  const validateHourDistribution = (course: Course): { isValid: boolean; message?: string } => {
    const totalVol1 = course.assignments.reduce((sum, assignment) => sum + assignment.vol1_hours, 0);
    const totalVol2 = course.assignments.reduce((sum, assignment) => sum + assignment.vol2_hours, 0);

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
    fetchCourses,
    updateCourseStatus,
    validateHourDistribution
  };
};