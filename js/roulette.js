// js/roulette.js

let gradosAcumulados = 0;
let valorFichaActual = 0;
let apuestasActivas = [];

// --- CONFIGURACIÓN DE APUESTAS ---

function iniciarArrastre(event, valor) {
    valorFichaActual = valor;
    // Efecto visual opcional al arrastrar
    event.dataTransfer.setData("text/plain", valor);
}

function configurarReceptores() {
    // Buscamos todos los casilleros (incluyendo nuevos de columnas y colores)
    const receptores = document.querySelectorAll('.number-item, .zero-item, .col-btn, .bet-btn');
    
    receptores.forEach(receptor => {
        receptor.ondragover = (e) => e.preventDefault();
        receptor.ondrop = (e) => {
            e.preventDefault();
            colocarApuesta(receptor);
        };
    });
}

function colocarApuesta(elemento) {
    if (valorFichaActual <= 0) return;

    // Verificar crédito (usa tu función global)
    if (obtenerCreditos() < valorFichaActual) {
        alert("Créditos insuficientes");
        return;
    }

    modificarCreditos(-valorFichaActual);

    const nuevaApuesta = {
        id: Date.now() + Math.random(),
        monto: valorFichaActual,
        tipo: elemento.dataset.tipo,
        valor: elemento.dataset.valor,
        elemento: elemento
    };

    apuestasActivas.push(nuevaApuesta);

    // Crear la ficha visual
    const miniFicha = document.createElement('div');
    miniFicha.className = `chip-placed chip-${valorFichaActual}`;
    miniFicha.id = `fichita-${nuevaApuesta.id}`;
    miniFicha.innerText = valorFichaActual;
    
    elemento.style.position = 'relative';
    elemento.appendChild(miniFicha);

    actualizarResumen();
}

// --- BOTONES DE CONTROL ---

function actualizarResumen() {
    const total = apuestasActivas.reduce((acc, ap) => acc + ap.monto, 0);
    const display = document.getElementById('total-apostado');
    if (display) display.innerText = total;
}

function deshacerUltima() {
    const ultima = apuestasActivas.pop();
    if (ultima) {
        modificarCreditos(ultima.monto);
        const el = document.getElementById(`fichita-${ultima.id}`);
        if (el) el.remove();
        actualizarResumen();
    }
}

function limpiarPanio() {
    apuestasActivas.forEach(ap => modificarCreditos(ap.monto));
    apuestasActivas = [];
    document.querySelectorAll('.chip-placed').forEach(f => f.remove());
    actualizarResumen();
}

function duplicarApuestas() {
    const actuales = [...apuestasActivas];
    actuales.forEach(ap => {
        valorFichaActual = ap.monto;
        colocarApuesta(ap.elemento);
    });
}

// --- LÓGICA DEL JUEGO ---

function girarRuleta() {
    if (apuestasActivas.length === 0) {
        alert("¡Realizá una apuesta primero!");
        return;
    }

    const wheel = document.getElementById('roulette-wheel');
    const ball = document.getElementById('roulette-ball');
    
    // Giro infinito con fuerza (mínimo 5 vueltas)
    const giroExtra = 1800 + Math.floor(Math.random() * 360);
    gradosAcumulados += giroExtra;

    wheel.style.transition = 'transform 5s cubic-bezier(0.1, 0, 0.1, 1)';
    wheel.style.transform = `rotate(${gradosAcumulados}deg)`;

    // Si tenés el div de la bolita, podés animarlo también aquí
    if (ball) ball.classList.add('spinning');

    setTimeout(() => {
        if (ball) ball.classList.remove('spinning');
        const resultado = Math.floor(Math.random() * 37);
        document.getElementById('wheel-display').innerText = resultado;
        
        resolverPremios(resultado);
    }, 5000);
}

function resolverPremios(numero) {
    let totalGanado = 0;
    const esRojo = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(numero);
    const colorGanador = numero === 0 ? 'verde' : (esRojo ? 'red' : 'black');
    
    apuestasActivas.forEach(apuesta => {
        let gano = false;
        let pago = 0;

        // Plenos (36x)
        if (apuesta.tipo === 'numero' && parseInt(apuesta.valor) === numero) {
            gano = true; pago = 36;
        }
        // Colores (2x)
        else if (apuesta.tipo === 'color' && apuesta.valor === colorGanador) {
            gano = true; pago = 2;
        }
        // Columnas (3x)
        else if (apuesta.tipo === 'columna') {
            const fila = parseInt(apuesta.valor); // 3 (Superior), 2 (Media), 1 (Inferior)
            // Lógica: Fila 3 son números que %3 == 0, Fila 1 son %3 == 1
            if (numero !== 0 && ((fila === 3 && numero % 3 === 0) || 
                (fila === 2 && numero % 3 === 2) || 
                (fila === 1 && numero % 3 === 1))) {
                gano = true; pago = 3;
            }
        }

        if (gano) totalGanado += apuesta.monto * pago;
    });

    if (totalGanado > 0) {
        modificarCreditos(totalGanado);
        alert(`¡Salió el ${numero}! Ganaste ${totalGanado} créditos.`);
    } else {
        alert(`Salió el ${numero}. Perdiste tus apuestas.`);
    }

    // Reiniciar para la próxima ronda (sin devolver créditos)
    apuestasActivas = [];
    document.querySelectorAll('.chip-placed').forEach(f => f.remove());
    actualizarResumen();
}

