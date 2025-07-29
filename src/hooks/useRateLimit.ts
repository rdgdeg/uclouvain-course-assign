import { useState, useRef, useCallback } from 'react';

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  action: string;
}

interface RateLimitState {
  attempts: number[];
  isBlocked: boolean;
  remainingTime: number;
}

export const useRateLimit = (options: RateLimitOptions) => {
  const { maxAttempts, windowMs, action } = options;
  const [state, setState] = useState<RateLimitState>({
    attempts: [],
    isBlocked: false,
    remainingTime: 0,
  });
  
  const intervalRef = useRef<NodeJS.Timeout>();

  // Vérifier si l'action peut être effectuée
  const canPerform = useCallback(() => {
    const now = Date.now();
    const recentAttempts = state.attempts.filter(timestamp => now - timestamp < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...recentAttempts);
      const remainingTime = windowMs - (now - oldestAttempt);
      
      setState(prev => ({
        ...prev,
        isBlocked: true,
        remainingTime,
      }));
      
      return false;
    }
    
    setState(prev => ({
      ...prev,
      isBlocked: false,
      remainingTime: 0,
    }));
    
    return true;
  }, [state.attempts, maxAttempts, windowMs]);

  // Enregistrer une tentative
  const recordAttempt = useCallback(() => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      attempts: [...prev.attempts, now],
    }));
  }, []);

  // Nettoyer les anciennes tentatives
  const cleanupOldAttempts = useCallback(() => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      attempts: prev.attempts.filter(timestamp => now - timestamp < windowMs),
    }));
  }, [windowMs]);

  // Fonction pour effectuer une action avec rate limiting
  const performAction = useCallback(async <T>(
    actionFn: () => Promise<T> | T
  ): Promise<T> => {
    if (!canPerform()) {
      throw new Error(
        `Rate limit exceeded for ${action}. Please wait ${Math.ceil(state.remainingTime / 1000)} seconds.`
      );
    }

    recordAttempt();
    
    try {
      const result = await actionFn();
      return result;
    } catch (error) {
      // En cas d'erreur, on peut choisir de ne pas compter la tentative
      // ou de la compter comme un échec
      throw error;
    }
  }, [canPerform, recordAttempt, action, state.remainingTime]);

  // Nettoyer les tentatives périodiquement
  const startCleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(cleanupOldAttempts, windowMs);
  }, [cleanupOldAttempts, windowMs]);

  // Arrêter le nettoyage
  const stopCleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  // Démarrer le nettoyage automatique
  useState(() => {
    startCleanup();
    return () => stopCleanup();
  });

  return {
    canPerform,
    recordAttempt,
    performAction,
    isBlocked: state.isBlocked,
    remainingTime: state.remainingTime,
    attemptsCount: state.attempts.length,
    maxAttempts,
    windowMs,
  };
};

// Hook spécialisé pour les soumissions de formulaires
export const useFormRateLimit = (maxAttempts: number = 5, windowMs: number = 60000) => {
  return useRateLimit({
    maxAttempts,
    windowMs,
    action: 'form_submission',
  });
};

// Hook spécialisé pour les requêtes API
export const useApiRateLimit = (maxAttempts: number = 10, windowMs: number = 60000) => {
  return useRateLimit({
    maxAttempts,
    windowMs,
    action: 'api_request',
  });
}; 