import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, Users, ChevronDown, ChevronRight,
  FolderOpen, ListTodo, CalendarDays, DollarSign, Layers, FileText, KeyRound, Wallet, Settings,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const projectSubItems = [
  { title: 'Tarefas', tab: 'tasks', icon: ListTodo },
  { title: 'Agenda', tab: 'agenda', icon: CalendarDays },
  { title: 'Orçamento', tab: 'budget', icon: DollarSign },
  { title: 'Módulos', tab: 'modules', icon: Layers },
  { title: 'Arquivos', tab: 'files', icon: FileText },
  { title: 'Credenciais', tab: 'credentials', icon: KeyRound },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: projects } = useProjects();

  const [projectsOpen, setProjectsOpen] = useState(true);

  // Extract current project ID from URL
  const projectMatch = location.pathname.match(/^\/projetos\/([^/]+)$/);
  const activeProjectId = projectMatch ? projectMatch[1] : null;
  // Don't count "novo" as a project ID
  const isOnProjectDetail = activeProjectId && activeProjectId !== 'novo';

  // Extract current tab from search params
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'tasks';

  const isProjectsSection = location.pathname === '/' || location.pathname.startsWith('/projetos');
  const isClientsSection = location.pathname.startsWith('/clientes');
  const isCredentialsSection = location.pathname.startsWith('/credenciais');
  const isFinancesSection = location.pathname.startsWith('/financas');
  const isSettingsSection = location.pathname.startsWith('/configuracoes');

  return (
    <Sidebar variant="floating" className="border-none bg-transparent">
      <div className="flex h-full w-full flex-col bg-white/[0.03] backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">

        <SidebarHeader className="p-6 pb-2 border-none">
          {/* Top Window Dots */}
          <div className="flex gap-2 mb-8">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-orange-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 glow-teal border border-primary/20 bg-black/20 backdrop-blur-sm">
              <img src="/favicon.png" alt="Nize Logo" className="w-7 h-7 object-cover" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Workspace</p>
              <span className="font-bold text-foreground text-sm tracking-wide">Nize App</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative group">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full h-10 bg-black/20 border border-white/5 rounded-xl text-sm pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="py-4 px-4 overflow-y-auto">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">

                {/* ── Projetos (Collapsible) ─────────────────────────── */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => {
                        setProjectsOpen(!projectsOpen);
                        navigate('/');
                      }}
                      className={`group w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] transition-all duration-300 relative overflow-hidden ${isProjectsSection && !isOnProjectDetail
                        ? 'gradient-teal text-primary-foreground font-semibold shadow-lg glow-teal'
                        : isProjectsSection
                          ? 'bg-white/5 text-foreground font-semibold'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-white font-medium'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isProjectsSection && !isOnProjectDetail ? 'text-primary-foreground' : ''}`} />
                        <span>Projetos</span>
                      </div>
                      {projectsOpen
                        ? <ChevronDown className="w-4 h-4 opacity-60" />
                        : <ChevronRight className="w-4 h-4 opacity-60" />
                      }
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Project List (Collapsible Content) */}
                {projectsOpen && (
                  <div className="ml-3 pl-3 border-l border-white/5 space-y-0.5">
                    {projects?.map((project) => {
                      const isActiveProject = isOnProjectDetail && activeProjectId === project.id;
                      return (
                        <div key={project.id}>
                          {/* Project Name */}
                          <button
                            onClick={() => navigate(`/projetos/${project.id}`)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-200 ${isActiveProject
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                              }`}
                          >
                            <FolderOpen className={`w-4 h-4 flex-shrink-0 ${isActiveProject ? 'text-primary' : ''}`} />
                            <span className="truncate">{project.name}</span>
                          </button>

                          {/* Project Sub Items (only when this project is active) */}
                          {isActiveProject && (
                            <div className="ml-4 pl-3 border-l border-primary/20 space-y-0.5 mt-0.5 mb-1">
                              {projectSubItems.map((sub) => {
                                const isActiveTab = activeTab === sub.tab;
                                return (
                                  <button
                                    key={sub.tab}
                                    onClick={() => navigate(`/projetos/${project.id}?tab=${sub.tab}`)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] transition-all duration-200 ${isActiveTab
                                      ? 'text-primary font-medium bg-primary/5'
                                      : 'text-muted-foreground/70 hover:text-foreground hover:bg-white/5'
                                      }`}
                                  >
                                    <sub.icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActiveTab ? 'text-primary' : ''}`} />
                                    <span>{sub.title}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {(!projects || projects.length === 0) && (
                      <p className="text-[11px] text-muted-foreground/50 px-3 py-2 italic">
                        Nenhum projeto
                      </p>
                    )}
                  </div>
                )}

                {/* ── Clientes ───────────────────────────────────────── */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/clientes"
                      className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] transition-all duration-300 relative overflow-hidden ${isClientsSection
                        ? 'gradient-teal text-primary-foreground font-semibold shadow-lg glow-teal'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white font-medium'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Users className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isClientsSection ? 'text-primary-foreground' : ''}`} />
                        <span>Clientes</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* ── Credenciais ──────────────────────────────────────── */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/credenciais"
                      className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] transition-all duration-300 relative overflow-hidden ${isCredentialsSection
                        ? 'gradient-teal text-primary-foreground font-semibold shadow-lg glow-teal'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white font-medium'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <KeyRound className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isCredentialsSection ? 'text-primary-foreground' : ''}`} />
                        <span>Credenciais</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* ── Finanças ──────────────────────────────────────── */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/financas"
                      className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] transition-all duration-300 relative overflow-hidden ${isFinancesSection
                        ? 'gradient-teal text-primary-foreground font-semibold shadow-lg glow-teal'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white font-medium'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isFinancesSection ? 'text-primary-foreground' : ''}`} />
                        <span>Finanças</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* ── Configurações ────────────────────────────────── */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/configuracoes"
                      className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] transition-all duration-300 relative overflow-hidden ${isSettingsSection
                        ? 'gradient-teal text-primary-foreground font-semibold shadow-lg glow-teal'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white font-medium'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Settings className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isSettingsSection ? 'text-primary-foreground' : ''}`} />
                        <span>Configurações</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-6 pt-0 border-none mt-auto">
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Dashed "Novo Projeto" Block */}
          <div
            onClick={() => navigate('/projetos/novo')}
            className="w-full rounded-[1.5rem] border-2 border-dashed border-white/10 p-5 flex flex-col items-center justify-center text-center mb-6 hover:border-primary/50 transition-colors group cursor-pointer bg-black/10"
          >
            <div className="w-10 h-10 rounded-full gradient-teal flex items-center justify-center text-primary-foreground mb-3 shadow-[0_4px_15px_hsl(175_100%_45%_/_0.3)] group-hover:scale-110 transition-transform">
              <span className="text-xl leading-none font-medium">+</span>
            </div>
            <span className="text-sm font-semibold text-foreground">Novo Projeto</span>
            <span className="text-xs text-muted-foreground mt-1">Criar um do zero</span>
          </div>

          <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-teal flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-foreground">
                {user?.email?.[0].toUpperCase() ?? 'U'}
              </div>
              <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{user?.email}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
