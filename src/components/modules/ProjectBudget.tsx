import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useBudget, useCreateBudgetEntry, useDeleteBudgetEntry } from '@/hooks/useBudget';
import { BudgetEntry } from '@/types/project';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { toast } from 'sonner';

function SummaryCard({ label, value, icon: Icon, variant }: { label: string; value: number; icon: React.ElementType; variant: 'income' | 'expense' | 'balance' }) {
  const colors = {
    income: 'text-primary border-primary/20 bg-primary/5',
    expense: 'text-destructive border-destructive/20 bg-destructive/5',
    balance: value >= 0 ? 'text-primary border-primary/20 bg-primary/5' : 'text-destructive border-destructive/20 bg-destructive/5',
  };

  return (
    <div className={`border rounded-2xl p-4 space-y-2 ${colors[variant]}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium opacity-70">{label}</span>
      </div>
      <p className="text-xl font-bold">
        {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </p>
    </div>
  );
}

function AddEntryForm({ projectId, onDone }: { projectId: string; onDone: () => void }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<BudgetEntry['type']>('income');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const create = useCreateBudgetEntry();

  const submit = async () => {
    if (!description.trim()) { toast.error('Digite uma descrição.'); return; }
    const num = parseFloat(amount.replace(',', '.'));
    if (isNaN(num) || num <= 0) { toast.error('Valor inválido.'); return; }
    await create.mutateAsync({ project_id: projectId, description: description.trim(), amount: num, type, date });
    setDescription('');
    setAmount('');
    onDone();
  };

  return (
    <div className="bg-muted/30 border border-primary/30 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição *" className="bg-background border-border" autoFocus />
        </div>
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor (R$)"
          type="number"
          min="0"
          step="0.01"
          className="bg-background border-border"
        />
        <Select value={type} onValueChange={(v) => setType(v as BudgetEntry['type'])}>
          <SelectTrigger className="bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="income">Receita</SelectItem>
            <SelectItem value="expense">Despesa</SelectItem>
          </SelectContent>
        </Select>
        <div className="col-span-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-background border-border" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={create.isPending} className="gradient-teal text-primary-foreground hover:opacity-90">
          Adicionar
        </Button>
        <Button size="sm" variant="outline" onClick={onDone} className="border-border">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export function ProjectBudget({ projectId }: { projectId: string }) {
  const { data: entries, isLoading } = useBudget(projectId);
  const deleteEntry = useDeleteBudgetEntry();
  const [adding, setAdding] = useState(false);

  const totalIncome = (entries ?? []).filter((e) => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0);
  const totalExpense = (entries ?? []).filter((e) => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0);
  const balance = totalIncome - totalExpense;

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Total Receitas" value={totalIncome} icon={TrendingUp} variant="income" />
        <SummaryCard label="Total Despesas" value={totalExpense} icon={TrendingDown} variant="expense" />
        <SummaryCard label="Saldo" value={balance} icon={Wallet} variant="balance" />
      </div>

      {/* Add Button / Form */}
      {adding ? (
        <AddEntryForm projectId={projectId} onDone={() => setAdding(false)} />
      ) : (
        <Button onClick={() => setAdding(true)} variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10">
          <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
        </Button>
      )}

      {/* Entries */}
      {(entries ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10 border border-dashed border-border rounded-xl">
          Nenhum lançamento ainda.
        </p>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Descrição</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Tipo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Valor</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {(entries ?? []).map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {format(new Date(entry.date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3 text-foreground">{entry.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        entry.type === 'income'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {entry.type === 'income' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {entry.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium tabular-nums ${
                      entry.type === 'income' ? 'text-primary' : 'text-destructive'
                    }`}>
                      {entry.type === 'expense' ? '-' : ''}
                      {Number(entry.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteEntry.mutate({ id: entry.id, project_id: entry.project_id })}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
