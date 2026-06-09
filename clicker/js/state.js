/* =============================================
   MÓDULO: STATE (fuente de verdad global)
============================================= */
const State = (() => {
    const defaults = {
        score: 0,
        totalClicks: 0,
        allTimeCoins: 0,
        prestige: 0,
        prestigeMultiplier: 1,

        // Combo
        combo: 1,
        comboTimer: 0,
        maxCombo: 1,

        // Rage
        rage: 0,
        rageActive: false,
        rageTimer: 0,

        // Upgrades (objeto id → nivel)
        upgradeLevels: {},

        // Revives (contador de microtransacciones)
        revives: 0,

        // CPS (clicks per second tracking)
        recentClicks: [],
    };

    let data = { ...defaults };

    return {
        get: (key) => data[key],
        set: (key, val) => { data[key] = val; },
        inc: (key, amt = 1) => { data[key] += amt; },
        getAll: () => ({ ...data }),
        reset: () => { data = { ...defaults }; },
        load: (saved) => { data = { ...defaults, ...saved }; },
    };
})();