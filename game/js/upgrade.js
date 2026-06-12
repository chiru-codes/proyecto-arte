/* =============================================
   MÓDULO: UPGRADES (catálogo y lógica)
   Depende de: State
============================================= */
const Upgrades = (() => {
    const catalog = [
        {
            id: 'core',
            name: 'NEXUS CORE',
            desc: 'Cada nivel multiplica el daño base',
            baseCost: 500,
            costMult: 1.15,
        },
        {
            id: 'crit_chance',
            name: 'HYPERCRIT',
            desc: 'Cada nivel mejora los críticos',
            baseCost: 1200,
            costMult: 1.15,
        },
        {
            id: 'combo_ext',
            name: 'RESONANCIA',
            desc: 'Cada nivel alarga la ventana de combo',
            baseCost: 2500,
            costMult: 1.15,
        },
        {
            id: 'rage_boost',
            name: 'MODO BERSERKER',
            desc: 'Cada nivel potencia el modo Rage',
            baseCost: 5000,
            costMult: 1.15,
        },
        {
            id: 'auto',
            name: 'AUTO-CLICKER',
            desc: 'Cada nivel acelera el clic automático',
            baseCost: 3000,
            costMult: 1.15,
        },
        {
            id: 'golden_freq',
            name: 'FRECUENCIA ÁUREA',
            desc: 'Cada nivel reduce el tiempo entre Golden Clicks',
            baseCost: 4000,
            costMult: 1.15,
        },
    ];

    function getLevel(id) {
        const levels = State.get('upgradeLevels');
        return levels[id] || 0;
    }

    function isOwned(id) {
        return getLevel(id) > 0;
    }

    function getCost(upg) {
        const level = getLevel(upg.id);
        return Math.floor(upg.baseCost * Math.pow(upg.costMult, level));
    }

    function canBuy(upg) {
        return State.get('score') >= getCost(upg);
    }

    function buy(id) {
        const upg = catalog.find(u => u.id === id);

        if (!upg) {
            console.error(`Tienda: No se encontró el upgrade con ID: ${id}`);
            return false;
        }

        const cost = getCost(upg);

        if (State.get('score') < cost) {
            console.warn(`Tienda: Intento de compra rechazado para ID: ${id}. Monedas actuales: ${State.get('score')}, Costo: ${cost}`);
            return false;
        }

        State.inc('score', -cost);

        const levels = State.get('upgradeLevels');
        levels[id] = (levels[id] || 0) + 1;

        return true;
    }

    function getAll() { return catalog; }
    function getAllWithLevels() {
        return catalog.map(upg => ({
            ...upg,
            level: getLevel(upg.id),
            cost: getCost(upg),
        }));
    }

    function applyClickMultipliers(basePoints) {
        let pts = basePoints;
        const coreLevel = getLevel('core');
        if (coreLevel > 0) {
            pts *= (1 + coreLevel * 0.25);
        }
        pts *= State.get('prestigeMultiplier');
        return Math.floor(pts);
    }

    return { catalog, getLevel, isOwned, getCost, canBuy, buy, getAll, getAllWithLevels, applyClickMultipliers };
})();