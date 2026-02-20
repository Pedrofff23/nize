import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectEvent } from '@/types/project';
import { toast } from 'sonner';

export function useEvents(projectId: string) {
  return useQuery({
    queryKey: ['events', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events' as never)
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProjectEvent[];
    },
    enabled: !!projectId,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<ProjectEvent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('events' as never)
        .insert(payload as never)
        .select()
        .single();
      if (error) throw error;
      return data as ProjectEvent;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['events', vars.project_id] });
      toast.success('Evento criado!');
    },
    onError: () => toast.error('Erro ao criar evento.'),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id, ...payload }: Partial<ProjectEvent> & { id: string; project_id: string }) => {
      const { data, error } = await supabase
        .from('events' as never)
        .update(payload as never)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ProjectEvent;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['events', (data as ProjectEvent).project_id] });
    },
    onError: () => toast.error('Erro ao atualizar evento.'),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => {
      const { error } = await supabase.from('events' as never).delete().eq('id', id);
      if (error) throw error;
      return project_id;
    },
    onSuccess: (project_id) => {
      qc.invalidateQueries({ queryKey: ['events', project_id] });
      toast.success('Evento removido.');
    },
    onError: () => toast.error('Erro ao remover evento.'),
  });
}
