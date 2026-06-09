/* =============================================
   MÓDULO: GAME OVER (pantalla de derrota, pago,
            "mira lo que te perderás", reinicio)
   Depende de: State, UI, Combo
============================================= */
const GameOver = (() => {
    let active = false;

    const REVIVE_PRICES = [4.99, 14.99, 49.99, 99.99, 199.99];

    function getStats() {
        return {
            score: State.get('score') || 0,
            maxCombo: State.get('maxCombo') || 0,
            prestige: State.get('prestige') || 0,
            allTimeCoins: State.get('allTimeCoins') || 0,
            totalClicks: State.get('totalClicks') || 0,
        };
    }

    function getRevivePrice() {
        const revives = State.get('revives') || 0;
        if (revives >= REVIVE_PRICES.length) return null;
        return REVIVE_PRICES[revives];
    }

    function show() {
        if (active) return;
        active = true;

        const overlay = document.createElement('div');
        overlay.id = 'gameover-overlay';
        const s = getStats();
        const price = getRevivePrice();

        overlay.innerHTML = `
            <div id="gameover-box">
                <div id="gameover-title">GAME OVER</div>
                <div id="gameover-sub">HAS PERDIDO LA CONEXIÓN CON EL NEXUS</div>
                <div id="gameover-stats">
                    <div class="gov-stat"><span class="gov-lbl">PUNTUACIÓN</span><span class="gov-val">${UI.formatNum(s.score)} NC</span></div>
                    <div class="gov-stat"><span class="gov-lbl">MEJOR COMBO</span><span class="gov-val">x${s.maxCombo}</span></div>
                    <div class="gov-stat"><span class="gov-lbl">PRESTIGIOS</span><span class="gov-val">${s.prestige}</span></div>
                    <div class="gov-stat"><span class="gov-lbl">TOTAL</span><span class="gov-val">${UI.formatNum(s.allTimeCoins)} NC</span></div>
                </div>
                <div id="gameover-actions">
                    ${price !== null
                        ? `<button id="gov-revive" class="gov-btn gov-btn-pay">REVIVIR — S/ ${price.toFixed(2)}</button>`
                        : `<div class="gov-no-revive">NO QUEDAN REVIVIS</div>`
                    }
                    <button id="gov-quit" class="gov-btn gov-btn-quit">RENDIRSE</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const reviveBtn = document.getElementById('gov-revive');
        if (reviveBtn) reviveBtn.addEventListener('click', handleRevive);
        document.getElementById('gov-quit').addEventListener('click', handleQuit);
    }

    /* ─── REVIVIR (pago falso) ─── */

    function handleRevive() {
        const overlay = document.getElementById('gameover-overlay');
        overlay.innerHTML = `
            <div id="gameover-box">
                <div id="gameover-pay-sim">
                    <div id="gov-card">💳</div>
                    <div id="gov-pay-status">PROCESANDO PAGO...</div>
                    <div id="gov-pay-track"><div id="gov-pay-fill"></div></div>
                </div>
            </div>
        `;

        const fill = document.getElementById('gov-pay-fill');
        let pct = 0;
        const t = setInterval(() => {
            pct += Math.random() * 18 + 4;
            if (pct > 100) pct = 100;
            fill.style.width = pct + '%';
            if (pct >= 100) {
                clearInterval(t);
                document.getElementById('gov-pay-status').textContent = 'PAGO APROBADO';
                setTimeout(() => {
                    overlay.innerHTML = `
                        <div id="gameover-box">
                            <div style="text-align:center;padding:2rem;">
                                <div style="font-size:3rem;color:#b060ff;margin-bottom:1rem;">✓</div>
                                <div style="font-size:1.2rem;letter-spacing:2px;color:var(--c-cyan);">REVIVIENDO...</div>
                            </div>
                        </div>
                    `;
                    setTimeout(() => {
                        overlay.remove();
                        active = false;
                        State.inc('revives', 1);
                        Combo.reset();
                    }, 1200);
                }, 600);
            }
        }, 180);
    }

    /* ─── RENDIRSE → "mira lo que te perderás" ─── */

    function handleQuit() {
        const overlay = document.getElementById('gameover-overlay');
        const s = getStats();
        overlay.innerHTML = `
            <div id="gameover-box">
                <div id="gov-miss-title">⚠ MIRA TODO LO QUE TE PERDERÁS ⚠</div>
                <div id="gov-miss-items">
                    <div class="gov-miss-item">✦ ${UI.formatNum(s.score)} NEXUS COINS</div>
                    <div class="gov-miss-item">⬡ COMBO x${s.maxCombo + 50} — PODRÍA SER TUYO</div>
                    <div class="gov-miss-item">◈ PRESTIGE ${s.prestige + 5} — IMAGÍNALO</div>
                    <div class="gov-miss-item">⬟ UPGRADES INFINITAS</div>
                    <div class="gov-miss-item">★ ${UI.formatNum(s.allTimeCoins * 10)} COINS TOTALES</div>
                </div>
                <div id="gov-miss-pulse">¿SEGURO QUE QUIERES DEJAR TODO ESTO?</div>
                <button id="gov-final-quit" class="gov-btn gov-btn-quit">YA NO QUIERO</button>
                <button id="gov-go-back" class="gov-btn gov-btn-pay" style="margin-top:0.5rem;">VOLVER</button>
            </div>
        `;
        document.getElementById('gov-final-quit').addEventListener('click', handleReset);
        document.getElementById('gov-go-back').addEventListener('click', () => { active = false; overlay.remove(); setTimeout(show, 100); });
    }

    /* ─── REINICIAR ─── */

    function handleReset() {
        const overlay = document.getElementById('gameover-overlay');
        overlay.innerHTML = `
            <div id="gameover-box">
                <div id="gov-reset-title">REINICIANDO...</div>
                <div id="gov-reset-track"><div id="gov-reset-fill"></div></div>
                <div id="gov-reset-text">ELIMINANDO PROGRESO...</div>
            </div>
        `;

        const fill = document.getElementById('gov-reset-fill');
        let pct = 0;
        const msgs = [
            "ELIMINANDO PROGRESO...",
            "DESCONECTANDO NEXUS...",
            "BORRANDO RECUERDOS...",
            "CERRANDO SESIÓN...",
        ];
        const t = setInterval(() => {
            pct += Math.random() * 22 + 4;
            if (pct > 100) pct = 100;
            fill.style.width = pct + '%';
            const el = document.getElementById('gov-reset-text');
            if (el) el.textContent = msgs[Math.min(Math.floor(pct / 25), msgs.length - 1)];
            if (pct >= 100) {
                clearInterval(t);
                setTimeout(() => {
                    State.reset();
                    localStorage.removeItem('nexus_save_v2');
                    window.location.reload();
                }, 800);
            }
        }, 250);
    }

    return { show };
})();
