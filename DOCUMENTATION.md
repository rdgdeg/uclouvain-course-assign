# Documentation du Portail de Gestion des Cours - UCLouvain

## Vue d'ensemble

Le **Portail de Gestion des Cours** est une application web moderne développée pour l'UCLouvain afin de gérer l'attribution des cours vacants aux enseignants. Cette solution permet aux enseignants de proposer des équipes pour les cours vacants et aux administrateurs de gérer efficacement ces attributions.

## Architecture Technique

### Stack Technologique
- **Frontend** : React 18 + TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS + shadcn/ui
- **Base de données** : Supabase (PostgreSQL)
- **Gestion d'état** : TanStack Query (React Query)
- **Routing** : React Router DOM
- **Validation** : Zod + React Hook Form
- **Notifications** : Sonner + Toast

### Structure du Projet
```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base (shadcn/ui)
│   └── admin/          # Composants spécifiques à l'administration
├── pages/              # Pages principales de l'application
├── hooks/              # Hooks personnalisés
├── integrations/       # Intégrations externes (Supabase)
└── lib/                # Utilitaires et configurations
```

## Fonctionnalités Principales

### 1. Interface Publique (`/`)
- **Consultation des cours vacants** : Affichage en mode carte ou liste
- **Filtrage avancé** : Par faculté, sous-catégorie, recherche textuelle
- **Propositions d'équipes** : Formulaire pour proposer une équipe pour un cours vacant
- **Demandes de modification** : Système de tickets pour demander des changements

### 2. Interface d'Administration des Cours (`/admin-courses`)
- **Gestion des cours** : Vue d'ensemble de tous les cours
- **Validation des attributions** : Contrôle des heures et validation par coordonnateur
- **Filtrage et recherche** : Outils avancés de filtrage
- **Statistiques** : Compteurs de cours vacants/attribués

### 3. Interface d'Administration Générale (`/admin`)
- **Tableau de bord** : Vue d'ensemble avec statistiques par faculté
- **Gestion des enseignants** : Import, statuts, affectations
- **Gestion des propositions** : Validation des propositions d'équipes
- **Gestion des demandes** : Traitement des demandes de modification
- **Export de données** : Génération de rapports CSV

## Modèle de Données

### Tables Principales
1. **courses** : Informations sur les cours
2. **teachers** : Données des enseignants
3. **course_assignments** : Attributions cours-enseignants
4. **assignment_proposals** : Propositions d'équipes
5. **modification_requests** : Demandes de modification
6. **teacher_statuses** : Statuts des enseignants
7. **admin_validations** : Validations administratives

### Relations Clés
- Un cours peut avoir plusieurs attributions (enseignants)
- Un enseignant peut être assigné à plusieurs cours
- Les propositions sont liées aux cours vacants
- Les demandes de modification sont liées aux cours

## Workflows Métier

### 1. Proposition d'Équipe
1. Enseignant consulte les cours vacants
2. Sélectionne un cours et remplit le formulaire de proposition
3. La proposition est soumise avec statut "pending"
4. L'administrateur valide ou rejette la proposition
5. Si validée, le cours devient "assigned"

### 2. Validation des Attributions
1. L'administrateur consulte les attributions
2. Vérifie la distribution des heures (vol1/vol2)
3. Valide ou demande des modifications
4. Le coordonnateur peut également valider

### 3. Gestion des Demandes
1. Utilisateur soumet une demande de modification
2. L'administrateur traite la demande
3. Met à jour le statut et ajoute des notes
4. Notifie l'utilisateur du résultat

## Sécurité et Authentification

### Niveaux d'Accès
- **Public** : Consultation des cours vacants, soumission de propositions
- **Administrateur** : Accès complet avec mot de passe simple
- **Coordonnateur** : Validation des attributions (à implémenter)

### Authentification
- Interface admin protégée par mot de passe
- Session persistante via localStorage
- Pas d'authentification complexe (simplification pour le prototype)

## Déploiement et Configuration

### Variables d'Environnement
- `VITE_SUPABASE_URL` : URL de l'instance Supabase
- `VITE_SUPABASE_ANON_KEY` : Clé anonyme Supabase

### Scripts Disponibles
- `npm run dev` : Serveur de développement
- `npm run build` : Build de production
- `npm run preview` : Prévisualisation du build
- `npm run lint` : Vérification du code

## Points d'Amélioration Identifiés

### Sécurité
- Implémenter une authentification robuste
- Ajouter des rôles et permissions granulaires
- Sécuriser les endpoints API

### Fonctionnalités
- Système de notifications en temps réel
- Workflow d'approbation multi-niveaux
- Intégration avec les systèmes existants de l'UCLouvain
- Génération automatique de rapports

### Performance
- Pagination des listes de cours
- Optimisation des requêtes Supabase
- Mise en cache des données fréquemment consultées

### UX/UI
- Interface mobile optimisée
- Thème sombre/clair
- Accessibilité améliorée
- Tutoriels interactifs

## Support et Maintenance

### Logs et Monitoring
- Logs d'erreur dans la console
- Monitoring des performances via Vite
- Traçabilité des actions utilisateur

### Sauvegarde
- Base de données Supabase avec sauvegarde automatique
- Versioning du code via Git
- Documentation des changements

---

*Documentation générée le : $(date)*
*Version du projet : 0.0.0* 