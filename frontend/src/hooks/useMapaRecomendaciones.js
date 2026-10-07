// frontend/src/hooks/useMapaRecomendaciones.js
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axiosClient";
import { obtenerRecomendaciones } from "../api/pythonAPI";

// Coordenadas normalizadas
const COORDENADAS_ESTADOS = {
  aguascalientes: { lat: 21.8818, lng: -102.2915 },
  "baja california": { lat: 30.8406, lng: -115.2838 },
  "baja california sur": { lat: 26.0444, lng: -111.1666 },
  campeche: { lat: 19.8301, lng: -90.5349 },
  chiapas: { lat: 16.7569, lng: -93.1292 },
  chihuahua: { lat: 28.632, lng: -106.0691 },
  "ciudad de mexico": { lat: 19.4326, lng: -99.1332 },
  cdmx: { lat: 19.4326, lng: -99.1332 },
  df: { lat: 19.4326, lng: -99.1332 },
  "distrito federal": { lat: 19.4326, lng: -99.1332 },
  coahuila: { lat: 27.0587, lng: -101.7068 },
  "coahuila de zaragoza": { lat: 27.0587, lng: -101.7068 },
  colima: { lat: 19.2452, lng: -103.7241 },
  durango: { lat: 24.0277, lng: -104.6532 },
  "estado de mexico": { lat: 19.3235, lng: -99.5694 },
  mexico: { lat: 19.3235, lng: -99.5694 },
  edomex: { lat: 19.3235, lng: -99.5694 },
  guanajuato: { lat: 21.019, lng: -101.2574 },
  guerrero: { lat: 17.5516, lng: -99.501 },
  hidalgo: { lat: 20.0911, lng: -98.7624 },
  jalisco: { lat: 20.6597, lng: -103.3496 },
  michoacan: { lat: 19.1687, lng: -101.8996 },
  "michoacan de ocampo": { lat: 19.1687, lng: -101.8996 },
  morelos: { lat: 18.7305, lng: -99.066 },
  nayarit: { lat: 21.7514, lng: -104.8455 },
  "nuevo leon": { lat: 25.5922, lng: -99.9962 },
  oaxaca: { lat: 17.0732, lng: -96.7266 },
  puebla: { lat: 19.0414, lng: -98.2063 },
  queretaro: { lat: 20.5881, lng: -100.3899 },
  "quintana roo": { lat: 19.1817, lng: -88.4791 },
  "san luis potosi": { lat: 22.1565, lng: -100.9855 },
  sinaloa: { lat: 25.1721, lng: -107.4795 },
  sonora: { lat: 29.2972, lng: -110.3309 },
  tabasco: { lat: 17.9869, lng: -92.9303 },
  tamaulipas: { lat: 24.2669, lng: -98.8363 },
  tlaxcala: { lat: 19.3139, lng: -98.2404 },
  veracruz: { lat: 19.1738, lng: -96.1342 },
  "veracruz de ignacio de la llave": { lat: 19.1738, lng: -96.1342 },
  yucatan: { lat: 20.7099, lng: -89.0943 },
  zacatecas: { lat: 22.7709, lng: -102.5832 },
};

/**
 * Normaliza cualquier valor (Array, JSON String, String plano) a un Array real de JS
 */
