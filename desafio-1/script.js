// 1. Pedir los datos y guardarlos en variables
console.log("¡El archivo JS está conectado correctamente!");
let nombre = prompt("Ingresá tu nombre:");
let apellido = prompt("Ingresá tu apellido:");
let edad = prompt("Ingresá tu edad:");

// 2. Armar el mensaje usando plantillas de texto (template literals)
let mensaje = `Los datos registrados son:
- Nombre: ${nombre}
- Apellido: ${apellido}
- Edad: ${edad}`;

// 3. Mostrar el resultado
alert(mensaje);
console.log(mensaje);