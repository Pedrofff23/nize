import { useState, useEffect } from 'react';
import { Client, ClientInput } from '@/types/client';
import { useCreateClient, useUpdateClient } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Building2, User, Mail, Phone, MapPin, FileText } from 'lucide-react';

interface ClientFormProps {
    client?: Client;
    onSuccess?: () => void;
    onCancel?: () => void;
}

function formatCPF(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatCNPJ(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
        return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

function formatCEP(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/(\d{5})(\d)/, '$1-$2');
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
    const createClient = useCreateClient();
    const updateClient = useUpdateClient();

    const [type, setType] = useState<'pf' | 'pj'>(client?.type ?? 'pf');
    // PF
    const [name, setName] = useState(client?.name ?? '');
    const [cpf, setCpf] = useState(client?.cpf ?? '');
    const [rg, setRg] = useState(client?.rg ?? '');
    const [birthDate, setBirthDate] = useState(client?.birth_date ?? '');
    // PJ
    const [companyName, setCompanyName] = useState(client?.company_name ?? '');
    const [fantasyName, setFantasyName] = useState(client?.fantasy_name ?? '');
    const [cnpj, setCnpj] = useState(client?.cnpj ?? '');
    const [stateRegistration, setStateRegistration] = useState(client?.state_registration ?? '');
    // Contato
    const [email, setEmail] = useState(client?.email ?? '');
    const [phone, setPhone] = useState(client?.phone ?? '');
    const [whatsapp, setWhatsapp] = useState(client?.whatsapp ?? '');
    // Endereço
    const [zipCode, setZipCode] = useState(client?.zip_code ?? '');
    const [street, setStreet] = useState(client?.street ?? '');
    const [number, setNumber] = useState(client?.number ?? '');
    const [complement, setComplement] = useState(client?.complement ?? '');
    const [neighborhood, setNeighborhood] = useState(client?.neighborhood ?? '');
    const [city, setCity] = useState(client?.city ?? '');
    const [state, setState] = useState(client?.state ?? '');
    // Notes
    const [notes, setNotes] = useState(client?.notes ?? '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const displayName = type === 'pf' ? name : (fantasyName || companyName);
        if (!displayName.trim()) return;

        const clientData: ClientInput = {
            type,
            name: type === 'pf' ? name.trim() : (companyName || fantasyName || '').trim(),
            cpf: type === 'pf' ? (cpf || null) : null,
            rg: type === 'pf' ? (rg || null) : null,
            birth_date: type === 'pf' ? (birthDate || null) : null,
            company_name: type === 'pj' ? (companyName || null) : null,
            fantasy_name: type === 'pj' ? (fantasyName || null) : null,
            cnpj: type === 'pj' ? (cnpj || null) : null,
            state_registration: type === 'pj' ? (stateRegistration || null) : null,
            email: email || null,
            phone: phone || null,
            whatsapp: whatsapp || null,
            zip_code: zipCode || null,
            street: street || null,
            number: number || null,
            complement: complement || null,
            neighborhood: neighborhood || null,
            city: city || null,
            state: state || null,
            notes: notes || null,
        };

        if (client) {
            await updateClient.mutateAsync({ id: client.id, ...clientData });
        } else {
            await createClient.mutateAsync(clientData);
        }
        onSuccess?.();
    };

    const isLoading = createClient.isPending || updateClient.isPending;

    const sectionClass = "space-y-4 p-5 bg-muted/20 border border-border/50 rounded-2xl";
    const sectionTitleClass = "flex items-center gap-2 text-sm font-semibold text-foreground mb-3";
    const inputClass = "bg-background/50 border-border/50 focus:border-primary/50";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Toggle */}
            <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-2xl">
                <span className={`text-sm font-medium transition-colors ${type === 'pf' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <User className="w-4 h-4 inline mr-1" />Pessoa Física
                </span>
                <Switch
                    checked={type === 'pj'}
                    onCheckedChange={(checked) => setType(checked ? 'pj' : 'pf')}
                />
                <span className={`text-sm font-medium transition-colors ${type === 'pj' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Building2 className="w-4 h-4 inline mr-1" />Pessoa Jurídica
                </span>
            </div>

            {/* PF Fields */}
            {type === 'pf' && (
                <div className={sectionClass}>
                    <div className={sectionTitleClass}>
                        <User className="w-4 h-4 text-primary" />
                        Dados Pessoais
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <Label>Nome Completo *</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do cliente" required className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <Label>CPF</Label>
                            <Input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <Label>RG</Label>
                            <Input value={rg} onChange={(e) => setRg(e.target.value)} placeholder="Registro Geral" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <Label>Data de Nascimento</Label>
                            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
                        </div>
                    </div>
                </div>
            )}

            {/* PJ Fields */}
            {type === 'pj' && (
                <div className={sectionClass}>
                    <div className={sectionTitleClass}>
                        <Building2 className="w-4 h-4 text-primary" />
                        Dados Empresariais
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <Label>Razão Social *</Label>
                            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Razão Social da empresa" required className={inputClass} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label>Nome Fantasia</Label>
                            <Input value={fantasyName} onChange={(e) => setFantasyName(e.target.value)} placeholder="Nome Fantasia" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <Label>CNPJ</Label>
                            <Input value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} placeholder="00.000.000/0000-00" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <Label>Inscrição Estadual</Label>
                            <Input value={stateRegistration} onChange={(e) => setStateRegistration(e.target.value)} placeholder="Inscrição Estadual" className={inputClass} />
                        </div>
                    </div>
                </div>
            )}

            {/* Contato */}
            <div className={sectionClass}>
                <div className={sectionTitleClass}>
                    <Mail className="w-4 h-4 text-primary" />
                    Contato
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" className={inputClass} />
                    </div>
                    <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(00) 0000-0000" className={inputClass} />
                    </div>
                    <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <Input value={whatsapp} onChange={(e) => setWhatsapp(formatPhone(e.target.value))} placeholder="(00) 00000-0000" className={inputClass} />
                    </div>
                </div>
            </div>

            {/* Endereço */}
            <div className={sectionClass}>
                <div className={sectionTitleClass}>
                    <MapPin className="w-4 h-4 text-primary" />
                    Endereço
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>CEP</Label>
                        <Input value={zipCode} onChange={(e) => setZipCode(formatCEP(e.target.value))} placeholder="00000-000" className={inputClass} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label>Rua</Label>
                        <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Nome da rua" className={inputClass} />
                    </div>
                    <div className="space-y-2">
                        <Label>Número</Label>
                        <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Nº" className={inputClass} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label>Complemento</Label>
                        <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, Sala, etc." className={inputClass} />
                    </div>
                    <div className="space-y-2">
                        <Label>Bairro</Label>
                        <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" className={inputClass} />
                    </div>
                    <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" className={inputClass} />
                    </div>
                    <div className="space-y-2">
                        <Label>Estado</Label>
                        <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="UF" maxLength={2} className={inputClass} />
                    </div>
                </div>
            </div>

            {/* Observações */}
            <div className={sectionClass}>
                <div className={sectionTitleClass}>
                    <FileText className="w-4 h-4 text-primary" />
                    Observações
                </div>
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informações adicionais sobre o cliente..."
                    rows={3}
                    className={`${inputClass} resize-none`}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-border">
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={isLoading} className="flex-1 gradient-teal text-primary-foreground font-semibold hover:opacity-90">
                    {isLoading ? 'Salvando...' : client ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </Button>
            </div>
        </form>
    );
}
