const prod = {
    url: {
        APP_URL: "",
        API_URL: "https://giveortake-laravel-backend.ey.r.appspot.com",
    },
    mobilepay: {
        MP_CLIENT_ID: "",
        MP_CLIENT_SECRET: "",
        MP_KEY: "",
        MP_SESSION_API: "",
        MP_MSN: "",
    }
}

const dev = {
    url: {
        APP_URL: "http://localhost:3000",
        // API_URL: "http://localhost:8000",
        API_URL: "http://10.71.24.57:8000",
        // API_URL: "http://192.168.0.139:8000",
        // API_URL: "https://giveortake-laravel-backend.ey.r.appspot.com",
    },
    mobilepay: {
        MP_CLIENT_ID: "",
        MP_CLIENT_SECRET: "",
        MP_KEY: "",
        MP_SESSION_API: "",
        MP_MSN: "",
    }
}
export const env = process.env.NODE_ENV === 'development' ? dev : prod

export const paths = {
    API_ROUTE: "/api/"
}
