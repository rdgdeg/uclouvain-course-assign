import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface DatabaseTestResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
}

export const DatabaseTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<DatabaseTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runSimpleTests = async (): Promise<DatabaseTestResult[]> => {
    const results: DatabaseTestResult[] = [];

    try {
      // Test de connexion de base
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .limit(1);

      if (coursesError) {
        results.push({
          test: 'Connexion base de données',
          success: false,
          message: `Erreur de connexion: ${coursesError.message}`
        });
      } else {
        results.push({
          test: 'Connexion base de données',
          success: true,
          message: `Connexion réussie - ${courses?.length || 0} cours trouvés`
        });
      }

      // Test lecture enseignants
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .limit(5);

      if (teachersError) {
        results.push({
          test: 'Lecture enseignants',
          success: false,
          message: `Erreur: ${teachersError.message}`
        });
      } else {
        results.push({
          test: 'Lecture enseignants',
          success: true,
          message: `${teachers?.length || 0} enseignants trouvés`
        });
      }

      // Test lecture assignations
      const { data: assignments, error: assignmentsError } = await supabase
        .from('course_assignments')
        .select('*')
        .limit(5);

      if (assignmentsError) {
        results.push({
          test: 'Lecture assignations',
          success: false,
          message: `Erreur: ${assignmentsError.message}`
        });
      } else {
        results.push({
          test: 'Lecture assignations',
          success: true,
          message: `${assignments?.length || 0} assignations trouvées`
        });
      }

    } catch (error) {
      results.push({
        test: 'Test général',
        success: false,
        message: `Erreur inattendue: ${error}`
      });
    }

    return results;
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const results = await runSimpleTests();
      setTestResults(results);
    } catch (error) {
      console.error("Erreur lors des tests:", error);
      setTestResults([{
        test: "Test global",
        success: false,
        message: "Erreur lors de l'exécution des tests"
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleInitStatuses = async () => {
    try {
      // Fonction simplifiée d'initialisation
      const basicStatuses = [
        { name: 'Professeur', description: 'Professeur titulaire' },
        { name: 'Chargé de cours', description: 'Chargé de cours' },
        { name: 'Assistant', description: 'Assistant' }
      ];

      const { error } = await supabase
        .from('teacher_statuses')
        .upsert(basicStatuses, { onConflict: 'name' });

      if (error) {
        console.error('Erreur lors de l\'initialisation des statuts:', error);
      } else {
        console.log('Statuts des enseignants initialisés avec succès');
      }
      
      // Rafraîchir les tests après l'initialisation
      handleRunTests();
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tests de Base de Données</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button 
            onClick={handleRunTests} 
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? "Tests en cours..." : "Lancer les tests"}
          </Button>
          
          <Button 
            onClick={handleInitStatuses} 
            variant="outline"
          >
            Initialiser les statuts
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Résultats des tests :</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "✓" : "✗"}
                </Badge>
                <span className="font-medium">{result.test}:</span>
                <span className={result.success ? "text-green-600" : "text-red-600"}>
                  {result.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};