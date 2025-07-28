export interface VacantCourse {
  code: string;
  nom_fr: string;
  nom_en?: string;
  volume_vol1: number;
  volume_vol2: number;
  faculte?: string;
  sous_categorie?: string;
}

export const parseCSV = (csvContent: string): VacantCourse[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('Le fichier CSV doit contenir au moins un en-tête et une ligne de données');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const courses: VacantCourse[] = [];

  // Mapping des colonnes attendues
  const columnMapping: { [key: string]: string } = {
    'code': 'code',
    'code cours': 'code',
    'cours': 'code',
    'nom': 'nom_fr',
    'nom français': 'nom_fr',
    'nom_fr': 'nom_fr',
    'nom anglais': 'nom_en',
    'nom_en': 'nom_en',
    'volume 1': 'volume_vol1',
    'vol1': 'volume_vol1',
    'volume_vol1': 'volume_vol1',
    'volume 2': 'volume_vol2',
    'vol2': 'volume_vol2',
    'volume_vol2': 'volume_vol2',
    'faculté': 'faculte',
    'faculte': 'faculte',
    'sous-catégorie': 'sous_categorie',
    'sous_categorie': 'sous_categorie'
  };

  // Créer un mapping des indices de colonnes
  const columnIndices: { [key: string]: number } = {};
  headers.forEach((header, index) => {
    const mappedKey = columnMapping[header];
    if (mappedKey) {
      columnIndices[mappedKey] = index;
    }
  });

  // Vérifier que les colonnes obligatoires sont présentes
  const requiredColumns = ['code', 'nom_fr', 'volume_vol1', 'volume_vol2'];
  const missingColumns = requiredColumns.filter(col => !(col in columnIndices));
  
  if (missingColumns.length > 0) {
    throw new Error(`Colonnes manquantes : ${missingColumns.join(', ')}`);
  }

  // Parser chaque ligne de données
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    if (values.length < headers.length) {
      console.warn(`Ligne ${i + 1} ignorée : nombre de colonnes incorrect`);
      continue;
    }

    const course: VacantCourse = {
      code: values[columnIndices.code] || '',
      nom_fr: values[columnIndices.nom_fr] || '',
      volume_vol1: parseFloat(values[columnIndices.volume_vol1]) || 0,
      volume_vol2: parseFloat(values[columnIndices.volume_vol2]) || 0
    };

    // Ajouter les champs optionnels s'ils existent
    if (columnIndices.nom_en && values[columnIndices.nom_en]) {
      course.nom_en = values[columnIndices.nom_en];
    }
    if (columnIndices.faculte && values[columnIndices.faculte]) {
      course.faculte = values[columnIndices.faculte];
    }
    if (columnIndices.sous_categorie && values[columnIndices.sous_categorie]) {
      course.sous_categorie = values[columnIndices.sous_categorie];
    }

    // Vérifier que les données obligatoires sont présentes
    if (course.code && course.nom_fr && (course.volume_vol1 > 0 || course.volume_vol2 > 0)) {
      courses.push(course);
    } else {
      console.warn(`Ligne ${i + 1} ignorée : données incomplètes`);
    }
  }

  return courses;
};

export const validateVacantCourses = (courses: VacantCourse[]): { valid: VacantCourse[], errors: string[] } => {
  const valid: VacantCourse[] = [];
  const errors: string[] = [];

  courses.forEach((course, index) => {
    const lineNumber = index + 1;
    
    if (!course.code.trim()) {
      errors.push(`Ligne ${lineNumber} : Code cours manquant`);
      return;
    }
    
    if (!course.nom_fr.trim()) {
      errors.push(`Ligne ${lineNumber} : Nom français manquant`);
      return;
    }
    
    if (course.volume_vol1 < 0 || course.volume_vol2 < 0) {
      errors.push(`Ligne ${lineNumber} : Volumes négatifs non autorisés`);
      return;
    }
    
    if (course.volume_vol1 === 0 && course.volume_vol2 === 0) {
      errors.push(`Ligne ${lineNumber} : Au moins un volume doit être supérieur à 0`);
      return;
    }
    
    valid.push(course);
  });

  return { valid, errors };
}; 