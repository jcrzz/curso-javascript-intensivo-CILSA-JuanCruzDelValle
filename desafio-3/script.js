// pedir los datos al usuario con prompt
let nombre = prompt("Ingresá tu nombre:");
let apellido = prompt("Ingresá tu apellido:");
let edad = prompt("Ingresá tu edad:");
let ciudad = prompt("Ingresá tu ciudad:");

// almacena los datos en un arreglo utilizando el método .push()
let datosUsuario = [];

datosUsuario.push(`Nombre: ${nombre}`);
datosUsuario.push(`Apellido: ${apellido}`);
datosUsuario.push(`Edad: ${edad}`);
datosUsuario.push(`Ciudad: ${ciudad}`);

// seleccionar el contenedor en el HTML
let contenedorResultado = document.getElementById("resultado");

// recorrer el arreglo con .forEach() para construir la lista en el HTML
let listaHTML = "<ul>";

datosUsuario.forEach(function(dato) {
    listaHTML += `<li>${dato}</li>`;
});

listaHTML += "</ul>";

// insertar el contenido generado dentro de la página web
contenedorResultado.innerHTML = listaHTML;