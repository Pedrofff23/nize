import { useState } from 'react';
import { Eye, EyeOff, Copy, Pencil, Trash2, Check, X, ExternalLink, Globe, User, KeyRound, StickyNote, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CredentialData {
    id: string;
    title: string;
    username: string | null;
    password: string | null;
    url: string | null;
    notes: string | null;
    category: string;
}

interface CredentialCardProps {
    credential: CredentialData;
    onUpdate: (data: Partial<CredentialData> & { id: string }) => void;
    onDelete: (id: string) => void;
}

export function CredentialCard({ credential, onUpdate, onDelete }: CredentialCardProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(credential.title);
    const [username, setUsername] = useState(credential.username ?? '');
    const [password, setPassword] = useState(credential.password ?? '');
    const [url, setUrl] = useState(credential.url ?? '');
    const [notes, setNotes] = useState(credential.notes ?? '');
    const [category, setCategory] = useState(credential.category);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copiado!`);
    };

    const handleSave = () => {
        onUpdate({
            id: credential.id,
            title,
            username: username || null,
            password: password || null,
            url: url || null,
            notes: notes || null,
            category,
        });
        setEditing(false);
    };

    const handleCancel = () => {
        setTitle(credential.title);
        setUsername(credential.username ?? '');
        setPassword(credential.password ?? '');
        setUrl(credential.url ?? '');
        setNotes(credential.notes ?? '');
        setCategory(credential.category);
        setEditing(false);
    };

    // Gera cor baseada na category
    const categoryColors: Record<string, string> = {
        geral: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        hosting: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        api: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        database: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        email: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        social: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        dominio: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        servidor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        outro: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };

    const badgeClass = categoryColors[credential.category] ?? categoryColors.geral;

    if (editing) {
        return (
            <div className="bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl p-6 space-y-4 shadow-2xl relative overflow-hidden transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                <div className="relative z-10 space-y-4">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título *"
                        className="bg-background/50 border-white/10 dark:border-white/5 h-10 text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Usuário / Email"
                                className="bg-background/50 border-white/10 dark:border-white/5 h-10 text-sm pl-9 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg"
                            />
                        </div>
                        <div className="relative group">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                            <Input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Senha"
                                type="password"
                                className="bg-background/50 border-white/10 dark:border-white/5 h-10 text-sm pl-9 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="relative group">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="URL (https://...)"
                            className="bg-background/50 border-white/10 dark:border-white/5 h-10 text-sm pl-9 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg"
                        />
                    </div>
                    <div className="relative group">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-background/50 border border-white/10 dark:border-white/5 rounded-lg h-10 text-sm pl-9 pr-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
                        >
                            <option value="geral">Geral</option>
                            <option value="hosting">Hosting</option>
                            <option value="api">API</option>
                            <option value="database">Database</option>
                            <option value="email">Email</option>
                            <option value="social">Social</option>
                            <option value="dominio">Domínio</option>
                            <option value="servidor">Servidor</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Observações..."
                        rows={2}
                        className="bg-background/50 border-white/10 dark:border-white/5 text-sm resize-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg"
                    />
                    <div className="flex gap-2 pt-2">
                        <Button onClick={handleSave} size="sm" className="gradient-teal text-primary-foreground hover:opacity-90 shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all rounded-lg font-medium">
                            <Check className="w-4 h-4 mr-1.5" /> Salvar Alterações
                        </Button>
                        <Button onClick={handleCancel} size="sm" variant="outline" className="border-white/10 dark:border-white/5 hover:bg-white/5 rounded-lg transition-all font-medium">
                            <X className="w-4 h-4 mr-1.5" /> Cancelar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:shadow-primary/10 relative overflow-hidden flex flex-col h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                            <KeyRound className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-[15px] truncate group-hover:text-primary transition-colors">{credential.title}</h3>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border mt-1 shadow-sm font-bold ${badgeClass}`}>
                                {credential.category}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditing(true)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(credential.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Fields */}
                <div className="space-y-2 flex-1">
                    {credential.username && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-background/30 hover:bg-background/50 border border-transparent hover:border-white/5 transition-all group/field">
                            <User className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                            <span className="text-muted-foreground/80 text-xs flex-shrink-0 font-medium">Usuário:</span>
                            <span className="text-foreground truncate flex-1 font-mono text-xs">{credential.username}</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => copyToClipboard(credential.username!, 'Usuário')}
                                className="h-6 w-6 text-muted-foreground/50 hover:text-primary opacity-0 group-hover/field:opacity-100 flex-shrink-0 transition-opacity"
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    )}

                    {credential.password && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-background/30 hover:bg-background/50 border border-transparent hover:border-white/5 transition-all group/field">
                            <KeyRound className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                            <span className="text-muted-foreground/80 text-xs flex-shrink-0 font-medium">Senha:</span>
                            <span className="text-foreground truncate flex-1 font-mono text-xs">
                                {showPassword ? credential.password : '••••••••••'}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity flex-shrink-0">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="h-6 w-6 text-muted-foreground/60 hover:text-foreground hover:bg-white/5 rounded-md"
                                >
                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(credential.password!, 'Senha')}
                                    className="h-6 w-6 text-muted-foreground/60 hover:text-primary hover:bg-primary/10 rounded-md"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {credential.url && (
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-background/30 hover:bg-background/50 border border-transparent hover:border-white/5 transition-all group/field">
                            <Globe className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                            <span className="text-muted-foreground/80 text-xs flex-shrink-0 font-medium">URL:</span>
                            <a
                                href={credential.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary-focus hover:underline truncate flex-1 text-xs transition-colors"
                            >
                                {credential.url}
                            </a>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => window.open(credential.url!, '_blank')}
                                className="h-6 w-6 text-muted-foreground/50 hover:text-primary opacity-0 group-hover/field:opacity-100 flex-shrink-0 transition-opacity"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    )}

                    {credential.notes && (
                        <div className="flex items-start gap-2 text-sm mt-3 pt-3 border-t border-white/5">
                            <StickyNote className="w-4 h-4 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                            <p className="text-muted-foreground/90 text-xs leading-relaxed">{credential.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
