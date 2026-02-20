import { useState } from 'react';
import { Task } from '@/types/project';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, ChevronRight, ChevronLeft, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

type ColStatus = Task['status'];

const COLUMNS: { status: ColStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'A Fazer', color: 'text-muted-foreground' },
  { status: 'in_progress', label: 'Em Andamento', color: 'text-sky-400' },
  { status: 'done', label: 'Concluído', color: 'text-primary' },
];

function TaskCard({
  task,
  isFirst,
  isLast,
  onMove,
}: {
  task: Task;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: 'prev' | 'next') => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description ?? '');
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const save = async () => {
    if (!title.trim()) return;
    await updateTask.mutateAsync({ id: task.id, project_id: task.project_id, title: title.trim(), description: desc.trim() || null });
    setEditing(false);
  };

  return (
    <div className="bg-background border border-border rounded-xl p-3 space-y-2 group">
      {editing ? (
        <div className="space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-muted/30 border-border h-8 text-sm"
            autoFocus
          />
          <Textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descrição (opcional)"
            rows={2}
            className="bg-muted/30 border-border text-sm resize-none"
          />
          <div className="flex gap-1.5">
            <Button size="sm" onClick={save} className="h-7 text-xs gradient-teal text-primary-foreground hover:opacity-90">
              <Check className="w-3 h-3 mr-1" /> Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 text-xs border border-border">
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground leading-snug">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground">{task.description}</p>
          )}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onMove('prev')}
                disabled={isFirst}
                className="h-6 w-6 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onMove('next')}
                disabled={isLast}
                className="h-6 w-6 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditing(true)}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteTask.mutate({ id: task.id, project_id: task.project_id })}
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AddTaskForm({ projectId, status, onDone }: { projectId: string; status: ColStatus; onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const createTask = useCreateTask();

  const submit = async () => {
    if (!title.trim()) { toast.error('Digite um título.'); return; }
    await createTask.mutateAsync({ project_id: projectId, title: title.trim(), description: desc.trim() || null, status, order: 0 });
    setTitle('');
    setDesc('');
    onDone();
  };

  return (
    <div className="space-y-2 bg-background border border-primary/30 rounded-xl p-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da tarefa *"
        className="bg-muted/30 border-border h-8 text-sm"
        autoFocus
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <Textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Descrição (opcional)"
        rows={2}
        className="bg-muted/30 border-border text-sm resize-none"
      />
      <div className="flex gap-1.5">
        <Button size="sm" onClick={submit} disabled={createTask.isPending} className="h-7 text-xs gradient-teal text-primary-foreground hover:opacity-90">
          Adicionar
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone} className="h-7 text-xs border border-border">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export function TaskBoard({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const updateTask = useUpdateTask();
  const [addingIn, setAddingIn] = useState<ColStatus | null>(null);

  const STATUS_ORDER: ColStatus[] = ['todo', 'in_progress', 'done'];

  const moveTask = async (task: Task, direction: 'prev' | 'next') => {
    const currentIdx = STATUS_ORDER.indexOf(task.status);
    const nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx < 0 || nextIdx >= STATUS_ORDER.length) return;
    await updateTask.mutateAsync({ id: task.id, project_id: task.project_id, status: STATUS_ORDER[nextIdx] });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = (tasks ?? []).filter((t) => t.status === col.status);
        const colIdx = STATUS_ORDER.indexOf(col.status);
        return (
          <div key={col.status} className="bg-card border border-border rounded-2xl p-4 space-y-3 min-h-[200px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{colTasks.length}</span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setAddingIn(col.status)}
                className="h-6 w-6 text-muted-foreground hover:text-primary"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {addingIn === col.status && (
              <AddTaskForm projectId={projectId} status={col.status} onDone={() => setAddingIn(null)} />
            )}

            <div className="space-y-2">
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isFirst={colIdx === 0}
                  isLast={colIdx === STATUS_ORDER.length - 1}
                  onMove={(dir) => moveTask(task, dir)}
                />
              ))}
            </div>

            {colTasks.length === 0 && addingIn !== col.status && (
              <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border/50 rounded-xl">
                Nenhuma tarefa
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
