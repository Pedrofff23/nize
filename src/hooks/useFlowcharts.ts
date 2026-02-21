import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface FlowchartData {
    mode: string;
    nodes: any[];
    edges: any[];
}

export interface Flowchart {
    id: string;
    project_id: string;
    title: string;
    data: FlowchartData;
    created_at: string;
    updated_at: string;
}

const DEFAULT_DATA: FlowchartData = {
    mode: 'free',
    nodes: [],
    edges: [],
};

export function useFlowcharts(projectId: string) {
    return useQuery({
        queryKey: ['flowcharts', projectId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('flowcharts')
                .select('*')
                .eq('project_id', projectId)
                .order('updated_at', { ascending: false });
            if (error) throw error;
            return data as unknown as Flowchart[];
        },
        enabled: !!projectId,
    });
}

export function useCreateFlowchart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ project_id, title }: { project_id: string; title?: string }) => {
            const { data, error } = await supabase
                .from('flowcharts')
                .insert({
                    project_id,
                    title: title || 'Sem título',
                    data: DEFAULT_DATA as unknown as Json,
                })
                .select()
                .single();
            if (error) throw error;
            return data as unknown as Flowchart;
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['flowcharts', data.project_id] });
        },
        onError: () => toast.error('Erro ao criar fluxograma.'),
    });
}

export function useUpdateFlowchart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            project_id,
            ...updates
        }: { id: string; project_id: string } & Partial<Pick<Flowchart, 'title' | 'data'>>) => {
            const updatePayload: Record<string, any> = {
                ...updates,
                updated_at: new Date().toISOString(),
            };
            // Ensure data is stored as Json
            if (updates.data) {
                updatePayload.data = updates.data as unknown as Json;
            }
            const { error } = await supabase
                .from('flowcharts')
                .update(updatePayload)
                .eq('id', id);
            if (error) throw error;
            return { id, project_id };
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['flowcharts', data.project_id] });
        },
        onError: () => toast.error('Erro ao salvar fluxograma.'),
    });
}

export function useDeleteFlowchart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => {
            const { error } = await supabase.from('flowcharts').delete().eq('id', id);
            if (error) throw error;
            return { project_id };
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['flowcharts', data.project_id] });
            toast.success('Fluxograma removido!');
        },
        onError: () => toast.error('Erro ao remover fluxograma.'),
    });
}
