/* =============================================
   MÓDULO: UPGRADES UI
   Depende de: State, Upgrades, Effects,
               UI, AutoClicker
============================================= */
const Upgrades_UI = (() => {
    const list = document.getElementById('upgrades-list');

    function render() {
        const keys = [1, 2, 3, 4, 5, 6];
        list.innerHTML = '';
        for (const [i, upg] of Upgrades.getAll().entries()) {
            const level  = Upgrades.getLevel(upg.id);
            const cost   = Upgrades.getCost(upg);
            const score  = State.get('score');
            const pct    = Math.min(100, (score / cost) * 100);

            const card = document.createElement('div');
            card.classList.add('upgrade-card');
            if (level > 0) card.classList.add('owned');
            if (level === 0 && score < cost) card.classList.add('locked');
            card.dataset.id = upg.id;
            card.dataset.key = keys[i];

            card.innerHTML = `
                <div class="upgrade-shine"></div>
                <div class="upgrade-key">[${keys[i]}]</div>
                <div class="upgrade-name">${upg.name}</div>
                <div class="upgrade-desc">${upg.desc}</div>
                <div class="upgrade-level">NIVEL ${level}</div>
                <div class="upgrade-cost">${UI.formatNum(cost)} NC</div>
                <div class="upgrade-progress" style="width:${pct}%"></div>
            `;

            card.addEventListener('click', () => {
                if (!Upgrades.canBuy(upg)) return;
                if (Upgrades.buy(upg.id)) {
                    Effects.toast(`⬡ ${upg.name} → NIVEL ${Upgrades.getLevel(upg.id)} ⬡`, 'gold');
                    render();
                    UI.updateAll();
                    if (upg.id === 'auto') AutoClicker.enable();
                }
            });

            list.appendChild(card);
        }
    }

    function refresh() {
        const cards = list.querySelectorAll('.upgrade-card');
        const score = State.get('score');

        for (const card of cards) {
            const id    = card.dataset.id;
            const upg   = Upgrades.catalog.find(u => u.id === id);
            if (!upg) continue;
            const level = Upgrades.getLevel(id);
            const cost  = Upgrades.getCost(upg);
            const pct   = Math.min(100, (score / cost) * 100);

            card.querySelector('.upgrade-progress').style.width = pct + '%';
            card.querySelector('.upgrade-level').textContent = 'NIVEL ' + level;
            card.querySelector('.upgrade-cost').textContent = UI.formatNum(cost) + ' NC';

            if (level > 0) {
                card.classList.add('owned');
                card.classList.remove('locked');
            } else if (score >= cost) {
                card.classList.remove('locked');
            } else {
                card.classList.add('locked');
            }
        }
    }

    return { render, refresh };
})();