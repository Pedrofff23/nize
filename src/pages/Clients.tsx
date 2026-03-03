import { useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppBreadcrumb } from '@/components/AppBreadcrumb';
import { ClientForm } from '@/components/ClientForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Plus, Users, Building2, User, Search, Mail, Phone, MapPin,
} from 'lucide-react';

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ElementType; accent?: boolean }) {
    return (
        <Card className={`border-border/50 relative overflow-hidden group ${accent ? 'bg-primary/5 border-primary/30 glow-card' : 'bg-card/80 backdrop-blur-md'}`}>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${accent ? 'bg-gradient-to-br from-primary/10 to-transparent' : 'bg-gradient-to-br from-white/5 to-transparent'}`} />
            <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1 font-medium">{label}</p>
                        <p className={`text-2xl font-bold tracking-tight ${accent ? 'text-primary glow-text' : 'text-foreground'}`}>{value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${accent ? 'bg-primary/20 shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'bg-muted/50 border border-border/50'}`}>
                        <Icon className={`w-5 h-5 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Clients() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const { data: clients, isLoading } = useClients(search);

    const total = clients?.length ?? 0;
    const pf = clients?.filter((c) => c.type === 'pf').length ?? 0;
    const pj = clients?.filter((c) => c.type === 'pj').length ?? 0;

    const getDisplayName = (client: typeof clients extends (infer T)[] | undefined ? NonNullable<T> : never) => {
        if (client.type === 'pj') return client.fantasy_name || client.company_name || client.name;
        return client.name;
    };

    const getDocument = (client: typeof clients extends (infer T)[] | undefined ? NonNullable<T> : never) => {
        return client.type === 'pf' ? client.cpf : client.cnpj;
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <AppBreadcrumb items={[{ label: 'Clientes' }]} />

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground text-sm mt-1">Gerencie sua carteira de clientes</p>
                </div>
                <Button
                    onClick={() => setCreateOpen(true)}
                    className="gradient-teal text-primary-foreground font-semibold hover:opacity-90 glow-teal rounded-full px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Total de Clientes" value={String(total)} icon={Users} accent />
                <StatCard label="Pessoa Física" value={String(pf)} icon={User} />
                <StatCard label="Pessoa Jurídica" value={String(pj)} icon={Building2} />
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nome, CPF, CNPJ, email..."
                    className="pl-11 bg-card/80 backdrop-blur-md border-border/50 h-12 rounded-xl focus:border-primary/50"
                />
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-48 rounded-xl" />
                    ))}
                </div>
            )}

            {/* Empty */}
            {!isLoading && total === 0 && !search && (
                <div className="text-center py-24 border-2 border-dashed border-border/50 rounded-3xl bg-card/30 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.15)] group-hover:scale-110 transition-transform duration-500">
                            <Users className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Nenhum cliente ainda</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">Comece adicionando seu primeiro cliente para gerenciar sua carteira.</p>
                        <Button
                            onClick={() => setCreateOpen(true)}
                            className="gradient-teal text-primary-foreground font-semibold hover:opacity-90 glow-teal rounded-full px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Cadastrar Cliente
                        </Button>
                    </div>
                </div>
            )}

            {!isLoading && total === 0 && search && (
                <div className="text-center py-24 border-2 border-dashed border-border/50 rounded-3xl bg-card/30 backdrop-blur-sm">
                    <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Nenhum resultado</h3>
                    <p className="text-muted-foreground">Nenhum cliente encontrado para "{search}".</p>
                </div>
            )}

            {/* Grid */}
            {!isLoading && clients && clients.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {clients.map((client, i) => (
                        <Card
                            key={client.id}
                            className="bg-card/80 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,228,206,0.15)] overflow-hidden relative animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                            onClick={() => navigate(`/clientes/${client.id}`)}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 gradient-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${client.type === 'pf' ? 'bg-sky-500/15 border border-sky-500/30' : 'bg-amber-500/15 border border-amber-500/30'}`}>
                                            {client.type === 'pf'
                                                ? <User className="w-5 h-5 text-sky-400" />
                                                : <Building2 className="w-5 h-5 text-amber-400" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                {getDisplayName(client)}
                                            </h3>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${client.type === 'pf' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                                                {client.type === 'pf' ? 'PF' : 'PJ'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-sm text-muted-foreground/80">
                                    {getDocument(client) && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-primary/80 font-medium">{client.type === 'pf' ? 'CPF' : 'CNPJ'}:</span>
                                            <span className="text-xs">{getDocument(client)}</span>
                                        </div>
                                    )}
                                    {client.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-primary/80 flex-shrink-0" />
                                            <span className="text-xs truncate">{client.email}</span>
                                        </div>
                                    )}
                                    {(client.phone || client.whatsapp) && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-primary/80 flex-shrink-0" />
                                            <span className="text-xs">{client.whatsapp || client.phone}</span>
                                        </div>
                                    )}
                                    {client.city && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-primary/80 flex-shrink-0" />
                                            <span className="text-xs">{client.city}{client.state ? ` - ${client.state}` : ''}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50 max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-primary/10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Novo Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <ClientForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
