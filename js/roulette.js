// js/roulette.js

// 1. CONFIGURACIÓN INICIAL, PERSISTENCIA Y AUDIO
const ORDEN_EUROPEO = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

// Intenta cargar sonidos (asegúrate de tener los archivos en esa ruta o cámbiala)
const sonidoBola = new Audio('assets/sounds/roulette_ball.mp3');
const sonidoPremio = new Audio('assets/sounds/win.mp3');

let saldoGuardado = localStorage.getItem('creditos');
let creditos = (saldoGuardado === null || isNaN(saldoGuardado) || parseInt(saldoGuardado) < 0) ? 1000 : parseInt(saldoGuardado);

let apuestasActivas = [];
let ultimaApuestaGuardada = [];
let valorFichaActual = 10;
let tiempoRestante = 20;
let timerInterval;
let mesaBloqueada = false;

// Exportar funciones para uso global
window.obtenerCreditos = () => creditos;
window.modificarCreditos = modificarCreditos;
window.actualizarInterfaz = actualizarInterfaz;
window.iniciarTemporizador = iniciarTemporizador;
window.configurarReceptores = configurarReceptores;
window.duplicarApuesta = duplicarApuesta;
window.limpiarPanio = limpiarPanio;
window.repetirApuesta = repetirApuesta;

// 2. LÓGICA DE CRÉDITOS E INTERFAZ
function modificarCreditos(cantidad) {
    creditos += cantidad;
    if (creditos < 0) creditos = 0; 
    localStorage.setItem('creditos', creditos);
    actualizarInterfaz();
}

function actualizarInterfaz() {
    const display = document.getElementById('saldo-display');
    const totalApostadoDisp = document.getElementById('total-apostado');
    if (display) display.innerText = creditos;
    const total = apuestasActivas.reduce((acc, ap) => acc + ap.monto, 0);
    if (totalApostadoDisp) totalApostadoDisp.innerText = total;
}

function actualizarRelojVisual() {
    const timerDisp = document.getElementById('apuesta-timer');
    if (timerDisp) timerDisp.innerText = tiempoRestante;
}

// 3. SEGURIDAD: BLOQUEO DE CONTROLES
function setEstadoControles(bloquear) {
    mesaBloqueada = bloquear; 
    const botonesControl = document.querySelectorAll('.ctrl-btn, .btn-volver, .bet-btn, .btn-casino');
    
    botonesControl.forEach(btn => {
        btn.disabled = bloquear;
        btn.style.opacity = bloquear ? "0.5" : "1";
        btn.style.pointerEvents = bloquear ? "none" : "auto";
    });

    const fichas = document.querySelectorAll('.chip');
    fichas.forEach(f => {
        f.style.opacity = bloquear ? "0.5" : "1";
        f.style.pointerEvents = bloquear ? "none" : "auto";
    });
}

// 4. SISTEMA DE TEMPORIZADOR
function iniciarTemporizador() {
    clearInterval(timerInterval);
    tiempoRestante = 20;
    setEstadoControles(false); 
    actualizarRelojVisual();

    const label = document.getElementById('timer-label');
    if (label) label.innerText = "TIEMPO PARA APOSTAR:";
    const timerText = document.getElementById('apuesta-timer');
    if (timerText) timerText.style.color = "#d4af37";

    timerInterval = setInterval(() => {
        tiempoRestante--;
        actualizarRelojVisual();
        if (tiempoRestante <= 5 && tiempoRestante > 0) {
            if (timerText) timerText.style.color = "red";
        }
        if (tiempoRestante <= 0) {
            finalizarTiempoApuestas();
        }
    }, 1000);
}

function finalizarTiempoApuestas() {
    clearInterval(timerInterval);
    if (apuestasActivas.length > 0) {
        girarRuleta();
    } else {
        iniciarTemporizador();
    }
}

// 5. SISTEMA DE APUESTAS
function configurarReceptores() {
    const receptores = document.querySelectorAll('[data-tipo]');
    receptores.forEach(rec => {
        rec.onclick = null; 
        rec.onclick = () => intentarApostar(rec);
        rec.ondragover = (e) => e.preventDefault();
        rec.ondrop = (e) => {
            e.preventDefault();
            intentarApostar(rec);
        };
    });
}

