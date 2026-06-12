/* =============================================
   MÓDULO: COMBO
   Versión narrativa: el combo sube al hacer
   clic pero NO activa GameOver/permadeath.
   La penalización de inactividad es gestionada
   por la escena 4 en game.js.
   Depende de: State, Upgrades, UI
============================================= */
const Combo = (() => {
    const BASE_DURATION = 8000; // 8 segundos — más generoso en el modo historia
    let timer = null;
    let decayInterval = null;

    function getMaxDuration(currentCombo) {
        const level = Upgrades.getLevel('combo_ext');
        let duration = BASE_DURATION + level * 1000;
        const factorReduccion = Math.max(0.25, 1 - (currentCombo * 0.01));
        return Math.floor(duration * factorReduccion);
    }

    function getCombo() { return State.get('combo'); }

    function register() {
        clearTimeout(timer);
        clearInterval(decayInterval);

        State.inc('combo', 1);
        const c = State.get('combo');
        if (c > State.get('maxCombo')) State.set('maxCombo', c);

        const maxDur = getMaxDuration(c);
        let elapsed = 0;

        decayInterval = setInterval(() => {
            elapsed += 50;
            const progress = Math.max(0, 1 - elapsed / maxDur);
            UI.updateComboBar(progress);
        }, 50);

        // Al expirar el combo simplemente se reinicia — sin permadeath
        timer = setTimeout(() => {
            clearInterval(decayInterval);
            resetCombo();
        }, maxDur);
    }

    function resetCombo() {
        clearTimeout(timer);
        clearInterval(decayInterval);
        State.set('combo', 1);
        UI.updateComboBar(0);
        UI.updateComboDisplay();
    }

    function getMultiplier() {
        const c = State.get('combo');
        if (c <= 5)  return 1;
        if (c <= 15) return 1.5;
        if (c <= 30) return 2;
        if (c <= 60) return 3;
        return 5;
    }

    return { register, reset: resetCombo, getMultiplier, getCombo };
})();
