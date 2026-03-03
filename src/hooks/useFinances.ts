import { useMemo } from 'react';
import { useProjects } from './useProjects';

export interface FinanceSummary {
    /** Soma de todos os price (implementação) */
    totalOneTime: number;
    /** Soma de todos os monthly_value ativos (manutenção/mês) */
    recurringMonthly: number;
    /** recurringMonthly * 12 */
    recurringAnnual: number;
    /** totalOneTime + recurringAnnual */
    totalEstimated: number;
    /** Projetos ativos com monthly_value */
    activeRecurringCount: number;
    /** Total de projetos */
    totalProjects: number;
    /** Projetos ativos */
    totalActiveProjects: number;
}

export function useFinances() {
    const { data: projects, isLoading, error } = useProjects();

    const summary = useMemo<FinanceSummary>(() => {
        if (!projects) {
            return {
                totalOneTime: 0,
                recurringMonthly: 0,
                recurringAnnual: 0,
                totalEstimated: 0,
                activeRecurringCount: 0,
                totalProjects: 0,
                totalActiveProjects: 0,
            };
        }

        const activeProjects = projects.filter((p) => p.status === 'ativo');

        // Implementação (price) — soma de TODOS os projetos
        const totalOneTime = projects.reduce((sum, p) => sum + (p.price ?? 0), 0);

        // Manutenção (monthly_value) — apenas projetos ATIVOS
        const activeWithRecurring = activeProjects.filter((p) => p.monthly_value && p.monthly_value > 0);
        const recurringMonthly = activeWithRecurring.reduce((sum, p) => sum + (p.monthly_value ?? 0), 0);

        return {
            totalOneTime,
            recurringMonthly,
            recurringAnnual: recurringMonthly * 12,
            totalEstimated: totalOneTime + recurringMonthly * 12,
            activeRecurringCount: activeWithRecurring.length,
            totalProjects: projects.length,
            totalActiveProjects: activeProjects.length,
        };
    }, [projects]);

    const projectsList = useMemo(() => {
        if (!projects) return [];
        return projects.map((p) => ({
            ...p,
            hasRecurring: !!(p.monthly_value && p.monthly_value > 0),
            hasOneTime: !!(p.price && p.price > 0),
        }));
    }, [projects]);

    return { summary, projectsList, isLoading, error };
}
