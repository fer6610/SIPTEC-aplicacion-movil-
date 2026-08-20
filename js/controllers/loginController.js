import { obtenerUsuarios } from "../services/usuarioService.js";

export function initLoginController() {
    const formLogin = document.getElementById("login-form");
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    if (!formLogin) return;

    formLogin.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        if (!email.value.trim() || !password.value.trim()) {
            Swal.fire({ icon: "warning", title: "Datos incompletos", text: "Ingresa tu correo y tu contraseña." });
            return;
        }

        try {
            const usuarios = await obtenerUsuarios();
            const correoBuscado = email.value.trim().toLowerCase();
            const usuarioEncontrado = usuarios.find((usuario) => usuario.correoUsuario.toLowerCase() === correoBuscado);

            if (!usuarioEncontrado) {
                Swal.fire({ icon: "error", title: "Credenciales inválidas", text: "No se encontró una cuenta con ese correo." });
                return;
            }

            localStorage.setItem("siptec-usuario-id", usuarioEncontrado.id);
            localStorage.setItem("siptec-usuario-nombre", usuarioEncontrado.nombreUsuario);

            window.location.href = "pages/loadViews.html";

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "No se pudo iniciar sesión",
                text: "Ocurrió un error al conectar con el servidor. Intenta de nuevo.",
                confirmButtonColor: "#dc3545",
            });
        }
    });
}

initLoginController();
