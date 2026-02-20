import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/project';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Pencil, Check, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

type ColStatus = Task['status'];

const COLUMNS: { status: ColStatus; label: string; accent: string; bg: string }[] = [
  { status: 'todo',        label: 'A Fazer',      accent: 'text-muted-foreground', bg: 'bg-muted/20' },
  { status: 'in_progress', label: 'Em Andamento',  accent: 'text-sky-400',          bg: 'bg-sky-400/5' },
  { status: 'done',        label: 'Concluído',     accent: 'text-primary',           bg: 'bg-primary/5' },
];

// ─── DraggableCard ────────────────────────────────────────────────────────────
function DraggableCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description ?? '');
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }
    : undefined;

  const save = async () => {
    if (!title.trim()) return;
    await updateTask.mutateAsync({ id: task.id, project_id: task.project_id, title: title.trim(), description: desc.trim() || null });
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-background border border-border rounded-xl p-3 space-y-2 group select-none"
    >
      {editing ? (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-muted/30 border-border h-8 text-sm" autoFocus />
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (opcional)" rows={2} className="bg-muted/30 border-border text-sm resize-none" />
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
          <div className="flex items-start gap-2">
            {/* Drag handle */}
            <button
              {...listeners}
              {...attributes}
              className="mt-0.5 flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium text-foreground leading-snug ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </p>
              {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
            </div>
          </div>
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)} className="h-6 w-6 text-muted-foreground hover:text-foreground">
              <Pencil className="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => deleteTask.mutate({ id: task.id, project_id: task.project_id })} className="h-6 w-6 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Overlay card (shown while dragging) ─────────────────────────────────────
function OverlayCard({ task }: { task: Task }) {
  return (
    <div className="bg-background border border-primary/40 shadow-lg shadow-primary/10 rounded-xl p-3 rotate-2 cursor-grabbing">
      <p className="text-sm font-medium text-foreground">{task.title}</p>
      {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
    </div>
  );
}

// ─── DroppableColumn ─────────────────────────────────────────────────────────
function DroppableColumn({
  col,
  tasks,
  isOver,
  projectId,
}: {
  col: typeof COLUMNS[number];
  tasks: Task[];
  isOver: boolean;
  projectId: string;
}) {
  const { setNodeRef } = useDroppable({ id: col.status });
  const [addingHere, setAddingHere] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const createTask = useCreateTask();

  const submit = async () => {
    if (!title.trim()) { toast.error('Digite um título.'); return; }
    await createTask.mutateAsync({ project_id: projectId, title: title.trim(), description: desc.trim() || null, status: col.status, order: tasks.length });
    setTitle('');
    setDesc('');
    setAddingHere(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl border transition-colors duration-150 min-h-[240px] ${
        isOver ? 'border-primary/60 bg-primary/5' : `border-border ${col.bg}`
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-semibold ${col.accent}`}>{col.label}</h3>
          <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{tasks.length}</span>
        </div>
        <Button size="icon" variant="ghost" onClick={() => setAddingHere(true)} className="h-6 w-6 text-muted-foreground hover:text-primary">
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Add form */}
      {addingHere && (
        <div className="mx-3 mb-3 space-y-2 bg-background border border-primary/30 rounded-xl p-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título *" className="bg-muted/30 border-border h-8 text-sm" autoFocus onKeyDown={(e) => e.key === 'Enter' && submit()} />
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (opcional)" rows={2} className="bg-muted/30 border-border text-sm resize-none" />
          <div className="flex gap-1.5">
            <Button size="sm" onClick={submit} disabled={createTask.isPending} className="h-7 text-xs gradient-teal text-primary-foreground hover:opacity-90">Adicionar</Button>
            <Button size="sm" variant="ghost" onClick={() => setAddingHere(false)} className="h-7 text-xs border border-border">Cancelar</Button>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="flex-1 px-3 pb-4 space-y-2">
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && !addingHere && (
          <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border/40 rounded-xl">
            Solte aqui
          </p>
        )}
      </div>
    </div>
  );
}

// ─── TaskBoard ────────────────────────────────────────────────────────────────
export function TaskBoard({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const updateTask = useUpdateTask();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overId, setOverId] = useState<ColStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const onDragStart = ({ active }: DragStartEvent) => {
    const task = (tasks ?? []).find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const onDragOver = ({ over }: DragOverEvent) => {
    if (!over) { setOverId(null); return; }
    const colStatuses: ColStatus[] = ['todo', 'in_progress', 'done'];
    // over.id may be a column id or a task id — find the column
    if (colStatuses.includes(over.id as ColStatus)) {
      setOverId(over.id as ColStatus);
    } else {
      const hovered = (tasks ?? []).find((t) => t.id === over.id);
      if (hovered) setOverId(hovered.status);
    }
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    setOverId(null);
    if (!over || !activeTask) return;

    const colStatuses: ColStatus[] = ['todo', 'in_progress', 'done'];
    let newStatus: ColStatus | undefined;

    if (colStatuses.includes(over.id as ColStatus)) {
      newStatus = over.id as ColStatus;
    } else {
      const hovered = (tasks ?? []).find((t) => t.id === over.id);
      if (hovered) newStatus = hovered.status;
    }

    if (newStatus && newStatus !== activeTask.status) {
      await updateTask.mutateAsync({ id: activeTask.id, project_id: activeTask.project_id, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  const byStatus = (status: ColStatus) => (tasks ?? []).filter((t) => t.status === status);

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <DroppableColumn
            key={col.status}
            col={col}
            tasks={byStatus(col.status)}
            isOver={overId === col.status}
            projectId={projectId}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeTask ? <OverlayCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
