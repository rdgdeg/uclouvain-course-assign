import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExcelRow {
  [key: string]: any;
}

interface ColumnMapping {
  // Cours
  sigle?: string;
  cnum?: string;
  cours?: string;
  intit_abrev?: string;
  intit_complet?: string;
  inactif?: string;
  etat_vac?: string;
  cause_vac?: string;
  cause_decision?: string;
  decl_vac?: string;
  cours_propo?: string;
  vol1_2026?: string;
  vol2?: string;
  coef1?: string;
  coef2?: string;
  volume1_total?: string;
  volume2_total?: string;
  periodicite?: string;
  dpt_charge?: string;
  dpt_attribution?: string;
  type?: string;
  // Enseignant
  nom?: string;
  prenom?: string;
  matricule?: string;
  date_naissance?: string;
  email?: string;
  fonction?: string;
  supplee?: string;
  debut?: string;
  duree?: string;
  vol1?: string;
  vol2_enseignant?: string;
}

interface ParsedCourse {
  code: string;
  sigle?: string;
  cnum?: string;
  title: string;
  title_abbrev?: string;
  title_full?: string;
  inactive?: boolean;
  vacant: boolean;
  vacancy_reason?: string;
  vacancy_decision?: string;
  vacancy_declaration?: string;
  course_proposal?: string;
  vol1_2026?: number;
  vol2?: number;
  coef1?: number;
  coef2?: number;
  volume_total_vol1: number;
  volume_total_vol2: number;
  periodicity?: string;
  dept_charge?: string;
  dept_attribution?: string;
  type?: string;
  faculty?: string;
  subcategory?: string;
  teachers: ParsedTeacher[];
  vacant_parts: ParsedVacantPart[];
}

interface ParsedTeacher {
  nom: string;
  prenom: string;
  matricule?: string;
  date_naissance?: string;
  email: string;
  fonction?: string;
  supplee?: boolean;
  debut?: string;
  duree?: string;
  cause_vac?: string;
  cause_decision?: string;
  vol1: number;
  vol2: number;
  is_coordinator?: boolean;
}

interface ParsedVacantPart {
  vol1: number;
  vol2: number;
  cause_vac?: string;
  cause_decision?: string;
}

