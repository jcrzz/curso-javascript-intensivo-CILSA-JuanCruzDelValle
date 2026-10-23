/* =====================================================================
    ÍNDICE DEL ARCHIVO
    1. Constantes y catálogos de datos
    2. Estado de la aplicación
    3. Referencias al DOM
    4. Utilidades generales
    5. Persistencia en localStorage
    6. Validación de los datos del formulario
    7. Mensajes para el usuario (región aria-live)
    8. Renderizado de la lista y de los contadores
    9. Operaciones sobre las tareas (agregar / editar / eliminar)
    10. Gestión del foco (accesibilidad)
    11. Barra de accesibilidad (contraste y tamaño de letra)
    12. Inicialización y registro de eventos
   ===================================================================== */

(function () {
    'use strict';

    /* =================================================================
        1. CONSTANTES Y DATOS
       ================================================================= */

    /** Clave con la que se guardan las tareas en el localStorage. */
    const CLAVE_TAREAS = 'cilsa.tp.tareas';

    /** Clave con la que se guardan las preferencias de accesibilidad. */
    const CLAVE_PREFERENCIAS = 'cilsa.tp.preferencias';

    /** Tamaño de letra permitido (en píxeles). */
    const TAMANIO_MINIMO = 14;
    const TAMANIO_MAXIMO = 24;
    const TAMANIO_BASE = 16;
    const PASO_TAMANIO = 2;

    /** Categorías permitidas (el value coincide con el <option> del <select>). */
    const CATEGORIAS = ['trabajo', 'estudio', 'personal', 'hogar', 'salud', 'otro'];

    /** Prioridades permitidas. */
    const PRIORIDADES = ['alta', 'media', 'baja'];

    /** Textos legibles de cada categoría (se usan en la etiqueta de la tarjeta). */
    const TEXTO_CATEGORIA = {
        trabajo: 'Trabajo',
        estudio: 'Estudio',
        personal: 'Personal',
        hogar: 'Hogar',
        salud: 'Salud',
        otro: 'Otro'
    };

    /** Textos legibles de cada prioridad. */
    const TEXTO_PRIORIDAD = {
        alta: 'Alta',
        media: 'Media',
        baja: 'Baja'
    };

    /** Textos legibles de cada filtro de estado. */
    const TEXTO_ESTADO = {
        todas: 'todas las tareas',
        pendientes: 'las tareas pendientes',
        completadas: 'las tareas completadas'
    };

    /** Íconos SVG inline. Se marcan como decorativos (aria-hidden). */
    const ICONO_EDITAR =
        '<svg class="icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/>' +
        '</svg>';

    const ICONO_ELIMINAR =
        '<svg class="icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z"/>' +
        '</svg>';

    /* =================================================================
        2. ESTADO DE LA APLICACIÓN
        Variables que guardan la "verdad" de la app. El DOM siempre se
        dibuja a partir de estos datos (patrón "fuente única de verdad").
       ================================================================= */
    let tareas = [];              // Array con todas las tareas
    let filtroEstado = 'todas';  // 'todas' | 'pendientes' | 'completadas'
    let filtroCategoria = '';     // '' = todas las categorías
    let textoBusqueda = '';      // Texto del buscador
    let idEnEdicion = null;      // Id de la tarea que se está editando
    let idPendienteDeConfirmar = null; // Id de la tarea esperando confirmación
    let tamanoFuente = TAMANIO_BASE;
    let modoOscuro = false;
    let temporizadorMensaje = null;

    /* =================================================================
        3. REFERENCIAS AL DOM
        Se guardan en un objeto para no repetir getElementById en cada función.
       ================================================================= */
    const elementos = {};

    function cachearElementos() {
        elementos.mensaje = document.getElementById('mensaje-estado');
        elementos.formulario = document.getElementById('formulario-tarea');
        elementos.campoNombre = document.getElementById('tarea-nombre');
        elementos.campoCategoria = document.getElementById('tarea-categoria');
        elementos.campoPrioridad = document.getElementById('tarea-prioridad');
        elementos.campoFecha = document.getElementById('tarea-fecha');
        elementos.botonGuardar = document.getElementById('btn-guardar');
        elementos.botonCancelar = document.getElementById('btn-cancelar');
        elementos.tituloFormulario = document.getElementById('titulo-formulario');
        elementos.botonLimpiarCompletadas = document.getElementById('btn-limpiar-completadas');
        elementos.lista = document.getElementById('lista-tareas');
        elementos.listaVacia = document.getElementById('lista-vacia');
        elementos.tituloLista = document.getElementById('titulo-lista');
        elementos.busqueda = document.getElementById('busqueda');
        elementos.filtroCategoria = document.getElementById('filtro-categoria');
        elementos.contadorTotal = document.getElementById('contador-total');
        elementos.contadorPendientes = document.getElementById('contador-pendientes');
        elementos.contadorCompletadas = document.getElementById('contador-completadas');
        elementos.conteoTodas = document.getElementById('conteo-todas');
        elementos.conteoPendientes = document.getElementById('conteo-pendientes');
        elementos.conteoCompletadas = document.getElementById('conteo-completadas');
        elementos.progreso = document.getElementById('progreso');
        elementos.porcentajeAvance = document.getElementById('porcentaje-avance');
        elementos.botonTema = document.getElementById('btn-tema');
        elementos.textoBotonTema = document.getElementById('texto-btn-tema');
        elementos.botonMas = document.getElementById('btn-texto-mas');
        elementos.botonMenos = document.getElementById('btn-texto-menos');
        elementos.botonReset = document.getElementById('btn-texto-reset');
        elementos.camposError = {
            nombre: document.getElementById('error-nombre'),
            categoria: document.getElementById('error-categoria'),
            prioridad: document.getElementById('error-prioridad'),
            fecha: document.getElementById('error-fecha')
        };
        elementos.botonFiltro = document.querySelectorAll('.filtro');
    }

    /* =================================================================
        4. UTILIDADES GENERALES
       ================================================================= */

    /** Genera un identificador único para cada tarea. */
    function generarId() {
        return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    }

    /** Devuelve la fecha de hoy en formato yyyy-mm-dd (formato de <input type="date">). */
    function obtenerFechaISO(d) {
        const fecha = d || new Date();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        return fecha.getFullYear() + '-' + mes + '-' + dia;
    }

    /** Convierte "2026-03-12" en "12/03/2026" para mostrarlo al usuario. */
    function formatearFecha(iso) {
        const partes = iso.split('-');
        if (partes.length !== 3) {
            return iso;
        }
        return partes[2] + '/' + partes[1] + '/' + partes[0];
    }

    /** Normaliza el texto: recorta espacios y colapsa espacios repetidos. */
    function normalizarTexto(texto) {
        return texto.replace(/\s+/g, ' ').trim();
    }

    /** Quita los acentos para que la búsqueda tolere tildes (ej: "diseño" ≈ "diseno"). */
    function normalizarParaBusqueda(texto) {
        return texto
            .toLowerCase()
            .normalize('NFD')      // separa la letra de su acento
            .replace(/[̀-ͯ]/g, ''); // elimina los diacríticos
    }

    /** Devuelve true si la fecha límite ya pasó. */
    function fechaVencida(iso) {
        return iso !== '' && iso < obtenerFechaISO();
    }

    /* =================================================================
        5. localStorage
       ================================================================= */

    /**
     * Guarda el array de tareas en el navegador.
     * Se envuelve en try/catch porque el modo incógnito o un navegador
     * bloqueado pueden lanzar un error al escribir en el localStorage.
     */
    function guardarTareas() {
        try {
            localStorage.setItem(CLAVE_TAREAS, JSON.stringify(tareas));
            return true;
        } catch (error) {
            console.warn('No se pudo guardar en localStorage:', error);
            return false;
        }
    }

    /** Carga las tareas guardadas, descartando los datos que no sean válidos. */
    function cargarTareas() {
        try {
            const datos = localStorage.getItem(CLAVE_TAREAS);
            if (!datos) {
                return [];
            }
            const guardadas = JSON.parse(datos);
            if (!Array.isArray(guardadas)) {
                return [];
            }
            // Se filtran las tareas con la forma correcta para no romper la app.
            return guardadas.filter(esTareaValida).map(normalizarTarea);
        } catch (error) {
            console.warn('No se pudo leer el localStorage:', error);
            return [];
        }
    }

    /** Verifica que un objeto tenga la estructura mínima de una tarea. */
    function esTareaValida(tarea) {
        return Boolean(
            tarea &&
            typeof tarea.id === 'string' &&
            typeof tarea.texto === 'string' &&
            tarea.texto.length > 0
        );
    }

    /** Completa una tarea con los valores por defecto que falten. */
    function normalizarTarea(tarea) {
        return {
            id: tarea.id,
            texto: tarea.texto,
            categoria: CATEGORIAS.includes(tarea.categoria) ? tarea.categoria : 'otro',
            prioridad: PRIORIDADES.includes(tarea.prioridad) ? tarea.prioridad : 'media',
            fecha: typeof tarea.fecha === 'string' ? tarea.fecha : '',
            completada: Boolean(tarea.completada),
            creadaEn: typeof tarea.creadaEn === 'number' ? tarea.creadaEn : Date.now()
        };
    }

    /** Guarda o recupera las preferencias de accesibilidad. */
    function guardarPreferencias() {
        try {
            localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify({
                tamanoFuente: tamanoFuente,
                modoOscuro: modoOscuro
            }));
        } catch (error) {
            console.warn('No se pudieron guardar las preferencias:', error);
        }
    }

    function cargarPreferencias() {
        try {
            const datos = localStorage.getItem(CLAVE_PREFERENCIAS);
            if (!datos) {
                return null;
            }
            return JSON.parse(datos);
        } catch (error) {
            return null;
        }
    }

    /* =================================================================
        6. VALIDACIÓN DE LOS DATOS DEL FORMULARIO
        Devuelve un array de errores: { campo, mensaje }.
       ================================================================= */
    function leerFormulario() {
        return {
            nombre: elementos.campoNombre.value,
            categoria: elementos.campoCategoria.value,
            prioridad: elementos.campoPrioridad.value,
            fecha: elementos.campoFecha.value
        };
    }

    /**
     * Valida los datos ingresados. Cada error tiene un mensaje claro y
     * específico para que el usuario sepa exactamente qué corregir.
     */
    function validarFormulario(datos) {
        const errores = [];
        const nombre = normalizarTexto(datos.nombre);

        // 1) El nombre es obligatorio y debe tener una longitud razonable.
        if (nombre === '') {
            errores.push({
                campo: 'nombre',
                mensaje: 'Ingresá un nombre de tarea para continuar.'
            });
        } else if (nombre.length < 3) {
            errores.push({
                campo: 'nombre',
                mensaje: 'El nombre de la tarea debe tener al menos 3 caracteres.'
            });
        } else if (nombre.length > 80) {
            errores.push({
                campo: 'nombre',
                mensaje: 'El nombre de la tarea no puede superar los 80 caracteres.'
            });
        }

        // 2) La categoría debe ser una de las permitidas.
        if (!CATEGORIAS.includes(datos.categoria)) {
            errores.push({
                campo: 'categoria',
                mensaje: 'Seleccioná una categoría para la tarea.'
            });
        }

        // 3) La prioridad debe ser una de las permitidas.
        if (!PRIORIDADES.includes(datos.prioridad)) {
            errores.push({
                campo: 'prioridad',
                mensaje: 'Seleccioná una prioridad para la tarea.'
            });
        }

        // 4) La fecha es opcional, pero si se completa no puede estar vencida.
        if (datos.fecha !== '') {
            const fecha = new Date(datos.fecha + 'T00:00:00');
            if (isNaN(fecha.getTime())) {
                errores.push({
                    campo: 'fecha',
                    mensaje: 'Ingresá una fecha límite válida.'
                });
            } else if (datos.fecha < obtenerFechaISO()) {
                errores.push({
                    campo: 'fecha',
                    mensaje: 'La fecha límite no puede ser anterior a hoy.'
                });
            }
        }

        return errores;
    }

    /** Borra los mensajes de error del formulario y el estado aria-invalid. */
    function limpiarErrores() {
        for (const clave in elementos.camposError) {
            elementos.camposError[clave].textContent = '';
        }
        elementos.campoNombre.removeAttribute('aria-invalid');
        elementos.campoCategoria.removeAttribute('aria-invalid');
        elementos.campoPrioridad.removeAttribute('aria-invalid');
        elementos.campoFecha.removeAttribute('aria-invalid');
    }

    /**
     * Muestra los errores: escribe el mensaje junto al campo,
     * marca aria-invalid="true" para avisar al lector de pantalla
     * y devuelve el primer campo con error para/le llevar el foco.
     */
    function mostrarErrores(errores) {
        limpiarErrores();
        errores.forEach(function (error) {
            elementos.camposError[error.campo].textContent = error.mensaje;
        });

        const campos = {
            nombre: elementos.campoNombre,
            categoria: elementos.campoCategoria,
            prioridad: elementos.campoPrioridad,
            fecha: elementos.campoFecha
        };
        const primerCampo = campos[errores[0].campo];
        primerCampo.setAttribute('aria-invalid', 'true');
        return primerCampo;
    }

    /* =================================================================
        7. MENSAJES PARA EL USUARIO
        Toda la comunicación ocurre dentro del DOM (nunca alert/prompt).
       ================================================================= */
    function mostrarMensaje(texto, tipo) {
        const mensaje = elementos.mensaje;

        // Se limpia antes de escribir para que un mensaje repetido
        // también sea anunciado por el lector de pantalla.
        mensaje.textContent = '';
        mensaje.dataset.tipo = tipo || 'info';

        window.setTimeout(function () {
            mensaje.textContent = texto;
        }, 50);

        // El mensaje desaparece solo a los pocos segundos.
        if (temporizadorMensaje) {
            window.clearTimeout(temporizadorMensaje);
        }
        temporizadorMensaje = window.setTimeout(function () {
            mensaje.textContent = '';
        }, 6000);
    }

    /* =================================================================
        8. RENDERIZADO DE LA LISTA Y DE LOS CONTADORES
       ================================================================= */

    /** Devuelve las tareas que deben verse según los filtros aplicados. */
    function obtenerTareasVisibles() {
        const busqueda = normalizarParaBusqueda(textoBusqueda);

        return tareas.filter(function (tarea) {
            // Filtro por estado (nav)
            if (filtroEstado === 'pendientes' && tarea.completada) {
                return false;
            }
            if (filtroEstado === 'completadas' && !tarea.completada) {
                return false;
            }

            // Filtro por categoría (select)
            if (filtroCategoria !== '' && tarea.categoria !== filtroCategoria) {
                return false;
            }

            // Filtro por texto (buscador)
            if (busqueda !== '') {
                const coincide =
                    normalizarParaBusqueda(tarea.texto).includes(busqueda) ||
                    normalizarParaBusqueda(TEXTO_CATEGORIA[tarea.categoria]).includes(busqueda) ||
                    normalizarParaBusqueda(TEXTO_PRIORIDAD[tarea.prioridad]).includes(busqueda);
                if (!coincide) {
                    return false;
                }
            }

            return true;
        });
    }

    /** Dibuja toda la lista de tareas en el DOM. */
    function renderizarTareas() {
        const visibles = obtenerTareasVisibles();

        // Se vacía la lista y se vuelve a construir con createElement.
        elementos.lista.innerHTML = '';

        visibles.forEach(function (tarea) {
            elementos.lista.appendChild(crearTarjetaTarea(tarea));
        });

        // Mensaje para el caso en que no hay tareas para mostrar.
        if (visibles.length === 0) {
            elementos.listaVacia.hidden = false;
            if (tareas.length === 0) {
                elementos.listaVacia.textContent =
                    'Todavía no tenés tareas cargadas. ¡Agregá la primera usando el formulario de arriba!';
            } else {
                elementos.listaVacia.textContent =
                    'No hay tareas que coincidan con el filtro "' + TEXTO_ESTADO[filtroEstado] +
                    '". Probá cambiando el filtro o limpiando la búsqueda.';
            }
        } else {
            elementos.listaVacia.hidden = true;
            elementos.listaVacia.textContent = '';
        }
    }

    /**
     * Construye el <li> con la tarjeta de una tarea.
     * Se usa createElement + textContent para que el texto del usuario
     * nunca se interprete como código (protección contra XSS).
     */
    function crearTarjetaTarea(tarea) {
        const item = document.createElement('li');
        item.className = 'tarea-item';
        item.dataset.id = tarea.id;

        const articulo = document.createElement('article');
        articulo.className = 'tarea' + (tarea.completada ? ' es-completada' : '');

        /* --- Zona principal: check + título + metadatos --- */
        const principal = document.createElement('div');
        principal.className = 'tarea__principal';

        const casilla = document.createElement('input');
        casilla.type = 'checkbox';
        casilla.className = 'tarea__check';
        casilla.checked = tarea.completada;
        casilla.dataset.accion = 'alternar';
        casilla.id = 'casilla-' + tarea.id;

        const etiquetaCasilla = document.createElement('label');
        etiquetaCasilla.className = 'visualmente-oculto';
        etiquetaCasilla.htmlFor = casilla.id;
        etiquetaCasilla.textContent = 'Marcar "' + tarea.texto + '" como completada';

        const datos = document.createElement('div');
        datos.className = 'tarea__datos';

        const titulo = document.createElement('h3');
        titulo.className = 'tarea__titulo';
        titulo.id = 'titulo-' + tarea.id;
        titulo.textContent = tarea.texto;

        const meta = document.createElement('p');
        meta.className = 'tarea__meta';

        // Etiqueta de categoría
        const etiquetaCategoria = document.createElement('span');
        etiquetaCategoria.className = 'etiqueta-tarea';
        etiquetaCategoria.textContent = TEXTO_CATEGORIA[tarea.categoria];
        meta.appendChild(etiquetaCategoria);

        // Etiqueta de prioridad
        const etiquetaPrioridad = document.createElement('span');
        etiquetaPrioridad.className =
            'etiqueta-tarea etiqueta-tarea--prioridad-' + tarea.prioridad;
        etiquetaPrioridad.textContent = 'Prioridad ' + TEXTO_PRIORIDAD[tarea.prioridad].toLowerCase();
        meta.appendChild(etiquetaPrioridad);

        // Fecha límite
        if (tarea.fecha !== '') {
            const fecha = document.createElement('span');
            const vencida = fechaVencida(tarea.fecha) && !tarea.completada;
            fecha.className = 'tarea__fecha' + (vencida ? ' es-vencida' : '');
            fecha.textContent = vencida
                ? 'Venció el ' + formatearFecha(tarea.fecha)
                : 'Vence: ' + formatearFecha(tarea.fecha);
            meta.appendChild(fecha);
        }

        // Estado (completada / pendiente) como texto para lectores de pantalla
        const estado = document.createElement('span');
        estado.className = 'tarea__estado';
        estado.textContent = tarea.completada ? 'Completada' : 'Pendiente';
        meta.appendChild(estado);

        datos.appendChild(titulo);
        datos.appendChild(meta);

        principal.appendChild(casilla);
        principal.appendChild(etiquetaCasilla);
        principal.appendChild(datos);

        articulo.appendChild(principal);

        /* --- Zona de acciones --- */
        if (idPendienteDeConfirmar === tarea.id) {
            // Se reemplaza la botones por una confirmación dentro del DOM.
            const confirmacion = document.createElement('div');
            confirmacion.className = 'tarea__confirmacion';
            confirmacion.setAttribute('role', 'group');
            confirmacion.setAttribute('aria-label', 'Confirmación de eliminación de la tarea');

            const pregunta = document.createElement('p');
            pregunta.textContent = '¿Querés eliminar la tarea "' + tarea.texto + '"?';

            const botonSi = document.createElement('button');
            botonSi.type = 'button';
            botonSi.className = 'boton boton--peligro';
            botonSi.dataset.accion = 'confirmar-eliminar';
            botonSi.textContent = 'Sí, eliminar';

            const botonNo = document.createElement('button');
            botonNo.type = 'button';
            botonNo.className = 'boton boton--secundario';
            botonNo.dataset.accion = 'cancelar-eliminar';
            botonNo.textContent = 'Cancelar';

            confirmacion.appendChild(pregunta);
            confirmacion.appendChild(botonSi);
            confirmacion.appendChild(botonNo);
            articulo.appendChild(confirmacion);
        } else {
            const acciones = document.createElement('div');
            acciones.className = 'tarea__acciones';

            const botonEditar = document.createElement('button');
            botonEditar.type = 'button';
            botonEditar.className = 'boton boton--icono';
            botonEditar.dataset.accion = 'editar';
            botonEditar.setAttribute('aria-label', 'Editar la tarea ' + tarea.texto);
            botonEditar.innerHTML = ICONO_EDITAR;

            const botonEliminar = document.createElement('button');
            botonEliminar.type = 'button';
            botonEliminar.className = 'boton boton--icono';
            botonEliminar.dataset.accion = 'eliminar';
            botonEliminar.setAttribute('aria-label', 'Eliminar la tarea ' + tarea.texto);
            botonEliminar.innerHTML = ICONO_ELIMINAR;

            acciones.appendChild(botonEditar);
            acciones.appendChild(botonEliminar);
            articulo.appendChild(acciones);
        }

        item.appendChild(articulo);
        return item;
    }

    /** Actualiza los contadores, el progreso y los números de los filtros. */
    function actualizarContadores() {
        const total = tareas.length;
        const completadas = tareas.filter(function (t) { return t.completada; }).length;
        const pendientes = total - completadas;
        const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100);

        elementos.contadorTotal.textContent = total;
        elementos.contadorPendientes.textContent = pendientes;
        elementos.contadorCompletadas.textContent = completadas;

        elementos.conteoTodas.textContent = total;
        elementos.conteoPendientes.textContent = pendientes;
        elementos.conteoCompletadas.textContent = completadas;

        elementos.progreso.value = porcentaje;
        elementos.porcentajeAvance.textContent = porcentaje + '%';

        // El botón de limpiar completadas sólo tiene sentido si hay completadas.
        // (El estilo de "deshabilitado" se aplica desde el CSS con :disabled)
        elementos.botonLimpiarCompletadas.disabled = completadas === 0;
    }

    /** Dibuja la lista y los contadores juntos. */
    function renderizar() {
        renderizarTareas();
        actualizarContadores();
    }

    /* =================================================================
        9. OPERACIONES SOBRE LAS TAREAS
       ================================================================= */

    /** Agrega una tarea nueva al array, la guarda y la dibuja. */
    function agregarTarea(datos) {
        const tarea = {
            id: generarId(),
            texto: normalizarTexto(datos.nombre),
            categoria: datos.categoria,
            prioridad: datos.prioridad,
            fecha: datos.fecha,
            completada: false,
            creadaEn: Date.now()
        };

        tareas.push(tarea);
        guardarTareas();
        renderizar();
        mostrarMensaje('¡Tarea "' + tarea.texto + '" agregada correctamente!', 'exito');

        // Se limpia sólo el nombre para poder cargar varias tareas seguidas
        // manteniendo la categoría, la prioridad y la fecha ya elegidas.
        elementos.campoNombre.value = '';

        // El foco vuelve al campo de nombre para seguir cargando tareas.
        elementos.campoNombre.focus();
    }

    /** Actualiza los datos de una tarea que ya existía. */
    function actualizarTarea(id, datos) {
        const indice = tareas.findIndex(function (tarea) { return tarea.id === id; });
        if (indice === -1) {
            return;
        }

        tareas[indice].texto = normalizarTexto(datos.nombre);
        tareas[indice].categoria = datos.categoria;
        tareas[indice].prioridad = datos.prioridad;
        tareas[indice].fecha = datos.fecha;

        guardarTareas();
        renderizar();
        mostrarMensaje('Tarea actualizada correctamente.', 'exito');
        salirDelModoEdicion();
        elementos.campoNombre.focus();
    }

    /** Elimina una tarea del array, la guarda y vuelve a dibujar la lista. */
    function eliminarTarea(id) {
        const indice = tareas.findIndex(function (tarea) { return tarea.id === id; });
        if (indice === -1) {
            return;
        }

        const eliminada = tareas[indice];
        tareas.splice(indice, 1);
        idPendienteDeConfirmar = null;
        guardarTareas();
        renderizar();
        mostrarMensaje('Tarea "' + eliminada.texto + '" eliminada.', 'info');

        // Gestión del foco: se pasa a la tarea vecina o al título de la lista.
        moverFocoTrasEliminar(indice);
    }

    /** Marca o desmarca una tarea como completada. */
    function alternarCompletada(id) {
        const tarea = tareas.find(function (t) { return t.id === id; });
        if (!tarea) {
            return;
        }

        tarea.completada = !tarea.completada;
        guardarTareas();
        renderizar();
        mostrarMensaje(
            tarea.completada
                ? 'Tarea "' + tarea.texto + '" marcada como completada.'
                : 'Tarea "' + tarea.texto + '" marcada como pendiente.',
            'exito'
        );

        // Al redibujar la lista el checkbox original se reemplaza por uno nuevo.
        // Se devuelve el foco al nuevo para no perder el lugar al navegar
        // con el teclado. Si la tarea dejó de estar visible (por ejemplo, con
        // el filtro "pendientes"), el foco pasa al encabezado de la lista.
        const casilla = document.getElementById('casilla-' + id);
        if (casilla) {
            casilla.focus();
        } else {
            elementos.tituloLista.focus();
        }
    }

    /** Prepara el formulario para editar una tarea existente. */
    function iniciarEdicion(id) {
        const tarea = tareas.find(function (t) { return t.id === id; });
        if (!tarea) {
            return;
        }

        idEnEdicion = id;
        elementos.campoNombre.value = tarea.texto;
        elementos.campoCategoria.value = tarea.categoria;
        elementos.campoPrioridad.value = tarea.prioridad;
        elementos.campoFecha.value = tarea.fecha;

        elementos.tituloFormulario.textContent = 'Editando tarea';
        elementos.botonGuardar.textContent = 'Guardar cambios';
        elementos.botonCancelar.hidden = false;

        // Se lleva el foco al campo de nombre para editar sin usar el mouse.
        elementos.campoNombre.focus();
        elementos.campoNombre.select();

        // Se desplaza suavemente hasta el formulario (si el navegador lo soporta).
        if (typeof elementos.formulario.scrollIntoView === 'function') {
            elementos.formulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /** Sale del modo edición y deja el formulario como estaba. */
    function salirDelModoEdicion() {
        idEnEdicion = null;
        elementos.tituloFormulario.textContent = 'Nueva tarea';
        elementos.botonGuardar.textContent = 'Agregar tarea';
        elementos.botonCancelar.hidden = true;
        elementos.formulario.reset();
        limpiarErrores();
    }

    /** Pide confirmación (dentro del DOM) antes de eliminar una tarea. */
    function iniciarEliminacion(id) {
        idPendienteDeConfirmar = id;
        renderizar();

        // El foco va directo al botón de confirmación.
        const botonConfirmar = elementos.lista.querySelector('[data-accion="confirmar-eliminar"]');
        if (botonConfirmar) {
            botonConfirmar.focus();
        }
    }

    /** Cancela la eliminación y vuelve a mostrar los botones normales. */
    function cancelarEliminacion(id) {
        idPendienteDeConfirmar = null;
        renderizar();

        // Se devuelve el foco al botón de eliminar de esa misma tarea.
        const boton = elementos.lista.querySelector(
            '[data-id="' + id + '"] [data-accion="eliminar"]'
        );
        if (boton) {
            boton.focus();
        }
    }

    /** Borra todas las tareas que ya están completadas. */
    function limpiarCompletadas() {
        const completadas = tareas.filter(function (tarea) { return tarea.completada; });
        if (completadas.length === 0) {
            mostrarMensaje('No hay tareas completadas para borrar.', 'info');
            return;
        }

        tareas = tareas.filter(function (tarea) { return !tarea.completada; });
        guardarTareas();
        renderizar();
        mostrarMensaje(
            'Se borraron ' + completadas.length + ' tarea(s) completada(s).', 'info'
        );
        elementos.botonLimpiarCompletadas.focus();
    }

    /* =================================================================
        10. GESTIÓN DEL FOCO (ACCESIBILIDAD)
       ================================================================= */

    /**
     * Después de eliminar una tarea el elemento que tenía el foco desaparece,
     * por eso se reubica el foco en la tarea que quedó en ese lugar.
     */
    function moverFocoTrasEliminar(indiceEliminado) {
        const items = elementos.lista.querySelectorAll('.tarea-item');

        if (items.length === 0) {
            // No queda ninguna tarea: el foco vuelve al encabezado de la lista.
            elementos.tituloLista.focus();
            return;
        }

        const indice = indiceEliminado < items.length ? indiceEliminado : items.length - 1;
        const boton = items[indice].querySelector('[data-accion="eliminar"]');
        if (boton) {
            boton.focus();
        }
    }

    /* =================================================================
        11. BARRA DE ACCESIBILIDAD
       ================================================================= */

    /** Aplica el tema oscuro (alto contraste) activando un atributo en <html>. */
    function aplicarTema() {
        const raiz = document.documentElement;

        if (modoOscuro) {
            raiz.setAttribute('data-tema', 'alto-contraste');
        } else {
            raiz.removeAttribute('data-tema');
        }

        // aria-pressed informa a los lectores de pantalla del estado del botón.
        elementos.botonTema.setAttribute('aria-pressed', modoOscuro ? 'true' : 'false');
        elementos.botonTema.setAttribute(
            'aria-label',
            modoOscuro
                ? 'Desactivar el modo oscuro de alto contraste'
                : 'Activar el modo oscuro de alto contraste'
        );
        elementos.textoBotonTema.textContent = modoOscuro ? 'Modo oscuro: activo' : 'Modo oscuro';

        guardarPreferencias();
    }

    /** Aplica el tamaño de letra elegido (todo el diseño usa rem). */
    function aplicarTamanoFuente() {
        document.documentElement.style.setProperty('--tamano-base', tamanoFuente + 'px');
        guardarPreferencias();
    }

    function alternarTema() {
        modoOscuro = !modoOscuro;
        aplicarTema();
        mostrarMensaje(
            modoOscuro
                ? 'Modo oscuro de alto contraste activado.'
                : 'Modo claro activado.',
            'info'
        );
    }

    function aumentarTexto() {
        if (tamanoFuente >= TAMANIO_MAXIMO) {
            mostrarMensaje('El tamaño de letra ya está en el máximo.', 'info');
            return;
        }
        tamanoFuente = Math.min(TAMANIO_MAXIMO, tamanoFuente + PASO_TAMANIO);
        aplicarTamanoFuente();
        mostrarMensaje('Tamaño de letra aumentado a ' + tamanoFuente + ' píxeles.', 'info');
    }

    function reducirTexto() {
        if (tamanoFuente <= TAMANIO_MINIMO) {
            mostrarMensaje('El tamaño de letra ya está en el mínimo.', 'info');
            return;
        }
        tamanoFuente = Math.max(TAMANIO_MINIMO, tamanoFuente - PASO_TAMANIO);
        aplicarTamanoFuente();
        mostrarMensaje('Tamaño de letra reducido a ' + tamanoFuente + ' píxeles.', 'info');
    }

    function restablecerPreferencias() {
        tamanoFuente = TAMANIO_BASE;
        modoOscuro = false;
        aplicarTamanoFuente();
        aplicarTema();
        mostrarMensaje('Se restablecieron el contraste y el tamaño de letra originales.', 'info');
    }

    /* =================================================================
        12. INICIALIZACIÓN Y REGISTRO DE EVENTOS
       ================================================================= */
    function inicializar() {
        cachearElementos();

        // Se cargan los datos guardados.
        tareas = cargarTareas();

        // Se restauran las preferencias de accesibilidad (o se respeta el tema
        // del sistema operativo si el usuario todavía no eligió ninguno).
        const preferencias = cargarPreferencias();
        if (preferencias) {
            tamanoFuente = preferencias.tamanoFuente || TAMANIO_BASE;
            modoOscuro = Boolean(preferencias.modoOscuro);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            modoOscuro = true;
        }
        aplicarTamanoFuente();
        aplicarTema();

        renderizar();

        /* --- Envío del formulario (funciona también con la tecla Enter) --- */
        elementos.formulario.addEventListener('submit', manejarEnvioFormulario);

        /* --- Botón de cancelar edición --- */
        elementos.botonCancelar.addEventListener('click', function () {
            salirDelModoEdicion();
            mostrarMensaje('Edición cancelada.', 'info');
            elementos.campoNombre.focus();
        });

        /* --- Botones de filtro de estado (delegación de eventos) --- */
        document.querySelector('.navegacion__lista').addEventListener('click', function (evento) {
            const boton = evento.target.closest('.filtro');
            if (!boton) {
                return;
            }
            filtroEstado = boton.dataset.filtro;

            // Se actualiza aria-pressed para que se sepa cuál filtro está activo.
            elementos.botonFiltro.forEach(function (filtro) {
                filtro.setAttribute(
                    'aria-pressed',
                    filtro.dataset.filtro === filtroEstado ? 'true' : 'false'
                );
            });

            renderizar();
        });

        /* --- Buscador por texto --- */
        elementos.busqueda.addEventListener('input', function (evento) {
            textoBusqueda = evento.target.value;
            renderizar();
        });

        /* --- Filtro por categoría --- */
        elementos.filtroCategoria.addEventListener('change', function (evento) {
            filtroCategoria = evento.target.value;
            renderizar();
        });

        /* --- Acciones de cada tarea (delegación de eventos sobre la lista) --- */
        elementos.lista.addEventListener('click', function (evento) {
            const boton = evento.target.closest('button[data-accion]');
            if (!boton) {
                return;
            }
            const item = boton.closest('.tarea-item');
            if (!item) {
                return;
            }
            const id = item.dataset.id;

            switch (boton.dataset.accion) {
                case 'editar':
                    iniciarEdicion(id);
                    break;
                case 'eliminar':
                    iniciarEliminacion(id);
                    break;
                case 'confirmar-eliminar':
                    eliminarTarea(id);
                    break;
                case 'cancelar-eliminar':
                    cancelarEliminacion(id);
                    break;
            }
        });

        /* --- Marcar una tarea como completada --- */
        elementos.lista.addEventListener('change', function (evento) {
            const casilla = evento.target.closest('input[data-accion="alternar"]');
            if (!casilla) {
                return;
            }
            const item = casilla.closest('.tarea-item');
            alternarCompletada(item.dataset.id);
        });

        /* --- Borrar las tareas completadas --- */
        elementos.botonLimpiarCompletadas.addEventListener('click', limpiarCompletadas);

        /* --- Barra de accesibilidad --- */
        elementos.botonTema.addEventListener('click', alternarTema);
        elementos.botonMas.addEventListener('click', aumentarTexto);
        elementos.botonMenos.addEventListener('click', reducirTexto);
        elementos.botonReset.addEventListener('click', restablecerPreferencias);

        /* --- Teclado: Escape cancela la edición --- */
        document.addEventListener('keydown', function (evento) {
            if (evento.key === 'Escape' && idEnEdicion !== null) {
                salirDelModoEdicion();
                mostrarMensaje('Edición cancelada con la tecla Escape.', 'info');
                elementos.campoNombre.focus();
            }
        });

        /* --- Si el usuario borra el almacenamiento desde el navegador --- */
        window.addEventListener('storage', function (evento) {
            if (evento.key === CLAVE_TAREAS) {
                tareas = cargarTareas();
                renderizar();
            }
        });
    }

    /** Maneja el envío del formulario: valida, guarda o actualiza. */
    function manejarEnvioFormulario(evento) {
        // Se evita la recarga de la página (comportamiento por defecto del form).
        evento.preventDefault();

        const datos = leerFormulario();
        const errores = validarFormulario(datos);

        if (errores.length > 0) {
            const primerCampo = mostrarErrores(errores);
            mostrarMensaje(
                'No se pudo guardar la tarea: ' + errores[0].mensaje,
                'error'
            );
            // El foco viaja al primer campo con error.
            primerCampo.focus();
            return;
        }

        limpiarErrores();

        if (idEnEdicion !== null) {
            actualizarTarea(idEnEdicion, datos);
        } else {
            agregarTarea(datos);
        }
    }

    // Se espera a que el DOM esté listo para empezar.
    document.addEventListener('DOMContentLoaded', inicializar);
}());
