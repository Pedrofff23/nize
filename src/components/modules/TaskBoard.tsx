import { useState, useMemo } from 'react';
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
  closestCorners,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskColumn } from '@/types/project';
import {
  useTasks, useCreateTask, useUpdateTask, useDeleteTask,
  useTaskColumns, useCreateTaskColumn, useUpdateTaskColumn, useDeleteTaskColumn,
} from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus, Trash2, Pencil, Check, X, GripVertical,
  Settings2, PaintBucket, MoreVertical, PlusCircle, GripHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ─── Paleta de cores ────────────────────────────────────────────────────────────
const COLOR_PALETTE = [
  { label: 'Padrão', value: '' },
  { label: 'Índigo', value: '#6366f1' },
  { label: 'Céu', value: '#0ea5e9' },
  { label: 'Verde', value: '#10b981' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Laranja', value: '#f97316' },
  { label: 'Amarelo', value: '#eab308' },
  { label: 'Vermelho', value: '#ef4444' },
  { label: 'Cinza', value: '#6b7280' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Violeta', value: '#8b5cf6' },
];

// ─── ColorPicker reutilizável ───────────────────────────────────────────────────
function ColorPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <PaintBucket className="w-3.5 h-3.5" /> {label}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {COLOR_PALETTE.map((c) => (
          <button
            key={c.value || 'none'}
            title={c.label}
            onClick={() => onChange(c.value)}
            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
            style={
              c.value
                ? {
                  backgroundColor: c.value,
                  borderColor: value === c.value ? 'white' : 'transparent',
                  boxShadow: value === c.value ? `0 0 0 2px ${c.value}` : 'none',
                }
                : {
                  background: 'transparent',
                  borderColor: value === '' ? 'white' : 'hsl(var(--border))',
                }
            }
          >
            {c.value === '' && <X className="w-3 h-3 text-muted-foreground" />}
          </button>
        ))}
      </div>
      {value && (
        <div className="mt-1.5 h-2 rounded-full transition-colors" style={{ backgroundColor: value }} />
      )}
    </div>
  );
}

// ─── Modal para criar/editar coluna ───────────────────────────────────────────
function ColumnModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: { title: string; color: string };
  onSave: (title: string, color: string) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [color, setColor] = useState(initial?.color ?? '#6366f1');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) { toast.error('Digite um título para a coluna.'); return; }
    setSaving(true);
    await onSave(title.trim(), color);
    setSaving(false);
    onClose();
  };

  const btnBg = color || 'hsl(var(--primary))';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          {initial ? 'Editar coluna' : 'Nova coluna'}
        </h2>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Título</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Em revisão"
            className="bg-muted/30 border-border h-9 text-sm"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </div>

        <ColorPicker value={color} onChange={setColor} label="Cor da coluna" />

        <div className="flex gap-2 pt-1">
          <Button
            onClick={submit}
            disabled={saving}
            className="flex-1 h-9 text-sm text-white"
            style={{ backgroundColor: btnBg }}
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            {initial ? 'Salvar' : 'Criar coluna'}
          </Button>
          <Button variant="ghost" onClick={onClose} className="h-9 text-sm border border-border px-3">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Editor de campos personalizados ──────────────────────────────────────────
