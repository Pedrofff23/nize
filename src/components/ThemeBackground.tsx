import { useEffect, useRef } from 'react';

function readHsl(varName: string): [number, number, number] {
    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
    const parts = raw.replace(/%/g, '').split(/\s+/).map(Number);
    return [parts[0] ?? 175, parts[1] ?? 100, parts[2] ?? 45];
}

function hslStr(h: number, s: number, l: number, a = 1) {
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

interface Bubble {
    x: number; y: number;
    r: number; speed: number;
    drift: number; driftPhase: number;
    opacity: number;
}

interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    r: number; opacity: number; life: number; maxLife: number;
}

interface Ray {
    x: number; width: number; opacity: number; speed: number; phase: number;
}

function makeBubbles(count: number, w: number, h: number): Bubble[] {
    return Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 2 + Math.random() * 7,
        speed: 0.3 + Math.random() * 0.7,
        drift: 0.3 + Math.random() * 0.5,
        driftPhase: Math.random() * Math.PI * 2,
        opacity: 0.12 + Math.random() * 0.25,
    }));
}

function makeRays(count: number, w: number): Ray[] {
    return Array.from({ length: count }, (_, i) => ({
        x: (w / count) * i + Math.random() * (w / count),
        width: 40 + Math.random() * 120,
        opacity: 0.03 + Math.random() * 0.06,
        speed: 0.0003 + Math.random() * 0.0004,
        phase: Math.random() * Math.PI * 2,
    }));
}

function drawBubble(ctx: CanvasRenderingContext2D, b: Bubble, ph: number, cs: number, cl: number) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = hslStr(ph, cs, cl + 20, b.opacity * 1.2);
    ctx.lineWidth = 1;
    ctx.stroke();
    const g = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r);
    g.addColorStop(0, hslStr(ph, cs, cl + 40, b.opacity * 0.8));
    g.addColorStop(1, hslStr(ph, cs, cl, 0));
    ctx.fillStyle = g;
    ctx.fill();
}

function drawRay(ctx: CanvasRenderingContext2D, ray: Ray, h: number, ph: number, cs: number, cl: number, t: number) {
    const x = ray.x + Math.sin(t * ray.speed + ray.phase) * 60;
    const opac = ray.opacity * (0.7 + 0.3 * Math.sin(t * ray.speed * 2 + ray.phase));
    const g = ctx.createLinearGradient(x, 0, x, h);
    g.addColorStop(0, hslStr(ph, cs, cl + 30, opac));
    g.addColorStop(0.6, hslStr(ph, cs, cl, opac * 0.3));
    g.addColorStop(1, hslStr(ph, cs, cl, 0));
    ctx.beginPath();
    ctx.moveTo(x - ray.width / 2, 0);
    ctx.lineTo(x + ray.width / 2, 0);
    ctx.lineTo(x + ray.width * 0.1, h);
    ctx.lineTo(x - ray.width * 0.1, h);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
}

export function ThemeBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef<{
        bubbles: Bubble[];
        particles: Particle[];
        rays: Ray[];
        raf: number;
        t: number;
        ph: number; ps: number; pl: number;
        bh: number; bs: number; bl: number;
    } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function resize() {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (stateRef.current) {
                stateRef.current.bubbles = makeBubbles(55, canvas.width, canvas.height);
                stateRef.current.rays = makeRays(7, canvas.width);
            }
        }

        function readColors() {
            const [ph, ps, pl] = readHsl('--primary');
            const [bh, bs, bl] = readHsl('--background');
            if (stateRef.current) {
                Object.assign(stateRef.current, { ph, ps, pl, bh, bs, bl });
            }
        }

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const [ph, ps, pl] = readHsl('--primary');
        const [bh, bs, bl] = readHsl('--background');

        stateRef.current = {
            bubbles: makeBubbles(55, canvas.width, canvas.height),
            particles: [],
            rays: makeRays(7, canvas.width),
            raf: 0, t: 0,
            ph, ps, pl, bh, bs, bl,
        };

        const observer = new MutationObserver(readColors);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        function spawnParticles(w: number) {
            if (!stateRef.current || Math.random() > 0.15) return;
            const s = stateRef.current;
            s.particles.push({
                x: Math.random() * w,
                y: canvas!.height + 5,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -(0.2 + Math.random() * 0.5),
                r: 1 + Math.random() * 2,
                opacity: 0.4 + Math.random() * 0.4,
                life: 0,
                maxLife: 200 + Math.random() * 200,
            });
        }

        function draw() {
            const s = stateRef.current;
            if (!s || !canvas || !ctx) return;
            s.t++;
            const { t, bubbles, rays, ph, ps, pl, bh, bs, bl } = s;

            // background fill
            const bgG = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgG.addColorStop(0, hslStr(bh, bs, bl + 4, 1));
            bgG.addColorStop(1, hslStr(bh, bs, Math.max(bl - 6, 2), 1));
            ctx.fillStyle = bgG;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // light rays
            rays.forEach(r => drawRay(ctx, r, canvas.height, ph, ps, pl, t));

            // ambient glow orbs
            const g1 = ctx.createRadialGradient(
                canvas.width * 0.15, canvas.height * 0.2, 0,
                canvas.width * 0.15, canvas.height * 0.2, canvas.width * 0.38,
            );
            g1.addColorStop(0, hslStr(ph, ps, pl, 0.13));
            g1.addColorStop(1, hslStr(ph, ps, pl, 0));
            ctx.fillStyle = g1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const g2 = ctx.createRadialGradient(
                canvas.width * 0.85, canvas.height * 0.8, 0,
                canvas.width * 0.85, canvas.height * 0.8, canvas.width * 0.32,
            );
            g2.addColorStop(0, hslStr(ph, ps, pl, 0.10));
            g2.addColorStop(1, hslStr(ph, ps, pl, 0));
            ctx.fillStyle = g2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // particles
            spawnParticles(canvas.width);
            s.particles = s.particles.filter(p => p.life < p.maxLife);
            s.particles.forEach(p => {
                p.life++;
                p.x += p.vx;
                p.y += p.vy;
                const ratio = p.life / p.maxLife;
                const alpha = p.opacity * (1 - ratio);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = hslStr(ph, ps, pl + 20, alpha);
                ctx.fill();
            });

            // bubbles
            bubbles.forEach(b => {
                b.y -= b.speed;
                b.x += Math.sin(t * 0.03 + b.driftPhase) * b.drift;
                if (b.y + b.r < 0) {
                    b.y = canvas.height + b.r;
                    b.x = Math.random() * canvas.width;
                }
                drawBubble(ctx, b, ph, ps, pl);
            });

            // vignette
            const vg = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, canvas.height * 0.2,
                canvas.width / 2, canvas.height / 2, canvas.width * 0.75,
            );
            vg.addColorStop(0, 'transparent');
            vg.addColorStop(1, hslStr(bh, bs, Math.max(bl - 8, 2), 0.5));
            ctx.fillStyle = vg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            s.raf = requestAnimationFrame(draw);
        }

        draw();
        window.addEventListener('resize', resize);

        return () => {
            if (stateRef.current) cancelAnimationFrame(stateRef.current.raf);
            observer.disconnect();
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[-1] pointer-events-none"
            aria-hidden="true"
        />
    );
}
