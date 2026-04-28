// js/slots.js

const sonidos = {
    giro: new Audio('assets/ruleta.mp3'),
    premio: new Audio('assets/winer.mp3')
};

function reproducirSonido(nombre) {
    const sonido = sonidos[nombre];
    if (sonido) {
        sonido.currentTime = 0;
        sonido.play().catch(() => console.log("Audio esperando interacción..."));
    }
}

const SIMBOLOS = [
    { icono: '🍒', valor: 2, peso: 40 },
    { icono: '🍋', valor: 5, peso: 30 },
    { icono: '🔔', valor: 10, peso: 15 },
    { icono: '💎', valor: 50, peso: 10 },
    { icono: '7️⃣', valor: 100, peso: 5 }
];

// js/slots.js

// js/slots.js

function girarSlots(botonPresionado) {
    const inputApuesta = document.getElementById('apuesta-input');
    const apuesta = parseInt(inputApuesta.value) || 10;

    if (window.obtenerCreditos() < apuesta) {
        alert("Créditos insuficientes");
        return;
    }

    // Bloqueo de UI
    botonPresionado.disabled = true;
    inputApuesta.disabled = true; // Bloqueamos también el input para que no cambien la apuesta
    botonPresionado.innerText = "SORTEANDO...";

    modificarCreditos(-apuesta);

    const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
    reels.forEach(reel => reel.classList.add('girando'));

    setTimeout(() => {
        const resultados = [obtenerSimboloAleatorio(), obtenerSimboloAleatorio(), obtenerSimboloAleatorio()];
        
        reels.forEach((reel, i) => {
            reel.classList.remove('girando');
            reel.innerText = resultados[i].icono;
        });

        procesarPremioSlots(resultados, apuesta);

        // Desbloqueo de UI
        botonPresionado.disabled = false;
        inputApuesta.disabled = false;
        botonPresionado.innerText = "¡GIRAR!";
    }, 1000);
}

function obtenerSimboloAleatorio() {
    const totalPeso = SIMBOLOS.reduce((acc, s) => acc + s.peso, 0);
    let random = Math.random() * totalPeso;
    for (const simbolo of SIMBOLOS) {
        if (random < simbolo.peso) return simbolo;
        random -= simbolo.peso;
    }
}

function procesarPremioSlots(resultados, apuesta) {
    const machine = document.querySelector('.slot-machine-container');
    
    if (resultados[0].icono === resultados[1].icono && resultados[1].icono === resultados[2].icono) {
        const premio = resultados[0].valor * apuesta;
        
        reproducirSonido('premio');
        
        if (machine) {
            machine.classList.add('jackpot-anim');
            setTimeout(() => machine.classList.remove('jackpot-anim'), 3000);
        }

        modificarCreditos(premio);
        setTimeout(() => alert(`¡JACKPOT! Ganaste ${premio} créditos`), 200);
    }
}