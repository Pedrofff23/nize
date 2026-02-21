import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppBreadcrumb } from '@/components/AppBreadcrumb';
import { useClient, useDeleteClient } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { ClientForm } from '@/components/ClientForm';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
    User, Building2, Mail, Phone, MapPin, Pencil, Trash2,
    FolderOpen, CalendarDays, DollarSign, Layers,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClientDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: client, isLoading } = useClient(id!);
    const { data: allProjects } = useProjects();
    const deleteClient = useDeleteClient();

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const handleDelete = async () => {
        await deleteClient.mutateAsync(id!);
        navigate('/clientes');
    };

    // Filtrar projetos deste cliente
    const clientProjects = allProjects?.filter((p) => p.client_id === id) ?? [];

    if (isLoading) {
        return (
            <div className="p-6 space-y-4 max-w-5xl mx-auto">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    if (!client) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">Cliente não encontrado.</p>
                <Button onClick={() => navigate('/clientes')} variant="ghost" className="mt-2">Voltar</Button>
            </div>
        );
    }

    const displayName = client.type === 'pj'
        ? (client.fantasy_name || client.company_name || client.name)
        : client.name;

    const InfoRow = ({ label, value }: { label: string; value?: string | null }) => {
        if (!value) return null;
        return (
            <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
                <span className="text-sm text-foreground font-medium">{value}</span>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <AppBreadcrumb items={[
                { label: 'Clientes', href: '/clientes' },
                { label: displayName },
            ]} />

            {/* Client Header */}
            <div className="bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-6 space-y-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${client.type === 'pf' ? 'bg-sky-500/15 border border-sky-500/30' : 'bg-amber-500/15 border border-amber-500/30'}`}>
                            {client.type === 'pf'
                                ? <User className="w-7 h-7 text-sky-400" />
                                : <Building2 className="w-7 h-7 text-amber-400" />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
                            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 ${client.type === 'pf' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                                {client.type === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="border-border hover:border-primary/40">
                            <Pencil className="w-4 h-4 mr-2" /> Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} className="border-destructive/40 text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </Button>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4 pt-2 border-t border-border/30">
                    {client.type === 'pf' && (
                        <>
                            <InfoRow label="CPF" value={client.cpf} />
                            <InfoRow label="RG" value={client.rg} />
                            <InfoRow label="Data de Nascimento" value={client.birth_date ? format(new Date(client.birth_date), 'dd/MM/yyyy', { locale: ptBR }) : null} />
                        </>
                    )}
                    {client.type === 'pj' && (
                        <>
                            <InfoRow label="Razão Social" value={client.company_name} />
                            <InfoRow label="Nome Fantasia" value={client.fantasy_name} />
                            <InfoRow label="CNPJ" value={client.cnpj} />
                            <InfoRow label="Inscrição Estadual" value={client.state_registration} />
                        </>
                    )}
                </div>

                {/* Contato */}
                {(client.email || client.phone || client.whatsapp) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 pt-4 border-t border-border/30">
                        {client.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                <span className="text-sm text-foreground">{client.email}</span>
                            </div>
                        )}
                        {client.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary" />
                                <span className="text-sm text-foreground">{client.phone}</span>
                            </div>
                        )}
                        {client.whatsapp && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-foreground">{client.whatsapp}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Endereço */}
                {(client.street || client.city) && (
                    <div className="flex items-start gap-2 pt-4 border-t border-border/30">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">
                            {[client.street, client.number, client.complement, client.neighborhood, client.city, client.state, client.zip_code].filter(Boolean).join(', ')}
                        </span>
                    </div>
                )}

                {/* Observações */}
                {client.notes && (
                    <div className="pt-4 border-t border-border/30">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Observações</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{client.notes}</p>
                    </div>
                )}
            </div>

            {/* Projetos vinculados */}
            <div className="bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-foreground text-lg">Projetos</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Projetos vinculados a este cliente</p>
                    </div>
                    <Button
                        onClick={() => navigate('/projetos/novo')}
                        variant="outline"
                        size="sm"
                        className="border-primary/40 text-primary hover:bg-primary/10"
                    >
                        <FolderOpen className="w-4 h-4 mr-2" /> Novo Projeto
                    </Button>
                </div>

                {clientProjects.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-10 border border-dashed border-border rounded-xl">
                        Nenhum projeto vinculado a este cliente.
                    </p>
                )}

                {clientProjects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {clientProjects.map((project) => {
                            const moduleCount = project.project_modules?.length ?? 0;
                            const doneCount = project.project_modules?.filter((m) => m.status === 'concluido').length ?? 0;
                            const progress = moduleCount > 0 ? Math.round((doneCount / moduleCount) * 100) : 0;

                            return (
                                <Card
                                    key={project.id}
                                    className="bg-muted/30 border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 overflow-hidden relative"
                                    onClick={() => navigate(`/projetos/${project.id}`)}
                                >
                                    <div className="absolute top-0 left-0 w-full h-0.5 gradient-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate flex-1">
                                                {project.name}
                                            </h3>
                                            <StatusBadge status={project.status} />
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                            {project.deadline && (
                                                <span className="flex items-center gap-1">
                                                    <CalendarDays className="w-3 h-3 text-primary/80" />
                                                    {format(new Date(project.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3 text-primary/80" />
                                                {(project.price ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Layers className="w-3 h-3 text-primary/80" />
                                                {moduleCount} módulo{moduleCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {moduleCount > 0 && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                                                    <span>Progresso</span>
                                                    <span className="text-foreground">{progress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                                    <div className="h-full gradient-teal rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
                    <ClientForm client={client} onSuccess={() => setEditOpen(false)} onCancel={() => setEditOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Esta ação é irreversível. Os projetos vinculados não serão excluídos, apenas desvinculados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
