import { Client } from './client';
import {
  CheckSquare,
  CalendarDays,
  DollarSign,
  FolderOpen,
  FileEdit,
  GitBranch,
  LucideIcon,
} from 'lucide-react';

export type ProjectToolSlug = 'tasks' | 'agenda' | 'budget' | 'files' | 'notes' | 'flowchart';

export interface ToolDefinition {
  slug: ProjectToolSlug;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const AVAILABLE_TOOLS: ToolDefinition[] = [
  { slug: 'tasks', name: 'Tarefas', description: 'Board kanban para gerenciar tarefas', icon: CheckSquare },
  { slug: 'agenda', name: 'Agenda', description: 'Calendário de eventos e prazos', icon: CalendarDays },
  { slug: 'budget', name: 'Orçamento', description: 'Controle financeiro do projeto', icon: DollarSign },
  { slug: 'files', name: 'Arquivos', description: 'Biblioteca de arquivos do projeto', icon: FolderOpen },
  { slug: 'notes', name: 'Notas', description: 'Editor de notas estilo Notion', icon: FileEdit },
  { slug: 'flowchart', name: 'Fluxograma', description: 'Board de fluxogramas visuais', icon: GitBranch },
];

export const ALL_TOOL_SLUGS: ProjectToolSlug[] = AVAILABLE_TOOLS.map(t => t.slug);

export interface Project {
  id: string;
  name: string;
  deadline: string | null;
  price: number;
  status: 'ativo' | 'concluido' | 'pausado';
  description: string | null;
  client_id: string | null;
  client?: Client | null;
  enabled_tools: ProjectToolSlug[];
  created_at: string;
  updated_at: string;
  modules?: ProjectModule[];
  project_modules?: ProjectModule[];
}

export interface ProjectModule {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: 'pendente' | 'em_andamento' | 'concluido';
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, unknown>;
}

export interface TaskColumn {
  id: string;
  project_id: string;
  title: string;
  color: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  column_id: string | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  order: number;
  custom_fields: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ProjectEvent {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetEntry {
  id: string;
  project_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
  updated_at: string;
}