export const ExcelCourseImportDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'results'>('upload');
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [parsedCourses, setParsedCourses] = useState<ParsedCourse[]>([]);
  const [importResults, setImportResults] = useState<{
    coursesCreated: number;
    coursesUpdated: number;
    teachersCreated: number;
    assignmentsCreated: number;
    errors: string[];
    preview: ParsedCourse[];
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportResults(null);
      setStep('upload');
      loadFileHeaders(e.target.files[0]);
    }
  };

  const loadFileHeaders = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          setExcelHeaders(headers);
          
          // Mapping automatique intelligent
          const autoMapping: ColumnMapping = {};
          headers.forEach((header, index) => {
            const headerLower = header.toLowerCase().trim();
            
            // Mapping automatique basé sur les noms de colonnes
            if (headerLower.includes('sigle')) autoMapping.sigle = header;
            else if (headerLower.includes('cnum')) autoMapping.cnum = header;
            else if (headerLower.includes('cours') && !headerLower.includes('propo')) autoMapping.cours = header;
            else if (headerLower.includes('intitulé abrégé') || headerLower.includes('intit.abr')) autoMapping.intit_abrev = header;
            else if (headerLower.includes('intit.complet') || headerLower.includes('intit complet')) autoMapping.intit_complet = header;
            else if (headerLower.includes('inactif')) autoMapping.inactif = header;
            else if (headerLower.includes('etat vac') || headerLower.includes('état vac')) autoMapping.etat_vac = header;
            else if (headerLower.includes('cause de vac')) autoMapping.cause_vac = header;
            else if (headerLower.includes('cause décision')) autoMapping.cause_decision = header;
            else if (headerLower.includes('décl. de vac') || headerLower.includes('decl vac')) autoMapping.decl_vac = header;
            else if (headerLower.includes('cours en propo')) autoMapping.cours_propo = header;
            else if (headerLower.includes('vol1. 2026') || headerLower.includes('vol1 2026')) autoMapping.vol1_2026 = header;
            else if (headerLower.includes('vol2.') && !headerLower.includes('total')) autoMapping.vol2 = header;
            else if (headerLower.includes('coef1')) autoMapping.coef1 = header;
            else if (headerLower.includes('coef2')) autoMapping.coef2 = header;
            else if (headerLower.includes('volume 1 total') || headerLower.includes('volume1 total')) autoMapping.volume1_total = header;
            else if (headerLower.includes('volume 2 total') || headerLower.includes('volume2 total')) autoMapping.volume2_total = header;
            else if (headerLower.includes('périodicité') || headerLower.includes('periodicite')) autoMapping.periodicite = header;
            else if (headerLower.includes('dpt charge') || headerLower.includes('dept charge')) autoMapping.dpt_charge = header;
            else if (headerLower.includes('dpt attribution') || headerLower.includes('dept attribution')) autoMapping.dpt_attribution = header;
            else if (headerLower === 'type') autoMapping.type = header;
            else if (headerLower === 'nom') autoMapping.nom = header;
            else if (headerLower.includes('prénom') || headerLower.includes('prenom')) autoMapping.prenom = header;
            else if (headerLower.includes('matricule')) autoMapping.matricule = header;
            else if (headerLower.includes('date naissance')) autoMapping.date_naissance = header;
            else if (headerLower.includes('email ucl') || headerLower.includes('email')) autoMapping.email = header;
            else if (headerLower.includes('fonction')) autoMapping.fonction = header;
            else if (headerLower.includes('supplée') || headerLower.includes('supplee')) autoMapping.supplee = header;
            else if (headerLower.includes('début') || headerLower.includes('debut')) autoMapping.debut = header;
            else if (headerLower.includes('durée') || headerLower.includes('duree')) autoMapping.duree = header;
            else if (headerLower.includes('vol1.') && !headerLower.includes('2026') && !headerLower.includes('total')) autoMapping.vol1 = header;
            else if (headerLower.includes('vol2.') && !headerLower.includes('total')) autoMapping.vol2_enseignant = header;
          });
          
          setColumnMapping(autoMapping);
          setStep('mapping');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de lire le fichier",
        variant: "destructive"
      });
    }
  };

  const parseExcelFile = async (file: File, mapping: ColumnMapping): Promise<ParsedCourse[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            reject(new Error("Le fichier Excel est vide"));
            return;
          }

          // Grouper par cours (utiliser Sigle, Cnum ou Cours comme identifiant)
          const coursesMap = new Map<string, ParsedCourse>();

          jsonData.forEach((row, index) => {
            try {
              // Identifier le cours
              const courseCode = row[mapping.sigle || ''] || 
                                row[mapping.cours || ''] || 
                                row[mapping.cnum || ''] || '';
              const courseTitle = row[mapping.intit_complet || ''] || 
                                 row[mapping.intit_abrev || ''] || 
                                 row[mapping.cours || ''] || '';
              
              if (!courseCode && !courseTitle) {
                console.warn(`Ligne ${index + 2} ignorée : pas de code ou titre de cours`);
                return;
              }

              const courseKey = courseCode || courseTitle;
              
              // Créer ou récupérer le cours
              if (!coursesMap.has(courseKey)) {
                const etatVac = row[mapping.etat_vac || ''];
                const isVacant = etatVac === 'Vacant' || 
                                etatVac === 'vacant' || 
                                etatVac === 'VACANT';

                const vol1_2026 = parseFloat(row[mapping.vol1_2026 || '']) || 0;
                const coef1 = parseFloat(row[mapping.coef1 || '']) || 1;
                const vol2_raw = parseFloat(row[mapping.vol2 || '']) || 0;
                const coef2 = parseFloat(row[mapping.coef2 || '']) || 1;
                
                // Volume total = Vol1. 2026 * Coef1 (ou utiliser Volume 1 total si présent)
                const volume1_total = parseFloat(row[mapping.volume1_total || '']) || (vol1_2026 * coef1);
                const volume2_total = parseFloat(row[mapping.volume2_total || '']) || (vol2_raw * coef2);

                coursesMap.set(courseKey, {
                  code: courseCode,
                  sigle: row[mapping.sigle || ''] || '',
                  cnum: row[mapping.cnum || ''] || '',
                  title: courseTitle,
                  title_abbrev: row[mapping.intit_abrev || ''] || '',
                  title_full: row[mapping.intit_complet || ''] || '',
                  inactive: row[mapping.inactif || ''] === 'Oui' || row[mapping.inactif || ''] === true || row[mapping.inactif || ''] === 1,
                  vacant: isVacant,
                  vacancy_reason: row[mapping.cause_vac || ''] || '',
                  vacancy_decision: row[mapping.cause_decision || ''] || '',
                  vacancy_declaration: row[mapping.decl_vac || ''] || '',
                  course_proposal: row[mapping.cours_propo || ''] || '',
                  vol1_2026: vol1_2026,
                  vol2: vol2_raw,
                  coef1: coef1,
                  coef2: coef2,
                  volume_total_vol1: volume1_total,
                  volume_total_vol2: volume2_total,
                  periodicity: row[mapping.periodicite || ''] || '',
                  dept_charge: row[mapping.dpt_charge || ''] || '',
                  dept_attribution: row[mapping.dpt_attribution || ''] || '',
                  type: row[mapping.type || ''] || '',
                  faculty: row[mapping.dpt_attribution || ''] || row[mapping.dpt_charge || ''] || '',
                  subcategory: row[mapping.type || ''] || '',
                  teachers: [],
                  vacant_parts: []
                });
              }

              const course = coursesMap.get(courseKey)!;

              // Vérifier si c'est une attribution d'enseignant ou une partie vacante
              const nom = row[mapping.nom || ''] || '';
              const prenom = row[mapping.prenom || ''] || '';
              const isNonAttr = nom === 'Non Attr.' || nom === 'Non Attr' || nom === 'Non attr.' || 
                               prenom === 'Non Attr.' || prenom === 'Non Attr' || prenom === 'Non attr.';

              if (isNonAttr) {
                // Partie vacante
                const vacantPart: ParsedVacantPart = {
                  vol1: parseFloat(row[mapping.vol1 || '']) || 0,
                  vol2: parseFloat(row[mapping.vol2_enseignant || '']) || 0,
                  cause_vac: row[mapping.cause_vac || ''] || '',
                  cause_decision: row[mapping.cause_decision || ''] || ''
                };
                course.vacant_parts.push(vacantPart);
              } else if (nom || prenom || row[mapping.email || '']) {
                // Enseignant
                const teacher: ParsedTeacher = {
                  nom: nom,
                  prenom: prenom,
                  matricule: row[mapping.matricule || ''] || '',
                  date_naissance: row[mapping.date_naissance || ''] ? 
                    (typeof row[mapping.date_naissance || ''] === 'number' 
                      ? (() => {
                          try {
                            const date = XLSX.SSF.parse_date_code(row[mapping.date_naissance || '']);
                            return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
                          } catch {
                            return row[mapping.date_naissance || ''].toString();
                          }
                        })()
                      : row[mapping.date_naissance || ''].toString()) 
                    : '',
                  email: row[mapping.email || ''] || '',
                  fonction: row[mapping.fonction || ''] || '',
                  supplee: row[mapping.supplee || ''] === 'Oui' || 
                          row[mapping.supplee || ''] === true || 
                          row[mapping.supplee || ''] === 1 || 
                          row[mapping.supplee || ''] === 'TRUE',
                  debut: row[mapping.debut || ''] ? 
                    (typeof row[mapping.debut || ''] === 'number' 
                      ? (() => {
                          try {
                            const date = XLSX.SSF.parse_date_code(row[mapping.debut || '']);
                            return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
                          } catch {
                            return row[mapping.debut || ''].toString();
                          }
                        })()
                      : row[mapping.debut || ''].toString()) 
                    : '',
                  duree: row[mapping.duree || ''] || '',
                  cause_vac: row[mapping.cause_vac || ''] || '',
                  cause_decision: row[mapping.cause_decision || ''] || '',
                  vol1: parseFloat(row[mapping.vol1 || '']) || 0,
                  vol2: parseFloat(row[mapping.vol2_enseignant || '']) || 0,
                  is_coordinator: false
                };

                course.teachers.push(teacher);
              }
            } catch (error) {
              console.error(`Erreur ligne ${index + 2}:`, error);
            }
          });

          // Déterminer le coordinateur pour chaque cours (enseignant avec le plus de volume)
          coursesMap.forEach((course) => {
            if (course.teachers.length > 0) {
              let maxVolume = 0;
              let coordinatorIndex = 0;
              course.teachers.forEach((teacher, index) => {
                const totalVolume = (teacher.vol1 || 0) + (teacher.vol2 || 0);
                if (totalVolume > maxVolume) {
                  maxVolume = totalVolume;
                  coordinatorIndex = index;
                }
              });
              course.teachers[coordinatorIndex].is_coordinator = true;
            }
          });

          resolve(Array.from(coursesMap.values()));
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Erreur lors de la lecture du fichier"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handlePreview = async () => {
    if (!selectedFile) return;
    
    try {
      const courses = await parseExcelFile(selectedFile, columnMapping);
      setParsedCourses(courses);
      setStep('preview');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de parser le fichier",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({ title: "Aucun fichier sélectionné", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    setStep('importing');
    setImportResults(null);

    try {
      const parsedCoursesData = parsedCourses.length > 0 ? parsedCourses : await parseExcelFile(selectedFile, columnMapping);

      if (parsedCoursesData.length === 0) {
        toast({ 
          title: "Aucun cours trouvé", 
          description: "Le fichier ne contient aucun cours valide",
          variant: "destructive" 
        });
        setIsImporting(false);
        return;
      }

      let coursesCreated = 0;
      let coursesUpdated = 0;
      let teachersCreated = 0;
      let assignmentsCreated = 0;
      const errors: string[] = [];

      for (const courseData of parsedCoursesData) {
        try {
          const courseRecord = {
            code: courseData.code || null,
            title: courseData.title,
            faculty: courseData.dept_attribution || courseData.dept_charge || null,
            subcategory: courseData.type || null,
            volume_total_vol1: courseData.volume_total_vol1 || 0,
            volume_total_vol2: courseData.volume_total_vol2 || 0,
            vacant: courseData.vacant,
            academic_year: '2026-2027'
          };

          let existingCourseId: number | null = null;
          if (courseData.code) {
            const { data: existing } = await supabase
              .from('courses')
              .select('id')
              .eq('code', courseData.code)
              .maybeSingle();
            
            if (existing) {
              existingCourseId = existing.id;
            }
          }

          let courseId: number;
          if (existingCourseId) {
            const { error: updateError } = await supabase
              .from('courses')
              .update(courseRecord)
              .eq('id', existingCourseId);
            
            if (updateError) throw updateError;
            courseId = existingCourseId;
            coursesUpdated++;
          } else {
            const { data: newCourse, error: insertError } = await supabase
              .from('courses')
              .insert([courseRecord])
              .select('id')
              .single();
            
            if (insertError) throw insertError;
            courseId = newCourse.id;
            coursesCreated++;
          }

          // Supprimer les attributions existantes
          await supabase
            .from('course_assignments')
            .delete()
            .eq('course_id', courseId);

          // Traiter les enseignants
          for (const teacherData of courseData.teachers) {
            if (!teacherData.email && !teacherData.nom) {
              continue;
            }

            try {
              let teacherId: number | null = null;

              if (teacherData.email) {
                const { data: existingTeacher } = await supabase
                  .from('teachers')
                  .select('id')
                  .eq('email', teacherData.email)
                  .maybeSingle();
                
                if (existingTeacher) {
                  teacherId = existingTeacher.id;
                }
              }

              if (!teacherId) {
                const { data: newTeacher, error: teacherError } = await supabase
                  .from('teachers')
                  .insert([{
                    first_name: teacherData.prenom || '',
                    last_name: teacherData.nom || '',
                    email: teacherData.email || `${teacherData.prenom}.${teacherData.nom}@uclouvain.be`,
                    status: teacherData.fonction || null
                  }])
                  .select('id')
                  .single();
                
                if (teacherError) {
                  errors.push(`Erreur création enseignant ${teacherData.nom} ${teacherData.prenom}: ${teacherError.message}`);
                  continue;
                }
                
                teacherId = newTeacher.id;
                teachersCreated++;
              }

              if (teacherId && (teacherData.vol1 > 0 || teacherData.vol2 > 0)) {
                const { error: assignmentError } = await supabase
                  .from('course_assignments')
                  .insert([{
                    course_id: courseId,
                    teacher_id: teacherId,
                    vol1_hours: teacherData.vol1 || 0,
                    vol2_hours: teacherData.vol2 || 0,
                    is_coordinator: teacherData.is_coordinator || false,
                    validated_by_coord: false
                  }]);

                if (assignmentError) {
                  errors.push(`Erreur attribution ${teacherData.nom} ${teacherData.prenom}: ${assignmentError.message}`);
                } else {
                  assignmentsCreated++;
                }
              }
            } catch (error: any) {
              errors.push(`Erreur enseignant ${teacherData.nom} ${teacherData.prenom}: ${error.message}`);
            }
          }
        } catch (error: any) {
          errors.push(`Erreur cours ${courseData.title}: ${error.message}`);
        }
      }

      setImportResults({
        coursesCreated,
        coursesUpdated,
        teachersCreated,
        assignmentsCreated,
        errors,
        preview: parsedCoursesData.slice(0, 5)
      });

      setStep('results');

      toast({ 
        title: "Import terminé", 
        description: `${coursesCreated + coursesUpdated} cours importés, ${teachersCreated} enseignants créés, ${assignmentsCreated} attributions créées`
      });

      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });

    } catch (error: any) {
      console.error('Erreur lors de l\'import:', error);
      toast({ 
        title: "Erreur d'import", 
        description: error.message || "Une erreur est survenue lors de l'import",
        variant: "destructive" 
      });
      setStep('preview');
    } finally {
      setIsImporting(false);
    }
  };

  const requiredColumns = [
    { key: 'intit_complet', label: 'Intitulé complet', required: true },
    { key: 'etat_vac', label: 'Etat vac.', required: true },
    { key: 'volume1_total', label: 'Volume 1 total', required: true },
    { key: 'volume2_total', label: 'Volume 2 total', required: true }
  ];

  const optionalColumns = [
    { key: 'sigle', label: 'Sigle' },
    { key: 'cnum', label: 'Cnum' },
    { key: 'cours', label: 'Cours' },
    { key: 'intit_abrev', label: 'Intitulé abrégé' },
    { key: 'vol1_2026', label: 'Vol1. 2026' },
    { key: 'coef1', label: 'Coef1' },
    { key: 'coef2', label: 'Coef2' },
    { key: 'dpt_attribution', label: 'Dpt Attribution' },
    { key: 'type', label: 'Type' },
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email UCL' },
    { key: 'fonction', label: 'Fonction' },
    { key: 'vol1', label: 'Vol1. (enseignant)' },
    { key: 'vol2_enseignant', label: 'Vol2. (enseignant)' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Importer depuis Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import de cours depuis Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'upload' && (
            <>
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Sélectionner un fichier Excel (.xlsx, .xls)
                </Label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full"
                  disabled={isImporting}
                />
              </div>
            </>
          )}

          {step === 'mapping' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Contrôle des colonnes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Vérifiez que les colonnes Excel sont correctement mappées. 
                    Les colonnes marquées d'un * sont obligatoires.
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="font-semibold mb-2 block">Colonnes obligatoires *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {requiredColumns.map(col => (
                          <div key={col.key}>
                            <Label className="text-sm">
                              {col.label} *
                              {!columnMapping[col.key as keyof ColumnMapping] && (
                                <Badge variant="destructive" className="ml-2">Manquant</Badge>
                              )}
                            </Label>
                            <Select
                              value={columnMapping[col.key as keyof ColumnMapping] || ''}
                              onValueChange={(value) => setColumnMapping({ ...columnMapping, [col.key]: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une colonne" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">-- Aucune --</SelectItem>
                                {excelHeaders.map(header => (
                                  <SelectItem key={header} value={header}>{header}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="font-semibold mb-2 block">Colonnes optionnelles</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {optionalColumns.map(col => (
                          <div key={col.key}>
                            <Label className="text-sm">{col.label}</Label>
                            <Select
                              value={columnMapping[col.key as keyof ColumnMapping] || ''}
                              onValueChange={(value) => setColumnMapping({ ...columnMapping, [col.key]: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une colonne" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">-- Aucune --</SelectItem>
                                {excelHeaders.map(header => (
                                  <SelectItem key={header} value={header}>{header}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setStep('upload')}>
                      Retour
                    </Button>
                    <Button onClick={handlePreview}>
                      Prévisualiser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {step === 'preview' && parsedCourses.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu de l'import ({parsedCourses.length} cours trouvés)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {parsedCourses.slice(0, 10).map((course, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {course.code} - {course.teachers.length} enseignant(s) - 
                              {course.vacant_parts.length > 0 && ` ${course.vacant_parts.length} partie(s) vacante(s)`}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Vol.1: {course.volume_total_vol1}h | Vol.2: {course.volume_total_vol2}h
                              {course.vacant && <Badge variant="outline" className="ml-2">Vacant</Badge>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {parsedCourses.length > 10 && (
                      <div className="text-sm text-muted-foreground text-center">
                        ... et {parsedCourses.length - 10} autre(s) cours
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  Retour
                </Button>
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Import en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importer
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 'importing' && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Import en cours...</p>
            </div>
          )}

          {step === 'results' && importResults && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Résultats de l'import</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{importResults.coursesCreated}</div>
                      <div className="text-sm text-muted-foreground">Cours créés</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{importResults.coursesUpdated}</div>
                      <div className="text-sm text-muted-foreground">Cours mis à jour</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{importResults.teachersCreated}</div>
                      <div className="text-sm text-muted-foreground">Enseignants créés</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{importResults.assignmentsCreated}</div>
                      <div className="text-sm text-muted-foreground">Attributions créées</div>
                    </div>
                  </div>

                  {importResults.errors.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">{importResults.errors.length} erreur(s)</span>
                      </div>
                      <div className="max-h-40 overflow-y-auto text-sm">
                        {importResults.errors.map((error, index) => (
                          <div key={index} className="text-red-600">{error}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => {
                  setIsOpen(false);
                  setStep('upload');
                  setImportResults(null);
                  setParsedCourses([]);
                }}>
                  Fermer
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
