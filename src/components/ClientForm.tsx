import { useState, useEffect } from 'react';
import { Client, ClientInput } from '@/types/client';
import { useCreateClient, useUpdateClient } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Building2, User, Mail, Phone, MapPin, FileText, ChevronRight, ChevronLeft, CheckCircle2, Save } from 'lucide-react';

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

    const [step, setStep] = useState(1);
    const totalSteps = 4;

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

    const nextStep = () => setStep(s => Math.min(totalSteps, s + 1));
    const prevStep = () => setStep(s => Math.max(1, s - 1));

    const canGoNext = () => {
        if (step === 1) {
            if (type === 'pf') return name.trim().length > 0;
            if (type === 'pj') return companyName.trim().length > 0;
        }
        return true;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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

    const steps = [
        { id: 1, label: 'Dados', icon: type === 'pf' ? User : Building2 },
        { id: 2, label: 'Contato', icon: Mail },
        { id: 3, label: 'Endereço', icon: MapPin },
        { id: 4, label: 'Resumo', icon: CheckCircle2 },
    ];

    const inputClass = "bg-background/50 border-border/50 focus:border-primary/50 transition-colors duration-200 h-11";
    const sectionClass = "space-y-6 animate-in fade-in slide-in-from-right-4 duration-500";

    return (
        <div className="flex flex-col h-full relative">
            {/* Stepper Header */}
            <div className="mb-8 relative">
                <div className="flex items-center justify-between relative z-10">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        const isActive = step === s.id;
                        const isCompleted = step > s.id;
                        return (
                            <div key={s.id} className="flex flex-col items-center gap-2 w-1/4 relative">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-110'
                                            : isCompleted
                                                ? 'bg-primary/20 text-primary border-2 border-primary'
                                                : 'bg-muted/50 text-muted-foreground border-2 border-muted'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 w-full h-[2px] bg-muted -z-0 translate-y-[-50%] px-[12.5%]" />
                {/* Progress Bar Fill */}
                <div
                    className="absolute top-5 left-[12.5%] h-[2px] bg-primary -z-0 translate-y-[-50%] transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                    style={{ width: `${((step - 1) / (totalSteps - 1)) * 75}%` }}
                />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (step === totalSteps) handleSubmit(); else nextStep(); }} className="flex-1 space-y-6">

                {/* Step 1: Dados Básicos */}
                {step === 1 && (
                    <div className={sectionClass}>
                        <div className="flex items-center justify-center gap-4 p-4 bg-muted/20 border border-border/50 rounded-2xl mb-6 backdrop-blur-sm">
                            <span className={`text-sm font-semibold transition-colors flex items-center gap-2 ${type === 'pf' ? 'text-primary' : 'text-muted-foreground'}`}>
                                <User className="w-4 h-4" />Pessoa Física
                            </span>
                            <Switch
                                checked={type === 'pj'}
                                onCheckedChange={(checked) => setType(checked ? 'pj' : 'pf')}
                                className="data-[state=checked]:bg-primary"
                            />
                            <span className={`text-sm font-semibold transition-colors flex items-center gap-2 ${type === 'pj' ? 'text-primary' : 'text-muted-foreground'}`}>
                                <Building2 className="w-4 h-4" />Pessoa Jurídica
                            </span>
                        </div>

                        {type === 'pf' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-1">
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-foreground/80 font-medium">Nome Completo <span className="text-destructive">*</span></Label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: João da Silva" required className={inputClass} autoFocus />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium">CPF</Label>
                                    <Input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium">RG</Label>
                                    <Input value={rg} onChange={(e) => setRg(e.target.value)} placeholder="00.000.000-0" className={inputClass} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-foreground/80 font-medium">Data de Nascimento</Label>
                                    <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-1">
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-foreground/80 font-medium">Razão Social <span className="text-destructive">*</span></Label>
                                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Empresa Ltda" required className={inputClass} autoFocus />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-foreground/80 font-medium">Nome Fantasia</Label>
                                    <Input value={fantasyName} onChange={(e) => setFantasyName(e.target.value)} placeholder="Nome comercial" className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium">CNPJ</Label>
                                    <Input value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} placeholder="00.000.000/0000-00" className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium">Inscrição Estadual</Label>
                                    <Input value={stateRegistration} onChange={(e) => setStateRegistration(e.target.value)} placeholder="000.000.000.000" className={inputClass} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Contato */}
                {step === 2 && (
                    <div className={sectionClass}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-1">
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-foreground/80 font-medium">Email</Label>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" className={inputClass} autoFocus />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80 font-medium">WhatsApp</Label>
                                <Input value={whatsapp} onChange={(e) => setWhatsapp(formatPhone(e.target.value))} placeholder="(00) 00000-0000" className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80 font-medium">Telefone Fixo</Label>
                                <Input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(00) 0000-0000" className={inputClass} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Endereço */}
                {step === 3 && (
                    <div className={sectionClass}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 p-1">
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-foreground/80 font-medium">CEP</Label>
                                <Input value={zipCode} onChange={(e) => setZipCode(formatCEP(e.target.value))} placeholder="00000-000" className={inputClass} autoFocus />
                            </div>
                            <div className="md:col-span-2 space-y-2"></div>

                            <div className="md:col-span-3 space-y-2">
                                <Label className="text-foreground/80 font-medium">Rua / Logradouro</Label>
                                <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Rua das Flores, Avenida Brasil..." className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80 font-medium">Número</Label>
                                <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="123" className={inputClass} />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-foreground/80 font-medium">Complemento</Label>
                                <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, Sala, Bloco..." className={inputClass} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-foreground/80 font-medium">Bairro</Label>
                                <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Centro" className={inputClass} />
                            </div>

                            <div className="md:col-span-3 space-y-2">
                                <Label className="text-foreground/80 font-medium">Cidade</Label>
                                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="São Paulo" className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80 font-medium">UF</Label>
                                <Input value={state} onChange={(e) => setState(e.target.value.toUpperCase())} placeholder="SP" maxLength={2} className={inputClass} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Resumo & Observações */}
                {step === 4 && (
                    <div className={sectionClass}>
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-foreground/80 font-medium text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" /> Observações (Opcional)
                                </Label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Adicione qualquer detalhe importante sobre este cliente..."
                                    rows={4}
                                    className={`${inputClass} resize-none min-h-[120px]`}
                                    autoFocus
                                />
                            </div>

                            <div className="bg-muted/10 border border-border/50 rounded-2xl p-5 space-y-4">
                                <h4 className="font-semibold text-foreground flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                    Resumo do Cadastro
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Nome / Razão Social</p>
                                        <p className="font-medium text-foreground">{type === 'pf' ? (name || '-') : (companyName || '-')}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">{type === 'pf' ? 'CPF' : 'CNPJ'}</p>
                                        <p className="font-medium text-foreground">{type === 'pf' ? (cpf || '-') : (cnpj || '-')}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Email</p>
                                        <p className="font-medium text-foreground">{email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Celular / WhatsApp</p>
                                        <p className="font-medium text-foreground">{whatsapp || phone || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Navigation */}
                <div className="flex md:items-center justify-between pt-6 mt-4 border-t border-border/50 gap-4 flex-col-reverse md:flex-row">
                    {onCancel ? (
                        <Button type="button" variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-foreground w-full md:w-auto">
                            Cancelar
                        </Button>
                    ) : (
                        <div />
                    )}

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        {step > 1 && (
                            <Button type="button" variant="outline" onClick={prevStep} className="border-border/50 hover:bg-muted/50 h-11 px-5 flex-1 md:flex-none">
                                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
                            </Button>
                        )}

                        {step < totalSteps ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                disabled={!canGoNext()}
                                className="gradient-teal text-primary-foreground font-semibold hover:opacity-90 h-11 px-8 shadow-lg shadow-primary/20 flex-1 md:flex-none"
                            >
                                Próximo <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isLoading || !canGoNext()}
                                className="gradient-teal text-primary-foreground font-semibold hover:opacity-90 glow-teal h-11 px-8 shadow-lg shadow-primary/20 flex-1 md:flex-none transition-transform hover:scale-105"
                            >
                                {isLoading ? (
                                    'Salvando...'
                                ) : (
                                    <><Save className="w-4 h-4 mr-2" /> {client ? 'Salvar Alterações' : 'Concluir Cadastro'}</>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

