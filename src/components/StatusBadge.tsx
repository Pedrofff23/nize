import { Project } from '@/types/project';

interface StatusBadgeProps {
  status: Project['status'] | 'pendente' | 'em_andamento' | 'concluido';
  size?: 'sm' | 'md';
}

const statusConfig = {
  ativo: { label: 'Ativo', class: 'bg-primary/15 text-primary border-primary/30' },
  concluido: { label: 'Concluído', class: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  pausado: { label: 'Pausado', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  pendente: { label: 'Pendente', class: 'bg-muted text-muted-foreground border-border' },
  em_andamento: { label: 'Em Andamento', class: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pendente;
  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium ${config.class} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      }`}
    >
      {config.label}
    </span>
  );
}
