const CONFIG = {
    API_URL: window.location.hostname.includes("localhost")|| window.location.hostname.includes("127.0.0.1")
    ? "http://127.0.0.1:5000/api"  //Api local
    :"https://financeappgback-production.up.railway.app/api" //Api produccion
}

export default CONFIG;