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
            <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-2xl p-5 space-y-3 shadow-lg shadow-primary/5 transition-all duration-300">
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título *"
                    className="bg-background/50 border-border h-9 text-sm font-medium"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Usuário / Email"
                            className="bg-background/50 border-border h-9 text-sm pl-9"
                        />
                    </div>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                        <Input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Senha"
                            type="password"
                            className="bg-background/50 border-border h-9 text-sm pl-9"
                        />
                    </div>
                </div>
                <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="URL (https://...)"
                        className="bg-background/50 border-border h-9 text-sm pl-9"
                    />
                </div>
                <div className="relative">
                    <Tag className="absolute left-3 top-3 w-3.5 h-3.5 text-muted-foreground/50" />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-background/50 border border-border rounded-md h-9 text-sm pl-9 pr-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/50"
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
                    className="bg-background/50 border-border text-sm resize-none"
                />
                <div className="flex gap-2 pt-1">
                    <Button onClick={handleSave} size="sm" className="gradient-teal text-primary-foreground hover:opacity-90">
                        <Check className="w-3.5 h-3.5 mr-1.5" /> Salvar
                    </Button>
                    <Button onClick={handleCancel} size="sm" variant="outline" className="border-border">
                        <X className="w-3.5 h-3.5 mr-1.5" /> Cancelar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="group bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center flex-shrink-0 shadow-md">
                        <KeyRound className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate">{credential.title}</h3>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border mt-1 ${badgeClass}`}>
                            {credential.category}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing(true)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(credential.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Fields */}
            <div className="space-y-2">
                {credential.username && (
                    <div className="flex items-center gap-2 text-sm">
                        <User className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
                        <span className="text-muted-foreground text-xs flex-shrink-0">Usuário:</span>
                        <span className="text-foreground truncate flex-1 font-mono text-xs">{credential.username}</span>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyToClipboard(credential.username!, 'Usuário')}
                            className="h-6 w-6 text-muted-foreground/50 hover:text-primary flex-shrink-0"
                        >
                            <Copy className="w-3 h-3" />
                        </Button>
                    </div>
                )}

                {credential.password && (
                    <div className="flex items-center gap-2 text-sm">
                        <KeyRound className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
                        <span className="text-muted-foreground text-xs flex-shrink-0">Senha:</span>
                        <span className="text-foreground truncate flex-1 font-mono text-xs">
                            {showPassword ? credential.password : '••••••••••'}
                        </span>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowPassword(!showPassword)}
                            className="h-6 w-6 text-muted-foreground/50 hover:text-foreground flex-shrink-0"
                        >
                            {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyToClipboard(credential.password!, 'Senha')}
                            className="h-6 w-6 text-muted-foreground/50 hover:text-primary flex-shrink-0"
                        >
                            <Copy className="w-3 h-3" />
                        </Button>
                    </div>
                )}

                {credential.url && (
                    <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
                        <span className="text-muted-foreground text-xs flex-shrink-0">URL:</span>
                        <a
                            href={credential.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate flex-1 text-xs"
                        >
                            {credential.url}
                        </a>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => window.open(credential.url!, '_blank')}
                            className="h-6 w-6 text-muted-foreground/50 hover:text-primary flex-shrink-0"
                        >
                            <ExternalLink className="w-3 h-3" />
                        </Button>
                    </div>
                )}

                {credential.notes && (
                    <div className="flex items-start gap-2 text-sm mt-2 pt-2 border-t border-border/30">
                        <StickyNote className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground text-xs leading-relaxed">{credential.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
