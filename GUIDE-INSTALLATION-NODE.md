# 📥 Guide d'installation de Node.js

## Méthode 1 : Installation manuelle (Recommandée)

1. **Téléchargez Node.js :**
   - Allez sur : https://nodejs.org/
   - Téléchargez la version **LTS** (Long Term Support)
   - Version recommandée : Node.js 20.x LTS

2. **Installez Node.js :**
   - Exécutez le fichier `.msi` téléchargé
   - Suivez l'assistant d'installation
   - Cochez toutes les options par défaut (y compris "Add to PATH")

3. **Vérifiez l'installation :**
   - Ouvrez un **nouveau** PowerShell
   - Exécutez :
     ```powershell
     node --version
     npm --version
     ```
   - Vous devriez voir les versions installées

4. **Installez les dépendances :**
   ```powershell
   cd "c:\Users\rdegand\Documents\DEV\uclouvain-course-assign"
   npm install
   ```

5. **Lancez l'application :**
   ```powershell
   npm run dev
   ```

## Méthode 2 : Installation via Chocolatey (si installé)

Si vous avez Chocolatey installé :
```powershell
choco install nodejs-lts
```

## Méthode 3 : Installation via winget (Windows 10/11)

```powershell
winget install OpenJS.NodeJS.LTS
```

## ✅ Après l'installation

Une fois Node.js installé, exécutez dans le dossier du projet :

```powershell
# Installer les dépendances
npm install

# Lancer l'application
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

## 🔧 Configuration

Le fichier `.env.local` a déjà été créé avec vos clés Supabase.  
Vous devrez seulement ajouter votre clé Resend si vous utilisez les emails.

## ❓ Problèmes courants

### Node.js n'est pas reconnu après installation
- **Solution :** Redémarrez votre terminal PowerShell
- Vérifiez que Node.js est dans le PATH : `$env:PATH -split ';' | Select-String node`

### Erreur de permissions
- **Solution :** Exécutez PowerShell en tant qu'administrateur
- Ou utilisez : `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### npm install échoue
- **Solution :** Vérifiez votre connexion internet
- Essayez : `npm install --legacy-peer-deps`
