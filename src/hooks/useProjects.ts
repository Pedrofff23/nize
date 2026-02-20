import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectModule } from '@/types/project';
import { toast } from 'sonner';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_modules(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Project & { project_modules: ProjectModule[] })[];
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_modules(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Project & { project_modules: ProjectModule[] };
    },
    enabled: !!id,
  });
}

export type ModuleInput = Omit<ProjectModule, 'id' | 'created_at' | 'updated_at'>;
export type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'modules'> & { modules?: ModuleInput[] };

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: ProjectInput) => {
      const { modules, ...projectData } = project;
      const { data, error } = await supabase.from('projects').insert(projectData).select().single();
      if (error) throw error;
      if (modules && modules.length > 0) {
        const modulesWithProjectId = modules.map((m, i) => ({ ...m, project_id: data.id, order: i }));
        const { error: modError } = await supabase.from('project_modules').insert(modulesWithProjectId);
        if (modError) throw modError;
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto criado com sucesso!');
    },
    onError: () => toast.error('Erro ao criar projeto.'),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Project> & { id: string }) => {
      const { error } = await supabase.from('projects').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['projects', vars.id] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar projeto.'),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto excluído!');
    },
    onError: () => toast.error('Erro ao excluir projeto.'),
  });
}

export function useCreateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (module: Omit<ProjectModule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('project_modules').insert(module).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['projects', data.project_id] });
      toast.success('Módulo adicionado!');
    },
    onError: () => toast.error('Erro ao adicionar módulo.'),
  });
}

export function useUpdateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id, ...data }: Partial<ProjectModule> & { id: string; project_id: string }) => {
      const { error } = await supabase.from('project_modules').update(data).eq('id', id);
      if (error) throw error;
      return { id, project_id };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['projects', data.project_id] });
    },
    onError: () => toast.error('Erro ao atualizar módulo.'),
  });
}

export function useDeleteModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => {
      const { error } = await supabase.from('project_modules').delete().eq('id', id);
      if (error) throw error;
      return { project_id };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['projects', data.project_id] });
      toast.success('Módulo removido!');
    },
    onError: () => toast.error('Erro ao remover módulo.'),
  });
}
