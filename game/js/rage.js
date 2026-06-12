/* =============================================
   MÓDULO: RAGE
   Depende de: State, Upgrades, UI, Effects
============================================= */
const Rage = (() => {
    const MAX_RAGE         = 100;
    const RAGE_DECAY       = 0.8;  // por tick (cada 100ms)
    const RAGE_GAIN        = 3;
    const ACTIVE_THRESHOLD = 100;
    const ACTIVE_DURATION  = 4000;

    let decayInterval = null;
    let activeTimer   = null;

    function start() {
        decayInterval = setInterval(() => {
            if (State.get('rageActive')) return;
            const r = State.get('rage');
            if (r > 0) {
                State.set('rage', Math.max(0, r - RAGE_DECAY));
                UI.updateRageBar();
            }
        }, 100);
    }

    function onClick() {
        if (State.get('rageActive')) return;
        const newRage = Math.min(MAX_RAGE, State.get('rage') + RAGE_GAIN);
        State.set('rage', newRage);
        UI.updateRageBar();

        if (newRage >= ACTIVE_THRESHOLD) {
            activateRage();
        }
    }

    function activateRage() {
        State.set('rageActive', true);
        State.set('rage', MAX_RAGE);
        UI.setRageMode(true);
        Effects.toast('⚡ RAGE MODE ACTIVADO ⚡', 'danger');
        Effects.screenShake();

        clearTimeout(activeTimer);
        activeTimer = setTimeout(deactivate, ACTIVE_DURATION);
    }

    function deactivate() {
        State.set('rageActive', false);
        State.set('rage', 0);
        UI.setRageMode(false);
        UI.updateRageBar();
    }

    function getMultiplier() {
        if (!State.get('rageActive')) return 1;
        const level = Upgrades.getLevel('rage_boost');
        return Math.min(100, 3 + level * 0.5);
    }

    function isActive() { return State.get('rageActive'); }

    return { start, onClick, getMultiplier, isActive };
})();