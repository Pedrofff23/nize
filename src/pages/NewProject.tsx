import { ProjectForm } from '@/components/ProjectForm';
import { AppBreadcrumb } from '@/components/AppBreadcrumb';

export default function NewProject() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <AppBreadcrumb items={[{ label: 'Projetos', href: '/' }, { label: 'Novo Projeto' }]} />

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
