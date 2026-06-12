/* =============================================
   MÓDULO: INPUT (eventos de clic)
   Depende de: Engine
============================================= */
const Input = (() => {
    const btn = document.getElementById('click-btn');

	function triggerClick() {
		const rect = btn.getBoundingClientRect();
		Engine.handleClick(
			rect.left + rect.width / 2,
			rect.top + rect.height / 2,
			false
		)
	}

    function start() {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
			triggerClick();
        });

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            Engine.handleClick(t.clientX, t.clientY, false);
        }, { passive: false });

		document.addEventListener('keydown', (e) => {
			if (/^[a-zA-Z]$/.test(e.key)) {
				e.preventDefault();
				triggerClick();
			}
		});
        btn.classList.add('idle-bounce');
        btn.addEventListener('mousedown', () => btn.classList.remove('idle-bounce'));
        btn.addEventListener('mouseup', () => btn.classList.add('idle-bounce'));
    }

    return { start };
})();
