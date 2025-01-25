document.addEventListener("DOMContentLoaded", function() {
    fetch("/pages/navbar.html")
        .then(response => response.text())
        .then(data => {
            const navbarContainer = document.getElementById("navbar-container");
            if (navbarContainer) {
                navbarContainer.innerHTML = data;

                // Esperar hasta que el navbar se haya insertado antes de asignar el evento al botón
                setTimeout(() => {
                    const logoutLink = document.getElementById("logout");
                    if (logoutLink) {
                        logoutLink.addEventListener("click", function(event) {
                            event.preventDefault();
                            console.log("Cerrando sesión...");

                            // Eliminar datos del usuario en localStorage
                            localStorage.removeItem("token");
                            localStorage.removeItem("user_id");
                            localStorage.removeItem("user");

                            // Redirigir al login
                            window.location.href = "/pages/login.html";
                        });
                    } else {
                        console.error("No se encontró el botón de Cerrar Sesión.");
                    }
                }, 100); // Pequeño retraso para asegurar que el DOM lo cargó
            }
        })
        .catch(error => console.error("Error cargando la barra de navegación:", error));
});
