/* =============================================
   MÓDULO: ENGINE (mecánica principal)
   Depende de: State, Upgrades, Combo, Rage,
               Effects, Particles, UI,
               Upgrades_UI, GoldenClick,
               Prestige, AutoClicker, AutoSave
============================================= */
const Engine = (() => {
    function getCritConfig() {
        const level = Upgrades.getLevel('crit_chance');
        return {
            chance: Math.min(0.90, 0.10 + level * 0.02),
            multiplier: 8 + level * 0.5,
        };
    }

    function computeClick() {
        const base = 100;
        const crit = getCritConfig();
        const isCrit = Math.random() < crit.chance;
        const comboMult = Combo.getMultiplier();
        const rageMult  = Rage.getMultiplier();

        let pts = Upgrades.applyClickMultipliers(base);
        if (isCrit) pts = Math.floor(pts * crit.multiplier);
        pts = Math.floor(pts * comboMult * rageMult);

        return { pts, isCrit };
    }

    function handleClick(x, y, isAuto = false) {
        const { pts, isCrit } = computeClick();

        State.inc('score', pts);
        State.inc('totalClicks', 1);
        State.inc('allTimeCoins', pts);

        // Track recent clicks for CPS
        const now = Date.now();
        State.get('recentClicks').push(now);
        State.set('recentClicks', State.get('recentClicks').filter(t => now - t < 5000));

        Combo.register();
        if (!isAuto) Rage.onClick();

        // Visual feedback
        const type = Rage.isActive() ? 'rage-hit' : (isCrit ? 'crit' : 'normal');
        Effects.spawnFloat(x, y, pts, type);

        if (isCrit) {
            Effects.screenShake();
            Effects.flashWhite();
            Particles.burst(x, y, 'crit');
        } else {
            Particles.burst(x, y, 'normal');
        }

        if (Combo.getCombo() > 1 && Combo.getCombo() % 10 === 0) {
            Effects.spawnFloat(x, y - 50, `COMBO x${Combo.getCombo()}!`, 'combo-bonus');
            Effects.toast(`🔥 COMBO x${Combo.getCombo()}`, 'gold');
        }

        UI.updateAll();
        Upgrades_UI.refresh();
        GoldenClick.checkSpawn();
        Prestige.check();
        AutoClicker.enable();
        AutoSave.mark();
    }

    function getCPS() {
        const recent = State.get('recentClicks');
        const now = Date.now();
        return recent.filter(t => now - t < 1000).length;
    }

    return { handleClick, getCPS };
})();