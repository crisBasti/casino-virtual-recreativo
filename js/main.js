// js/main.js

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
    }, 300);
}

function renderizarSlots(container) {
    container.innerHTML = `
        <section class="game-screen">
            <button class="btn-volver" onclick="location.reload()">← Volver al Lobby</button>
            <div class="slot-machine-container" id="slot-machine-main">
                <div class="reels-container">
                    <div class="reel" id="reel1">?</div>
                    <div class="reel" id="reel2">?</div>
                    <div class="reel" id="reel3">?</div>
                </div>
                <div class="controls">
                    <input type="number" id="apuesta-input" value="10" min="1" step="10">
                    <button class="btn-casino" onclick="girarSlots(this)">¡GIRAR!</button>
                </div>
            </div>
        </section>
    `;
}

function renderizarRuleta(container) {
    container.innerHTML = `
        <section class="game-screen">
            <button class="btn-volver" onclick="location.reload()">← Volver</button>
            <div class="roulette-layout">
                
                <div class="wheel-section">
                    <div id="roulette-wheel" class="wheel-outer">
                        <div id="roulette-ball" class="ball"></div>
                        <div class="wheel-inner"><div id="wheel-display">?</div></div>
                    </div>
                    <div class="display-info">
                        <div class="bet-counter">APUESTA TOTAL: <span id="total-apostado">0</span></div>
                        <button class="btn-casino" onclick="girarRuleta()">¡GIRAR!</button>
                    </div>
                </div>

                
                <div class="historial-container">
                    <span>ÚLTIMOS:</span>
                    <div id="lista-historial" class="lista-historial"></div>
                </div>

                <div class="table-container">
                    <div class="betting-board">
                        <div class="zero-item" data-tipo="numero" data-valor="0">0</div>
                        
                        <div class="numbers-grid" id="numbers-grid"></div>

                        <div class="columns-grid">
                            <div class="col-btn" data-tipo="columna" data-valor="3">2 a 1</div>
                            <div class="col-btn" data-tipo="columna" data-valor="2">2 a 1</div>
                            <div class="col-btn" data-tipo="columna" data-valor="1">2 a 1</div>
                        </div>
                    </div>

                    <div class="outside-bets">
                        <div class="bet-btn red" data-tipo="color" data-valor="red">ROJO</div>
                        <div class="bet-btn black" data-tipo="color" data-valor="black">NEGRO</div>
                    </div>

                    <div class="control-buttons">
                        <button class="ctrl-btn undo" onclick="deshacerUltima()">Deshacer</button>
                        <button class="ctrl-btn repeat" onclick="repetirApuesta()">Repetir</button>
                        <button class="ctrl-btn double" onclick="duplicarApuestas()">x2</button>
                        <button class="ctrl-btn clear" onclick="limpiarPanio()">Borrar</button>
                    </div>
                </div>

                <div class="chips-fichero-horizontal">
                    ${[5, 10, 20, 50, 100, 200, 500, 1000].map(v =>
                        `<div class="chip chip-${v}" draggable="true" ondragstart="iniciarArrastre(event, ${v})">${v}</div>`).join('')}
                </div>
            </div>
        </section>
    `;

    // Generar números (1 al 36) con sus atributos de datos
    const grid = document.getElementById('numbers-grid');
    for (let i = 1; i <= 36; i++) {
        const numDiv = document.createElement('div');
        numDiv.className = `number-item ${esRojo(i) ? 'red' : 'black'}`;
        numDiv.innerText = i;
        numDiv.dataset.tipo = 'numero';
        numDiv.dataset.valor = i;
        grid.appendChild(numDiv);
    }

    // --- INTEGRACIÓN DE FUNCIONES CRÍTICAS ---
    
    // 1. Dibujar números dentro de la rueda (Arregla la posición visual)
    if (typeof dibujarNumerosEnRueda === 'function') {
        dibujarNumerosEnRueda();
    }

    // 2. Activar el sistema de arrastre y soltado (Drag & Drop)
    if (typeof configurarReceptores === 'function') {
        configurarReceptores();
    }
}

function esRojo(n) {
    const rojos = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    return rojos.includes(n);
}