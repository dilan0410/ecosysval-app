// frontend/src/api/pythonAPI.js
/**
 * ==========================================
 * PYTHON API CLIENT
 * ==========================================
 * Cliente para consumir la API del Sistema
 * Inteligente Económico (Python + FastAPI).
 *
 * En desarrollo: http://localhost:8000
 * En producción:
 */

// ==========================================
// CONFIGURACIÓN
// ==========================================
const PYTHON_API_URL =
  process.env.REACT_APP_PYTHON_API_URL || "http://localhost:8000";

// ==========================================
// HELPER: Manejar respuestas
// ==========================================
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Error ${response.status}: ${response.statusText}`
    );
  }
  return response.json();
}

// ==========================================
// OBTENER RECOMENDACIONES DE UN SECTOR
// ==========================================
/**
 * Obtiene las recomendaciones (clientes y proveedores) de un sector.
 *
 * @param {string} codigoScian - Código SCIAN del sector (ej: "3111")
 * @param {number} topN - Cantidad de resultados (default: 5, max: 20)
 * @returns {Promise<Object>} Objeto con sector, categoria, top_clientes, top_proveedores
 */
export async function obtenerRecomendaciones(codigoScian, topN = 5) {
  const url = `${PYTHON_API_URL}/recomendaciones/${codigoScian}?top_n=${topN}`;

  try {
    const response = await fetch(url);
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error("Error obteniendo recomendaciones:", error);
    throw error;
  }
}

// ==========================================
// LISTAR TODOS LOS SECTORES
// ==========================================
/**
 * Obtiene la lista completa de sectores disponibles.
 *
 * @returns {Promise<Array>} Lista de sectores [{codigo, nombre}]
 */
export async function listarSectores() {
  const url = `${PYTHON_API_URL}/recomendaciones/sectores`;

  try {
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error listando sectores:", error);
    throw error;
  }
}

// ==========================================
// OBTENER ESTADÍSTICAS
// ==========================================
/**
 * Obtiene estadísticas de la clasificación.
 *
 * @returns {Promise<Object>} Objeto con total y por_categoria
 */
export async function obtenerEstadisticas() {
  const url = `${PYTHON_API_URL}/recomendaciones/estadisticas`;

  try {
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    throw error;
  }
}

// ==========================================
// OBTENER INFO BÁSICA DE UN SECTOR
// ==========================================
/**
 * Obtiene información básica de un sector (código, nombre, categoría).
 *
 * @param {string} codigoScian - Código SCIAN del sector
 * @returns {Promise<Object>} Info del sector
 */
export async function obtenerInfoSector(codigoScian) {
  const url = `${PYTHON_API_URL}/recomendaciones/sector/${codigoScian}`;

  try {
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error obteniendo info del sector:", error);
    throw error;
  }
}

// ==========================================
// HEALTH CHECK
// ==========================================
/**
 * Verifica si la API Python está corriendo.
 *
 * @returns {Promise<boolean>} true si la API responde
 */
export async function verificarAPI() {
  try {
    const response = await fetch(`${PYTHON_API_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}