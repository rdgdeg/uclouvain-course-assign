import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, Edit, Trash2, Download } from "lucide-react";

interface TeacherStatus {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export const TeacherImportAndStatus = () => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [editingStatus, setEditingStatus] = useState<TeacherStatus | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusFormData, setStatusFormData] = useState({
    name: "",
    description: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer tous les statuts
  const { data: statuses = [], isLoading: statusLoading } = useQuery({
    queryKey: ['teacher-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_statuses')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const createStatusMutation = useMutation({
    mutationFn: async (newStatus: { name: string; description: string }) => {
      const { data, error } = await supabase
        .from('teacher_statuses')
        .insert([newStatus])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-statuses'] });
      setIsStatusDialogOpen(false);
      resetStatusForm();
      toast({
        title: "Statut créé",
        description: "Le nouveau statut a été ajouté avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le statut.",
        variant: "destructive",
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TeacherStatus> & { id: number }) => {
      const { data, error } = await supabase
        .from('teacher_statuses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-statuses'] });
      setIsStatusDialogOpen(false);
      setEditingStatus(null);
      resetStatusForm();
      toast({
        title: "Statut modifié",
        description: "Le statut a été mis à jour.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut.",
        variant: "destructive",
      });
    }
  });

  const deleteStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('teacher_statuses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-statuses'] });
      toast({
        title: "Statut supprimé",
        description: "Le statut a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le statut.",
        variant: "destructive",
      });
    }
  });

  const importTeachersMutation = useMutation({
    mutationFn: async (teachers: any[]) => {
      // D'abord, vérifier quels emails existent déjà
      const emails = teachers.map(t => t.email);
      const { data: existingTeachers, error: fetchError } = await supabase
        .from('teachers')
        .select('email')
        .in('email', emails);
      
      if (fetchError) throw fetchError;
      
      const existingEmails = new Set(existingTeachers?.map(t => t.email) || []);
      const newTeachers = teachers.filter(t => !existingEmails.has(t.email));
      const skippedCount = teachers.length - newTeachers.length;
      
      let insertedData = [];
      if (newTeachers.length > 0) {
        const { data, error } = await supabase
          .from('teachers')
          .insert(newTeachers)
          .select();
        if (error) throw error;
        insertedData = data || [];
      }
      
      return { 
        inserted: insertedData, 
        skipped: skippedCount,
        total: teachers.length 
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setIsImportDialogOpen(false);
      setSelectedFile(null);
      setCsvData("");
      
      const message = result.skipped > 0 
        ? `${result.inserted.length} enseignant(s) importé(s), ${result.skipped} ignoré(s) (déjà existants).`
        : `${result.inserted.length} enseignant(s) importé(s) avec succès.`;
        
      toast({
        title: "Import terminé",
        description: message,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur d'import",
        description: "Vérifiez le format de vos données et réessayez.",
        variant: "destructive",
      });
      console.error("Import error:", error);
    }
  });

  const resetStatusForm = () => {
    setStatusFormData({
      name: "",
      description: ""
    });
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStatus) {
      updateStatusMutation.mutate({ id: editingStatus.id, ...statusFormData });
    } else {
      createStatusMutation.mutate(statusFormData);
    }
  };

  const handleEditStatus = (status: TeacherStatus) => {
    setEditingStatus(status);
    setStatusFormData({
      name: status.name,
      description: status.description
    });
    setIsStatusDialogOpen(true);
  };

  const handleDeleteStatus = (id: number, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le statut "${name}" ?\n\nCette action est irréversible.`)) {
      deleteStatusMutation.mutate(id);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
      // Traitement automatique après lecture du fichier
      handleImportTeachers(content);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImportTeachers = (dataToImport?: string) => {
    try {
      const data = dataToImport || csvData;
      const lines = data.trim().split('\n');
      console.log("Nombre de lignes:", lines.length);
      console.log("Première ligne (en-têtes):", lines[0]);
      
      if (lines.length < 2) {
        throw new Error("Le fichier doit contenir au moins une ligne d'en-têtes et une ligne de données");
      }

      // Détecter le séparateur utilisé
      let separator = '\t';
      let headers = lines[0].split('\t').map(h => h.trim());
      
      if (headers.length === 1) {
        if (lines[0].includes(',')) {
          separator = ',';
          headers = lines[0].split(',').map(h => h.trim());
        } else if (lines[0].includes(';')) {
          separator = ';';
          headers = lines[0].split(';').map(h => h.trim());
        }
      }
      
      console.log("Séparateur utilisé:", separator === '\t' ? 'tabulation' : separator);
      console.log("En-têtes détectés:", headers);
      
      // Mapping amélioré des colonnes avec correspondance exacte
      const headerMapping: { [key: string]: string } = {};
      
      headers.forEach(header => {
        const cleanHeader = header.toLowerCase().trim();
        console.log("Analyse de l'en-tête:", cleanHeader);
        
        // Mapping exact pour éviter les conflits
        if (cleanHeader === 'nom') {
          headerMapping['last_name'] = header;
        } else if (cleanHeader === 'prénom' || cleanHeader === 'prenom') {
          headerMapping['first_name'] = header;
        } else if (cleanHeader.includes('email')) {
          headerMapping['email'] = header;
        }
      });
      
      console.log("Mapping des colonnes trouvées:", headerMapping);
      
      if (!headerMapping['last_name'] || !headerMapping['first_name'] || !headerMapping['email']) {
        const found = Object.values(headerMapping).join(', ');
        throw new Error(`Colonnes manquantes. Trouvées: ${found}. Attendues: Nom, Prénom, Email`);
      }

      const teachers = lines.slice(1).map((line, index) => {
        const values = line.split(separator).map(v => v.trim());
        console.log(`Ligne ${index + 2} valeurs:`, values);
        
        const teacher: any = {
          status: 'Académique' // Statut par défaut
        };
        
        // Mapping des valeurs selon les en-têtes
        headers.forEach((header, i) => {
          if (header === headerMapping['last_name']) {
            teacher.last_name = values[i];
          } else if (header === headerMapping['first_name']) {
            teacher.first_name = values[i];
          } else if (header === headerMapping['email']) {
            teacher.email = values[i];
          }
        });

        console.log(`Enseignant créé pour la ligne ${index + 2}:`, teacher);

        if (!teacher.first_name || !teacher.last_name || !teacher.email) {
          throw new Error(`Ligne ${index + 2}: Nom, Prénom et Email sont obligatoires. Trouvé: ${JSON.stringify(teacher)}`);
        }

        return teacher;
      });

      console.log("Enseignants à importer:", teachers);
      importTeachersMutation.mutate(teachers);
    } catch (error) {
      console.error("Erreur d'import:", error);
      toast({
        title: "Erreur de format",
        description: error instanceof Error ? error.message : "Format invalide",
        variant: "destructive",
      });
    }
  };

  const handleCSVImport = (lines: string[], headers: string[]) => {
    const teachers = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const teacher: any = {};
      
      headers.forEach((header, i) => {
        const lowerHeader = header.toLowerCase();
        switch(lowerHeader) {
          case 'prénom':
          case 'prenom':
            teacher.first_name = values[i];
            break;
          case 'nom':
            teacher.last_name = values[i];
            break;
          case 'email':
          case 'email ucl':
            teacher.email = values[i];
            break;
          case 'statut':
            teacher.status = values[i] || 'Académique';
            break;
        }
      });

      if (!teacher.status) {
        teacher.status = 'Académique';
      }

      if (!teacher.first_name || !teacher.last_name || !teacher.email) {
        throw new Error(`Ligne ${index + 2}: Prénom, nom et email sont obligatoires`);
      }

      return teacher;
    });

    importTeachersMutation.mutate(teachers);
  };

  const generateExcelTemplate = () => {
    const template = "Nom\tPrénom\tEmail UCL\nDupont\tJean\tjean.dupont@uclouvain.be\nMartin\tMarie\tmarie.martin@uclouvain.be";
    const blob = new Blob([template], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_enseignants.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Import des enseignants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Import des Enseignants</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={generateExcelTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger le modèle Excel
              </Button>
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Importer des enseignants
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Importer des enseignants</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Format requis :</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Le fichier doit contenir les colonnes : <strong>Nom, Prénom, Email UCL</strong>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Formats supportés : .xlsx, .xls, .csv, .txt
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Upload de fichier */}
                      <div>
                        <Label htmlFor="file-upload">Choisir un fichier</Label>
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".xlsx,.xls,.csv,.txt"
                          onChange={handleFileUpload}
                          className="mt-2"
                        />
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Fichier sélectionné : {selectedFile.name}
                          </p>
                        )}
                      </div>

                      {/* Séparateur */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1 border-t"></div>
                        <span className="text-sm text-muted-foreground">ou</span>
                        <div className="flex-1 border-t"></div>
                      </div>

                      {/* Copier-coller manuel */}
                      <div>
                        <Label htmlFor="excel-data">Coller les données directement</Label>
                        <Textarea
                          id="excel-data"
                          placeholder="Nom	Prénom	Email UCL&#10;Dupont	Jean	jean.dupont@uclouvain.be&#10;Martin	Marie	marie.martin@uclouvain.be"
                          value={csvData}
                          onChange={(e) => setCsvData(e.target.value)}
                          rows={6}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => {
                        setIsImportDialogOpen(false);
                        setSelectedFile(null);
                        setCsvData("");
                      }}>
                        Annuler
                      </Button>
                      <Button 
                        onClick={() => handleImportTeachers()}
                        disabled={(!csvData.trim() && !selectedFile) || importTeachersMutation.isPending}
                      >
                        {importTeachersMutation.isPending ? "Import..." : "Importer"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Gestion des statuts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gestion des Statuts</span>
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingStatus(null); resetStatusForm(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Statut
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingStatus ? "Modifier le statut" : "Nouveau statut"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleStatusSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="status-name">Nom du statut</Label>
                    <Input
                      id="status-name"
                      value={statusFormData.name}
                      onChange={(e) => setStatusFormData({ ...statusFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status-description">Description</Label>
                    <Input
                      id="status-description"
                      value={statusFormData.description}
                      onChange={(e) => setStatusFormData({ ...statusFormData, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingStatus ? "Modifier" : "Créer"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <p>Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statuses.map((status) => (
                  <TableRow key={status.id}>
                    <TableCell className="font-medium">{status.name}</TableCell>
                    <TableCell>{status.description}</TableCell>
                    <TableCell>
                      <Badge variant={status.is_active ? 'default' : 'secondary'}>
                        {status.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditStatus(status)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteStatus(status.id, status.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
