// Función para cambiar el texto del párrafo
function cambiarTexto() {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = '¡El texto ha sido cambiado exitosamente!';
}

// Función para cambiar el color de fondo del párrafo
function cambiarColor() {
    const mensaje = document.getElementById('mensaje');
    mensaje.style.backgroundColor = '#ffeb3b';
    mensaje.style.borderColor = '#ff9800';
}

// Función para cambiar el tamaño del texto
function cambiarTamano() {
    const mensaje = document.getElementById('mensaje');
    mensaje.style.fontSize = '28px';
}

// Función para mostrar u ocultar información extra
function alternarInfo() {
    const infoExtra = document.getElementById('infoExtra');
    if (infoExtra.style.display === 'none') {
        infoExtra.style.display = 'block';
    } else {
        infoExtra.style.display = 'none';
    }
}
