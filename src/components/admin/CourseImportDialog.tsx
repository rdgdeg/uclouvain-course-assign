import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { parseCSV, validateVacantCourses, VacantCourse } from "@/utils/csvParser";
import { supabase } from "@/integrations/supabase/client";

export const CourseImportDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
    preview: VacantCourse[];
  } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({ title: "Aucun fichier sélectionné", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    try {
      // Lire le fichier
      const text = await selectedFile.text();
      
      // Parser le CSV
      const parsedCourses = parseCSV(text);
      
      // Valider les données
      const { valid: validCourses, errors } = validateVacantCourses(parsedCourses);
      
      if (errors.length > 0) {
        setImportResults({
          success: 0,
          errors,
          preview: []
        });
        toast({ 
          title: "Erreurs de validation", 
          description: `${errors.length} erreur(s) trouvée(s)`,
          variant: "destructive" 
        });
        return;
      }

      // Importer dans la base de données
      const importPromises = validCourses.map(async (course) => {
        const { error } = await supabase
          .from('courses')
          .upsert([{
            code: course.code,
            title: course.nom_fr,
            title_en: course.nom_en,
            faculty: course.faculte,
            subcategory: course.sous_categorie,
            volume_vol1: course.volume_vol1,
            volume_vol2: course.volume_vol2,
            vacant: true,
            partial_vacancy: false
          }], {
            onConflict: 'code'
          });

        return { course, error };
      });

      const results = await Promise.all(importPromises);
      const successful = results.filter(r => !r.error).length;
      const failed = results.filter(r => r.error).length;

      setImportResults({
        success: successful,
        errors: failed > 0 ? [`${failed} cours n'ont pas pu être importés`] : [],
        preview: validCourses.slice(0, 5) // Afficher les 5 premiers pour prévisualisation
      });

      if (successful > 0) {
        toast({ 
          title: "Import réussi", 
          description: `${successful} cours importés avec succès` 
        });
      }

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast({ 
        title: "Erreur d'import", 
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive" 
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImportResults(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4" /> Importer des cours
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importer des cours vacants</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!importResults ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fichier CSV/Excel</label>
                <Input 
                  type="file" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  onChange={handleFileChange} 
                />
                <p className="text-xs text-muted-foreground">
                  Format attendu : Code, Nom français, Nom anglais (optionnel), Volume Vol.1, Volume Vol.2, Faculté (optionnel), Sous-catégorie (optionnel)
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleImport} 
                  disabled={!selectedFile || isImporting} 
                  className="flex-1"
                >
                  {isImporting ? "Import en cours..." : "Importer"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {importResults.success > 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">
                  {importResults.success > 0 
                    ? `${importResults.success} cours importés avec succès`
                    : "Aucun cours importé"
                  }
                </span>
              </div>

              {importResults.errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <h4 className="font-medium text-red-800 mb-2">Erreurs :</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importResults.preview.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Aperçu des cours importés :</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {importResults.preview.map((course, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-50 rounded mb-1">
                        <strong>{course.code}</strong> - {course.nom_fr}
                        <br />
                        <span className="text-muted-foreground">
                          Vol.1: {course.volume_vol1}h, Vol.2: {course.volume_vol2}h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={resetForm} className="w-full">
                Fermer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 