function intentarApostar(elemento) {
    if (mesaBloqueada) return;
    if (creditos >= valorFichaActual) {
        colocarApuesta(elemento);
    } else {
        alert("Créditos insuficientes");
    }
}

function colocarApuesta(elemento) {
    const tipo = elemento.dataset.tipo;
    const valor = elemento.dataset.valor;
    const monto = valorFichaActual;

    modificarCreditos(-monto);
    apuestasActivas.push({ tipo, valor, monto, elemento });

    const ficha = document.createElement('div');
    ficha.className = `chip-placed chip-${monto}`;
    ficha.innerText = monto;
    const offset = Math.floor(Math.random() * 10) - 5;
    ficha.style.transform = `translate(${offset}px, ${offset}px)`;
    
    elemento.appendChild(ficha);
    actualizarInterfaz();
}

function duplicarApuesta() {
    if (mesaBloqueada || apuestasActivas.length === 0) return;
    const totalApostado = apuestasActivas.reduce((acc, ap) => acc + ap.monto, 0);
    if (creditos >= totalApostado) {
        const actuales = [...apuestasActivas];
        actuales.forEach(ap => {
            valorFichaActual = ap.monto;
            colocarApuesta(ap.elemento);
        });
    } else {
        alert("Crédito insuficiente para duplicar");
    }
}

function limpiarPanio() {
    if (mesaBloqueada || apuestasActivas.length === 0) return;
    const totalARecuperar = apuestasActivas.reduce((acc, ap) => acc + ap.monto, 0);
    modificarCreditos(totalARecuperar);
    apuestasActivas = [];
    document.querySelectorAll('.chip-placed').forEach(f => f.remove());
    actualizarInterfaz();
}

function repetirApuesta() {
    if (mesaBloqueada || ultimaApuestaGuardada.length === 0) return;
    const costoTotal = ultimaApuestaGuardada.reduce((acc, ap) => acc + ap.monto, 0);

    if (creditos + apuestasActivas.reduce((acc, ap) => acc + ap.monto, 0) < costoTotal) {
        alert("No tenés crédito suficiente para repetir");
        return;
    }

    if (apuestasActivas.length > 0) {
        const totalARecuperar = apuestasActivas.reduce((acc, ap) => acc + ap.monto, 0);
        modificarCreditos(totalARecuperar);
        apuestasActivas = [];
        document.querySelectorAll('.chip-placed').forEach(f => f.remove());
    }

    ultimaApuestaGuardada.forEach(ap => {
        valorFichaActual = ap.monto;
        colocarApuesta(ap.elemento);
    });
}

// 6. MOTOR DE LA RULETA (CON BOLA)
function dibujarNumerosEnRueda() {
    const wheel = document.getElementById('roulette-wheel');
    if (!wheel) return;
    wheel.querySelectorAll('.wheel-number-container').forEach(n => n.remove());
    const gradosPorNumero = 360 / 37;

    ORDEN_EUROPEO.forEach((numero, indice) => {
        const numContainer = document.createElement('div');
        numContainer.className = 'wheel-number-container';
        let colorClase = numero === 0 ? 'green' : (esRojo(numero) ? 'red' : 'black');
        numContainer.innerHTML = `<span class="num-text ${colorClase}">${numero}</span>`;
        const rotacionNum = indice * gradosPorNumero;
        numContainer.style.transform = `rotate(${rotacionNum}deg) translateY(-115px)`;
        wheel.appendChild(numContainer);
    });
}

