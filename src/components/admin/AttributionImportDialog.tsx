import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertCircle, CheckCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AttributionData {
  cours: string;
  intitule_abrege: string;
  intit_complet: string;
  inactif: string;
  etat_vac: string;
  cours_en_propo: string;
  vol1_old: number;
  vol2_old: number;
  coef1: number;
  coef2: number;
  vol1_total: number; // Vol.1 Total - volumes totaux du cours
  vol2_total: number; // Vol.2 total - volumes totaux du cours
  periodicite: string;
  dpt_charge: string;
  dpt_attribution: string;
  type: string;
  d: string;
  p: string;
  c: string;
  except_ord: string;
  nom: string;
  prenom: string;
  enseignant: string;
  email_ucl: string;
  candidature: string;
  fonction: string;
  supplee: string;
  debut: string;
  duree: string;
  cause_vac: string;
  cause_decision: string;
  vol1_hours: number; // Vol1. - heures attribuées à l'enseignant
  vol2_hours: number; // Vol2. - heures attribuées à l'enseignant
  mode_paiement_vol1: string;
  mode_paiement_vol2: string;
  poste: string;
  remarque: string;
  rem_spec: string;
  procedure_attribution: string;
  remarque_candidature: string;
  id_equipe: string;
  candidature_en_ligne: string;
}

interface ImportResult {
  success: number;
  errors: string[];
  warnings: string[];
  courses_created: number;
  teachers_created: number;
  attributions_created: number;
}

