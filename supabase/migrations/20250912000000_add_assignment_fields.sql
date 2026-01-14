-- Add mode_paiement and poste fields to course_assignments table
-- Vérifier que la table existe avant d'ajouter les colonnes
DO $$
BEGIN
    -- Vérifier si la table existe
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'course_assignments'
    ) THEN
        -- Ajouter les colonnes si elles n'existent pas déjà
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'course_assignments' 
            AND column_name = 'mode_paiement_vol1'
        ) THEN
            ALTER TABLE public.course_assignments 
            ADD COLUMN mode_paiement_vol1 TEXT;
        END IF;

        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'course_assignments' 
            AND column_name = 'mode_paiement_vol2'
        ) THEN
            ALTER TABLE public.course_assignments 
            ADD COLUMN mode_paiement_vol2 TEXT;
        END IF;

        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'course_assignments' 
            AND column_name = 'poste'
        ) THEN
            ALTER TABLE public.course_assignments 
            ADD COLUMN poste TEXT;
        END IF;

        -- Ajouter les commentaires
        COMMENT ON COLUMN public.course_assignments.mode_paiement_vol1 IS 'Mode de paiement pour le volume 1';
        COMMENT ON COLUMN public.course_assignments.mode_paiement_vol2 IS 'Mode de paiement pour le volume 2';
        COMMENT ON COLUMN public.course_assignments.poste IS 'Numéro d''enveloppe de paiement';
    ELSE
        RAISE NOTICE 'Table course_assignments does not exist. Please run previous migrations first.';
    END IF;
END $$;
