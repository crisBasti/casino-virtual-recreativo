// js/slots.js

// Objeto para gestionar los sonidos
const sonidos = {
    giro: new Audio('assets/ruleta.mp3'),
    premio: new Audio('assets/winer.mp3'),
    click: new Audio('assets/click.mp3')
};

/**
 * Función para reproducir sonidos de forma segura
 */
function reproducirSonido(nombre) {
    const sonido = sonidos[nombre];
    if (sonido && sonido.readyState >= 2) { // Solo intenta tocarlo si el archivo cargó bien
        sonido.currentTime = 0;
        sonido.play().catch(e => console.warn("Audio bloqueado o no encontrado."));
    } else {
        console.log(`Sonido "${nombre}" no disponible, pero el juego sigue...`);
    }
}

// --- Modificá la función girarSlots() que ya tenías ---
// js/slots.js

function girarSlots(botonPresionado) {
    // Encontramos la máquina desde el botón que se tocó
    const machine = botonPresionado.closest('.slot-machine-container');
    const inputApuesta = document.getElementById('apuesta-input');
    const apuesta = parseInt(inputApuesta.value);

    if (!modificarCreditos(-apuesta)) return;

    reproducirSonido('giro');

    const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
    reels.forEach(reel => reel.classList.add('girando'));

    setTimeout(() => {
        const resultados = [obtenerSimboloAleatorio(), obtenerSimboloAleatorio(), obtenerSimboloAleatorio()];
        
        reels.forEach((reel, i) => {
            reel.classList.remove('girando');
            reel.innerText = resultados[i].icono;
        });

        // LE PASAMOS LA MÁQUINA DIRECTAMENTE A LA FUNCIÓN DE PREMIO
        procesarPremio(resultados, apuesta, machine);
    }, 1000);
}

function procesarPremio(resultados, apuesta, machine) {
    const esGanador = resultados[0].icono === resultados[1].icono && 
                      resultados[1].icono === resultados[2].icono;

    if (esGanador) {
        const premio = resultados[0].valor * apuesta;
        
        if (machine) {
            // DESTELLO GARANTIZADO (Estilo directo)
            machine.style.boxShadow = "0 0 80px gold";
            machine.style.border = "5px solid gold";
            machine.classList.add('jackpot-anim');
            
            setTimeout(() => {
                machine.style.boxShadow = "0 0 50px rgba(0,0,0,1)";
                machine.style.border = "4px solid #444";
                machine.classList.remove('jackpot-anim');
            }, 3000);
        }

        modificarCreditos(premio);
        setTimeout(() => alert("¡GANASTE!"), 100);
    }
}

/**
 * Lógica de premios
 */
function procesarPremio(resultados, apuesta) {
    const esGanador = resultados[0].icono === resultados[1].icono && 
                      resultados[1].icono === resultados[2].icono;

    if (esGanador) {
        const premio = resultados[0].valor * apuesta;
        
        // 1. Buscamos el elemento de varias formas por si acaso
        const machine = document.getElementById('slot-machine-main') || 
                        document.querySelector('.slot-machine-container');
        
        if (machine) {
            console.log("!!! PREMIO DETECTADO - APLICANDO DESTELLO !!!");

            // FUERZA BRUTA: Aplicamos el brillo directamente al estilo del elemento
            machine.style.border = "5px solid gold";
            machine.style.boxShadow = "0 0 80px gold";
            machine.style.transition = "all 0.3s";

            // También intentamos poner la clase por si ahora quiere andar
            machine.classList.add('jackpot-anim');

            // Quitamos el efecto después de 3 segundos
            setTimeout(() => {
                machine.style.border = "4px solid #444";
                machine.style.boxShadow = "0 0 50px rgba(0,0,0,1)";
                machine.classList.remove('jackpot-anim');
            }, 3000);
        }

        modificarCreditos(premio);
        
        // El alert lo dejamos para el final de todo
        setTimeout(() => {
            alert("¡GANASTE " + premio + " CRÉDITOS!");
        }, 500);
    }
}

// Definición de símbolos con sus respectivos pesos (probabilidades) y premios
const SIMBOLOS = [
    { icono: '🍒', valor: 2, peso: 40 },  // Sale mucho, paga poco
    { icono: '🍋', valor: 5, peso: 30 },
    { icono: '🔔', valor: 10, peso: 15 },
    { icono: '💎', valor: 50, peso: 10 },
    { icono: '7️⃣', valor: 100, peso: 5 }   // El Jackpot: sale poco, paga mucho
];

/**
 * Función principal del giro
 */
function girarSlots() {
    const inputApuesta = document.getElementById('apuesta-input');
    const apuesta = parseInt(inputApuesta.value);

    // 1. Validar apuesta (usamos la función de auth.js)
    if (!modificarCreditos(-apuesta)) return;

    // 2. Efecto visual de "girando" (clase CSS)
    const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
    reels.forEach(reel => reel.classList.add('girando'));

    // 3. Obtener resultados después de un pequeño "delay" para simular giro
    setTimeout(() => {
        const resultados = [obtenerSimboloAleatorio(), obtenerSimboloAleatorio(), obtenerSimboloAleatorio()];
        
        // Actualizar interfaz
        reels.forEach((reel, i) => {
            reel.classList.remove('girando');
            reel.innerText = resultados[i].icono;
        });

        // 4. Calcular premios
        procesarPremio(resultados, apuesta);
    }, 1000);
}

/**
 * Selecciona un símbolo basado en los pesos definidos
 */
function obtenerSimboloAleatorio() {
    const totalPeso = SIMBOLOS.reduce((acc, s) => acc + s.peso, 0);
    let random = Math.random() * totalPeso;
    
    for (const simbolo of SIMBOLOS) {
        if (random < simbolo.peso) return simbolo;
        random -= simbolo.peso;
    }
}

/**
 * Lógica de premios
 */
function procesarPremio(resultados, apuesta) {
    // Si los tres son iguales
    if (resultados[0].icono === resultados[1].icono && resultados[1].icono === resultados[2].icono) {
        const premio = resultados[0].valor * apuesta;
        modificarCreditos(premio);
        alert(`¡JACKPOT! Ganaste ${premio} créditos con ${resultados[0].icono}`);
    } 
    // Si solo hay dos iguales (premio consuelo)
    else if (resultados[0].icono === resultados[1].icono || resultados[1].icono === resultados[2].icono || resultados[0].icono === resultados[2].icono) {
        const premioConsuelo = Math.floor(apuesta * 0.5);
        // Podrías decidir no pagar nada si solo hay 2, o pagar la mitad.
    }
}