
-- Créer une table pour les propositions d'attribution
CREATE TABLE public.assignment_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id INTEGER REFERENCES public.courses(id) ON DELETE CASCADE,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proposal_data JSONB NOT NULL,
  admin_notes TEXT,
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by TEXT
);

-- Activer RLS pour la table assignment_proposals
ALTER TABLE public.assignment_proposals ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous de voir les propositions (pour l'admin)
CREATE POLICY "Allow all operations on assignment_proposals" 
  ON public.assignment_proposals 
  FOR ALL 
  USING (true);

-- Ajouter des index pour améliorer les performances
CREATE INDEX idx_assignment_proposals_course_id ON public.assignment_proposals(course_id);
CREATE INDEX idx_assignment_proposals_status ON public.assignment_proposals(status);
CREATE INDEX idx_assignment_proposals_submission_date ON public.assignment_proposals(submission_date);
