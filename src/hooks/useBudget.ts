import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BudgetEntry } from '@/types/project';
import { toast } from 'sonner';

export function useBudget(projectId: string) {
  return useQuery({
    queryKey: ['budget', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_entries' as never)
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as BudgetEntry[];
    },
    enabled: !!projectId,
  });
}

export function useCreateBudgetEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<BudgetEntry, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('budget_entries' as never)
        .insert(payload as never)
        .select()
        .single();
      if (error) throw error;
      return data as BudgetEntry;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['budget', vars.project_id] });
      toast.success('Lançamento adicionado!');
    },
    onError: () => toast.error('Erro ao adicionar lançamento.'),
  });
}

export function useDeleteBudgetEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => {
      const { error } = await supabase.from('budget_entries' as never).delete().eq('id', id);
      if (error) throw error;
      return project_id;
    },
    onSuccess: (project_id) => {
      qc.invalidateQueries({ queryKey: ['budget', project_id] });
      toast.success('Lançamento removido.');
    },
    onError: () => toast.error('Erro ao remover lançamento.'),
  });
}
