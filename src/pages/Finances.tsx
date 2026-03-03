import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinances } from '@/hooks/useFinances';
import { Card, CardContent } from '@/components/ui/card';
import { AppBreadcrumb } from '@/components/AppBreadcrumb';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DollarSign, TrendingUp, Repeat, Banknote, User, Building2, ArrowUpRight,
} from 'lucide-react';

function StatCard({ label, value, subtitle, icon: Icon, accent }: { label: string; value: string; subtitle?: string; icon: React.ElementType; accent?: boolean }) {
    return (
        <Card className={`border-border/50 relative overflow-hidden group ${accent ? 'bg-primary/5 border-primary/30 glow-card' : 'bg-card/80 backdrop-blur-md'}`}>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${accent ? 'bg-gradient-to-br from-primary/10 to-transparent' : 'bg-gradient-to-br from-white/5 to-transparent'}`} />
            <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1 font-medium">{label}</p>
                        <p className={`text-2xl font-bold tracking-tight ${accent ? 'text-primary glow-text' : 'text-foreground'}`}>{value}</p>
                        {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${accent ? 'bg-primary/20 shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'bg-muted/50 border border-border/50'}`}>
                        <Icon className={`w-5 h-5 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Finances() {
    const navigate = useNavigate();
    const { summary, projectsList, isLoading } = useFinances();

    const [filterStatus, setFilterStatus] = useState<string>('todos');
    const [filterType, setFilterType] = useState<string>('todos');

    const filtered = projectsList
        .filter((p) => filterStatus === 'todos' || p.status === filterStatus)
        .filter((p) => {
            if (filterType === 'todos') return true;
            if (filterType === 'recorrente') return p.hasRecurring;
            if (filterType === 'pontual') return p.hasOneTime;
            return true;
        });

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <AppBreadcrumb items={[{ label: 'Finanças' }]} />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Finanças</h1>
                <p className="text-muted-foreground text-sm mt-1">Visão geral financeira dos seus projetos</p>
            </div>

            {/* Stats */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Manutenção / mês"
                        value={fmt(summary.recurringMonthly)}
                        subtitle={`${summary.activeRecurringCount} projeto${summary.activeRecurringCount !== 1 ? 's' : ''} com recorrência`}
                        icon={Repeat}
                        accent
                    />
                    <StatCard
                        label="Projeção Anual (Manutenção)"
                        value={fmt(summary.recurringAnnual)}
                        subtitle="Baseado nos projetos ativos"
                        icon={TrendingUp}
                    />
                    <StatCard
                        label="Implementação (Pontual)"
                        value={fmt(summary.totalOneTime)}
                        subtitle={`${summary.totalProjects} projeto${summary.totalProjects !== 1 ? 's' : ''}`}
                        icon={Banknote}
                    />
                    <StatCard
                        label="Receita Total Estimada"
                        value={fmt(summary.totalEstimated)}
                        subtitle="Implementação + Manutenção (12 meses)"
                        icon={DollarSign}
                    />
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40 bg-card/80 backdrop-blur-md border-border/50">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="pausado">Pausado</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48 bg-card/80 backdrop-blur-md border-border/50">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="todos">Todos os Tipos</SelectItem>
                        <SelectItem value="recorrente">Com Manutenção</SelectItem>
                        <SelectItem value="pontual">Com Implementação</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Project Table */}
            {isLoading ? (
                <Skeleton className="h-64 rounded-xl" />
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-2xl">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum projeto encontrado com os filtros selecionados.</p>
                </div>
            ) : (
                <Card className="bg-card/80 backdrop-blur-md border-border/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projeto</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Implementação</th>
                                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manutenção/mês</th>
                                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((project) => {
                                    const clientName = project.client
                                        ? (project.client as any).type === 'pj'
                                            ? ((project.client as any).fantasy_name || (project.client as any).company_name || (project.client as any).name)
                                            : (project.client as any).name
                                        : '—';
                                    const ClientIcon = project.client && (project.client as any).type === 'pj' ? Building2 : User;

                                    return (
                                        <tr
                                            key={project.id}
                                            className="border-b border-border/30 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                            onClick={() => navigate(`/projetos/${project.id}`)}
                                        >
                                            <td className="px-5 py-4">
                                                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                    {project.name}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    {project.client && <ClientIcon className="w-3.5 h-3.5 flex-shrink-0" />}
                                                    <span className="truncate max-w-[150px]">{clientName}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {project.price && project.price > 0 ? (
                                                    <span className="font-semibold text-foreground">{fmt(project.price)}</span>
                                                ) : (
                                                    <span className="text-muted-foreground/50">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {project.monthly_value && project.monthly_value > 0 ? (
                                                    <div>
                                                        <span className="font-semibold text-primary">{fmt(project.monthly_value)}</span>
                                                        <span className="text-[10px] text-muted-foreground block">/mês</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/50">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <StatusBadge status={project.status} />
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-7 h-7 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/projetos/${project.id}`);
                                                    }}
                                                >
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Table footer summary */}
                    <div className="px-5 py-3 border-t border-border/30 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{filtered.length} projeto{filtered.length !== 1 ? 's' : ''}</span>
                        <div className="flex gap-4">
                            <span>
                                Implementação: <span className="font-medium text-foreground">{fmt(filtered.reduce((s, p) => s + (p.price ?? 0), 0))}</span>
                            </span>
                            <span>
                                Manutenção/mês: <span className="font-medium text-primary">{fmt(filtered.reduce((s, p) => s + (p.monthly_value ?? 0), 0))}</span>
                            </span>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
