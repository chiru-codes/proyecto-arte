/* =============================================
   MÓDULO: EFFECTS (visuales)
   Depende de: (solo DOM)
============================================= */
const Effects = (() => {
    const floatLayer     = document.getElementById('floating-layer');
    const toastContainer = document.getElementById('toast-container');
    const gameContainer  = document.getElementById('game-container');

    function spawnFloat(x, y, text, type = 'normal') {
        const el = document.createElement('div');
        el.classList.add('float-num');
        if (type === 'crit')        el.classList.add('crit');
        if (type === 'combo-bonus') el.classList.add('combo-bonus');
        if (type === 'rage-hit')    el.classList.add('rage-hit');
        if (type === 'golden')      el.classList.add('golden');

        const displayText = typeof text === 'number' ? `+${text.toLocaleString('es-PE')}` : text;
        el.textContent = displayText;

        const ox = (Math.random() - 0.5) * 120;
        const oy = (Math.random() - 0.5) * 50;
        el.style.left = (x + ox) + 'px';
        el.style.top  = (y + oy) + 'px';

        floatLayer.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    }

    function screenShake() {
        gameContainer.classList.remove('screen-shake');
        void gameContainer.offsetWidth;
        gameContainer.classList.add('screen-shake');
        setTimeout(() => gameContainer.classList.remove('screen-shake'), 350);
    }

    function flashWhite() {
        gameContainer.classList.add('flash-white');
        setTimeout(() => gameContainer.classList.remove('flash-white'), 80);
    }

    function toast(message, type = '') {
        const el = document.createElement('div');
        el.classList.add('toast');
        if (type) el.classList.add(type);
        el.textContent = message;
        toastContainer.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }

    return { spawnFloat, screenShake, flashWhite, toast };
})();