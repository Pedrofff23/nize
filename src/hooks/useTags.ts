import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tag } from '@/types/project';
import { toast } from 'sonner';

export function useTags() {
    return useQuery({
        queryKey: ['tags'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tags' as never)
                .select('*')
                .order('name');
            if (error) throw error;
            return (data ?? []) as Tag[];
        },
    });
}

export function useCreateTag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ name, color }: { name: string; color: string }) => {
            const { data, error } = await supabase
                .from('tags' as never)
                .insert({ name, color } as never)
                .select()
                .single();
            if (error) throw error;
            return data as Tag;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tags'] });
            toast.success('Tag criada!');
        },
        onError: () => toast.error('Erro ao criar tag.'),
    });
}

export function useUpdateTag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, name, color }: { id: string; name: string; color: string }) => {
            const { error } = await supabase
                .from('tags' as never)
                .update({ name, color } as never)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tags'] });
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Tag atualizada!');
        },
        onError: () => toast.error('Erro ao atualizar tag.'),
    });
}

export function useDeleteTag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('tags' as never).delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tags'] });
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Tag removida!');
        },
        onError: () => toast.error('Erro ao remover tag.'),
    });
}

export function useAddProjectTag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ project_id, tag_id }: { project_id: string; tag_id: string }) => {
            const { error } = await supabase
                .from('project_tags' as never)
                .insert({ project_id, tag_id } as never);
            if (error) throw error;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['projects', vars.project_id] });
            qc.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: () => toast.error('Erro ao associar tag.'),
    });
}

export function useRemoveProjectTag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ project_id, tag_id }: { project_id: string; tag_id: string }) => {
            const { error } = await supabase
                .from('project_tags' as never)
                .delete()
                .eq('project_id', project_id)
                .eq('tag_id', tag_id);
            if (error) throw error;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['projects', vars.project_id] });
            qc.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: () => toast.error('Erro ao desassociar tag.'),
    });
}
