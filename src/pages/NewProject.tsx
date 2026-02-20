import { useNavigate } from 'react-router-dom';
import { ProjectForm } from '@/components/ProjectForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewProject() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/')}
        className="text-muted-foreground hover:text-foreground -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Novo Projeto</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Preencha as informações do seu projeto</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <ProjectForm />
      </div>
    </div>
  );
}
