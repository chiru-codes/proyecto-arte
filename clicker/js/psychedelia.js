/* =============================================
   MÓDULO: PSYCHEDELIA (efectos visuales progresivos)
   Depende de: State
============================================= */
const Psychedelia = (() => {
    const container = document.getElementById('game-container');
    const clickBtn = document.getElementById('click-btn');
    let startTime = Date.now();
    let running = false;
    let paused = 0;
    let pauseCallback = null;

    let noiseCtx = null;
    let noiseData = null;
    let lsdCanvas = null;
    let lsdCtx = null;
    let lsdW = 0;
    let lsdH = 0;
    let lsdBuf = null;

    let staticCanvas = null;
    let staticCtx = null;
    let staticData = null;

    const overlays = {};

    const POLYBIUS_MSGS = [
        "SIGUE JUGANDO...",
        "NO TE DETENGAS...",
        "EL NEXUS TE NECESITA...",
        "UN POCO MÁS...",
        "CASI LLEGAS...",
        "NO PUEDES PARAR AHORA...",
        "EL NEXUS HABLA...",
        "UNA VEZ MÁS...",
        "LO ESTÁS HACIENDO BIEN...",
        "NO HAY VUELTA ATRÁS...",
    ];

    function hslToRgb(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s = Math.max(0, Math.min(1, s));
        l = Math.max(0, Math.min(1, l));
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r, g, b;
        if (h < 60)      { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else              { r = c; g = 0; b = x; }
        return [
            Math.floor((r + m) * 255),
            Math.floor((g + m) * 255),
            Math.floor((b + m) * 255),
        ];
    }

    function createDiv(id) {
        const el = document.createElement('div');
        el.id = id;
        el.className = 'psych-overlay';
        return el;
    }

    function createCanvas(id, w, h) {
        const el = document.createElement('canvas');
        el.id = id;
        el.className = 'psych-overlay';
        el.width = w;
        el.height = h;
        return el;
    }

    function createOverlays() {
        overlays.scanlines = createDiv('psych-scanlines');
        overlays.vignette = createDiv('psych-vignette');

        const noiseCanvas = createCanvas('psych-noise', 256, 256);
        overlays.noise = noiseCanvas;
        noiseCtx = noiseCanvas.getContext('2d');
        noiseData = noiseCtx.createImageData(256, 256);

        lsdCanvas = createCanvas('psych-lsd', 320, 240);
        overlays.lsd = lsdCanvas;
        lsdCtx = lsdCanvas.getContext('2d');
        lsdW = lsdCanvas.width;
        lsdH = lsdCanvas.height;
        lsdBuf = lsdCtx.createImageData(lsdW, lsdH);

        staticCanvas = createCanvas('psych-static', 256, 256);
        staticCanvas.id = 'psych-static';
        staticCanvas.style.zIndex = '9998';
        staticCtx = staticCanvas.getContext('2d');
        staticData = staticCtx.createImageData(256, 256);

        for (const el of Object.values(overlays)) {
            document.body.appendChild(el);
        }
        document.body.appendChild(staticCanvas);
    }

    function getIntensity(score) {
        if (score < 1000000)          return { tier: 0, progress: 0 };
        if (score < 10000000)         return { tier: 1, progress: (score - 1000000) / 9000000 };
        if (score < 100000000)        return { tier: 2, progress: (score - 10000000) / 90000000 };
        if (score < 1000000000)       return { tier: 3, progress: (score - 100000000) / 900000000 };
        if (score < 10000000000)      return { tier: 4, progress: (score - 1000000000) / 9000000000 };
        if (score < 30000000000)      return { tier: 5, progress: (score - 10000000000) / 20000000000 };
        if (score < 50000000000)      return { tier: 6, progress: (score - 30000000000) / 20000000000 };
        return { tier: 7, progress: Math.min(1, (score - 50000000000) / 500000000000) };
    }

    function updateNoise() {
        if (!noiseData) return;
        const d = noiseData.data;
        for (let i = 0; i < d.length; i += 4) {
            const v = Math.random() * 255;
            d[i] = v;
            d[i + 1] = v;
            d[i + 2] = v;
            d[i + 3] = 180;
        }
        noiseCtx.putImageData(noiseData, 0, 0);
    }

    function updateStatic() {
        if (!staticData) return;
        const d = staticData.data;
        for (let i = 0; i < d.length; i += 4) {
            const v = Math.random() * 255;
            d[i] = v;
            d[i + 1] = v;
            d[i + 2] = v;
            d[i + 3] = 200 + Math.floor(Math.random() * 55);
        }
        staticCtx.putImageData(staticData, 0, 0);
    }

    /* ─── TV STATIC (pausa el juego 0.2s) ─── */

    function triggerTVStatic() {
        if (paused > 0) return;
        paused = 1;
        staticCanvas.style.display = 'block';
        staticCanvas.style.opacity = '1';
        updateStatic();
        let frames = 0;
        const interval = setInterval(() => {
            frames++;
            updateStatic();
            if (frames >= 6) {
                clearInterval(interval);
                staticCanvas.style.display = 'none';
                paused = 0;
            }
        }, 33);
    }

    /* ─── BARREL ROLL ─── */

    function triggerBarrelRoll() {
        if (container.dataset.rolling === '1') return;
        container.dataset.rolling = '1';
        const orig = container.style.transform || '';
        container.style.transition = 'transform 0.5s ease-in-out';
        container.style.transform = (orig ? orig + ' ' : '') + 'rotate(360deg)';
        setTimeout(() => {
            const cleaned = (container.style.transform || '').replace(/ rotate\([^)]+\)/g, '');
            container.style.transform = cleaned;
            container.style.transition = '';
            delete container.dataset.rolling;
        }, 550);
    }

    /* ─── POLYBIUS TEXT ─── */

    let polybiusActive = false;

    function triggerPolybius() {
        if (polybiusActive) return;
        polybiusActive = true;
        const msg = POLYBIUS_MSGS[Math.floor(Math.random() * POLYBIUS_MSGS.length)];
        const el = document.createElement('div');
        el.className = 'psych-polybius';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => {
            el.classList.add('psych-polybius-out');
            setTimeout(() => { el.remove(); polybiusActive = false; }, 2000);
        }, 1500);
    }

    /* ─── DRAW LSD ─── */

    function drawLSD(tier, progress, elapsed) {
        const intensity = Math.min(1, (tier - 1) / 6 + progress / 6);
        const alpha = Math.floor(60 + intensity * 180);
        const buf = lsdBuf.data;

        const speed = 0.4 + intensity * 0.8;
        const warp = 6 + intensity * 10;

        for (let y = 0; y < lsdH; y++) {
            for (let x = 0; x < lsdW; x++) {
                const i = (y * lsdW + x) * 4;
                const nx = x / lsdW;
                const ny = y / lsdH;

                const hue = (
                    Math.sin(nx * warp + elapsed * speed * 0.6) * 50 +
                    Math.sin(ny * warp * 0.8 + elapsed * speed * 0.8) * 50 +
                    Math.sin((nx + ny) * warp * 0.6 + elapsed * speed * 0.4) * 50 +
                    elapsed * 25 * speed
                ) % 360;

                const sat = 0.5 + (
                    Math.sin(nx * 4 + elapsed * speed * 0.5) * 0.25 +
                    Math.sin(ny * 3 + elapsed * speed * 0.7) * 0.25
                );

                const lit = 0.35 + (
                    Math.sin(nx * 6 + ny * 4 + elapsed * speed * 0.9) * 0.2 +
                    Math.sin(nx * 2 - ny * 3 + elapsed * speed * 0.3) * 0.15
                );

                const [r, g, b] = hslToRgb(hue, sat, lit);
                buf[i]     = r;
                buf[i + 1] = g;
                buf[i + 2] = b;
                buf[i + 3] = alpha;
            }
        }
        lsdCtx.putImageData(lsdBuf, 0, 0);
    }

    /* ─── UPDATE LOOP ─── */

    let noiseCounter = 0;
    let lastStaticTrigger = 0;

    function update() {
        if (!running) return;

        /* Pausa por TV static */
        if (paused > 0) {
            requestAnimationFrame(update);
            return;
        }

        const score = State.get('score');
        const { tier, progress } = getIntensity(score);
        const elapsed = (Date.now() - startTime) / 1000;
        const overall = Math.min(1, tier / 7 + progress / 7);

        /* ─── CSS FILTERS ─── */
        if (tier >= 1) {
            const hueSpeed = 20 + tier * 30;
            const hueAngle = (elapsed * hueSpeed) % 360;
            const hueMod = Math.sin(elapsed * 0.7) * (20 + tier * 10);
            const sat = 1 + overall * 5;
            const ctr = 1 + overall * 1.2 + Math.sin(elapsed * 0.5) * overall * 0.5;
            const bri = 1 + Math.sin(elapsed * 0.6) * overall * 0.25;

            container.style.filter = [
                `hue-rotate(${hueAngle + hueMod}deg)`,
                `saturate(${sat})`,
                `contrast(${ctr})`,
                `brightness(${bri})`,
            ].join(' ');
        }

        overlays.vignette.style.opacity = overall * 0.7;

        /* ─── TIER 2+ : SCANLINES, BREATHE, SKEW ─── */
        if (tier >= 2) {
            overlays.scanlines.style.opacity = 0.15 + overall * 0.7;

            const breathe = 1 + Math.sin(elapsed * 2 * overall) * 0.01 * overall;
            const skewX = Math.sin(elapsed * 0.3 + tier * 0.5) * overall * 0.8;
            const skewY = Math.sin(elapsed * 0.4 + tier * 0.3) * overall * 0.5;
            container.style.transform = `scale(${breathe}) skew(${skewX}deg, ${skewY}deg)`;
        }

        /* ─── TIER 3+ : NOISE ─── */
        if (tier >= 3) {
            overlays.noise.style.display = 'block';
            overlays.noise.style.opacity = 0.08 + overall * 0.45;
            noiseCounter++;
            if (noiseCounter % 2 === 0) updateNoise();
        } else {
            overlays.noise.style.display = 'none';
        }

        /* ─── TIER 4+ : GLITCH ─── */
        if (tier >= 4 && Math.random() < 0.04 * overall) {
            const glX = (Math.random() - 0.5) * 80 * overall;
            const glY = (Math.random() - 0.5) * 50 * overall;
            const glitchEl = document.createElement('div');
            glitchEl.style.cssText = [
                'position:fixed;inset:0;z-index:9999;pointer-events:none;',
                `transform:translate(${glX}px,${glY}px);`,
                'transition:all 0.02s;',
                'background:rgba(255,255,255,0.1);',
            ].join('');
            document.body.appendChild(glitchEl);
            setTimeout(() => glitchEl.remove(), 40);
        }

        /* ─── TIER 2+ : LSD OVERLAY ─── */
        if (tier >= 2) {
            drawLSD(tier, progress, elapsed);
            overlays.lsd.style.display = 'block';
            const lsdAlpha = Math.min(1, (tier - 1) / 6 + progress / 6);
            overlays.lsd.style.opacity = lsdAlpha * 0.75;
        } else {
            overlays.lsd.style.display = 'none';
        }

        /* ─── TIER 3+ : BUTTON GLOW ─── */
        if (tier >= 3) {
            const pulse = 0.5 + Math.sin(elapsed * 8 + tier) * 0.5;
            const r = Math.floor(120 + Math.sin(elapsed * 1.7 + tier) * 135);
            const g = Math.floor(60  + Math.sin(elapsed * 2.3 + tier * 0.7) * 160);
            const b = Math.floor(120 + Math.sin(elapsed * 2.9 + tier * 0.5) * 135);
            clickBtn.style.boxShadow = [
                `0 0 ${10 + pulse * 60}px rgba(${r},${g},${b},${0.3 + pulse * 0.5})`,
                `0 0 ${40 + pulse * 120}px rgba(${r},${g},${b},${0.15 + pulse * 0.3})`,
            ].join(',');
            clickBtn.style.transition = 'box-shadow 0.06s';
        }

        /* ─── TIER 4+ : COLOR FLASHES ─── */
        if (tier >= 4 && Math.random() < 0.01 * overall) {
            const flash = document.createElement('div');
            flash.style.cssText = [
                'position:fixed;inset:0;z-index:9999;pointer-events:none;',
                `background:rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${0.06 + Math.random() * 0.18});`,
                'transition:opacity 0.12s;',
            ].join('');
            document.body.appendChild(flash);
            setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 180); }, 70);
        }

        /* ─── TIER 5+ : INVERT FLASHES ─── */
        if (tier >= 5 && Math.random() < 0.03 * overall) {
            const invertDiv = document.createElement('div');
            invertDiv.style.cssText = [
                'position:fixed;inset:0;z-index:9999;pointer-events:none;',
                'background:rgba(255,255,255,0.3);',
                'mix-blend-mode:difference;',
                'transition:opacity 0.08s;',
            ].join('');
            document.body.appendChild(invertDiv);
            setTimeout(() => { invertDiv.style.opacity = '0'; setTimeout(() => invertDiv.remove(), 120); }, 60);
        }

        /* ─── TIER 6+ : TV STATIC ─── */
        if (tier >= 6) {
            if (Date.now() - lastStaticTrigger > 1500 && Math.random() < 0.02 * overall) {
                lastStaticTrigger = Date.now();
                triggerTVStatic();
            }
        }

        if (tier >= 6 && Math.random() < 0.005 * overall) {
            triggerBarrelRoll();
        }

        if (tier >= 7) {
            if (!polybiusActive && Math.random() < 0.01 * overall) {
                triggerPolybius();
            }
            /* Extra violent shaking */
            if (Math.random() < 0.02 * overall) {
                const shake = document.createElement('div');
                shake.style.cssText = [
                    'position:fixed;inset:0;z-index:9999;pointer-events:none;',
                    `transform:translate(${(Math.random()-0.5)*120}px,${(Math.random()-0.5)*80}px);`,
                    'transition:all 0.02s;',
                    'background:rgba(255,255,255,0.15);',
                ].join('');
                document.body.appendChild(shake);
                setTimeout(() => shake.remove(), 30);
            }
        }

        requestAnimationFrame(update);
    }

    function start() {
        createOverlays();
        staticCanvas.style.display = 'none';
        running = true;
        requestAnimationFrame(update);
    }

    return { start };
})();
