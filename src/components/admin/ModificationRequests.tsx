import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ModificationRequest {
  id: string;
  course_id: number;
  requester_name: string;
  requester_email: string;
  modification_type: string;
  description: string;
  status: string;
  admin_notes: string;
  created_at: string;
  validated_at: string;
  validated_by: string;
  courses: {
    title: string;
    code: string;
    faculty: string;
  };
}

export const ModificationRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<ModificationRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['modification-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modification_requests')
        .select(`
          *,
          courses (
            title,
            code,
            faculty
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      admin_notes, 
      validated_by 
    }: { 
      id: string; 
      status: 'approved' | 'rejected'; 
      admin_notes: string;
      validated_by: string;
    }) => {
      const { data, error } = await supabase
        .from('modification_requests')
        .update({
          status,
          admin_notes,
          validated_by,
          validated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modification-requests'] });
      
      // Si la demande est approuvée, marquer le cours comme non vacant
      if (variables.status === 'approved' && selectedRequest?.course_id) {
        supabase
          .from('courses')
          .update({ vacant: false })
          .eq('id', selectedRequest.course_id)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
          });
      }
      
      setIsViewDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes("");
      
      toast({
        title: variables.status === 'approved' ? "Demande approuvée" : "Demande rejetée",
        description: "La décision a été enregistrée et l'utilisateur sera notifié.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la demande.",
        variant: "destructive",
      });
    }
  });

  const handleViewRequest = (request: ModificationRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || "");
    setIsViewDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    
    updateRequestMutation.mutate({
      id: selectedRequest.id,
      status: 'approved',
      admin_notes: adminNotes,
      validated_by: 'Admin' // Vous pouvez récupérer le nom de l'admin connecté
    });
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    
    updateRequestMutation.mutate({
      id: selectedRequest.id,
      status: 'rejected',
      admin_notes: adminNotes,
      validated_by: 'Admin'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      case 'approved':
        return <Badge variant="default">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejetée</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getModificationTypeLabel = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'Attribution';
      case 'content':
        return 'Contenu';
      case 'schedule':
        return 'Horaires';
      case 'other':
        return 'Autre';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demandes de Modification</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {format(new Date(request.created_at), "dd/MM/yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.courses?.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.courses?.code} - {request.courses?.faculty}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.requester_name}</div>
                        <div className="text-sm text-muted-foreground">{request.requester_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getModificationTypeLabel(request.modification_type)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Cours</Label>
                  <p>{selectedRequest.courses?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.courses?.code} - {selectedRequest.courses?.faculty}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Demandeur</Label>
                  <p>{selectedRequest.requester_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.requester_email}</p>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Type de modification</Label>
                <p>{getModificationTypeLabel(selectedRequest.modification_type)}</p>
              </div>

              <div>
                <Label className="font-semibold">Description</Label>
                <p className="mt-1 p-3 bg-muted rounded-md">{selectedRequest.description}</p>
              </div>

              <div>
                <Label className="font-semibold">Date de demande</Label>
                <p>{format(new Date(selectedRequest.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}</p>
              </div>

              <div>
                <Label className="font-semibold">Statut actuel</Label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admin-notes">Notes administratives</Label>
                    <Textarea
                      id="admin-notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Ajoutez des commentaires sur cette demande..."
                      className="mt-1"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="destructive" onClick={handleReject}>
                      <X className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                    <Button onClick={handleApprove}>
                      <Check className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                  </div>
                </div>
              )}

              {selectedRequest.status !== 'pending' && selectedRequest.admin_notes && (
                <div>
                  <Label className="font-semibold">Notes administratives</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedRequest.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};