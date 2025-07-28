-- Créer une table pour les statuts des enseignants
CREATE TABLE public.teacher_statuses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer quelques statuts par défaut
INSERT INTO public.teacher_statuses (name, description) VALUES
  ('Académique', 'Enseignant académique permanent'),
  ('Invité', 'Enseignant invité ou externe'),
  ('Doctorant', 'Doctorant enseignant'),
  ('Vacataire', 'Enseignant vacataire'),
  ('Retraité', 'Enseignant retraité');

-- Activer RLS pour la table teacher_statuses
ALTER TABLE public.teacher_statuses ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous de voir les statuts (pour l'admin)
CREATE POLICY "Allow all operations on teacher_statuses" 
  ON public.teacher_statuses 
  FOR ALL 
  USING (true);

-- Créer un index pour améliorer les performances
CREATE INDEX idx_teacher_statuses_active ON public.teacher_statuses(is_active);
CREATE INDEX idx_teacher_statuses_name ON public.teacher_statuses(name);