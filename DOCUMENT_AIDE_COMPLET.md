# 📋 **DOCUMENT D'AIDE COMPLET - APPLICATION ATTRIB**

## 🎯 **Vue d'Ensemble de l'Application**

L'application **ATTRIB** est un portail de gestion des cours vacants pour l'UCLouvain. Elle permet aux enseignants de proposer des équipes pour les cours vacants et aux administrateurs de gérer efficacement ces attributions.

### **Objectifs Principaux**
- ✅ **Digitaliser** le processus d'attribution des cours vacants
- ✅ **Faciliter** la proposition d'équipes par les enseignants
- ✅ **Améliorer** la traçabilité des décisions administratives
- ✅ **Réduire** le temps de traitement administratif
- ✅ **Assurer** la cohérence des attributions

---

## 🏗️ **Architecture Technique**

### **Stack Technologique**
- **Frontend** : React 18 + TypeScript + Vite
- **UI/UX** : Tailwind CSS + shadcn/ui + Radix UI
- **Backend** : Supabase (PostgreSQL + authentification)
- **Email** : Resend
- **État** : TanStack Query (React Query)
- **Routing** : React Router DOM

### **Structure de Base de Données**
```sql
-- Tables principales
courses              -- Cours avec leurs informations
teachers             -- Enseignants
course_assignments   -- Attributions de cours aux enseignants
assignment_proposals -- Propositions d'équipes
modification_requests -- Demandes de modification
teacher_statuses     -- Statuts des enseignants
```

---

## 🖥️ **INTERFACES ET ÉCRANS DÉTAILLÉS**

### **1. INTERFACE PUBLIQUE** (`/`)

#### **🎯 Objectif**
Interface accessible à tous les enseignants pour consulter les cours vacants et proposer des équipes.

#### **📋 Fonctionnalités Principales**

##### **A. Consultation des Cours Vacants**
- **Affichage en mode carte** : Vue visuelle avec toutes les informations importantes
- **Affichage en mode liste** : Vue compacte pour navigation rapide
- **Pagination** : 12 cours par page avec navigation intuitive
- **Statistiques rapides** : Nombre de cours vacants disponibles

##### **B. Système de Filtrage Avancé**
- **Recherche textuelle** : Titre, code, faculté, sous-catégorie
- **Filtre par faculté** : FSM, FSP, FASB, MEDE
- **Filtre par école** : Sous-catégories selon la faculté
- **Filtrage automatique** : Seuls les cours vacants ET sans proposition en attente sont affichés

##### **C. Informations Affichées par Cours**
```
📚 Titre du cours
🏷️ Code du cours
🏛️ Faculté et sous-catégorie
⏰ Volume horaire (Vol1/Vol2)
📊 Coefficients (si disponibles)
📝 Remarques (si disponibles)
🎯 Statut (Vacant/Attribué)
```

##### **D. Menu d'Actions Déroulant**
- **"Proposer une équipe"** : Pour les cours vacants
- **"Demander une modification"** : Pour les cours existants
- **"Candidature libre"** : Pour les cours non répertoriés

#### **🔄 Processus de Proposition d'Équipe**

##### **Étape 1 : Sélection du Cours**
1. L'utilisateur clique sur "Proposer une équipe"
2. Vérification des détails du cours
3. Ouverture du formulaire de proposition

##### **Étape 2 : Remplissage du Formulaire**
**Informations Personnelles :**
- Nom complet du soumissionnaire
- Adresse email institutionnelle
- Téléphone (optionnel)

**Composition de l'Équipe :**
- **Coordonnateur** : Nom, prénom, entité, statut, email, téléphone
- **Cotitulaires** : Ajout dynamique de membres d'équipe
- **Répartition des heures** : Vol1 et Vol2 pour chaque membre
- **Validation automatique** : Contrôle que la somme des heures correspond au volume total

**Fonctionnalités Avancées :**
- **Recherche intelligente** des enseignants avec auto-complétion
- **Ajout d'enseignants** non répertoriés
- **Drag & Drop** pour réorganiser les cotitulaires
- **Sauvegarde automatique** toutes les 2 secondes
- **Prévisualisation PDF** avant soumission

