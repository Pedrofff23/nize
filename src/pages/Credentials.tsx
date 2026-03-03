import { useState } from 'react';
import { Plus, KeyRound, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AppBreadcrumb } from '@/components/AppBreadcrumb';
import { CredentialCard } from '@/components/modules/CredentialCard';
import {
    useCredentials,
    useCreateCredential,
    useUpdateCredential,
    useDeleteCredential,
} from '@/hooks/useCredentials';

const CATEGORIES = [
    { value: 'todas', label: 'Todas' },
    { value: 'geral', label: 'Geral' },
    { value: 'hosting', label: 'Hosting' },
    { value: 'api', label: 'API' },
    { value: 'database', label: 'Database' },
    { value: 'email', label: 'Email' },
    { value: 'social', label: 'Social' },
    { value: 'dominio', label: 'Domínio' },
    { value: 'servidor', label: 'Servidor' },
    { value: 'outro', label: 'Outro' },
];

export default function Credentials() {
    const { data: credentials, isLoading } = useCredentials();
    const createCred = useCreateCredential();
    const updateCred = useUpdateCredential();
    const deleteCred = useDeleteCredential();

    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('todas');
    const [adding, setAdding] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [category, setCategory] = useState('geral');

    const handleAdd = async () => {
        if (!title.trim()) return;
        await createCred.mutateAsync({
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

    const filtered = credentials?.filter((c) => {
        const matchesSearch =
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.username?.toLowerCase().includes(search.toLowerCase()) ||
            c.url?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === 'todas' || c.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Conta por categoria
    const categoryCounts = credentials?.reduce<Record<string, number>>((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <AppBreadcrumb items={[{ label: 'Credenciais' }]} />

            {/* Hero Header */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl gradient-teal flex items-center justify-center shadow-lg shadow-primary/20">
                            <Shield className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Central de Credenciais</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Gerencie suas senhas e acessos pessoais de forma segura
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setAdding(true)}
                        className="gradient-teal text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Nova Credencial
                    </Button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-3 mt-5">
                    <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl px-4 py-2 text-center min-w-[100px]">
                        <p className="text-lg font-bold text-foreground">{credentials?.length ?? 0}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                    </div>
                    {categoryCounts && Object.entries(categoryCounts).map(([cat, count]) => (
                        <div
                            key={cat}
                            onClick={() => setFilterCategory(cat === filterCategory ? 'todas' : cat)}
                            className={`bg-black/20 backdrop-blur-sm border rounded-xl px-4 py-2 text-center min-w-[80px] cursor-pointer transition-all hover:border-primary/30 ${filterCategory === cat ? 'border-primary/50 bg-primary/10' : 'border-white/5'
                                }`}
                        >
                            <p className="text-lg font-bold text-foreground">{count}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground capitalize">{cat}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por título, usuário ou URL..."
                        className="bg-card/50 border-border pl-10 h-11 rounded-xl"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.slice(0, 5).map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setFilterCategory(cat.value)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filterCategory === cat.value
                                    ? 'gradient-teal text-primary-foreground shadow-md'
                                    : 'bg-card/50 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-44 rounded-2xl" />
                    ))}
                </div>
            )}

            {/* New Credential Form */}
            {adding && (
                <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-2xl p-6 space-y-4 shadow-lg shadow-primary/5">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-primary" /> Nova Credencial
                    </h3>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título * (ex: Vercel, AWS, Gmail...)"
                        className="bg-background/50 border-border h-10 font-medium"
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
                            {CATEGORIES.filter(c => c.value !== 'todas').map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações..." className="bg-background/50 border-border h-9 text-sm" />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <Button onClick={handleAdd} className="gradient-teal text-primary-foreground hover:opacity-90" disabled={createCred.isPending}>
                            {createCred.isPending ? 'Salvando...' : 'Salvar Credencial'}
                        </Button>
                        <Button onClick={() => setAdding(false)} variant="outline" className="border-border">
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {/* Cards Grid */}
            {!isLoading && (filtered?.length ?? 0) > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered!.map((cred) => (
                        <CredentialCard
                            key={cred.id}
                            credential={cred}
                            onUpdate={(data) => updateCred.mutate(data as any)}
                            onDelete={(id) => deleteCred.mutate(id)}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && (filtered?.length ?? 0) === 0 && !adding && (
                <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/20">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                        <Shield className="w-10 h-10 text-primary/40" />
                    </div>
                    <h3 className="text-foreground font-semibold text-lg mb-1">
                        {search || filterCategory !== 'todas' ? 'Nenhuma credencial encontrada' : 'Sem credenciais ainda'}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        {search || filterCategory !== 'todas'
                            ? 'Tente alterar os filtros de busca.'
                            : 'Comece adicionando suas senhas e acessos para gerenciar tudo em um só lugar.'}
                    </p>
                    {!(search || filterCategory !== 'todas') && (
                        <Button
                            onClick={() => setAdding(true)}
                            className="mt-6 gradient-teal text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Adicionar Primeira Credencial
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
