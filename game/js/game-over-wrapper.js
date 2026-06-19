/* =============================================
   WRAPPER: GAME OVER CON INACTIVIDAD
   Envuelve el GameOver de clicker y agrega
   lógica de inactividad para el modo historia.
   No modifica el código original de clicker.
============================================= */
const GameOverWrapper = (() => {
    let inactivityTimer = null;
    const INACTIVITY_LIMIT = 30000; // 30 segundos sin clic

    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            GameOver.show();
        }, INACTIVITY_LIMIT);
    }

    function start() {
        // Escuchar clics para resetear el timer de inactividad
        document.addEventListener('click', resetTimer);
        document.addEventListener('keydown', resetTimer);
        document.addEventListener('touchstart', resetTimer);
        resetTimer();
    }

    return { start };
})();
