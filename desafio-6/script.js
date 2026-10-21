// Crear el array con los valores indicados
const numeros = [10, -5, 8, 0, -2];

// Función que cuenta los números positivos
function contarPositivos(numeros) {
    let contador = 0;
    for (let i = 0; i < numeros.length; i++) {
        if (numeros[i] > 0) {
            contador++;
        }
    }
    return contador;
}

// Función que cuenta los números negativos
function contarNegativos(numeros) {
    let contador = 0;
    for (let i = 0; i < numeros.length; i++) {
        if (numeros[i] < 0) {
            contador++;
        }
    }
    return contador;
}

// Obtener los resultados
const positivos = contarPositivos(numeros);
const negativos = contarNegativos(numeros);

// Mostrar en la página HTML
const resultadoDiv = document.getElementById('resultado');
resultadoDiv.innerHTML = `
    <p><strong>Números:</strong> ${numeros.join(', ')}</p>
    <p><strong>Números positivos:</strong> ${positivos}</p>
    <p><strong>Números negativos:</strong> ${negativos}</p>
`;
