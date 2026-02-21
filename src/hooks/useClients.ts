import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client, ClientInput } from '@/types/client';
import { toast } from 'sonner';

export function useClients(search?: string) {
    return useQuery({
        queryKey: ['clients', search],
        queryFn: async () => {
            let query = supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });
            if (search && search.trim()) {
                query = query.or(
                    `name.ilike.%${search}%,company_name.ilike.%${search}%,fantasy_name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%,cnpj.ilike.%${search}%`
                );
            }
            const { data, error } = await query;
            if (error) throw error;
            return data as Client[];
        },
    });
}

export function useClient(id: string) {
    return useQuery({
        queryKey: ['clients', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data as Client;
        },
        enabled: !!id,
    });
}

export function useCreateClient() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (client: ClientInput) => {
            const { data, error } = await supabase
                .from('clients')
                .insert(client)
                .select()
                .single();
            if (error) throw error;
            return data as Client;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Cliente cadastrado com sucesso!');
        },
        onError: () => toast.error('Erro ao cadastrar cliente.'),
    });
}

export function useUpdateClient() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: Partial<Client> & { id: string }) => {
            const { error } = await supabase
                .from('clients')
                .update(data)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['clients', vars.id] });
            qc.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Cliente atualizado!');
        },
        onError: () => toast.error('Erro ao atualizar cliente.'),
    });
}

export function useDeleteClient() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Cliente excluído!');
        },
        onError: () => toast.error('Erro ao excluir cliente.'),
    });
}
