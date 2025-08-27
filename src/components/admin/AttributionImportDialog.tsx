import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AttributionImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ImportedAttribution {
  course_code: string;
  teacher_name: string;
  teacher_email: string;
  assignment_type: 'coordinator' | 'assistant' | 'lecturer' | 'tp_supervisor';
  vol1_hours: number;
  vol2_hours: number;
  notes?: string;
}

interface ImportResult {
  success: number;
  errors: string[];
  warnings: string[];
  imported: ImportedAttribution[];
}

export const AttributionImportDialog: React.FC<AttributionImportDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setImportResult(null);
    } else {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier CSV.",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (csvContent: string): ImportedAttribution[] => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('Le fichier CSV doit contenir au moins un en-tête et une ligne de données');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const attributions: ImportedAttribution[] = [];

    // Mapping des colonnes
    const columnMapping: { [key: string]: string } = {
      'code cours': 'course_code',
      'cours': 'course_code',
      'code': 'course_code',
      'nom enseignant': 'teacher_name',
      'enseignant': 'teacher_name',
      'nom': 'teacher_name',
      'email': 'teacher_email',
      'email enseignant': 'teacher_email',
      'type': 'assignment_type',
      'type attribution': 'assignment_type',
      'volume 1': 'vol1_hours',
      'vol1': 'vol1_hours',
      'volume 2': 'vol2_hours',
      'vol2': 'vol2_hours',
      'notes': 'notes',
      'remarques': 'notes'
    };

    const columnIndices: { [key: string]: number } = {};
    headers.forEach((header, index) => {
      const mappedKey = columnMapping[header];
      if (mappedKey) {
        columnIndices[mappedKey] = index;
      }
    });

    // Vérifier les colonnes obligatoires
    const requiredColumns = ['course_code', 'teacher_name', 'teacher_email', 'assignment_type', 'vol1_hours', 'vol2_hours'];
    const missingColumns = requiredColumns.filter(col => !(col in columnIndices));
    
    if (missingColumns.length > 0) {
      throw new Error(`Colonnes manquantes : ${missingColumns.join(', ')}`);
    }

    // Parser chaque ligne
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (values.length < headers.length) {
        console.warn(`Ligne ${i + 1} ignorée : nombre de colonnes incorrect`);
        continue;
      }

      const attribution: ImportedAttribution = {
        course_code: values[columnIndices.course_code] || '',
        teacher_name: values[columnIndices.teacher_name] || '',
        teacher_email: values[columnIndices.teacher_email] || '',
        assignment_type: values[columnIndices.assignment_type] as any || 'lecturer',
        vol1_hours: parseFloat(values[columnIndices.vol1_hours]) || 0,
        vol2_hours: parseFloat(values[columnIndices.vol2_hours]) || 0,
        notes: values[columnIndices.notes] || undefined
      };

      // Validation basique
      if (attribution.course_code && attribution.teacher_name && attribution.teacher_email) {
        attributions.push(attribution);
      }
    }

    return attributions;
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    const result: ImportResult = {
      success: 0,
      errors: [],
      warnings: [],
      imported: []
    };

    try {
      const csvContent = await selectedFile.text();
      const attributions = parseCSV(csvContent);

      for (const attr of attributions) {
        try {
          // Vérifier si le cours existe
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('id')
            .eq('code', attr.course_code)
            .single();

          if (courseError || !courseData) {
            result.errors.push(`Cours non trouvé : ${attr.course_code}`);
            continue;
          }

          // Vérifier si l'enseignant existe
          let teacherId: number;
          const { data: teacherData, error: teacherError } = await supabase
            .from('teachers')
            .select('id')
            .eq('email', attr.teacher_email)
            .single();

          if (teacherError || !teacherData) {
            // Créer l'enseignant s'il n'existe pas
            const nameParts = attr.teacher_name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const { data: newTeacher, error: createError } = await supabase
              .from('teachers')
              .insert({
                first_name: firstName,
                last_name: lastName,
                email: attr.teacher_email
              })
              .select('id')
              .single();

            if (createError || !newTeacher) {
              result.errors.push(`Impossible de créer l'enseignant : ${attr.teacher_email}`);
              continue;
            }

            teacherId = newTeacher.id;
            result.warnings.push(`Enseignant créé : ${attr.teacher_name}`);
          } else {
            teacherId = teacherData.id;
          }

          // Créer l'attribution
          const { error: attrError } = await supabase
            .from('hour_attributions')
            .upsert({
              course_id: courseData.id,
              teacher_id: teacherId,
              assignment_type: attr.assignment_type,
              vol1_hours: attr.vol1_hours,
              vol2_hours: attr.vol2_hours,
              notes: attr.notes
            }, {
              onConflict: 'course_id,teacher_id,assignment_type'
            });

          if (attrError) {
            result.errors.push(`Erreur attribution ${attr.course_code} - ${attr.teacher_name}: ${attrError.message}`);
          } else {
            result.success++;
            result.imported.push(attr);
          }

          // Si c'est un coordinateur, créer/mettre à jour l'entrée coordinateur
          if (attr.assignment_type === 'coordinator') {
            await supabase
              .from('course_coordinators')
              .upsert({
                course_id: courseData.id,
                teacher_id: teacherId,
                email: attr.teacher_email,
                name: attr.teacher_name,
                is_primary: true
              }, {
                onConflict: 'course_id,teacher_id'
              });
          }

        } catch (error) {
          console.error('Erreur lors du traitement de l\'attribution:', error);
          result.errors.push(`Erreur ${attr.course_code}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      }

      setImportResult(result);

      if (result.success > 0) {
        toast({
          title: "Import réussi",
          description: `${result.success} attributions importées avec succès.`,
        });

        onSuccess?.();
      }

      if (result.errors.length > 0) {
        toast({
          title: "Import partiellement réussi",
          description: `${result.errors.length} erreurs rencontrées.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImportResult(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Import des attributions d'heures
          </DialogTitle>
          <DialogDescription>
            Importez les attributions d'heures depuis un fichier CSV avec les coordinateurs et enseignants
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="import" className="space-y-4">
          <TabsList>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="format">Format attendu</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Format du fichier CSV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Colonnes requises :</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code>Code cours</code> - Code du cours (ex: WMEDE1159)</li>
                    <li><code>Nom enseignant</code> - Nom complet de l'enseignant</li>
                    <li><code>Email enseignant</code> - Adresse email de l'enseignant</li>
                    <li><code>Type attribution</code> - coordinator, assistant, lecturer, tp_supervisor</li>
                    <li><code>Volume 1</code> - Nombre d'heures volume 1</li>
                    <li><code>Volume 2</code> - Nombre d'heures volume 2</li>
                    <li><code>Notes</code> - Remarques (optionnel)</li>
                  </ul>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Les enseignants non existants seront créés automatiquement.
                    Les coordinateurs seront automatiquement ajoutés à la table des coordinateurs.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            {!importResult ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="attribution-file">Fichier CSV</Label>
                      <Input
                        id="attribution-file"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={importing}
                      />
                    </div>

                    {selectedFile && (
                      <Alert>
                        <FileSpreadsheet className="h-4 w-4" />
                        <AlertDescription>
                          Fichier sélectionné : {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleClose} disabled={importing}>
                        Annuler
                      </Button>
                      <Button 
                        onClick={handleImport} 
                        disabled={!selectedFile || importing}
                        className="flex items-center gap-2"
                      >
                        {importing ? (
                          <>
                            <LoadingSpinner />
                            Import en cours...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Importer
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Résultat de l'import
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {importResult.success} succès
                      </Badge>
                      {importResult.errors.length > 0 && (
                        <Badge variant="destructive">
                          {importResult.errors.length} erreurs
                        </Badge>
                      )}
                      {importResult.warnings.length > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {importResult.warnings.length} avertissements
                        </Badge>
                      )}
                    </div>

                    {importResult.errors.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Erreurs :</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                          {importResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {importResult.warnings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-600 mb-2">Avertissements :</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-600">
                          {importResult.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {importResult.imported.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Attributions importées ({importResult.imported.length}) :</h4>
                        <div className="max-h-40 overflow-y-auto">
                          <div className="space-y-2">
                            {importResult.imported.slice(0, 10).map((attr, index) => (
                              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                                <strong>{attr.course_code}</strong> - {attr.teacher_name} ({attr.assignment_type}) 
                                - Vol1: {attr.vol1_hours}h, Vol2: {attr.vol2_hours}h
                              </div>
                            ))}
                            {importResult.imported.length > 10 && (
                              <div className="text-sm text-gray-500 text-center">
                                ... et {importResult.imported.length - 10} autres
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>
                    Nouvel import
                  </Button>
                  <Button onClick={handleClose}>
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};