import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectModule, ProjectToolSlug, AVAILABLE_TOOLS, ALL_TOOL_SLUGS, Technology, ProjectTechnology, Tag, ProjectTag } from '@/types/project';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { useTechnologies, useAddProjectTechnology, useRemoveProjectTechnology } from '@/hooks/useTechnologies';
import { useTags, useAddProjectTag, useRemoveProjectTag } from '@/hooks/useTags';
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
  project?: Project & { project_modules?: ProjectModule[]; project_technologies?: ProjectTechnology[]; project_tags?: ProjectTag[] };
  onCancel?: () => void;
}



export function ProjectForm({ project, onCancel }: ProjectFormProps) {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [price, setPrice] = useState(project?.price?.toString() ?? '0');
  const [monthlyValue, setMonthlyValue] = useState(project?.monthly_value?.toString() ?? '');
  const [status, setStatus] = useState<Project['status']>(project?.status ?? 'ativo');
  const [deadline, setDeadline] = useState<Date | undefined>(
    project?.deadline ? new Date(project.deadline) : undefined
  );
  const [clientId, setClientId] = useState<string>(project?.client_id ?? '');
  const [enabledTools, setEnabledTools] = useState<ProjectToolSlug[]>(
    project?.enabled_tools ?? [...ALL_TOOL_SLUGS]
  );
  const { data: clientsList } = useClients();
  const { data: allTechnologies } = useTechnologies();
  const addProjectTech = useAddProjectTechnology();
  const removeProjectTech = useRemoveProjectTechnology();
  const { data: allTags } = useTags();
  const addProjectTag = useAddProjectTag();
  const removeProjectTag = useRemoveProjectTag();

  // Technologies state
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>(
    project?.project_technologies?.map(pt => pt.technology_id) ?? []
  );
  const [techSearch, setTechSearch] = useState('');
  const [showTechDropdown, setShowTechDropdown] = useState(false);

  // Tags state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    project?.project_tags?.map(pt => pt.tag_id) ?? []
  );
  const [tagSearch, setTagSearch] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const filteredTechs = (allTechnologies ?? []).filter(
    t => !selectedTechIds.includes(t.id) && t.name.toLowerCase().includes(techSearch.toLowerCase())
  );

  const filteredTags = (allTags ?? []).filter(
    t => !selectedTagIds.includes(t.id) && t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const selectedTechs = (allTechnologies ?? []).filter(t => selectedTechIds.includes(t.id));
  const selectedTags = (allTags ?? []).filter(t => selectedTagIds.includes(t.id));

  const handleAddTech = (techId: string) => {
    setSelectedTechIds(prev => [...prev, techId]);
    setTechSearch('');
    setShowTechDropdown(false);
  };

  const handleRemoveTech = (techId: string) => {
    setSelectedTechIds(prev => prev.filter(id => id !== techId));
  };

  const handleAddTag = (tagId: string) => {
    setSelectedTagIds(prev => [...prev, tagId]);
    setTagSearch('');
    setShowTagDropdown(false);
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTagIds(prev => prev.filter(id => id !== tagId));
  };

  const toggleTool = (slug: ProjectToolSlug) => {
    setEnabledTools(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const projectData = {
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price) || 0,
      monthly_value: monthlyValue.trim() ? parseFloat(monthlyValue) : null,
      status,
      deadline: deadline ? format(deadline, 'yyyy-MM-dd') : null,
      client_id: (clientId && clientId !== 'none') ? clientId : null,
      enabled_tools: enabledTools,
    };

    if (project) {
      await updateProject.mutateAsync({ id: project.id, ...projectData });
      // Sync technologies
      const existingTechIds = project.project_technologies?.map(pt => pt.technology_id) ?? [];
      const toRemoveTech = existingTechIds.filter(id => !selectedTechIds.includes(id));
      const toAddTech = selectedTechIds.filter(id => !existingTechIds.includes(id));
      // Sync tags
      const existingTagIds = project.project_tags?.map(pt => pt.tag_id) ?? [];
      const toRemoveTag = existingTagIds.filter(id => !selectedTagIds.includes(id));
      const toAddTag = selectedTagIds.filter(id => !existingTagIds.includes(id));
      await Promise.all([
        ...toRemoveTech.map(tid => removeProjectTech.mutateAsync({ project_id: project.id, technology_id: tid })),
        ...toAddTech.map(tid => addProjectTech.mutateAsync({ project_id: project.id, technology_id: tid })),
        ...toRemoveTag.map(tid => removeProjectTag.mutateAsync({ project_id: project.id, tag_id: tid })),
        ...toAddTag.map(tid => addProjectTag.mutateAsync({ project_id: project.id, tag_id: tid })),
      ]);
      onCancel?.();
    } else {
      const created = await createProject.mutateAsync({ ...projectData, modules: [] });
      // Link technologies and tags to the new project
      await Promise.all([
        ...selectedTechIds.map(tid => addProjectTech.mutateAsync({ project_id: created.id, technology_id: tid })),
        ...selectedTagIds.map(tid => addProjectTag.mutateAsync({ project_id: created.id, tag_id: tid })),
      ]);
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
          <Label>Valor Mensal Recorrente (R$)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={monthlyValue}
            onChange={(e) => setMonthlyValue(e.target.value)}
            placeholder="Opcional"
            className="bg-muted border-border"
          />
          <p className="text-[10px] text-muted-foreground">Preencha se o projeto tem cobrança mensal recorrente</p>
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

      {/* Technologies */}
      <div className="space-y-3">
        <div>
          <Label className="text-base">Tecnologias</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Selecione as tecnologias utilizadas neste projeto</p>
        </div>

        {selectedTechs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTechs.map(tech => (
              <span
                key={tech.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white transition-all hover:opacity-80"
                style={{ backgroundColor: tech.color }}
              >
                {tech.name}
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech.id)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <Input
            value={techSearch}
            onChange={(e) => {
              setTechSearch(e.target.value);
              setShowTechDropdown(true);
            }}
            onFocus={() => setShowTechDropdown(true)}
            onBlur={() => setTimeout(() => setShowTechDropdown(false), 200)}
            placeholder="Buscar tecnologia..."
            className="bg-muted border-border"
          />
          {showTechDropdown && (techSearch || filteredTechs.length > 0) && (
            <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredTechs.length > 0 ? (
                filteredTechs.map(tech => (
                  <button
                    key={tech.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleAddTech(tech.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tech.color }} />
                    {tech.name}
                  </button>
                ))
              ) : techSearch.trim() ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Nenhuma tecnologia encontrada. Crie em Configurações.
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <div>
          <Label className="text-base">Tags</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Selecione as tags para categorizar este projeto</p>
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white transition-all hover:opacity-80"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <Input
            value={tagSearch}
            onChange={(e) => {
              setTagSearch(e.target.value);
              setShowTagDropdown(true);
            }}
            onFocus={() => setShowTagDropdown(true)}
            onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
            placeholder="Buscar tag..."
            className="bg-muted border-border"
          />
          {showTagDropdown && (tagSearch || filteredTags.length > 0) && (
            <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredTags.length > 0 ? (
                filteredTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleAddTag(tag.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </button>
                ))
              ) : tagSearch.trim() ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Nenhuma tag encontrada. Crie em Configurações.
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>


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
