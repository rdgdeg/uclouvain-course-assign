-- Add new fields to hour_attributions table
ALTER TABLE public.hour_attributions 
ADD COLUMN faculty TEXT,
ADD COLUMN candidature_status TEXT,
ADD COLUMN is_coordinator BOOLEAN DEFAULT false;

-- Add volume totals to courses table
ALTER TABLE public.courses 
ADD COLUMN vol1_total INTEGER DEFAULT 0,
ADD COLUMN vol2_total INTEGER DEFAULT 0;

-- Create course_corrections table for tracking correction requests
CREATE TABLE public.course_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id INTEGER REFERENCES public.courses(id),
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  description TEXT NOT NULL,
  correction_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on course_corrections
ALTER TABLE public.course_corrections ENABLE ROW LEVEL SECURITY;

-- Create policy for course_corrections
CREATE POLICY "Allow all operations on course_corrections" 
ON public.course_corrections 
FOR ALL 
USING (true);

-- Create import_logs table for tracking import operations
CREATE TABLE public.import_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  import_type TEXT NOT NULL,
  status TEXT NOT NULL,
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  warnings_count INTEGER DEFAULT 0,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on import_logs
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for import_logs
CREATE POLICY "Allow all operations on import_logs" 
ON public.import_logs 
FOR ALL 
USING (true);

-- Add trigger for course_corrections updated_at
CREATE TRIGGER update_course_corrections_updated_at
BEFORE UPDATE ON public.course_corrections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();