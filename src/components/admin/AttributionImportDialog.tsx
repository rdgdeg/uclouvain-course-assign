import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertCircle, CheckCircle, Download, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

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

// Définition des colonnes attendues avec leurs labels
const EXPECTED_COLUMNS: Array<{ key: keyof AttributionData; label: string; required: boolean; description?: string }> = [
  { key: 'cours', label: 'Code du cours', required: true, description: 'Sigle ou code du cours (ex: LMAT1111)' },
  { key: 'intitule_abrege', label: 'Intitulé abrégé', required: false },
  { key: 'intit_complet', label: 'Intitulé complet', required: true },
  { key: 'inactif', label: 'Inactif', required: false },
  { key: 'etat_vac', label: 'État vacant', required: false },
  { key: 'cours_en_propo', label: 'Cours en proposition', required: false },
  { key: 'vol1_old', label: 'Vol1. (ancien)', required: false },
  { key: 'vol2_old', label: 'Vol2. (ancien)', required: false },
  { key: 'coef1', label: 'Coefficient 1', required: false },
  { key: 'coef2', label: 'Coefficient 2', required: false },
  { key: 'vol1_total', label: 'Volume 1 total', required: true, description: 'Volume total Vol1 du cours' },
  { key: 'vol2_total', label: 'Volume 2 total', required: true, description: 'Volume total Vol2 du cours' },
  { key: 'periodicite', label: 'Périodicité', required: false },
  { key: 'dpt_charge', label: 'Département charge', required: false },
  { key: 'dpt_attribution', label: 'Département attribution', required: false },
  { key: 'type', label: 'Type', required: false },
  { key: 'nom', label: 'Nom enseignant', required: true },
  { key: 'prenom', label: 'Prénom enseignant', required: true },
  { key: 'enseignant', label: 'Enseignant (nom complet)', required: false },
  { key: 'email_ucl', label: 'Email UCL', required: false },
  { key: 'fonction', label: 'Fonction', required: false },
  { key: 'supplee', label: 'Supplée', required: false },
  { key: 'debut', label: 'Début', required: false },
  { key: 'duree', label: 'Durée', required: false },
  { key: 'cause_vac', label: 'Cause de vacance', required: false },
  { key: 'cause_decision', label: 'Cause décision', required: false },
  { key: 'vol1_hours', label: 'Vol1. Attribution', required: false, description: 'Heures Vol1 attribuées à l\'enseignant' },
  { key: 'vol2_hours', label: 'Vol2. Attribution', required: false, description: 'Heures Vol2 attribuées à l\'enseignant' },
];

