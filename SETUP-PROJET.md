# 🚀 Configuration du projet uclouvain-course-assign

## ✅ Projet cloné avec succès

Le projet a été cloné dans : `c:\Users\rdegand\Documents\DEV\uclouvain-course-assign`

## 📋 Structure du projet

```
uclouvain-course-assign/
├── src/
│   ├── components/          # Composants React
│   │   ├── admin/          # Interface d'administration (40+ composants)
│   │   └── ui/             # Composants UI shadcn/ui
│   ├── hooks/              # Hooks personnalisés
│   ├── pages/              # Pages de l'application
│   ├── types/              # Types TypeScript
│   ├── utils/              # Utilitaires
│   └── integrations/       # Intégrations Supabase
├── supabase/               # Migrations Supabase
├── public/                 # Assets statiques
└── scripts/                # Scripts de déploiement
```

## 🔧 Configuration requise

### 1. Installer Node.js

Si Node.js n'est pas installé :
- Téléchargez depuis : https://nodejs.org/
- Version recommandée : Node.js 18+ ou 20+
- Vérifiez l'installation : `node --version` et `npm --version`

### 2. Installer les dépendances

```bash
cd "c:\Users\rdegand\Documents\DEV\uclouvain-course-assign"
npm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
VITE_SUPABASE_URL=https://dhuuduphwvxrecfqvbbw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk
VITE_RESEND_API_KEY=votre_clé_resend
VITE_APP_NAME=ATTRIB UCLouvain
VITE_APP_VERSION=1.0.0
```

### 4. Lancer l'application en développement

```bash
npm run dev
```

L'application sera accessible sur : `http://localhost:5173` (port par défaut de Vite)

## 📦 Technologies utilisées

- **React 18** + **TypeScript**
- **Vite** - Build tool ultra-rapide
- **shadcn/ui** + **Tailwind CSS** - UI moderne
- **Supabase** - Backend (PostgreSQL + Auth)
- **TanStack Query** - Gestion d'état serveur
- **React Router DOM** - Routing
- **Resend** - Service d'email
- **XLSX** - Import Excel

## 🎯 Fonctionnalités existantes

D'après la structure du code :

1. **Interface d'administration complète**
   - Gestion des cours vacants
   - Gestion des attributions
   - Import Excel
   - Gestion des enseignants
   - Propositions de cours
   - Demandes de modification

2. **Composants UI avancés**
   - shadcn/ui intégré
   - Composants réutilisables
   - Design responsive

3. **Intégrations**
   - Supabase configuré
   - Resend pour les emails
   - Parsing CSV/Excel

## 🔄 Prochaines étapes

### Intégrer les fonctionnalités de SSS-ATTRIBUTIONS

1. **Mapping des colonnes Excel**
   - Créer un composant `ColumnMappingDialog.tsx`
   - Intégrer dans `AttributionImportDialog.tsx`

2. **Validation des volumes**
   - Améliorer `VolumeValidation.tsx`
   - Ajouter les alertes visuelles

3. **Historique des modifications**
   - Créer `CourseHistoryPanel.tsx`
   - Intégrer dans `CourseEditDialog.tsx`

4. **Gestion "Non Attr."**
   - Améliorer le parsing Excel
   - Traiter automatiquement les lignes "Non Attr."

## 📝 Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Prévisualiser le build
npm run preview

# Linter
npm run lint

# Déploiement Vercel
npm run deploy:vercel
```

## 🔗 Liens utiles

- **Repository GitHub :** https://github.com/rdgdeg/uclouvain-course-assign
- **Déploiement :** https://uclouvain-course-assign.vercel.app
- **Documentation Vite :** https://vitejs.dev/
- **Documentation shadcn/ui :** https://ui.shadcn.com/

## ⚠️ Notes importantes

- Le projet utilise **TypeScript strict**
- Les composants sont organisés par fonctionnalité
- Les hooks personnalisés sont dans `src/hooks/`
- Les types sont centralisés dans `src/types/`
- Les migrations Supabase sont dans `supabase/migrations/`
