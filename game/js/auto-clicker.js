/* =============================================
   MÓDULO: AUTO CLICKER
   Depende de: Upgrades, Engine
============================================= */
const AutoClicker = (() => {
    let interval = null;
    let lastLevel = 0;

    function enable() {
        const level = Upgrades.getLevel('auto');
        if (level === 0) {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
            lastLevel = 0;
            return;
        }

        const desiredMs = Math.max(500, 2000 - level * 150);

        if (interval && level === lastLevel) return;

        if (interval) clearInterval(interval);
        lastLevel = level;
        interval = setInterval(() => {
            const btn = document.getElementById('click-btn');
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            Engine.handleClick(cx, cy, true);
        }, desiredMs);
    }

    return { enable };
})();