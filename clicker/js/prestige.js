/* =============================================
   MÓDULO: PRESTIGE
   Depende de: State, Effects, UI,
               Upgrades_UI, AutoSave
============================================= */
const Prestige = (() => {
    const THRESHOLD = 50000;
    const btn = document.getElementById('prestige-btn');

    btn.addEventListener('click', () => {
        if (State.get('score') < THRESHOLD) return;

        const p = State.get('prestige') + 1;
        State.reset();
        State.set('prestige', p);
        State.set('prestigeMultiplier', 1 + p * 0.5);

        Effects.toast(`⬡ PRESTIGE ${p} — x${(1 + p * 0.5).toFixed(1)} PERMANENTE ⬡`, 'gold');
        Effects.screenShake();

        UI.updateAll();
        Upgrades_UI.render();
        btn.classList.add('hidden');
        AutoSave.save();
    });

    function check() {
        if (State.get('score') >= THRESHOLD) {
            btn.classList.remove('hidden');
        }
    }

    return { check };
})();