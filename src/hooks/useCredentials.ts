import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Credential {
    id: string;
    user_id: string;
    title: string;
    username: string | null;
    password: string | null;
    url: string | null;
    notes: string | null;
    category: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectCredential {
    id: string;
    project_id: string;
    title: string;
    username: string | null;
    password: string | null;
    url: string | null;
    notes: string | null;
    category: string;
    created_at: string;
    updated_at: string;
}

export type CredentialInput = Omit<Credential, 'id' | 'created_at' | 'updated_at'>;
export type ProjectCredentialInput = Omit<ProjectCredential, 'id' | 'created_at' | 'updated_at'>;

// ─── Central Avulsa (pessoal) ─────────────────────────────────────────────────
export function useCredentials() {
    return useQuery({
        queryKey: ['credentials'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('credentials')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Credential[];
        },
    });
}

export function useCreateCredential() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (cred: Omit<CredentialInput, 'user_id'>) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Não autenticado');
            const { data, error } = await supabase
                .from('credentials')
                .insert({ ...cred, user_id: user.id })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['credentials'] });
            toast.success('Credencial salva!');
        },
        onError: () => toast.error('Erro ao salvar credencial.'),
    });
}

export function useUpdateCredential() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: Partial<Credential> & { id: string }) => {
            const { error } = await supabase
                .from('credentials')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['credentials'] });
            toast.success('Credencial atualizada!');
        },
        onError: () => toast.error('Erro ao atualizar credencial.'),
    });
}

export function useDeleteCredential() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('credentials').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['credentials'] });
            toast.success('Credencial excluída!');
        },
        onError: () => toast.error('Erro ao excluir credencial.'),
    });
}

// ─── Credenciais por Projeto ──────────────────────────────────────────────────
export function useProjectCredentials(projectId: string) {
    return useQuery({
        queryKey: ['project-credentials', projectId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('project_credentials')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as ProjectCredential[];
        },
        enabled: !!projectId,
    });
}

export function useCreateProjectCredential() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (cred: ProjectCredentialInput) => {
            const { data, error } = await supabase
                .from('project_credentials')
                .insert(cred)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['project-credentials', data.project_id] });
            toast.success('Credencial do projeto salva!');
        },
        onError: () => toast.error('Erro ao salvar credencial do projeto.'),
    });
}

export function useUpdateProjectCredential() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, project_id, ...data }: Partial<ProjectCredential> & { id: string; project_id: string }) => {
            const { error } = await supabase
                .from('project_credentials')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            return { project_id };
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['project-credentials', data.project_id] });
            toast.success('Credencial atualizada!');
        },
        onError: () => toast.error('Erro ao atualizar credencial.'),
    });
}

export function useDeleteProjectCredential() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => {
            const { error } = await supabase.from('project_credentials').delete().eq('id', id);
            if (error) throw error;
            return { project_id };
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['project-credentials', data.project_id] });
            toast.success('Credencial removida!');
        },
        onError: () => toast.error('Erro ao remover credencial.'),
    });
}