function CustomFieldsEditor({
  fields,
  onChange,
}: {
  fields: Record<string, string>;
  onChange: (fields: Record<string, string>) => void;
}) {
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  const addField = () => {
    if (!newKey.trim()) return;
    onChange({ ...fields, [newKey.trim()]: newVal.trim() });
    setNewKey('');
    setNewVal('');
  };

  const removeField = (key: string) => {
    const next = { ...fields };
    delete next[key];
    onChange(next);
  };

  const updateValue = (key: string, val: string) => {
    onChange({ ...fields, [key]: val });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Campos personalizados</p>
      {Object.entries(fields).map(([k, v]) => (
        <div key={k} className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground w-20 shrink-0 truncate" title={k}>{k}</span>
          <Input
            value={v}
            onChange={(e) => updateValue(k, e.target.value)}
            className="bg-muted/20 border-border h-7 text-xs flex-1 min-w-0"
          />
          <Button size="icon" variant="ghost" onClick={() => removeField(k)} className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0">
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Campo"
          className="bg-muted/20 border-border h-7 text-xs w-20 shrink-0"
          onKeyDown={(e) => e.key === 'Enter' && addField()}
        />
        <Input
          value={newVal}
          onChange={(e) => setNewVal(e.target.value)}
          placeholder="Valor"
          className="bg-muted/20 border-border h-7 text-xs flex-1 min-w-0"
          onKeyDown={(e) => e.key === 'Enter' && addField()}
        />
        <Button size="icon" variant="ghost" onClick={addField} className="h-6 w-6 text-primary shrink-0">
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

// ─── DraggableCard ────────────────────────────────────────────────────────────
function DraggableCard({
  task,
  columnColor,
}: {
  task: Task;
  columnColor: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description ?? '');
  const [cardColor, setCardColor] = useState(task.custom_fields?._color ?? '');
  const [customFields, setCustomFields] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(task.custom_fields ?? {}).filter(([k]) => k !== '_color'))
  );
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.35 : 1 }
    : undefined;

  const save = async () => {
    if (!title.trim()) return;
    const merged: Record<string, string> = { ...customFields };
    if (cardColor) merged._color = cardColor;
    await updateTask.mutateAsync({
      id: task.id,
      project_id: task.project_id,
      title: title.trim(),
      description: desc.trim() || null,
      custom_fields: merged,
    });
    setEditing(false);
  };

  // Cor do card: cor específica > cor da coluna com baixa opacidade
  const currentCardColor = task.custom_fields?._color ?? '';
  const visibleFields = Object.entries(task.custom_fields ?? {}).filter(([k]) => k !== '_color');
  const hasCustomFields = visibleFields.length > 0;
  const accentColor = currentCardColor || columnColor;

  const cardBg = currentCardColor
    ? `${currentCardColor}18`
    : columnColor
      ? `${columnColor}10`
      : undefined;

  const cardBorder = currentCardColor
    ? `${currentCardColor}50`
    : 'hsl(var(--border))';

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: cardBg, borderColor: cardBorder }}
      className="border rounded-xl p-3 space-y-2 group select-none transition-colors"
    >
      {editing ? (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-muted/30 border-border h-8 text-sm" autoFocus />
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (opcional)" rows={2} className="bg-muted/30 border-border text-sm resize-none" />

          {/* Cor do card */}
          <ColorPicker value={cardColor} onChange={setCardColor} label="Cor do card" />

          <CustomFieldsEditor fields={customFields} onChange={setCustomFields} />

          <div className="flex gap-1.5 pt-1">
            <Button
              size="sm"
              onClick={save}
              disabled={updateTask.isPending}
              className="h-7 text-xs text-white hover:opacity-90"
              style={{ backgroundColor: accentColor || 'hsl(var(--primary))' }}
            >
              <Check className="w-3 h-3 mr-1" /> Salvar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setTitle(task.title);
                setDesc(task.description ?? '');
                setCardColor(task.custom_fields?._color ?? '');
                setCustomFields(Object.fromEntries(Object.entries(task.custom_fields ?? {}).filter(([k]) => k !== '_color')));
              }}
              className="h-7 text-xs border border-border"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Stripe colorida no topo do card quando tem cor específica */}
          {currentCardColor && (
            <div className="h-0.5 rounded-full -mt-1 mb-1" style={{ backgroundColor: currentCardColor }} />
          )}

          <div className="flex items-start gap-2">
            <button
              {...listeners}
              {...attributes}
              className="mt-0.5 flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">{task.title}</p>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{task.description}</p>
              )}
              {hasCustomFields && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {visibleFields.map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 font-medium"
                      style={{
                        backgroundColor: `${accentColor}22`,
                        color: accentColor || 'hsl(var(--muted-foreground))',
                      }}
                    >
                      <span className="opacity-70">{k}:</span> {v}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)} className="h-6 w-6 text-muted-foreground hover:text-foreground">
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
        </>
      )}
    </div>
  );
}

