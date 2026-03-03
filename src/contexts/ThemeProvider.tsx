import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type AppTheme = 'green' | 'black' | 'white' | 'silver' | 'gold' | 'blue' | 'pink' | 'red';

interface ThemeContextValue {
    theme: AppTheme;
    setTheme: (t: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'green',
    setTheme: () => { },
});

const STORAGE_KEY = 'app-theme';
const THEME_CLASS_PREFIX = 'theme-';

const THEME_CLASSES: Record<AppTheme, string> = {
    green: '',
    black: 'theme-black',
    white: 'theme-white',
    silver: 'theme-silver',
    gold: 'theme-gold',
    blue: 'theme-blue',
    pink: 'theme-pink',
    red: 'theme-red',
};

function applyTheme(theme: AppTheme) {
    const html = document.documentElement;
    // Remove all theme classes
    Object.values(THEME_CLASSES)
        .filter(Boolean)
        .forEach((c) => html.classList.remove(c));
    // Add the new one (green has no class – uses :root defaults)
    const cls = THEME_CLASSES[theme];
    if (cls) html.classList.add(cls);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<AppTheme>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return (stored as AppTheme) ?? 'green';
    });

    // Apply on mount
    useEffect(() => {
        applyTheme(theme);
    }, []);

    const setTheme = (t: AppTheme) => {
        setThemeState(t);
        localStorage.setItem(STORAGE_KEY, t);
        applyTheme(t);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
