
-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  deadline DATE,
  price NUMERIC(10, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'pausado')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_modules table
CREATE TABLE public.project_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido')),
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_modules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects - only authenticated users
CREATE POLICY "Authenticated users can view projects" ON public.projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert projects" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update projects" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete projects" ON public.projects FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for project_modules
CREATE POLICY "Authenticated users can view modules" ON public.project_modules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert modules" ON public.project_modules FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update modules" ON public.project_modules FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete modules" ON public.project_modules FOR DELETE USING (auth.role() = 'authenticated');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_modules_updated_at
  BEFORE UPDATE ON public.project_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for project files
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload project files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view project files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete project files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');
