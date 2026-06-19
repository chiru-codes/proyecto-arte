/* =============================================
   CLICKER INVADERS - LA HISTORIA
   Motor narrativo principal

   Depende de todos los módulos del clicker
   (state, engine, ui, combo, rage, etc.)
   que ya están cargados antes de este script.
============================================= */

// Esperamos a que todo esté cargado para hacer el hook
document.addEventListener('DOMContentLoaded', () => {

    /* ──────────────────────────────────────────
       INICIALIZACIÓN DEL CLICKER BASE
    ────────────────────────────────────────── */
    // La inicialización principal la hace main.js de clicker
    // Solo agregamos el wrapper de game over para inactividad
    GameOverWrapper.start();

    // Esperamos un poco para asegurar que main.js ya inicializó Input
    setTimeout(() => {
        setupClickHook();
    }, 100);

    /* ──────────────────────────────────────────
       ESTADO NARRATIVO
    ────────────────────────────────────────── */
    const story = {
        currentScene: 1,
        socialStatus: 35,
        clickCount: 0,           // clics del jugador en la escena actual
        sceneClickGoal: 20,      // meta de la escena 2
        s3Multiplier: 1,
        s3ClicksRegistered: 0,
        s4Progress: 0,
        s4Goal: 200,
        s4InactivityTimer: null,
        s4LastClick: Date.now(),
        s4Advancing: false,
        autoPlayActive: false,
        exitDialogIndex: 0,
    };

    /* ──────────────────────────────────────────
       UTILIDADES
    ────────────────────────────────────────── */

    function addNotif(containerId, text, cls = 'game-notif') {
        const c = document.getElementById(containerId);
        if (!c) return;
        const el = document.createElement('div');
        el.className = cls;
        el.textContent = text;
        c.appendChild(el);
        setTimeout(() => el.remove(), 3600);
    }

    function addChatMsg(author, text) {
        const c = document.getElementById('s2-chat');
        if (!c) return;
        const el = document.createElement('div');
        el.className = 'chat-msg';
        el.innerHTML = `<span class="chat-from">${author}:</span> ${text}`;
        c.appendChild(el);
    }

    /* ──────────────────────────────────────────
       TRANSICIÓN A NEGRO + CALLBACK
    ────────────────────────────────────────── */

    function fadeToBlack(cb) {
        const bs = document.getElementById('black-screen');
        bs.classList.add('fade-in');
        setTimeout(() => {
            cb();
            setTimeout(() => {
                bs.classList.remove('fade-in');
            }, 600);
        }, 750);
    }

    /* ──────────────────────────────────────────
       CAMBIO DE ESCENA
    ────────────────────────────────────────── */

    function showScene(id) {
        document.querySelectorAll('#story-panel .scene').forEach(s => {
            s.classList.remove('active');
        });
        const target = document.getElementById('scene-' + id);
        if (target) target.classList.add('active');
        story.currentScene = id;
    }

    /* ──────────────────────────────────────────
       HOOK GLOBAL DE CLICKS EN EL CLICKER
       Interceptamos después de que Engine procesa
       cada clic y actualizamos la lógica narrativa.
    ────────────────────────────────────────── */

    function setupClickHook() {
        // Monitoreamos el estado del juego en lugar de interceptar eventos
        // Esto es más robusto porque no depende de la implementación de Input
        let lastTotalClicks = State.get('totalClicks') || 0;

        setInterval(() => {
            const currentTotalClicks = State.get('totalClicks') || 0;
            if (currentTotalClicks > lastTotalClicks) {
                const clicksDifference = currentTotalClicks - lastTotalClicks;
                console.log(`Detectados ${clicksDifference} clics nuevos`);
                for (let i = 0; i < clicksDifference; i++) {
                    onPlayerClick();
                }
                lastTotalClicks = currentTotalClicks;
            }
        }, 100);

        console.log('Hook de clics configurado con monitoreo de estado');
    }

    function onPlayerClick() {
        switch (story.currentScene) {
            case 2: onClickScene2(); break;
            case 3: onClickScene3(); break;
            case 4: onClickScene4(); break;
            case 6: onClickScene6(); break;
        }
    }

    /* ══════════════════════════════════════════
       ESCENA 1: PATIO DEL COLEGIO
    ══════════════════════════════════════════ */

    function startScene1() {
        // Deshabilitar el clicker hasta que el jugador descargue el juego
        disableClicker();

        document.querySelectorAll('#s1-options .option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                handleScene1Choice(e.target.dataset.option);
            });
        });
    }

    function handleScene1Choice(opt) {
        const optContainer = document.getElementById('s1-options');
        optContainer.innerHTML = '';

        const dialogueArea = document.querySelector('#scene-1 .scene-content');

        const responses = {
            '1': [
                { who: 'JUANITO', text: 'Es un clicker. Vas haciendo clic y subes de nivel.' },
                { who: 'PEPITO',  text: 'Es muy sencillo. Cinco minutos y ya eres adicto.' },
                { who: 'JUANITO', text: 'Además es gratis. Es como tener mil sorpresas en una app.' },
            ],
            '2': [
                { who: 'PEPITO',  text: 'Yo también decía lo mismo, ¿pero sabes qué?' },
                { who: 'JUANITO', text: 'Todos al final terminan jugando.' },
                { who: 'PEPITO',  text: 'Luego te engancha y ya no quieres parar.' },
            ],
            '3': [
                { who: 'PEPITO',  text: '¿En serio? ¿Entonces sabes lo bueno que está?' },
                { who: 'JUANITO', text: '¿Y por qué todavía no juegas?' },
                { who: 'PEPITO',  text: 'Si quieres te agregamos al grupo de chat.' },
            ],
        };

        responses[opt].forEach((line, i) => {
            setTimeout(() => {
                const box = document.createElement('div');
                box.className = 'dialogue-box';
                box.innerHTML = `<div class="char-name">${line.who}</div><div class="char-text">${line.text}</div>`;
                dialogueArea.appendChild(box);
                box.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, i * 1000);
        });

        setTimeout(() => {
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'option-btn';
            downloadBtn.textContent = 'Descargar juego';
            downloadBtn.addEventListener('click', () => {
                fadeToBlack(() => {
                    showScene(2);
                    startScene2();
                });
            });
            optContainer.appendChild(downloadBtn);
            dialogueArea.appendChild(optContainer);
        }, responses[opt].length * 1000 + 800);
    }

    /* ══════════════════════════════════════════
       ESCENA 2: HABITACIÓN - PRIMER CONTACTO
    ══════════════════════════════════════════ */

    let s2Phase = 0; // cuántos hitos se han disparado

    function startScene2() {
        story.clickCount = 0;
        s2Phase = 0;
        enableClicker();

        // Chat inicial
        setTimeout(() => addChatMsg('Juanito', '¿Ya empezaste?'), 2000);
        setTimeout(() => addChatMsg('Juanito', 'Te dije que era divertido.'), 5000);
        setTimeout(() => {
            addChatMsg('Pepito', 'Todos ya entraron al evento.');
        }, 4000);

        setTimeout(() => {
            addChatMsg('Juanito', 'Si no juegas hoy te lo pierdes.');
        }, 6000);

        setTimeout(() => {
            addChatMsg('Pepito', 'Solo dura 24 horas.');
        }, 8000);

        setTimeout(() => {
            addChatMsg('Juanito', 'Ya somos todos nivel 30.');
        }, 10000);

        setTimeout(() => {
            addChatMsg('Pepito', 'Faltas tú.');
        }, 12000);
    }

    function onClickScene2() {
        story.clickCount++;
        const remaining = Math.max(0, 20 - story.clickCount);
        const goal = document.getElementById('s2-goal');
        if (goal) goal.textContent = 'Clics necesarios: ' + remaining;

        // Hitos del script
        if (story.clickCount === 1 && s2Phase < 1) {
            s2Phase = 1;
            addNotif('s2-notifs', '¡Nivel 1 completado!');
        }
        if (story.clickCount === 4 && s2Phase < 2) {
            s2Phase = 2;
            addNotif('s2-notifs', '¡Nivel 2 desbloqueado!');
            addNotif('s2-notifs', '+5 de Status Social');
            story.socialStatus += 5;
        }
        if (story.clickCount === 8 && s2Phase < 3) {
            s2Phase = 3;
            addNotif('s2-notifs', '¡Nivel 3 completado!');
        }
        if (story.clickCount === 12 && s2Phase < 4) {
            s2Phase = 4;
            addNotif('s2-notifs', '¡Nivel 4 completado!');
        }
        if (story.clickCount === 16 && s2Phase < 5) {
            s2Phase = 5;
            addNotif('s2-notifs', '¡Nivel 5 completado!');
        }
        if (story.clickCount >= 20 && s2Phase < 6) {
            s2Phase = 6;
            triggerRewardBox();
        }
    }

    function triggerRewardBox() {
        disableClicker();

        setTimeout(() => {
            addNotif('s2-notifs', '🎁 ¡Caja gratuita disponible!');
        }, 500);

        setTimeout(() => {
            addNotif('s2-notifs', '🎩 Recompensa: Sombrero Galáctico Legendario (+25% velocidad)');
        }, 2000);

        setTimeout(() => {
            addNotif('s2-notifs', '+10 de Status Social');
            story.socialStatus += 10;
        }, 3200);

        setTimeout(() => {
            addChatMsg('Pepito', '¿Ya abriste tu caja?');
        }, 4500);
        setTimeout(() => {
            addChatMsg('Juanito', 'Yo conseguí una legendaria.');
        }, 6000);
        setTimeout(() => {
            addChatMsg('Pepito', '¡Buenísimo!');
        }, 7500);

        setTimeout(() => {
            addNotif('s2-notifs', '⏰ ¡Evento exclusivo por tiempo limitado! Termina en 23:59:59.');
        }, 9000);
        setTimeout(() => {
            addNotif('s2-notifs', '🛒 ¡Oferta única: Caja x10 – 80% de descuento!');
        }, 10500);
        setTimeout(() => {
            addNotif('s2-notifs', '⚡ ¡Tus amigos avanzan más rápido que tú!');
        }, 12000);

        setTimeout(() => {
            fadeToBlack(() => {
                showScene(3);
                startScene3();
            });
        }, 14500);
    }

    /* ══════════════════════════════════════════
       ESCENA 3: HABITACIÓN - ENGANCHE
    ══════════════════════════════════════════ */

    let s3AutoBuyInterval = null;
    let s3ParentTimeout = null;

    function startScene3() {
        story.s3ClicksRegistered = 0;
        story.s3Multiplier = 1;
        enableClicker();

        // Compras automáticas periódicas
        const purchases = ['¡Compra realizada!', '¡Caja Misteriosa comprada!'];
        let buyIdx = 0;
        s3AutoBuyInterval = setInterval(() => {
            if (story.currentScene !== 3) {
                clearInterval(s3AutoBuyInterval);
                return;
            }
            const el = document.createElement('div');
            el.className = 'buy-notif';
            el.textContent = purchases[buyIdx % purchases.length];
            document.getElementById('s3-buys').appendChild(el);
            buyIdx++;
            setTimeout(() => el.remove(), 2200);
        }, 3500);

        // Padres hablan a los 5 segundos
        s3ParentTimeout = setTimeout(() => {
            const p = document.getElementById('s3-parents');
            if (p) p.classList.add('show');
            setTimeout(() => {
                p.innerHTML = '<div class="parent-line">MAMÁ: [suspiro] "…."</div><div class="parent-line">PAPÁ: [silencio] "…."</div>';
            }, 4000);
        }, 5000);
    }

    function onClickScene3() {
        // A partir del clic 75 cada clic cuenta el doble
        if (story.s3ClicksRegistered >= 75) {
            story.s3Multiplier = 2;
        }
        story.s3ClicksRegistered += story.s3Multiplier;

        const total = 500;
        const progress = Math.min(story.s3ClicksRegistered / total, 1);
        const counter = document.getElementById('s3-counter');
        if (counter) {
            counter.textContent = `Meta: ${total} clics (${story.s3ClicksRegistered}/${total})`;
        }
        const bar = document.getElementById('s3-timebar');
        if (bar) {
            bar.style.width = (progress * 100) + '%';
        }

        if (story.s3ClicksRegistered >= total) {
            story.s3ClicksRegistered = total;
            clearInterval(s3AutoBuyInterval);
            clearTimeout(s3ParentTimeout);

            // Intentar abrir Configuración → aparece la Tienda
            showFakeConfigRedirect();

            setTimeout(() => {
                fadeToBlack(() => {
                    showScene(4);
                    startScene4();
                });
            }, 3000);
        }
    }

    function showFakeConfigRedirect() {
        // Pop-up que simula que al intentar cerrar algo aparece la tienda
        Effects.toast('⚙ Configuración → 🛒 ¡Abriendo la Tienda!', 'gold');
        setTimeout(() => {
            Effects.toast('✕ Cerrar anuncio → 🎁 ¡Oferta especial!', 'gold');
        }, 1500);
    }

    /* ══════════════════════════════════════════
       ESCENA 4: SALA DE ESTAR
    ══════════════════════════════════════════ */

    const s4Dates = ['01/09/2026', '15/09/2026', '28/09/2026', '12/10/2026', '03/11/2026'];
    let s4DateIdx = 0;
    let s4DateInterval = null;
    let s4InactivityCheck = null;
    let s4TotalClicks = 0;        // clics reales del jugador
    let s4SceneFinished = false;

    // La meta sube progresivamente: 200 → 500 → (fin de escena)
    // El jugador debe mantener el ritmo o se resetea
    const S4_INACTIVITY_MS = 3000; // 3 segundos sin clic → advertencia → 1.5s más → reset

    function startScene4() {
        story.s4Progress = 0;
        story.s4Goal = 200;
        s4TotalClicks = 0;
        s4SceneFinished = false;
        story.s4LastClick = Date.now();

        enableClicker();
        updateS4HUD();

        // Fechas que avanzan cada 6 s
        s4DateInterval = setInterval(() => {
            if (story.currentScene !== 4 || s4SceneFinished) {
                clearInterval(s4DateInterval);
                return;
            }
            if (s4DateIdx < s4Dates.length) {
                const d = document.getElementById('s4-date');
                if (d) d.textContent = s4Dates[s4DateIdx];
                s4DateIdx++;
            }
        }, 6000);

        // Padres según el script
        setTimeout(() => {
            const p = document.getElementById('s4-parents');
            if (!p) return;

            p.classList.add('show');
            p.innerHTML = '<div class="parent-line">MAMÁ: Ojalá fuera igual de dedicado con los estudios…</div>';

            setTimeout(() => {
            p.innerHTML += '<div class="parent-line">PAPÁ: Al menos en eso le va bien; solo ha bajado en química.</div>';
            }, 3000);

        }, 5000);

        // Televisor cambia de canal
        const tvChannels = ['📺 Canal 4', '📺 Canal 7', '📺 Canal 9', '📺 Canal 11', '📺 Canal 13'];
        let tvIdx = 0;
        const tvInterval = setInterval(() => {
            if (story.currentScene !== 4 || s4SceneFinished) {
                clearInterval(tvInterval);
                return;
            }
            const tv = document.getElementById('s4-tv');
            if (tv) {
                tv.textContent = tvChannels[tvIdx];
                tvIdx = (tvIdx + 1) % tvChannels.length;
            }
        }, 4000);

        // Status social y nivel suben automáticamente
        setInterval(() => {
            if (story.currentScene !== 4 || s4SceneFinished) return;
            story.socialStatus += 2;
            const sv = document.getElementById('s4-status');
            if (sv) sv.textContent = 'Status social: ' + story.socialStatus;
        }, 2000);

        // Chequeo de inactividad
        s4InactivityCheck = setInterval(() => {
            if (story.currentScene !== 4 || s4SceneFinished) {
                clearInterval(s4InactivityCheck);
                return;
            }
            const elapsed = Date.now() - story.s4LastClick;
            const warn = document.getElementById('s4-warn');

            if (elapsed > S4_INACTIVITY_MS) {
                if (warn) warn.style.display = 'block';
            } else {
                if (warn) warn.style.display = 'none';
            }

            // Pasados 4.5 s sin clic → reset del progreso
            if (elapsed > S4_INACTIVITY_MS + 1500) {
                story.s4Progress = 0;
                story.s4LastClick = Date.now();
                updateS4HUD();
                Effects.toast('¡Perdiste tu progreso! Sigue clickeando.', 'danger');
            }
        }, 500);
    }

    function onClickScene4() {
        if (s4SceneFinished) return;

        story.s4LastClick = Date.now();
        story.s4Progress++;
        s4TotalClicks++;

        const warn = document.getElementById('s4-warn');
        if (warn) warn.style.display = 'none';

        // Status social sube
        story.socialStatus++;
        const sv = document.getElementById('s4-status');
        if (sv) sv.textContent = 'Status social: ' + story.socialStatus;

        updateS4HUD();

        if (story.s4Progress >= story.s4Goal) {
            if (story.s4Goal === 200) {
                // Primera meta → subir a 500
                story.s4Goal = 500;
                story.s4Progress = 0;
                updateS4HUD();
                Effects.toast('Meta actualizada: 500 clics', 'gold');
            } else {
                // Segunda meta cumplida → transición
                s4SceneFinished = true;
                clearInterval(s4DateInterval);
                clearInterval(s4InactivityCheck);
                // La sala se oscurece
                const livBg = document.querySelector('#scene-4 .scene-bg');
                if (livBg) livBg.style.filter = 'brightness(0.15)';
                setTimeout(() => {
                    fadeToBlack(() => {
                        showScene(5);
                        startScene5();
                    });
                }, 2000);
            }
        }
    }

    function updateS4HUD() {
        const p = document.getElementById('s4-progress');
        if (p) p.textContent = `${story.s4Progress}/${story.s4Goal}`;
    }

    /* ══════════════════════════════════════════
       ESCENA 5: COMPRA NO AUTORIZADA
    ══════════════════════════════════════════ */

    function startScene5() {
        disableClicker();

        const noBtn  = document.getElementById('s5-no');
        const yesBtn = document.getElementById('s5-yes');

        let purchased = false;

        function doForcePurchase() {
            if (purchased) return;
            purchased = true;
            forcePurchase();
        }

        // El botón "Sí" hace lo mismo que "No" — el juego igualmente procede
        noBtn.addEventListener('click', doForcePurchase);
        yesBtn.addEventListener('click', doForcePurchase);
    }

    function forcePurchase() {
        // Ocultar modal
        document.getElementById('s5-modal').classList.add('hidden');

        // Mostrar compra forzada
        const forced = document.getElementById('s5-forced');
        forced.classList.remove('hidden');

        // Pensamiento
        setTimeout(() => {
            const thought = document.getElementById('s5-thought');
            thought.classList.remove('hidden');
        }, 1500);

        // Reacción de padres
        setTimeout(() => {
            document.getElementById('s5-thought').classList.add('hidden');
            const reaction = document.getElementById('s5-parents');
            reaction.classList.remove('hidden');
        }, 4000);

        // Transición a escena 6
        setTimeout(() => {
            fadeToBlack(() => {
                showScene(6);
                startScene6();
            });
        }, 8000);
    }

    /* ══════════════════════════════════════════
       ESCENA 6: HABITACIÓN - FINAL
    ══════════════════════════════════════════ */

    let s6ClickCount = 0;
    let s6AutoLevel = 50;
    let s6AutoInterval = null;
    let s6MetaValue = 100000000;
    let s6YearIndex = 0;
    const s6Years = ['2027', '2028', '2029', '2030', '2040'];
    let s6AutoStarted = false;

    function startScene6() {
        s6ClickCount = 0;
        s6AutoStarted = false;
        story.autoPlayActive = false;
        enableClicker();

        // Botón SALIR
        document.getElementById('s6-exit-btn').addEventListener('click', startExitSequence);
    }

    function onClickScene6() {
        if (story.autoPlayActive) return; // ya no responde

        s6ClickCount++;

        // Después de 10 clics el juego empieza a jugar solo
        if (s6ClickCount >= 10 && !s6AutoStarted) {
            s6AutoStarted = true;
            startAutoPlay6();
        }
    }

    function startAutoPlay6() {
        story.autoPlayActive = true;

        // El clicker se desvanece un poco (como si el personaje ya no lo controla)
        const gc = document.getElementById('game-container');
        if (gc) gc.style.opacity = '0.4';

        // Ojo reflejado en pantalla
        document.getElementById('s6-eyes').classList.remove('hidden');

        // Niveles que suben solos
        s6AutoInterval = setInterval(() => {
            if (story.currentScene !== 6) { clearInterval(s6AutoInterval); return; }

            const el = document.createElement('div');
            el.className = 'lvl-notif';
            el.textContent = `Nivel ${s6AutoLevel} completado. ¡Nivel ${s6AutoLevel + 1} desbloqueado!`;
            const stream = document.getElementById('s6-levels');
            stream.appendChild(el);
            // Mantener solo las últimas 6 líneas visibles
            while (stream.children.length > 6) stream.removeChild(stream.firstChild);

            s6AutoLevel++;

            // Meta creciente
            if (s6AutoLevel % 50 === 0) {
                s6MetaValue *= 10;
                const mt = document.getElementById('s6-meta');
                const ml = document.getElementById('s6-meta-text');
                mt.classList.remove('hidden');
                if (ml) {
                    ml.textContent = `Meta actual: ${s6MetaValue.toLocaleString('es-PE')} clics`;
                    ml.style.animation = 'none';
                    void ml.offsetWidth;
                    ml.style.animation = '';
                }
            }

            // Años
            if (s6AutoLevel === 100) showYear();
            if (s6AutoLevel === 150) showYear();
            if (s6AutoLevel === 200) showYear();
            if (s6AutoLevel === 280) showYear();
            if (s6AutoLevel === 380) showYear();

            // Mensaje "has superado a tus amigos"
            if (s6AutoLevel === 200) {
                Effects.toast('¡Felicitaciones! Has superado a Pepito y Juanito.', 'gold');
            }

            // Al llegar a nivel 397 mostrar botón de salida
            if (s6AutoLevel >= 397) {
                clearInterval(s6AutoInterval);
                document.getElementById('s6-exit-area').classList.remove('hidden');
                Effects.toast('[SALIR]  — la única opción activa', 'gold');
            }
        }, 200);
    }

    function showYear() {
        if (s6YearIndex >= s6Years.length) return;
        const yd = document.getElementById('s6-year');
        yd.classList.remove('hidden');
        yd.textContent = s6Years[s6YearIndex];
        s6YearIndex++;
    }

    /* ── Secuencia de diálogos de salida ── */

    const exitSteps = [
        { msg: 'Perderás 3 años de progreso.',     btn: 'CONTINUAR', cls: '' },
        { msg: 'Tus amigos te superarán.',          btn: 'CONTINUAR', cls: '' },
        { msg: '¿Estás seguro?',                    btn: 'SÍ',        cls: 'yes-btn' },
        { msg: '¿Realmente seguro?',                btn: 'SÍ',        cls: 'yes-btn' },
        { msg: '¡Oferta especial antes de salir!',  btn: 'CONTINUAR', cls: '' },
        { msg: 'Última oferta.',                    btn: 'CONTINUAR', cls: '' },
        { msg: 'Oferta irrepetible.',               btn: 'CONTINUAR', cls: '' },
        { msg: 'Oferta legendaria.',                btn: 'CONTINUAR', cls: '' },
        { msg: '',                                   btn: 'VOLVER AL JUEGO', cls: 'return-btn' },
    ];

    function startExitSequence() {
        document.getElementById('s6-exit-area').style.display = 'none';
        clearInterval(s6AutoInterval);
        story.exitDialogIndex = 0;
        showExitStep();
    }

    function showExitStep() {
        const step = exitSteps[story.exitDialogIndex];
        if (!step) {
            // Pasamos del último → handleReturn
            handleReturn();
            return;
        }

        const box = document.getElementById('s6-exit-dialog');
        const msg = document.getElementById('s6-exit-msg');
        const btn = document.getElementById('s6-exit-action');

        box.classList.remove('hidden');
        msg.textContent = step.msg || '';
        btn.textContent = step.btn;
        btn.className   = 'exit-dialog-btn ' + (step.cls || '');

        // Limpiar listener anterior
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            story.exitDialogIndex++;
            showExitStep();
        });
    }

    function handleReturn() {
        const box = document.getElementById('s6-exit-dialog');
        box.classList.add('hidden');

        // El jugador presiona VOLVER AL JUEGO — pero ahora
        // la ventana del juego se encoge y pasamos a tercera persona

        // Restaurar opacidad del clicker
        const gc = document.getElementById('game-container');
        if (gc) {
            gc.style.transition = 'transform 2s ease, opacity 2s ease';
            gc.style.opacity    = '0.7';
            gc.style.transform  = 'scale(0.55)';
        }

        // Cambiar a vista de tercera persona
        setTimeout(() => {
            const scene6 = document.getElementById('scene-6');
            const thirdView = document.createElement('div');
            thirdView.className = 'third-person-view';
            thirdView.innerHTML = `
                <p>Vemos la espalda del protagonista frente al PC jugando.</p>

                <p style="color: var(--c-muted); margin-top:20px;">
                    Nivel 999999 completado.
                </p>

                <p style="color: var(--c-muted); margin-top:20px;">
                    Tus amigos dejaron de jugar hace años.
                </p>

                <p style="font-size:1.4rem; margin-top:30px;">
                    Sigues aquí.
                </p>
            `;
            scene6.appendChild(thirdView);

            // Oscurecer todo lentamente
            setTimeout(() => {
                scene6.style.transition = 'opacity 4s ease';
                scene6.style.opacity = '0';
                if (gc) gc.style.transition = 'opacity 4s ease';
                if (gc) gc.style.opacity = '0';

                setTimeout(() => {
                    showScene('credits');
                    startCredits();
                }, 4500);
            }, 3500);
        }, 2000);
    }

    /* ══════════════════════════════════════════
       CRÉDITOS
    ══════════════════════════════════════════ */

    function startCredits() {
        const scene = document.getElementById('scene-credits');
        scene.classList.add('active');
        scene.style.opacity = '1';

        setTimeout(() => {
            location.reload();
        }, 14000);
    }

    /* ══════════════════════════════════════════
       HABILITAR / DESHABILITAR CLICKER
       El clicker (panel derecho) es siempre
       interactivo. Solo controlamos la opacidad
       del botón para indicar estado al jugador.
    ══════════════════════════════════════════ */

    function enableClicker() {
        const btn = document.getElementById('click-btn');
        if (btn) {
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        }
    }

    function disableClicker() {
        const btn = document.getElementById('click-btn');
        if (btn) {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.25';
        }
    }

    /* ──────────────────────────────────────────
       ARRANQUE
    ────────────────────────────────────────── */

    // El clicker se inicializa pero sin Input (sin clic)
    // La escena 1 lo deshabilita manualmente
    startScene1();

    // Input.start() ya fue llamado por main.js de clicker
    // No necesitamos llamarlo de nuevo

});
