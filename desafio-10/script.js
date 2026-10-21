function mostrarFicha() {
    // Obtener los valores ingresados por el usuario
    const nombre = document.getElementById('nombre').value;
    const profesion = document.getElementById('profesion').value;
    const descripcion = document.getElementById('descripcion').value;

    // Seleccionar la ficha y mostrarla
    const ficha = document.getElementById('ficha');
    ficha.style.display = 'block';

    // Aplicar cambios visuales con .style
    ficha.style.backgroundColor = '#e8f5e9';
    ficha.style.borderColor = '#4CAF50';
    ficha.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';

    // Mostrar la información usando .innerHTML
    ficha.innerHTML = `
        <h2>${nombre}</h2>
        <p class="profesion">${profesion}</p>
        <p class="descripcion">${descripcion}</p>
    `;
}
