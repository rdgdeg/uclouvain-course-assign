import { supabase } from "@/integrations/supabase/client";

export const testDatabaseConnection = async () => {
  try {
    console.log("🔍 Test de connexion à Supabase...");
    
    // Test de connexion basique
    const { data, error } = await supabase
      .from('courses')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error("❌ Erreur de connexion:", error);
      return { success: false, error };
    }
    
    console.log("✅ Connexion réussie à Supabase");
    
    // Vérifier les tables nécessaires
    const tablesToCheck = [
      'courses',
      'teachers', 
      'course_assignments',
      'assignment_proposals',
      'admin_validations'
    ];
    
    console.log("🔍 Vérification des tables...");
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.warn(`⚠️ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK`);
        }
      } catch (err) {
        console.warn(`⚠️ Table ${table}: Erreur lors de la vérification`);
      }
    }
    
    return { success: true };
    
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
    return { success: false, error };
  }
};

export const testProposalSubmission = async () => {
  try {
    console.log("🧪 Test de soumission de proposition...");
    
    const testProposal = {
      submitter_name: "Test User",
      submitter_email: "test@example.com",
      proposal_data: {
        type: 'test_proposal',
        coordonnateur: {
          nom: "Dupont",
          prenom: "Jean",
          entite: "Test Entity",
          grade: "Professeur",
          vol1: 10,
          vol2: 5
        },
        cotitulaires: []
      },
      status: 'pending',
      submission_date: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('assignment_proposals')
      .insert([testProposal])
      .select()
      .single();
    
    if (error) {
      console.error("❌ Erreur lors du test de soumission:", error);
      return { success: false, error };
    }
    
    console.log("✅ Test de soumission réussi:", data);
    
    // Nettoyer le test
    await supabase
      .from('assignment_proposals')
      .delete()
      .eq('id', data.id);
    
    console.log("🧹 Test nettoyé");
    
    return { success: true, data };
    
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
    return { success: false, error };
  }
}; 