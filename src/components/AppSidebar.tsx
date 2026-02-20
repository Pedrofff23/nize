import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
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
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar variant="floating" className="border-none bg-transparent">
      {/* Container to handle the rounded corners, glassmorphism and padding to look floating */}
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
              placeholder="Search..."
              className="w-full h-10 bg-black/20 border border-white/5 rounded-xl text-sm pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="py-6 px-4">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {navItems.map((item) => {
                  const isActive = item.url === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] transition-all duration-300 relative overflow-hidden ${isActive
                            ? 'gradient-teal text-primary-foreground font-semibold shadow-lg glow-teal'
                            : 'text-muted-foreground hover:bg-white/5 hover:text-white font-medium'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary-foreground' : ''}`} />
                            <span>{item.title}</span>
                          </div>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-6 pt-0 border-none mt-auto">
          {/* Dashed "Novo Projeto" Block matched from image reference */}
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
