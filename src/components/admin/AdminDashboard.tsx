import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageSquare, 
  FileText, 
  AlertTriangle,
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  Bell,
  RefreshCw,
  Filter,
  Download,
  Plus,
  Settings,
  Database,
  Send,
  Calendar,
  UserCheck,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminNotifications } from "./AdminNotifications";

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

interface Course {
  id: number;
  title: string;
  code: string;
  faculty: string;
  vacant: boolean;
  assignments?: any[];
}

export const AdminDashboard = () => {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ModificationRequest | null>(null);
  const [showProposalDetails, setShowProposalDetails] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation pour valider une proposition
  const validateProposalMutation = useMutation({
    mutationFn: async ({ 
      proposalId, 
      status, 
      adminNotes 
    }: { 
      proposalId: string; 
      status: 'approved' | 'rejected'; 
      adminNotes: string; 
    }) => {
      const { data, error } = await supabase
        .from('assignment_proposals')
        .update({
          status,
          admin_notes: adminNotes,
          validated_at: new Date().toISOString(),
          validated_by: 'Admin'
        })
        .eq('id', proposalId)
        .select()
        .single();

      if (error) throw error;

      // Si approuvé, créer les attributions et marquer le cours comme non vacant
      if (status === 'approved' && data) {
        const proposal = proposals.find(p => p.id === proposalId);
        if (proposal && proposal.proposal_data.assignments) {
          // Supprimer les attributions existantes pour ce cours
          await supabase
            .from('course_assignments')
            .delete()
            .eq('course_id', proposal.course_id);

          // Créer les nouvelles attributions
          const assignmentsToInsert = proposal.proposal_data.assignments.map((assignment: any) => ({
            course_id: proposal.course_id,
            teacher_id: assignment.teacher_id,
            is_coordinator: assignment.is_coordinator,
            vol1_hours: assignment.vol1_hours,
            vol2_hours: assignment.vol2_hours,
            validated_by_coord: false
          }));

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

      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['assignment-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowProposalDetails(false);
      setSelectedProposal(null);
      setAdminNotes("");
      
      toast({
        title: "Proposition traitée",
        description: `Proposition ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès.`,
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la proposition.",
        variant: "destructive",
      });
    }
  });

  // Mutation pour traiter une demande de modification
  const updateRequestMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      adminNotes 
    }: { 
      requestId: string; 
      status: 'approved' | 'rejected'; 
      adminNotes: string; 
    }) => {
      const { data, error } = await supabase
        .from('modification_requests')
        .update({
          status,
          admin_notes: adminNotes,
          validated_at: new Date().toISOString(),
          validated_by: 'Admin'
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      // Si approuvé, marquer le cours comme non vacant
      if (status === 'approved' && selectedRequest?.course_id) {
        await supabase
          .from('courses')
          .update({ vacant: false })
          .eq('id', selectedRequest.course_id);
      }

      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['modification-requests'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowRequestDetails(false);
      setSelectedRequest(null);
      setAdminNotes("");
      
      toast({
        title: "Demande traitée",
        description: `Demande ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès.`,
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

  // Récupération des propositions
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ['assignment-proposals', statusFilter],
    queryFn: async () => {
      let query = supabase
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

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Proposal[];
    }
  });

  // Récupération des demandes de modification
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
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
      return data as ModificationRequest[];
    }
  });

  // Récupération des cours
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('title');
      if (error) throw error;
      return data as Course[];
    }
  });

  // Calcul des statistiques
  const stats = {
    totalProposals: proposals.length,
    pendingProposals: proposals.filter(p => p.status === 'pending').length,
    approvedProposals: proposals.filter(p => p.status === 'approved').length,
    rejectedProposals: proposals.filter(p => p.status === 'rejected').length,
    
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    approvedRequests: requests.filter(r => r.status === 'approved').length,
    rejectedRequests: requests.filter(r => r.status === 'rejected').length,
    
    totalCourses: courses.length,
    vacantCourses: courses.filter(c => c.vacant).length,
    assignedCourses: courses.filter(c => !c.vacant && c.assignments && c.assignments.length > 0).length,
  };

  const openProposalDetails = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setAdminNotes(proposal.admin_notes || "");
    setShowProposalDetails(true);
  };

  const openRequestDetails = (request: ModificationRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || "");
    setShowRequestDetails(true);
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

  const handleApproveProposal = () => {
    if (!selectedProposal) return;
    
    validateProposalMutation.mutate({
      proposalId: selectedProposal.id,
      status: 'approved',
      adminNotes: adminNotes
    });
  };

  const handleRejectProposal = () => {
    if (!selectedProposal) return;
    
    validateProposalMutation.mutate({
      proposalId: selectedProposal.id,
      status: 'rejected',
      adminNotes: adminNotes
    });
  };

  const handleApproveRequest = () => {
    if (!selectedRequest) return;
    
    updateRequestMutation.mutate({
      requestId: selectedRequest.id,
      status: 'approved',
      adminNotes: adminNotes
    });
  };

  const handleRejectRequest = () => {
    if (!selectedRequest) return;
    
    updateRequestMutation.mutate({
      requestId: selectedRequest.id,
      status: 'rejected',
      adminNotes: adminNotes
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Propositions en attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingProposals}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Demandes en attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cours vacants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.vacantCourses}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cours attribués</p>
                <p className="text-2xl font-bold text-gray-900">{stats.assignedCourses}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="proposals" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Propositions ({stats.pendingProposals})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Demandes ({stats.pendingRequests})
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Cours
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          {/* Notifications et alertes */}
          <AdminNotifications
            proposalsCount={stats.pendingProposals}
            requestsCount={stats.pendingRequests}
            vacantCoursesCount={stats.vacantCourses}
            onViewProposals={() => setActiveTab('proposals')}
            onViewRequests={() => setActiveTab('requests')}
            onViewCourses={() => setActiveTab('courses')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Propositions récentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Propositions récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proposals.slice(0, 5).map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{proposal.course.title}</p>
                        <p className="text-xs text-gray-500">
                          {proposal.submitter_name} • {format(new Date(proposal.submission_date), "dd/MM/yyyy", { locale: fr })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(proposal.status)}
                        <Badge className={getStatusColor(proposal.status)}>
                          {proposal.status === 'pending' && 'En attente'}
                          {proposal.status === 'approved' && 'Approuvée'}
                          {proposal.status === 'rejected' && 'Rejetée'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openProposalDetails(proposal)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {proposals.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Aucune proposition</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Demandes récentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Demandes récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{request.courses?.title}</p>
                        <p className="text-xs text-gray-500">
                          {request.requester_name} • {format(new Date(request.created_at), "dd/MM/yyyy", { locale: fr })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <Badge className={getStatusColor(request.status)}>
                          {request.status === 'pending' && 'En attente'}
                          {request.status === 'approved' && 'Approuvée'}
                          {request.status === 'rejected' && 'Rejetée'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRequestDetails(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {requests.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Aucune demande</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Propositions */}
        <TabsContent value="proposals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestion des Propositions</h2>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvées</SelectItem>
                  <SelectItem value="rejected">Rejetées</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>

          {proposalsLoading ? (
            <div className="text-center py-8">Chargement des propositions...</div>
          ) : (
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
                          {format(new Date(proposal.submission_date), "dd/MM/yyyy", { locale: fr })}
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

              {proposals.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
            </div>
          )}
        </TabsContent>

        {/* Demandes de modification */}
        <TabsContent value="requests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Demandes de Modification</h2>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {requestsLoading ? (
            <div className="text-center py-8">Chargement des demandes...</div>
          ) : (
            <Card>
              <CardContent className="p-0">
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <Badge className={getStatusColor(request.status)}>
                              {request.status === 'pending' && 'En attente'}
                              {request.status === 'approved' && 'Approuvée'}
                              {request.status === 'rejected' && 'Rejetée'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRequestDetails(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {requests.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      Aucune demande trouvée
                    </p>
                    <p className="text-muted-foreground">
                      Aucune demande de modification n'a été soumise pour le moment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cours */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestion des Cours</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>

          {coursesLoading ? (
            <div className="text-center py-8">Chargement des cours...</div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Faculté</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Attributions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.slice(0, 10).map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-bold px-2 py-1 bg-blue-100 text-blue-800 border-blue-300">
                              {course.code}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{course.title}</TableCell>
                        <TableCell>{course.faculty}</TableCell>
                        <TableCell>
                          <Badge className={course.vacant ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                            {course.vacant ? "Vacant" : "Attribué"}
                          </Badge>
                        </TableCell>
                        <TableCell>{course.assignments ? course.assignments.length : 0} enseignant(s)</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {courses.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      Aucun cours trouvé
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de détails de proposition */}
      {selectedProposal && (
        <Dialog open={showProposalDetails} onOpenChange={setShowProposalDetails}>
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
                  <Button variant="outline" onClick={() => setShowProposalDetails(false)}>
                    Fermer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRejectProposal}
                    disabled={validateProposalMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button
                    onClick={handleApproveProposal}
                    disabled={validateProposalMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                </div>
              )}

              {selectedProposal.status !== 'pending' && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setShowProposalDetails(false)}>
                    Fermer
                  </Button>
                </div>
              )}

              {/* Informations de validation */}
              {selectedProposal.validated_at && (
                <div className="bg-muted p-4 rounded-lg">
                  <Label>Informations de validation</Label>
                  <p className="text-sm">
                    Validé par {selectedProposal.validated_by} le {format(new Date(selectedProposal.validated_at), "dd/MM/yyyy", { locale: fr })}
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

      {/* Dialog de détails de demande */}
      {selectedRequest && (
        <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de la demande</DialogTitle>
            </DialogHeader>
            
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
                <div className="mt-1">
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status === 'pending' && 'En attente'}
                    {selectedRequest.status === 'approved' && 'Approuvée'}
                    {selectedRequest.status === 'rejected' && 'Rejetée'}
                  </Badge>
                </div>
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
                    <Button 
                      variant="destructive" 
                      onClick={handleRejectRequest}
                      disabled={updateRequestMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                    <Button 
                      onClick={handleApproveRequest}
                      disabled={updateRequestMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
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
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}; 