export function normalizarArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.flatMap((item) => normalizarArray(item)).filter(Boolean);
  }
  if (typeof val === "string") {
    let str = val.trim();
    if (!str || str === "[]" || str === '[""]') return [];
    if (str.startsWith("[") && str.endsWith("]")) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          return parsed.map((s) => String(s).trim()).filter(Boolean);
        }
      } catch (e) {
        return str
          .slice(1, -1)
          .split(",")
          .map((s) => s.replace(/^["']|["']$/g, "").trim())
          .filter(Boolean);
      }
    }
    str = str.replace(/^["']|["']$/g, "").trim();
    return str ? [str] : [];
  }
  return [String(val)];
}

function normalizarTextoEstado(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function obtenerCoordenadasPorEstado(estadoNombre, id = "1") {
  const norm = normalizarTextoEstado(estadoNombre);
  const base = COORDENADAS_ESTADOS[norm] || COORDENADAS_ESTADOS["ciudad de mexico"];
  let seed = 0;
  const strId = String(id || "1");
  for (let i = 0; i < strId.length; i++) seed += strId.charCodeAt(i);
  return {
    lat: base.lat + ((seed % 20) - 10) * 0.003,
    lng: base.lng + (((seed * 3) % 20) - 10) * 0.003,
  };
}

function esScianValido(codigo) {
  if (!codigo) return false;
  return /^\d{2,6}$/.test(String(codigo).trim());
}

async function transformarDatosPython(datosPython) {
  if (!datosPython) return [];

  const empresas = [];
  const todosLosCodigos = [
    ...(datosPython.top_clientes || []).map((c) => c.codigo),
    ...(datosPython.top_proveedores || []).map((p) => p.codigo),
  ];

  let empresasReales = [];
  if (todosLosCodigos.length > 0) {
    try {
      const codigosUnicos = [...new Set(todosLosCodigos)];
      const response = await api.get(
        `/empresas?sectorScian=${codigosUnicos.join(",")}`
      );
      empresasReales = response.data || [];
    } catch (e) {
      console.warn("Error obteniendo empresas reales:", e);
    }
  }

  const empresasPorScian = {};
  empresasReales.forEach((emp) => {
    if (!empresasPorScian[emp.sectorScian])
      empresasPorScian[emp.sectorScian] = [];
    empresasPorScian[emp.sectorScian].push(emp);
  });

  // SOLO AGREGAR EMPRESAS REALES
  const pushSector = (lista, tipo, prefixReal) => {
    (lista || []).forEach((item) => {
      const delSector = empresasPorScian[item.codigo] || [];

      if (delSector.length > 0) {
        delSector.forEach((empresa) => {
          // Normalización limpia de arrays
          const arrProductos = normalizarArray(empresa.productos);
          const arrServicios = normalizarArray(empresa.servicios);
          const arrCategoria = normalizarArray(item.categoria);

          const productosStr =
            arrProductos.length > 0
              ? arrProductos.join(", ")
              : (empresa.sectorScian || "No especificado");

          const serviciosStr =
            arrServicios.length > 0
              ? arrServicios.join(", ")
              : "No especificado";

          const categoriaStr =
            arrCategoria.length > 0
              ? arrCategoria.join(", ")
              : (typeof item.categoria === "string"
                  ? item.categoria.replace(/^\[|\]$/g, "").replace(/^["']|["']$/g, "").trim()
                  : "");

          const sectorStr = empresa.sectorScian || "No especificado";

          // Objeto empresaData normalizado para modals de comercio
          const empresaDataLimpia = {
            ...empresa,
            productos: arrProductos.length > 0 ? arrProductos : (productosStr !== "No especificado" ? [productosStr] : []),
            servicios: arrServicios,
            categoria: categoriaStr,
          };

          empresas.push({
            id: empresa.id,
            tipo,
            nombre: empresa.razonSocial || "Sin nombre",
            productos: productosStr,
            productosLista: arrProductos.length > 0 ? arrProductos : [productosStr],
            servicios: serviciosStr,
            serviciosLista: arrServicios,
            ciudad: empresa.estado || "Ciudad de México",
            estado: empresa.estado || "Ciudad de México",
            sector: sectorStr,
            ...obtenerCoordenadasPorEstado(empresa.estado, empresa.id),
            categoria: categoriaStr,
            porcentaje: item.porcentaje,
            coeficiente: item.coeficiente,
            codigoScian: item.codigo,
            esReal: true,
            empresaId: empresa.id,
            empresaData: empresaDataLimpia,
          });
        });
      }
    });
  };

  pushSector(datosPython.top_clientes, "Cliente", "RC");
  pushSector(datosPython.top_proveedores, "Proveedor", "RP");

  empresas.sort((a, b) => {
    if (a.esReal && !b.esReal) return -1;
    if (!a.esReal && b.esReal) return 1;
    return (b.porcentaje || 0) - (a.porcentaje || 0);
  });

  return empresas;
}

async function fetchMapaData() {
  let sectorScian = null;
  let empresaExiste = true;
  let infoMensaje = null;

  try {
    const empresaRes = await api.get("/empresas/mi-empresa");
    sectorScian = empresaRes.data?.sectorScian;
  } catch {
    empresaExiste = false;
  }

  let sectorAUsar = sectorScian;
  if (!empresaExiste) {
    sectorAUsar = "3111";
    infoMensaje = {
      tipo: "info",
      texto:
        "Aún no tienes empresa registrada. Mostrando ejemplo con sector 3111 (Alimentos para animales).",
    };
  } else if (!sectorScian) {
    sectorAUsar = "3111";
    infoMensaje = {
      tipo: "warning",
      texto:
        "Tu empresa no tiene un código SCIAN asignado. Mostrando ejemplo con sector 3111.",
    };
  } else if (!esScianValido(sectorScian)) {
    sectorAUsar = "3111";
    infoMensaje = {
      tipo: "warning",
      texto: `El código SCIAN "${sectorScian}" no es válido. Mostrando ejemplo con sector 3111.`,
    };
  }

  let datosPython;
  try {
    datosPython = await obtenerRecomendaciones(sectorAUsar, 10);
  } catch (err) {
    if (String(err.message || "").includes("no encontrado")) {
      infoMensaje = {
        tipo: "warning",
        texto: `El sector "${sectorAUsar}" no está en el sistema. Mostrando ejemplo con sector 3111.`,
      };
      sectorAUsar = "3111";
      datosPython = await obtenerRecomendaciones("3111", 10);
    } else {
      throw err;
    }
  }

  const empresas = await transformarDatosPython(datosPython);

  const catLimpia = normalizarArray(datosPython.categoria).join(", ") || datosPython.categoria || "";

  return {
    empresas,
    sectorInfo: {
      codigo: datosPython.codigo,
      nombre: datosPython.sector,
      categoria: catLimpia,
    },
    infoMensaje,
  };
}

export function useMapaRecomendaciones() {
  return useQuery({
    queryKey: ["mapa-recomendaciones"],
    queryFn: fetchMapaData,
    staleTime: 1000 * 60 * 10, // 10 min
    gcTime: 1000 * 60 * 60, // 1 hora
  });
}