##### **Étape 3 : Soumission et Confirmation**
1. Validation des données
2. Envoi de la proposition
3. Email de confirmation automatique
4. Masquage du cours de la liste (plus de candidature possible)

#### **📧 Système de Notifications**
- **Email de confirmation** immédiat après soumission
- **Email de statut** lors du traitement administratif
- **Notifications toast** pour les actions utilisateur

---

### **2. INTERFACE D'ADMINISTRATION DES COURS** (`/admin-courses`)

#### **🎯 Objectif**
Interface pour la gestion quotidienne des cours, des attributions et de la validation des propositions.

#### **🔐 Authentification**
- **Mot de passe** : `admin2025`
- **Session** : 30 minutes d'inactivité automatique
- **Sécurité** : Stockage local sécurisé

#### **📋 Fonctionnalités Principales**

##### **A. Tableau de Bord**
**Statistiques en Temps Réel :**
- Nombre total de cours
- Cours vacants vs attribués
- Propositions en attente
- Demandes de modification

**Actions Rapides :**
- Actualisation des données
- Import de nouveaux cours
- Export des données

##### **B. Gestion des Cours**
**Vue d'Ensemble :**
- Liste complète de tous les cours
- Filtres avancés (faculté, statut, recherche)
- Mode carte ou liste
- Pagination

**Actions par Cours :**
- **Modifier** les informations
- **Attribuer** des enseignants
- **Valider** les attributions
- **Exporter** les données

##### **C. Validation des Attributions**
**Contrôle Automatique :**
- Vérification de la répartition des heures
- Validation des coefficients
- Détection des incohérences

**Actions de Validation :**
- **Approuver** l'attribution
- **Demander des modifications**
- **Rejeter** avec justifications

##### **D. Système de Filtrage**
**Filtres Disponibles :**
- **Recherche** : Titre, code, enseignant
- **Faculté** : FSM, FSP, FASB, MEDE
- **Statut** : Vacant, Attribué, En attente
- **Sous-catégorie** : Selon la faculté
- **Validation** : Validé, En attente de validation

---

### **3. INTERFACE D'ADMINISTRATION GÉNÉRALE** (`/admin`)

#### **🎯 Objectif**
Interface centralisée pour la gestion complète du système, incluant toutes les fonctionnalités administratives.

#### **📋 Structure de Navigation**

##### **A. Tableau de Bord Centralisé**
**Notifications et Alertes :**
- **Alertes urgentes** : Propositions en attente de validation
- **Alertes importantes** : Demandes de modification à traiter
- **Informations** : Cours vacants, maintenance système

**Statistiques en Temps Réel :**
- Nombre de propositions en attente
- Nombre de demandes de modification
- Cours vacants vs attribués
- Taux de complétion global

**Actions Rapides :**
- Boutons directs vers les sections importantes
- Navigation fluide entre les différentes vues
- Actualisation en temps réel des données

##### **B. Onglets Principaux**

###### **1. Vue d'Ensemble (Dashboard)**
**Fonctionnalités :**
- **KPIs avec barres de progression** : Métriques visuelles
- **Actions rapides** : Accès direct aux fonctions principales
- **Activités récentes** : Timeline des actions récentes
- **Statistiques par faculté** : Vue détaillée par unité
- **Graphiques interactifs** : Visualisation des données

**Métriques Affichées :**
- Taux d'attribution global
- Cours vacants par faculté
- Propositions en attente
- Demandes de modification
- Activités récentes

###### **2. Gestion des Cours**
**Fonctionnalités :**
- **Vue d'ensemble** de tous les cours
- **Filtres avancés** combinables
- **Recherche intelligente** : Titre, code, enseignant
- **Validation des volumes** : Détection automatique des problèmes
- **Sauvegarde de filtres** : Persistance des préférences
- **Compteur de filtres actifs** : Feedback visuel

**Actions Disponibles :**
- **Modifier** les informations de cours
- **Attribuer** des enseignants
- **Valider** les attributions
- **Exporter** les données
- **Importer** de nouveaux cours

