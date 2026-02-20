import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, LogOut, FolderKanban } from 'lucide-react';
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
  { title: 'Projetos', url: '/projetos', icon: FolderOpen },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center flex-shrink-0 glow-teal">
            <FolderKanban className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-sidebar-foreground text-sm">ProjectFlow</span>
            <p className="text-xs text-muted-foreground">Gestor Pessoal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = item.url === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                          isActive
                            ? 'bg-primary/15 text-primary border border-primary/30 font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 mb-3 px-2">
          <div className="w-7 h-7 rounded-full gradient-teal flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-foreground">
            {user?.email?.[0].toUpperCase() ?? 'U'}
          </div>
          <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
