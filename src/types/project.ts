export interface Project {
  id: string;
  name: string;
  deadline: string | null;
  price: number;
  status: 'ativo' | 'concluido' | 'pausado';
  description: string | null;
  created_at: string;
  updated_at: string;
  modules?: ProjectModule[];
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
