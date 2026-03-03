# Nize - Gestor de Projetos Pessoal

Nize é uma plataforma moderna e intuitiva para gestão de projetos, clientes, finanças e credenciais. Desenvolvido com foco em performance e experiência do usuário, o sistema oferece uma interface fluida, suporte a PWA e ferramentas avançadas de organização.

![Banner do Projeto](https://images.unsplash.com/photo-1540350394557-8d14678e7f91?q=80&w=2000&auto=format&fit=crop)

## 🚀 Funcionalidades Principais

- **📊 Dashboard Centralizado**: Visão geral de métricas, progresso de projetos e atividades recentes.
- **📂 Gestão de Projetos**: Criação e acompanhamento detalhado de projetos com suporte a status, tecnologias e prazos.
- **👥 Gestão de Clientes**: Cadastro completo de clientes e histórico de interações vinculadas a projetos.
- **💰 Controle Financeiro**: Monitoramento de orçamentos, entradas e saídas por projeto.
- **🔐 Cofre de Credenciais**: Gerenciamento seguro de acessos e logins.
- **📝 Editor Rich Text (Tiptap)**: Suporte a notas ricas com formatação, checklists e blocos de código.
- **📱 Progressive Web App (PWA)**: Instale o Nize no seu desktop ou mobile para acesso instantâneo.
- **🌓 Temas Dinâmicos**: Suporte a modo escuro, claro e fundos dinâmicos baseados no contexto.

## 🛠️ Stack Tecnológica

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Banco de Dados & Auth**: [Supabase](https://supabase.com/)
- **Gerenciamento de Estado**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Formulários**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/) / Tailwind Animate

## ⚙️ Começando

### Pré-requisitos

- Node.js (v18+)
- npm ou bun

### Instalação

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd my-project-hub
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env` na raiz do projeto com suas chaves do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

4. **Prepare o Banco de Dados (Supabase)**:
   - Crie um novo projeto no [Supabase](https://supabase.com/).
   - Vá para o **SQL Editor**.
   - Copie e cole o conteúdo de [`supabase/full_setup.sql`](file:///Users/joaomarcosaraujomaia/Projetos/my-project-hub-1/supabase/full_setup.sql) e execute.
   - Isso criará todas as tabelas, políticas de segurança (RLS), funções e buckets de armazenamento necessários.

5. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

## 🏗️ Estrutura do Projeto

```text
src/
├── components/     # Componentes UI reutilizáveis (Shadcn + Custom)
├── contexts/       # Provedores de contexto (Theme, Auth, etc)
├── hooks/          # Hooks personalizados e queries do Supabase
├── pages/          # Páginas principais da aplicação
├── types/          # Definições de tipos TypeScript
└── utils/          # Funções utilitárias e auxiliares
```

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

---

Desenvolvido para organizar o extraordinário. 🚀
