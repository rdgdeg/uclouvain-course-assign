import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { useQueryClient } from "@tanstack/react-query";

interface ExcelRow {
  [key: string]: any;
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

export const ExcelCourseImportDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
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
    }
  };

  const parseExcelFile = async (file: File): Promise<ParsedCourse[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Prendre la première feuille
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convertir en JSON
          const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            reject(new Error("Le fichier Excel est vide"));
            return;
          }

          // Grouper par cours (supposant que le code cours identifie un cours)
          const coursesMap = new Map<string, ParsedCourse>();

          jsonData.forEach((row, index) => {
            try {
              // Identifier le cours (utiliser Sigle ou Cours comme identifiant)
              const courseCode = row['Sigle'] || row['Cours'] || row['Cnum'] || '';
              const courseTitle = row['Intit.Complet'] || row['Intitulé abrégé'] || row['Cours'] || '';
              
              if (!courseCode && !courseTitle) {
                console.warn(`Ligne ${index + 2} ignorée : pas de code ou titre de cours`);
                return;
              }

              // Créer ou récupérer le cours
              const courseKey = courseCode || courseTitle;
              if (!coursesMap.has(courseKey)) {
                const isVacant = row['Etat vac.'] === 'Oui' || 
                                row['Etat vac.'] === 'oui' || 
                                row['Etat vac.'] === true ||
                                row['Etat vac.'] === 'TRUE' ||
                                row['Etat vac.'] === 1;

                coursesMap.set(courseKey, {
                  code: courseCode,
                  sigle: row['Sigle'] || '',
                  cnum: row['Cnum'] || '',
                  title: courseTitle,
                  title_abbrev: row['Intitulé abrégé'] || '',
                  title_full: row['Intit.Complet'] || '',
                  inactive: row['Inactif'] === 'Oui' || row['Inactif'] === true || row['Inactif'] === 1,
                  vacant: isVacant,
                  vacancy_reason: row['Cause de vac.'] || '',
                  vacancy_decision: row['Cause décision'] || '',
                  vacancy_declaration: row['Décl. de vac.'] || '',
                  course_proposal: row['Cours en propo.'] || '',
                  vol1_2026: parseFloat(row['Vol1. 2026']) || 0,
                  vol2: parseFloat(row['Vol2.']) || 0,
                  coef1: parseFloat(row['Coef1']) || 0,
                  coef2: parseFloat(row['Coef2']) || 0,
                  volume_total_vol1: parseFloat(row['Volume 1 total']) || parseFloat(row['Vol1. 2026']) || 0,
                  volume_total_vol2: parseFloat(row['Volume 2 total']) || parseFloat(row['Vol2.']) || 0,
                  periodicity: row['Périodicité'] || '',
                  dept_charge: row['Dpt Charge'] || '',
                  dept_attribution: row['Dpt Attribution'] || '',
                  type: row['Type'] || '',
                  teachers: []
                });
              }

              const course = coursesMap.get(courseKey)!;

              // Ajouter l'enseignant s'il y en a un
              const teacherNom = row['Nom'] || '';
              const teacherPrenom = row['Prénom'] || '';
              const teacherEmail = row['Email UCL'] || '';

              if (teacherNom || teacherPrenom || teacherEmail) {
                const teacher: ParsedTeacher = {
                  nom: teacherNom,
                  prenom: teacherPrenom,
                  matricule: row['Matricule'] || '',
                  date_naissance: row['Date naissance'] ? 
                    (typeof row['Date naissance'] === 'number' 
                      ? (() => {
                          try {
                            const date = XLSX.SSF.parse_date_code(row['Date naissance']);
                            return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
                          } catch {
                            return row['Date naissance'].toString();
                          }
                        })()
                      : row['Date naissance'].toString()) 
                    : '',
                  email: teacherEmail,
                  fonction: row['Fonction'] || '',
                  supplee: row['Supplée'] === 'Oui' || row['Supplée'] === true || row['Supplée'] === 1 || row['Supplée'] === 'TRUE',
                  debut: row['Début'] ? 
                    (typeof row['Début'] === 'number' 
                      ? (() => {
                          try {
                            const date = XLSX.SSF.parse_date_code(row['Début']);
                            return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
                          } catch {
                            return row['Début'].toString();
                          }
                        })()
                      : row['Début'].toString()) 
                    : '',
                  duree: row['Durée'] || '',
                  cause_vac: row['Cause de vac.'] || '',
                  cause_decision: row['Cause décision'] || '',
                  vol1: parseFloat(row['Vol1.']) || 0,
                  vol2: parseFloat(row['Vol2.']) || 0,
                  // Le premier enseignant ou celui avec le plus de volume est considéré comme coordinateur par défaut
                  is_coordinator: false
                };

                course.teachers.push(teacher);
              }
            } catch (error) {
              console.error(`Erreur ligne ${index + 2}:`, error);
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

  const handleImport = async () => {
    if (!selectedFile) {
      toast({ title: "Aucun fichier sélectionné", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    setImportResults(null);

    try {
      // Parser le fichier Excel
      const parsedCourses = await parseExcelFile(selectedFile);

      if (parsedCourses.length === 0) {
        toast({ 
          title: "Aucun cours trouvé", 
          description: "Le fichier ne contient aucun cours valide",
          variant: "destructive" 
        });
        setIsImporting(false);
        return;
      }

      // Statistiques
      let coursesCreated = 0;
      let coursesUpdated = 0;
      let teachersCreated = 0;
      let assignmentsCreated = 0;
      const errors: string[] = [];

      // Importer chaque cours
      for (const courseData of parsedCourses) {
        try {
          // 1. Créer ou mettre à jour le cours
          const courseRecord = {
            code: courseData.code || null,
            title: courseData.title,
            faculty: courseData.dept_attribution || courseData.dept_charge || null,
            subcategory: courseData.type || null,
            volume_total_vol1: courseData.volume_total_vol1 || 0,
            volume_total_vol2: courseData.volume_total_vol2 || 0,
            vacant: courseData.vacant,
            academic_year: '2024-2025' // À adapter selon vos besoins
          };

          // Chercher si le cours existe déjà
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
            // Mettre à jour
            const { error: updateError } = await supabase
              .from('courses')
              .update(courseRecord)
              .eq('id', existingCourseId);
            
            if (updateError) throw updateError;
            courseId = existingCourseId;
            coursesUpdated++;
          } else {
            // Créer
            const { data: newCourse, error: insertError } = await supabase
              .from('courses')
              .insert([courseRecord])
              .select('id')
              .single();
            
            if (insertError) throw insertError;
            courseId = newCourse.id;
            coursesCreated++;
          }

          // 2. Supprimer les attributions existantes pour ce cours
          await supabase
            .from('course_assignments')
            .delete()
            .eq('course_id', courseId);

          // 3. Déterminer le coordinateur (premier enseignant ou celui avec le plus de volume)
          if (courseData.teachers.length > 0) {
            let maxVolume = 0;
            let coordinatorIndex = 0;
            courseData.teachers.forEach((teacher, index) => {
              const totalVolume = (teacher.vol1 || 0) + (teacher.vol2 || 0);
              if (totalVolume > maxVolume) {
                maxVolume = totalVolume;
                coordinatorIndex = index;
              }
            });
            courseData.teachers[coordinatorIndex].is_coordinator = true;
          }

          // 4. Traiter les enseignants
          for (const teacherData of courseData.teachers) {
            if (!teacherData.email && !teacherData.nom) {
              continue; // Ignorer les enseignants sans email ni nom
            }

            try {
              // Chercher ou créer l'enseignant
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
                // Créer l'enseignant
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

              // 5. Créer l'attribution
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
        preview: parsedCourses.slice(0, 5)
      });

      toast({ 
        title: "Import terminé", 
        description: `${coursesCreated + coursesUpdated} cours importés, ${teachersCreated} enseignants créés, ${assignmentsCreated} attributions créées`
      });

      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });

    } catch (error: any) {
      console.error('Erreur lors de l\'import:', error);
      toast({ 
        title: "Erreur d'import", 
        description: error.message || "Une erreur est survenue lors de l'import",
        variant: "destructive" 
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Importer depuis Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import de cours depuis Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Sélectionner un fichier Excel (.xlsx, .xls)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="w-full"
              disabled={isImporting}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Le fichier doit contenir les colonnes : Sigle, Cours, Intit.Complet, Etat vac., 
              Volume 1 total, Volume 2 total, Nom, Prénom, Email UCL, Vol1., Vol2.
            </p>
          </div>

          {importResults && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
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

              {importResults.preview.length > 0 && (
                <div className="mt-4">
                  <div className="font-medium mb-2">Aperçu (5 premiers cours):</div>
                  <div className="space-y-2 text-sm">
                    {importResults.preview.map((course, index) => (
                      <div key={index} className="p-2 bg-background rounded">
                        <div className="font-medium">{course.title}</div>
                        <div className="text-muted-foreground">
                          {course.code} - {course.teachers.length} enseignant(s) - 
                          {course.vacant ? ' Vacant' : ' Attribué'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isImporting}>
              Fermer
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || isImporting}
            >
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
