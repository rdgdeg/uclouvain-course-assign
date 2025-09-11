import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Users, BookOpen, Clock } from "lucide-react";
import { AttributionImportDialog } from "./AttributionImportDialog";
import { useToast } from "@/hooks/use-toast";

export const AttributionImportPanel: React.FC = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleImportSuccess = () => {
    toast({
      title: "Import réussi",
      description: "Les attributions ont été importées avec succès",
    });
    setImportDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Import des attributions</h1>
        <p className="text-muted-foreground">
          Importez les attributions de cours depuis votre fichier Excel avec toutes les colonnes spécifiques.
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours actifs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Sera mis à jour après import</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Sera mis à jour après import</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attributions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Sera mis à jour après import</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours vacants</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Sera mis à jour après import</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Excel complet
            </CardTitle>
            <CardDescription>
              Importez votre fichier Excel avec toutes les colonnes d'attribution de votre faculté.
              Le système créera automatiquement les cours, enseignants et attributions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setImportDialogOpen(true)}
              className="w-full"
              size="lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Commencer l'import
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Format attendu</CardTitle>
            <CardDescription>
              Votre fichier Excel doit contenir exactement les colonnes suivantes dans l'ordre.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="font-medium">Principales colonnes :</div>
              <ul className="text-muted-foreground space-y-1">
                <li>• Cours (code du cours)</li>
                <li>• Intitulé abrégé</li>
                <li>• Intit.Complet</li>
                <li>• Vol1. 2025, Vol2. (volumes attendus)</li>
                <li>• Nom, Prénom, Email UCL</li>
                <li>• Vol1., Vol2. (volumes attribués)</li>
                <li>• + 30 autres colonnes détaillées</li>
              </ul>
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setImportDialogOpen(true)}
                >
                  Voir format complet et télécharger template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processus d'import */}
      <Card>
        <CardHeader>
          <CardTitle>Processus d'import</CardTitle>
          <CardDescription>
            Voici ce qui se passe lors de l'import de votre fichier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">Analyse du fichier</h3>
              <p className="text-sm text-muted-foreground">
                Lecture et validation du format Excel avec toutes les colonnes
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">Création des données</h3>
              <p className="text-sm text-muted-foreground">
                Création/mise à jour des cours, enseignants et attributions
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">Rapport final</h3>
              <p className="text-sm text-muted-foreground">
                Résumé détaillé avec succès, erreurs et avertissements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog d'import */}
      <AttributionImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};