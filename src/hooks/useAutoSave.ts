import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AutoSaveOptions {
  key: string;
  delay?: number; // Délai en ms avant sauvegarde
  enabled?: boolean;
  onSave?: (data: any) => void;
  onRestore?: (data: any) => void;
}

export const useAutoSave = <T>(initialData: T, options: AutoSaveOptions) => {
  const { key, delay = 2000, enabled = true, onSave, onRestore } = options;
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  // Restaurer les données au chargement
  useEffect(() => {
    if (!enabled || isInitializedRef.current) return;

    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        const parsedData = JSON.parse(saved);
        onRestore?.(parsedData);
        toast({
          title: "Données restaurées",
          description: "Vos données précédentes ont été restaurées.",
        });
      }
    } catch (error) {
      console.warn('Erreur lors de la restauration:', error);
    }
    
    isInitializedRef.current = true;
  }, [key, enabled, onRestore, toast]);

  // Fonction de sauvegarde
  const saveData = useCallback((data: T) => {
    if (!enabled) return;

    try {
      const dataString = JSON.stringify(data);
      
      // Éviter de sauvegarder si rien n'a changé
      if (dataString === lastSavedRef.current) return;

      localStorage.setItem(`autosave_${key}`, dataString);
      lastSavedRef.current = dataString;
      
      onSave?.(data);
      
      // Notification discrète
      toast({
        title: "Sauvegarde automatique",
        description: "Vos données ont été sauvegardées.",
        duration: 1500,
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder automatiquement.",
        variant: "destructive",
      });
    }
  }, [key, enabled, onSave, toast]);

  // Fonction de sauvegarde avec délai
  const saveWithDelay = useCallback((data: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveData(data);
    }, delay);
  }, [saveData, delay]);

  // Nettoyer les données sauvegardées
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
    lastSavedRef.current = '';
  }, [key]);

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveData,
    saveWithDelay,
    clearSavedData,
  };
}; 