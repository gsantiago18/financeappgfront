import CONFIG from "../js/config.js";


document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = CONFIG.API_URL;

    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const categoriaSelect = document.getElementById("categoria");
    const subcategoriaSelect = document.getElementById("subcategoria");
    const labelcont = document.getElementById("labelCat");
    const gastoForm = document.getElementById("gastoForm");
    const submitDeuda = document.getElementById("submitDeuda"); 
     
    
    //Registrar Usuario
    if (registerForm) {
        registerForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            const nombre = document.getElementById("nombre").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error en registro',
                    text: 'Las contraseñas no coinciden',
                    confirmButtonText: 'Intentar de nuevo'
                    });
               
                return;
            }

            const response = await fetch( `${API_BASE_URL}/register`, {
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
                const response = await fetch(`${API_BASE_URL}/login`,{
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
                    }, 2000);
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
    
    fetch(`${API_BASE_URL}/categoria`, {
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

                let cachedSubcategorias = localStorage.getItem(`subcategorias_${categoriaId}`);

                if (cachedSubcategorias) {
                    console.log("Cargando subcategorías desde localStorage");
                    renderSubcategorias(JSON.parse(cachedSubcategorias));
                }else{

                    fetch(`${API_BASE_URL}/subcategorias/${categoriaId}`,
                        {method: "GET"}
                    )
                        .then(response => response.json())
                        .then(subcategorias => {
                            // Guardar en localStorage
                            localStorage.setItem(`subcategorias_${categoriaId}`, JSON.stringify(subcategorias));
                            renderSubcategorias(subcategorias);
                        })
                        .catch(error => console.error("Error cargando subcategorías:", error));
                    }        
            } else {
                subcategoriaSelect.style.display = "none";
                labelcont.style.display = "none";
            }

            function renderSubcategorias(subcategorias) {
                subcategorias.forEach(sub => {
                    let option = document.createElement("option");
                    option.value = sub.id;
                    option.textContent = sub.nombre;
                    subcategoriaSelect.appendChild(option);
                });
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
            let url = `${API_BASE_URL}/nuevo_gasto/${categoriaId}/${userId}`;

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

    //Registrar Deuda

    if (submitDeuda) {
        submitDeuda.addEventListener("click", async function () {
            console.log("El botón de registrar deuda fue presionado"); // Debug

            const userId = localStorage.getItem("user_id");
            const monto = document.getElementById("montodeu").value;
            const nombre = document.getElementById("namedeu").value;

            console.log("User ID obtenido:", userId);
            console.log("Datos a enviar:", { nombre, monto });

            if (!userId || !monto || !nombre) {
                Swal.fire({
                    icon: "warning",
                    title: "Todos los campos son obligatorios",
                    confirmButtonText: "Intentar de nuevo"
                });
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/nuevadeuda/${userId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nombre: nombre,
                        monto: monto
                    }),
                });

                console.log("Respuesta recibida:", response);

                const data = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: "success",
                        text: data.message,
                    });
                    deudaForm.reset();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: data.message || "No se pudo registrar la deuda",
                    });
                }

            } catch (error) {
                console.error("Error en la solicitud:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error de conexión",
                    text: "No se pudo conectar con el servidor.",
                });
            }
        });
    }
            

});
