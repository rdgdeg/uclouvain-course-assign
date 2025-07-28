
-- Add faculty and subcategory fields to courses table
ALTER TABLE public.courses 
ADD COLUMN faculty TEXT,
ADD COLUMN subcategory TEXT;

-- Update existing courses with sample data
UPDATE public.courses 
SET faculty = 'FSM', subcategory = 'EDPH' 
WHERE id = 1;

UPDATE public.courses 
SET faculty = 'FASB', subcategory = 'SBIM' 
WHERE id = 2;

UPDATE public.courses 
SET faculty = 'FSM', subcategory = 'KINE' 
WHERE id = 3;

-- Add some additional sample courses with different faculties
INSERT INTO public.courses (title, code, start_date, duration_weeks, volume_total_vol1, volume_total_vol2, vacant, academic_year, faculty, subcategory) VALUES
('Pharmacologie générale', 'FARM2101', '2024-09-18', 13, 40, 20, true, '2024-2025', 'FASB', 'FARM'),
('Anatomie humaine', 'MED1101', '2024-09-19', 13, 35, 25, false, '2024-2025', 'MEDE', 'MED'),
('Psychologie cognitive', 'PSP2101', '2024-09-20', 13, 30, 30, true, '2024-2025', 'FSP', NULL);
