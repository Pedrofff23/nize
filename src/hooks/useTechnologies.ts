import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Technology } from '@/types/project';
import { toast } from 'sonner';

export function useTechnologies() {
    return useQuery({
        queryKey: ['technologies'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('technologies')
                .select('*')
                .order('name');
            if (error) throw error;
            return data as Technology[];
        },
    });
}

export function useCreateTechnology() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ name, color }: { name: string; color: string }) => {
            const { data, error } = await supabase
                .from('technologies')
                .insert({ name, color })
                .select()
                .single();
            if (error) throw error;
            return data as Technology;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['technologies'] });
            toast.success('Tecnologia criada!');
        },
        onError: () => toast.error('Erro ao criar tecnologia.'),
    });
}

export function useDeleteTechnology() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('technologies').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['technologies'] });
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Tecnologia removida!');
        },
        onError: () => toast.error('Erro ao remover tecnologia.'),
    });
}

export function useUpdateTechnology() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, name, color }: { id: string; name: string; color: string }) => {
            const { error } = await supabase.from('technologies').update({ name, color }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['technologies'] });
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Tecnologia atualizada!');
        },
        onError: () => toast.error('Erro ao atualizar tecnologia.'),
    });
}

export function useAddProjectTechnology() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ project_id, technology_id }: { project_id: string; technology_id: string }) => {
            const { error } = await supabase
                .from('project_technologies')
                .insert({ project_id, technology_id });
            if (error) throw error;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['projects', vars.project_id] });
            qc.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: () => toast.error('Erro ao associar tecnologia.'),
    });
}

export function useRemoveProjectTechnology() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ project_id, technology_id }: { project_id: string; technology_id: string }) => {
            const { error } = await supabase
                .from('project_technologies')
                .delete()
                .eq('project_id', project_id)
                .eq('technology_id', technology_id);
            if (error) throw error;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['projects', vars.project_id] });
            qc.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: () => toast.error('Erro ao desassociar tecnologia.'),
    });
}
