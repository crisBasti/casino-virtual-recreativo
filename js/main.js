// js/main.js

/**
 * Renderiza el Lobby principal con las tarjetas de los juegos
 */
function renderizarLobby() {
    const contenedor = document.getElementById('app-container');
    if (!contenedor) return;

    // Agregamos la clase lobby al contenedor para que el SCSS se active
    contenedor.innerHTML = `
        <section class="lobby">
            <h2 class="lobby-title">Elegí tu mesa</h2>
            
            <div class="game-grid">
                <div class="game-card" onclick="cargarJuego('slots')">
                    <div class="card-image slots-bg">
                        <span class="badge">Nuevo</span>
                    </div>
                    <div class="card-info">
                        <h3>Tragamonedas</h3>
                        <p>Probá tu suerte en las máquinas clásicas.</p>
                        <button class="btn-casino">Jugar Ahora</button>
                    </div>
                </div>

                <div class="game-card" onclick="cargarJuego('ruleta')">
                    <div class="card-image ruleta-bg">
                        </div>
                    <div class="card-info">
                        <h3>Ruleta Europea</h3>
                        <p>La emoción del giro en tiempo real.</p>
                        <button class="btn-casino">Jugar Ahora</button>
                    </div>
                </div>
            </div>
        </section>
    `;
}

/**
 * Función principal para cargar las diferentes secciones del casino
 */
function cargarJuego(juego) {
    const contenedor = document.getElementById('app-container');
    contenedor.style.opacity = '0';

    setTimeout(() => {
        if (juego === 'slots') {
            renderizarSlots(contenedor);
        } else if (juego === 'ruleta') {
            renderizarRuleta(contenedor);
        }
        contenedor.style.opacity = '1';
        
        if (typeof actualizarInterfaz === 'function') {
            actualizarInterfaz();
        }
    }, 300);
}

function renderizarSlots(container) {
    container.innerHTML = `
        <section class="game-screen">
            <button class="btn-volver" onclick="renderizarLobby()">← Volver al Lobby</button>
            <div class="slot-machine-container" id="slot-machine-main">
                <div class="reels-container">
                    <div class="reel" id="reel1">🍒</div>
                    <div class="reel" id="reel2">🍋</div>
                    <div class="reel" id="reel3">7️⃣</div>
                </div>
                <div class="controls">
                    <div class="input-wrapper">
                        <label>Apuesta:</label>
                        <input type="number" id="apuesta-input" value="10" min="10" step="10">
                    </div>
                    <button class="btn-casino" onclick="girarSlots(this)">¡GIRAR!</button>
                </div>
            </div>
        </section>
    `;
}

function renderizarRuleta(container) {
    container.innerHTML = `
        <section class="game-screen">
            <button class="btn-volver" onclick="renderizarLobby()">← Volver al Lobby</button>
            <div class="roulette-layout">

            <div class="timer-container">
                <span id="timer-label">TIEMPO PARA APOSTAR:</span>
                <span id="apuesta-timer">20</span>s
            </div>
                
                <div class="wheel-section">
                    <div id="roulette-wheel" class="wheel-outer">
                    <div id="ball" class="ball"></div>
                        <div class="wheel-inner">
                            <div id="wheel-display">?</div>
                        </div>
                    </div>
                    <div class="display-info">
                        <div class="bet-counter">APUESTA EN MESA: <span id="total-apostado">0</span></div>
                        <button class="btn-casino" onclick="girarRuleta()">¡GIRAR RUEDA!</button>
                    </div>
                </div>

                
                <div class="historial-container">
                    <span style="color: #d4af37; font-size: 0.8rem; margin-bottom: 5px;">ÚLTIMOS RESULTADOS:</span>
                    <div id="lista-historial" class="lista-historial"></div>
                </div>

                <div class="table-container">
                    <div class="betting-board">
                        <div class="zero-item" data-tipo="numero" data-valor="0">0</div>
                        <div class="numbers-grid" id="numbers-grid"></div>
                        <div class="columns-grid">
                            <div class="col-btn" data-tipo="columna" data-valor="1">2 a 1</div>
                            <div class="col-btn" data-tipo="columna" data-valor="2">2 a 1</div>
                            <div class="col-btn" data-tipo="columna" data-valor="3">2 a 1</div>
                        </div>
                    </div>

                    <div class="mobile-controls-wrapper">
                        <div class="outside-bets">
                            <div class="bet-btn red" data-tipo="color" data-valor="red">ROJO</div>
                            <div class="bet-btn black" data-tipo="color" data-valor="black">NEGRO</div>
                        </div>

                        <div class="control-buttons">
                            <button class="ctrl-btn clear" onclick="limpiarPanio()">Limpiar</button>
                            <button class="ctrl-btn repeat" onclick="repetirApuesta()">Repetir</button>
                            <button class="ctrl-btn double" onclick="duplicarApuesta()">x2</button>
                            <button class="ctrl-btn clear" onclick="limpiarPanio()">C</button>
                        </div>
                    </div>
                </div>

                <div class="chips-fichero-horizontal">
                    ${[10, 50, 100, 500].map(v =>
                        `<div class="chip chip-${v}" onclick="setFichaActual(${v})" draggable="true" ondragstart="iniciarArrastre(event, ${v})">${v}</div>`).join('')}
                </div>
            </div>
        </section>
    `;

    setTimeout(() => {
    if (typeof dibujarNumerosEnRueda === 'function') dibujarNumerosEnRueda();
    if (typeof configurarReceptores === 'function') configurarReceptores();
    if (typeof iniciarTemporizador === 'function') iniciarTemporizador(); // <--- INICIAR AQUÍ
    actualizarInterfaz();
}, 50);

    const grid = document.getElementById('numbers-grid');
    if (grid) {
        for (let i = 1; i <= 36; i++) {
            const numDiv = document.createElement('div');
            numDiv.className = `number-item ${esRojo(i) ? 'red' : 'black'}`;
            numDiv.innerText = i;
            numDiv.dataset.tipo = 'numero';
            numDiv.dataset.valor = i;
            grid.appendChild(numDiv);
        }
    }

    setTimeout(() => {
        if (typeof dibujarNumerosEnRueda === 'function') dibujarNumerosEnRueda();
        if (typeof configurarReceptores === 'function') configurarReceptores();
        if (typeof actualizarInterfaz === 'function') actualizarInterfaz();
    }, 50);
}

/**
 * Función auxiliar para determinar color de números
 */
function esRojo(n) {
    const rojos = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    return rojos.includes(n);
}

/**
 * Función para setear ficha en mobile por click
 */
function setFichaActual(valor) {
    if (typeof valorFichaActual !== 'undefined') {
        valorFichaActual = valor;
        console.log("Ficha seleccionada: " + valor);
    }
}

// --- DISPARADOR INICIAL ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargamos el lobby visualmente
    renderizarLobby();
    
    // 2. Sincronizamos el saldo del localStorage
    if (typeof actualizarInterfaz === 'function') {
        actualizarInterfaz();
    }
});


