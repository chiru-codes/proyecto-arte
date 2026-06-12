/* =============================================
   MÓDULO: UI (actualización de DOM)
   Depende de: State, Combo, Rage, Engine
============================================= */
const UI = (() => {
    const scoreDisplay   = document.getElementById('score-display');
    const totalClicks    = document.getElementById('total-clicks');
    const prestigeCount  = document.getElementById('prestige-count');
    const cpsDisplay     = document.getElementById('cps-display');
    const comboCount     = document.getElementById('combo-count');
    const comboBar       = document.getElementById('combo-bar-fill');
    const multiplierDisp = document.getElementById('multiplier-display');
    const rageBar        = document.getElementById('rage-bar-fill');
    const clickBtn       = document.getElementById('click-btn');
    const rageOverlay    = document.getElementById('rage-overlay');
    const btnProgressFill = document.getElementById('btn-progress-fill');

    const CIRCUMFERENCE = 2 * Math.PI * 100; // r=100

    function formatNum(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return Math.floor(n).toLocaleString('es-PE');
    }

    function updateScore() {
        const s = State.get('score');
        scoreDisplay.textContent = formatNum(s);
        scoreDisplay.classList.add('bump');
        setTimeout(() => scoreDisplay.classList.remove('bump'), 120);

        const target = 50000;
        const pct = Math.min(s / target, 1);
        const offset = CIRCUMFERENCE * (1 - pct);
        btnProgressFill.style.strokeDashoffset = offset;
    }

    function updateAll() {
        updateScore();
        updateComboDisplay();
        updateMultiplier();

        totalClicks.textContent   = formatNum(State.get('allTimeCoins'));
        prestigeCount.textContent = State.get('prestige');
        cpsDisplay.textContent    = Engine.getCPS();
    }

    function updateComboDisplay() {
        const c = State.get('combo');
        comboCount.textContent = 'x' + c;

        if (c >= 30) {
            comboCount.style.color = '#ff2055';
            comboCount.style.textShadow = '0 0 20px rgba(255,32,85,0.8)';
        } else if (c >= 15) {
            comboCount.style.color = '#ffc840';
            comboCount.style.textShadow = '0 0 20px rgba(255,200,64,0.7)';
        } else if (c > 1) {
            comboCount.style.color = '#b060ff';
            comboCount.style.textShadow = '0 0 15px rgba(176,96,255,0.6)';
        } else {
            comboCount.style.color = '#484860';
            comboCount.style.textShadow = 'none';
        }
    }

    function updateComboBar(pct) {
        comboBar.style.width = (pct * 100) + '%';
    }

    function updateMultiplier() {
        const combo    = Combo.getMultiplier();
        const rage     = Rage.getMultiplier();
        const prestige = State.get('prestigeMultiplier');
        const total    = combo * rage * prestige;

        if (total > 1) {
            multiplierDisp.textContent = `×${total.toFixed(1)} TOTAL`;
        } else {
            multiplierDisp.textContent = '';
        }
    }

    function updateRageBar() {
        rageBar.style.width = State.get('rage') + '%';
    }

    function setRageMode(on) {
        if (on) {
            clickBtn.classList.add('rage-mode');
            clickBtn.classList.remove('idle-bounce');
            rageOverlay.classList.remove('hidden');
        } else {
            clickBtn.classList.remove('rage-mode');
            clickBtn.classList.add('idle-bounce');
            rageOverlay.classList.add('hidden');
            rageBar.style.width = '0%';
        }
    }

    return { updateAll, updateComboDisplay, updateComboBar, updateMultiplier, updateRageBar, setRageMode, formatNum };
})();