// ─── Overlay card ─────────────────────────────────────────────────────────────
function OverlayCard({ task, columnColor }: { task: Task; columnColor: string }) {
  const cardColor = task.custom_fields?._color ?? '';
  const accentColor = cardColor || columnColor;
  return (
    <div
      className="border shadow-2xl rounded-xl p-3 rotate-1 cursor-grabbing"
      style={{
        borderColor: accentColor ? accentColor + '60' : undefined,
        backgroundColor: accentColor ? accentColor + '12' : 'hsl(var(--background))',
      }}
    >
      {cardColor && <div className="h-0.5 rounded-full mb-1.5" style={{ backgroundColor: cardColor }} />}
      <p className="text-sm font-medium text-foreground">{task.title}</p>
      {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
    </div>
  );
}

// ─── OverlayColumn (dragging a column) ────────────────────────────────────────
function OverlayColumn({ col, tasks }: { col: TaskColumn; tasks: Task[] }) {
  return (
    <div
      className="flex flex-col rounded-2xl border-2 min-h-[120px] min-w-[280px] w-[280px] opacity-95 shadow-2xl rotate-1"
      style={{ borderColor: col.color, backgroundColor: col.color ? `${col.color}15` : undefined }}
    >
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
        <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
        <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>
    </div>
  );
}

// ─── SortableColumnWrapper ─────────────────────────────────────────────────────
// Wrapper que faz a coluna ser sortable (drag-to-reorder)
function SortableColumnWrapper({
  col,
  children,
  isColumnDragging,
}: {
  col: TaskColumn;
  children: React.ReactNode;
  isColumnDragging: boolean;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `col::${col.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="min-w-[280px] w-[280px] flex flex-col"
    >
      {/* Drag handle da coluna */}
      <div
        {...listeners}
        {...attributes}
        className={`flex justify-center py-1 mb-1 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors ${isColumnDragging ? 'pointer-events-none' : ''}`}
        title="Arrastar coluna"
      >
        <GripHorizontal className="w-4 h-4" />
      </div>
      {children}
    </div>
  );
}

// ─── DroppableColumn ──────────────────────────────────────────────────────────
function DroppableColumn({
  col,
  tasks,
  isOver,
  projectId,
  onEdit,
  onDelete,
}: {
  col: TaskColumn;
  tasks: Task[];
  isOver: boolean;
  projectId: string;
  onEdit: (col: TaskColumn) => void;
  onDelete: (col: TaskColumn) => void;
}) {
  const { setNodeRef } = useDroppable({ id: col.id });
  const [addingHere, setAddingHere] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const createTask = useCreateTask();

  const submit = async () => {
    if (!title.trim()) { toast.error('Digite um título.'); return; }
    await createTask.mutateAsync({
      project_id: projectId,
      column_id: col.id,
      title: title.trim(),
      description: desc.trim() || null,
      status: 'todo',
      order: tasks.length,
      custom_fields: {},
    });
    setTitle('');
    setDesc('');
    setAddingHere(false);
  };

  // Fundo da coluna baseado na cor
  const colBg = col.color
    ? isOver ? `${col.color}22` : `${col.color}12`
    : isOver ? 'hsl(var(--muted) / 0.3)' : 'hsl(var(--muted) / 0.1)';

  const colBorder = isOver
    ? `${col.color}80`
    : col.color
      ? `${col.color}35`
      : 'hsl(var(--border))';

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col rounded-2xl border-2 border-t-[3px] transition-all duration-200 min-h-[240px]"
      style={{
        borderColor: colBorder,
        borderTopColor: col.color || colBorder,
        backgroundColor: colBg,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: col.color || 'hsl(var(--muted-foreground))' }} />
          <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
          <span className="text-xs bg-black/10 dark:bg-white/10 rounded-full px-2 py-0.5 text-foreground/60">{tasks.length}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button size="icon" variant="ghost" onClick={() => setAddingHere(true)} className="h-6 w-6 text-muted-foreground hover:text-foreground">
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-sm">
              <DropdownMenuItem onClick={() => onEdit(col)}>
                <Settings2 className="w-3.5 h-3.5 mr-2" /> Editar coluna
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(col)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir coluna
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Form novo card */}
      {addingHere && (
        <div
          className="mx-3 mb-3 space-y-2 bg-background/80 backdrop-blur border rounded-xl p-3"
          style={{ borderColor: col.color ? `${col.color}50` : undefined }}
        >
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título *" className="bg-muted/30 border-border h-8 text-sm" autoFocus onKeyDown={(e) => e.key === 'Enter' && submit()} />
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (opcional)" rows={2} className="bg-muted/30 border-border text-sm resize-none" />
          <div className="flex gap-1.5">
            <Button
              size="sm"
              onClick={submit}
              disabled={createTask.isPending}
              className="h-7 text-xs text-white hover:opacity-90"
              style={{ backgroundColor: col.color || 'hsl(var(--primary))' }}
            >
              Adicionar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAddingHere(false)} className="h-7 text-xs border border-border">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="flex-1 px-3 pb-4 space-y-2">
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} columnColor={col.color} />
        ))}
        {tasks.length === 0 && !addingHere && (
          <p
            className="text-xs text-foreground/30 text-center py-8 border-2 border-dashed rounded-xl"
            style={{ borderColor: col.color ? `${col.color}25` : undefined }}
          >
            Arraste cards aqui
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Colunas padrão ────────────────────────────────────────────────────────────
const DEFAULT_COLUMNS = [
  { title: 'A Fazer', color: '#6b7280', order: 0 },
  { title: 'Em Andamento', color: '#0ea5e9', order: 1 },
  { title: 'Concluído', color: '#10b981', order: 2 },
];

// ─── TaskBoard ────────────────────────────────────────────────────────────────
export function TaskBoard({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading: tasksLoading } = useTasks(projectId);
  const { data: columns, isLoading: columnsLoading } = useTaskColumns(projectId);
  const updateTask = useUpdateTask();
  const createColumn = useCreateTaskColumn();
  const updateColumn = useUpdateTaskColumn();
  const deleteColumn = useDeleteTaskColumn();

  // Controle de drag
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeCol, setActiveCol] = useState<TaskColumn | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Ordem local das colunas (para reordering otimista)
  const [localColOrder, setLocalColOrder] = useState<string[] | null>(null);

  const [columnModal, setColumnModal] = useState<{ mode: 'create' | 'edit'; col?: TaskColumn } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const isLoading = tasksLoading || columnsLoading;

  // Colunas ordenadas (usa ordem local durante drag, caso contrário usa do DB)
  const sortedColumns = useMemo(() => {
    const cols = columns ?? [];
    if (!localColOrder) return cols;
    return localColOrder
      .map((id) => cols.find((c) => c.id === id))
      .filter(Boolean) as TaskColumn[];
  }, [columns, localColOrder]);

  const sortableIds: UniqueIdentifier[] = sortedColumns.map((c) => `col::${c.id}`);

  const initDefaultColumns = async () => {
    for (const col of DEFAULT_COLUMNS) {
      await createColumn.mutateAsync({ project_id: projectId, ...col });
    }
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    const id = active.id as string;
    if (id.startsWith('col::')) {
      const colId = id.replace('col::', '');
      const col = sortedColumns.find((c) => c.id === colId);
      if (col) setActiveCol(col);
      return;
    }
    const task = (tasks ?? []).find((t) => t.id === id);
    if (task) setActiveTask(task);
  };

  const onDragOver = ({ over, active }: DragOverEvent) => {
    if (!over || (active.id as string).startsWith('col::')) { setOverId(null); return; }
    const colIds = sortedColumns.map((c) => c.id);
    if (colIds.includes(over.id as string)) {
      setOverId(over.id as string);
    } else {
      const hovered = (tasks ?? []).find((t) => t.id === over.id);
      if (hovered) setOverId(hovered.column_id);
    }
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    const activeId = active.id as string;

    // ── Reordenar colunas ─────────────────────────────────────────────────────
    if (activeId.startsWith('col::') && activeCol) {
      setActiveCol(null);
      setOverId(null);
      if (!over) return;
      const overId = over.id as string;
      if (!overId.startsWith('col::')) return;

      const oldIds = sortedColumns.map((c) => `col::${c.id}`);
      const oldIndex = oldIds.indexOf(activeId);
      const newIndex = oldIds.indexOf(overId);
      if (oldIndex === newIndex) return;

      const newSortedIds = arrayMove(sortedColumns.map((c) => c.id), oldIndex, newIndex);
      setLocalColOrder(newSortedIds);

      // Persist: atualizar order de cada coluna
      await Promise.all(
        newSortedIds.map((colId, idx) =>
          updateColumn.mutateAsync({ id: colId, project_id: projectId, order: idx })
        )
      );
      setLocalColOrder(null); // Deixa o DB assumir após persistência
      return;
    }

    // ── Mover card entre colunas ──────────────────────────────────────────────
    setActiveTask(null);
    setOverId(null);
    if (!over || !activeTask) return;

    const colIds = sortedColumns.map((c) => c.id);
    let newColId: string | null = null;

    if (colIds.includes(over.id as string)) {
      newColId = over.id as string;
    } else {
      const hovered = (tasks ?? []).find((t) => t.id === over.id);
      if (hovered) newColId = hovered.column_id;
    }

    if (newColId && newColId !== activeTask.column_id) {
      await updateTask.mutateAsync({
        id: activeTask.id,
        project_id: activeTask.project_id,
        column_id: newColId,
      });
    }
  };

  const handleSaveColumn = async (title: string, color: string) => {
    if (columnModal?.mode === 'edit' && columnModal.col) {
      await updateColumn.mutateAsync({ id: columnModal.col.id, project_id: projectId, title, color });
    } else {
      await createColumn.mutateAsync({
        project_id: projectId,
        title,
        color,
        order: sortedColumns.length,
      });
    }
  };

  const handleDeleteColumn = (col: TaskColumn) => {
    const tasksInCol = (tasks ?? []).filter((t) => t.column_id === col.id);
    if (tasksInCol.length > 0) {
      toast.error(`Mova ou remova as ${tasksInCol.length} tarefa(s) desta coluna antes de excluí-la.`);
      return;
    }
    deleteColumn.mutate({ id: col.id, project_id: projectId });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-2xl min-w-[280px]" />)}
      </div>
    );
  }

  const activeColForOverlay = activeTask
    ? sortedColumns.find((c) => c.id === activeTask.column_id)
    : null;

  return (
    <>
      {columnModal && (
        <ColumnModal
          initial={columnModal.col ? { title: columnModal.col.title, color: columnModal.col.color } : undefined}
          onSave={handleSaveColumn}
          onClose={() => setColumnModal(null)}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[360px] items-start">

          {sortedColumns.length === 0 ? (
            // Empty state
            <div className="flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-2xl py-16 min-h-[300px]">
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">Nenhuma coluna criada</p>
                <p className="text-xs text-muted-foreground">Crie colunas personalizadas ou comece com as colunas padrão.</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button onClick={initDefaultColumns} disabled={createColumn.isPending} variant="outline" className="text-sm">
                  Usar colunas padrão
                </Button>
                <Button onClick={() => setColumnModal({ mode: 'create' })} className="text-sm">
                  <Plus className="w-4 h-4 mr-1.5" /> Nova coluna
                </Button>
              </div>
            </div>
          ) : (
            <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
              {sortedColumns.map((col) => (
                <SortableColumnWrapper
                  key={col.id}
                  col={col}
                  isColumnDragging={!!activeCol}
                >
                  <DroppableColumn
                    col={col}
                    tasks={(tasks ?? []).filter((t) => t.column_id === col.id)}
                    isOver={overId === col.id}
                    projectId={projectId}
                    onEdit={(c) => setColumnModal({ mode: 'edit', col: c })}
                    onDelete={handleDeleteColumn}
                  />
                </SortableColumnWrapper>
              ))}

              {/* Botão nova coluna */}
              <div className="min-w-[220px] flex flex-col items-start pt-9">
                <Button
                  variant="ghost"
                  onClick={() => setColumnModal({ mode: 'create' })}
                  className="w-full h-11 border-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 rounded-2xl text-sm"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Nova coluna
                </Button>
              </div>
            </SortableContext>
          )}
        </div>

        <DragOverlay dropAnimation={{ duration: 160, easing: 'ease' }}>
          {activeTask && (
            <OverlayCard task={activeTask} columnColor={activeColForOverlay?.color ?? ''} />
          )}
          {activeCol && (
            <OverlayColumn
              col={activeCol}
              tasks={(tasks ?? []).filter((t) => t.column_id === activeCol.id)}
            />
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
}
