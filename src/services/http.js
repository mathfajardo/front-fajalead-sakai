import axios from "axios";

const axiosInstance = axios.create({
    // baseURL: "https://fajalead.api.shopb2b.com.br/api",
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para enviar token
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para ver respostas
axiosInstance.interceptors.response.use(
    (response) => {
        console.log("Resposta OK:", response.status, response.config.url);
        return response;
    },
    (error) => {
        console.log("Erro na resposta:", {
            url: error.config?.url,
            status: error.response?.status,
            headers: error.config?.headers,
            data: error.response?.data,
        });
        return Promise.reject(error);
    },
);

export default axiosInstance;