###### **3. Propositions**
**Fonctionnalités :**
- **Liste complète** de toutes les propositions
- **Filtres par statut** : En attente, Approuvées, Rejetées
- **Actions de validation** : Approuver, Rejeter, Voir détails
- **Détails complets** : Équipe proposée, volumes, notes
- **Historique** des décisions

**Processus de Validation :**
1. **Consultation** de la proposition
2. **Vérification** des détails de l'équipe
3. **Validation** des volumes horaires
4. **Décision** : Approuver ou rejeter
5. **Notes administratives** (optionnel)
6. **Notification** automatique au proposant

###### **4. Demandes de Modification**
**Fonctionnalités :**
- **Tableau des demandes** : Vue d'ensemble
- **Types de demandes** : Attribution, Contenu, Horaires, Autre
- **Statuts** : En attente, Approuvées, Rejetées
- **Traitement** : Approuver, Rejeter avec notes
- **Historique** complet

**Processus de Traitement :**
1. **Consultation** de la demande
2. **Analyse** de la faisabilité
3. **Décision** : Accepter ou rejeter
4. **Notes administratives** (obligatoire)
5. **Notification** automatique au demandeur
6. **Application** des modifications si acceptée

###### **5. Enseignants**
**Fonctionnalités :**
- **Gestion des enseignants** : Vue d'ensemble
- **Import de données** : CSV/Excel
- **Gestion des statuts** : Actif/Inactif, Disponible/Indisponible
- **Recherche et filtrage** avancés
- **Modification** des informations

**Import d'Enseignants :**
1. **Préparation** du fichier CSV
2. **Format requis** : Prénom, Nom, Email, Statut
3. **Upload** du fichier
4. **Validation** des données
5. **Import** en base
6. **Rapport** de résultats

###### **6. Outils**
**Fonctionnalités :**
- **Tests de base de données** : Vérification de l'intégrité
- **Tests d'email** : Validation des notifications
- **Configuration système** : Paramètres avancés
- **Maintenance** : Nettoyage des données
- **Sauvegarde** : Export des données

---

### **4. CANDIDATURE LIBRE** (`/candidature-libre`)

#### **🎯 Objectif**
Permettre aux enseignants de proposer des cours non répertoriés dans le système avec leur équipe complète.

#### **📋 Processus de Candidature**

##### **A. Informations du Soumissionnaire**
- **Nom complet** (obligatoire)
- **Email** institutionnel (obligatoire)
- **Téléphone** (optionnel)

##### **B. Informations du Cours**
- **Code du cours** (obligatoire)
- **Faculté** (obligatoire)
- **Nom du cours** en français (obligatoire)
- **Nom du cours** en anglais (optionnel)
- **Sous-catégorie** (optionnel)
- **Volume horaire** Vol1 et Vol2 (obligatoire)
- **Description du cours** (optionnel)
- **Prérequis** (optionnel)
- **Objectifs d'apprentissage** (optionnel)

##### **C. Équipe Pédagogique**
- **Coordonnateur** : Informations complètes
- **Cotitulaires** : Ajout dynamique
- **Répartition des heures** : Validation automatique
- **Justifications** : Motivation et expérience

##### **D. Soumission et Validation**
1. **Validation** des données
2. **Soumission** de la candidature
3. **Email de confirmation**
4. **Traitement administratif**

---

### **5. DEMANDES DE MODIFICATION** (`/demandes-modification`)

#### **🎯 Objectif**
Système de tickets pour demander des modifications sur des cours existants.

#### **📋 Types de Demandes**

##### **A. Types Disponibles**
- **Attribution** : Modification de l'équipe pédagogique
- **Contenu** : Changement du contenu du cours
- **Horaires** : Modification des volumes horaires
- **Autre** : Demandes diverses

##### **B. Processus de Demande**
1. **Sélection du cours** (si applicable)
2. **Type de modification** à préciser
3. **Description détaillée** de la demande
4. **Justifications** et motivations
5. **Soumission** de la demande
6. **Numéro de ticket** généré automatiquement

##### **C. Suivi des Demandes**
- **Statut en temps réel** : En attente, Approuvée, Rejetée
- **Historique** des échanges
- **Notifications** par email
- **Réponses administratives**

