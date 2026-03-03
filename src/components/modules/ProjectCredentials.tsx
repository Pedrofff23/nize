import { useState } from 'react';
import { Plus, KeyRound, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CredentialCard } from './CredentialCard';
import {
    useProjectCredentials,
    useCreateProjectCredential,
    useUpdateProjectCredential,
    useDeleteProjectCredential,
} from '@/hooks/useCredentials';

interface ProjectCredentialsProps {
    projectId: string;
}

export function ProjectCredentials({ projectId }: ProjectCredentialsProps) {
    const { data: credentials, isLoading } = useProjectCredentials(projectId);
    const createCred = useCreateProjectCredential();
    const updateCred = useUpdateProjectCredential();
    const deleteCred = useDeleteProjectCredential();
    const [search, setSearch] = useState('');
    const [adding, setAdding] = useState(false);

    // Form state para nova credencial
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [category, setCategory] = useState('geral');

    const handleAdd = async () => {
        if (!title.trim()) return;
        await createCred.mutateAsync({
            project_id: projectId,
            title: title.trim(),
            username: username || null,
            password: password || null,
            url: url || null,
            notes: notes || null,
            category,
        });
        setTitle('');
        setUsername('');
        setPassword('');
        setUrl('');
        setNotes('');
        setCategory('geral');
        setAdding(false);
    };

    const filtered = credentials?.filter(
        (c) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.username?.toLowerCase().includes(search.toLowerCase()) ||
            c.url?.toLowerCase().includes(search.toLowerCase()) ||
            c.category.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center shadow-md">
                        <KeyRound className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="font-bold text-foreground text-lg">Credenciais do Projeto</h2>
                        <p className="text-xs text-muted-foreground">
                            {credentials?.length ?? 0} credencia{(credentials?.length ?? 0) === 1 ? 'l' : 'is'} salva{(credentials?.length ?? 0) === 1 ? '' : 's'}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setAdding(true)}
                    size="sm"
                    className="gradient-teal text-primary-foreground hover:opacity-90 shadow-md"
                >
                    <Plus className="w-4 h-4 mr-2" /> Nova Credencial
                </Button>
            </div>

            {/* Search */}
            {(credentials?.length ?? 0) > 0 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar credenciais..."
                        className="bg-card/50 border-border pl-10 h-10 rounded-xl"
                    />
                </div>
            )}

            {/* New Credential Form */}
            {adding && (
                <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-2xl p-5 space-y-3 shadow-lg shadow-primary/5">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título * (ex: Painel Admin, API Gateway...)"
                        className="bg-background/50 border-border h-9 text-sm font-medium"
                        autoFocus
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuário / Email" className="bg-background/50 border-border h-9 text-sm" />
                        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" className="bg-background/50 border-border h-9 text-sm" />
                    </div>
                    <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (https://...)" className="bg-background/50 border-border h-9 text-sm" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-background/50 border border-border rounded-md h-9 text-sm px-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/50"
                        >
                            <option value="geral">Geral</option>
                            <option value="hosting">Hosting</option>
                            <option value="api">API</option>
                            <option value="database">Database</option>
                            <option value="email">Email</option>
                            <option value="social">Social</option>
                            <option value="dominio">Domínio</option>
                            <option value="servidor">Servidor</option>
                            <option value="outro">Outro</option>
                        </select>
                        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações..." className="bg-background/50 border-border h-9 text-sm" />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <Button onClick={handleAdd} size="sm" className="gradient-teal text-primary-foreground hover:opacity-90" disabled={createCred.isPending}>
                            {createCred.isPending ? 'Salvando...' : 'Adicionar'}
                        </Button>
                        <Button onClick={() => setAdding(false)} size="sm" variant="outline" className="border-border">
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {/* Cards Grid */}
            {(filtered?.length ?? 0) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered!.map((cred) => (
                        <CredentialCard
                            key={cred.id}
                            credential={cred}
                            onUpdate={(data) =>
                                updateCred.mutate({
                                    ...data,
                                    id: data.id,
                                    project_id: projectId,
                                } as any)
                            }
                            onDelete={(id) => deleteCred.mutate({ id, project_id: projectId })}
                        />
                    ))}
                </div>
            ) : !adding ? (
                <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl bg-card/20">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-8 h-8 text-primary/50" />
                    </div>
                    <p className="text-muted-foreground text-sm">Nenhuma credencial neste projeto ainda.</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Clique em "Nova Credencial" para adicionar.</p>
                </div>
            ) : null}
        </div>
    );
}
