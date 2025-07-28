import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zbzvsyjurbiiwkioehca.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienZzeWp1cmJpaXdraW9laGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzM0MzEsImV4cCI6MjA2ODQwOTQzMX0.N9JizpZu40IjTZVBhyA5EOrzTe4msJPZmH53xFgj4yI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testDatabaseConnection() {
  console.log('🔍 Test de connexion à la base de données Supabase...\n');

  try {
    // Test 1: Connexion de base
    console.log('1️⃣ Test de connexion de base...');
    const { data: testData, error: testError } = await supabase
      .from('courses')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError.message);
      return false;
    }
    console.log('✅ Connexion réussie!\n');

    // Test 2: Vérification des tables principales
    console.log('2️⃣ Vérification des tables principales...');
    const tables = ['courses', 'teachers', 'course_assignments', 'assignment_proposals', 'modification_requests'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK (${data?.length || 0} enregistrements testés)`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: Erreur - ${err.message}`);
      }
    }
    console.log('');

    // Test 3: Comptage des données
    console.log('3️⃣ Comptage des données...');
    const { data: coursesCount, error: coursesError } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });
    
    const { data: teachersCount, error: teachersError } = await supabase
      .from('teachers')
      .select('*', { count: 'exact', head: true });
    
    const { data: proposalsCount, error: proposalsError } = await supabase
      .from('assignment_proposals')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Cours: ${coursesError ? 'Erreur' : coursesCount || 0}`);
    console.log(`👥 Enseignants: ${teachersError ? 'Erreur' : teachersCount || 0}`);
    console.log(`📝 Propositions: ${proposalsError ? 'Erreur' : proposalsCount || 0}`);
    console.log('');

    // Test 4: Test d'insertion/lecture
    console.log('4️⃣ Test d\'insertion/lecture...');
    const testProposal = {
      submitter_name: 'Test User',
      submitter_email: 'test@example.com',
      proposal_data: { test: true },
      status: 'pending'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('assignment_proposals')
      .insert(testProposal)
      .select();

    if (insertError) {
      console.log(`❌ Test d'insertion: ${insertError.message}`);
    } else {
      console.log('✅ Test d\'insertion réussi');
      
      // Nettoyage du test
      if (insertData && insertData[0]) {
        await supabase
          .from('assignment_proposals')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Données de test nettoyées');
      }
    }

    console.log('\n🎉 Tous les tests de base de données sont terminés!');
    return true;

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    return false;
  }
}

testDatabaseConnection(); 