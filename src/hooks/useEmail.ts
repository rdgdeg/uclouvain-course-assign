import { useState } from 'react';
import { useToast } from './use-toast';
import { EmailService } from '@/integrations/resend/client';

export const useEmail = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  /**
   * Envoie une confirmation de proposition d'équipe
   */
  const sendTeamProposalConfirmation = async (
    recipientEmail: string,
    recipientName: string,
    courseTitle: string,
    courseCode: string
  ) => {
    setIsSending(true);
    try {
      const success = await EmailService.sendTeamProposalConfirmation(
        recipientEmail,
        recipientName,
        courseTitle,
        courseCode
      );

      if (success) {
        toast({
          title: "Email envoyé",
          description: "Une confirmation a été envoyée par email.",
        });
      } else {
        toast({
          title: "Erreur d'envoi",
          description: "Impossible d'envoyer l'email de confirmation.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast({
        title: "Erreur d'envoi",
        description: "Une erreur est survenue lors de l'envoi de l'email.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Envoie une confirmation de demande de modification
   */
  const sendModificationRequestConfirmation = async (
    recipientEmail: string,
    recipientName: string,
    requestType: string,
    courseTitle?: string
  ) => {
    setIsSending(true);
    try {
      const success = await EmailService.sendModificationRequestConfirmation(
        recipientEmail,
        recipientName,
        requestType,
        courseTitle
      );

      if (success) {
        toast({
          title: "Email envoyé",
          description: "Une confirmation a été envoyée par email.",
        });
      } else {
        toast({
          title: "Erreur d'envoi",
          description: "Impossible d'envoyer l'email de confirmation.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast({
        title: "Erreur d'envoi",
        description: "Une erreur est survenue lors de l'envoi de l'email.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Envoie une notification de statut (approbation/rejet)
   */
  const sendStatusNotification = async (
    recipientEmail: string,
    recipientName: string,
    status: 'approved' | 'rejected',
    itemType: 'proposal' | 'request',
    itemTitle: string,
    reason?: string
  ) => {
    setIsSending(true);
    try {
      const success = await EmailService.sendStatusNotification(
        recipientEmail,
        recipientName,
        status,
        itemType,
        itemTitle,
        reason
      );

      if (success) {
        toast({
          title: "Notification envoyée",
          description: "La notification de statut a été envoyée par email.",
        });
      } else {
        toast({
          title: "Erreur d'envoi",
          description: "Impossible d'envoyer la notification de statut.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast({
        title: "Erreur d'envoi",
        description: "Une erreur est survenue lors de l'envoi de l'email.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Envoie une confirmation de candidature libre
   */
  const sendFreeProposalConfirmation = async (
    recipientEmail: string,
    recipientName: string,
    courseTitle: string,
    courseCode: string
  ) => {
    setIsSending(true);
    try {
      const success = await EmailService.sendFreeProposalConfirmation(
        recipientEmail,
        recipientName,
        courseTitle,
        courseCode
      );

      if (success) {
        toast({
          title: "Email envoyé",
          description: "Une confirmation a été envoyée par email.",
        });
      } else {
        toast({
          title: "Erreur d'envoi",
          description: "Impossible d'envoyer l'email de confirmation.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast({
        title: "Erreur d'envoi",
        description: "Une erreur est survenue lors de l'envoi de l'email.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    sendTeamProposalConfirmation,
    sendModificationRequestConfirmation,
    sendStatusNotification,
    sendFreeProposalConfirmation,
  };
}; 