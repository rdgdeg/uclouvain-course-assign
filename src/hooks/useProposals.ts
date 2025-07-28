import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  nom: string;
  prenom: string;
  entite: string;
  grade: string;
  vol1: number;
  vol2: number;
}

interface TeamProposal {
  courseId?: number;
  courseInfo?: {
    code: string;
    nom_fr: string;
    nom_en: string;
    faculte: string;
    sous_categorie: string;
    volume_total_vol1: number;
    volume_total_vol2: number;
  };
  coordonnateur: TeamMember;
  cotitulaires: TeamMember[];
  submitterName: string;
  submitterEmail: string;
}

export const useProposals = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Récupérer les propositions en attente
  const { data: pendingProposals = [], isLoading } = useQuery({
    queryKey: ['pending-proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignment_proposals')
        .select(`
          *,
          courses (*)
        `)
        .eq('status', 'pending')
        .order('submission_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Soumettre une proposition d'équipe (cours existant)
  const submitTeamProposal = useMutation({
    mutationFn: async (proposal: TeamProposal) => {
      const proposalData = {
        course_id: proposal.courseId,
        submitter_name: proposal.submitterName,
        submitter_email: proposal.submitterEmail,
        proposal_data: {
          coordonnateur: proposal.coordonnateur,
          cotitulaires: proposal.cotitulaires,
          type: 'team_proposal'
        },
        status: 'pending',
        submission_date: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('assignment_proposals')
        .insert([proposalData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Proposition soumise",
        description: "Votre proposition a été enregistrée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la proposition.",
        variant: "destructive",
      });
    }
  });

  // Soumettre une candidature libre (cours non répertorié)
  const submitFreeProposal = useMutation({
    mutationFn: async (proposal: TeamProposal) => {
      if (!proposal.courseInfo) {
        throw new Error("Informations du cours requises");
      }

      const proposalData = {
        submitter_name: proposal.submitterName,
        submitter_email: proposal.submitterEmail,
        proposal_data: {
          course_info: proposal.courseInfo,
          coordonnateur: proposal.coordonnateur,
          cotitulaires: proposal.cotitulaires,
          type: 'free_proposal'
        },
        status: 'pending',
        submission_date: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('assignment_proposals')
        .insert([proposalData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-proposals'] });
      toast({
        title: "Candidature soumise",
        description: "Votre candidature libre a été enregistrée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la candidature.",
        variant: "destructive",
      });
    }
  });

  // Valider une proposition (admin)
  const validateProposal = useMutation({
    mutationFn: async ({ proposalId, status, adminNotes }: {
      proposalId: string;
      status: 'approved' | 'rejected';
      adminNotes?: string;
    }) => {
      const { data, error } = await supabase
        .from('assignment_proposals')
        .update({
          status,
          admin_notes: adminNotes,
          validated_at: new Date().toISOString(),
          validated_by: 'admin' // TODO: Récupérer l'utilisateur connecté
        })
        .eq('id', proposalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Proposition traitée",
        description: "La proposition a été traitée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la proposition.",
        variant: "destructive",
      });
    }
  });

  return {
    pendingProposals,
    isLoading,
    submitTeamProposal,
    submitFreeProposal,
    validateProposal
  };
}; 