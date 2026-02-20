import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvents, useCreateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { ProjectEvent } from '@/types/project';
import { Plus, Trash2, Clock, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

function EventForm({
  projectId,
  selectedDate,
  onClose,
}: {
  projectId: string;
  selectedDate: Date;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState(format(selectedDate, 'yyyy-MM-dd'));
  const createEvent = useCreateEvent();

  const submit = async () => {
    if (!title.trim()) { toast.error('Digite um título.'); return; }
    await createEvent.mutateAsync({
      project_id: projectId,
      title: title.trim(),
      description: desc.trim() || null,
      date,
      time: time.trim() || null,
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Título *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do evento" className="bg-background border-border" autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Data</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Horário</label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-background border-border" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Descrição</label>
        <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Detalhes (opcional)" rows={3} className="bg-background border-border resize-none" />
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={submit} disabled={createEvent.isPending} className="gradient-teal text-primary-foreground hover:opacity-90">
          Salvar Evento
        </Button>
        <Button variant="outline" onClick={onClose} className="border-border">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export function ProjectAgenda({ projectId }: { projectId: string }) {
  const { data: events, isLoading } = useEvents(projectId);
  const deleteEvent = useDeleteEvent();
  const [selected, setSelected] = useState<Date>(new Date());
  const [addOpen, setAddOpen] = useState(false);

  const selectedStr = format(selected, 'yyyy-MM-dd');
  const dayEvents = (events ?? []).filter((e) => e.date === selectedStr);
  const allUpcoming = (events ?? []).filter((e) => e.date >= format(new Date(), 'yyyy-MM-dd'));

  const datesWithEvents = new Set((events ?? []).map((e) => e.date));

  const modifiers = {
    hasEvent: (date: Date) => datesWithEvents.has(format(date, 'yyyy-MM-dd')),
  };

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => d && setSelected(d)}
          locale={ptBR}
          modifiers={modifiers}
          modifiersClassNames={{
            hasEvent: 'ring-2 ring-primary ring-offset-1 ring-offset-background',
          }}
          className="w-full"
        />
      </div>

      {/* Right panel */}
      <div className="space-y-4">
        {/* Selected day events */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">
                {format(selected, "dd 'de' MMMM", { locale: ptBR })}
              </h3>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)} className="h-7 text-xs gradient-teal text-primary-foreground hover:opacity-90">
              <Plus className="w-3 h-3 mr-1" /> Evento
            </Button>
          </div>

          {dayEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border/50 rounded-xl">
              Nenhum evento neste dia
            </p>
          ) : (
            <div className="space-y-2">
              {dayEvents.map((ev) => (
                <EventItem key={ev.id} event={ev} onDelete={() => deleteEvent.mutate({ id: ev.id, project_id: ev.project_id })} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming events */}
        {allUpcoming.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Próximos Eventos</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {allUpcoming.slice(0, 8).map((ev) => (
                <div key={ev.id} className="flex items-start gap-2 text-xs">
                  <span className="text-primary font-medium min-w-[60px]">
                    {format(parseISO(ev.date), 'dd/MM', { locale: ptBR })}
                  </span>
                  <span className="text-foreground">{ev.title}</span>
                  {ev.time && <span className="text-muted-foreground ml-auto">{ev.time}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>
          <EventForm projectId={projectId} selectedDate={selected} onClose={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EventItem({ event, onDelete }: { event: ProjectEvent; onDelete: () => void }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/30 border border-border rounded-xl group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{event.title}</p>
        {event.time && (
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-primary" />
            <span className="text-xs text-muted-foreground">{event.time}</span>
          </div>
        )}
        {event.description && <p className="text-xs text-muted-foreground mt-1">{event.description}</p>}
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={onDelete}
        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
