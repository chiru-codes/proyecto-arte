/* =============================================
   MÓDULO: PRESTIGE
   Versión narrativa: deshabilitado.
   El prestige no forma parte de la historia.
============================================= */
const Prestige = (() => {
    const btn = document.getElementById('prestige-btn');
    if (btn) btn.classList.add('hidden');

    function check() {
        // Prestige deshabilitado en modo historia
    }

    return { check };
})();