export const AttributionImportDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}> = ({ open, onOpenChange, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<keyof AttributionData, string>>({} as Record<keyof AttributionData, string>);
  const [showMapping, setShowMapping] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isParsingHeaders, setIsParsingHeaders] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const { toast } = useToast();

  // Fonction pour créer un mapping automatique basé sur la similarité des noms
  const createAutoMapping = (headers: string[]): Record<keyof AttributionData, string> => {
    const mapping: Record<string, string> = {};
    
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase().trim();
      
      // Mapping basé sur des mots-clés avec priorité
      EXPECTED_COLUMNS.forEach(col => {
        const lowerLabel = col.label.toLowerCase();
        const lowerKey = col.key.toLowerCase();
        
        // Correspondances spécifiques pour les colonnes fournies par l'utilisateur
        let matched = false;
        
        if (col.key === 'cours') {
          matched = lowerHeader === 'cours' || lowerHeader === 'sigle' || lowerHeader === 'cnum' || 
                   lowerHeader.includes('cours') || lowerHeader.includes('sigle');
        } else if (col.key === 'intitule_abrege') {
          matched = lowerHeader.includes('intitulé abrégé') || lowerHeader.includes('intitule abrege');
        } else if (col.key === 'intit_complet') {
          matched = lowerHeader.includes('intit.complet') || lowerHeader.includes('intit complet') || 
                   lowerHeader.includes('intitulé complet');
        } else if (col.key === 'vol1_total') {
          matched = lowerHeader.includes('volume 1 total') || lowerHeader.includes('vol1. 2026') ||
                   lowerHeader === 'vol1. 2026';
        } else if (col.key === 'vol2_total') {
          matched = lowerHeader.includes('volume 2 total') || lowerHeader === 'vol2.' ||
                   (lowerHeader.includes('vol2') && lowerHeader.includes('total'));
        } else if (col.key === 'vol1_hours') {
          matched = lowerHeader.includes('vol1. attribution') || 
                   (lowerHeader.includes('vol1') && lowerHeader.includes('attribution')) ||
                   lowerHeader.includes('vol1. enseignant') ||
                   (lowerHeader.includes('vol1') && lowerHeader.includes('enseignant'));
        } else if (col.key === 'vol2_hours') {
          matched = lowerHeader.includes('vol2. attribution') || 
                   (lowerHeader.includes('vol2') && lowerHeader.includes('attribution')) ||
                   lowerHeader.includes('vol2. enseignant') ||
                   (lowerHeader.includes('vol2') && lowerHeader.includes('enseignant'));
        } else if (col.key === 'enseignant') {
          matched = lowerHeader === 'enseignant' || lowerHeader.includes('enseignant');
        } else if (col.key === 'dpt_charge') {
          matched = lowerHeader.includes('dpt charge') || lowerHeader.includes('dpt. charge') ||
                   lowerHeader === 'dpt charge';
        } else if (col.key === 'dpt_attribution') {
          matched = lowerHeader.includes('dpt attribution') || lowerHeader.includes('dpt. attribution') ||
                   lowerHeader === 'dpt attribution';
        } else if (col.key === 'email_ucl') {
          matched = lowerHeader.includes('email ucl') || lowerHeader === 'email ucl';
        } else if (col.key === 'etat_vac') {
          matched = lowerHeader.includes('état vac') || lowerHeader.includes('etat vac') ||
                   lowerHeader === 'état vac.' || lowerHeader === 'etat vac.';
        } else if (col.key === 'cause_vac') {
          matched = lowerHeader.includes('cause de vac') || lowerHeader === 'cause de vac.';
        } else if (col.key === 'cause_decision') {
          matched = lowerHeader.includes('cause décision') || lowerHeader === 'cause décision';
        } else if (col.key === 'nom') {
          matched = lowerHeader === 'nom';
        } else if (col.key === 'prenom') {
          matched = lowerHeader === 'prénom' || lowerHeader === 'prenom';
        } else if (col.key === 'fonction') {
          matched = lowerHeader === 'fonction';
        } else if (col.key === 'supplee') {
          matched = lowerHeader === 'supplée' || lowerHeader === 'supplee';
        } else if (col.key === 'debut') {
          matched = lowerHeader === 'début' || lowerHeader === 'debut';
        } else if (col.key === 'duree') {
          matched = lowerHeader === 'durée' || lowerHeader === 'duree';
        } else if (col.key === 'periodicite') {
          matched = lowerHeader === 'périodicité' || lowerHeader === 'periodicite';
        } else if (col.key === 'type') {
          matched = lowerHeader === 'type';
        } else if (col.key === 'inactif') {
          matched = lowerHeader === 'inactif';
        } else if (col.key === 'cours_en_propo') {
          matched = lowerHeader.includes('cours en propo') || lowerHeader === 'cours en propo.';
        } else if (col.key === 'coef1') {
          matched = lowerHeader === 'coef1';
        } else if (col.key === 'coef2') {
          matched = lowerHeader === 'coef2';
        } else {
          // Correspondance générique
          matched = lowerHeader === lowerLabel || 
                   lowerHeader.includes(lowerKey) || 
                   lowerKey.includes(lowerHeader);
        }
        
        if (matched && !mapping[col.key]) {
          mapping[col.key] = header;
        }
      });
    });
    
    return mapping as Record<keyof AttributionData, string>;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setShowMapping(false);
      setFileHeaders([]);
      setPreviewData([]);
    }
  };

  const prepareMapping = async () => {
    if (!selectedFile) return;

    // Lire les en-têtes du fichier
    try {
      setIsParsingHeaders(true);
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          // Limiter la lecture aux premières lignes pour éviter de bloquer le navigateur
          const workbook = XLSX.read(data, { type: 'array', sheetRows: 5 });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
          
          if (jsonData.length < 1) {
            toast({
              title: "Fichier vide",
              description: "Le fichier ne contient pas de données",
              variant: "destructive"
            });
            return;
          }
          
          const headers = (jsonData[0] as string[]).map(h => h?.toString().trim() || '');
          setFileHeaders(headers);
          
          // Créer un mapping automatique
          const autoMapping = createAutoMapping(headers);
          setColumnMapping(autoMapping);
          
          // Prévisualiser les premières lignes
          const preview = jsonData.slice(1, 4).map((row: any) => {
            const rowData: any = {};
            headers.forEach((header, index) => {
              rowData[header] = row[index];
            });
            return rowData;
          });
          setPreviewData(preview);
          
          // Afficher l'interface de mapping
          setShowMapping(true);
          setIsParsingHeaders(false);
        } catch (error) {
          toast({
            title: "Erreur de lecture",
            description: "Impossible de lire le fichier",
            variant: "destructive"
          });
          setIsParsingHeaders(false);
        }
      };
      reader.onerror = () => {
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire le fichier",
          variant: "destructive"
        });
        setIsParsingHeaders(false);
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le fichier",
        variant: "destructive"
      });
      setIsParsingHeaders(false);
    }
  };

  const parseExcelFile = async (file: File, customMapping: Record<keyof AttributionData, string>): Promise<AttributionData[]> => {
    return new Promise((resolve, reject) => {
      const loadAndParse = async () => {
        const XLSX = await import('xlsx');
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

            // Créer un mapping des indices basé sur le mapping personnalisé
            const columnIndices: { [key: string]: number } = {};
            Object.entries(customMapping).forEach(([expectedKey, fileHeader]) => {
              if (fileHeader) {
                const index = headers.findIndex(h => h === fileHeader);
                if (index !== -1) {
                  columnIndices[expectedKey] = index;
                }
              }
            });

            // Vérifier les colonnes requises
            const requiredColumns = EXPECTED_COLUMNS.filter(col => col.required);
            const missingRequired = requiredColumns.filter(col => columnIndices[col.key] === undefined);
            const hasNom = columnIndices.nom !== undefined;
            const hasPrenom = columnIndices.prenom !== undefined;
            const hasEnseignant = columnIndices.enseignant !== undefined;

            // Autoriser Nom/Prénom OU Enseignant (nom complet)
            const missingNameColumns = (!hasNom || !hasPrenom) && !hasEnseignant;
            if (missingRequired.length > 0 || missingNameColumns) {
              const missingLabels = missingRequired.map(c => c.label);
              if (missingNameColumns) {
                missingLabels.push('Nom/Prénom enseignant ou colonne Enseignant');
              }
              reject(new Error(`Colonnes requises manquantes : ${missingLabels.join(', ')}`));
              return;
            }

            // Parser les données
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i] as any[];
              if (!row || row.length === 0) continue;

              const attribution: Partial<AttributionData> = {};
              
              // Traiter les colonnes mappées
              Object.keys(columnIndices).forEach(key => {
                const index = columnIndices[key];
                const value = row[index];
                
                // Colonnes numériques
                if (key === 'vol1_total' || key === 'vol2_total' || key === 'vol1_old' || key === 'vol2_old' || 
                    key === 'coef1' || key === 'coef2' || key === 'vol1_hours' || key === 'vol2_hours') {
                  // Gérer les valeurs #VALEUR! en les convertissant en 0
                  if (value === '#VALEUR!' || value === '#VALUE!' || value === null || value === undefined) {
                    (attribution as any)[key] = 0;
                  } else if (typeof value === 'string') {
                    const normalized = value.replace(',', '.');
                    (attribution as any)[key] = parseFloat(normalized) || 0;
                  } else {
                    (attribution as any)[key] = parseFloat(value) || 0;
                  }
                } else {
                  (attribution as any)[key] = value?.toString() || '';
                }
              });

              // Si Nom/Prénom manquent mais colonne "Enseignant" présente, extraire le nom complet
              if ((!attribution.nom || !attribution.prenom) && attribution.enseignant) {
                const fullName = attribution.enseignant.trim();
                if (fullName) {
                  const parts = fullName.split(/\s+/);
                  if (parts.length === 1) {
                    attribution.prenom = parts[0];
                    attribution.nom = '';
                  } else {
                    attribution.prenom = parts[0];
                    attribution.nom = parts.slice(1).join(' ');
                  }
                }
              }

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
      };

      loadAndParse().catch(reject);
      return;
    });
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({ title: "Aucun fichier sélectionné", variant: "destructive" });
      return;
    }

    setImporting(true);
     setImportProgress(0);
    const result: ImportResult = {
      success: 0,
      errors: [],
      warnings: [],
      courses_created: 0,
      teachers_created: 0,
      attributions_created: 0
    };

    try {
      // Parser le fichier Excel avec le mapping personnalisé
      const attributions = await parseExcelFile(selectedFile, columnMapping);
      
      if (attributions.length === 0) {
        result.errors.push("Aucune donnée valide trouvée dans le fichier");
        setImportResult(result);
        return;
      }

      // Si demandé, écraser toutes les attributions existantes avant l'import
      if (overwriteExisting) {
        const { data: existingAttributions, error: fetchError } = await supabase
          .from('hour_attributions')
          .select('id');

        if (fetchError) {
          result.errors.push(`Impossible de récupérer les attributions existantes : ${fetchError.message}`);
        } else if (existingAttributions && existingAttributions.length > 0) {
          const attributionIds = existingAttributions.map((a: { id: string }) => a.id);
          const { error: deleteError } = await supabase
            .from('hour_attributions')
            .delete()
            .in('id', attributionIds);

          if (deleteError) {
            result.errors.push(`Impossible de supprimer les attributions existantes : ${deleteError.message}`);
          } else {
            toast({
              title: "Attributions écrasées",
              description: `${existingAttributions.length} attribution(s) existante(s) supprimée(s) avant l'import.`,
            });
          }
        }

        // Avancer légèrement la progression après la suppression
        setImportProgress(5);
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

      const totalCourses = courseGroups.size;
      let processedCourses = 0;

      // Traiter chaque cours
      for (const [courseCode, courseAttributions] of courseGroups) {
        try {
          processedCourses++;
          const progress = Math.round((processedCourses / Math.max(totalCourses, 1)) * 100);
          setImportProgress(progress);

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
                academic_year: '2026-2027'
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
            const fullName = `${attribution.prenom || ''} ${attribution.nom || ''}`.trim();
            const enseignantValue = attribution.enseignant || '';
            const isNonAttr = [fullName, attribution.nom, attribution.prenom, enseignantValue]
              .filter(Boolean)
              .some(value => {
                const normalized = value.toString().toLowerCase().replace(/\s+/g, ' ').trim();
                return normalized === 'non attr.' || normalized === 'non attr' || normalized === 'non attribué' || normalized === 'non attribue';
              });

            // Ignorer les lignes "Non Attr." (volume non attribué)
            if (isNonAttr) {
              continue;
            }

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
              assignment_type: attribution.fonction || 'Cotitulaire',
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
      setImportProgress(100);
      
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
    setFileHeaders([]);
    setColumnMapping({} as Record<keyof AttributionData, string>);
    setShowMapping(false);
    setPreviewData([]);
    setOverwriteExisting(false);
    setImportProgress(0);
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
                {!showMapping ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fichier Excel (.xlsx, .xls) ou CSV</label>
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        disabled={isParsingHeaders}
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">
                          Fichier sélectionné : {selectedFile.name}
                        </p>
                      )}
                      {isParsingHeaders && (
                        <p className="text-xs text-muted-foreground">
                          Analyse du fichier en cours...
                        </p>
                      )}
                    </div>
                    {selectedFile && !showMapping && (
                      <Button
                        onClick={prepareMapping}
                        disabled={isParsingHeaders}
                      >
                        Préparer le mapping
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          Configuration du mapping des colonnes
                        </CardTitle>
                        <CardDescription>
                          Associez chaque colonne attendue à une colonne de votre fichier Excel.
                          Les colonnes marquées d'un * sont obligatoires.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 max-h-[500px] overflow-y-auto">
                          {EXPECTED_COLUMNS.map((col) => (
                            <div key={col.key} className="flex items-center gap-4">
                              <div className="flex-1">
                                <Label htmlFor={`mapping-${col.key}`} className="flex items-center gap-2">
                                  {col.label}
                                  {col.required && <span className="text-red-500">*</span>}
                                </Label>
                                {col.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{col.description}</p>
                                )}
                              </div>
                              <Select
                                value={columnMapping[col.key] || '__none__'}
                                onValueChange={(value) => {
                                  setColumnMapping(prev => ({
                                    ...prev,
                                    [col.key]: value === '__none__' ? '' : value
                                  }));
                                }}
                              >
                                <SelectTrigger className="w-[250px]">
                                  <SelectValue placeholder="Sélectionner une colonne" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">-- Aucune --</SelectItem>
                                  {fileHeaders
                                    .filter((header) => header && header.trim() !== '')
                                    .map((header) => (
                                    <SelectItem key={header} value={header}>
                                      {header}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                        
                        {previewData.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Aperçu des données (3 premières lignes)</h4>
                            <div className="border rounded-lg overflow-auto max-h-40">
                              <table className="w-full text-xs">
                                <thead className="bg-muted">
                                  <tr>
                                    {fileHeaders.slice(0, 5).map((header) => (
                                      <th key={header} className="p-2 text-left border-b">
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {previewData.map((row, idx) => (
                                    <tr key={idx}>
                                      {fileHeaders.slice(0, 5).map((header) => (
                                        <td key={header} className="p-2 border-b">
                                          {row[header] || '-'}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2 border rounded-md p-3">
                          <Label className="flex items-start gap-2 text-sm">
                            <Checkbox
                              id="overwrite-existing-attributions"
                              checked={overwriteExisting}
                              onCheckedChange={(checked) => setOverwriteExisting(!!checked)}
                              className="mt-1"
                            />
                            <div>
                              <span className="font-medium">Écraser les attributions existantes</span>
                              <p className="text-xs text-muted-foreground mt-1">
                                Si coché, toutes les attributions existantes seront supprimées avant l'import.
                                Les cours seront mis à jour ou créés en fonction des données du fichier.
                              </p>
                            </div>
                          </Label>
                        </div>

                        {importing && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progression de l'import</span>
                              <span className="font-medium">{importProgress}%</span>
                            </div>
                            <Progress value={importProgress} />
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleImport}
                        disabled={!selectedFile || importing}
                        className="flex-1"
                      >
                        {importing ? "Import en cours..." : "Importer avec ce mapping"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowMapping(false);
                          setSelectedFile(null);
                        }}
                      >
                        Changer de fichier
                      </Button>
                      <Button variant="outline" onClick={handleClose}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
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