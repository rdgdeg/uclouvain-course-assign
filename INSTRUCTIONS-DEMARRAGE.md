# 🎯 Instructions de démarrage - uclouvain-course-assign

## ✅ Projet cloné avec succès !

Le projet est maintenant disponible dans :  
**`c:\Users\rdegand\Documents\DEV\uclouvain-course-assign`**

## 📋 Étapes pour démarrer

### 1. Installer Node.js (si pas déjà installé)

1. Téléchargez Node.js depuis : https://nodejs.org/
2. Choisissez la version **LTS** (Long Term Support)
3. Installez avec les options par défaut
4. Redémarrez votre terminal/PowerShell
5. Vérifiez l'installation :
   ```bash
   node --version
   npm --version
   ```

### 2. Installer les dépendances du projet

```bash
cd "c:\Users\rdegand\Documents\DEV\uclouvain-course-assign"
npm install
```

Cette commande installera toutes les dépendances listées dans `package.json` (React, Vite, Supabase, shadcn/ui, etc.)

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
VITE_SUPABASE_URL=https://dhuuduphwvxrecfqvbbw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk
VITE_RESEND_API_KEY=votre_clé_resend_ici
VITE_APP_NAME=ATTRIB UCLouvain
VITE_APP_VERSION=1.0.0
```

### 4. Lancer l'application en développement

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

## 🏗️ Structure du projet

```
uclouvain-course-assign/
├── src/
│   ├── components/
│   │   ├── admin/              # 40+ composants d'administration
│   │   │   ├── AttributionImportDialog.tsx    # Import Excel
│   │   │   ├── CourseEditDialog.tsx            # Édition cours
│   │   │   ├── CourseVacancyManager.tsx       # Gestion cours vacants
│   │   │   └── ... (autres composants)
│   │   └── ui/                 # Composants shadcn/ui
│   ├── pages/                  # Pages principales
│   ├── hooks/                  # Hooks personnalisés
│   ├── types/                  # Types TypeScript
│   ├── utils/                  # Utilitaires
│   └── integrations/           # Supabase client
├── supabase/
│   └── migrations/            # Migrations SQL
└── public/                     # Assets statiques
```

## 🎯 Fonctionnalités à intégrer depuis SSS-ATTRIBUTIONS

### 1. Mapping des colonnes Excel
**Fichier cible :** `src/components/admin/AttributionImportDialog.tsx`

**Fonctionnalités à ajouter :**
- Interface de mapping des colonnes
- Détection automatique avec ajustement manuel
- Sauvegarde du mapping pour réutilisation

### 2. Validation des volumes
**Fichier existant :** `src/components/VolumeValidation.tsx`

**Améliorations à apporter :**
- Alertes visuelles pour les écarts
- Validation automatique lors de l'import
- Affichage dans les détails du cours

### 3. Historique des modifications
**Nouveau composant à créer :** `src/components/admin/CourseHistoryPanel.tsx`

**Fonctionnalités :**
- Affichage de l'historique des modifications
- Intégration dans `CourseEditDialog.tsx`
- Table `cours_vacants_history` (déjà créée dans SSS-ATTRIBUTIONS)

### 4. Gestion "Non Attr."
**Fichier cible :** `src/components/admin/AttributionImportDialog.tsx`

**Modifications :**
- Détecter "Non Attr." dans les colonnes Nom/Prénom
- Traiter comme attribution vacante
- Enregistrer dans la table appropriée

## 📝 Commandes utiles

```bash
# Développement (avec hot-reload)
npm run dev

# Build pour production
npm run build

# Prévisualiser le build
npm run preview

# Linter (vérifier le code)
npm run lint

# Déployer sur Vercel
npm run deploy:vercel
```

## 🔗 Liens importants

- **Repository GitHub :** https://github.com/rdgdeg/uclouvain-course-assign
- **Application déployée :** https://uclouvain-course-assign.vercel.app
- **Documentation Vite :** https://vitejs.dev/
- **Documentation shadcn/ui :** https://ui.shadcn.com/

## 🚀 Prochaines étapes

1. ✅ Projet cloné
2. ⏳ Installer Node.js
3. ⏳ Installer les dépendances (`npm install`)
4. ⏳ Configurer `.env.local`
5. ⏳ Lancer l'application (`npm run dev`)
6. ⏳ Intégrer les fonctionnalités de SSS-ATTRIBUTIONS

## 💡 Astuces

- Le projet utilise **TypeScript strict** - les erreurs de type seront affichées
- Les composants shadcn/ui sont dans `src/components/ui/`
- Les hooks personnalisés sont dans `src/hooks/`
- Les types sont centralisés dans `src/types/index.ts`
- Vite utilise le hot-reload automatique - les changements sont visibles immédiatement

## 📚 Documentation disponible

Le projet contient de nombreux guides :
- `GUIDE_TECHNIQUE.md` - Documentation technique
- `GUIDE_UTILISATEUR.md` - Guide utilisateur
- `LOCAL-DEPLOYMENT.md` - Déploiement local
- `DOCUMENTATION.md` - Documentation générale
