import React, { useState } from "react";
import { useProposals } from "@/hooks/useProposals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye } from "lucide-react";

export const ProposalReviewPanel: React.FC = () => {
  const { pendingProposals, validateProposal, isLoading } = useProposals();
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const handleReview = (proposal: any) => {
    setSelectedProposal(proposal);
    setAdminNotes("");
    setIsReviewDialogOpen(true);
  };

  const handleValidate = (status: 'approved' | 'rejected') => {
    if (!selectedProposal) return;

    validateProposal.mutate({
      proposalId: selectedProposal.id,
      status,
      adminNotes: adminNotes.trim() || undefined
    });

    setIsReviewDialogOpen(false);
    setSelectedProposal(null);
    setAdminNotes("");
  };

  const formatProposalData = (proposal: any) => {
    const data = proposal.proposal_data;
    if (data.type === 'free_proposal') {
      return {
        type: 'Candidature libre',
        course: data.course_info,
        coordonnateur: data.coordonnateur,
        cotitulaires: data.cotitulaires
      };
    } else {
      return {
        type: 'Proposition d\'équipe',
        course: proposal.courses,
        coordonnateur: data.coordonnateur,
        cotitulaires: data.cotitulaires
      };
    }
  };

  if (isLoading) {
    return <div>Chargement des propositions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Propositions en attente</h2>
        <Badge variant="secondary">{pendingProposals.length} propositions</Badge>
      </div>

      {pendingProposals.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Aucune proposition en attente
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingProposals.map((proposal) => {
            const formattedData = formatProposalData(proposal);
            return (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {formattedData.type}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Soumis par {proposal.submitter_name} ({proposal.submitter_email})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(proposal.submission_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReview(proposal)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Examiner
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Cours</h4>
                      <p><strong>Code:</strong> {formattedData.course?.code || 'N/A'}</p>
                      <p><strong>Nom:</strong> {formattedData.course?.title || formattedData.course?.nom_fr || 'N/A'}</p>
                      <p><strong>Faculté:</strong> {formattedData.course?.faculty || formattedData.course?.faculte || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Équipe</h4>
                      <p><strong>Coordonnateur:</strong> {formattedData.coordonnateur?.prenom} {formattedData.coordonnateur?.nom}</p>
                      <p><strong>Cotitulaires:</strong> {formattedData.cotitulaires?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de révision */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Réviser la proposition</DialogTitle>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Détails de la proposition</h4>
                {(() => {
                  const data = formatProposalData(selectedProposal);
                  return (
                    <div className="space-y-2">
                      <p><strong>Type:</strong> {data.type}</p>
                      <p><strong>Cours:</strong> {data.course?.title || data.course?.nom_fr}</p>
                      <p><strong>Coordonnateur:</strong> {data.coordonnateur?.prenom} {data.coordonnateur?.nom}</p>
                      <p><strong>Cotitulaires:</strong> {data.cotitulaires?.length || 0}</p>
                    </div>
                  );
                })()}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes administratives (optionnel)
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ajoutez des notes pour le candidat..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsReviewDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleValidate('rejected')}
                  disabled={validateProposal.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeter
                </Button>
                <Button
                  onClick={() => handleValidate('approved')}
                  disabled={validateProposal.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approuver
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 