// Función que muestra un número en la página HTML
function mostrarNumero(numero) {
    const resultadoDiv = document.getElementById('resultado');
    const parrafo = document.createElement('p');
    parrafo.textContent = `Número: ${numero}`;
    resultadoDiv.appendChild(parrafo);
}

// Bucle for para mostrar los números del 1 al 10
for (let i = 1; i <= 10; i++) {
    mostrarNumero(i);
}
