// Crear un array vacío
const numeros = [];

// Solicitar 5 números al usuario y guardarlos en el array
for (let i = 0; i < 5; i++) {
    const entrada = prompt(`Ingrese el número ${i + 1} de 5:`);
    const numero = Number(entrada);
    numeros.push(numero);
}

// Función que analiza si un número es positivo, negativo o cero
function analizarNumero(numero) {
    if (numero > 0) {
        return "positivo";
    } else if (numero < 0) {
        return "negativo";
    } else {
        return "cero";
    }
}

// Recorrer el array y mostrar cada número con su resultado
const resultadoDiv = document.getElementById('resultado');
for (let i = 0; i < numeros.length; i++) {
    const numero = numeros[i];
    const resultado = analizarNumero(numero);
    const parrafo = document.createElement('p');
    parrafo.textContent = `Número: ${numero} → ${resultado}`;
    resultadoDiv.appendChild(parrafo);
}
