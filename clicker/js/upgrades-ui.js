/* =============================================
   MÓDULO: UPGRADES UI
   Depende de: State, Upgrades, Effects,
               UI, AutoClicker
============================================= */
const Upgrades_UI = (() => {
    const list = document.getElementById('upgrades-list');

    function render() {
        list.innerHTML = '';
        for (const upg of Upgrades.getAll()) {
            const owned  = Upgrades.isOwned(upg.id);
            const canBuy = Upgrades.canBuy(upg);
            const score  = State.get('score');
            const pct    = owned ? 100 : Math.min(100, (score / upg.cost) * 100);

            const card = document.createElement('div');
            card.classList.add('upgrade-card');
            if (owned)  card.classList.add('owned');
            if (!owned && !canBuy) card.classList.add('locked');
            card.dataset.id = upg.id;

            card.innerHTML = `
                <div class="upgrade-shine"></div>
                <div class="upgrade-name">${upg.name}</div>
                <div class="upgrade-desc">${upg.desc}</div>
                <div class="upgrade-cost">${owned ? '✓ COMPRADO' : UI.formatNum(upg.cost) + ' NC'}</div>
                <div class="upgrade-progress" style="width:${pct}%"></div>
            `;

            if (!owned && canBuy) {
                card.addEventListener('click', () => {
                    if (Upgrades.buy(upg.id)) {
                        Effects.toast(`✓ ${upg.name} DESBLOQUEADO`, 'gold');
                        render();
                        UI.updateAll();
                        if (upg.id === 'auto') AutoClicker.enable();
                    }
                });
            }

            list.appendChild(card);
        }
    }

    function refresh() {
        const cards = list.querySelectorAll('.upgrade-card');
        const score = State.get('score');

        for (const card of cards) {
            const id  = card.dataset.id;
            const upg = Upgrades.catalog.find(u => u.id === id);
            if (!upg) continue;
            const owned  = Upgrades.isOwned(id);
            const canBuy = Upgrades.canBuy(upg);
            const pct    = owned ? 100 : Math.min(100, (score / upg.cost) * 100);

            card.querySelector('.upgrade-progress').style.width = pct + '%';

            if (!owned && canBuy) {
                card.classList.remove('locked');
            } else if (!owned) {
                card.classList.add('locked');
            }
        }
    }

    return { render, refresh };
})();