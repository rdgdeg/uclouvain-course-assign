# 🔧 Mise à jour des variables d'environnement Vercel

## Instructions pour mettre à jour les variables d'environnement Vercel via CLI

### Prérequis
1. Node.js et npm doivent être installés et dans votre PATH
2. Vous devez être connecté à Vercel (`npx vercel login`)

### Commandes à exécuter

Ouvrez un terminal PowerShell ou CMD dans le répertoire du projet et exécutez ces commandes :

#### 1. Vérifier la connexion Vercel
```powershell
npx vercel whoami
```

Si vous n'êtes pas connecté :
```powershell
npx vercel login
```

#### 2. Supprimer les anciennes variables
```powershell
# Supprimer VITE_SUPABASE_URL
npx vercel env rm VITE_SUPABASE_URL production --yes
npx vercel env rm VITE_SUPABASE_URL preview --yes
npx vercel env rm VITE_SUPABASE_URL development --yes

# Supprimer VITE_SUPABASE_ANON_KEY
npx vercel env rm VITE_SUPABASE_ANON_KEY production --yes
npx vercel env rm VITE_SUPABASE_ANON_KEY preview --yes
npx vercel env rm VITE_SUPABASE_ANON_KEY development --yes
```

#### 3. Ajouter les nouvelles variables

**Pour VITE_SUPABASE_URL :**
```powershell
echo "https://dhuuduphwvxrecfqvbbw.supabase.co" | npx vercel env add VITE_SUPABASE_URL production
echo "https://dhuuduphwvxrecfqvbbw.supabase.co" | npx vercel env add VITE_SUPABASE_URL preview
echo "https://dhuuduphwvxrecfqvbbw.supabase.co" | npx vercel env add VITE_SUPABASE_URL development
```

**Pour VITE_SUPABASE_ANON_KEY :**
```powershell
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk" | npx vercel env add VITE_SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk" | npx vercel env add VITE_SUPABASE_ANON_KEY preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk" | npx vercel env add VITE_SUPABASE_ANON_KEY development
```

#### 4. Redéployer l'application
```powershell
npx vercel --prod
```

Ou attendez le prochain déploiement automatique depuis Git.

---

## Alternative : Via le Dashboard Vercel

Si vous préférez utiliser l'interface web :

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet `uclouvain-course-assign`
3. Allez dans **Settings** > **Environment Variables**
4. Mettez à jour ou ajoutez :
   - `VITE_SUPABASE_URL` = `https://dhuuduphwvxrecfqvbbw.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk`
5. Sélectionnez les environnements : **Production**, **Preview**, **Development**
6. Redéployez l'application
