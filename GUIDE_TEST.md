# 🧪 Guide de Test - Gestion des Cours Vacants

## Prérequis
- Application démarrée (`npm run dev`)
- Accès à l'interface d'administration

## Tests à effectuer

### 1. Test de Connexion à la Base de Données
1. Aller sur `/admin`
2. Cliquer sur l'onglet "Test DB" (si disponible)
3. Cliquer sur "Tester la connexion"
4. Vérifier que la connexion à Supabase fonctionne
5. Ouvrir la console (F12) pour voir les logs détaillés

### 2. Import de Cours Vacants
1. Aller sur `/admin`
2. Cliquer sur "Importer des cours"
3. Sélectionner le fichier `exemple_cours_vacants.csv`
4. Cliquer sur "Importer"
5. Vérifier que les cours sont importés avec succès
6. Vérifier l'aperçu des cours importés

### 3. Test des Formulaires de Proposition
1. Aller sur `/` (interface publique)
2. Tester la "Candidature libre" :
   - Remplir les informations du cours
   - Ajouter un coordonnateur et des cotitulaires
   - Vérifier la validation des volumes
   - Soumettre la candidature

### 4. Test de l'Interface Administrative
1. Aller sur `/admin`
2. Aller dans l'onglet "Propositions" (si disponible)
3. Vérifier que les candidatures soumises apparaissent
4. Tester l'examen et la validation d'une proposition

## Fichier CSV d'exemple
Le fichier `exemple_cours_vacants.csv` contient 5 cours d'exemple avec :
- Codes de cours uniques
- Noms en français et anglais
- Volumes horaires variés
- Différentes facultés

## Structure attendue du CSV
```csv
Code,Nom français,Nom anglais,Volume Vol.1,Volume Vol.2,Faculté,Sous-catégorie
INFO1234,Introduction à la programmation,Introduction to Programming,30,15,Faculté des Sciences,Informatique
```

## Dépannage

### Erreurs de connexion
- Vérifier que les clés Supabase sont correctes
- Vérifier la console pour les erreurs détaillées

### Erreurs d'import
- Vérifier le format du CSV
- S'assurer que les colonnes obligatoires sont présentes
- Vérifier que les volumes sont des nombres positifs

### Erreurs de soumission
- Vérifier que tous les champs obligatoires sont remplis
- S'assurer que les volumes correspondent au total du cours
- Vérifier la connexion internet

## Logs utiles
Ouvrir la console du navigateur (F12) pour voir :
- Les requêtes Supabase
- Les erreurs de validation
- Les succès d'import et de soumission 