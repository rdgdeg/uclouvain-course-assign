-- Create courses table
CREATE TABLE public.courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT,
  start_date DATE,
  duration_weeks INT,
  volume_total_vol1 INT DEFAULT 0,
  volume_total_vol2 INT DEFAULT 0,
  vacant BOOLEAN DEFAULT TRUE,
  academic_year TEXT DEFAULT '2024-2025',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create teachers table
CREATE TABLE public.teachers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_assignments table
CREATE TABLE public.course_assignments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
  is_coordinator BOOLEAN DEFAULT FALSE,
  vol1_hours INT DEFAULT 0,
  vol2_hours INT DEFAULT 0,
  validated_by_coord BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_validations table
CREATE TABLE public.admin_validations (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create import_reports table
CREATE TABLE public.import_reports (
  id SERIAL PRIMARY KEY,
  type TEXT CHECK (type IN ('teachers', 'courses')),
  inserted INT DEFAULT 0,
  updated INT DEFAULT 0,
  skipped INT DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_reports ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for this application)
CREATE POLICY "Allow all operations on courses" ON public.courses FOR ALL USING (true);
CREATE POLICY "Allow all operations on teachers" ON public.teachers FOR ALL USING (true);
CREATE POLICY "Allow all operations on course_assignments" ON public.course_assignments FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_validations" ON public.admin_validations FOR ALL USING (true);
CREATE POLICY "Allow all operations on import_reports" ON public.import_reports FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON public.courses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at 
    BEFORE UPDATE ON public.teachers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_assignments_updated_at 
    BEFORE UPDATE ON public.course_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.courses (title, code, start_date, duration_weeks, volume_total_vol1, volume_total_vol2, vacant, academic_year) VALUES
('Introduction à la programmation', 'LINFO1101', '2024-09-15', 13, 30, 30, true, '2024-2025'),
('Mathématiques générales', 'LMATH1101', '2024-09-16', 13, 45, 15, false, '2024-2025'),
('Physique générale I', 'LPHYS1101', '2024-09-17', 13, 30, 30, false, '2024-2025');

INSERT INTO public.teachers (first_name, last_name, email, status) VALUES
('Jean', 'Martin', 'jean.martin@uclouvain.be', 'Professeur'),
('Marie', 'Dubois', 'marie.dubois@uclouvain.be', 'Professeur'),
('Pierre', 'Leroy', 'pierre.leroy@uclouvain.be', 'Docteur');

INSERT INTO public.course_assignments (course_id, teacher_id, is_coordinator, vol1_hours, vol2_hours, validated_by_coord) VALUES
(2, 1, true, 30, 15, true),
(3, 2, true, 20, 20, false),
(3, 3, false, 10, 10, false);