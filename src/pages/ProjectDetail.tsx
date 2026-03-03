import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AppBreadcrumb } from '@/components/AppBreadcrumb';
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
} from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { ProjectForm } from '@/components/ProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectModule, AVAILABLE_TOOLS, ProjectToolSlug, ProjectTechnology } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TaskBoard } from '@/components/modules/TaskBoard';
import { ProjectAgenda } from '@/components/modules/ProjectAgenda';
import { ProjectBudget } from '@/components/modules/ProjectBudget';
import { ProjectNotes } from '@/components/modules/ProjectNotes';
import { ProjectFlowchart } from '@/components/modules/ProjectFlowchart';
import { ProjectCredentials } from '@/components/modules/ProjectCredentials';
import {
  CalendarDays,
  DollarSign,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Upload,
  FileText,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── ModuleRow ────────────────────────────────────────────────────────────────
function ModuleRow({ module, projectId }: { module: ProjectModule; projectId: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(module.name);
  const [description, setDescription] = useState(module.description ?? '');
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();

  const save = async () => {
    await updateModule.mutateAsync({ id: module.id, project_id: projectId, name, description: description || null });
    setEditing(false);
  };

  const cycleStatus = async () => {
    const next: Record<ProjectModule['status'], ProjectModule['status']> = {
      pendente: 'em_andamento',
      em_andamento: 'concluido',
      concluido: 'pendente',
    };
    await updateModule.mutateAsync({ id: module.id, project_id: projectId, status: next[module.status] });
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-muted/30 border border-border rounded-xl">
      <button
        onClick={cycleStatus}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${module.status === 'concluido' ? 'bg-primary border-primary' : module.status === 'em_andamento' ? 'border-sky-400' : 'border-muted-foreground/40'
          }`}
        title="Clique para mudar status"
      >
        {module.status === 'concluido' && <Check className="w-3 h-3 text-primary-foreground m-auto" />}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-background border-border h-8 text-sm" />
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" className="bg-background border-border h-8 text-sm" />
          </div>
        ) : (
          <>
            <p className={`text-sm font-medium ${module.status === 'concluido' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{module.name}</p>
            {module.description && <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>}
          </>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <StatusBadge status={module.status} />
        {editing ? (
          <>
            <Button size="icon" variant="ghost" onClick={save} className="h-7 w-7 text-primary hover:bg-primary/10"><Check className="w-3.5 h-3.5" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setEditing(false)} className="h-7 w-7"><X className="w-3.5 h-3.5" /></Button>
          </>
        ) : (
          <>
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)} className="h-7 w-7 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></Button>
            <Button size="icon" variant="ghost" onClick={() => deleteModule.mutate({ id: module.id, project_id: projectId })} className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── FileSection ──────────────────────────────────────────────────────────────
function FileSection({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<{ name: string; path: string; size?: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    const { data } = await supabase.storage.from('project-files').list(projectId);
    setFiles(data?.map((f) => ({ name: f.name, path: `${projectId}/${f.name}`, size: f.metadata?.size })) ?? []);
    setLoading(false);
  };

  useState(() => { loadFiles(); });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${projectId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('project-files').upload(path, file);
    if (error) toast.error('Erro ao fazer upload.');
    else { toast.success('Arquivo enviado!'); await loadFiles(); }
    setUploading(false);
    e.target.value = '';
  };

  const handleDownload = async (path: string, name: string) => {
    const { data } = await supabase.storage.from('project-files').download(path);
    if (!data) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (path: string) => {
    const { error } = await supabase.storage.from('project-files').remove([path]);
    if (error) toast.error('Erro ao remover arquivo.');
    else { toast.success('Arquivo removido.'); await loadFiles(); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Arquivos Anexados</h3>
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          <Button asChild variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10">
            <span><Upload className="w-4 h-4 mr-2" />{uploading ? 'Enviando...' : 'Upload'}</span>
          </Button>
        </label>
      </div>
      {loading && <Skeleton className="h-16 rounded-lg" />}
      {!loading && files.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10 border border-dashed border-border rounded-xl">Nenhum arquivo anexado.</p>
      )}
      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.path} className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg">
            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground flex-1 truncate">{file.name}</span>
            <Button size="icon" variant="ghost" onClick={() => handleDownload(file.path, file.name)} className="h-7 w-7 text-muted-foreground hover:text-primary"><Download className="w-3.5 h-3.5" /></Button>
            <Button size="icon" variant="ghost" onClick={() => handleDelete(file.path)} className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: project, isLoading } = useProject(id!);
  const deleteProject = useDeleteProject();
  const createModule = useCreateModule();

  const tabFromUrl = searchParams.get('tab') || 'tasks';
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  // Map tool slugs to their tab content components
  const toolTabContent: Record<ProjectToolSlug, (id: string) => React.ReactNode> = {
    tasks: (id) => <TaskBoard projectId={id} />,
    agenda: (id) => <ProjectAgenda projectId={id} />,
    budget: (id) => <ProjectBudget projectId={id} />,
    files: (id) => (
      <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
        <FileSection projectId={id} />
      </div>
    ),
    notes: (id) => <ProjectNotes projectId={id} />,
    flowchart: (id) => <ProjectFlowchart projectId={id} />,
    credentials: (id) => (
      <div className="bg-card border border-border rounded-2xl p-6">
        <ProjectCredentials projectId={id} />
      </div>
    ),
  };

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [addingModule, setAddingModule] = useState(false);
  const [newModName, setNewModName] = useState('');
  const [newModDesc, setNewModDesc] = useState('');
  const [newModStatus, setNewModStatus] = useState<ProjectModule['status']>('pendente');

  const handleDelete = async () => {
    await deleteProject.mutateAsync(id!);
    navigate('/');
  };

  const handleAddModule = async () => {
    if (!newModName.trim()) return;
    await createModule.mutateAsync({
      project_id: id!,
      name: newModName.trim(),
      description: newModDesc.trim() || null,
      status: newModStatus,
      order: project?.project_modules?.length ?? 0,
    });
    setNewModName('');
    setNewModDesc('');
    setNewModStatus('pendente');
    setAddingModule(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
        <Skeleton className="h-6 w-48" />
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-72 lg:w-80 space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="flex-1 h-[600px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-bold text-foreground mb-2">Projeto não encontrado</h2>
        <p className="text-muted-foreground mb-6">O projeto que você está procurando não existe ou foi excluído.</p>
        <Button onClick={() => navigate('/')} variant="default" className="shadow-lg hover:shadow-xl transition-all">Voltar para o Início</Button>
      </div>
    );
  }

  const modules = [...(project.project_modules ?? [])].sort((a, b) => a.order - b.order);
  const doneCount = modules.filter((m) => m.status === 'concluido').length;
  const progress = modules.length > 0 ? Math.round((doneCount / modules.length) * 100) : 0;

  // Filter the available tools to only show enabled ones
  const enabledTools = project.enabled_tools ?? AVAILABLE_TOOLS.map(t => t.slug);
  const enabledToolDefs = AVAILABLE_TOOLS.filter(t => enabledTools.includes(t.slug));
  const defaultTab = enabledToolDefs.length > 0 ? enabledToolDefs[0].slug : 'tasks';
  const activeTab = enabledTools.includes(tabFromUrl as ProjectToolSlug) ? tabFromUrl : defaultTab;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 w-full max-w-[1600px] mx-auto bg-background/50 min-h-screen">
      {/* Breadcrumb row */}
      <div className="flex items-center justify-between pb-2">
        <AppBreadcrumb items={[
          { label: 'Projetos', href: '/' },
          { label: project.name },
        ]} />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Project Identity & Modules Menu */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-6 sticky top-6">

          {/* Project Details Card */}
          <div className="bg-gradient-to-br from-card to-card/50 border border-border/60 rounded-2xl p-5 shadow-sm backdrop-blur-md relative overflow-hidden group">
            {/* Background blur decorative element */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h1 className="text-xl font-bold leading-tight text-foreground">{project.name}</h1>
                  <StatusBadge status={project.status} size="sm" />
                </div>
                <Button size="icon" variant="ghost" onClick={() => setEditOpen(true)} className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>

              {project.description && (
                <p className="text-sm text-muted-foreground/90 leading-relaxed font-medium">
                  {project.description}
                </p>
              )}

              <div className="space-y-2.5 pt-2 border-t border-border/50">
                {project.deadline && (
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span>{format(new Date(project.deadline), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <span className="font-semibold">{(project.price ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>

              {/* Technologies */}
              {(project as any).project_technologies && (project as any).project_technologies.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {(project as any).project_technologies.map((pt: ProjectTechnology) => (
                    <span
                      key={pt.id}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold text-white shadow-sm"
                      style={{ backgroundColor: pt.technologies?.color ?? '#6366f1' }}
                    >
                      {pt.technologies?.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Progress */}
              {modules.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-border/50">
                  <div className="flex justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Progresso ({doneCount}/{modules.length})</span>
                    <span className={progress === 100 ? 'text-primary font-bold' : ''}>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden shadow-inner flex">
                    <div className="h-full bg-primary rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modules Menu Tab List */}
          <div className="bg-card/50 border border-border/50 rounded-2xl p-3 shadow-sm backdrop-blur-md">
            <h3 className="text-xs font-bold text-muted-foreground mb-3 px-3 uppercase tracking-widest">
              Módulos e Ferramentas
            </h3>
            <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1.5 border-none">
              {enabledToolDefs.map((tool) => (
                <TabsTrigger
                  key={tool.slug}
                  value={tool.slug}
                  className="w-full justify-start text-left px-4 py-3 h-auto text-[14px] font-medium rounded-xl border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:bg-muted/60 transition-all shadow-none outline-none group"
                >
                  <div className="flex items-center gap-3">
                    <tool.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    {tool.name}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-4 px-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)} className="w-full justify-start text-destructive/80 hover:text-destructive hover:bg-destructive/10 text-xs font-medium h-9 rounded-xl">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir Projeto
              </Button>
            </div>
          </div>

        </div>

        {/* Right Column: Tab Content */}
        <div className="flex-1 w-full min-w-0 bg-background/30 rounded-3xl">
          {enabledToolDefs.map((tool) => (
            <TabsContent
              key={tool.slug}
              value={tool.slug}
              className="m-0 border-none p-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in zoom-in-95 duration-300"
            >
              {toolTabContent[tool.slug](id!)}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Projeto</DialogTitle></DialogHeader>
          <ProjectForm project={project} onCancel={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={(open) => {
        setDeleteOpen(open);
        if (!open) setConfirmName('');
      }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Aviso: Exclusão em Cascata
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground space-y-3">
              <p>Esta ação é <strong>irreversível</strong>.</p>
              <p>
                A exclusão deste projeto apagará definitivamente todos os seus dados vinculados, incluindo
                <strong> tarefas, colunas, módulos, eventos, notas, finanças, fluxogramas e todos os arquivos armazenados.</strong>
              </p>
              <div className="pt-3">
                <label className="text-sm font-medium text-foreground">
                  Para confirmar, digite <span className="font-bold select-all text-primary">{project.name}</span>:
                </label>
                <Input
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  className="mt-2"
                  placeholder="Nome do projeto"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="border-border rounded-xl">Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmName.trim() !== project.name.trim()}
              className="rounded-xl shadow-lg shadow-destructive/20"
            >
              Excluir Projeto Definitivamente
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
