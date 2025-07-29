// Système de validation simple et efficace
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

// Validation d'un champ individuel
const validateField = (value: any, rule: ValidationRule, fieldName: string): string | null => {
  // Validation required
  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return rule.message || `${fieldName} est requis`;
  }

  // Si la valeur est vide et pas required, c'est OK
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // Validation minLength
  if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
    return rule.message || `${fieldName} doit contenir au moins ${rule.minLength} caractères`;
  }

  // Validation maxLength
  if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
    return rule.message || `${fieldName} ne peut pas dépasser ${rule.maxLength} caractères`;
  }

  // Validation pattern
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return rule.message || `${fieldName} ne respecte pas le format attendu`;
  }

  // Validation custom
  if (rule.custom) {
    const result = rule.custom(value);
    if (result !== true) {
      return typeof result === 'string' ? result : `${fieldName} n'est pas valide`;
    }
  }

  return null;
};

// Validation d'un objet complet
export const validate = (data: any, schema: ValidationSchema): ValidationResult => {
  const errors: { [key: string]: string } = {};
  let isValid = true;

  for (const [fieldName, rule] of Object.entries(schema)) {
    const value = data[fieldName];
    const error = validateField(value, rule, fieldName);
    
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Schémas de validation prédéfinis
export const validationSchemas = {
  // Validation pour les propositions d'équipe
  teamProposal: {
    submitterName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Le nom du soumissionnaire est requis (2-100 caractères)'
    },
    submitterEmail: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Adresse email invalide'
    },
    assignments: {
      required: true,
      custom: (value: any[]) => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Au moins un enseignant doit être assigné';
        }
        
        // Vérifier que chaque assignment a les champs requis
        for (const assignment of value) {
          if (!assignment.teacher_id || !assignment.vol1_hours || !assignment.vol2_hours) {
            return 'Tous les enseignants doivent avoir des heures assignées';
          }
        }
        
        return true;
      }
    }
  },

  // Validation pour les candidatures libres
  freeProposal: {
    courseCode: {
      required: true,
      pattern: /^[A-Z0-9]{3,10}$/,
      message: 'Le code du cours doit contenir 3-10 caractères alphanumériques'
    },
    courseTitle: {
      required: true,
      minLength: 5,
      maxLength: 200,
      message: 'Le titre du cours est requis (5-200 caractères)'
    },
    faculty: {
      required: true,
      custom: (value: string) => {
        const validFaculties = ['FSM', 'FSP', 'FASB', 'MEDE'];
        return validFaculties.includes(value) || 'Faculté invalide';
      }
    },
    volumeTotalVol1: {
      required: true,
      custom: (value: number) => {
        return value > 0 && value <= 1000 || 'Volume Vol.1 invalide (1-1000h)';
      }
    },
    volumeTotalVol2: {
      required: true,
      custom: (value: number) => {
        return value >= 0 && value <= 1000 || 'Volume Vol.2 invalide (0-1000h)';
      }
    }
  },

  // Validation pour les enseignants
  teacher: {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: 'Le prénom est requis (2-50 caractères)'
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: 'Le nom est requis (2-50 caractères)'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Adresse email invalide'
    },
    status: {
      required: true,
      custom: (value: string) => {
        const validStatuses = ['Académique', 'Invité', 'Associé', 'Émérite'];
        return validStatuses.includes(value) || 'Statut invalide';
      }
    }
  },

  // Validation pour les volumes horaires
  volumeValidation: {
    vol1Hours: {
      required: true,
      custom: (value: number) => {
        return value >= 0 && value <= 1000 || 'Volume Vol.1 invalide (0-1000h)';
      }
    },
    vol2Hours: {
      required: true,
      custom: (value: number) => {
        return value >= 0 && value <= 1000 || 'Volume Vol.2 invalide (0-1000h)';
      }
    }
  }
};

// Validation spécialisée pour les volumes d'un cours
export const validateCourseVolumes = (
  course: any,
  assignments: any[]
): { isValid: boolean; message?: string } => {
  if (!assignments || assignments.length === 0) {
    return {
      isValid: false,
      message: 'Aucun enseignant assigné à ce cours'
    };
  }

  const totalVol1 = assignments.reduce((sum, assignment) => sum + (assignment.vol1_hours || 0), 0);
  const totalVol2 = assignments.reduce((sum, assignment) => sum + (assignment.vol2_hours || 0), 0);

  if (totalVol1 !== course.volume_total_vol1) {
    return {
      isValid: false,
      message: `Volume Vol.1 incorrect. Attendu: ${course.volume_total_vol1}h, Actuel: ${totalVol1}h`
    };
  }

  if (totalVol2 !== course.volume_total_vol2) {
    return {
      isValid: false,
      message: `Volume Vol.2 incorrect. Attendu: ${course.volume_total_vol2}h, Actuel: ${totalVol2}h`
    };
  }

  // Vérifier qu'au moins un enseignant a des heures dans chaque volume
  const hasVol1Hours = assignments.some(a => (a.vol1_hours || 0) > 0);
  const hasVol2Hours = assignments.some(a => (a.vol2_hours || 0) > 0);

  if (!hasVol1Hours && !hasVol2Hours) {
    return {
      isValid: false,
      message: 'Au moins un enseignant doit avoir des heures assignées'
    };
  }

  return { isValid: true };
};

// Validation d'email avec format UCLouvain
export const validateUCLouvainEmail = (email: string): boolean => {
  const uclouvainPattern = /^[a-zA-Z0-9._%+-]+@(uclouvain\.be|student\.uclouvain\.be)$/;
  return uclouvainPattern.test(email);
};

// Validation de mot de passe
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }

  return { isValid: true };
}; 