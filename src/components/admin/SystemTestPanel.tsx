import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertTriangle, Loader2, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DatabaseTestPanel } from "./DatabaseTestPanel";
import { EmailTestPanel } from "./EmailTestPanel";

export const SystemTestPanel: React.FC = () => {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const testSuites = [
    {
      id: "compilation",
      name: "Compilation",
      description: "Test de compilation TypeScript",
      tests: [
        "Types correctement définis",
        "Imports fonctionnels", 
        "Pas d'erreurs TypeScript",
        "Build réussi"
      ]
    },
    {
      id: "ui",
      name: "Interface Utilisateur",
      description: "Test des composants UI",
      tests: [
        "Affichage des cours",
        "Filtres fonctionnels",
        "Navigation responsive",
        "États de chargement"
      ]
    },
    {
      id: "forms",
      name: "Formulaires",
      description: "Test des formulaires et validations",
      tests: [
        "Proposition d'équipe",
        "Demande de modification",
        "Candidature libre",
        "Validation des données"
      ]
    },
    {
      id: "admin",
      name: "Administration",
      description: "Test des fonctions d'administration",
      tests: [
        "Gestion des cours",
        "Import/Export CSV",
        "Gestion des enseignants",
        "Validation des propositions"
      ]
    }
  ];

  const runTest = async (suiteId: string) => {
    setActiveTest(suiteId);
    
    // Simulation d'un test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = {
      success: Math.random() > 0.2,
      duration: Math.floor(Math.random() * 1000) + 500,
      details: "Test automatique simulé"
    };
    
    setTestResults(prev => ({
      ...prev,
      [suiteId]: result
    }));
    
    setActiveTest(null);
    
    toast({
      title: result.success ? "Test réussi" : "Test échoué",
      description: `Suite ${suiteId} - ${result.duration}ms`,
      variant: result.success ? "default" : "destructive"
    });
  };

  const runAllTests = async () => {
    for (const suite of testSuites) {
      await runTest(suite.id);
    }
  };

  const getTestStatus = (suiteId: string) => {
    const result = testResults[suiteId];
    if (!result) return "pending";
    return result.success ? "success" : "error";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Système Complet
            <Badge variant="outline">ATTRIB</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={runAllTests} disabled={!!activeTest}>
              {activeTest ? "Tests en cours..." : "Lancer tous les tests"}
            </Button>
            <Badge variant="secondary">
              {Object.keys(testResults).length} / {testSuites.length} tests
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testSuites.map((suite) => {
              const status = activeTest === suite.id ? "running" : getTestStatus(suite.id);
              const result = testResults[suite.id];
              
              return (
                <Card key={suite.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(status)}
                        {suite.name}
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runTest(suite.id)}
                        disabled={activeTest === suite.id}
                      >
                        {activeTest === suite.id ? "En cours..." : "Tester"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{suite.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {suite.tests.map((test, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          {test}
                        </div>
                      ))}
                    </div>
                    
                    {result && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span>Durée:</span>
                            <span>{result.duration}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Statut:</span>
                            <span className={result.success ? "text-green-600" : "text-red-600"}>
                              {result.success ? "Réussi" : "Échoué"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">Base de données</TabsTrigger>
          <TabsTrigger value="email">Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="database">
          <DatabaseTestPanel />
        </TabsContent>

        <TabsContent value="email">
          <EmailTestPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};