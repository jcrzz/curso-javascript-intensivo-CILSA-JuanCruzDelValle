// pide los datos y los almacena en variables
console.log("¡El archivo JS está conectado correctamente!");
let nombre = prompt("Ingresá tu nombre:");
let apellido = prompt("Ingresá tu apellido:");
let edad = prompt("Ingresá tu edad:");

// armar el mensaje
let mensaje = `Los datos registrados son:
- Nombre: ${nombre}
- Apellido: ${apellido}
- Edad: ${edad}`;

// muestra el resultado
alert(mensaje);
console.log(mensaje);