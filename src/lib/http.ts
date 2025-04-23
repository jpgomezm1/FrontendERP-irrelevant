import axios from "axios";

/**
 * Instancia única de Axios para toda la aplicación.
 * Aquí puedes poner interceptores, manejo de errores globales, etc.
 */
const api = axios.create({
  baseURL: "http://localhost:8000",   // <-- tu backend
  withCredentials: false,             // cámbialo si tu API usa cookies
});

// ▸ Adjunta el access-token (si existe) en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
