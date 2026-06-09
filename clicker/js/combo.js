/* =============================================
   MÓDULO: COMBO (Aceleración Progresiva - ORDEN CORREGIDO)
   Depende de: State, Upgrades, UI, AutoSave
============================================= */
const Combo = (() => {
    const BASE_DURATION = 5000; // 5 segundos base
    let timer = null;
    let decayInterval = null;
    let progress = 1;

    function getMaxDuration(currentCombo) {
        const level = Upgrades.getLevel('combo_ext');
        let duration = BASE_DURATION + level * 1000;

        const factorReduccion = Math.max(0.15, 1 - (currentCombo * 0.015));
        
        return Math.floor(duration * factorReduccion);
    }

    function getCombo() { return State.get('combo'); }

    function register() {
        // 1. PRIMERO frenamos en seco los cronómetros del clic anterior
        clearTimeout(timer);
        clearInterval(decayInterval);

        // 2. AHORA SÍ, incrementamos de forma segura el combo global (+1 real)
        State.inc('combo', 1);
        const c = State.get('combo');

        if (c > State.get('maxCombo')) {
            State.set('maxCombo', c);
        }

        // 3. Calculamos la duración con el combo ya actualizado
        const maxDur = getMaxDuration(c);
        progress = 1;

        console.log(`Combo actual: x${c} | Tiempo disponible: ${(maxDur / 1000).toFixed(2)}s`);

        // 4. Arrancamos la barra visual (50ms por tick)
        let elapsed = 0;
        decayInterval = setInterval(() => {
            elapsed += 50;
            progress = Math.max(0, 1 - elapsed / maxDur);
            UI.updateComboBar(progress);
        }, 50);

        // 5. El temporizador letal de Permadeath
        timer = setTimeout(() => {
            clearInterval(decayInterval);

            if (typeof GameOver !== 'undefined' && GameOver.show) {
                GameOver.show();
            } else {
                localStorage.removeItem('nexus_save_v2');
                alert("❌ ¡NEXO DESTRUIDO! El ritmo colapsó.");
                window.location.reload();
            }
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