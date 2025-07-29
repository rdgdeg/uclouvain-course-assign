-- Migration pour ajouter les champs d'analyse et de commission aux cours
-- Date: 2025-01-18

-- Ajouter les nouveaux champs à la table courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS school TEXT,
ADD COLUMN IF NOT EXISTS analysis_notes TEXT,
ADD COLUMN IF NOT EXISTS commission_notes TEXT,
ADD COLUMN IF NOT EXISTS analysis_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS commission_date TIMESTAMP WITH TIME ZONE;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_courses_faculty_school ON public.courses(faculty, school);
CREATE INDEX IF NOT EXISTS idx_courses_analysis_date ON public.courses(analysis_date);
CREATE INDEX IF NOT EXISTS idx_courses_commission_date ON public.courses(commission_date);

-- Ajouter des commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN public.courses.school IS 'École à laquelle appartient le cours';
COMMENT ON COLUMN public.courses.analysis_notes IS 'Notes d''analyse du cours par l''administrateur';
COMMENT ON COLUMN public.courses.commission_notes IS 'Notes de la commission d''attribution';
COMMENT ON COLUMN public.courses.analysis_date IS 'Date de la dernière analyse';
COMMENT ON COLUMN public.courses.commission_date IS 'Date de la dernière commission';

-- Mettre à jour les cours existants avec des valeurs par défaut pour l'école
UPDATE public.courses 
SET school = 'Non définie' 
WHERE school IS NULL;

-- Créer une vue pour faciliter les requêtes de statistiques par faculté
CREATE OR REPLACE VIEW faculty_stats AS
SELECT 
  faculty,
  COUNT(*) as total_courses,
  COUNT(*) FILTER (WHERE vacant = true) as vacant_courses,
  COUNT(*) FILTER (WHERE vacant = false AND EXISTS (
    SELECT 1 FROM course_assignments ca WHERE ca.course_id = courses.id
  )) as assigned_courses,
  COUNT(*) FILTER (WHERE analysis_notes IS NOT NULL) as courses_with_analysis,
  COUNT(*) FILTER (WHERE commission_notes IS NOT NULL) as courses_with_commission
FROM public.courses
WHERE faculty IS NOT NULL
GROUP BY faculty
ORDER BY faculty;

-- Créer une vue pour faciliter les requêtes de statistiques par école
CREATE OR REPLACE VIEW school_stats AS
SELECT 
  school,
  faculty,
  COUNT(*) as total_courses,
  COUNT(*) FILTER (WHERE vacant = true) as vacant_courses,
  COUNT(*) FILTER (WHERE vacant = false AND EXISTS (
    SELECT 1 FROM course_assignments ca WHERE ca.course_id = courses.id
  )) as assigned_courses,
  COUNT(*) FILTER (WHERE analysis_notes IS NOT NULL) as courses_with_analysis,
  COUNT(*) FILTER (WHERE commission_notes IS NOT NULL) as courses_with_commission
FROM public.courses
WHERE school IS NOT NULL
GROUP BY school, faculty
ORDER BY school, faculty; 