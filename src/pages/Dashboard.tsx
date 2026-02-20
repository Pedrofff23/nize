import { useProjects } from '@/hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, FolderOpen, CalendarDays, DollarSign, Layers, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ElementType; accent?: boolean }) {
  return (
    <Card className={`border-border ${accent ? 'bg-primary/10 border-primary/30' : 'bg-card'}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-bold ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? 'bg-primary/20' : 'bg-muted'}`}>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Visão geral dos seus projetos</p>
        </div>
        <Button
          onClick={() => navigate('/projetos/novo')}
          className="gradient-teal text-primary-foreground font-semibold hover:opacity-90 glow-teal"
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
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Projetos Recentes</h2>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && projects?.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
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
                  className="bg-card border-border hover:border-primary/40 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-primary/5"
                  onClick={() => navigate(`/projetos/${project.id}`)}
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
                        {project.name}
                      </h3>
                      <StatusBadge status={project.status} />
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      {project.deadline && (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>{format(new Date(project.deadline), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span>
                          {(project.price ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span>{moduleCount} módulo{moduleCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {moduleCount > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progresso</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-teal rounded-full transition-all duration-300"
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
    </div>
  );
}
