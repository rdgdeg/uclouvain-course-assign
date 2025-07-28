# Guide Utilisateur - Portail de Gestion des Cours UCLouvain

## Table des Matières
1. [Accès à l'Application](#accès-à-lapplication)
2. [Interface Publique](#interface-publique)
3. [Interface d'Administration](#interface-dadministration)
4. [Fonctionnalités Détaillées](#fonctionnalités-détaillées)
5. [FAQ](#faq)

## Accès à l'Application

### URL d'Accès
- **Interface Publique** : `https://votre-domaine.com/`
- **Interface Admin** : `https://votre-domaine.com/admin-courses`
- **Administration Générale** : `https://votre-domaine.com/admin`

### Authentification
- **Interface Publique** : Aucune authentification requise
- **Interface Admin** : Mot de passe : `admin2025`

## Interface Publique

### Consultation des Cours Vacants

#### 1. Navigation Principale
- **Page d'accueil** : Vue d'ensemble des cours vacants
- **Filtres** : Faculté, sous-catégorie, recherche textuelle
- **Vue** : Mode carte ou liste

#### 2. Filtrage des Cours
```
Facultés disponibles :
- FSM (École de Santé Publique)
  - EDPH (Éducation Physique)
  - KINE (Kinésithérapie)
- FSP (Faculté de Psychologie)
- FASB (Faculté des Sciences Biologiques)
  - FARM (Pharmacie)
  - SBIM (Sciences Biomédicales)
- MEDE (Faculté de Médecine)
  - MED (Médecine)
  - MDEN (Médecine Dentaire)
```

#### 3. Affichage des Cours
**Mode Carte** :
- Titre du cours
- Code du cours
- Faculté et sous-catégorie
- Volume horaire (Vol1/Vol2)
- Statut (Vacant/Attribué)
- Boutons d'action

**Mode Liste** :
- Informations compactes
- Tri par colonnes
- Actions rapides

### Proposition d'Équipe

#### 1. Sélection d'un Cours
1. Cliquez sur "Proposer une équipe" sur un cours vacant
2. Vérifiez les détails du cours
3. Confirmez votre sélection

#### 2. Remplissage du Formulaire
**Informations Personnelles** :
- Nom complet
- Adresse email
- Téléphone (optionnel)

**Composition de l'Équipe** :
- Ajoutez les membres de l'équipe
- Prénom, nom, email pour chaque membre
- Rôle dans l'équipe (coordonnateur, membre)

**Répartition des Heures** :
- Volume 1 (cours théoriques)
- Volume 2 (travaux pratiques)
- Validation automatique des totaux

#### 3. Soumission
1. Vérifiez toutes les informations
2. Cliquez sur "Soumettre la proposition"
3. Confirmation par email (si configuré)

### Demande de Modification

#### 1. Accès au Formulaire
- Lien "Demande de modification" dans le header
- Ou depuis la page d'un cours spécifique

#### 2. Types de Demandes
- **Modification d'horaires** : Changement de planning
- **Modification d'équipe** : Ajout/suppression de membres
- **Modification de contenu** : Changement de programme
- **Autre** : Demande spécifique

#### 3. Suivi des Demandes
- Numéro de ticket généré
- Statut : En attente, En cours, Traitée, Rejetée
- Notifications par email

## Interface d'Administration

### Accès et Authentification

#### 1. Connexion
1. Accédez à `/admin-courses` ou `/admin`
2. Entrez le mot de passe : `admin2025`
3. Cliquez sur "Se connecter"

#### 2. Navigation
- **Retour public** : Retour à l'interface publique
- **Administration générale** : Accès au tableau de bord complet
- **Déconnexion** : Fermeture de session

### Gestion des Cours (`/admin-courses`)

#### 1. Vue d'Ensemble
**Statistiques** :
- Nombre de cours vacants
- Nombre de cours attribués
- Nombre de cours en attente

**Filtres Avancés** :
- Statut : Vacant, Attribué, En attente
- Faculté et sous-catégorie
- Recherche textuelle (titre, code, enseignant)

#### 2. Actions sur les Cours
**Pour un Cours Vacant** :
- Voir les propositions reçues
- Attribuer manuellement
- Modifier les informations

**Pour un Cours Attribué** :
- Voir l'équipe assignée
- Valider la répartition des heures
- Modifier l'attribution

#### 3. Validation des Attributions
1. Sélectionnez un cours attribué
2. Vérifiez la répartition des heures
3. Validez ou demandez des modifications
4. Notifiez l'équipe

### Administration Générale (`/admin`)

#### 1. Tableau de Bord
**Vue d'Ensemble** :
- Statistiques par faculté
- Graphiques de répartition
- Alertes et notifications

**Navigation par Onglets** :
- Vue d'ensemble
- Gestion des cours
- Gestion des enseignants
- Propositions
- Demandes de modification

#### 2. Gestion des Enseignants
**Import de Données** :
1. Préparez un fichier CSV
2. Format : Prénom, Nom, Email, Statut
3. Uploadez le fichier
4. Vérifiez les résultats

**Gestion des Statuts** :
- Actif/Inactif
- Disponible/Indisponible
- Statuts personnalisés

#### 3. Gestion des Propositions
**Validation des Propositions** :
1. Consultez la liste des propositions
2. Vérifiez les détails
3. Acceptez ou rejetez
4. Ajoutez des notes administratives

**Notifications** :
- Email automatique aux proposants
- Historique des décisions

#### 4. Gestion des Demandes
**Traitement des Demandes** :
1. Consultez les demandes en attente
2. Analysez le contenu
3. Traitez la demande
4. Mettez à jour le statut
5. Répondez au demandeur

#### 5. Export de Données
**Rapports Disponibles** :
- Liste complète des cours
- Attributions par faculté
- Statistiques d'utilisation
- Format CSV

## Fonctionnalités Détaillées

### Système de Filtrage

#### Filtres Combinables
- **Recherche textuelle** : Titre, code, nom d'enseignant
- **Faculté** : FSM, FSP, FASB, MEDE
- **Sous-catégorie** : Selon la faculté sélectionnée
- **Statut** : Vacant, Attribué, En attente
- **Validation** : Validé, En attente de validation

#### Sauvegarde des Filtres
- Les filtres sont conservés lors de la navigation
- Possibilité de réinitialiser tous les filtres

### Système de Validation

#### Validation des Heures
- **Volume 1** : Cours théoriques
- **Volume 2** : Travaux pratiques
- **Total** : Doit correspondre au volume du cours
- **Validation automatique** : Vérification en temps réel

#### Workflow de Validation
1. **Soumission** : Proposition soumise
2. **Vérification** : Contrôle administratif
3. **Validation** : Acceptation ou rejet
4. **Notification** : Information aux parties prenantes

### Notifications et Alertes

#### Types de Notifications
- **Toast** : Notifications temporaires
- **Alertes** : Messages d'erreur ou de succès
- **Badges** : Indicateurs de statut

#### Gestion des Erreurs
- Messages d'erreur explicites
- Suggestions de résolution
- Logs d'erreur pour le support

## FAQ

### Questions Générales

**Q : Comment puis-je proposer une équipe pour un cours ?**
R : Consultez les cours vacants, sélectionnez un cours et cliquez sur "Proposer une équipe". Remplissez le formulaire avec les informations de votre équipe.

**Q : Puis-je modifier ma proposition après l'avoir soumise ?**
R : Non, une fois soumise, la proposition ne peut plus être modifiée. Contactez l'administrateur pour toute modification.

**Q : Comment savoir si ma proposition a été acceptée ?**
R : Vous recevrez une notification par email. Vous pouvez également consulter le statut dans l'interface publique.

### Questions Administratives

**Q : Comment importer la liste des enseignants ?**
R : Dans l'interface admin, allez dans "Gestion des enseignants" et utilisez la fonction d'import CSV.

**Q : Comment valider une attribution ?**
R : Consultez les attributions, vérifiez la répartition des heures et cliquez sur "Valider".

**Q : Comment exporter les données ?**
R : Dans l'interface admin, utilisez le bouton "Exporter" pour générer un rapport CSV.

### Problèmes Techniques

**Q : L'application ne se charge pas**
R : Vérifiez votre connexion internet et rafraîchissez la page. Si le problème persiste, contactez le support.

**Q : Je ne peux pas me connecter à l'interface admin**
R : Vérifiez que vous utilisez le bon mot de passe : `admin2025`.

**Q : Les filtres ne fonctionnent pas**
R : Essayez de réinitialiser les filtres avec le bouton "Effacer les filtres".

---

*Guide utilisateur v1.0 - UCLouvain* 