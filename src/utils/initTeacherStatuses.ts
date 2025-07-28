import { supabase } from "@/integrations/supabase/client";
import { TEACHER_STATUSES } from "./teacherStatuses";

export const initializeTeacherStatuses = async () => {
  try {
    console.log("🔧 Initialisation des statuts de personnes...");
    
    // Insérer les statuts dans la table teacher_statuses
    const statusData = TEACHER_STATUSES.map(status => ({
      id: status.id,
      label: status.label,
      description: status.description,
      warning: status.warning || null,
      payment_info: status.paymentInfo || null
    }));

    const { data, error } = await supabase
      .from('teacher_statuses')
      .upsert(statusData, {
        onConflict: 'id'
      })
      .select();

    if (error) {
      console.error("❌ Erreur lors de l'initialisation des statuts:", error);
      return { success: false, error };
    }

    console.log("✅ Statuts de personnes initialisés avec succès:", data);
    return { success: true, data };
    
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    return { success: false, error };
  }
};

// Fonction pour récupérer les statuts depuis la base de données
export const getTeacherStatusesFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('teacher_statuses')
      .select('*')
      .order('id');

    if (error) {
      console.error("❌ Erreur lors de la récupération des statuts:", error);
      return { success: false, error };
    }

    return { success: true, data };
    
  } catch (error) {
    console.error("❌ Erreur lors de la récupération:", error);
    return { success: false, error };
  }
}; 