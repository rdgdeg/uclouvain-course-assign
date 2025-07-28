
-- Créer une table pour les demandes de modification
CREATE TABLE public.modification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id INTEGER REFERENCES public.courses(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  modification_type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by TEXT
);

-- Activer RLS pour la table modification_requests
ALTER TABLE public.modification_requests ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous de voir les demandes (pour l'admin)
CREATE POLICY "Allow all operations on modification_requests" 
  ON public.modification_requests 
  FOR ALL 
  USING (true);

-- Ajouter un index pour améliorer les performances
CREATE INDEX idx_modification_requests_status ON public.modification_requests(status);
CREATE INDEX idx_modification_requests_course_id ON public.modification_requests(course_id);