---

## 🔧 **FONCTIONNALITÉS TECHNIQUES AVANCÉES**

### **1. Système d'Auto-sauvegarde**
- **Sauvegarde automatique** toutes les 2 secondes
- **Stockage local** dans le navigateur
- **Récupération automatique** au rechargement
- **Prévention** de la perte de données

### **2. Mode Hors Ligne**
- **Détection automatique** de la connectivité
- **Indicateurs visuels** (WiFi/WiFi-off)
- **Fonctionnement hors ligne** des formulaires
- **Synchronisation** au retour en ligne

### **3. Recherche Intelligente**
- **Auto-complétion** en temps réel
- **Recherche floue** pour les correspondances partielles
- **Catégorisation** par type d'enseignant
- **Valeurs personnalisées** pour nouveaux enseignants

### **4. Validation Automatique**
- **Contrôle des volumes** horaires
- **Validation des coefficients**
- **Détection des incohérences**
- **Alertes en temps réel**

### **5. Système de Notifications**
- **Toasts** pour les actions utilisateur
- **Emails automatiques** pour les confirmations
- **Notifications de statut** pour les propositions
- **Alertes administratives**

---

## 🗄️ **SYSTÈME DE DONNÉES**

### **1. Structure des Cours**
```typescript
interface Course {
  id: number;
  title: string;
  code: string;
  faculty: string;
  subcategory: string;
  academic_year: string;
  volume_total_vol1: number;
  volume_total_vol2: number;
  coefficient_vol1: number;
  coefficient_vol2: number;
  vacant: boolean;
  vacant_status: string;
  remarks: string;
  assignments: CourseAssignment[];
}
```

### **2. Structure des Attributions**
```typescript
interface CourseAssignment {
  id: number;
  course_id: number;
  teacher_id: number;
  vol1_hours: number;
  vol2_hours: number;
  is_coordinator: boolean;
  validated_by_coord: boolean;
  teacher: Teacher;
}
```

### **3. Structure des Propositions**
```typescript
interface AssignmentProposal {
  id: string;
  course_id: number;
  submitter_name: string;
  submitter_email: string;
  proposal_data: ProposalData;
  status: 'pending' | 'approved' | 'rejected';
  submission_date: string;
  validated_at: string;
  validated_by: string;
  admin_notes: string;
}
```

---

## 🔄 **WORKFLOWS COMPLETS**

### **1. Workflow de Proposition d'Équipe**
```
1. Consultation des cours vacants
   ↓
2. Sélection d'un cours
   ↓
3. Remplissage du formulaire
   ↓
4. Validation des données
   ↓
5. Soumission de la proposition
   ↓
6. Email de confirmation
   ↓
7. Traitement administratif
   ↓
8. Notification du résultat
```

### **2. Workflow de Validation Administrative**
```
1. Réception de la proposition
   ↓
2. Consultation des détails
   ↓
3. Vérification des volumes
   ↓
4. Analyse de l'équipe
   ↓
5. Décision (Approuver/Rejeter)
   ↓
6. Notes administratives
   ↓
7. Notification au proposant
   ↓
8. Application des changements (si approuvé)
```

### **3. Workflow de Demande de Modification**
```
1. Soumission de la demande
   ↓
2. Génération du numéro de ticket
   ↓
3. Email de confirmation
   ↓
4. Traitement administratif
   ↓
5. Analyse de la faisabilité
   ↓
6. Décision (Accepter/Rejeter)
   ↓
7. Réponse au demandeur
   ↓
8. Application des modifications (si acceptée)
```

---

## 🎨 **INTERFACE UTILISATEUR**

### **1. Design System**
- **Cohérence visuelle** : shadcn/ui + Tailwind CSS
- **Responsive design** : Mobile-first approach
- **Accessibilité** : WCAG 2.1 AA compliant
- **Animations fluides** : Transitions et micro-interactions

### **2. Composants Réutilisables**
- **Cartes de cours** : Affichage uniforme
- **Formulaires** : Validation et auto-sauvegarde
- **Tableaux** : Tri et filtrage
- **Modales** : Dialogs et confirmations
- **Navigation** : Breadcrumbs et menus

