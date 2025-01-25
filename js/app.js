
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const categoriaSelect = document.getElementById("categoria");
    const subcategoriaSelect = document.getElementById("subcategoria");
    const labelcont = document.getElementById("labelCat");
    const gastoForm = document.getElementById("gastoForm");
    
    //Registrar Usuario
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
    //Inicio de Sesion
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
                    Swal.fire({
                        icon: 'success',
                        text: data.message,
                        showConfirmButton: false,
                        timer: 1500
                    });
                     // Guardar el token y el nombre del usuario en localStorage
                     localStorage.setItem("token", data.token);
                     localStorage.setItem("user", data.nombre);
                     localStorage.setItem("user_id", data.user_id);

                     setTimeout(() => {
                        window.location.href = "home.html";
                    }, 3000);
                }else{
                    Swal.fire({
                        icon: 'error',
                        title: 'Error en inicio de sesión',
                        text: data.message,
                        confirmButtonText: 'Intentar de nuevo'
                    });
                }

            }catch(error){
                console.error("Error en la solicitud:", error);
                alert("Error al conectar con el servidor")
            }
        });
    }

    if (!categoriaSelect || !subcategoriaSelect) {
        console.error("Los elementos select no se encontraron en el DOM.");
        return;
    }
    
    fetch("http://127.0.0.1:5000/api/categoria", {
        method: "GET"
    }) 
        .then(response => {
            if (!response.ok) throw new Error("Error en la API de categorías");
            return response.json();
        })
        .then(categorias => {
            categorias.forEach(cat => {
                let option = document.createElement("option");
                option.value = cat.id;
                option.textContent = cat.nombre;
                categoriaSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error cargando categorías:", error));
    
    //Cargar Subcategorias
    if (categoriaSelect) {
        categoriaSelect.addEventListener("change", async function () {
            let categoriaId = this.value;

            // Limpiar opciones previas
            subcategoriaSelect.innerHTML = '<option value="" disabled selected>Selecciona una subcategoría...</option>';

            if (categoriaId === "12") {  // Compara con string, porque el valor del select es string
                subcategoriaSelect.style.display = "block";
                labelcont.style.display = "block";

                fetch(`http://127.0.0.1:5000/api/subcategorias/${categoriaId}`,
                    {method: "GET"}
                )
                    .then(response => response.json())
                    .then(subcategorias => {
                        subcategorias.forEach(sub => {  // Cambiado "subcategoria" por "sub"
                            let option = document.createElement("option");
                            option.value = sub.id;
                            option.textContent = sub.nombre;
                            subcategoriaSelect.appendChild(option);
                        });
                    })
                    .catch(error => console.error("Error cargando subcategorías:", error));
            } else {
                subcategoriaSelect.style.display = "none";
                labelcont.style.display = "none";
            }
        });
    }

    //Registrar Gasto
    if(gastoForm){
        gastoForm.addEventListener("submit",async function(event){
            event.preventDefault();

            const userId = localStorage.getItem("user_id");
            const categoriaId = document.getElementById("categoria").value;
            let subcategoriaId = document.getElementById("subcategoria").value;
            const monto = document.getElementById("monto").value;
            const fecha = document.getElementById("fecha").value;
            const observacion = document.getElementById("observacion").value;

            if (!userId) {
                alert("Error: No se encontró el ID de usuario. Inicia sesión nuevamente.");
                window.location.href = "login.html";
                return;
            }

            if (!categoriaId || !monto || !fecha) {
                alert("Todos los campos son obligatorios.");
                return;
            }

               // 🔹 Si no hay subcategoría (ejemplo: "GASTOS VARIOS"), asignamos `null`
            subcategoriaId = subcategoriaId ? subcategoriaId : null;

            const data ={
               
                monto: monto,
                fecha: fecha,
                observacion: observacion || null,
                subcategoriaId: subcategoriaId || null
            }
            let url = `http://127.0.0.1:5000/api/nuevo_gasto/${categoriaId}/${userId}`;

            // 🔹 Solo agregar `subcategoriaId` a la URL si no es null
            if (subcategoriaId !== null) {
                url += `/${subcategoriaId}`;
                data.subcategoria_id = subcategoriaId;
            }


            try{
                const response = await fetch(url,{
                    method:"POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify(data)
                })

                const result = await response.json();
                if (response.ok){
                    Swal.fire({
                        icon: 'success',
                        title: 'Gasto registrado',
                        text: result.message,
                        showConfirmButton: false,
                        timer: 1500
                    });
                    
                    gastoForm.reset()
                }else{
                    alert(`Error: ${result.message || "No se pudo registrar el gasto."}`);
                }
            }catch{
                console.error("Error en la solicitud:", error);
                alert("Hubo un error al registrar el gasto.");
            }


        })
    }










});
