-- Add mode_paiement and poste fields to course_assignments table
ALTER TABLE public.course_assignments 
ADD COLUMN IF NOT EXISTS mode_paiement_vol1 TEXT,
ADD COLUMN IF NOT EXISTS mode_paiement_vol2 TEXT,
ADD COLUMN IF NOT EXISTS poste TEXT;

-- Add comment to explain fields
COMMENT ON COLUMN public.course_assignments.mode_paiement_vol1 IS 'Mode de paiement pour le volume 1';
COMMENT ON COLUMN public.course_assignments.mode_paiement_vol2 IS 'Mode de paiement pour le volume 2';
COMMENT ON COLUMN public.course_assignments.poste IS 'Numéro d''enveloppe de paiement';
