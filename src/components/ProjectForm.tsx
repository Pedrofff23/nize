import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectModule, ProjectToolSlug, AVAILABLE_TOOLS, ALL_TOOL_SLUGS } from '@/types/project';
import { useCreateProject, useUpdateProject, ModuleInput } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, X, User, Building2, Check as CheckIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ProjectFormProps {
  project?: Project & { project_modules?: ProjectModule[] };
  onCancel?: () => void;
}

type ModuleDraft = {
  name: string;
  description: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
};

export function ProjectForm({ project, onCancel }: ProjectFormProps) {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [price, setPrice] = useState(project?.price?.toString() ?? '0');
  const [status, setStatus] = useState<Project['status']>(project?.status ?? 'ativo');
  const [deadline, setDeadline] = useState<Date | undefined>(
    project?.deadline ? new Date(project.deadline) : undefined
  );
  const [modules, setModules] = useState<ModuleDraft[]>(
    project?.project_modules?.map((m) => ({
      name: m.name,
      description: m.description ?? '',
      status: m.status,
    })) ?? []
  );
  const [clientId, setClientId] = useState<string>(project?.client_id ?? '');
  const [enabledTools, setEnabledTools] = useState<ProjectToolSlug[]>(
    project?.enabled_tools ?? [...ALL_TOOL_SLUGS]
  );
  const { data: clientsList } = useClients();

  const toggleTool = (slug: ProjectToolSlug) => {
    setEnabledTools(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const addModule = () => {
    setModules([...modules, { name: '', description: '', status: 'pendente' }]);
  };

  const removeModule = (i: number) => {
    setModules(modules.filter((_, idx) => idx !== i));
  };

  const updateModuleField = (i: number, field: keyof ModuleDraft, value: string) => {
    setModules(modules.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const projectData = {
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price) || 0,
      status,
      deadline: deadline ? format(deadline, 'yyyy-MM-dd') : null,
      client_id: (clientId && clientId !== 'none') ? clientId : null,
      enabled_tools: enabledTools,
    };

    if (project) {
      await updateProject.mutateAsync({ id: project.id, ...projectData });
      onCancel?.();
    } else {
      const mods: ModuleInput[] = modules
        .filter((m) => m.name.trim())
        .map((m, i) => ({
          name: m.name.trim(),
          description: m.description.trim() || null,
          status: m.status,
          order: i,
          project_id: '',
        }));
      const created = await createProject.mutateAsync({ ...projectData, modules: mods });
      navigate(`/projetos/${created.id}`);
    }
  };

  const isLoading = createProject.isPending || updateProject.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label>Nome do Projeto *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Sistema de E-commerce"
            required
            className="bg-muted border-border"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Descrição</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o projeto..."
            rows={3}
            className="bg-muted border-border resize-none"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Cliente</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Selecionar cliente (opcional)" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border max-h-60">
              <SelectItem value="none">Nenhum cliente</SelectItem>
              {clientsList?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    {c.type === 'pf'
                      ? <User className="w-3.5 h-3.5 text-sky-400 inline" />
                      : <Building2 className="w-3.5 h-3.5 text-amber-400 inline" />}
                    {c.type === 'pj' ? (c.fantasy_name || c.company_name || c.name) : c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {clientId && clientId !== 'none' && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setClientId('')}
              className="text-muted-foreground hover:text-foreground text-xs">
              <X className="w-3 h-3 mr-1" /> Remover cliente
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label>Prazo</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal bg-muted border-border',
                  !deadline && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deadline ? format(deadline, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border">
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={setDeadline}
                locale={ptBR}
                className="bg-card"
              />
            </PopoverContent>
          </Popover>
          {deadline && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setDeadline(undefined)}
              className="text-muted-foreground hover:text-foreground text-xs">
              <X className="w-3 h-3 mr-1" /> Remover data
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label>Preço Cobrado (R$)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0,00"
            className="bg-muted border-border"
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as Project['status'])}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="pausado">Pausado</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tool Selection */}
      <div className="space-y-3">
        <div>
          <Label className="text-base">Ferramentas do Projeto</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Selecione quais ferramentas estarão disponíveis neste projeto</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AVAILABLE_TOOLS.map((tool) => {
            const isActive = enabledTools.includes(tool.slug);
            const Icon = tool.icon;
            return (
              <button
                key={tool.slug}
                type="button"
                onClick={() => toggleTool(tool.slug)}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center group',
                  isActive
                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]'
                    : 'border-border bg-muted/30 opacity-60 hover:opacity-80 hover:border-muted-foreground/30'
                )}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                  isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={cn(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}>{tool.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{tool.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modules */}
      {!project && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base">Módulos do Projeto</Label>
            <Button type="button" variant="outline" size="sm" onClick={addModule}
              className="border-primary/40 text-primary hover:bg-primary/10">
              <Plus className="w-4 h-4 mr-1" /> Adicionar Módulo
            </Button>
          </div>

          {modules.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
              Nenhum módulo adicionado. Você também pode adicionar depois.
            </p>
          )}

          <div className="space-y-3">
            {modules.map((mod, i) => (
              <div key={i} className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Módulo {i + 1}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeModule(i)}
                    className="h-6 w-6 ml-auto text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <Input
                  value={mod.name}
                  onChange={(e) => updateModuleField(i, 'name', e.target.value)}
                  placeholder="Nome do módulo"
                  className="bg-background border-border"
                />
                <Input
                  value={mod.description}
                  onChange={(e) => updateModuleField(i, 'description', e.target.value)}
                  placeholder="Descrição (opcional)"
                  className="bg-background border-border"
                />
                <Select
                  value={mod.status}
                  onValueChange={(v) => updateModuleField(i, 'status', v)}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-border">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}
          className="flex-1 gradient-teal text-primary-foreground font-semibold hover:opacity-90">
          {isLoading ? 'Salvando...' : project ? 'Salvar Alterações' : 'Criar Projeto'}
        </Button>
      </div>
    </form>
  );
}
