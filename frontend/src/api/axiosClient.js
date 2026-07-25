// frontend/src/api/axiosClient.js
/**
 * AXIOS CLIENT - Ecosysval
 * -------------------------------------------------------
 * Cliente HTTP centralizado con:
 * - Interceptor de requests (agrega token automáticamente)
 * - Interceptor de responses (renueva token si expiró)
 * - Cola de requests durante refresh (evita refresh múltiples)
 * - Redirect automático a /login si el refresh falla
 *
 * USO EN COMPONENTES:
 *   import { api } from "../api/axiosClient";
 *   const res = await api.get("/users");
 *   const res = await api.post("/posts", { content: "hola" });
 */

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// ==========================================
// CLIENTE PRINCIPAL
// ==========================================
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// CLIENTE SIN INTERCEPTOR (para refresh)
// ==========================================
// Usado internamente para pedir el nuevo token sin caer en loop infinito
const authClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// ESTADO DE REFRESH (para manejar la cola)
// ==========================================
let isRefreshing = false;
let failedQueue = [];

/**
 * Procesa la cola de requests que estaban esperando el nuevo token.
 * Si el refresh fue exitoso, reintenta todas con el nuevo token.
 * Si falló, rechaza todas.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================
// Se ejecuta ANTES de cada request.
// Agrega el access_token automáticamente en el header.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================
// Se ejecuta DESPUÉS de cada response.
// Si detecta 401, intenta renovar el token automáticamente.
api.interceptors.response.use(
  (response) => {
    // Response exitoso, pasa tal cual
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si NO es un error 401, o ya intentamos refresh en esta request → rechazar
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Si la request original es al endpoint de refresh o login → no reintentar
    if (
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    // Marcar esta request como "ya reintentada" (evita loops)
    originalRequest._retry = true;

    // ==========================================
    // CASO 1: Ya hay un refresh en curso
    // ==========================================
    // Encolar esta request para que se procese cuando termine el refresh
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // ==========================================
    // CASO 2: Iniciar refresh
    // ==========================================
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refresh_token");

    // Si no hay refresh_token → cerrar sesión
    if (!refreshToken) {
      isRefreshing = false;
      handleLogout();
      return Promise.reject(error);
    }

    try {
      // Llamar al endpoint de refresh
      const response = await authClient.post("/auth/refresh", {
        refresh_token: refreshToken,
      });

      const newAccessToken = response.data.access_token;

      // Guardar el nuevo token
      localStorage.setItem("token", newAccessToken);

      // Procesar la cola: todas las requests que estaban esperando ahora se ejecutan
      processQueue(null, newAccessToken);

      // Reintentar la request original con el nuevo token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh falló → invalidar cola y hacer logout
      processQueue(refreshError, null);
      handleLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ==========================================
// HELPER: Cerrar sesión y redirigir
// ==========================================
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  // Redirigir solo si no estamos ya en la página de login
  if (
    !window.location.pathname.includes("/login") &&
    !window.location.pathname.includes("/subscribe") &&
    !window.location.pathname.includes("/register") &&
    !window.location.pathname.includes("/verificar") &&
    !window.location.pathname.includes("/forgot-password") &&
    !window.location.pathname.includes("/reset-password")
  ) {
    window.location.href = "/login";
  }
}

// ==========================================
// EXPORTAR TAMBIÉN LOGOUT MANUAL
// ==========================================
/**
 * Función para hacer logout manual desde cualquier componente.
 * Invalida el refresh_token en el backend + limpia localStorage.
 */
export const logout = async () => {
  try {
    // Intentar invalidar en el backend
    await api.post("/auth/logout");
  } catch (err) {
    // Si falla (ej: sin conexión), igual limpiamos localmente
    console.warn("Error al hacer logout en backend:", err);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

// ==========================================
// EXPORTAR API_URL (por si se necesita)
// ==========================================
export { API_URL };

// ==========================================
// EXPORT DEFAULT
// ==========================================
export default api;