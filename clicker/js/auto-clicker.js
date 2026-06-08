/* =============================================
   MÓDULO: AUTO CLICKER
   Depende de: Upgrades, Engine
============================================= */
const AutoClicker = (() => {
    let interval = null;

    function enable() {
        if (!Upgrades.isOwned('auto') || interval) return;
        interval = setInterval(() => {
            const btn = document.getElementById('click-btn');
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            Engine.handleClick(cx, cy, true);
        }, 2000);
    }

    return { enable };
})();