export const AttributionImportDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}> = ({ open, onOpenChange, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Vérifier le type de fichier
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        toast({
          title: "Format de fichier non supporté",
          description: "Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV.",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const parseExcelFile = async (file: File): Promise<AttributionData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('Le fichier doit contenir au moins une ligne d\'en-tête et une ligne de données'));
            return;
          }

          const headers = (jsonData[0] as string[]).map(h => h?.toString().trim() || '');
          const attributions: AttributionData[] = [];

          // Mapping des colonnes pour tous les formats possibles
          const columnMapping: { [key: string]: keyof AttributionData } = {
            // Format standard
            'Cours': 'cours',
            'Intitulé abrégé': 'intitule_abrege',
            'Intit.Complet': 'intit_complet',
            'Inactif': 'inactif',
            'Etat vac.': 'etat_vac',
            'Cours en propo.': 'cours_en_propo',
            'Vol1.': 'vol1_old', // Ancienne colonne vol1 du cours
            'Vol2.': 'vol2_old', // Ancienne colonne vol2 du cours
            'Coef1': 'coef1',
            'Coef2': 'coef2',
            'Vol.1 Total': 'vol1_total', // Volume total Vol1 du cours
            'Vol.2 total': 'vol2_total', // Volume total Vol2 du cours
            'Périodicité': 'periodicite',
            'Dpt Charge': 'dpt_charge',
            'Dpt Attribution': 'dpt_attribution',
            'Type': 'type',
            'D': 'd',
            'P': 'p',
            'C': 'c',
            'Except./Ord.': 'except_ord',
            'Nom': 'nom',
            'Prénom': 'prenom',
            'Enseignant': 'enseignant',
            'Email UCL': 'email_ucl',
            'Candidature': 'candidature',
            'Fonction': 'fonction',
            'Supplée': 'supplee',
            'Début': 'debut',
            'Durée': 'duree',
            'Cause de vac.': 'cause_vac',
            'Cause décision': 'cause_decision',
            'Mode paiement vol1': 'mode_paiement_vol1',
            'Mode paiement vol2': 'mode_paiement_vol2',
            'Poste': 'poste',
            'Remarque': 'remarque',
            'Rem. spec.': 'rem_spec',
            'Procédure d\'attribution': 'procedure_attribution',
            'Remarque candidature': 'remarque_candidature',
            'Id équipe': 'id_equipe',
            'Candidature en ligne': 'candidature_en_ligne'
          };

          // Mapping spécial pour les colonnes Vol1. et Vol2. qui sont les heures attribuées (colonnes AC et AD)
          const volumeMapping: { [key: string]: keyof AttributionData } = {};
          headers.forEach((header, index) => {
            // Identifier les colonnes de volume par leur position
            // Vol1. pour les heures enseignant est typiquement en position 29-30 (colonne AC)
            // Vol2. pour les heures enseignant est typiquement en position 30-31 (colonne AD)
            if (header === 'Vol1.' && index > 25) { // Position tardive = heures enseignant
              volumeMapping[index.toString()] = 'vol1_hours';
            } else if (header === 'Vol2.' && index > 25) { // Position tardive = heures enseignant
              volumeMapping[index.toString()] = 'vol2_hours';
            }
          });

          // Créer un mapping des indices
          const columnIndices: { [key: string]: number } = {};
          headers.forEach((header, index) => {
            const mappedKey = columnMapping[header];
            if (mappedKey) {
              columnIndices[mappedKey] = index;
            }
          });

          // Parser les données
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (!row || row.length === 0) continue;

            const attribution: Partial<AttributionData> = {};
            
            // Traiter les colonnes mappées normalement
            Object.keys(columnIndices).forEach(key => {
              const index = columnIndices[key];
              const value = row[index];
              
              if (key === 'vol1_total' || key === 'vol2_total' || key === 'vol1_old' || key === 'vol2_old' || 
                  key === 'coef1' || key === 'coef2') {
                // Gérer les valeurs #VALEUR! en les convertissant en 0
                if (value === '#VALEUR!' || value === '#VALUE!' || !value) {
                  (attribution as any)[key] = 0;
                } else {
                  (attribution as any)[key] = parseFloat(value) || 0;
                }
              } else {
                (attribution as any)[key] = value?.toString() || '';
              }
            });

            // Traiter spécialement les colonnes de volume enseignant (Vol1. et Vol2. en position tardive)
            Object.keys(volumeMapping).forEach(indexStr => {
              const index = parseInt(indexStr);
              const key = volumeMapping[indexStr];
              const value = row[index];
              
              if (value === '#VALEUR!' || value === '#VALUE!' || !value) {
                (attribution as any)[key] = 0;
              } else {
                (attribution as any)[key] = parseFloat(value) || 0;
              }
            });

            if (attribution.cours && attribution.cours.trim()) {
              attributions.push(attribution as AttributionData);
            }
          }

          resolve(attributions);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({ title: "Aucun fichier sélectionné", variant: "destructive" });
      return;
    }

    setImporting(true);
    const result: ImportResult = {
      success: 0,
      errors: [],
      warnings: [],
      courses_created: 0,
      teachers_created: 0,
      attributions_created: 0
    };

    try {
      // Parser le fichier Excel
      const attributions = await parseExcelFile(selectedFile);
      
      if (attributions.length === 0) {
        result.errors.push("Aucune donnée valide trouvée dans le fichier");
        setImportResult(result);
        return;
      }

      // Grouper par cours
      const courseGroups = new Map<string, AttributionData[]>();
      attributions.forEach(attr => {
        const courseCode = attr.cours;
        if (!courseGroups.has(courseCode)) {
          courseGroups.set(courseCode, []);
        }
        courseGroups.get(courseCode)!.push(attr);
      });

      // Traiter chaque cours
      for (const [courseCode, courseAttributions] of courseGroups) {
        try {
          const firstAttribution = courseAttributions[0];
          
          // 1. Créer/mettre à jour le cours
          const { data: existingCourse } = await supabase
            .from('courses')
            .select('id')
            .eq('code', courseCode)
            .single();

          let courseId: number;
          
          if (existingCourse) {
            courseId = existingCourse.id;
            // Mettre à jour le cours existant
            const { error: updateError } = await supabase
              .from('courses')
              .update({
                title: firstAttribution.intit_complet || firstAttribution.intitule_abrege,
                volume_total_vol1: firstAttribution.vol1_total || 0,
                volume_total_vol2: firstAttribution.vol2_total || 0,
                vol1_total: firstAttribution.vol1_total || 0,
                vol2_total: firstAttribution.vol2_total || 0,
                faculty: firstAttribution.dpt_charge,
                subcategory: firstAttribution.type,
                vacant: firstAttribution.etat_vac === 'Vacant',
                updated_at: new Date().toISOString()
              })
              .eq('id', courseId);

            if (updateError) {
              result.errors.push(`Erreur mise à jour cours ${courseCode}: ${updateError.message}`);
              continue;
            }
          } else {
            // Créer un nouveau cours
            const { data: newCourse, error: insertError } = await supabase
              .from('courses')
              .insert({
                code: courseCode,
                title: firstAttribution.intit_complet || firstAttribution.intitule_abrege,
                volume_total_vol1: firstAttribution.vol1_total || 0,
                volume_total_vol2: firstAttribution.vol2_total || 0,
                vol1_total: firstAttribution.vol1_total || 0,
                vol2_total: firstAttribution.vol2_total || 0,
                faculty: firstAttribution.dpt_charge,
                subcategory: firstAttribution.type,
                vacant: firstAttribution.etat_vac === 'Vacant',
                academic_year: '2024-2025'
              })
              .select('id')
              .single();

            if (insertError || !newCourse) {
              result.errors.push(`Erreur création cours ${courseCode}: ${insertError?.message || 'Cours non créé'}`);
              continue;
            }
            
            courseId = newCourse.id;
            result.courses_created++;
          }

          // 2. Traiter les enseignants et attributions
          for (const attribution of courseAttributions) {
            // Vérifier si l'enseignant a des données valides 
            if (!attribution.nom || !attribution.prenom) {
              console.log(`Skipping attribution - missing teacher name: ${JSON.stringify(attribution)}`);
              continue;
            }
            
            // Pas besoin de vérifier les heures, on peut avoir des attributions avec 0 heures

            // Créer/mettre à jour l'enseignant
            const { data: existingTeacher } = await supabase
              .from('teachers')
              .select('id')
              .eq('email', attribution.email_ucl)
              .single();

            let teacherId: number;

            if (existingTeacher) {
              teacherId = existingTeacher.id;
            } else {
              const { data: newTeacher, error: teacherError } = await supabase
                .from('teachers')
                .insert({
                  first_name: attribution.prenom,
                  last_name: attribution.nom,
                  email: attribution.email_ucl || `${attribution.prenom.toLowerCase()}.${attribution.nom.toLowerCase()}@uclouvain.be`,
                  status: attribution.fonction || 'active'
                })
                .select('id')
                .single();

              if (teacherError || !newTeacher) {
                result.warnings.push(`Enseignant non créé pour ${attribution.nom} ${attribution.prenom}: ${teacherError?.message}`);
                continue;
              }
              
              teacherId = newTeacher.id;
              result.teachers_created++;
            }

            // 3. Créer l'attribution
            const attributionToInsert = {
              course_id: courseId,
              teacher_id: teacherId,
              vol1_hours: attribution.vol1_hours || 0,
              vol2_hours: attribution.vol2_hours || 0,
              assignment_type: attribution.fonction || 'standard',
              notes: [
                attribution.remarque,
                attribution.rem_spec,
                attribution.remarque_candidature
              ].filter(Boolean).join(' | ') || null,
              status: attribution.candidature === 'Non retenu' ? 'rejected' : 'active',
              is_coordinator: attribution.fonction === 'Cotitulaire' || attribution.fonction === 'Coordinateur',
              candidature_status: attribution.candidature || null,
              faculty: attribution.dpt_charge || null
            };
            
            console.log(`Creating attribution for ${attribution.nom} ${attribution.prenom}:`, attributionToInsert);
            
            const { error: attributionError } = await supabase
              .from('hour_attributions')
              .insert(attributionToInsert);

            if (attributionError) {
              result.warnings.push(`Attribution non créée pour ${attribution.nom} ${attribution.prenom} sur ${courseCode}: ${attributionError.message}`);
              console.error('Attribution error:', attributionError);
            } else {
              result.attributions_created++;
              console.log(`Attribution created successfully for ${attribution.nom} ${attribution.prenom}`);
            }
          }

          result.success++;
        } catch (error) {
          result.errors.push(`Erreur traitement cours ${courseCode}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      }

      setImportResult(result);
      
      console.log('Import completed with result:', result);
      
      if (result.success > 0) {
        toast({
          title: "Import terminé",
          description: `${result.courses_created} cours créés, ${result.teachers_created} enseignants créés, ${result.attributions_created} attributions créées`,
        });
        onSuccess?.();
      } else if (result.errors.length > 0) {
        toast({
          title: "Import échoué",
          description: `Erreurs: ${result.errors.length}. Vérifiez le rapport détaillé.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      result.errors.push(error instanceof Error ? error.message : 'Erreur inconnue');
      setImportResult(result);
      toast({
        title: "Erreur d'import",
        description: "Une erreur est survenue lors de l'import",
        variant: "destructive"
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

  const downloadTemplate = () => {
    const templateData = [
      ['Cours', 'Intitulé abrégé', 'Intit.Complet', 'Inactif', 'Etat vac.', 'Cours en propo.', 'Vol1. 2025', 'Vol2.', 'Coef1', 'Coef2', 'Périodicité', 'Dpt Charge', 'Dpt Attribution', 'Type', 'D', 'P', 'C', 'Except./Ord.', 'Nom', 'Prénom', 'Enseignant', 'Email UCL', 'Candidature', 'Fonction', 'Supplée', 'Début', 'Durée', 'Cause de vac.', 'Cause décision', 'Vol1.', 'Vol2.', 'Mode paiement vol1', 'Mode paiement vol2', 'Poste', 'Remarque', 'Rem. spec.', 'Procédure d\'attribution', 'Remarque candidature', 'Id équipe', 'Candidature en ligne'],
      ['LMAT1111', 'Mathématiques', 'Mathématiques fondamentales', 'Non', 'Vacant', 'Non', '30', '15', '1', '1', 'Annuel', 'MATH', 'MATH', 'Cours', 'Oui', 'Non', 'Non', 'Ordinaire', 'Dupont', 'Jean', 'Jean Dupont', 'jean.dupont@uclouvain.be', 'Oui', 'Professeur', 'Non', '2024-09-01', '1 an', '', '', '25', '10', 'Vacataire', 'Standard', 'RAS', 'Standard', 'Candidature acceptée', '1', 'Oui']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_attributions.xlsx');

    toast({
      title: "Template téléchargé",
      description: "Le fichier template_attributions.xlsx a été téléchargé"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import des attributions Excel</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="format">Format attendu</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Format du fichier Excel</h3>
                <Button onClick={downloadTemplate} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger template
                </Button>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Colonnes requises (dans l'ordre) :</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>• Cours</div>
                  <div>• Intitulé abrégé</div>
                  <div>• Intit.Complet</div>
                  <div>• Inactif</div>
                  <div>• Etat vac.</div>
                  <div>• Cours en propo.</div>
                  <div>• Vol1. 2025</div>
                  <div>• Vol2.</div>
                  <div>• Coef1</div>
                  <div>• Coef2</div>
                  <div>• Périodicité</div>
                  <div>• Dpt Charge</div>
                  <div>• Dpt Attribution</div>
                  <div>• Type</div>
                  <div>• D</div>
                  <div>• P</div>
                  <div>• C</div>
                  <div>• Except./Ord.</div>
                  <div>• Nom</div>
                  <div>• Prénom</div>
                  <div>• Enseignant</div>
                  <div>• Email UCL</div>
                  <div>• Candidature</div>
                  <div>• Fonction</div>
                  <div>• Supplée</div>
                  <div>• Début</div>
                  <div>• Durée</div>
                  <div>• Cause de vac.</div>
                  <div>• Cause décision</div>
                  <div>• Vol1.</div>
                  <div>• Vol2.</div>
                  <div>• Mode paiement vol1</div>
                  <div>• Mode paiement vol2</div>
                  <div>• Poste</div>
                  <div>• Remarque</div>
                  <div>• Rem. spec.</div>
                  <div>• Procédure d'attribution</div>
                  <div>• Remarque candidature</div>
                  <div>• Id équipe</div>
                  <div>• Candidature en ligne</div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800">Notes importantes :</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Le fichier doit être au format Excel (.xlsx) ou CSV</li>
                  <li>• Chaque ligne représente une attribution d'enseignant à un cours</li>
                  <li>• Un même cours peut avoir plusieurs lignes (plusieurs enseignants)</li>
                  <li>• Les colonnes doivent correspondre exactement aux noms indiqués</li>
                  <li>• Les volumes doivent être des nombres</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            {!importResult ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fichier Excel (.xlsx, .xls) ou CSV</label>
                  <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Fichier sélectionné : {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleImport}
                    disabled={!selectedFile || importing}
                    className="flex-1"
                  >
                    {importing ? "Import en cours..." : "Importer"}
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {importResult.success > 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    Import terminé : {importResult.success} cours traités
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-2xl font-bold text-green-600">{importResult.courses_created}</div>
                    <div className="text-sm text-green-700">Cours créés</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-2xl font-bold text-blue-600">{importResult.teachers_created}</div>
                    <div className="text-sm text-blue-700">Enseignants créés</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="text-2xl font-bold text-purple-600">{importResult.attributions_created}</div>
                    <div className="text-sm text-purple-700">Attributions créées</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <h4 className="font-medium text-red-800 mb-2">Erreurs :</h4>
                    <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {importResult.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h4 className="font-medium text-yellow-800 mb-2">Avertissements :</h4>
                    <ul className="text-sm text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
                      {importResult.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={handleClose} className="w-full">
                  Fermer
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};