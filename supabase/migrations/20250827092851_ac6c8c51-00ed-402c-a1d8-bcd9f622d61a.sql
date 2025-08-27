-- Créer une table pour les coordinateurs de cours
CREATE TABLE public.course_coordinators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id integer REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id integer REFERENCES public.teachers(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Créer une table pour les validations des coordinateurs
CREATE TABLE public.coordinator_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id integer REFERENCES public.courses(id) ON DELETE CASCADE,
  coordinator_id uuid REFERENCES public.course_coordinators(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'needs_correction', 'rejected')),
  comments text,
  validated_at timestamp with time zone,
  sent_at timestamp with time zone DEFAULT now(),
  reminder_sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Créer une table pour les attributions d'heures détaillées
CREATE TABLE public.hour_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id integer REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id integer REFERENCES public.teachers(id) ON DELETE CASCADE,
  assignment_type text NOT NULL CHECK (assignment_type IN ('coordinator', 'assistant', 'lecturer', 'tp_supervisor')),
  vol1_hours numeric(5,2) DEFAULT 0,
  vol2_hours numeric(5,2) DEFAULT 0,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'disputed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(course_id, teacher_id, assignment_type)
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.course_coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinator_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hour_attributions ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS
CREATE POLICY "Allow all operations on course_coordinators" ON public.course_coordinators FOR ALL USING (true);
CREATE POLICY "Allow all operations on coordinator_validations" ON public.coordinator_validations FOR ALL USING (true);
CREATE POLICY "Allow all operations on hour_attributions" ON public.hour_attributions FOR ALL USING (true);

-- Créer des index pour optimiser les performances
CREATE INDEX idx_course_coordinators_course_id ON public.course_coordinators(course_id);
CREATE INDEX idx_coordinator_validations_course_id ON public.coordinator_validations(course_id);
CREATE INDEX idx_coordinator_validations_status ON public.coordinator_validations(status);
CREATE INDEX idx_hour_attributions_course_id ON public.hour_attributions(course_id);
CREATE INDEX idx_hour_attributions_teacher_id ON public.hour_attributions(teacher_id);

-- Créer des fonctions pour les triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers
CREATE TRIGGER update_course_coordinators_updated_at
    BEFORE UPDATE ON public.course_coordinators
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coordinator_validations_updated_at
    BEFORE UPDATE ON public.coordinator_validations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hour_attributions_updated_at
    BEFORE UPDATE ON public.hour_attributions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();