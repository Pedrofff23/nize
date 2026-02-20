import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error('Email ou senha inválidos.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8 relative overflow-hidden">
      {/* Background glows from design system */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Layout Container */}
      <div className="w-full max-w-[1000px] min-h-[600px] flex rounded-[2rem] bg-card border border-border overflow-hidden shadow-2xl relative z-10 glow-card">

        {/* Left Column - Form */}
        <div className="w-full md:w-[45%] lg:w-[45%] flex flex-col p-8 sm:p-12">
          {/* Top Window Dots */}
          <div className="flex gap-2 mb-16">
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-center max-w-[320px] w-full mx-auto">
            <div className="mb-10">
              <div className="w-12 h-12 rounded-xl overflow-hidden mb-6 glow-teal border border-primary/20">
                <img src="/favicon.png" alt="Nize Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl sm:text-[28px] font-semibold text-foreground tracking-tight mb-2">
                Bem-vindo de volta!
              </h1>
              <p className="text-[13px] text-muted-foreground">
                Insira suas informações para entrar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-muted/40 border-border text-[14px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary transition-colors rounded-[12px]"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="sr-only">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-muted/40 border-border text-[14px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary transition-colors rounded-[12px]"
                />
              </div>

              <div className="pt-2">
                {/* O Botão se mantém de acordo com o design system (teal gradient) */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-teal text-primary-foreground font-semibold h-12 hover:opacity-90 transition-opacity glow-teal rounded-[12px]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Image Container */}
        <div className="hidden md:block md:w-[55%] lg:w-[55%] p-2">
          <div
            className="w-full h-full rounded-[1.5rem] overflow-hidden bg-muted relative flex items-center justify-center border border-border/50"
            style={{
              backgroundImage: 'url(/login-bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Opcional: overlay para escurecer um pouco se achar necessário */}
            <div className="absolute inset-0 bg-background/20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-r from-card/40 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
