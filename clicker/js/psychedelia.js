/* =============================================
   MÓDULO: PSYCHEDELIA (efectos visuales progresivos)
   Depende de: State
============================================= */
const Psychedelia = (() => {
    const container = document.getElementById('game-container');
    const clickBtn = document.getElementById('click-btn');
    let startTime = Date.now();
    let running = false;

    let noiseCtx = null;
    let noiseData = null;
    let lsdCanvas = null;
    let lsdCtx = null;
    let lsdW = 0;
    let lsdH = 0;
    let lsdBuf = null;

    const overlays = {};

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

        for (const el of Object.values(overlays)) {
            document.body.appendChild(el);
        }
    }

    function getIntensity(score) {
        if (score < 1000000)    return { tier: 0, progress: 0 };
        if (score < 10000000)   return { tier: 1, progress: (score - 1000000) / 9000000 };
        if (score < 100000000)  return { tier: 2, progress: (score - 10000000) / 90000000 };
        if (score < 1000000000) return { tier: 3, progress: (score - 100000000) / 900000000 };
        if (score < 50000000000)return { tier: 4, progress: (score - 1000000000) / 49000000000 };
        return { tier: 5, progress: Math.min(1, (score - 50000000000) / 50000000000) };
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

    function drawLSD(tier, progress, elapsed) {
        const intensity = Math.min(1, (tier - 1) / 4 + progress / 4);
        const alpha = Math.floor(80 + intensity * 120);

        const buf = lsdBuf.data;

        for (let y = 0; y < lsdH; y++) {
            for (let x = 0; x < lsdW; x++) {
                const i = (y * lsdW + x) * 4;
                const nx = x / lsdW;
                const ny = y / lsdH;

                const hue = (
                    Math.sin(nx * 8 + elapsed * 0.6) * 40 +
                    Math.sin(ny * 6 + elapsed * 0.8) * 40 +
                    Math.sin((nx + ny) * 5 + elapsed * 0.4) * 40 +
                    elapsed * 25
                ) % 360;

                const sat = 0.6 + (
                    Math.sin(nx * 4 + elapsed * 0.5) * 0.2 +
                    Math.sin(ny * 3 + elapsed * 0.7) * 0.2
                );

                const lit = 0.4 + (
                    Math.sin(nx * 7 + ny * 5 + elapsed * 0.9) * 0.15 +
                    Math.sin(nx * 3 - ny * 4 + elapsed * 0.3) * 0.15
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

    let noiseCounter = 0;

    function update() {
        if (!running) return;

        const score = State.get('score');
        const { tier, progress } = getIntensity(score);
        const elapsed = (Date.now() - startTime) / 1000;
        const overall = Math.min(1, tier / 5 + progress / 5);

        if (tier >= 1) {
            const hueSpeed = 30 + tier * 30;
            const hueAngle = (elapsed * hueSpeed) % 360;
            const hueMod = Math.sin(elapsed * 0.7) * 30;
            const sat = 1 + overall * 4;
            const ctr = 1 + overall * 0.8 + Math.sin(elapsed * 0.5) * overall * 0.3;
            const bri = 1 + Math.sin(elapsed * 0.6) * overall * 0.15;

            container.style.filter = [
                `hue-rotate(${hueAngle + hueMod}deg)`,
                `saturate(${sat})`,
                `contrast(${ctr})`,
                `brightness(${bri})`,
            ].join(' ');
        }

        overlays.vignette.style.opacity = overall * 0.6;

        if (tier >= 2) {
            overlays.scanlines.style.opacity = 0.2 + overall * 0.6;

            const breathe = 1 + Math.sin(elapsed * 2.5 * overall) * 0.008 * overall;
            const skewX = Math.sin(elapsed * 0.3) * overall * 0.3;
            const skewY = Math.sin(elapsed * 0.4) * overall * 0.2;
            container.style.transform = `scale(${breathe}) skew(${skewX}deg, ${skewY}deg)`;
        }

        if (tier >= 3) {
            overlays.noise.style.display = 'block';
            overlays.noise.style.opacity = 0.1 + overall * 0.35;
            noiseCounter++;
            if (noiseCounter % 2 === 0) {
                updateNoise();
            }
        } else {
            overlays.noise.style.display = 'none';
        }

        if (tier >= 4 && Math.random() < 0.03 * overall) {
            const glX = (Math.random() - 0.5) * 60 * overall;
            const glY = (Math.random() - 0.5) * 30 * overall;
            const glitchEl = document.createElement('div');
            glitchEl.style.cssText = [
                'position:fixed;inset:0;z-index:9999;pointer-events:none;',
                `transform:translate(${glX}px,${glY}px);`,
                'transition:all 0.03s;',
                'background:rgba(255,255,255,0.08);',
            ].join('');
            document.body.appendChild(glitchEl);
            setTimeout(() => glitchEl.remove(), 50);
        }

        if (tier >= 2) {
            drawLSD(tier, progress, elapsed);
            overlays.lsd.style.display = 'block';
            const lsdAlpha = Math.min(1, (tier - 1) / 4 + progress / 4);
            overlays.lsd.style.opacity = lsdAlpha * 0.7;
        } else {
            overlays.lsd.style.display = 'none';
        }

        if (tier >= 3) {
            const pulse = 0.5 + Math.sin(elapsed * 8) * 0.5;
            const r = Math.floor(150 + Math.sin(elapsed * 1.7) * 105);
            const g = Math.floor(80  + Math.sin(elapsed * 2.3) * 140);
            const b = Math.floor(150 + Math.sin(elapsed * 2.9) * 105);
            clickBtn.style.boxShadow = [
                `0 0 ${15 + pulse * 50}px rgba(${r},${g},${b},${0.3 + pulse * 0.5})`,
                `0 0 ${50 + pulse * 100}px rgba(${r},${g},${b},${0.15 + pulse * 0.3})`,
            ].join(',');
            clickBtn.style.transition = 'box-shadow 0.08s';
        }

        if (tier >= 4 && Math.random() < 0.008 * overall) {
            const flash = document.createElement('div');
            flash.style.cssText = [
                'position:fixed;inset:0;z-index:9999;pointer-events:none;',
                `background:rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${0.06 + Math.random() * 0.12});`,
                'transition:opacity 0.15s;',
            ].join('');
            document.body.appendChild(flash);
            setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 200); }, 80);
        }

        if (tier >= 5) {
            if (Math.random() < 0.02) {
                const invertDiv = document.createElement('div');
                invertDiv.style.cssText = [
                    'position:fixed;inset:0;z-index:9999;pointer-events:none;',
                    'background:rgba(255,255,255,0.25);',
                    'mix-blend-mode:difference;',
                    'transition:opacity 0.1s;',
                ].join('');
                document.body.appendChild(invertDiv);
                setTimeout(() => { invertDiv.style.opacity = '0'; setTimeout(() => invertDiv.remove(), 150); }, 80);
            }
        }

        requestAnimationFrame(update);
    }

    function start() {
        createOverlays();
        running = true;
        requestAnimationFrame(update);
    }

    return { start };
})();