### **3. États Visuels**
- **Loading states** : Indicateurs de chargement
- **Error states** : Messages d'erreur clairs
- **Success states** : Confirmations visuelles
- **Empty states** : États vides informatifs

---

## 🔒 **SÉCURITÉ ET PERFORMANCE**

### **1. Sécurité**
- **Authentification** : Mot de passe sécurisé
- **Session management** : Timeout automatique
- **Validation des données** : Côté client et serveur
- **Protection CSRF** : Tokens de sécurité

### **2. Performance**
- **Lazy loading** : Chargement à la demande
- **Caching** : TanStack Query pour les données
- **Optimisation** : Images et assets
- **Monitoring** : Performance en temps réel

### **3. Fiabilité**
- **Error boundaries** : Gestion des erreurs
- **Retry logic** : Tentatives automatiques
- **Offline support** : Fonctionnement hors ligne
- **Data persistence** : Sauvegarde automatique

---

## 📈 **MÉTRIQUES ET ANALYTICS**

### **1. Métriques Utilisateur**
- **Temps de session** : Durée moyenne
- **Taux de conversion** : Propositions soumises
- **Taux d'abandon** : Formulaires incomplets
- **Satisfaction** : Feedback utilisateur

### **2. Métriques Système**
- **Performance** : Temps de réponse
- **Disponibilité** : Uptime du système
- **Erreurs** : Taux d'erreur
- **Utilisation** : Charge du système

### **3. Métriques Métier**
- **Cours traités** : Nombre par période
- **Propositions validées** : Taux d'approbation
- **Temps de traitement** : Durée moyenne
- **Satisfaction administrative** : Feedback

---

## 🚀 **FONCTIONNALITÉS FUTURES**

### **1. Évolution Annuelle**
- **Migration automatique** des cours d'une année à l'autre
- **Historique complet** des attributions
- **Correspondance intelligente** des cours
- **Workflow de réinitialisation** annuelle

### **2. Analytics Avancés**
- **Graphiques interactifs** : Visualisation des données
- **Tendances temporelles** : Évolution dans le temps
- **Prédictions** : Modèles prédictifs
- **Rapports automatisés** : Génération automatique

### **3. Intégrations**
- **Systèmes externes** : Intégration avec d'autres outils
- **API REST** : Interface programmatique
- **Webhooks** : Notifications en temps réel
- **SSO** : Authentification unique

---

## 🛠️ **SUPPORT ET MAINTENANCE**

### **1. Documentation**
- **Guides utilisateur** : Instructions détaillées
- **Documentation technique** : Architecture et code
- **FAQ** : Questions fréquentes
- **Tutoriels vidéo** : Aide visuelle

### **2. Maintenance**
- **Mises à jour** : Nouvelles fonctionnalités
- **Corrections de bugs** : Résolution des problèmes
- **Optimisations** : Amélioration des performances
- **Sécurité** : Correctifs de sécurité

### **3. Support**
- **Email de support** : Contact direct
- **Chat en ligne** : Support en temps réel
- **Base de connaissances** : Articles d'aide
- **Formation** : Sessions de formation

---

## 📝 **CONCLUSION**

Ce document fournit une vue d'ensemble complète et détaillée de l'application ATTRIB, de ses fonctionnalités et de son fonctionnement. Il peut être utilisé comme référence pour comprendre le processus métier et l'architecture technique du système.

### **Points Clés**
- ✅ **Interface intuitive** pour les utilisateurs finaux
- ✅ **Gestion centralisée** pour les administrateurs
- ✅ **Workflows automatisés** pour l'efficacité
- ✅ **Sécurité et fiabilité** pour la production
- ✅ **Évolutivité** pour les futures fonctionnalités

### **Utilisation du Document**
- **Formation** : Guide pour les nouveaux utilisateurs
- **Référence** : Documentation technique complète
- **Support** : Aide pour la résolution de problèmes
- **Évolution** : Base pour les nouvelles fonctionnalités

---

*Document généré le : ${new Date().toLocaleDateString('fr-FR')}*
*Version de l'application : 1.0.0*
*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}* 