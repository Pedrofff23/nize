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
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar credenciais..."
                        className="bg-card/40 backdrop-blur-md border border-white/10 dark:border-white/5 pl-10 h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50 transition-all shadow-sm"
                    />
                </div>
            )}

            {/* New Credential Form */}
            {adding && (
                <div className="bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                    <div className="relative z-10 space-y-4">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Título * (ex: Painel Admin, API Gateway...)"
                            className="bg-background/50 border-white/10 dark:border-white/5 h-10 text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg"
                            autoFocus
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuário / Email" className="bg-background/50 border-white/10 dark:border-white/5 h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg" />
                            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" className="bg-background/50 border-white/10 dark:border-white/5 h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg" />
                        </div>
                        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (https://...)" className="bg-background/50 border-white/10 dark:border-white/5 h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-background/50 border border-white/10 dark:border-white/5 rounded-lg h-10 text-sm px-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
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
                            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações..." className="bg-background/50 border-white/10 dark:border-white/5 h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleAdd} size="sm" className="gradient-teal text-primary-foreground hover:opacity-90 shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all rounded-lg font-medium tracking-tight" disabled={createCred.isPending}>
                                {createCred.isPending ? 'Salvando...' : 'Adicionar Credencial'}
                            </Button>
                            <Button onClick={() => setAdding(false)} size="sm" variant="outline" className="border-white/10 dark:border-white/5 hover:bg-white/5 rounded-lg transition-all font-medium">
                                Cancelar
                            </Button>
                        </div>
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
                <div className="text-center py-20 border border-white/5 rounded-2xl bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden transform transition-all hover:scale-[1.01] duration-500">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] opacity-40 pointer-events-none mix-blend-screen" />
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-5 border border-primary/20 shadow-inner relative z-10 transition-transform duration-500 hover:rotate-12">
                        <KeyRound className="w-10 h-10 text-primary/80" />
                    </div>
                    <p className="text-foreground font-bold text-xl tracking-tight relative z-10">Cofre de Credenciais Vazio</p>
                    <p className="text-muted-foreground/80 font-medium text-sm mt-2 relative z-10 max-w-sm mx-auto">
                        Guarde as chaves de acesso, senhas e configurações de banco de dados do seu projeto de forma segura.
                    </p>
                    <Button
                        onClick={() => setAdding(true)}
                        className="mt-6 gradient-teal text-primary-foreground hover:opacity-90 shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-all rounded-xl font-semibold relative z-10"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar a primeira
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
