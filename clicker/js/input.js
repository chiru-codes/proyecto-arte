/* =============================================
   MÓDULO: INPUT (eventos de clic)
   Depende de: Engine
============================================= */
const Input = (() => {
    const btn = document.getElementById('click-btn');

    function start() {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const rect = btn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            Engine.handleClick(x, y, false);
        });

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            Engine.handleClick(t.clientX, t.clientY, false);
        }, { passive: false });

        btn.classList.add('idle-bounce');
        btn.addEventListener('mousedown', () => btn.classList.remove('idle-bounce'));
        btn.addEventListener('mouseup', () => btn.classList.add('idle-bounce'));
    }

    return { start };
})();