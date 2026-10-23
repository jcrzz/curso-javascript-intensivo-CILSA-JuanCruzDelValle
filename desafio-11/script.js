const formulario = document.getElementById('formulario-registro');
const resultado = document.getElementById('resultado');
const campos = {
    usuario: document.getElementById('usuario'),
    correo: document.getElementById('correo'),
    fechaNacimiento: document.getElementById('fecha-nacimiento'),
    contrasena: document.getElementById('contrasena'),
    confirmarContrasena: document.getElementById('confirmar-contrasena')
};

function mostrarError(campo, mensaje) {
    campo.setAttribute('aria-invalid', 'true');
    document.getElementById(`error-${campo.id}`).textContent = mensaje;
}

function limpiarError(campo) {
    campo.removeAttribute('aria-invalid');
    document.getElementById(`error-${campo.id}`).textContent = '';
}

function tieneDoceAnios(fechaTexto) {
    const nacimiento = new Date(`${fechaTexto}T00:00:00`);
    const hoy = new Date();

    if (Number.isNaN(nacimiento.getTime()) || nacimiento > hoy) {
        return false;
    }

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const aunNoCumplio =
        hoy.getMonth() < nacimiento.getMonth() ||
        (hoy.getMonth() === nacimiento.getMonth() &&
            hoy.getDate() < nacimiento.getDate());

    if (aunNoCumplio) {
        edad--;
    }

    return edad >= 12;
}

formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    Object.values(campos).forEach(limpiarError);
    resultado.textContent = '';
    resultado.classList.remove('exito');

    let formularioValido = true;
    const usuario = campos.usuario.value.trim();
    const correo = campos.correo.value.trim();
    const contrasena = campos.contrasena.value;
    const confirmarContrasena = campos.confirmarContrasena.value;

    if (usuario.length < 3) {
        mostrarError(campos.usuario, 'El usuario debe tener al menos 3 caracteres.');
        formularioValido = false;
    } else if (/^\d+$/.test(usuario)) {
        mostrarError(campos.usuario, 'El usuario no puede estar compuesto solo por números.');
        formularioValido = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        mostrarError(campos.correo, 'Ingresa un correo válido, por ejemplo usuario@dominio.com.');
        formularioValido = false;
    }

    if (!campos.fechaNacimiento.value) {
        mostrarError(campos.fechaNacimiento, 'Ingresa tu fecha de nacimiento.');
        formularioValido = false;
    } else if (!tieneDoceAnios(campos.fechaNacimiento.value)) {
        mostrarError(campos.fechaNacimiento, 'Debes tener al menos 12 años para registrarte.');
        formularioValido = false;
    }

    if (contrasena.length < 6 || !/\p{L}/u.test(contrasena) || !/\d/.test(contrasena)) {
        mostrarError(
            campos.contrasena,
            'La contraseña debe tener al menos 6 caracteres e incluir letras y números.'
        );
        formularioValido = false;
    }

    if (confirmarContrasena !== contrasena) {
        mostrarError(campos.confirmarContrasena, 'Las contraseñas no coinciden.');
        formularioValido = false;
    }

    if (!formularioValido) {
        formulario.querySelector('[aria-invalid="true"]').focus();
        return;
    }

    resultado.textContent = '¡Registro validado correctamente!';
    resultado.classList.add('exito');
});
