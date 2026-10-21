// Lista original de participantes
let participantes = [
    "Andrea",
    "Jesús",
    "Laura",
    "Nahuel",
    "Mónica",
    "Paula",
    "María",
    "Leandro",
    "Susana"
];

// Mostrar lista original
const listaOriginal = document.getElementById("lista-original");
participantes.forEach(function (participante) {
    const li = document.createElement("li");
    li.textContent = participante;
    listaOriginal.appendChild(li);
});

// 1. Eliminar a "Susana" (última posición)
const indiceSusana = participantes.indexOf("Susana");
if (indiceSusana !== -1) {
    participantes.splice(indiceSusana, 1);
}

// 2. Agregar a "Roberto" y "Claudia" después de "Jesús" y antes de "Laura"
const indiceJesus = participantes.indexOf("Jesús");
if (indiceJesus !== -1) {
    participantes.splice(indiceJesus + 1, 0, "Roberto", "Claudia");
}

// 3. Agregar a "José" al final de la lista
participantes.push("José");

// Mostrar lista actualizada
const listaActualizada = document.getElementById("lista-actualizada");
const totalSpan = document.getElementById("total");

participantes.forEach(function (participante) {
    const li = document.createElement("li");
    li.textContent = participante;

    // Resaltar los participantes agregados
    if (participante === "Roberto" || participante === "Claudia" || participante === "José") {
        li.classList.add("nuevo");
    }

    listaActualizada.appendChild(li);
});

// Mostrar total de participantes
totalSpan.textContent = participantes.length;
