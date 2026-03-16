
-- Consolidated Supabase Setup Script for Nize - Gestor de Projetos
-- Use this script in the Supabase SQL Editor to set up your database schema.

-- 1. Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Create tables

-- Clients
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'pf' CHECK (type IN ('pf', 'pj')),
  name text NOT NULL,
  cpf text,
  rg text,
  birth_date date,
  company_name text,
  fantasy_name text,
  cnpj text,
  state_registration text,
  email text,
  phone text,
  whatsapp text,
  zip_code text,
  street text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  deadline date,
  price numeric(10, 2) DEFAULT 0,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'pausado')),
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  enabled_tools text[] DEFAULT ARRAY['tasks', 'agenda', 'budget', 'files', 'notes', 'flowchart', 'credentials'],
  monthly_value numeric
);

-- Project Modules
CREATE TABLE public.project_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido')),
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Task Columns
CREATE TABLE public.task_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  color text DEFAULT '#6366f1',
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tasks
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  "order" integer NOT NULL DEFAULT 0,
  column_id uuid REFERENCES public.task_columns(id) ON DELETE CASCADE,
  custom_fields jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  time text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Budget Entries
CREATE TABLE public.budget_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'income',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Notes
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Sem título',
  content jsonb DEFAULT '{"type": "doc", "content": [{"type": "paragraph"}]}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Flowcharts
CREATE TABLE public.flowcharts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Sem título',
  data jsonb DEFAULT '{"mode": "free", "edges": [], "nodes": []}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Technologies
CREATE TABLE public.technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Project Technologies (Join Table)
CREATE TABLE public.project_technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  technology_id uuid NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User Credentials (General)
CREATE TABLE public.credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  username text,
  password text,
  url text,
  notes text,
  category text DEFAULT 'geral',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Project Credentials
CREATE TABLE public.project_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  username text,
  password text,
  url text,
  notes text,
  category text DEFAULT 'geral',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tags
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Project Tags (Join Table)
CREATE TABLE public.project_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowcharts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Projects
CREATE POLICY "Authenticated users can view projects" ON public.projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert projects" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update projects" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete projects" ON public.projects FOR DELETE USING (auth.role() = 'authenticated');

-- Project Modules
CREATE POLICY "Authenticated users can view modules" ON public.project_modules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert modules" ON public.project_modules FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update modules" ON public.project_modules FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete modules" ON public.project_modules FOR DELETE USING (auth.role() = 'authenticated');

-- Tasks
CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update tasks" ON public.tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete tasks" ON public.tasks FOR DELETE USING (auth.role() = 'authenticated');

-- Events
CREATE POLICY "Authenticated users can view events" ON public.events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert events" ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update events" ON public.events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete events" ON public.events FOR DELETE USING (auth.role() = 'authenticated');

-- Budget Entries
CREATE POLICY "Authenticated users can view budget_entries" ON public.budget_entries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert budget_entries" ON public.budget_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update budget_entries" ON public.budget_entries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete budget_entries" ON public.budget_entries FOR DELETE USING (auth.role() = 'authenticated');

-- Clients
CREATE POLICY "Allow all for authenticated clients" ON public.clients TO authenticated USING (true) WITH CHECK (true);

-- Notes
CREATE POLICY "notes_all" ON public.notes TO authenticated USING (true);

-- Flowcharts
CREATE POLICY "Allow all for authenticated users on flowcharts" ON public.flowcharts TO authenticated USING (true) WITH CHECK (true);

-- Task Columns
CREATE POLICY "Authenticated users can view task_columns" ON public.task_columns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert task_columns" ON public.task_columns FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update task_columns" ON public.task_columns FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete task_columns" ON public.task_columns FOR DELETE USING (auth.role() = 'authenticated');

-- Technologies
CREATE POLICY "Allow full access to technologies" ON public.technologies TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to project_technologies" ON public.project_technologies TO authenticated USING (true) WITH CHECK (true);

-- Credentials (Self management)
CREATE POLICY "Users can manage their own credentials" ON public.credentials TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Project Credentials
CREATE POLICY "Authenticated users can manage project credentials" ON public.project_credentials TO authenticated USING (true) WITH CHECK (true);

-- Tags
CREATE POLICY "Allow authenticated full access to tags" ON public.tags TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to project_tags" ON public.project_tags TO authenticated USING (true) WITH CHECK (true);

-- 5. Triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_modules_updated_at BEFORE UPDATE ON public.project_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budget_entries_updated_at BEFORE UPDATE ON public.budget_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flowcharts_updated_at BEFORE UPDATE ON public.flowcharts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_task_columns_updated_at BEFORE UPDATE ON public.task_columns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON public.credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_credentials_updated_at BEFORE UPDATE ON public.project_credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Storage Setup
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false) ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload project files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view project files" ON storage.objects FOR SELECT USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete project files" ON storage.objects FOR DELETE USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');
