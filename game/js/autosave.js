/* =============================================
   MÓDULO: AUTO SAVE (localStorage)
   Depende de: State
============================================= */
const AutoSave = (() => {
    const KEY = 'nexus_save_v2';
    let dirty = false;
    let interval = null;

    function save() {
       console.log("Desactivado por diseño")
    }

    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) {
                State.load(JSON.parse(raw));
            }
        } catch(e) { /* ignore */ }
    }

    function mark() { dirty = true; }

    function start() {
        load();
        interval = setInterval(() => {
            if (dirty) save();
        }, 5000);
        window.addEventListener('beforeunload', save);
    }

    function resetTotal(){
        if (typeof GameOver !== 'undefined' && GameOver.show) {
            GameOver.show();
        } else {
            localStorage.removeItem('nexus_save_v2');
            alert("¡Te quedaste sin tiempo! has perdido")
            window.location.reload();
        }
    }

    return { save, load, mark, start , resetTotal};
})();