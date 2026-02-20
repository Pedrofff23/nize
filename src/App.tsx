import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/components/LoginPage";
import Dashboard from "@/pages/Dashboard";
import NewProject from "@/pages/NewProject";
import ProjectDetail from "@/pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import { SidebarTrigger } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin z-10" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <SidebarProvider>
      {/* Global Glassmorphic Background */}
      <div
        className="fixed inset-0 z-[-1] pointer-events-none"
        style={{
          backgroundImage: 'url(/login-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[20px]" />
        {/* Subtle accent glows behind everything */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="min-h-screen flex w-full bg-transparent">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          <main className="flex-1 overflow-auto p-4 sm:p-8 relative">
            {/* SidebarTrigger available floating on mobile */}
            <div className="md:hidden absolute top-4 left-4 z-20">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground bg-black/40 backdrop-blur-md border border-white/10 rounded-xl" />
            </div>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projetos/novo" element={<NewProject />} />
              <Route path="/projetos/:id" element={<ProjectDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