dibujarNumerosEnRueda();

// Orden de los números en una ruleta europea real (sentido horario)
const ORDEN_EUROPEO = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

/**
 * Función que genera y posiciona los números y los colores DENTRO de la rueda.
 */
function dibujarNumerosEnRueda() {
    const wheel = document.getElementById('roulette-wheel');
    if (!wheel) return;

    // Calculamos los grados por número (360 / 37)
    const gradosPorNumero = 360 / 37;

    // Recorremos el array europeo para posicionar cada número
    ORDEN_EUROPEO.forEach((numero, indice) => {
        // 1. Crear el elemento de texto
        const numText = document.createElement('div');
        numText.className = 'wheel-number';
        numText.innerText = numero;

        // 2. Calcular la rotación
        const rotacionNum = indice * gradosPorNumero;
        
        // 3. Posicionar el número matemáticamente
        // Usamos una combinación de transformaciones: 
        // Primero, rotar el elemento completo, y luego, empujar el texto hacia afuera.
        // También, compensamos la rotación del texto mismo para que sea legible.
        numText.style.transform = `rotate(${rotacionNum}deg) translateY(-110px) rotate(${-rotacionNum}deg)`;

        // 4. Agregar a la rueda
        wheel.appendChild(numText);
    });
}

// js/roulette.js

let ultimaApuestaGuardada = []; // Para la función Repetir

function dibujarNumerosEnRueda() {
    const wheel = document.getElementById('roulette-wheel');
    if (!wheel) return;

    wheel.querySelectorAll('.wheel-number-container').forEach(n => n.remove());
    const gradosPorNumero = 360 / 37;

    ORDEN_EUROPEO.forEach((numero, indice) => {
        const numContainer = document.createElement('div');
        numContainer.className = 'wheel-number-container';
        
        // ASIGNACIÓN DE COLOR DIRECTA
        let colorClase = numero === 0 ? 'green' : (esRojo(numero) ? 'red' : 'black');
        
        numContainer.innerHTML = `<span class="num-text ${colorClase}">${numero}</span>`;
        const rotacionNum = indice * gradosPorNumero;
        numContainer.style.transform = `rotate(${rotacionNum}deg) translateY(-115px)`;
        wheel.appendChild(numContainer);
    });
}

// NUEVA FUNCIÓN: Repetir Apuesta
function repetirApuesta() {
    if (ultimaApuestaGuardada.length === 0) {
        alert("No hay apuestas previas para repetir.");
        return;
    }
    
    // Limpiamos el paño actual antes de repetir (opcional, según prefieras)
    // limpiarPanio(); 

    ultimaApuestaGuardada.forEach(ap => {
        valorFichaActual = ap.monto;
        colocarApuesta(ap.elemento);
    });
}

// Actualizamos el final de resolverPremios para guardar la jugada
function resolverPremios(numero) {
    let totalGanado = 0;
    const nGanador = parseInt(numero); // Aseguramos que sea número
    const esRojoGanador = esRojo(nGanador);
    const colorGanador = nGanador === 0 ? 'verde' : (esRojoGanador ? 'red' : 'black');
    
    apuestasActivas.forEach(apuesta => {
        let gano = false;
        let multiplicador = 0;

        // 1. PLENOS
        if (apuesta.tipo === 'numero' && parseInt(apuesta.valor) === nGanador) {
            gano = true; multiplicador = 36;
        }
        // 2. COLORES
        else if (apuesta.tipo === 'color' && apuesta.valor === colorGanador) {
            gano = true; multiplicador = 2;
        }
        // 3. COLUMNAS
        else if (apuesta.tipo === 'columna') {
            const col = parseInt(apuesta.valor);
            if (nGanador !== 0 && nGanador % 3 === (col % 3)) {
                gano = true; multiplicador = 3;
            }
        }

        if (gano) {
            totalGanado += (parseInt(apuesta.monto) * multiplicador);
        }
    });

    if (totalGanado > 0) {
        modificarCreditos(totalGanado); // Esta función debe sumar al saldo principal
        alert(`¡Salió el ${nGanador}! Ganaste ${totalGanado} créditos.`);
    } else {
        alert(`Salió el ${nGanador}. Suerte la próxima.`);
    }

    // Guardar para "Repetir" antes de limpiar
    ultimaApuestaGuardada = [...apuestasActivas];
    agregarHistorial(nGanador);
    
    // Limpiar mesa
    apuestasActivas = [];
    document.querySelectorAll('.chip-placed').forEach(f => f.remove());
    actualizarResumen();
}

// NUEVA FUNCIÓN: Historial de números
function agregarHistorial(numero) {
    const historialContainer = document.getElementById('lista-historial');
    if (!historialContainer) return;

    const item = document.createElement('div');
    const color = numero === 0 ? 'verde' : (esRojo(numero) ? 'rojo' : 'negro');
    item.className = `historial-item ${color}`;
    item.innerText = numero;

    // Insertar al principio para que el más nuevo se vea primero
    historialContainer.prepend(item);

    // Mantener solo los últimos 10
    if (historialContainer.children.length > 10) {
        historialContainer.removeChild(historialContainer.lastChild);
    }
}