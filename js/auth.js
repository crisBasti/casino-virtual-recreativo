// js/auth.js

// Configuraciones iniciales
const CREDITOS_INICIALES = 1000;
const KEY_STORAGE = 'casino_recreativo_creditos';

/**
 * Inicializa los créditos del usuario si es la primera vez que entra.
 */
function inicializarCreditos() {
    if (localStorage.getItem(KEY_STORAGE) === null) {
        localStorage.setItem(KEY_STORAGE, CREDITOS_INICIALES);
    }
    actualizarInterfazCreditos();
}

/**
 * Obtiene el balance actual desde el localStorage.
 * @returns {number}
 */
function obtenerCreditos() {
    return parseInt(localStorage.getItem(KEY_STORAGE)) || 0;
}

/**
 * Suma o resta créditos y guarda el resultado.
 * @param {number} cantidad - Puede ser positiva (ganancia) o negativa (apuesta).
 * @returns {boolean} - Retorna true si la operación fue exitosa.
 */
function modificarCreditos(cantidad) {
    let saldoActual = obtenerCreditos();
    
    // Validar si el usuario tiene saldo suficiente para apostar
    if (cantidad < 0 && Math.abs(cantidad) > saldoActual) {
        alert("Créditos insuficientes para esta jugada.");
        return false;
    }

    let nuevoSaldo = saldoActual + cantidad;
    localStorage.setItem(KEY_STORAGE, nuevoSaldo);
    actualizarInterfazCreditos();
    return true;
}

/**
 * Actualiza el número de créditos en el HTML.
 */
function actualizarInterfazCreditos() {
    const display = document.getElementById('user-credits');
    if (display) {
        display.innerText = obtenerCreditos();
    }
}

// Ejecutar inicialización al cargar el script
document.addEventListener('DOMContentLoaded', inicializarCreditos);