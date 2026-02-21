import { useState, useEffect, useCallback } from 'react';
import { useFlowcharts, useCreateFlowchart, useUpdateFlowchart, useDeleteFlowchart, Flowchart } from '@/hooks/useFlowcharts';
import { FlowchartCanvas } from './flowchart/FlowchartCanvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Plus,
    GitBranchPlus,
    Trash2,
    Search,
    ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectFlowchartProps {
    projectId: string;
}

export function ProjectFlowchart({ projectId }: ProjectFlowchartProps) {
    const { data: flowcharts, isLoading } = useFlowcharts(projectId);
    const createFlowchart = useCreateFlowchart();
    const updateFlowchart = useUpdateFlowchart();
    const deleteFlowchart = useDeleteFlowchart();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState('');
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [toDelete, setToDelete] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const selectedFlowchart = flowcharts?.find((f) => f.id === selectedId) ?? null;

    // Auto-select first
    useEffect(() => {
        if (flowcharts && flowcharts.length > 0 && !selectedId) {
            setSelectedId(flowcharts[0].id);
        }
    }, [flowcharts, selectedId]);

    // Update title when selection changes
    useEffect(() => {
        if (selectedFlowchart) {
            setTitleValue(selectedFlowchart.title);
        }
    }, [selectedFlowchart?.id]);

    const handleCreate = async () => {
        const fc = await createFlowchart.mutateAsync({ project_id: projectId });
        setSelectedId(fc.id);
    };

    const handleSaveTitle = () => {
        if (selectedFlowchart && titleValue.trim() && titleValue !== selectedFlowchart.title) {
            updateFlowchart.mutate({
                id: selectedFlowchart.id,
                project_id: projectId,
                title: titleValue.trim(),
            });
        }
        setEditingTitle(false);
    };

    const handleSaveData = useCallback((data: { mode: string; nodes: any[]; edges: any[] }) => {
        if (selectedFlowchart) {
            updateFlowchart.mutate({
                id: selectedFlowchart.id,
                project_id: projectId,
                data,
            });
        }
    }, [selectedFlowchart?.id, projectId, updateFlowchart]);

    const handleDelete = async () => {
        if (!toDelete) return;
        await deleteFlowchart.mutateAsync({ id: toDelete, project_id: projectId });
        if (selectedId === toDelete) {
            const remaining = flowcharts?.filter((f) => f.id !== toDelete);
            setSelectedId(remaining?.[0]?.id ?? null);
        }
        setToDelete(null);
        setDeleteOpen(false);
    };

    const filteredFlowcharts = flowcharts?.filter(
        (f) => f.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

    if (isLoading) {
        return (
            <div className="flex gap-4 h-[calc(100vh-220px)]">
                <div className="w-64 space-y-2">
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                </div>
                <Skeleton className="flex-1 rounded-lg" />
            </div>
        );
    }

    const showCanvas = selectedFlowchart !== null;

    return (
        <div className="flex gap-0 sm:gap-4 h-[calc(100vh-220px)]">
            {/* Flowcharts List Sidebar */}
            <div
                className={`${showCanvas ? 'hidden sm:flex' : 'flex'
                    } w-full sm:w-72 flex-shrink-0 flex-col bg-card border border-border rounded-2xl overflow-hidden`}
            >
                {/* Header */}
                <div className="p-3 border-b border-border space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Fluxogramas</h3>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCreate}
                            disabled={createFlowchart.isPending}
                            className="h-7 w-7 p-0 text-primary hover:bg-primary/10"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar fluxogramas..."
                            className="h-8 pl-8 text-xs bg-muted border-border"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredFlowcharts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <GitBranchPlus className="w-8 h-8 text-muted-foreground/40 mb-2" />
                            <p className="text-xs text-muted-foreground">
                                {searchQuery ? 'Nenhum fluxograma encontrado' : 'Nenhum fluxograma ainda'}
                            </p>
                            {!searchQuery && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCreate}
                                    className="text-xs mt-2 text-primary hover:bg-primary/10"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Criar fluxograma
                                </Button>
                            )}
                        </div>
                    )}
                    {filteredFlowcharts.map((fc) => (
                        <button
                            key={fc.id}
                            onClick={() => setSelectedId(fc.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all group ${fc.id === selectedId
                                ? 'bg-primary/10 border border-primary/30'
                                : 'hover:bg-muted/50 border border-transparent'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-1">
                                <p
                                    className={`text-sm font-medium truncate ${fc.id === selectedId ? 'text-primary' : 'text-foreground'
                                        }`}
                                >
                                    {fc.title}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setToDelete(fc.id);
                                        setDeleteOpen(true);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 rounded hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                {fc.updated_at
                                    ? format(new Date(fc.updated_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })
                                    : ''}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Canvas Area */}
            <div
                className={`${showCanvas ? 'flex' : 'hidden sm:flex'
                    } flex-1 flex-col bg-card border border-border rounded-2xl overflow-hidden`}
            >
                {selectedFlowchart ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-2 p-3 border-b border-border">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setSelectedId(null)}
                                className="sm:hidden h-8 w-8 text-muted-foreground"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>

                            {editingTitle ? (
                                <Input
                                    value={titleValue}
                                    onChange={(e) => setTitleValue(e.target.value)}
                                    onBlur={handleSaveTitle}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                                    autoFocus
                                    className="h-8 text-lg font-bold bg-transparent border-none px-0 focus-visible:ring-0 text-foreground"
                                />
                            ) : (
                                <h2
                                    onClick={() => setEditingTitle(true)}
                                    className="text-sm font-bold text-foreground cursor-text hover:text-primary transition-colors flex-1 truncate"
                                >
                                    {selectedFlowchart.title}
                                </h2>
                            )}
                        </div>

                        {/* Canvas */}
                        <div className="flex-1 overflow-hidden">
                            <FlowchartCanvas
                                key={selectedFlowchart.id}
                                initialData={selectedFlowchart.data}
                                onSave={handleSaveData}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <GitBranchPlus className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                            <p className="text-sm text-muted-foreground">
                                Selecione um fluxograma ou crie um novo
                            </p>
                            <Button
                                size="sm"
                                onClick={handleCreate}
                                className="gradient-teal text-primary-foreground hover:opacity-90"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Novo Fluxograma
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir fluxograma?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Esta ação é irreversível. O fluxograma será permanentemente removido.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
