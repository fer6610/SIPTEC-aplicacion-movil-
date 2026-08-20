const viewRoot = document.getElementById("viewRoot");
const btnNavInicio = document.getElementById("btnNavInicio");
const btnNavPrestamos = document.getElementById("btnNavPrestamos");
const btnNavReportes = document.getElementById("btnNavReportes");
const btnNavDevolucion = document.getElementById("btnNavDevolucion");


const botonesNav = [btnNavInicio, btnNavPrestamos, btnNavReportes, btnNavDevolucion];


async function loadView(viewName, checkId, fillId, fillValue) {
    if (!viewRoot) return;

    try {
        const respuesta = await fetch(`${viewName}.html?t=${Date.now()}`);

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar la vista: " + viewName);
        }

        const html = await respuesta.text();
        viewRoot.innerHTML = html;

        if (checkId) {
            const radio = document.getElementById(checkId);
            if (radio) radio.checked = true;
        }

        if (fillId && fillValue) {
            const campo = document.getElementById(fillId);
            if (campo) campo.value = fillValue;
        }

        marcarBotonActivo(viewName);

    } catch (error) {
        console.error("Lo sentimos, hubo un error al cargar la pagina: " + error);
        viewRoot.innerHTML = '<p style="padding:20px;color:#dc3545;">Error al cargar la página.</p>';
    }
}

// esto solo es para pintar el botón que toca en el nav.
function marcarBotonActivo(viewName) {
    botonesNav.forEach((boton) => boton.classList.remove("activo"));

    if (viewName === "dashboard") btnNavInicio.classList.add("activo");
    if (viewName === "loans") btnNavPrestamos.classList.add("activo");
    if (viewName === "reports") btnNavReportes.classList.add("activo");
    if (viewName === "devolucion") btnNavDevolucion.classList.add("activo");
}

btnNavInicio.addEventListener("click", () => loadView("dashboard"));
btnNavPrestamos.addEventListener("click", () => loadView("loans"));
btnNavReportes.addEventListener("click", () => loadView("reports"));
btnNavDevolucion.addEventListener("click", () => loadView("devolucion"));

window.loadView = loadView;

loadView("dashboard");