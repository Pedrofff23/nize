import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { ProjectModule } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ArrowLeft,
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

function ModuleRow({ module, projectId }: { module: ProjectModule; projectId: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(module.name);
  const [description, setDescription] = useState(module.description ?? '');
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();

  const save = async () => {
    await updateModule.mutateAsync({
      id: module.id,
      project_id: projectId,
      name,
      description: description || null,
    });
    setEditing(false);
  };

  const cycleStatus = async () => {
    const next: Record<ProjectModule['status'], ProjectModule['status']> = {
      pendente: 'em_andamento',
      em_andamento: 'concluido',
      concluido: 'pendente',
    };
    await updateModule.mutateAsync({
      id: module.id,
      project_id: projectId,
      status: next[module.status],
    });
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-muted/30 border border-border rounded-xl">
      <button
        onClick={cycleStatus}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
          module.status === 'concluido'
            ? 'bg-primary border-primary'
            : module.status === 'em_andamento'
            ? 'border-sky-400'
            : 'border-muted-foreground/40'
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
            <p className={`text-sm font-medium ${module.status === 'concluido' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {module.name}
            </p>
            {module.description && <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>}
          </>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <StatusBadge status={module.status} />
        {editing ? (
          <>
            <Button size="icon" variant="ghost" onClick={save} className="h-7 w-7 text-primary hover:bg-primary/10">
              <Check className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setEditing(false)} className="h-7 w-7">
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <>
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)} className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => deleteModule.mutate({ id: module.id, project_id: projectId })}
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

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

  useState(() => {
    loadFiles();
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${projectId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('project-files').upload(path, file);
    if (error) toast.error('Erro ao fazer upload.');
    else {
      toast.success('Arquivo enviado!');
      await loadFiles();
    }
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
    else {
      toast.success('Arquivo removido.');
      await loadFiles();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Arquivos</h3>
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          <Button asChild variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10">
            <span>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Enviando...' : 'Upload'}
            </span>
          </Button>
        </label>
      </div>

      {loading && <Skeleton className="h-16 rounded-lg" />}

      {!loading && files.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
          Nenhum arquivo anexado.
        </p>
      )}

      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.path} className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg">
            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground flex-1 truncate">{file.name}</span>
            <Button size="icon" variant="ghost" onClick={() => handleDownload(file.path, file.name)}
              className="h-7 w-7 text-muted-foreground hover:text-primary">
              <Download className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => handleDelete(file.path)}
              className="h-7 w-7 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(id!);
  const deleteProject = useDeleteProject();
  const createModule = useCreateModule();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
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
    const nextOrder = (project?.project_modules?.length ?? 0);
    await createModule.mutateAsync({
      project_id: id!,
      name: newModName.trim(),
      description: newModDesc.trim() || null,
      status: newModStatus,
      order: nextOrder,
    });
    setNewModName('');
    setNewModDesc('');
    setNewModStatus('pendente');
    setAddingModule(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Button onClick={() => navigate('/')} variant="ghost" className="mt-2">Voltar</Button>
      </div>
    );
  }

  const modules = [...(project.project_modules ?? [])].sort((a, b) => a.order - b.order);
  const doneCount = modules.filter((m) => m.status === 'concluido').length;
  const progress = modules.length > 0 ? Math.round((doneCount / modules.length) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/')}
        className="text-muted-foreground hover:text-foreground -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      {/* Project Header */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <StatusBadge status={project.status} size="md" />
            </div>
            {project.description && (
              <p className="text-muted-foreground text-sm mt-2">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}
              className="border-border hover:border-primary/40">
              <Pencil className="w-4 h-4 mr-2" /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}
              className="border-destructive/40 text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {project.deadline && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="w-4 h-4 text-primary" />
              Prazo: <span className="text-foreground font-medium">
                {format(new Date(project.deadline), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4 text-primary" />
            Valor: <span className="text-foreground font-medium">
              {(project.price ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        {modules.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{doneCount}/{modules.length} módulos concluídos</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full gradient-teal rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Modules */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground text-lg">Módulos</h2>
          <Button variant="outline" size="sm" onClick={() => setAddingModule(true)}
            className="border-primary/40 text-primary hover:bg-primary/10">
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </div>

        {addingModule && (
          <div className="bg-muted/30 border border-primary/30 rounded-xl p-4 space-y-3">
            <Input value={newModName} onChange={(e) => setNewModName(e.target.value)}
              placeholder="Nome do módulo *" className="bg-background border-border" />
            <Textarea value={newModDesc} onChange={(e) => setNewModDesc(e.target.value)}
              placeholder="Descrição (opcional)" rows={2} className="bg-background border-border resize-none" />
            <Select value={newModStatus} onValueChange={(v) => setNewModStatus(v as ProjectModule['status'])}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleAddModule} size="sm" className="gradient-teal text-primary-foreground hover:opacity-90">
                Adicionar
              </Button>
              <Button onClick={() => setAddingModule(false)} size="sm" variant="outline" className="border-border">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {modules.length === 0 && !addingModule && (
          <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
            Nenhum módulo ainda.
          </p>
        )}

        <div className="space-y-2">
          {modules.map((m) => (
            <ModuleRow key={m.id} module={m} projectId={id!} />
          ))}
        </div>
      </div>

      {/* Files */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <FileSection projectId={id!} />
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
          </DialogHeader>
          <ProjectForm project={project} onCancel={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação é irreversível. Todos os módulos e arquivos serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
