import { useProjects } from '@/hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { AppBreadcrumb } from '@/components/AppBreadcrumb';
import { Plus, FolderOpen, CalendarDays, DollarSign, Layers, TrendingUp, User, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();

  const total = projects?.length ?? 0;
  const ativos = projects?.filter((p) => p.status === 'ativo').length ?? 0;
  const receita = projects?.reduce((acc, p) => acc + (p.price ?? 0), 0) ?? 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <AppBreadcrumb items={[{ label: 'Projetos' }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Projetos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie e acompanhe seus projetos</p>
        </div>
        <Button
          onClick={() => navigate('/projetos/novo')}
          className="gradient-teal text-primary-foreground font-semibold hover:opacity-90 glow-teal rounded-full px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total de Projetos" value={String(total)} icon={FolderOpen} />
        <StatCard label="Projetos Ativos" value={String(ativos)} icon={TrendingUp} accent />
        <StatCard
          label="Receita Estimada"
          value={receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={DollarSign}
        />
      </div>

      {/* Projects Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && projects?.length === 0 && (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum projeto ainda.</p>
          <Button
            onClick={() => navigate('/projetos/novo')}
            variant="outline"
            className="mt-4 border-primary/40 text-primary hover:bg-primary/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar primeiro projeto
          </Button>
        </div>
      )}

      {!isLoading && projects && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => {
            const moduleCount = project.project_modules?.length ?? 0;
            const doneCount = project.project_modules?.filter((m) => m.status === 'concluido').length ?? 0;
            const progress = moduleCount > 0 ? Math.round((doneCount / moduleCount) * 100) : 0;

            return (
              <Card
                key={project.id}
                className="bg-card/80 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,228,206,0.15)] overflow-hidden relative"
                onClick={() => navigate(`/projetos/${project.id}`)}
              >
                <div className="absolute top-0 left-0 w-full h-1 gradient-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
                      {project.name}
                    </h3>
                    <StatusBadge status={project.status} />
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground/80">
                    {project.client && (
                      <div className="flex items-center gap-2">
                        {(project.client as any).type === 'pf'
                          ? <User className="w-4 h-4 text-sky-400/80 flex-shrink-0" />
                          : <Building2 className="w-4 h-4 text-amber-400/80 flex-shrink-0" />}
                        <span className="truncate">
                          {(project.client as any).type === 'pj'
                            ? ((project.client as any).fantasy_name || (project.client as any).company_name || (project.client as any).name)
                            : (project.client as any).name}
                        </span>
                      </div>
                    )}
                    {project.deadline && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-primary/80 flex-shrink-0" />
                        <span>{format(new Date(project.deadline), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary/80 flex-shrink-0" />
                      <span>{(project.price ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary/80 flex-shrink-0" />
                      <span>{moduleCount} módulo{moduleCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {moduleCount > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-border/30">
                      <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>Progresso</span>
                        <span className="text-foreground">{progress}%</span>
                      </div>
                      <div className="h-2 bg-muted/50 rounded-full overflow-hidden border border-border/20">
                        <div
                          className="h-full gradient-teal rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,228,206,0.5)]"
                          style={{ width: `${progress}%` }}
                        />
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
  );
}
