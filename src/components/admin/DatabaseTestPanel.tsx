import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { testDatabaseConnection, testProposalSubmission } from "@/utils/dbTest";
import { initializeTeacherStatuses } from "@/utils/initTeacherStatuses";

export const DatabaseTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    const results = await testDatabaseConnection();
    setTestResults(results);
    setIsLoading(false);
  };

  const runProposalTest = async () => {
    setIsLoading(true);
    const results = await testProposalSubmission();
    setTestResults(results);
    setIsLoading(false);
  };

  const runStatusInit = async () => {
    setIsLoading(true);
    const results = await initializeTeacherStatuses();
    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Test de Base de Données
          <Badge variant="outline">Debug</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={runConnectionTest} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Test en cours..." : "Tester la connexion"}
          </Button>
          <Button 
            onClick={runProposalTest} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Test en cours..." : "Tester les propositions"}
          </Button>
          <Button 
            onClick={runStatusInit} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Initialisation..." : "Initialiser les statuts"}
          </Button>
        </div>

        {testResults && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Résultats du test :</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Ouvrez la console du navigateur (F12) pour voir les logs détaillés.</p>
        </div>
      </CardContent>
    </Card>
  );
}; 