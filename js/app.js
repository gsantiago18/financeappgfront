document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            const nombre = document.getElementById("nombre").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                alert("Las contraseñas no coinciden");
                return;
            }

            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, email, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                window.location.href = "login.html";
            } else {
                alert(data.message);
            }
        });
    }

    if(loginForm){
        loginForm.addEventListener("submit", async function(event){
            event.preventDefault();
            
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try{
                const response = await fetch("http://127.0.0.1:5000/api/login",{
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({email,password})
                });
                const data = await response.json();
                if (response.ok){
                    alert(data.message)
                     // Guardar el token y el nombre del usuario en localStorage
                     localStorage.setItem("token", data.token);
                     localStorage.setItem("user", data.user);

                     window.location.href = "home.html";
                }else{
                    alert(data.message);
                }

            }catch(error){
                console.error("Error en la solicitud:", error);
                alert("Error al conectar con el servidor")
            }
        });
    }
});
