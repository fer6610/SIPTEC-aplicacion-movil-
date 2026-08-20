import { agregarHerramienta } from "../services/herramientaService.js";
import { obtenerMarcas } from "../services/marcaService.js";
import { obtenerCategorias } from "../services/categoriaService.js";
import { obtenerEstadosHerramienta } from "../services/estadoHerramientaService.js";
import { agregarDetalleHerramienta } from "../services/detalleHerramientaService.js";
import { agregarHerramientaCategoria } from "../services/herramientaCategoriaService.js";

let listaEstadosHerramienta = [];

export function initImplementoController() {
    const nombreEquipo = document.getElementById("nombreEquipo");
    const codigoInventario = document.getElementById("codigoInventario");
    const selectMarca = document.getElementById("selectMarca");
    const selectCategoria = document.getElementById("selectCategoria");
    const descripcionEquipo = document.getElementById("descripcionEquipo");
    const btnGuardarImplemento = document.getElementById("btnGuardarImplemento");

    if (!btnGuardarImplemento) return;

    const patronCodigo = /^[A-Za-z0-9-]+$/;

    function validarFormulario() {
        if (!nombreEquipo.value.trim()) {
            return { valido: false, mensaje: "Escribe el nombre del equipo." };
        }
        if (!codigoInventario.value.trim() || !patronCodigo.test(codigoInventario.value.trim())) {
            return { valido: false, mensaje: "El código de inventario solo admite letras, números y guiones." };
        }
        if (!selectMarca.value) {
            return { valido: false, mensaje: "Selecciona una marca." };
        }
        if (!selectCategoria.value) {
            return { valido: false, mensaje: "Selecciona una categoría." };
        }
        return { valido: true };
    }

    async function guardarImplemento() {
        const validacion = validarFormulario();
        if (!validacion.valido) {
            Swal.fire({ icon: "warning", title: "Datos incompletos", text: validacion.mensaje });
            return;
        }

        const estadoDisponible = listaEstadosHerramienta.find((item) => item.nombreEstadoHerramienta === "DISPONIBLE");
        if (!estadoDisponible) {
            Swal.fire({ icon: "error", title: "No se pudo guardar", text: "No se encontró el estado DISPONIBLE." });
            return;
        }

        try {
            const nuevaHerramienta = await agregarHerramienta({
                nombreHerramienta: nombreEquipo.value.trim(),
                descripcionHerramienta: descripcionEquipo.value.trim(),
                stock: 1,
            });

            await agregarDetalleHerramienta({
                idHerramienta: nuevaHerramienta.idHerramienta,
                idMarca: Number(selectMarca.value),
                idEstadoHerramienta: estadoDisponible.id,
                codInv: codigoInventario.value.trim(),
            });

            await agregarHerramientaCategoria({
                idCategoria: Number(selectCategoria.value),
                idHerramienta: nuevaHerramienta.idHerramienta,
            });

            Swal.fire({
                icon: "success",
                title: "¡Implemento guardado!",
                text: "Se agregó correctamente al inventario.",
                confirmButtonColor: "#8a4fd6",
            }).then(() => loadView("dashboard"));

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "No se pudo guardar el implemento",
                text: "Ocurrió un error al conectar con el servidor. Intenta de nuevo.",
                confirmButtonColor: "#dc3545",
            });
        }
    }

    if (descripcionEquipo) {
        descripcionEquipo.addEventListener("input", () => {
            const contador = document.getElementById("c3");
            if (contador) contador.innerText = descripcionEquipo.value.length;
        });
    }

    (async function cargarCatalogos() {
        try {
            const [marcas, categorias, estadosHerramienta] = await Promise.all([
                obtenerMarcas(),
                obtenerCategorias(),
                obtenerEstadosHerramienta(),
            ]);

            listaEstadosHerramienta = estadosHerramienta;

            marcas.forEach((marca) => {
                const opcion = document.createElement("option");
                opcion.value = marca.id;
                opcion.textContent = marca.nombreMarca;
                selectMarca.appendChild(opcion);
            });

            categorias.forEach((categoria) => {
                const opcion = document.createElement("option");
                opcion.value = categoria.id;
                opcion.textContent = categoria.nombreCategoria;
                selectCategoria.appendChild(opcion);
            });

        } catch (error) {
            console.error(error);
            Swal.fire({ icon: "error", title: "No se pudieron cargar los catálogos", text: "Revisa tu conexión con el servidor." });
        }
    })();

    btnGuardarImplemento.addEventListener("click", guardarImplemento);
}
