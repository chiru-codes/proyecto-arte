/* =============================================
   MÓDULO: UPGRADES (catálogo y lógica)
   Depende de: State
============================================= */
const Upgrades = (() => {
    const catalog = [
        {
            id: 'double',
            name: 'NEXUS CORE x2',
            desc: 'Dobla el valor base de cada clic',
            cost: 500,
            effect: (pts) => pts * 2,
            stackable: false,
        },
        {
            id: 'crit_chance',
            name: 'HYPERCRIT',
            desc: 'Críticos más frecuentes y poderosos',
            cost: 1200,
            effect: null,
            stackable: false,
        },
        {
            id: 'combo_ext',
            name: 'RESONANCIA',
            desc: 'El combo dura el doble de tiempo',
            cost: 2500,
            effect: null,
            stackable: false,
        },
        {
            id: 'rage_boost',
            name: 'MODO BERSERKER',
            desc: 'Rage Mode multiplica x5 en vez de x3',
            cost: 5000,
            effect: null,
            stackable: false,
        },
        {
            id: 'auto',
            name: 'AUTO-CLICKER',
            desc: '+1 clic automático cada 2 segundos',
            cost: 3000,
            effect: null,
            stackable: false,
        },
        {
            id: 'triple',
            name: 'NEXUS CORE x3',
            desc: 'Triplica el valor base (requiere x2)',
            cost: 8000,
            requires: 'double',
            effect: (pts) => pts * 3,
            stackable: false,
        },
        {
            id: 'golden_freq',
            name: 'FRECUENCIA ÁUREA',
            desc: 'Golden Clicks aparecen más seguido',
            cost: 4000,
            effect: null,
            stackable: false,
        },
    ];

    function isOwned(id) {
        return State.get('owned').includes(id);
    }

    function canBuy(upg) {
        if (isOwned(upg.id)) return false;

        if (upg.hasOwnProperty('requires') && upg.requires) {
            if (!isOwned(upg.requires)) {
                return false;
            }
        }

        const actualScore = State.get('score') || 0;
        return actualScore >= upg.cost;
    }

    function buy(id) {
        const upg = catalog.find(u => u.id === id);

        if (!upg) {
            console.error(`Tienda: No se encontró el upgrade con ID: ${id}`);
            return false;
        }

        if (!canBuy(upg)) {
            console.warn(`Tienda: Intento de compra rechazado para ID: ${id}. Monedas actuales: ${State.get('score')}, Costo: ${upg.cost}`);
            return false;
        }

        State.inc('score', -upg.cost);

        const currentOwned = State.get('owned') || [];
        if (!currentOwned.includes(id)) {
            currentOwned.push(id);
            State.set('owned', currentOwned);
        }

        return true;
    }

    function getAll() { return catalog; }
    function getOwned() { return State.get('owned'); }

    function applyClickMultipliers(basePoints) {
        let pts = basePoints;
        if (isOwned('triple')) pts *= 3;
        else if (isOwned('double')) pts *= 2;
        pts *= State.get('prestigeMultiplier');
        return Math.floor(pts);
    }

    return { catalog, isOwned, canBuy, buy, getAll, getOwned, applyClickMultipliers };
})();