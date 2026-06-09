/* =============================================
   MAIN — inicialización
   Depende de: todos los módulos
============================================= */
document.addEventListener('DOMContentLoaded', () => {
    AutoSave.start();
    Particles.start();
    Rage.start();
    Input.start();
    Upgrades_UI.render();
    UI.updateAll();
    Psychedelia.start();

    Effects.toast('⬡ NEXUS CONECTADO ⬡', 'gold');

    // Ticks de CPS (actualiza cada segundo)
    setInterval(() => {
        document.getElementById('cps-display').textContent = Engine.getCPS();
    }, 1000);

    // Milestone toasts
    let lastMilestone = 0;
    setInterval(() => {
        const coins = State.get('allTimeCoins');
        const milestones = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000];
        for (const m of milestones) {
            if (coins >= m && lastMilestone < m) {
                lastMilestone = m;
                Effects.toast(`★ ${UI.formatNum(m)} COINS TOTALES ★`, 'gold');
                Effects.screenShake();
            }
        }
    }, 500);
});