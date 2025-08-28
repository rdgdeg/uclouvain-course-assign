
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicIndex from "./pages/PublicIndex";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminHome from "./pages/AdminHome";
import AdminAttributions from "./pages/AdminAttributions";
import NotFound from "./pages/NotFound";
import FreeProposal from "./pages/FreeProposal";
import ModificationRequests from "./pages/ModificationRequests";
import { AppAuth } from "./components/AppAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PerformanceMonitor } from "./components/PerformanceMonitor";

// Configuration optimisée de TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Temps avant que les données soient considérées comme périmées
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Temps de cache des données (gcTime remplace cacheTime dans v5)
      gcTime: 10 * 60 * 1000, // 10 minutes
      // Nombre de tentatives en cas d'échec
      retry: (failureCount, error) => {
        // Ne pas retry pour les erreurs 4xx (erreurs client)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        // Retry jusqu'à 2 fois pour les autres erreurs
        return failureCount < 2;
      },
      // Ne pas refetch automatiquement quand la fenêtre reprend le focus
      refetchOnWindowFocus: false,
      // Refetch seulement si les données sont périmées
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry pour les mutations
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicIndex />} />
            <Route path="/candidature-libre" element={<FreeProposal />} />
            <Route path="/demandes-modification" element={<ModificationRequests />} />
            <Route path="/portail" element={<AdminHome />} />
            <Route path="/controle-attributions" element={<AdminAttributions />} />
            <Route path="/cours-vacants" element={<Index />} />
            <Route path="/admin" element={
              <AppAuth>
                <Admin />
              </AppAuth>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <PerformanceMonitor />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
