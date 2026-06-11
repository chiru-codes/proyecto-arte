/* =============================================
   MÓDULO: PRESTIGE
   Depende de: State, Effects, UI,
               Upgrades_UI, AutoSave
============================================= */
const Prestige = (() => {
    const THRESHOLD = 50000;
    const COOLDOWN_MS = 60000;
    const btn = document.getElementById('prestige-btn');
    const section = document.getElementById('prestige-section');
    const hint = document.getElementById('prestige-hint');
    let cooldownUntil = Date.now() + COOLDOWN_MS;

    function doPrestige() {
        if (State.get('score') < THRESHOLD) return false;
        if (Date.now() < cooldownUntil) return false;

        const p = State.get('prestige') + 1;
        State.reset();
        State.set('prestige', p);
        State.set('prestigeMultiplier', 1 + p * 0.5);

        Effects.toast(`⬡ PRESTIGE ${p} — x${(1 + p * 0.5).toFixed(1)} PERMANENTE ⬡`, 'gold');
        Effects.screenShake();

        UI.updateAll();
        Upgrades_UI.render();
        section.classList.add('hidden');
        AutoSave.save();

        cooldownUntil = Date.now() + COOLDOWN_MS;
        return true;
    }

    function check() {
        const score = State.get('score');
        const now = Date.now();
        const canAfford = score >= THRESHOLD;
        const canPrestige = canAfford && now >= cooldownUntil;

        if (canPrestige) {
            section.classList.remove('hidden');
            btn.textContent = '⬡ PRESTIGE ⬡';
            hint.textContent = 'Presiona [SPACE] para prestigio';
        } else if (canAfford) {
            section.classList.remove('hidden');
            const remaining = Math.ceil((cooldownUntil - now) / 1000);
            btn.textContent = `⬡ PRESTIGE ⬡ (${remaining}s)`;
            hint.textContent = '';
        } else {
            section.classList.add('hidden');
        }
    }

    btn.addEventListener('click', doPrestige);

    return { check, trigger: doPrestige };
})();
