# 📋 Trabajo Final — Curso Intensivo de JavaScript (CILSA)

**Gestor de Tareas** — aplicación web interactiva, accesible y responsive
desarrollada con **HTML5, CSS3 y JavaScript Vanilla** (sin frameworks ni librerías).

---

## 📁 Estructura del proyecto

```
trabajo-practico-final/
├── index.html          # Estructura semántica HTML5 + región aria-live + guía de defensa
├── styles.css          # Variables CSS, tema claro/alto contraste, diseño responsive
├── script.js           # Lógica de la app en JavaScript (12 secciones comentadas)
└── README.md           # Este archivo
```

## ▶️ Cómo ejecutarlo

1. Abrí la carpeta `trabajo-practico-final`.
2. Hacé doble clic en `index.html` (se abre en el navegador).
   También podés usar un servidor local:
   ```bash
   npx serve trabajo-practico-final
   ```
3. No hace falta instalar nada: no hay dependencias ni build.

---

## ✅ Funcionalidades

| # | Función | Detalle |
|---|---------|---------|
| 1 | Crear tareas | Nombre, categoría, prioridad y fecha límite opcional |
| 2 | Editar tareas | El formulario se recarga en modo edición (`Guardar cambios`) |
| 3 | Eliminar tareas | Con confirmación **dentro del DOM** (nunca `alert()` ni `confirm()`) |
| 4 | Completar tareas | Checkbox nativo con etiqueta asociada + estado visible |
| 5 | Filtrar | Por estado (nav), por categoría (select) y por texto (buscador) |
| 6 | Contadores | Total / pendientes / completadas + barra de progreso con % |
| 7 | Persistencia | `localStorage`: las tareas y las preferencias sobreviven al cierre |
| 8 | Borrar completadas | Botón que se deshabilita solo si no hay tareas completadas |

## ♿ Mejoras de accesibilidad implementadas

1. **Barra de accesibilidad en el `<header>`**
   - Botón de **modo oscuro / alto contraste** (`aria-pressed`, atributo
     `data-tema` sobre `<html>`).
   - Botones **A+ / A−** que cambian la variable CSS `--tamano-base`
     (todo el diseño usa `rem`, así que escala de forma proporcional).
   - Botón **Restablecer** para volver al estado original.
2. **Navegación por teclado y gestión del foco**
   - Todos los controles son elementos nativos: se recorren con `Tab` y se
     activan con `Enter` / `Espacio`.
   - Indicador visual claro con `:focus-visible`.
   - Foco gestionado conscientemente: al guardar, al editar, al eliminar y
     al confirmar se reubica el foco de forma programada.
   - `Escape` cancela la edición.
   - Enlace de salto al contenido principal.
3. **ARIA y lectores de pantalla**
   - Región `role="status"` con `aria-live="polite"` y `aria-atomic="true"`.
   - Botones de sólo ícono con `aria-label` descriptivo (incluye el nombre
     de la tarea) e íconos SVG `aria-hidden="true"`.
   - `aria-describedby` en los campos + `aria-invalid="true"` al validar.
   - `aria-labelledby` en los paneles, la barra y la barra de progreso.

## 🧪 Validaciones implementadas

| Campo | Regla | Mensaje al usuario |
|-------|-------|--------------------|
| Nombre | Obligatorio, entre 3 y 80 caracteres | *"Ingresá un nombre de tarea para continuar."* |
| Categoría | Debe ser una de las 6 permitidas | *"Seleccioná una categoría para la tarea."* |
| Prioridad | Debe ser Alta, Media o Baja | *"Seleccioná una prioridad para la tarea."* |
| Fecha | Opcional, pero no puede estar vencida | *"La fecha límite no puede ser anterior a hoy."* |
