import { useTheme, AppTheme } from '@/contexts/ThemeProvider';

const THEMES: {
    id: AppTheme;
    label: string;
    swatch: string;   // visual color for the button
    ring: string;     // ring color when active
    bg: string;       // mini preview bg
}[] = [
        {
            id: 'green',
            label: 'Verde',
            swatch: 'linear-gradient(135deg, #00E5C3, #00957E)',
            ring: '#00E5C3',
            bg: '#0a1a18',
        },
        {
            id: 'black',
            label: 'Preto',
            swatch: 'linear-gradient(135deg, #ffffff, #aaaaaa)',
            ring: '#ffffff',
            bg: '#000000',
        },
        {
            id: 'white',
            label: 'Branco',
            swatch: 'linear-gradient(135deg, #111111, #555555)',
            ring: '#111111',
            bg: '#f8f8f8',
        },
        {
            id: 'silver',
            label: 'Prata',
            swatch: 'linear-gradient(135deg, #C0C8D4, #7A8799)',
            ring: '#C0C8D4',
            bg: '#1a1f26',
        },
        {
            id: 'gold',
            label: 'Dourado',
            swatch: 'linear-gradient(135deg, #D4A017, #9A7012)',
            ring: '#D4A017',
            bg: '#1a1408',
        },
        {
            id: 'blue',
            label: 'Azul',
            swatch: 'linear-gradient(135deg, #3B9EFF, #1a5fc8)',
            ring: '#3B9EFF',
            bg: '#080f1e',
        },
        {
            id: 'pink',
            label: 'Rosa',
            swatch: 'linear-gradient(135deg, #F0599E, #a82d6a)',
            ring: '#F0599E',
            bg: '#160810',
        },
        {
            id: 'red',
            label: 'Vermelho',
            swatch: 'linear-gradient(135deg, #E83838, #9a1a1a)',
            ring: '#E83838',
            bg: '#140606',
        },
    ];

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="w-full mb-5">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60 px-1 mb-2">
                Tema
            </p>
            <div className="flex items-center gap-2">
                {THEMES.map((t) => {
                    const isActive = theme === t.id;
                    return (
                        <button
                            key={t.id}
                            title={t.label}
                            onClick={() => setTheme(t.id)}
                            className="relative flex-1 h-7 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 overflow-hidden"
                            style={{
                                background: t.swatch,
                                outline: isActive ? `2px solid ${t.ring}` : '2px solid transparent',
                                outlineOffset: '2px',
                                boxShadow: isActive ? `0 0 8px ${t.ring}60` : 'none',
                            }}
                        >
                            {/* inner preview strip */}
                            <div
                                className="absolute inset-[3px] rounded-md opacity-60"
                                style={{ backgroundColor: t.bg }}
                            />
                            {isActive && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-md" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
