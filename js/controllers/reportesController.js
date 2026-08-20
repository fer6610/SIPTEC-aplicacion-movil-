import { obtenerPrestamos } from "../services/prestamoService.js";
import { obtenerEstadosPrestamo } from "../services/estadoPrestamoService.js";
import { obtenerDetallePrestamoHerramientas } from "../services/detallePrestamoHerramientaService.js";
import { obtenerHerramientas } from "../services/herramientaService.js";
import { obtenerDetallesHerramienta } from "../services/detalleHerramientaService.js";
import { obtenerEstadosHerramienta } from "../services/estadoHerramientaService.js";

function formatearFecha(fechaISO) {
    if (!fechaISO) return "-";
    const fecha = new Date(fechaISO + "T00:00:00");
    return fecha.toLocaleDateString("es-SV", { day: "2-digit", month: "short", year: "numeric" });
}

function dentroDeRango(fechaISO, inicio, fin) {
    if (!fechaISO) return false;
    if (inicio && fechaISO < inicio) return false;
    if (fin && fechaISO > fin) return false;
    return true;
}

export function initReportesController() {
    const btnGenerarReporte = document.getElementById("btnGenerarReporte");
    const btnVerReportes = document.getElementById("btnVerReportes");
    const reporteFechaInicio = document.getElementById("reporteFechaInicio");
    const reporteFechaFin = document.getElementById("reporteFechaFin");
    const resultadosReporte = document.getElementById("resultadosReporte");

    if (!btnGenerarReporte) return;

    function tipoSeleccionado() {
        if (document.getElementById("repHistorial").checked) return "historial";
        if (document.getElementById("repDevoluciones").checked) return "devoluciones";
        if (document.getElementById("repDanados").checked) return "danados";
        return "activos";
    }

    function pintarLista(filas) {
        resultadosReporte.innerHTML = "";
        resultadosReporte.classList.remove("oculto");

        if (filas.length === 0) {
            resultadosReporte.innerHTML = '<p style="padding:8px 0;color:var(--ink-soft);font-size:12px;">No se encontraron resultados para el rango seleccionado.</p>';
            return;
        }

        filas.forEach((texto) => {
            const fila = document.createElement("div");
            fila.className = "fila-elemento";
            fila.innerHTML = `
                <i class="fa-solid fa-file-lines icono-elemento"></i>
                <div class="info-elemento">
                    <div class="titulo-elemento">${texto.titulo}</div>
                    <div class="subtitulo-elemento">${texto.subtitulo}</div>
                </div>
            `;
            resultadosReporte.appendChild(fila);
        });
    }

    async function generarReporte() {
        if (!reporteFechaInicio.value || !reporteFechaFin.value) {
            Swal.fire({ icon: "warning", title: "Selecciona el rango de fechas", text: "Elige la fecha de inicio y la fecha final del reporte." });
            return;
        }

        if (reporteFechaFin.value < reporteFechaInicio.value) {
            Swal.fire({ icon: "warning", title: "Rango inválido", text: "La fecha final no puede ser anterior a la fecha de inicio." });
            return;
        }

        Swal.fire({ icon: "info", title: "Generando reporte...", text: "Esto puede tardar unos segundos.", confirmButtonColor: "#6c757d" });

        try {
            const tipo = tipoSeleccionado();
            const inicio = reporteFechaInicio.value;
            const fin = reporteFechaFin.value;

            if (tipo === "danados") {
                const [detalles, estadosHerramienta, herramientas] = await Promise.all([
                    obtenerDetallesHerramienta(),
                    obtenerEstadosHerramienta(),
                    obtenerHerramientas(),
                ]);

                const idDanado = estadosHerramienta.find((item) => item.nombreEstadoHerramienta === "DAÑADO")?.id;
                const filas = detalles
                    .filter((item) => item.idEstadoHerramienta === idDanado)
                    .map((item) => {
                        const herramienta = herramientas.find((h) => h.idHerramienta === item.idHerramienta);
                        return {
                            titulo: herramienta ? herramienta.nombreHerramienta : "Equipo",
                            subtitulo: "Código: " + item.codInv,
                        };
                    });

                Swal.close();
                pintarLista(filas);
                return;
            }

            const [prestamos, estadosPrestamo, detallesPrestamo, herramientas] = await Promise.all([
                obtenerPrestamos(),
                obtenerEstadosPrestamo(),
                obtenerDetallePrestamoHerramientas(),
                obtenerHerramientas(),
            ]);

            let filtrados = [];

            if (tipo === "activos") {
                filtrados = prestamos.filter((p) => !p.fechaDevolucion && dentroDeRango(p.fechaInicio, inicio, fin));
            } else if (tipo === "historial") {
                filtrados = prestamos.filter((p) => dentroDeRango(p.fechaInicio, inicio, fin));
            } else if (tipo === "devoluciones") {
                filtrados = prestamos.filter((p) => p.fechaDevolucion && dentroDeRango(p.fechaDevolucion, inicio, fin));
            }

            const filas = filtrados.map((prestamo) => {
                const detalle = detallesPrestamo.find((item) => item.prestamo === prestamo.id);
                const herramienta = detalle ? herramientas.find((item) => item.idHerramienta === detalle.herramienta) : null;
                const estado = estadosPrestamo.find((item) => item.id === prestamo.estado);

                return {
                    titulo: herramienta ? herramienta.nombreHerramienta : "Préstamo #" + prestamo.id,
                    subtitulo: (estado ? estado.nombreEstado : "") + " · " + formatearFecha(prestamo.fechaInicio) + (prestamo.fechaDevolucion ? " → " + formatearFecha(prestamo.fechaDevolucion) : ""),
                };
            });

            Swal.close();
            pintarLista(filas);

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "No se pudo generar el reporte",
                text: "Ocurrió un error al conectar con el servidor. Intenta de nuevo.",
                confirmButtonColor: "#dc3545",
            });
        }
    }

    if (btnVerReportes) {
        btnVerReportes.addEventListener("click", () => {
            Swal.fire({ icon: "info", title: "Próximamente", text: "El historial de reportes generados estará disponible pronto." });
        });
    }

    btnGenerarReporte.addEventListener("click", generarReporte);
}
