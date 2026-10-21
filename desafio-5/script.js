// 1. Declarar un array vacío llamado numeros
let numeros = [];

// 2. Solicitar al usuario el ingreso de 5 números mediante prompt()
// 3. Convertir cada valor ingresado a tipo numérico utilizando Number()
// 4. Guardar los números transformados dentro del array numeros
for (let i = 0; i < 5; i++) {
    let entrada = prompt("Ingrese el número " + (i + 1) + " de 5:");
    let numero = Number(entrada);
    numeros.push(numero);
}

// 5. Función analizadora
function analizarNumero(numero) {
    if (numero > 0) {
        return "El número es positivo";
    } else if (numero < 0) {
        return "El número es negativo";
    } else {
        return "El número es cero";
    }
}

// 6. Recorrer el array e invocar la función para cada elemento
// 7. Mostrar el resultado en el DOM
const resultadoUl = document.getElementById("resultado");

numeros.forEach(function (numero) {
    const li = document.createElement("li");

    // Aplicar clase según el tipo de número
    if (numero > 0) {
        li.classList.add("positivo");
    } else if (numero < 0) {
        li.classList.add("negativo");
    } else {
        li.classList.add("cero");
    }

    // Crear el contenido del elemento li
    const spanNumero = document.createElement("span");
    spanNumero.classList.add("numero");
    spanNumero.textContent = numero;

    const spanFlecha = document.createElement("span");
    spanFlecha.classList.add("flecha");
    spanFlecha.textContent = "→";

    const spanResultado = document.createElement("span");
    spanResultado.classList.add("resultado");
    spanResultado.textContent = analizarNumero(numero);

    li.appendChild(spanNumero);
    li.appendChild(spanFlecha);
    li.appendChild(spanResultado);

    resultadoUl.appendChild(li);
});
