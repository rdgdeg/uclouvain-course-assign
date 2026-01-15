-- Migration pour ajouter les tables et colonnes manquantes
-- Cette migration est idempotent et peut être exécutée plusieurs fois

-- 1. Ajouter vol1_total et vol2_total à courses si manquants
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'vol1_total'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN vol1_total INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'vol2_total'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN vol2_total INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Créer la table hour_attributions si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.hour_attributions (
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

-- 3. Ajouter les colonnes supplémentaires à hour_attributions si manquantes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hour_attributions' 
        AND column_name = 'faculty'
    ) THEN
        ALTER TABLE public.hour_attributions ADD COLUMN faculty TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hour_attributions' 
        AND column_name = 'candidature_status'
    ) THEN
        ALTER TABLE public.hour_attributions ADD COLUMN candidature_status TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hour_attributions' 
        AND column_name = 'is_coordinator'
    ) THEN
        ALTER TABLE public.hour_attributions ADD COLUMN is_coordinator BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 4. Activer RLS sur hour_attributions
ALTER TABLE public.hour_attributions ENABLE ROW LEVEL SECURITY;

-- 5. Créer la politique RLS (DROP puis CREATE pour éviter les erreurs)
DROP POLICY IF EXISTS "Allow all operations on hour_attributions" ON public.hour_attributions;
CREATE POLICY "Allow all operations on hour_attributions" 
ON public.hour_attributions 
FOR ALL 
USING (true);

-- 6. Créer les index si nécessaire
CREATE INDEX IF NOT EXISTS idx_hour_attributions_course_id ON public.hour_attributions(course_id);
CREATE INDEX IF NOT EXISTS idx_hour_attributions_teacher_id ON public.hour_attributions(teacher_id);

-- 7. Créer le trigger pour updated_at si nécessaire
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_hour_attributions_updated_at ON public.hour_attributions;
CREATE TRIGGER update_hour_attributions_updated_at
    BEFORE UPDATE ON public.hour_attributions
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();
