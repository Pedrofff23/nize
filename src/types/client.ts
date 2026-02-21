export interface Client {
    id: string;
    type: 'pf' | 'pj';
    // Pessoa Física
    name: string;
    cpf: string | null;
    rg: string | null;
    birth_date: string | null;
    // Pessoa Jurídica
    company_name: string | null;
    fantasy_name: string | null;
    cnpj: string | null;
    state_registration: string | null;
    // Contato
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    // Endereço
    zip_code: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    // Observações
    notes: string | null;
    // Metadata
    created_at: string;
    updated_at: string;
}

export type ClientInput = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
