// frontend/src/utils/validadores.js

/**
 * Valida un archivo de imagen antes de enviarlo al servidor.
 * @param {File} file - El archivo seleccionado por el usuario.
 * @param {number} maxMB - Tamaño máximo en Megabytes (por defecto 5MB).
 * @returns {Object} { valido: boolean, error: string | null }
 */
export const validarImagenSegura = (file, maxMB = 5) => {
  if (!file) return { valido: false, error: "No se seleccionó ningún archivo." };

  // Validar el tamaño máximo
  const sizeInMB = file.size / (1024 * 1024);
  if (sizeInMB > maxMB) {
    return { 
      valido: false, 
      error: `La imagen pesa ${sizeInMB.toFixed(1)}MB. El máximo permitido es ${maxMB}MB.` 
    };
  }

  // Validar el tipo MIME estricto (Evita scripts, .exe o archivos dañinos)
  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return { 
      valido: false, 
      error: "Formato no permitido. Solo se aceptan imágenes JPG, PNG o WEBP." 
    };
  }

  return { valido: true, error: null };
};