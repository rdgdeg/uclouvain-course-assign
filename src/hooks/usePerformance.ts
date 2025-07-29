import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

export const usePerformance = () => {
  const metricsRef = useRef<PerformanceMetrics>({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
  });

  useEffect(() => {
    // Mesurer le temps de chargement de la page
    const measurePageLoad = () => {
      if (performance.getEntriesByType) {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const navigation = navigationEntries[0] as PerformanceNavigationTiming;
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          metricsRef.current.pageLoadTime = loadTime;
          
          // Log si le temps de chargement est trop long
          if (loadTime > 3000) {
            console.warn(`Page load time is slow: ${loadTime}ms`);
          }
        }
      }
    };

    // Mesurer First Contentful Paint (FCP)
    const measureFCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'first-contentful-paint') {
              metricsRef.current.firstContentfulPaint = entry.startTime;
              
              if (entry.startTime > 2000) {
                console.warn(`FCP is slow: ${entry.startTime}ms`);
              }
            }
          });
        });
        
        observer.observe({ entryTypes: ['first-contentful-paint'] });
      }
    };

    // Mesurer Largest Contentful Paint (LCP)
    const measureLCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            metricsRef.current.largestContentfulPaint = lastEntry.startTime;
            
            if (lastEntry.startTime > 2500) {
              console.warn(`LCP is slow: ${lastEntry.startTime}ms`);
            }
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    };

    // Mesurer Cumulative Layout Shift (CLS)
    const measureCLS = () => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as any;
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
          metricsRef.current.cumulativeLayoutShift = clsValue;
          
          if (clsValue > 0.1) {
            console.warn(`CLS is poor: ${clsValue}`);
          }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
      }
    };

    // Mesurer les performances des requêtes réseau
    const measureNetworkPerformance = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              const duration = resourceEntry.duration;
              
              // Alerter si une ressource prend trop de temps à charger
              if (duration > 5000) {
                console.warn(`Slow resource: ${resourceEntry.name} took ${duration}ms`);
              }
            }
          });
        });
        
        observer.observe({ entryTypes: ['resource'] });
      }
    };

    // Initialiser toutes les mesures
    measurePageLoad();
    measureFCP();
    measureLCP();
    measureCLS();
    measureNetworkPerformance();

    // Nettoyer les observers au démontage
    return () => {
      // Les PerformanceObserver se nettoient automatiquement
    };
  }, []);

  // Fonction pour obtenir les métriques actuelles
  const getMetrics = () => metricsRef.current;

  // Fonction pour mesurer une opération spécifique
  const measureOperation = (name: string, operation: () => void | Promise<void>) => {
    const start = performance.now();
    
    const execute = async () => {
      try {
        await operation();
        const end = performance.now();
        const duration = end - start;
        
        console.log(`${name} took ${duration.toFixed(2)}ms`);
        
        // Alerter si l'opération est lente
        if (duration > 1000) {
          console.warn(`${name} is slow: ${duration.toFixed(2)}ms`);
        }
        
        return duration;
      } catch (error) {
        const end = performance.now();
        const duration = end - start;
        console.error(`${name} failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
      }
    };
    
    return execute();
  };

  return {
    getMetrics,
    measureOperation,
  };
}; 