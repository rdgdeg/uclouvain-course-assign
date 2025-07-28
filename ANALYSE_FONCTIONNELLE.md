# Analyse Fonctionnelle - Portail de Gestion des Cours UCLouvain

## Table des Matières
1. [Contexte et Objectifs](#contexte-et-objectifs)
2. [Acteurs et Rôles](#acteurs-et-rôles)
3. [Processus Métier](#processus-métier)
4. [Fonctionnalités Détaillées](#fonctionnalités-détaillées)
5. [Règles Métier](#règles-métier)
6. [Exigences Non Fonctionnelles](#exigences-non-fonctionnelles)
7. [Risques et Contraintes](#risques-et-contraintes)

## Contexte et Objectifs

### Contexte
L'UCLouvain gère chaque année l'attribution de centaines de cours vacants aux enseignants. Ce processus manuel est chronophage et sujet à des erreurs. Le portail vise à digitaliser et optimiser ce processus.

### Objectifs
- **Automatiser** le processus d'attribution des cours
- **Faciliter** la proposition d'équipes par les enseignants
- **Améliorer** la traçabilité des décisions
- **Réduire** le temps de traitement administratif
- **Assurer** la cohérence des attributions

### Périmètre
- Gestion des cours vacants
- Propositions d'équipes
- Validation administrative
- Suivi des attributions
- Demandes de modification

## Acteurs et Rôles

### 1. Utilisateur Public (Enseignant)
**Profil** : Enseignant souhaitant proposer une équipe pour un cours vacant

**Responsabilités** :
- Consulter les cours vacants
- Proposer une équipe
- Suivre le statut de sa proposition
- Soumettre des demandes de modification

**Permissions** :
- Lecture des cours vacants
- Création de propositions
- Création de demandes de modification

### 2. Administrateur des Cours
**Profil** : Personnel administratif responsable de la gestion des cours

**Responsabilités** :
- Valider les propositions d'équipes
- Gérer les attributions
- Contrôler la répartition des heures
- Traiter les demandes de modification

**Permissions** :
- Lecture/écriture sur tous les cours
- Validation des propositions
- Gestion des attributions
- Traitement des demandes

### 3. Administrateur Général
**Profil** : Responsable administratif avec accès complet

**Responsabilités** :
- Gestion des enseignants
- Import de données
- Génération de rapports
- Configuration du système

**Permissions** :
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs
- Export de données
- Configuration système

### 4. Coordonnateur (Futur)
**Profil** : Responsable de faculté ou de programme

**Responsabilités** :
- Validation des attributions de sa faculté
- Contrôle de la cohérence pédagogique
- Approbation finale des attributions

**Permissions** :
- Validation des attributions de sa faculté
- Consultation des rapports de sa faculté

## Processus Métier

### 1. Processus de Proposition d'Équipe

#### Étape 1 : Consultation des Cours Vacants
1. L'enseignant accède à l'interface publique
2. Il consulte la liste des cours vacants
3. Il utilise les filtres pour trouver des cours pertinents
4. Il examine les détails d'un cours (volume horaire, faculté, etc.)

#### Étape 2 : Sélection et Proposition
1. L'enseignant sélectionne un cours vacant
2. Il clique sur "Proposer une équipe"
3. Il remplit le formulaire de proposition :
   - Informations personnelles
   - Composition de l'équipe
   - Répartition des heures
4. Il soumet la proposition

#### Étape 3 : Traitement Administratif
1. L'administrateur reçoit la proposition
2. Il vérifie la cohérence des informations
3. Il valide ou rejette la proposition
4. Il notifie l'enseignant du résultat

#### Étape 4 : Attribution Finale
1. Si validée, le cours devient "attribué"
2. L'équipe est officiellement assignée
3. Le cours disparaît de la liste des vacants

### 2. Processus de Validation des Attributions

#### Étape 1 : Contrôle Administratif
1. L'administrateur consulte les attributions
2. Il vérifie la répartition des heures (Vol1/Vol2)
3. Il contrôle la cohérence avec les règles métier
4. Il identifie les problèmes potentiels

#### Étape 2 : Validation ou Correction
1. Si l'attribution est correcte, il la valide
2. Si des corrections sont nécessaires, il demande des modifications
3. Il notifie l'équipe des changements requis
4. Il suit le processus de correction

#### Étape 3 : Validation Finale
1. L'attribution est validée par le coordonnateur (futur)
2. Le statut devient "Validé"
3. L'attribution est officialisée

### 3. Processus de Gestion des Demandes

#### Étape 1 : Soumission de Demande
1. L'utilisateur soumet une demande de modification
2. Il spécifie le type de demande
3. Il fournit les détails et justifications
4. Un numéro de ticket est généré

#### Étape 2 : Traitement
1. L'administrateur consulte la demande
2. Il analyse la faisabilité
3. Il prend une décision (accepter/rejeter)
4. Il ajoute des notes administratives

#### Étape 3 : Notification
1. L'utilisateur est notifié du résultat
2. Si acceptée, les modifications sont appliquées
3. Le statut de la demande est mis à jour

## Fonctionnalités Détaillées

### 1. Interface Publique

#### Consultation des Cours
- **Affichage** : Mode carte ou liste
- **Filtrage** : Faculté, sous-catégorie, recherche textuelle
- **Tri** : Par titre, code, faculté
- **Pagination** : Navigation dans les résultats

#### Proposition d'Équipe
- **Formulaire dynamique** : Ajout/suppression de membres
- **Validation en temps réel** : Contrôle des heures
- **Sauvegarde automatique** : Brouillon en cours de saisie
- **Confirmation** : Résumé avant soumission

#### Suivi des Propositions
- **Statut en temps réel** : En attente, Validée, Rejetée
- **Historique** : Toutes les propositions soumises
- **Notifications** : Email de confirmation et de statut

### 2. Interface d'Administration

#### Tableau de Bord
- **Statistiques** : Cours vacants, attribués, en attente
- **Graphiques** : Répartition par faculté
- **Alertes** : Propositions en attente, problèmes détectés
- **Actions rapides** : Liens vers les tâches prioritaires

#### Gestion des Cours
- **Vue d'ensemble** : Tous les cours avec statuts
- **Filtres avancés** : Multi-critères
- **Actions en lot** : Validation multiple
- **Modification** : Édition des informations de cours

#### Validation des Attributions
- **Contrôle automatique** : Vérification des heures
- **Validation manuelle** : Approbation par l'administrateur
- **Historique** : Traçabilité des décisions
- **Notifications** : Information aux équipes

### 3. Gestion des Données

#### Import/Export
- **Format CSV** : Compatible avec Excel
- **Validation** : Contrôle des données importées
- **Rapports** : Export des statistiques
- **Sauvegarde** : Sauvegarde automatique des données

#### Gestion des Enseignants
- **Base de données** : Informations complètes
- **Statuts** : Actif, Inactif, Disponible
- **Historique** : Évolution des statuts
- **Import en lot** : Mise à jour massive

## Règles Métier

### 1. Règles de Validation des Propositions

#### Règle 1 : Répartition des Heures
```
Pour chaque cours :
- Volume total = Volume1 + Volume2
- Volume1 ≥ 0 (cours théoriques)
- Volume2 ≥ 0 (travaux pratiques)
- Le total doit correspondre au volume du cours
```

#### Règle 2 : Composition de l'Équipe
```
- Minimum 1 membre par équipe
- Maximum 5 membres par équipe
- 1 seul coordonnateur par équipe
- Chaque membre doit avoir un email valide
```

#### Règle 3 : Attribution des Cours
```
- Un cours ne peut être attribué qu'à une seule équipe
- Une fois attribué, le cours devient indisponible
- Les propositions en attente sont masquées
- Un cours ne peut pas être modifié s'il est attribué
```

### 2. Règles de Validation Administrative

#### Règle 4 : Contrôle des Heures
```
- La somme des heures Vol1 doit correspondre au total Vol1 du cours
- La somme des heures Vol2 doit correspondre au total Vol2 du cours
- Aucun membre ne peut avoir 0 heure dans les deux volumes
- Le coordonnateur doit avoir au moins 1 heure dans chaque volume
```

#### Règle 5 : Validation des Statuts
```
- Proposition : En attente → Validée/Rejetée
- Attribution : En cours → Validée
- Cours : Vacant → Attribué → Validé
- Demande : Soumise → En cours → Traitée
```

### 3. Règles de Sécurité

#### Règle 6 : Accès aux Données
```
- Interface publique : Lecture seule des cours vacants
- Interface admin : Lecture/écriture complète
- Authentification requise pour l'administration
- Session persistante pour éviter les reconnexions
```

#### Règle 7 : Intégrité des Données
```
- Pas de suppression physique des données
- Historique complet des modifications
- Validation des données avant sauvegarde
- Sauvegarde automatique des brouillons
```

## Exigences Non Fonctionnelles

### 1. Performance

#### Temps de Réponse
- **Interface publique** : < 2 secondes
- **Interface admin** : < 3 secondes
- **Recherche** : < 1 seconde
- **Export** : < 30 secondes

#### Charge
- **Utilisateurs simultanés** : 100+
- **Cours gérés** : 1000+
- **Propositions/jour** : 50+

### 2. Disponibilité

#### Uptime
- **Disponibilité** : 99.5%
- **Maintenance** : Planifiée en dehors des heures de pointe
- **Sauvegarde** : Quotidienne

#### Récupération
- **RTO** (Recovery Time Objective) : 4 heures
- **RPO** (Recovery Point Objective) : 24 heures

### 3. Sécurité

#### Authentification
- **Mot de passe** : Complexité minimale requise
- **Session** : Expiration après inactivité
- **Logs** : Traçabilité des actions

#### Données
- **Chiffrement** : En transit et au repos
- **Accès** : Contrôle d'accès basé sur les rôles
- **Audit** : Journal des modifications

### 4. Utilisabilité

#### Interface
- **Responsive** : Compatible mobile/tablette
- **Accessibilité** : Conformité WCAG 2.1
- **Navigation** : Intuitive et cohérente

#### Formation
- **Documentation** : Guide utilisateur complet
- **Aide contextuelle** : Tooltips et messages d'aide
- **Support** : Contact et FAQ

## Risques et Contraintes

### 1. Risques Techniques

#### Risque 1 : Perte de Données
- **Probabilité** : Faible
- **Impact** : Élevé
- **Mitigation** : Sauvegarde automatique, tests de restauration

#### Risque 2 : Performance Dégradée
- **Probabilité** : Moyenne
- **Impact** : Moyen
- **Mitigation** : Monitoring, optimisation des requêtes

#### Risque 3 : Problèmes de Sécurité
- **Probabilité** : Faible
- **Impact** : Élevé
- **Mitigation** : Tests de sécurité, mises à jour régulières

### 2. Risques Métier

#### Risque 4 : Résistance au Changement
- **Probabilité** : Moyenne
- **Impact** : Moyen
- **Mitigation** : Formation, accompagnement, communication

#### Risque 5 : Erreurs de Saisie
- **Probabilité** : Élevée
- **Impact** : Faible
- **Mitigation** : Validation en temps réel, confirmation

### 3. Contraintes

#### Contraintes Techniques
- **Compatibilité** : Navigateurs modernes uniquement
- **Infrastructure** : Dépendance à Supabase
- **Intégration** : Pas d'intégration avec les systèmes existants

#### Contraintes Organisationnelles
- **Budget** : Limitation des coûts d'infrastructure
- **Temps** : Déploiement avant la rentrée académique
- **Ressources** : Formation du personnel nécessaire

---

*Analyse fonctionnelle v1.0 - UCLouvain* 