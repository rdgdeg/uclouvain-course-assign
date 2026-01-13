import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Proposal {
  id: string;
  course_id: number;
  submitter_name: string;
  submitter_email: string;
  submission_date: string;
  status: 'pending' | 'approved' | 'rejected';
  proposal_data: any;
  admin_notes?: string;
  validated_at?: string;
  validated_by?: string;
  course: {
    title: string;
    code: string;
    faculty: string;
    subcategory?: string;
    volume_total_vol1: number;
    volume_total_vol2: number;
  };
}

export const ProposalManagement = () => {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Charger toutes les propositions pour obtenir les facultés
  const { data: allProposals = [] } = useQuery({
    queryKey: ['assignment-proposals-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignment_proposals')
        .select(`
          *,
          course:courses(
            title,
            code,
            faculty,
            subcategory,
            volume_total_vol1,
            volume_total_vol2
          )
        `)
        .order('submission_date', { ascending: false });

      if (error) throw error;
      return data as Proposal[];
    }
  });

  // Obtenir les facultés uniques depuis toutes les propositions
  const faculties = Array.from(
    new Set(
      allProposals
        .map(p => p.course?.faculty)
        .filter(Boolean) as string[]
    )
  ).sort();

  // Filtrer les propositions selon les filtres
  const proposals = allProposals.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesFaculty = facultyFilter === 'all' || p.course?.faculty === facultyFilter;
    return matchesStatus && matchesFaculty;
  });

  const isLoading = false; // On utilise les données déjà chargées

  const updateProposalMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes, 
      validatedBy 
    }: { 
      id: string; 
      status: 'approved' | 'rejected'; 
      notes: string; 
      validatedBy: string 
    }) => {
      const { error } = await supabase
        .from('assignment_proposals')
        .update({
          status,
          admin_notes: notes,
          validated_by: validatedBy,
          validated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;

      // Si approuvé, créer les attributions et marquer le cours comme non vacant
      if (status === 'approved') {
        // Récupérer la proposition complète depuis la base
        const { data: proposalData, error: fetchError } = await supabase
          .from('assignment_proposals')
          .select(`
            *,
            course:courses(
              title,
              code,
              faculty,
              subcategory,
              volume_total_vol1,
              volume_total_vol2
            )
          `)
          .eq('id', id)
          .single();
        
        if (fetchError) throw fetchError;
        const proposal = proposalData as Proposal;
        
        if (proposal && proposal.proposal_data.assignments) {
          // Supprimer les attributions existantes pour ce cours
          await supabase
            .from('course_assignments')
            .delete()
            .eq('course_id', proposal.course_id);

          // Créer ou trouver les enseignants et créer les attributions
          const assignmentsToInsert = [];
          
          for (const assignment of proposal.proposal_data.assignments) {
            let teacherId = assignment.teacher_id;
            
            // Si pas de teacher_id, créer ou trouver l'enseignant par email
            if (!teacherId && assignment.teacher_email) {
              // Chercher l'enseignant par email
              const { data: existingTeacher } = await supabase
                .from('teachers')
                .select('id')
                .eq('email', assignment.teacher_email)
                .single();
              
              if (existingTeacher) {
                teacherId = existingTeacher.id;
              } else {
                // Créer un nouvel enseignant
                const [firstName, ...lastNameParts] = (assignment.teacher_name || '').split(' ');
                const lastName = lastNameParts.join(' ') || '';
                
                const { data: newTeacher, error: teacherError } = await supabase
                  .from('teachers')
                  .insert([{
                    first_name: firstName || '',
                    last_name: lastName || '',
                    email: assignment.teacher_email
                  }])
                  .select('id')
                  .single();
                
                if (teacherError) throw teacherError;
                teacherId = newTeacher.id;
              }
            }
            
            if (teacherId) {
              assignmentsToInsert.push({
                course_id: proposal.course_id,
                teacher_id: teacherId,
                is_coordinator: assignment.is_coordinator || false,
                vol1_hours: assignment.vol1_hours || assignment.vol1 || 0,
                vol2_hours: assignment.vol2_hours || assignment.vol2 || 0,
                validated_by_coord: false
              });
            }
          }

          if (assignmentsToInsert.length > 0) {
            const { error: assignmentError } = await supabase
              .from('course_assignments')
              .insert(assignmentsToInsert);
            
            if (assignmentError) throw assignmentError;
          }

          // Marquer le cours comme non vacant
          const { error: courseError } = await supabase
            .from('courses')
            .update({ vacant: false })
            .eq('id', proposal.course_id);
          
          if (courseError) throw courseError;
        }
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['assignment-proposals'] });
      setShowDetails(false);
      setSelectedProposal(null);
      setAdminNotes("");
      
      toast({
        title: "Proposition mise à jour",
        description: `Proposition ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès.`,
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la proposition.",
        variant: "destructive",
      });
    }
  });

  const openProposalDetails = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setAdminNotes(proposal.admin_notes || "");
    setShowDetails(true);
  };

  const handleApprove = () => {
    if (!selectedProposal) return;
    
    updateProposalMutation.mutate({
      id: selectedProposal.id,
      status: 'approved',
      notes: adminNotes,
      validatedBy: 'Admin' // TODO: remplacer par l'utilisateur connecté
    });
  };

  const handleReject = () => {
    if (!selectedProposal) return;
    
    updateProposalMutation.mutate({
      id: selectedProposal.id,
      status: 'rejected',
      notes: adminNotes,
      validatedBy: 'Admin' // TODO: remplacer par l'utilisateur connecté
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des propositions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Candidatures en Équipe</h2>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Label>Filtrer par statut</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvées</SelectItem>
              <SelectItem value="rejected">Rejetées</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label>Filtrer par faculté</Label>
          <Select value={facultyFilter} onValueChange={setFacultyFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Toutes les facultés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les facultés</SelectItem>
              {faculties.map(faculty => (
                <SelectItem key={faculty} value={faculty}>
                  {faculty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="pt-6">
          <Badge variant="outline" className="text-sm">
            {proposals.length} candidature(s)
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{proposal.course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {proposal.course.code} - {proposal.course.faculty}
                    {proposal.course.subcategory && ` / ${proposal.course.subcategory}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(proposal.status)}
                  <Badge className={getStatusColor(proposal.status)}>
                    {proposal.status === 'pending' && 'En attente'}
                    {proposal.status === 'approved' && 'Approuvée'}
                    {proposal.status === 'rejected' && 'Rejetée'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Soumis par</Label>
                  <p className="text-sm">{proposal.submitter_name}</p>
                  <p className="text-xs text-muted-foreground">{proposal.submitter_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date de soumission</Label>
                  <p className="text-sm">
                    {new Date(proposal.submission_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Équipe proposée</Label>
                  <p className="text-sm">
                    {proposal.proposal_data.assignments?.length || 0} enseignant(s)
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openProposalDetails(proposal)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir détails
                </Button>
                
                {proposal.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => openProposalDetails(proposal)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openProposalDetails(proposal)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {proposals.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Aucune proposition trouvée
          </p>
          <p className="text-muted-foreground">
            {statusFilter === 'all' 
              ? "Aucune proposition d'attribution n'a été soumise pour le moment."
              : `Aucune proposition avec le statut "${statusFilter}" trouvée.`
            }
          </p>
        </div>
      )}

      {/* Dialog de détails de la proposition */}
      {selectedProposal && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Détails de la proposition - {selectedProposal.course.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Informations du cours */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations du cours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Code</Label>
                      <p>{selectedProposal.course.code}</p>
                    </div>
                    <div>
                      <Label>Faculté</Label>
                      <p>{selectedProposal.course.faculty}</p>
                    </div>
                    <div>
                      <Label>Volume requis</Label>
                      <p>
                        Vol.1: {selectedProposal.course.volume_total_vol1}h | 
                        Vol.2: {selectedProposal.course.volume_total_vol2}h
                      </p>
                    </div>
                    <div>
                      <Label>Volume proposé</Label>
                      <p>
                        Vol.1: {selectedProposal.proposal_data.total_vol1 || 0}h | 
                        Vol.2: {selectedProposal.proposal_data.total_vol2 || 0}h
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Équipe proposée */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Équipe pédagogique proposée</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedProposal.proposal_data.assignments?.map((assignment: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{assignment.teacher_name}</p>
                          <p className="text-sm text-muted-foreground">{assignment.teacher_email}</p>
                          {assignment.is_coordinator && (
                            <Badge variant="secondary" className="mt-1">Coordinateur</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            Vol.1: {assignment.vol1_hours}h | Vol.2: {assignment.vol2_hours}h
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedProposal.proposal_data.additional_notes && (
                    <div className="mt-4">
                      <Label>Notes du soumissionnaire</Label>
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {selectedProposal.proposal_data.additional_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes administratives */}
              <div>
                <Label htmlFor="admin_notes">Notes administratives</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ajoutez des commentaires ou la raison de votre décision..."
                  rows={4}
                />
              </div>

              {/* Actions */}
              {selectedProposal.status === 'pending' && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Fermer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={updateProposalMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={updateProposalMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                </div>
              )}

              {selectedProposal.status !== 'pending' && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Fermer
                  </Button>
                </div>
              )}

              {/* Informations de validation */}
              {selectedProposal.validated_at && (
                <div className="bg-muted p-4 rounded-lg">
                  <Label>Informations de validation</Label>
                  <p className="text-sm">
                    Validé par {selectedProposal.validated_by} le {new Date(selectedProposal.validated_at).toLocaleDateString('fr-FR')}
                  </p>
                  {selectedProposal.admin_notes && (
                    <p className="text-sm mt-2">{selectedProposal.admin_notes}</p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};