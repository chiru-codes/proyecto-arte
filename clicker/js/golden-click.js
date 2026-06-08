/* =============================================
   MÓDULO: GOLDEN CLICK
   Depende de: State, Upgrades, Effects,
               Particles, UI, Upgrades_UI, Prestige
============================================= */
const GoldenClick = (() => {
    const btn = document.getElementById('golden-btn');
    let spawnTimer = null;
    let hideTimer  = null;
    let active = false;

    function getInterval() {
        return Upgrades.isOwned('golden_freq') ? 12000 : 25000;
    }

    function scheduleNext() {
        clearTimeout(spawnTimer);
        const jitter = Math.random() * 5000;
        spawnTimer = setTimeout(spawn, getInterval() + jitter);
    }

    function spawn() {
        if (active) return;
        active = true;
        const margin = 80;
        const x = margin + Math.random() * (window.innerWidth - margin * 2);
        const y = margin + Math.random() * (window.innerHeight - margin * 2);
        btn.style.left = x + 'px';
        btn.style.top  = y + 'px';
        btn.classList.remove('hidden');

        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            btn.classList.add('hidden');
            active = false;
            scheduleNext();
        }, 6000);
    }

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!active) return;

        const reward = Math.floor(State.get('score') * 0.15 + 1000) * State.get('prestigeMultiplier');
        State.inc('score', reward);
        State.inc('allTimeCoins', reward);
        Effects.spawnFloat(parseFloat(btn.style.left), parseFloat(btn.style.top), reward, 'golden');
        Effects.toast(`✦ GOLDEN CLICK! +${reward.toLocaleString('es-PE')} ✦`, 'gold');
        Effects.screenShake();
        Particles.burst(parseFloat(btn.style.left), parseFloat(btn.style.top), 'crit');

        btn.classList.add('hidden');
        active = false;
        clearTimeout(hideTimer);
        scheduleNext();
        UI.updateAll();
        Upgrades_UI.refresh();
        Prestige.check();
    });

    function checkSpawn() {
        if (!spawnTimer && !active) scheduleNext();
    }

    return { checkSpawn };
})();