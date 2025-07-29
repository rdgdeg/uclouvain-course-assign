# 🚀 Déploiement Local ATTRIB

## 📱 Serveurs Locaux Disponibles

### **Serveur de Développement**
- **URL :** http://localhost:8081
- **Commande :** `npm run dev`
- **Utilisation :** Développement avec hot reload
- **Statut :** ✅ En cours d'exécution

### **Serveur de Prévisualisation**
- **URL :** http://localhost:4173
- **Commande :** `npm run preview`
- **Utilisation :** Test de la version de production
- **Statut :** ✅ En cours d'exécution

### **Serveur Combiné**
- **Commande :** `npm run start:local`
- **Fonction :** Démarre les deux serveurs automatiquement

## 🌐 Déploiements Distants

### **Vercel Production**
- **URL :** https://uclouvain-course-assign-g3n2ccxwz-rdgdegs-projects.vercel.app
- **Domaine personnalisé :** attributions.ldmedia.app
- **Statut :** ✅ Déployé et opérationnel

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev

# Prévisualisation
npm run preview

# Build de production
npm run build

# Démarrage automatique des serveurs locaux
npm run start:local

# Déploiement sur Vercel
npm run deploy:vercel
```

## 📊 Statistiques de Build

- **Taille totale :** ~464 KB (gzippé)
- **Chunks optimisés :** 4 fichiers séparés
- **Temps de build :** ~6-7 secondes
- **Hot reload :** Activé

## 🔧 Configuration

### Variables d'environnement configurées :
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_RESEND_API_KEY`

### Optimisations activées :
- ✅ Code splitting automatique
- ✅ Compression gzip
- ✅ Cache des assets
- ✅ Routing SPA

## 🎯 Test de l'Application

1. **Ouvrez** http://localhost:8081 (développement)
2. **Testez** toutes les fonctionnalités
3. **Vérifiez** http://localhost:4173 (production)
4. **Comparez** avec la version Vercel

## 🚨 Dépannage

Si les serveurs ne démarrent pas :
```bash
# Arrêter tous les processus
pkill -f "vite"

# Redémarrer
npm run start:local
``` 