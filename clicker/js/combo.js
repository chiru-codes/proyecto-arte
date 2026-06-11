/* =============================================
   MÓDULO: COMBO (Aceleración Progresiva - ORDEN CORREGIDO)
   Depende de: State, Upgrades, UI, AutoSave
============================================= */
	const Combo = (() => {
	    const BASE_DURATION = 5000;
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
	        clearInterval(decayInterval);

	        State.inc('combo', 1);
	        const c = State.get('combo');

	        if (c > State.get('maxCombo')) {
	            State.set('maxCombo', c);
	        }

	        const maxDur = getMaxDuration(c);
	        const startTime = Date.now();
	        progress = 1;

	        console.log(`Combo actual: x${c} | Tiempo disponible: ${(maxDur / 1000).toFixed(2)}s`);

	        decayInterval = setInterval(() => {
	            const elapsed = Date.now() - startTime;
	            progress = Math.max(0, 1 - elapsed / maxDur);
	            UI.updateComboBar(progress);

	            if (elapsed >= maxDur) {
	                clearInterval(decayInterval);
	                if (typeof GameOver !== 'undefined' && GameOver.show) {
	                    GameOver.show();
	                } else {
	                    localStorage.removeItem('nexus_save_v2');
	                    alert("❌ ¡NEXO DESTRUIDO! El ritmo colapsó.");
	                    window.location.reload();
	                }
	            }
	        }, 50);
	    }

	    function resetCombo() {
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