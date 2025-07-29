import { Resend } from 'resend';

// Configuration du client Resend
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

// Créer le client Resend seulement si la clé API est disponible
export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

if (!RESEND_API_KEY) {
  console.warn('VITE_RESEND_API_KEY n\'est pas définie. Les emails ne pourront pas être envoyés.');
}

// Types pour les emails
export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface NotificationEmailData {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

// Service d'envoi d'emails
export class EmailService {
  private static defaultFrom = 'noreply@uclouvain.be';

  /**
   * Envoie un email de notification
   */
  static async sendNotification(data: NotificationEmailData): Promise<boolean> {
    try {
      if (!resend) {
        console.warn('Resend n\'est pas configuré. Email non envoyé.');
        return false;
      }

      const html = this.generateNotificationTemplate(data);
      
      const result = await resend.emails.send({
        from: this.defaultFrom,
        to: data.recipientEmail,
        subject: data.subject,
        html: html,
      });

      console.log('Email envoyé avec succès:', result);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }

  /**
   * Envoie un email de confirmation de proposition d'équipe
   */
  static async sendTeamProposalConfirmation(
    recipientEmail: string,
    recipientName: string,
    courseTitle: string,
    courseCode: string
  ): Promise<boolean> {
    const data: NotificationEmailData = {
      recipientEmail,
      recipientName,
      subject: `Confirmation - Proposition d'équipe pour ${courseCode}`,
      message: `Votre proposition d'équipe pour le cours "${courseTitle}" (${courseCode}) a été reçue avec succès. Elle sera examinée par l'administration et vous recevrez une notification une fois le traitement terminé.`,
      actionUrl: `${window.location.origin}/`,
      actionText: 'Consulter les cours'
    };

    return this.sendNotification(data);
  }

  /**
   * Envoie un email de confirmation de demande de modification
   */
  static async sendModificationRequestConfirmation(
    recipientEmail: string,
    recipientName: string,
    requestType: string,
    courseTitle?: string
  ): Promise<boolean> {
    const courseInfo = courseTitle ? ` pour le cours "${courseTitle}"` : '';
    const data: NotificationEmailData = {
      recipientEmail,
      recipientName,
      subject: `Confirmation - Demande de modification`,
      message: `Votre demande de modification (${requestType})${courseInfo} a été reçue avec succès. Elle sera examinée par l'administration et vous recevrez une notification une fois le traitement terminé.`,
      actionUrl: `${window.location.origin}/demandes-modification`,
      actionText: 'Suivre mes demandes'
    };

    return this.sendNotification(data);
  }

  /**
   * Envoie un email de notification de statut (approbation/rejet)
   */
  static async sendStatusNotification(
    recipientEmail: string,
    recipientName: string,
    status: 'approved' | 'rejected',
    itemType: 'proposal' | 'request',
    itemTitle: string,
    reason?: string
  ): Promise<boolean> {
    const statusText = status === 'approved' ? 'approuvé' : 'rejeté';
    const typeText = itemType === 'proposal' ? 'proposition d\'équipe' : 'demande de modification';
    
    let message = `Votre ${typeText} pour "${itemTitle}" a été ${statusText}.`;
    
    if (status === 'rejected' && reason) {
      message += `\n\nRaison : ${reason}`;
    }

    const data: NotificationEmailData = {
      recipientEmail,
      recipientName,
      subject: `Mise à jour - ${typeText} ${statusText}`,
      message,
      actionUrl: `${window.location.origin}/`,
      actionText: 'Consulter le portail'
    };

    return this.sendNotification(data);
  }

  /**
   * Envoie un email de candidature libre
   */
  static async sendFreeProposalConfirmation(
    recipientEmail: string,
    recipientName: string,
    courseTitle: string,
    courseCode: string
  ): Promise<boolean> {
    const data: NotificationEmailData = {
      recipientEmail,
      recipientName,
      subject: `Confirmation - Candidature libre pour ${courseCode}`,
      message: `Votre candidature libre pour le cours "${courseTitle}" (${courseCode}) a été reçue avec succès. Elle sera examinée par l'administration et vous recevrez une notification une fois le traitement terminé.`,
      actionUrl: `${window.location.origin}/candidature-libre`,
      actionText: 'Consulter mes candidatures'
    };

    return this.sendNotification(data);
  }

  /**
   * Génère le template HTML pour les notifications
   */
  private static generateNotificationTemplate(data: NotificationEmailData): string {
    const actionButton = data.actionUrl && data.actionText 
      ? `<a href="${data.actionUrl}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">${data.actionText}</a>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Portail de Gestion des Cours</h1>
            <p>UCLouvain</p>
          </div>
          <div class="content">
            <h2>Bonjour ${data.recipientName},</h2>
            <p>${data.message.replace(/\n/g, '<br>')}</p>
            ${actionButton}
            <p style="margin-top: 30px;">
              Cordialement,<br>
              L'équipe d'administration<br>
              UCLouvain
            </p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            <p>© ${new Date().getFullYear()} UCLouvain - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
} 