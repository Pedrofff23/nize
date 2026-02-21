import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { JSONContent } from '@tiptap/react';

export interface Note {
    id: string;
    project_id: string;
    title: string;
    content: JSONContent;
    created_at: string;
    updated_at: string;
}

export function useNotes(projectId: string) {
    return useQuery({
        queryKey: ['notes', projectId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('project_id', projectId)
                .order('updated_at', { ascending: false });
            if (error) throw error;
            return data as Note[];
        },
        enabled: !!projectId,
    });
}

export function useNote(noteId: string | null) {
    return useQuery({
        queryKey: ['notes', 'detail', noteId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('id', noteId!)
                .single();
            if (error) throw error;
            return data as Note;
        },
        enabled: !!noteId,
    });
}

export function useCreateNote() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ project_id, title }: { project_id: string; title?: string }) => {
            const { data, error } = await supabase
                .from('notes')
                .insert({
                    project_id,
                    title: title || 'Sem título',
                    content: { type: 'doc', content: [{ type: 'paragraph' }] },
                })
                .select()
                .single();
            if (error) throw error;
            return data as Note;
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['notes', data.project_id] });
        },
        onError: () => toast.error('Erro ao criar nota.'),
    });
}

export function useUpdateNote() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            project_id,
            ...data
        }: Partial<Note> & { id: string; project_id: string }) => {
            const { error } = await supabase
                .from('notes')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            return { id, project_id };
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['notes', data.project_id] });
            qc.invalidateQueries({ queryKey: ['notes', 'detail', data.id] });
        },
        onError: () => toast.error('Erro ao salvar nota.'),
    });
}

export function useDeleteNote() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => {
            const { error } = await supabase.from('notes').delete().eq('id', id);
            if (error) throw error;
            return { project_id };
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['notes', data.project_id] });
            toast.success('Nota removida!');
        },
        onError: () => toast.error('Erro ao remover nota.'),
    });
}
