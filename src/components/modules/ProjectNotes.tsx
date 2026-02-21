import { useState, useEffect } from 'react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, Note } from '@/hooks/useNotes';
import { NoteEditor } from './NoteEditor';
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
    FileEdit,
    Trash2,
    Search,
    ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { JSONContent } from '@tiptap/react';

interface ProjectNotesProps {
    projectId: string;
}

export function ProjectNotes({ projectId }: ProjectNotesProps) {
    const { data: notes, isLoading } = useNotes(projectId);
    const createNote = useCreateNote();
    const updateNote = useUpdateNote();
    const deleteNote = useDeleteNote();

    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState('');
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const selectedNote = notes?.find((n) => n.id === selectedNoteId) ?? null;

    // Auto-select first note
    useEffect(() => {
        if (notes && notes.length > 0 && !selectedNoteId) {
            setSelectedNoteId(notes[0].id);
        }
    }, [notes, selectedNoteId]);

    // Update title when note changes
    useEffect(() => {
        if (selectedNote) {
            setTitleValue(selectedNote.title);
        }
    }, [selectedNote?.id]);

    const handleCreateNote = async () => {
        const note = await createNote.mutateAsync({ project_id: projectId });
        setSelectedNoteId(note.id);
    };

    const handleSaveTitle = () => {
        if (selectedNote && titleValue.trim() && titleValue !== selectedNote.title) {
            updateNote.mutate({
                id: selectedNote.id,
                project_id: projectId,
                title: titleValue.trim(),
            });
        }
        setEditingTitle(false);
    };

    const handleContentUpdate = (content: JSONContent) => {
        if (selectedNote) {
            updateNote.mutate({
                id: selectedNote.id,
                project_id: projectId,
                content: content as any,
            });
        }
    };

    const handleDeleteNote = async () => {
        if (!noteToDelete) return;
        await deleteNote.mutateAsync({ id: noteToDelete, project_id: projectId });
        if (selectedNoteId === noteToDelete) {
            const remaining = notes?.filter((n) => n.id !== noteToDelete);
            setSelectedNoteId(remaining?.[0]?.id ?? null);
        }
        setNoteToDelete(null);
        setDeleteOpen(false);
    };

    const filteredNotes = notes?.filter(
        (n) =>
            n.title.toLowerCase().includes(searchQuery.toLowerCase())
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

    // Mobile: show either list or editor
    const showEditor = selectedNote !== null;

    return (
        <div className="flex gap-0 sm:gap-4 h-[calc(100vh-220px)]">
            {/* Notes List Sidebar */}
            <div
                className={`${showEditor ? 'hidden sm:flex' : 'flex'
                    } w-full sm:w-72 flex-shrink-0 flex-col bg-card border border-border rounded-2xl overflow-hidden`}
            >
                {/* Header */}
                <div className="p-3 border-b border-border space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Notas</h3>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCreateNote}
                            disabled={createNote.isPending}
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
                            placeholder="Buscar notas..."
                            className="h-8 pl-8 text-xs bg-muted border-border"
                        />
                    </div>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredNotes.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <FileEdit className="w-8 h-8 text-muted-foreground/40 mb-2" />
                            <p className="text-xs text-muted-foreground">
                                {searchQuery ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
                            </p>
                            {!searchQuery && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCreateNote}
                                    className="text-xs mt-2 text-primary hover:bg-primary/10"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Criar nota
                                </Button>
                            )}
                        </div>
                    )}
                    {filteredNotes.map((note) => (
                        <button
                            key={note.id}
                            onClick={() => setSelectedNoteId(note.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all group ${note.id === selectedNoteId
                                    ? 'bg-primary/10 border border-primary/30'
                                    : 'hover:bg-muted/50 border border-transparent'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-1">
                                <p
                                    className={`text-sm font-medium truncate ${note.id === selectedNoteId ? 'text-primary' : 'text-foreground'
                                        }`}
                                >
                                    {note.title}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setNoteToDelete(note.id);
                                        setDeleteOpen(true);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 rounded hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                {format(new Date(note.updated_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div
                className={`${showEditor ? 'flex' : 'hidden sm:flex'
                    } flex-1 flex-col bg-card border border-border rounded-2xl overflow-hidden`}
            >
                {selectedNote ? (
                    <>
                        {/* Editor Header */}
                        <div className="flex items-center gap-2 p-4 border-b border-border">
                            {/* Back button on mobile */}
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setSelectedNoteId(null)}
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
                                    className="text-lg font-bold text-foreground cursor-text hover:text-primary transition-colors flex-1 truncate"
                                >
                                    {selectedNote.title}
                                </h2>
                            )}
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <NoteEditor
                                key={selectedNote.id}
                                content={selectedNote.content}
                                onUpdate={handleContentUpdate}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <FileEdit className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                            <p className="text-sm text-muted-foreground">
                                Selecione uma nota ou crie uma nova
                            </p>
                            <Button
                                size="sm"
                                onClick={handleCreateNote}
                                className="gradient-teal text-primary-foreground hover:opacity-90"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Nova Nota
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir nota?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Esta ação é irreversível. O conteúdo da nota será perdido.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteNote}
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
