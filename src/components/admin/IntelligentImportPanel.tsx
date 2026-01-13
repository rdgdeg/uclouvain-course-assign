import React, { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Download, 
  FileText, 
  Users, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Database,
  Smartphone,
  Zap
} from "lucide-react";

interface ImportConfig {
  type: 'teachers' | 'courses';
  columnMapping: Record<string, string>;
  validation: {
    checkDuplicates: boolean;
    validateEmail: boolean;
    autoStatus: boolean;
    checkVolumes: boolean;
    autoDetectVacant: boolean;
  };
  autoActions: {
    setDefaultStatus: string;
    assignFaculty: boolean;
    createMissingFaculties: boolean;
    setDefaultYear: string;
  };
}

interface ImportResult {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value?: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
    value?: string;
  }>;
}

interface CSVRow {
  [key: string]: string;
}

export const IntelligentImportPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'courses'>('teachers');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<CSVRow[]>([]);
  const [importConfig, setImportConfig] = useState<ImportConfig>({
    type: 'teachers',
    columnMapping: {},
    validation: {
      checkDuplicates: true,
      validateEmail: true,
      autoStatus: true,
      checkVolumes: true,
      autoDetectVacant: true,
    },
    autoActions: {
      setDefaultStatus: 'active',
      assignFaculty: true,
      createMissingFaculties: false,
      setDefaultYear: '2026-2027',
    },
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'validate' | 'import'>('upload');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Configuration des colonnes par type
  const getColumnConfig = (type: 'teachers' | 'courses') => {
    if (type === 'teachers') {
      return {
        firstName: { label: 'Prénom', required: true },
        lastName: { label: 'Nom', required: true },
        email: { label: 'Email', required: true },
        status: { label: 'Statut', required: false },
        faculty: { label: 'Faculté', required: false },
        phone: { label: 'Téléphone', required: false },
      };
    } else {
      return {
        title: { label: 'Titre du cours', required: true },
        code: { label: 'Code du cours', required: true },
        faculty: { label: 'Faculté', required: true },
        subcategory: { label: 'École/Département', required: false },
        volume_total_vol1: { label: 'Volume Vol1 (h)', required: true },
        volume_total_vol2: { label: 'Volume Vol2 (h)', required: true },
        academic_year: { label: 'Année académique', required: false },
        start_date: { label: 'Date de début', required: false },
        duration_weeks: { label: 'Durée (semaines)', required: false },
        vacant: { label: 'Vacant', required: false },
      };
    }
  };

  // Gestion du fichier CSV
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const csvHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const csvData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: CSVRow = {};
          csvHeaders.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

      setHeaders(csvHeaders);
      setCsvData(csvData);
      setPreviewData(csvData.slice(0, 5));
      
      // Mapping automatique des colonnes
      const columnConfig = getColumnConfig(activeTab);
      const autoMapping: Record<string, string> = {};
      
      csvHeaders.forEach(header => {
        const lowerHeader = header.toLowerCase();
        Object.entries(columnConfig).forEach(([key, config]) => {
          if (lowerHeader.includes(config.label.toLowerCase()) || 
              lowerHeader.includes(key) ||
              config.label.toLowerCase().includes(lowerHeader)) {
            autoMapping[key] = header;
          }
        });
      });

      setImportConfig(prev => ({
        ...prev,
        columnMapping: autoMapping,
      }));

      setCurrentStep('configure');
    };
    reader.readAsText(file);
  }, [activeTab]);

  // Validation des données
  const validateData = useCallback(() => {
    const errors: ImportResult['errors'] = [];
    const warnings: ImportResult['warnings'] = [];

    csvData.forEach((row, index) => {
      const rowNumber = index + 2; // +2 car index 0 et header

      if (activeTab === 'teachers') {
        // Validation enseignants
        const firstName = row[importConfig.columnMapping.firstName || ''];
        const lastName = row[importConfig.columnMapping.lastName || ''];
        const email = row[importConfig.columnMapping.email || ''];

        if (!firstName?.trim()) {
          errors.push({ row: rowNumber, field: 'firstName', message: 'Prénom requis' });
        }
        if (!lastName?.trim()) {
          errors.push({ row: rowNumber, field: 'lastName', message: 'Nom requis' });
        }
        if (!email?.trim()) {
          errors.push({ row: rowNumber, field: 'email', message: 'Email requis' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push({ row: rowNumber, field: 'email', message: 'Format email invalide', value: email });
        }

        // Vérification des doublons
        if (importConfig.validation.checkDuplicates) {
          const duplicateIndex = csvData.findIndex((r, i) => 
            i !== index && 
            r[importConfig.columnMapping.email || ''] === email
          );
          if (duplicateIndex !== -1) {
            warnings.push({ 
              row: rowNumber, 
              field: 'email', 
              message: `Doublon potentiel avec ligne ${duplicateIndex + 2}`, 
              value: email 
            });
          }
        }
      } else {
        // Validation cours
        const title = row[importConfig.columnMapping.title || ''];
        const code = row[importConfig.columnMapping.code || ''];
        const vol1 = row[importConfig.columnMapping.volume_total_vol1 || ''];
        const vol2 = row[importConfig.columnMapping.volume_total_vol2 || ''];

        if (!title?.trim()) {
          errors.push({ row: rowNumber, field: 'title', message: 'Titre requis' });
        }
        if (!code?.trim()) {
          errors.push({ row: rowNumber, field: 'code', message: 'Code requis' });
        }
        if (!vol1 || isNaN(Number(vol1))) {
          errors.push({ row: rowNumber, field: 'volume_total_vol1', message: 'Volume Vol1 invalide', value: vol1 });
        }
        if (!vol2 || isNaN(Number(vol2))) {
          errors.push({ row: rowNumber, field: 'volume_total_vol2', message: 'Volume Vol2 invalide', value: vol2 });
        }

        // Détection automatique du statut vacant
        if (importConfig.validation.autoDetectVacant) {
          const totalVolume = Number(vol1) + Number(vol2);
          if (totalVolume === 0) {
            warnings.push({ 
              row: rowNumber, 
              field: 'vacant', 
              message: 'Volume total = 0, cours marqué comme vacant', 
              value: 'true' 
            });
          }
        }
      }
    });

    return { errors, warnings };
  }, [csvData, importConfig, activeTab]);

  // Import des données
  const importMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      setCurrentStep('import');

      const { errors, warnings } = validateData();
      let inserted = 0;
      let updated = 0;
      let skipped = 0;

      // Filtrer les lignes avec erreurs
      const validRows = csvData.filter((_, index) => 
        !errors.some(e => e.row === index + 2)
      );

      for (const row of validRows) {
        try {
          if (activeTab === 'teachers') {
            const teacherData = {
              first_name: row[importConfig.columnMapping.firstName || ''],
              last_name: row[importConfig.columnMapping.lastName || ''],
              email: row[importConfig.columnMapping.email || ''],
              status: row[importConfig.columnMapping.status || ''] || importConfig.autoActions.setDefaultStatus,
            };

            // Vérifier si l'enseignant existe déjà
            const { data: existing } = await supabase
              .from('teachers')
              .select('id')
              .eq('email', teacherData.email)
              .single();

            if (existing) {
              // Mettre à jour
              await supabase
                .from('teachers')
                .update(teacherData)
                .eq('id', existing.id);
              updated++;
            } else {
              // Insérer
              await supabase
                .from('teachers')
                .insert([teacherData]);
              inserted++;
            }
          } else {
            const courseData = {
              title: row[importConfig.columnMapping.title || ''],
              code: row[importConfig.columnMapping.code || ''],
              faculty: row[importConfig.columnMapping.faculty || ''],
              subcategory: row[importConfig.columnMapping.subcategory || ''],
              volume_total_vol1: Number(row[importConfig.columnMapping.volume_total_vol1 || '0']),
              volume_total_vol2: Number(row[importConfig.columnMapping.volume_total_vol2 || '0']),
              academic_year: row[importConfig.columnMapping.academic_year || ''] || importConfig.autoActions.setDefaultYear,
              start_date: row[importConfig.columnMapping.start_date || ''],
              duration_weeks: row[importConfig.columnMapping.duration_weeks || ''] ? Number(row[importConfig.columnMapping.duration_weeks || '0']) : null,
              vacant: row[importConfig.columnMapping.vacant || ''] === 'true' || 
                     (importConfig.validation.autoDetectVacant && 
                      Number(row[importConfig.columnMapping.volume_total_vol1 || '0']) + 
                      Number(row[importConfig.columnMapping.volume_total_vol2 || '0']) === 0),
            };

            // Vérifier si le cours existe déjà
            const { data: existing } = await supabase
              .from('courses')
              .select('id')
              .eq('code', courseData.code)
              .eq('academic_year', courseData.academic_year)
              .single();

            if (existing) {
              // Mettre à jour
              await supabase
                .from('courses')
                .update(courseData)
                .eq('id', existing.id);
              updated++;
            } else {
              // Insérer
              await supabase
                .from('courses')
                .insert([courseData]);
              inserted++;
            }
          }
        } catch (error) {
          console.error('Erreur lors de l\'import:', error);
          skipped++;
        }
      }

      const result: ImportResult = {
        total: csvData.length,
        inserted,
        updated,
        skipped,
        errors,
        warnings,
      };

      setImportResult(result);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      
      toast({
        title: "Import terminé",
        description: `${result.inserted} insérés, ${result.updated} mis à jour, ${result.skipped} ignorés`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de l'import",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const handleImport = () => {
    const { errors } = validateData();
    if (errors.length > 0) {
      toast({
        title: "Erreurs de validation",
        description: `${errors.length} erreur(s) à corriger avant l'import`,
        variant: "destructive",
      });
      return;
    }
    importMutation.mutate();
  };

  const resetImport = () => {
    setCsvData([]);
    setHeaders([]);
    setPreviewData([]);
    setImportResult(null);
    setCurrentStep('upload');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Intelligent - {activeTab === 'teachers' ? 'Enseignants' : 'Cours'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'teachers' | 'courses')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Enseignants
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Cours
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Étape 1: Upload */}
      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>1. Upload du fichier CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <Label htmlFor="csv-upload" className="cursor-pointer">
                  <Button variant="outline">
                    Choisir un fichier CSV
                  </Button>
                </Label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Glissez-déposez votre fichier CSV ou cliquez pour le sélectionner
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Format attendu :</h4>
                {activeTab === 'teachers' ? (
                  <div className="text-sm text-blue-800">
                    <p>• Prénom, Nom, Email (obligatoires)</p>
                    <p>• Statut, Faculté, Téléphone (optionnels)</p>
                    <p>• L'import détectera automatiquement les colonnes</p>
                  </div>
                ) : (
                  <div className="text-sm text-blue-800">
                    <p>• Titre, Code, Faculté, Volumes (obligatoires)</p>
                    <p>• École, Année, Date début, Durée (optionnels)</p>
                    <p>• Détection automatique du statut vacant</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 2: Configuration */}
      {currentStep === 'configure' && (
        <Card>
          <CardHeader>
            <CardTitle>2. Configuration de l'import</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Mapping des colonnes */}
              <div>
                <h4 className="font-medium mb-3">Mapping des colonnes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(getColumnConfig(activeTab)).map(([key, config]) => (
                    <div key={key}>
                      <Label className="text-sm font-medium">
                        {config.label} {config.required && <span className="text-red-500">*</span>}
                      </Label>
                      <Select
                        value={importConfig.columnMapping[key] || ''}
                        onValueChange={(value) => setImportConfig(prev => ({
                          ...prev,
                          columnMapping: { ...prev.columnMapping, [key]: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une colonne" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Aucune</SelectItem>
                          {headers.map(header => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Options de validation */}
              <div>
                <h4 className="font-medium mb-3">Options de validation</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="checkDuplicates"
                      checked={importConfig.validation.checkDuplicates}
                      onCheckedChange={(checked) => setImportConfig(prev => ({
                        ...prev,
                        validation: { ...prev.validation, checkDuplicates: checked as boolean }
                      }))}
                    />
                    <Label htmlFor="checkDuplicates">Vérifier les doublons</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="validateEmail"
                      checked={importConfig.validation.validateEmail}
                      onCheckedChange={(checked) => setImportConfig(prev => ({
                        ...prev,
                        validation: { ...prev.validation, validateEmail: checked as boolean }
                      }))}
                    />
                    <Label htmlFor="validateEmail">Valider le format des emails</Label>
                  </div>
                  {activeTab === 'courses' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoDetectVacant"
                        checked={importConfig.validation.autoDetectVacant}
                        onCheckedChange={(checked) => setImportConfig(prev => ({
                          ...prev,
                          validation: { ...prev.validation, autoDetectVacant: checked as boolean }
                        }))}
                      />
                      <Label htmlFor="autoDetectVacant">Détection automatique du statut vacant</Label>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions automatiques */}
              <div>
                <h4 className="font-medium mb-3">Actions automatiques</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTab === 'teachers' && (
                    <div>
                      <Label>Statut par défaut</Label>
                      <Select
                        value={importConfig.autoActions.setDefaultStatus}
                        onValueChange={(value) => setImportConfig(prev => ({
                          ...prev,
                          autoActions: { ...prev.autoActions, setDefaultStatus: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="inactive">Inactif</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {activeTab === 'courses' && (
                    <div>
                      <Label>Année académique par défaut</Label>
                      <Select
                        value={importConfig.autoActions.setDefaultYear}
                        onValueChange={(value) => setImportConfig(prev => ({
                          ...prev,
                          autoActions: { ...prev.autoActions, setDefaultYear: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2026-2027">2026-2027</SelectItem>
                          <SelectItem value="2025-2026">2025-2026</SelectItem>
                          <SelectItem value="2023-2024">2023-2024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Aperçu des données */}
              <div>
                <h4 className="font-medium mb-3">Aperçu des données</h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <div className="grid grid-cols-4 gap-2 text-sm font-medium">
                      {headers.slice(0, 4).map(header => (
                        <div key={header}>{header}</div>
                      ))}
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {previewData.map((row, index) => (
                      <div key={index} className="p-3 border-b grid grid-cols-4 gap-2 text-sm">
                        {headers.slice(0, 4).map(header => (
                          <div key={header} className="truncate">
                            {row[header] || '-'}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={resetImport}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recommencer
                </Button>
                <Button onClick={() => setCurrentStep('validate')}>
                  Valider et continuer
                  <Eye className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 3: Validation */}
      {currentStep === 'validate' && (
        <Card>
          <CardHeader>
            <CardTitle>3. Validation des données</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const { errors, warnings } = validateData();
                return (
                  <>
                    {errors.length > 0 && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{errors.length} erreur(s) détectée(s) :</strong>
                          <div className="mt-2 max-h-32 overflow-y-auto">
                            {errors.map((error, index) => (
                              <div key={index} className="text-sm">
                                Ligne {error.row}: {error.message}
                                {error.value && ` (${error.value})`}
                              </div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {warnings.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{warnings.length} avertissement(s) :</strong>
                          <div className="mt-2 max-h-32 overflow-y-auto">
                            {warnings.map((warning, index) => (
                              <div key={index} className="text-sm">
                                Ligne {warning.row}: {warning.message}
                                {warning.value && ` (${warning.value})`}
                              </div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {errors.length === 0 && warnings.length === 0 && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Aucune erreur détectée. Les données sont prêtes pour l'import.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCurrentStep('configure')}>
                        Retour à la configuration
                      </Button>
                      {errors.length === 0 && (
                        <Button onClick={handleImport}>
                          <Database className="h-4 w-4 mr-2" />
                          Importer les données
                        </Button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 4: Import */}
      {currentStep === 'import' && (
        <Card>
          <CardHeader>
            <CardTitle>4. Import en cours...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={isProcessing ? 50 : 100} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                {isProcessing ? 'Import en cours...' : 'Import terminé'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de l'import</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
                  <div className="text-sm text-blue-800">Total</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.inserted}</div>
                  <div className="text-sm text-green-800">Insérés</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{importResult.updated}</div>
                  <div className="text-sm text-yellow-800">Mis à jour</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResult.skipped}</div>
                  <div className="text-sm text-red-800">Ignorés</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={resetImport}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nouvel import
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter le rapport
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 