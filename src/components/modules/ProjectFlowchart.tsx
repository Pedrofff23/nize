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
                    } w-full sm:w-72 flex-shrink-0 flex-col bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300`}
            >
                {/* Header */}
                <div className="p-4 border-b border-border/50 space-y-3 bg-gradient-to-b from-background/50 to-transparent">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold tracking-tight text-foreground/90">Fluxogramas</h3>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCreate}
                            disabled={createFlowchart.isPending}
                            className="h-7 w-7 p-0 text-primary hover:bg-primary/20 hover:text-primary transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar fluxogramas..."
                            className="h-8 pl-8 text-xs bg-background/50 border-white/10 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg"
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
                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${fc.id === selectedId
                                ? 'bg-primary/10 border-primary/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                                : 'hover:bg-muted/40 border-transparent hover:border-white/5'
                                } border`}
                        >
                            {fc.id === selectedId && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50 pointer-events-none" />
                            )}
                            <div className="flex items-start justify-between gap-1 relative z-10">
                                <p
                                    className={`text-sm font-medium truncate transition-colors ${fc.id === selectedId ? 'text-primary' : 'text-foreground/80 group-hover:text-foreground'
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
                                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 rounded-md hover:bg-destructive/15"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                                </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground/70 mt-1 relative z-10 font-medium">
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
                    } flex-1 flex-col bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden relative`}
            >
                {selectedFlowchart ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-3 p-3 lg:p-4 border-b border-white/5 bg-background/20 backdrop-blur-sm relative z-20">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setSelectedId(null)}
                                className="sm:hidden h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
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
                                    className="h-8 text-base lg:text-lg font-bold bg-white/5 border-white/10 px-3 focus-visible:ring-1 focus-visible:ring-primary/50 text-foreground rounded-md w-full max-w-sm"
                                />
                            ) : (
                                <h2
                                    onClick={() => setEditingTitle(true)}
                                    className="text-base lg:text-lg font-semibold text-foreground/90 cursor-text hover:text-primary transition-colors flex-1 truncate px-1"
                                >
                                    {selectedFlowchart.title}
                                </h2>
                            )}
                        </div>

                        {/* Canvas */}
                        <div className="flex-1 overflow-hidden relative">
                            {/* Inner glow effect for the canvas area */}
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_0_60px_rgba(0,0,0,0.4)] z-10 mix-blend-overlay" />
                            <FlowchartCanvas
                                key={selectedFlowchart.id}
                                initialData={selectedFlowchart.data}
                                onSave={handleSaveData}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                        {/* Decorative background gradients for empty state */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none mix-blend-screen" />
                        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] opacity-40 pointer-events-none mix-blend-screen" />
                        
                        <div className="text-center space-y-4 relative z-10 p-8 rounded-2xl bg-card/10 backdrop-blur-md border border-white/5 shadow-2xl max-w-sm transform transition-all hover:scale-105 duration-500">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto border border-primary/20 shadow-inner">
                                <GitBranchPlus className="w-8 h-8 text-primary/80" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-lg font-semibold text-foreground tracking-tight">Comece a Mapear</h3>
                                <p className="text-sm text-muted-foreground/80 font-medium">
                                    Selecione um fluxograma ao lado ou crie um novo para organizar suas ideias.
                                </p>
                            </div>
                            <Button
                                size="default"
                                onClick={handleCreate}
                                className="gradient-teal text-primary-foreground hover:opacity-90 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transition-all rounded-xl font-semibold"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Novo Fluxograma
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
