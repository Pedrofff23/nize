import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskColumn } from '@/types/project';
import { toast } from 'sonner';

// ─── Task Columns ──────────────────────────────────────────────────────────────

export function useTaskColumns(projectId: string) {
  return useQuery({
    queryKey: ['task_columns', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_columns' as never)
        .select('*')
        .eq('project_id', projectId)
        .order('order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as TaskColumn[];
    },
    enabled: !!projectId,
  });
}

export function useCreateTaskColumn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<TaskColumn, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('task_columns' as never)
        .insert(payload as never)
        .select()
        .single();
      if (error) throw error;
      return data as TaskColumn;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['task_columns', vars.project_id] });
      toast.success('Coluna criada!');
    },
    onError: () => toast.error('Erro ao criar coluna.'),
  });
}

export function useUpdateTaskColumn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id, ...payload }: Partial<TaskColumn> & { id: string; project_id: string }) => {
      const { data, error } = await supabase
        .from('task_columns' as never)
        .update(payload as never)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as TaskColumn;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['task_columns', (data as TaskColumn).project_id] });
    },
    onError: () => toast.error('Erro ao atualizar coluna.'),
  });
}

export function useDeleteTaskColumn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => {
      const { error } = await supabase.from('task_columns' as never).delete().eq('id', id);
      if (error) throw error;
      return project_id;
    },
    onSuccess: (project_id) => {
      qc.invalidateQueries({ queryKey: ['task_columns', project_id] });
      qc.invalidateQueries({ queryKey: ['tasks', project_id] });
      toast.success('Coluna removida.');
    },
    onError: () => toast.error('Erro ao remover coluna.'),
  });
}

// ─── Tasks ─────────────────────────────────────────────────────────────────────

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks' as never)
        .select('*')
        .eq('project_id', projectId)
        .order('order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Task[];
    },
    enabled: !!projectId,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tasks' as never)
        .insert(payload as never)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', vars.project_id] });
      toast.success('Tarefa criada!');
    },
    onError: () => toast.error('Erro ao criar tarefa.'),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id, ...payload }: Partial<Task> & { id: string; project_id: string }) => {
      const { data, error } = await supabase
        .from('tasks' as never)
        .update(payload as never)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tasks', (data as Task).project_id] });
    },
    onError: () => toast.error('Erro ao atualizar tarefa.'),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => {
      const { error } = await supabase.from('tasks' as never).delete().eq('id', id);
      if (error) throw error;
      return project_id;
    },
    onSuccess: (project_id) => {
      qc.invalidateQueries({ queryKey: ['tasks', project_id] });
      toast.success('Tarefa removida.');
    },
    onError: () => toast.error('Erro ao remover tarefa.'),
  });
}
