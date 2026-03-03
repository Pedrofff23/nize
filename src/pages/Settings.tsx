import { useState } from 'react';
import { AppBreadcrumb } from '@/components/AppBreadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTechnologies, useCreateTechnology, useUpdateTechnology, useDeleteTechnology } from '@/hooks/useTechnologies';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useTags';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, Check, X, Cpu, TagIcon } from 'lucide-react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#64748b', '#a855f7',
];

type ActiveTab = 'technologies' | 'tags';

interface ItemFormProps {
    name: string;
    color: string;
    onNameChange: (v: string) => void;
    onColorChange: (v: string) => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
    saveLabel?: string;
}

function ItemForm({ name, color, onNameChange, onColorChange, onSave, onCancel, saving, saveLabel = 'Salvar' }: ItemFormProps) {
    return (
        <div className="bg-muted/30 border border-primary/30 rounded-xl p-4 space-y-3">
            <Input
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Nome..."
                className="bg-background border-border"
                autoFocus
            />
            <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Cor</span>
                <div className="flex flex-wrap gap-2">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => onColorChange(c)}
                            className={cn(
                                'w-7 h-7 rounded-full transition-all border-2',
                                color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                            )}
                            style={{ backgroundColor: c }}
                        >
                            {color === c && <Check className="w-3.5 h-3.5 text-white m-auto" />}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <Button onClick={onSave} size="sm" disabled={!name.trim() || saving}
                    className="gradient-teal text-primary-foreground hover:opacity-90">
                    {saving ? 'Salvando...' : saveLabel}
                </Button>
                <Button onClick={onCancel} size="sm" variant="outline" className="border-border">
                    Cancelar
                </Button>
            </div>
        </div>
    );
}

export default function Settings() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('technologies');

    // Technologies
    const { data: technologies, isLoading: loadingTech } = useTechnologies();
    const createTech = useCreateTechnology();
    const updateTech = useUpdateTechnology();
    const deleteTech = useDeleteTechnology();

    // Tags
    const { data: tags, isLoading: loadingTags } = useTags();
    const createTag = useCreateTag();
    const updateTag = useUpdateTag();
    const deleteTag = useDeleteTag();

    // Form state
    const [showCreate, setShowCreate] = useState(false);
    const [createName, setCreateName] = useState('');
    const [createColor, setCreateColor] = useState('#6366f1');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');

    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const resetCreate = () => { setShowCreate(false); setCreateName(''); setCreateColor('#6366f1'); };
    const startEdit = (id: string, name: string, color: string) => {
        setEditingId(id);
        setEditName(name);
        setEditColor(color);
        resetCreate();
    };

    const handleCreate = async () => {
        if (!createName.trim()) return;
        if (activeTab === 'technologies') {
            await createTech.mutateAsync({ name: createName.trim(), color: createColor });
        } else {
            await createTag.mutateAsync({ name: createName.trim(), color: createColor });
        }
        resetCreate();
    };

    const handleUpdate = async () => {
        if (!editingId || !editName.trim()) return;
        if (activeTab === 'technologies') {
            await updateTech.mutateAsync({ id: editingId, name: editName.trim(), color: editColor });
        } else {
            await updateTag.mutateAsync({ id: editingId, name: editName.trim(), color: editColor });
        }
        setEditingId(null);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        if (activeTab === 'technologies') {
            await deleteTech.mutateAsync(deleteTarget.id);
        } else {
            await deleteTag.mutateAsync(deleteTarget.id);
        }
        setDeleteTarget(null);
    };

    const items = activeTab === 'technologies' ? technologies : tags;
    const isLoading = activeTab === 'technologies' ? loadingTech : loadingTags;
    const isSaving = createTech.isPending || createTag.isPending || updateTech.isPending || updateTag.isPending;

    const tabs = [
        { key: 'technologies' as ActiveTab, label: 'Tecnologias', icon: Cpu },
        { key: 'tags' as ActiveTab, label: 'Tags', icon: TagIcon },
    ];

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <AppBreadcrumb items={[{ label: 'Configurações' }]} />

            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Configurações</h1>
                <p className="text-muted-foreground text-sm mt-1">Gerencie tecnologias e tags disponíveis para os seus projetos</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setEditingId(null); resetCreate(); }}
                        className={cn(
                            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                            activeTab === tab.key
                                ? 'gradient-teal text-primary-foreground shadow-lg glow-teal'
                                : 'bg-card/80 backdrop-blur-md text-muted-foreground hover:text-foreground hover:bg-white/5 border border-border/50'
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <Card className="bg-card/80 backdrop-blur-md border-border/50">
                <CardContent className="p-6 space-y-4">
                    {/* Header with Add button */}
                    <div className="flex items-center justify-between">
                        <Label className="text-base">
                            {activeTab === 'technologies' ? 'Tecnologias' : 'Tags'} cadastradas
                        </Label>
                        {!showCreate && !editingId && (
                            <Button
                                onClick={() => setShowCreate(true)}
                                size="sm"
                                className="gradient-teal text-primary-foreground hover:opacity-90 rounded-full px-4 shadow-md"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                {activeTab === 'technologies' ? 'Nova Tecnologia' : 'Nova Tag'}
                            </Button>
                        )}
                    </div>

                    {/* Create form */}
                    {showCreate && (
                        <ItemForm
                            name={createName}
                            color={createColor}
                            onNameChange={setCreateName}
                            onColorChange={setCreateColor}
                            onSave={handleCreate}
                            onCancel={resetCreate}
                            saving={isSaving}
                            saveLabel="Criar"
                        />
                    )}

                    {/* Items list */}
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : !items || items.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-border rounded-xl">
                            <p className="text-muted-foreground text-sm">
                                Nenhum{activeTab === 'technologies' ? 'a tecnologia' : 'a tag'} cadastrad{activeTab === 'technologies' ? 'a' : 'a'}.
                            </p>
                            {!showCreate && (
                                <Button onClick={() => setShowCreate(true)} variant="outline" size="sm" className="mt-3 border-primary/40 text-primary hover:bg-primary/10">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Criar primeir{activeTab === 'technologies' ? 'a' : 'a'}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item) => {
                                if (editingId === item.id) {
                                    return (
                                        <ItemForm
                                            key={item.id}
                                            name={editName}
                                            color={editColor}
                                            onNameChange={setEditName}
                                            onColorChange={setEditColor}
                                            onSave={handleUpdate}
                                            onCancel={() => setEditingId(null)}
                                            saving={isSaving}
                                        />
                                    );
                                }

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/20 border border-border/30 hover:border-border/60 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="font-medium text-foreground text-sm">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                                onClick={() => startEdit(item.id, item.name, item.color)}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive">Excluir {activeTab === 'technologies' ? 'tecnologia' : 'tag'}</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Tem certeza que deseja excluir <strong>{deleteTarget?.name}</strong>? Ela será removida de todos os projetos associados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                        <Button variant="destructive" onClick={handleDelete}>
                            Excluir
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
