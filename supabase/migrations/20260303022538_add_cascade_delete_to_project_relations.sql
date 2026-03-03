ALTER TABLE public.task_columns DROP CONSTRAINT IF EXISTS task_columns_project_id_fkey, ADD CONSTRAINT task_columns_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey, ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_column_id_fkey, ADD CONSTRAINT tasks_column_id_fkey FOREIGN KEY (column_id) REFERENCES public.task_columns(id) ON DELETE CASCADE;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_project_id_fkey, ADD CONSTRAINT events_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.project_modules DROP CONSTRAINT IF EXISTS project_modules_project_id_fkey, ADD CONSTRAINT project_modules_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.budget_entries DROP CONSTRAINT IF EXISTS budget_entries_project_id_fkey, ADD CONSTRAINT budget_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_project_id_fkey, ADD CONSTRAINT notes_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.flowcharts DROP CONSTRAINT IF EXISTS flowcharts_project_id_fkey, ADD CONSTRAINT flowcharts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
