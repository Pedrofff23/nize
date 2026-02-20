import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectModule } from '@/types/project';
import { useCreateProject, useUpdateProject, ModuleInput } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, X } from 'lucide-react';
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
