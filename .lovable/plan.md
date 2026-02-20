
## Reestruturação: Módulos Fixos por Projeto

### Visão Geral

Cada projeto passará a ter 3 módulos default com telas dedicadas, acessíveis via abas (tabs) dentro da página de detalhes do projeto:

1. **Board de Tarefas** — Kanban com colunas "A fazer", "Em andamento" e "Concluído"
2. **Agenda** — Calendário mensal com eventos/compromissos do projeto
3. **Orçamento** — Controle de receitas e despesas do projeto

Além disso, o usuário poderá adicionar **módulos customizados** (como já existe hoje), que aparecerão como abas extras.

---

### Arquitetura

A página `ProjectDetail.tsx` será reorganizada com um sistema de **abas (Tabs)**, onde:

- As 3 primeiras abas são sempre os módulos fixos
- Abas seguintes são os módulos customizados
- Uma aba especial "Arquivos" e "Info do Projeto" completam o layout

```text
[ Info ] [ Tarefas ] [ Agenda ] [ Orçamento ] [ Módulos ] [ Arquivos ]
```

---

### Banco de Dados (Migrations necessárias)

#### Tabela `tasks` — Board de Tarefas
```sql
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo', -- 'todo' | 'in_progress' | 'done'
  order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```
Com RLS para `authenticated` e trigger de `updated_at`.

#### Tabela `events` — Agenda
```sql
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  time text, -- ex: "14:30"
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### Tabela `budget_entries` — Orçamento
```sql
CREATE TABLE budget_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0, -- positivo = receita, negativo = despesa
  type text NOT NULL DEFAULT 'income', -- 'income' | 'expense'
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

---

### Componentes a Criar

#### `src/components/modules/TaskBoard.tsx`
- 3 colunas Kanban: A Fazer / Em Andamento / Concluído
- Cards arrastáveis (usando estado local + botões de mover)
- Adicionar tarefa em cada coluna
- Editar e excluir tarefas inline
- Hook `useTasks(projectId)` com CRUD completo

#### `src/components/modules/ProjectAgenda.tsx`
- Calendário mensal usando o componente `Calendar` já existente
- Lista de eventos do dia selecionado ao lado/abaixo
- Modal para adicionar/editar eventos (título, data, hora, descrição)
- Hook `useEvents(projectId)` com CRUD completo

#### `src/components/modules/ProjectBudget.tsx`
- Cards de resumo: Total Receitas, Total Despesas, Saldo
- Tabela de lançamentos (data, descrição, tipo, valor)
- Formulário inline para adicionar receita ou despesa
- Hook `useBudget(projectId)` com CRUD completo

---

### Mudanças no `ProjectDetail.tsx`

A página atual será reorganizada em tabs:

```text
[Info do Projeto] [Tarefas] [Agenda] [Orçamento] [Módulos] [Arquivos]
```

- **Info**: Cabeçalho do projeto (nome, prazo, valor, status, progresso) — o que existe hoje no topo
- **Tarefas**: `<TaskBoard projectId={id} />`
- **Agenda**: `<ProjectAgenda projectId={id} />`
- **Orçamento**: `<ProjectBudget projectId={id} />`
- **Módulos**: Os módulos customizados atuais (adicionar, editar, excluir)
- **Arquivos**: `<FileSection projectId={id} />`

---

### Hooks a Criar

- `src/hooks/useTasks.ts` — CRUD de tarefas com React Query
- `src/hooks/useEvents.ts` — CRUD de eventos com React Query
- `src/hooks/useBudget.ts` — CRUD de lançamentos orçamentários

---

### Tipos a Adicionar em `src/types/project.ts`

```typescript
export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  order: number;
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
```

---

### Resumo das Alterações

| Arquivo | Ação |
|---|---|
| Migration SQL | Cria tabelas `tasks`, `events`, `budget_entries` com RLS |
| `src/types/project.ts` | Adiciona `Task`, `ProjectEvent`, `BudgetEntry` |
| `src/hooks/useTasks.ts` | Novo — CRUD tarefas |
| `src/hooks/useEvents.ts` | Novo — CRUD eventos |
| `src/hooks/useBudget.ts` | Novo — CRUD orçamento |
| `src/components/modules/TaskBoard.tsx` | Novo — Kanban |
| `src/components/modules/ProjectAgenda.tsx` | Novo — Calendário |
| `src/components/modules/ProjectBudget.tsx` | Novo — Orçamento |
| `src/pages/ProjectDetail.tsx` | Refatorado — usa Tabs com os 3 módulos fixos |
