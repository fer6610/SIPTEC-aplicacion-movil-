// Hola
// Esta cosa solo es para cargar las vistas en loadViews.html
// solo carga el codigo de las otras paginas y por eso las otras paginas 
// no tienen encabezados, solo los puros divs, asi solo se inyecta en 
// cargar vistas usando fetch.

const viewRoot = document.getElementById("viewRoot");
const btnNavInicio = document.getElementById("btnNavInicio");
const btnNavPrestamos = document.getElementById("btnNavPrestamos");
const btnNavReportes = document.getElementById("btnNavReportes");
const btnNavDevolucion = document.getElementById("btnNavDevolucion");

// Aqui meto los botones en un array para no repetir codigo 
// cuando toque quitarles o ponerles el "active".
const botonesNav = [btnNavInicio, btnNavPrestamos, btnNavReportes, btnNavDevolucion];

// La función que inyecta la vista en #viewRoot.
// Recibe el nombre del archivo y, si andás con ganas, te deja marcado 
// un radio o te prellena un input de un solo para ahorrar fatiga.
async function loadView(viewName, checkId, fillId, fillValue) {
    if (!viewRoot) return;

    try {
        // hola esto solo lo pongo por que a veces guardaba cambios y actualizaba
        // pero no se me mostraba lo que habia guardado, y vi que era como cache
        // guardado y me mostraba una version vieja, pero esto se supone que evita eso
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
    botonesNav.forEach((boton) => boton.classList.remove("active"));

    if (viewName === "dashboard") btnNavInicio.classList.add("active");
    if (viewName === "loans") btnNavPrestamos.classList.add("active");
    if (viewName === "reports") btnNavReportes.classList.add("active");
    if (viewName === "devolucion") btnNavDevolucion.classList.add("active");
}

btnNavInicio.addEventListener("click", () => loadView("dashboard"));
btnNavPrestamos.addEventListener("click", () => loadView("loans"));
btnNavReportes.addEventListener("click", () => loadView("reports"));
btnNavDevolucion.addEventListener("click", () => loadView("devolucion"));

window.loadView = loadView;

// Que arranque el dashboard y que sea lo que Dios quiera.
loadView("dashboard");