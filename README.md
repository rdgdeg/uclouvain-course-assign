# ATTRIB - Gestion des Cours Vacants UCLouvain

## 🎯 Description

Application de gestion des cours vacants pour l'UCLouvain, permettant aux enseignants de soumettre des candidatures et aux administrateurs de gérer les attributions de cours.

**🔄 Dernière mise à jour :** Version corrigée avec toutes les optimisations Vercel

## 🚀 Déploiement

### Déploiement sur Vercel (Recommandé)

1. **Installer Vercel CLI :**
```bash
npm install -g vercel
```

2. **Se connecter à Vercel :**
```bash
vercel login
```

3. **Déployer :**
```bash
vercel --prod
```

4. **Configurer les variables d'environnement :**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_RESEND_API_KEY
```

### Déploiement local

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour production
npm run build

# Prévisualiser le build
npm run preview
```

## 🛠️ Technologies

- **Frontend :** React 18 + TypeScript + Vite
- **UI :** shadcn/ui + Tailwind CSS + Radix UI
- **Backend :** Supabase (base de données + authentification)
- **Email :** Resend
- **État :** TanStack Query
- **Routing :** React Router DOM

## 📁 Structure du projet

```
src/
├── components/          # Composants React
│   ├── admin/          # Interface d'administration
│   └── ui/             # Composants UI réutilisables
├── hooks/              # Hooks personnalisés
├── pages/              # Pages de l'application
├── types/              # Types TypeScript
├── utils/              # Utilitaires
└── integrations/       # Intégrations externes
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
VITE_RESEND_API_KEY=votre_clé_resend
```

## 📝 Fonctionnalités

- ✅ Gestion des cours vacants
- ✅ Interface d'administration
- ✅ Système de candidatures
- ✅ Validation des volumes horaires
- ✅ Notifications par email
- ✅ Filtres et recherche avancés
- ✅ Responsive design

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
