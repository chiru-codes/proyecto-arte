/* =============================================
   MÓDULO: PARTICLES (canvas de fondo)
   Depende de: (solo DOM/canvas)
============================================= */
const Particles = (() => {
    const canvas = document.getElementById('particle-canvas');
    const ctx    = canvas.getContext('2d');
    let particles = [];
    let bursts = [];
    let animId;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function initBg() {
        particles = [];
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.5 + 0.3,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                a: Math.random() * 0.4 + 0.05,
                c: Math.random() > 0.6 ? '#b060ff' : '#00e5ff',
            });
        }
    }

    function burst(x, y, type) {
        const count = type === 'crit' ? 18 : 8;
        const color = type === 'crit' ? '#ffc840' : '#b060ff';
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = Math.random() * (type === 'crit' ? 7 : 4) + 1;
            bursts.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: Math.random() * 3 + 1,
                a: 1,
                c: color,
                life: 1,
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background particles
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.c;
            ctx.globalAlpha = p.a;
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
        }

        // Burst particles
        for (let i = bursts.length - 1; i >= 0; i--) {
            const b = bursts[i];
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = b.c;
            ctx.globalAlpha = b.a * b.life;
            ctx.fill();

            b.x += b.vx;
            b.y += b.vy;
            b.vx *= 0.93;
            b.vy *= 0.93;
            b.life -= 0.035;
            if (b.life <= 0) bursts.splice(i, 1);
        }

        ctx.globalAlpha = 1;
        animId = requestAnimationFrame(draw);
    }

    function start() {
        resize();
        initBg();
        draw();
        window.addEventListener('resize', () => { resize(); initBg(); });
    }

    return { start, burst };
})();