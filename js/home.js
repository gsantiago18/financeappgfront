document.addEventListener("DOMContentLoaded", function() {
    // Obtener los elementos del DOM

    const token = localStorage.getItem("token");
    const logoutLink = document.getElementById("logout")
    const userId = localStorage.getItem("user_id");

       //validacion para que no acceda a ninguna pagina sin estar logueado
       if (!token || !userId) {
        console.warn("Acceso no autorizado. Redirigiendo al login...");

        Swal.fire({
            icon: "warning",
            title: "Acceso no autorizado",
            text: "Debes iniciar sesión para acceder a esta página.",
            confirmButtonText: "Ir al login",
            allowOutsideClick: false
        }).then(() => {
            window.location.href = "/pages/login.html"; // Redirigir al login después de la alerta
        });

        return; // Evitar que el resto del código se ejecute
    }

    console.log("Usuario autenticado, cargando home...");


    const mainFilter = document.getElementById("mainFilter");
    const dateFilter = document.getElementById("dateFilter");
    const categoryFilter = document.getElementById("categoryFilter");
    const subcategoryFilter = document.getElementById("subcategoryFilter");

    const fromDate = document.getElementById("filterStartDate");
    const toDate = document.getElementById("filterEndDate");
    const filterCategory = document.getElementById("filterCategory");
    const filterSubcategory = document.getElementById("filterSubcategory");
    const cards = document.querySelectorAll(".card-item");    
    const expenseContainer = document.getElementById("expenseCards");


    //Variales para la sesion
   


 

    function toggleFilters() {
        // Ocultar todos los filtros por defecto
        dateFilter.classList.add("hidden");
        categoryFilter.classList.add("hidden");
        subcategoryFilter.classList.add("hidden");

        if (mainFilter.value === "") {
            // Si no hay filtro seleccionado, mostrar todas las tarjetas
            resetFilters();
            showAllCards();
            return;
        }

        // Mostrar el filtro correspondiente según la selección del usuario
        if (mainFilter.value === "date") {
            dateFilter.classList.remove("hidden");
        } else if (mainFilter.value === "category") {
            categoryFilter.classList.remove("hidden");
        } else if (mainFilter.value === "subcategory") {
            subcategoryFilter.classList.remove("hidden");
        }
    }


    function resetFilters() {
        // Limpiar valores de los inputs de filtros
        fromDate.value = "";
        toDate.value = "";
        filterCategory.value = "";
        filterSubcategory.value = "";

        // Ocultar los filtros
        dateFilter.classList.add("hidden");
        categoryFilter.classList.add("hidden");
        subcategoryFilter.classList.add("hidden");
    }
 

    function showAllCards() {
        // Llamar a la API para obtener todos los gastos del usuario
        fetch(`http://127.0.0.1:5000/api/registro/${userId}`)
        .then(response => response.json())
        .then(data=>{
            renderExpenses(data);
        })
        .catch(error => console.error("Error cargando gastos:", error));
    }

    function fetchFilteredExpenses(){
        let url = `http://127.0.0.1:5000/api/registro/${userId}`;

        const selectedFromDate = fromDate.value;
        const selectedToDate = toDate.value;
        const selectedCategory = filterCategory.value;
        const selectedSubcategory = filterSubcategory.value;

        let params =[]
        //Filtrar por fecha
        if(mainFilter.value === "date" && selectedFromDate && selectedToDate){
            params.push(`from=${selectedFromDate}`);
            params.push(`to=${selectedToDate}`);
        }

        //Filtrar por categoría
        if(mainFilter.value === "category" && selectedCategory){
            params.push(`category=${selectedCategory}`);
        }

        //Filtrar por subcategoría
        if(mainFilter.value === "subcategory" && selectedSubcategory){
            params.push(`subcategory=${selectedSubcategory}`);
        }

        if(params.length > 0){
            url += "?" + params.join("&");
        }

        fetch(url)
        .then(response => response.json())
        .then(data=>{
            renderExpenses(data);
        })
        .catch(error => console.error("Error cargando gastos filtrados:", error));

    }

    function renderExpenses(expenses){
        expenseContainer.innerHTML = "";
        
        //Suma total de gastos de manera Dinamica
        let totalAmount = 0;
        expenses.forEach(exp=>{
            const card = document.createElement("div");
            card.classList.add("cold-md-4", "col-sm-6", "col-12", "card-item");

            // Asignar icono según la categoría
          
            let bgcard = "bg-primary-subtle";
            let iconmont= "\uD83D\uDCB6" ;
            let icontdate= "📅" ;
            let iconobservation= "📝" ;
            switch (exp.categoria) {
                case "GASTOS FIJOS": tab = "📌" ; break;
                case "GASTOS VARIOS": tab = " 🔄" ; break;
                default: tab = "💳"; // Icono por defecto
            }
            switch (exp.subcategoria) {
                case "": icon = "🛍️"; break;
                case "GASOLINA": icon = "⛽"; break;
                case "ALMUERZO": icon = "🍽️"; break;
                case "PARQUEADERO": icon = "🚗"; break;
                case "AYUDA CASA": icon = "🏡"; break;
                case "AHORRO": icon = "💰"; break;
                case "CTA CARRO": icon = "🚘"; break;
                case "CTA APTO": icon = "🏢"; break;
                default: icon = "💳"; // Icono por defecto
            }

            // Construir HTML con los campos visibles solo si tienen valor
            let subcategoryHTML = exp.subcategoria ? `<p><span style="font-size: 1.2em;">${icon}</span> <strong>${exp.subcategoria}</strong></p>` : "";
            let observacionHTML = exp.observacion ? `<p><span style="font-size: 1.2em;">${iconobservation}</span><strong>Observación:</strong> ${exp.observacion}</p>` : "";

            card.innerHTML=`
                <div class="card p-3 ${bgcard}">
                    <div class="card-body">
                        <h5 class="card-title">
                            ${tab} ${exp.categoria}
                        </h5>
                        ${subcategoryHTML}                          
                        <p><strong>${iconmont} Monto:</strong> ${exp.monto}</p>
                        <p><strong>${icontdate} Fecha:</strong> ${exp.fecha}</p>
                        ${observacionHTML}
                    </div>
                </div>
            `;
            expenseContainer.appendChild(card);

            let amount = parseFloat(exp.monto.replace(/[$,]/g, ""));
            totalAmount += isNaN(amount) ? 0 : amount;
        })
        document.getElementById("totalExpense").textContent = `$${totalAmount.toLocaleString()}`;
    }

    if (mainFilter){
        mainFilter.addEventListener("change",function(){
            if (mainFilter.value === ""){
                showAllCards();
                resetFilters()
            }else {
                toggleFilters();
            }
        })
    }

    if (fromDate) fromDate.addEventListener("change", fetchFilteredExpenses);
    if (toDate) toDate.addEventListener("change", fetchFilteredExpenses);
    if (filterCategory) filterCategory.addEventListener("change", fetchFilteredExpenses);
    if (filterSubcategory) filterSubcategory.addEventListener("change", fetchFilteredExpenses);

    // Cargar todos los gastos al cargar la página
    showAllCards();

    //cerrar sesion
    
   
        if (logoutLink) {
            
      
            logoutLink.addEventListener("click", function (event) {
                console.log("Cerrando sesión...");
                event.preventDefault(); // Evita la redirección automática

                // Eliminar los datos del usuario del localStorage
                localStorage.removeItem("token");
                localStorage.removeItem("user_id");
                localStorage.removeItem("user");

                // Redirigir al login
                window.location.href = "login.html";
            });
        }
});
