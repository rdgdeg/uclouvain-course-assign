import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePerformance } from '@/hooks/usePerformance';
import { Activity, Zap, Clock, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
  });

  const { getMetrics } = usePerformance();

  useEffect(() => {
    // Mettre à jour les métriques toutes les 2 secondes
    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, [getMetrics]);

  // Ne montrer que en développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getPerformanceScore = () => {
    let score = 100;
    
    if (metrics.pageLoadTime > 3000) score -= 20;
    if (metrics.firstContentfulPaint > 2000) score -= 20;
    if (metrics.largestContentfulPaint > 2500) score -= 20;
    if (metrics.cumulativeLayoutShift > 0.1) score -= 20;
    
    return Math.max(0, score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const score = getPerformanceScore();

  return (
    <>
      {/* Bouton flottant pour afficher/masquer */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg"
        variant="outline"
        size="sm"
      >
        <Activity className="h-4 w-4" />
      </Button>

      {/* Panneau de monitoring */}
      {isVisible && (
        <Card className="fixed bottom-20 right-4 w-80 z-50 shadow-xl border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Performance Monitor
              <Badge className={`ml-auto ${getScoreColor(score)} text-white`}>
                {score}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span>Page Load Time</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className={metrics.pageLoadTime > 3000 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {metrics.pageLoadTime.toFixed(0)}ms
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span>First Contentful Paint</span>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span className={metrics.firstContentfulPaint > 2000 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {metrics.firstContentfulPaint.toFixed(0)}ms
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span>Largest Contentful Paint</span>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span className={metrics.largestContentfulPaint > 2500 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {metrics.largestContentfulPaint.toFixed(0)}ms
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span>Cumulative Layout Shift</span>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span className={metrics.cumulativeLayoutShift > 0.1 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {metrics.cumulativeLayoutShift.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            {score < 90 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <div className="font-semibold text-yellow-800 mb-1">Recommandations :</div>
                <ul className="text-yellow-700 space-y-1">
                  {metrics.pageLoadTime > 3000 && (
                    <li>• Optimiser le temps de chargement de la page</li>
                  )}
                  {metrics.firstContentfulPaint > 2000 && (
                    <li>• Améliorer le First Contentful Paint</li>
                  )}
                  {metrics.largestContentfulPaint > 2500 && (
                    <li>• Optimiser le Largest Contentful Paint</li>
                  )}
                  {metrics.cumulativeLayoutShift > 0.1 && (
                    <li>• Réduire les décalages de mise en page</li>
                  )}
                </ul>
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              Visible uniquement en développement
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}; 