# Guide de Configuration Resend - Portail de Gestion des Cours UCLouvain

## Vue d'ensemble

Resend est un service moderne d'envoi d'emails qui remplace les solutions traditionnelles comme SendGrid ou Mailgun. Il offre une API simple, une excellente délivrabilité et des templates HTML personnalisables.

## Configuration

### 1. Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre domaine (uclouvain.be) ou utilisez le domaine de test fourni

### 2. Obtenir la clé API

1. Dans le dashboard Resend, allez dans "API Keys"
2. Créez une nouvelle clé API
3. Copiez la clé (elle commence par `re_`)

### 3. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# Configuration Supabase
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Configuration Resend pour l'envoi d'emails
VITE_RESEND_API_KEY=re_your_api_key_here

# Configuration de l'application
VITE_APP_NAME="Portail de Gestion des Cours UCLouvain"
VITE_APP_URL=http://localhost:3000
```

### 4. Vérification de la configuration

1. Démarrez l'application : `npm run dev`
2. Allez dans l'interface admin : `/admin`
3. Cliquez sur "Test Emails" dans les actions rapides
4. Testez l'envoi d'un email

## Types d'emails supportés

### 1. Confirmation de proposition d'équipe
- **Déclencheur** : Soumission d'une proposition d'équipe
- **Contenu** : Confirmation de réception, détails du cours
- **Template** : `sendTeamProposalConfirmation()`

### 2. Confirmation de demande de modification
- **Déclencheur** : Soumission d'une demande de modification
- **Contenu** : Confirmation de réception, type de modification
- **Template** : `sendModificationRequestConfirmation()`

### 3. Notification de statut
- **Déclencheur** : Changement de statut (approbation/rejet)
- **Contenu** : Nouveau statut, raison si applicable
- **Template** : `sendStatusNotification()`

### 4. Confirmation de candidature libre
- **Déclencheur** : Soumission d'une candidature libre
- **Contenu** : Confirmation de réception, détails du cours
- **Template** : `sendFreeProposalConfirmation()`

## Structure des emails

### Template HTML
Tous les emails utilisent un template HTML cohérent avec :
- **En-tête** : Logo UCLouvain, titre de l'application
- **Contenu** : Message personnalisé selon le type d'email
- **Bouton d'action** : Lien vers l'application (optionnel)
- **Pied de page** : Informations légales et contact

### Styles CSS
```css
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
.content { background-color: #f8fafc; padding: 30px; }
.button { background-color: #1e40af; color: white; padding: 12px 24px; }
```

## Utilisation dans le code

### Hook useEmail
```typescript
import { useEmail } from '@/hooks/useEmail';

const { sendTeamProposalConfirmation, isSending } = useEmail();

// Envoi d'un email
await sendTeamProposalConfirmation(
  recipientEmail,
  recipientName,
  courseTitle,
  courseCode
);
```

### Service EmailService
```typescript
import { EmailService } from '@/integrations/resend/client';

// Envoi direct
const success = await EmailService.sendNotification({
  recipientEmail: 'user@uclouvain.be',
  recipientName: 'John Doe',
  subject: 'Test',
  message: 'Message de test'
});
```

## Tests et débogage

### Panneau de test
1. Accédez à `/admin`
2. Cliquez sur "Test Emails"
3. Remplissez les champs de test
4. Sélectionnez le type d'email
5. Cliquez sur "Envoyer un email de test"

### Logs de débogage
Les erreurs d'envoi sont loggées dans la console :
```javascript
console.log('Email envoyé avec succès:', result);
console.error('Erreur lors de l\'envoi de l\'email:', error);
```

### Vérification de la délivrabilité
1. Vérifiez votre boîte de réception
2. Consultez les logs Resend dans le dashboard
3. Vérifiez les dossiers spam si nécessaire

## Sécurité et bonnes pratiques

### Protection des clés API
- Ne jamais commiter les clés API dans Git
- Utiliser des variables d'environnement
- Limiter les permissions des clés API

### Validation des emails
- Vérifier le format des emails
- Valider les domaines UCLouvain
- Gérer les erreurs d'envoi

### Rate limiting
- Resend limite à 100 emails/jour en version gratuite
- Implémenter un système de queue si nécessaire
- Monitorer l'utilisation

## Monitoring et analytics

### Dashboard Resend
- **Délivrabilité** : Taux de succès des envois
- **Performance** : Temps de livraison
- **Erreurs** : Bounces, rejets, etc.

### Métriques à surveiller
- Taux de délivrabilité > 95%
- Temps de livraison < 5 secondes
- Taux de clics sur les liens
- Taux d'ouverture des emails

## Dépannage

### Problèmes courants

**Erreur : "API key not found"**
- Vérifiez que `VITE_RESEND_API_KEY` est définie
- Redémarrez l'application après modification

**Erreur : "Domain not verified"**
- Vérifiez votre domaine dans le dashboard Resend
- Utilisez le domaine de test pour les développements

**Emails non reçus**
- Vérifiez les dossiers spam
- Testez avec un email Gmail/Outlook
- Consultez les logs Resend

### Support
- **Documentation Resend** : [resend.com/docs](https://resend.com/docs)
- **Support technique** : support@resend.com
- **GitHub Issues** : Pour les problèmes spécifiques à l'application

## Migration depuis d'autres services

### Depuis SendGrid
1. Exportez vos templates
2. Adaptez le format HTML
3. Mettez à jour les clés API
4. Testez la délivrabilité

### Depuis Mailgun
1. Migrez les domaines
2. Adaptez les webhooks
3. Mettez à jour la configuration
4. Vérifiez les statistiques

## Coûts et limites

### Version gratuite
- 100 emails/jour
- 3 domaines vérifiés
- Support email
- API complète

### Version payante
- 50 000 emails/mois à partir de $20
- Domaines illimités
- Support prioritaire
- Analytics avancés

---

*Guide mis à jour le : $(date)*
*Version Resend : 3.x* 