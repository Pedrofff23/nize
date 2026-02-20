
## Gestor de Projetos Pessoal

### Design System
Inspirado na imagem fornecida:
- **Tema**: Dark mode com fundo navy escuro (#0a0f1e)
- **Acentos**: Verde-teal/ciano vibrante
- **Layout**: Sidebar lateral fixa + área de conteúdo principal
- **Componentes**: Cards com bordas sutis, tabelas limpas, badges coloridos

---

### 1. Tela de Login
- Formulário simples com email e senha (sem cadastro)
- Credenciais fixas (admin pré-configurado no Supabase Auth)
- Visual alinhado ao design dark com logo e card centralizado

---

### 2. Estrutura de Dados no Supabase

**Tabela `projects`:**
- `id`, `name` (nome do projeto), `deadline` (prazo), `price` (preço cobrado), `status` (ativo/concluído/pausado), `created_at`

**Tabela `project_modules`:**
- `id`, `project_id` (FK), `name` (nome do módulo), `description`, `status` (pendente/em andamento/concluído), `order` (ordenação)

**Storage Bucket `project-files`:**
- Para anexar arquivos a cada projeto (PDF, imagens, docs)

---

### 3. Dashboard Principal (Sidebar + Conteúdo)
- **Sidebar**: Logo, navegação com ícones (Projetos, Arquivos, Configurações)
- **Header**: Barra de busca, nome do usuário logado
- **Cards de resumo**: Total de projetos, projetos ativos, receita total estimada
- **Lista de projetos**: Grid de cards com nome, prazo, preço, status e número de módulos

---

### 4. Página de Detalhes do Projeto
- **Header do projeto**: Nome, prazo, preço cobrado, status com badge colorido
- **Seção de Módulos**: Lista/tabela de módulos com nome, descrição e status (drag para reordenar ou botões para adicionar/remover)
- **Seção de Arquivos**: Upload e listagem de arquivos anexados ao projeto (PDF, imagens, etc.)
- **Ações**: Editar projeto, excluir projeto

---

### 5. Formulário de Criar/Editar Projeto
- Campos: Nome, prazo (date picker), preço cobrado (input numérico), status
- Seção de módulos: Adicionar módulos dinamicamente (nome + descrição + status)
- Upload de arquivos direto no formulário

---

### Fluxo de Uso
1. Usuário faz login → vai para o Dashboard
2. Vê todos os projetos em cards
3. Clica em "Novo Projeto" → preenche dados + adiciona módulos
4. Clica em um projeto → vê detalhes, módulos e arquivos anexados
5. Pode editar módulos individualmente (marcar como concluído, etc.)