function girarRuleta() {
    // 1. Buscamos los elementos (Asegúrate que en tu HTML los IDs sean estos)
    const wheel = document.getElementById('roulette-wheel');
    const ball = document.getElementById('ball');
    const display = document.getElementById('wheel-display');
    
    // Verificación de seguridad: si no encuentra la bolita, te avisa en la consola
    if (!wheel || !ball) {
        console.error("ERROR: No se encontró la rueda (#roulette-wheel) o la bolita (#ball)");
        return;
    }

    if (apuestasActivas.length === 0) return;

    // 2. Bloqueo de mesa y sonidos
    clearInterval(timerInterval);
    setEstadoControles(true);
    if (typeof sonidoBola !== 'undefined') {
        sonidoBola.currentTime = 0;
        sonidoBola.play().catch(() => {});
    }

    // 3. HACER APARECER LA BOLITA (Aquí es donde fallaba antes)
    ball.style.display = "block"; // La hacemos visible
    ball.style.opacity = "1";     // Por las dudas tenga opacidad 0
    ball.style.animation = "orbitar 0.5s linear infinite"; // Lanzamos el giro rápido

    // 4. Elegir ganador (Matemática)
    const indiceGanador = Math.floor(Math.random() * 37);
    const numeroGanador = ORDEN_EUROPEO[indiceGanador];
    
    const vueltasRueda = 8;
    const gradosPorNumero = 360 / 37;
    const rotacionActual = parseInt(wheel.dataset.rotacion || 0);
    
    // Sincronización: La rueda gira, la bolita orbita.
    const rotacionFinalRueda = rotacionActual + (vueltasRueda * 360) + (indiceGanador * gradosPorNumero);
    
    wheel.style.transition = "transform 4s cubic-bezier(0.1, 0, 0.2, 1)";
    wheel.style.transform = `rotate(-${rotacionFinalRueda}deg)`;
    wheel.dataset.rotacion = rotacionFinalRueda;

    // 5. El momento donde la bolita cae (3.5 segundos después)
    setTimeout(() => {
        ball.style.animation = "none"; // Detiene el giro loco
        
        // La bolita se detiene arriba (punto 0) y la rueda se acomoda abajo
        ball.style.transition = "all 0.5s ease-out";
        ball.style.transform = `rotate(0deg) translateY(-120px)`; 
        
        if (typeof sonidoBola !== 'undefined') sonidoBola.pause();
    }, 3500);

    // 6. Mostrar el número ganador
    setTimeout(() => {
        if (display) display.innerText = numeroGanador; 
        resolverPremios(numeroGanador); 
    }, 4500);
}

function resolverPremios(nGanador) {
    let totalGanado = 0;
    const esRojoGanador = esRojo(nGanador);
    const colorGanador = nGanador === 0 ? 'verde' : (esRojoGanador ? 'red' : 'black');

    apuestasActivas.forEach(ap => {
        let gano = false;
        let mult = 0;
        if (ap.tipo === 'numero' && parseInt(ap.valor) === nGanador) {
            gano = true; mult = 36;
        } else if (ap.tipo === 'color' && ap.valor === colorGanador) {
            gano = true; mult = 2;
        } else if (ap.tipo === 'columna') {
            const col = parseInt(ap.valor);
            if (nGanador !== 0 && (nGanador - col) % 3 === 0) {
                gano = true; mult = 3;
            }
        }
        if (gano) totalGanado += (ap.monto * mult);
    });

    if (totalGanado > 0) {
        modificarCreditos(totalGanado);
        sonidoPremio.play().catch(e => {});
        alert(`¡Salió el ${nGanador}! Ganaste ${totalGanado} créditos.`);
    }

    agregarHistorial(nGanador);
    ultimaApuestaGuardada = [...apuestasActivas];
    apuestasActivas = [];
    document.querySelectorAll('.chip-placed').forEach(f => f.remove());
    actualizarInterfaz();

    setTimeout(() => {
        iniciarTemporizador();
    }, 1500);
}

// 7. FUNCIONES AUXILIARES
function esRojo(n) {
    return [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(n);
}

function agregarHistorial(n) {
    const lista = document.getElementById('lista-historial');
    if (!lista) return;
    const item = document.createElement('div');
    let colorClase = n === 0 ? 'verde' : (esRojo(n) ? 'rojo' : 'negro');
    item.className = `historial-item ${colorClase}`;
    item.innerText = n;
    lista.prepend(item);
    if (lista.children.length > 10) lista.removeChild(lista.lastChild);
}

window.addEventListener('beforeunload', () => {
    if (apuestasActivas.length > 0) {
        const total = apuestasActivas.reduce((acc, ap) => acc + ap.monto, 0);
        localStorage.setItem('creditos', creditos + total);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    actualizarInterfaz();
    configurarReceptores();
});