// src/pages/MapaPage.jsx
/**
 * mapa / posicion en el sistema (ECOSYSVAL)
 * --------------------------------------------------------------------
 * Objetivo:
 * - Visualizar socios potenciales recomendados por el Sistema Inteligente
 * - Datos reales desde API Python (MIP 2013 + Clasificación 2024)
 * - Fallback a mock si la API está caída
 */

import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  ChevronDown,
  Map as MapIcon,
  List as ListIcon,
  Users,
  ShoppingCart,
  Handshake,
  Search,
  Loader2, 
  AlertCircle,
} from "lucide-react";

import Mapa from "../components/Mapa";
import Layout from "../components/Layout";
import { useTheme } from "../components/ThemeProvider";

// Imports para conectar con API Python + axios
import { obtenerRecomendaciones } from "../api/pythonAPI";
import { api } from "../api/axiosClient";

// ==========================================================
// DICCIONARIO DE COORDENADAS POR ESTADO (MÉXICO)
// ==========================================================
const COORDENADAS_ESTADOS = {
  "Aguascalientes": { lat: 21.8818, lng: -102.2915 },
  "Baja California": { lat: 30.8406, lng: -115.2838 },
  "Baja California Sur": { lat: 26.0444, lng: -111.1666 },
  "Campeche": { lat: 19.8301, lng: -90.5349 },
  "Coahuila de Zaragoza": { lat: 27.0587, lng: -101.7068 },
  "Colima": { lat: 19.2452, lng: -103.7241 },
  "Chiapas": { lat: 16.7569, lng: -93.1292 },
  "Chihuahua": { lat: 28.6320, lng: -106.0691 },
  "Ciudad de México": { lat: 19.4326, lng: -99.1332 },
  "Durango": { lat: 24.0277, lng: -104.6532 },
  "Guanajuato": { lat: 21.0190, lng: -101.2574 },
  "Guerrero": { lat: 17.5516, lng: -99.5010 },
  "Hidalgo": { lat: 20.0911, lng: -98.7624 },
  "Jalisco": { lat: 20.6597, lng: -103.3496 },
  "México": { lat: 19.3235, lng: -99.5694 },
  "Michoacán de Ocampo": { lat: 19.1687, lng: -101.8996 },
  "Morelos": { lat: 18.7305, lng: -99.0660 },
  "Nayarit": { lat: 21.7514, lng: -104.8455 },
  "Nuevo León": { lat: 25.5922, lng: -99.9962 },
  "Oaxaca": { lat: 17.0732, lng: -96.7266 },
  "Puebla": { lat: 19.0414, lng: -98.2063 },
  "Querétaro": { lat: 20.5881, lng: -100.3899 },
  "Quintana Roo": { lat: 19.1817, lng: -88.4791 },
  "San Luis Potosí": { lat: 22.1565, lng: -100.9855 },
  "Sinaloa": { lat: 25.1721, lng: -107.4795 },
  "Sonora": { lat: 29.2972, lng: -110.3309 },
  "Tabasco": { lat: 17.9869, lng: -92.9303 },
  "Tamaulipas": { lat: 24.2669, lng: -98.8363 },
  "Tlaxcala": { lat: 19.3139, lng: -98.2404 },
  "Veracruz de Ignacio de la Llave": { lat: 19.1738, lng: -96.1342 },
  "Yucatán": { lat: 20.7099, lng: -89.0943 },
  "Zacatecas": { lat: 22.7709, lng: -102.5832 },
};

// ==========================================================
// FALLBACK: Datos mock si la API falla
// ==========================================================
const empresasMock = [
  {
    id: "0000123",
    tipo: "Cliente",
    nombre: "Maderas del Centro",
    productos: "Madera",
    servicios: null,
    ciudad: "Ciudad de México",
    estado: "Ciudad de México",
    ...COORDENADAS_ESTADOS["Ciudad de México"],
  },
  {
    id: "0000124",
    tipo: "Proveedor",
    nombre: "Transporte del Sur",
    productos: "Madera",
    servicios: "Transporte",
    ciudad: "Chiapas",
    estado: "Chiapas",
    ...COORDENADAS_ESTADOS["Chiapas"],
  },
];

const beneficiosNiveles = [
  { title: "Perfil empresarial descargable", tier: "standard", detail: "Descarga un PDF con datos clave, actividad y capacidades." },
  { title: "Identificación de socios comerciales", tier: "standard", detail: "Encuentra aliados por sector, ubicación y capacidad." },
  { title: "Integración a cadenas de valor", tier: "standard", detail: "Conecta roles cliente/proveedor para aumentar eficiencia." },
  { title: "Propuestas comerciales con especificaciones técnicas", tier: "platinum", detail: "Genera propuestas formales con requerimientos técnicos." },
  { title: "Transacciones de compra y venta", tier: "platinum", detail: "Compra/venta dentro del ecosistema con trazabilidad." },
  { title: "Coaching", tier: "platinum", detail: "Acompañamiento para cierre comercial y crecimiento." },
  { title: "Sistema de crecimiento", tier: "platinum", detail: "Seguimiento a metas, desempeño y escalamiento." },
  { title: "Recompensas", tier: "black", detail: "Beneficios por actividad y desempeño dentro del sistema." },
  { title: "Networking", tier: "black", detail: "Acceso a red premium y encuentros con tomadores de decisión." },
  { title: "Financiamiento", tier: "black", detail: "Opciones de financiación e intermediación según perfil." },
  { title: "Desarrollo Organizacional Sustentable", tier: "black", detail: "Programas para sostenibilidad, cultura y desempeño." },
];

/**
 * Obtiene coordenadas basadas en el estado, aplicando una micro-dispersion
 * para que los pines no queden unos exactamente encima de otros.
 */
function obtenerCoordenadasPorEstado(estadoNombre) {
  const baseCoords = COORDENADAS_ESTADOS[estadoNombre] || COORDENADAS_ESTADOS["Ciudad de México"];
  // Variación aleatoria de aprox. 2-5 km a la redonda
  const offsetLat = (Math.random() - 0.5) * 0.05;
  const offsetLng = (Math.random() - 0.5) * 0.05;
  
  return {
    lat: baseCoords.lat + offsetLat,
    lng: baseCoords.lng + offsetLng,
  };
}

async function transformarDatosPython(datosPython, apiClient) {
  if (!datosPython) return [];

  const empresas = [];
  const todosLosCodigos = [
    ...(datosPython.top_clientes || []).map(c => c.codigo),
    ...(datosPython.top_proveedores || []).map(p => p.codigo),
  ];

  let empresasReales = [];
  if (todosLosCodigos.length > 0) {
    try {
      const codigosUnicos = [...new Set(todosLosCodigos)];
      const codigosString = codigosUnicos.join(',');
      const response = await apiClient.get(`/empresas?sectorScian=${codigosString}`);
      empresasReales = response.data || [];
    } catch (error) {
      console.warn('Error obteniendo empresas reales:', error);
    }
  }

  const empresasPorScian = {};
  empresasReales.forEach(emp => {
    if (!empresasPorScian[emp.sectorScian]) {
      empresasPorScian[emp.sectorScian] = [];
    }
    empresasPorScian[emp.sectorScian].push(emp);
  });

  // Procesar clientes
  (datosPython.top_clientes || []).forEach((cliente) => {
    const empresasDelSector = empresasPorScian[cliente.codigo] || [];

    if (empresasDelSector.length > 0) {
      empresasDelSector.forEach((empresa) => {
        empresas.push({
          id: `RC-${empresa.id}`,
          tipo: "Cliente",
          nombre: empresa.razonSocial || "Sin nombre",
          productos: `SCIAN ${empresa.sectorScian}`,
          servicios: cliente.categoria,
          ciudad: empresa.estado || "Ciudad de México",
          estado: empresa.estado || "Ciudad de México",
          ...obtenerCoordenadasPorEstado(empresa.estado), // <- ubicacion real
          categoria: cliente.categoria,
          porcentaje: cliente.porcentaje,
          coeficiente: cliente.coeficiente,
          codigoScian: cliente.codigo,
          esReal: true,
          empresaId: empresa.id,
          empresaData: empresa,
        });
      });
    } else {
      // Sector teórico (no hay empresa real)
      empresas.push({
        id: `TC-${cliente.codigo}`,
        tipo: "Cliente",
        nombre: cliente.sector.split(" - ")[1] || cliente.sector,
        productos: `SCIAN ${cliente.codigo}`,
        servicios: cliente.categoria,
        ciudad: "México",
        estado: "Sector Recomendado",
        ...obtenerCoordenadasPorEstado("Ciudad de México"), // Los teoricos van al centro
        categoria: cliente.categoria,
        porcentaje: cliente.porcentaje,
        coeficiente: cliente.coeficiente,
        codigoScian: cliente.codigo,
        esReal: false,
      });
    }
  });

  // Procesar proveedores
  (datosPython.top_proveedores || []).forEach((proveedor) => {
    const empresasDelSector = empresasPorScian[proveedor.codigo] || [];

    if (empresasDelSector.length > 0) {
      empresasDelSector.forEach((empresa) => {
        empresas.push({
          id: `RP-${empresa.id}`,
          tipo: "Proveedor",
          nombre: empresa.razonSocial || "Sin nombre",
          productos: `SCIAN ${empresa.sectorScian}`,
          servicios: proveedor.categoria,
          ciudad: empresa.estado || "Ciudad de México",
          estado: empresa.estado || "Ciudad de México",
          ...obtenerCoordenadasPorEstado(empresa.estado), // <- ubicacion real
          categoria: proveedor.categoria,
          porcentaje: proveedor.porcentaje,
          coeficiente: proveedor.coeficiente,
          codigoScian: proveedor.codigo,
          esReal: true,
          empresaId: empresa.id,
          empresaData: empresa,
        });
      });
    } else {
      empresas.push({
        id: `TP-${proveedor.codigo}`,
        tipo: "Proveedor",
        nombre: proveedor.sector.split(" - ")[1] || proveedor.sector,
        productos: `SCIAN ${proveedor.codigo}`,
        servicios: proveedor.categoria,
        ciudad: "México",
        estado: "Sector Recomendado",
        ...obtenerCoordenadasPorEstado("Ciudad de México"),
        categoria: proveedor.categoria,
        porcentaje: proveedor.porcentaje,
        coeficiente: proveedor.coeficiente,
        codigoScian: proveedor.codigo,
        esReal: false,
      });
    }
  });

  empresas.sort((a, b) => {
    if (a.esReal && !b.esReal) return -1;
    if (!a.esReal && b.esReal) return 1;
    return b.porcentaje - a.porcentaje;
  });

  return empresas;
}

// ==========================================================
// MapaPage - Componente principal
// ==========================================================
export default function MapaPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // ==========================================================
  // STATE UI
  // ==========================================================
  const [viewMode, setViewMode] = useState("map");
  const [filterTipo, setFilterTipo] = useState("Ambos");
  const [search, setSearch] = useState("");
  const [openBenefitIndex, setOpenBenefitIndex] = useState(null);

  // ==========================================================
  // State para datos de la API Python
  // ==========================================================
  const [empresasReales, setEmpresasReales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectorInfo, setSectorInfo] = useState(null);
  const [infoMensaje, setInfoMensaje] = useState(null);

  // ==========================================================
  // Cargar recomendaciones al montar el componente
  // ==========================================================
  useEffect(() => {
    cargarRecomendaciones();
  }, []);

  async function cargarRecomendaciones() {
    setLoading(true);
    setError(null);
    setInfoMensaje(null); // limpiar mensaje info

    try {
      // ============================================
      // 1. OBTENER EMPRESA DEL USUARIO
      // ============================================
      let sectorScian = null;
      let empresaExiste = true;

      try {
        const empresaRes = await api.get("/empresas/mi-empresa");
        sectorScian = empresaRes.data?.sectorScian;
      } catch (err) {
        // El usuario NO tiene empresa registrada
        empresaExiste = false;
        console.warn("Usuario sin empresa registrada");
      }

      // ============================================
      // 2. VALIDAR SECTOR SCIAN
      // ============================================
      // Reglas del SCIAN válido:
      // - Debe existir (no null, no undefined, no vacío)
      // - Debe ser numérico
      // - Debe tener entre 2 y 6 dígitos (SCIAN oficial)
      const esScianValido = (codigo) => {
        if (!codigo) return false;
        const str = String(codigo).trim();
        return /^\d{2,6}$/.test(str);
      };

      let sectorAUsar = sectorScian;
      let mensajeInfo = null;

      // Caso 1: No tiene empresa
      if (!empresaExiste) {
        sectorAUsar = "3111";
        mensajeInfo = {
          tipo: "info",
          texto: "Aún no tienes empresa registrada. Mostrando ejemplo con sector 3111 (Alimentos para animales)."
        };
      }
      // Caso 2: Empresa sin SCIAN
      else if (!sectorScian) {
        sectorAUsar = "3111";
        mensajeInfo = {
          tipo: "warning",
          texto: "Tu empresa no tiene un código SCIAN asignado. Mostrando ejemplo con sector 3111."
        };
      }
      // Caso 3: SCIAN inválido (no numérico o formato incorrecto)
      else if (!esScianValido(sectorScian)) {
        sectorAUsar = "3111";
        mensajeInfo = {
          tipo: "warning",
          texto: `El código SCIAN "${sectorScian}" no es válido. Mostrando ejemplo con sector 3111. Por favor actualiza tu perfil.`
        };
      }
      // Caso 4: SCIAN válido pero podría no existir en la MIP

      // ============================================
      // 3. LLAMAR A LA API PYTHON
      // ============================================
      let datosPython;
      try {
        datosPython = await obtenerRecomendaciones(sectorAUsar, 10);
      } catch (err) {
        // El sector NO existe en la MIP
        if (err.message.includes("no encontrado")) {
          // Intentar con fallback "3111"
          console.warn(`Sector ${sectorAUsar} no existe en MIP. Usando fallback 3111.`);
          mensajeInfo = {
            tipo: "warning",
            texto: `El sector "${sectorAUsar}" no está registrado en el sistema. Mostrando ejemplo con sector 3111.`
          };
          sectorAUsar = "3111";
          datosPython = await obtenerRecomendaciones("3111", 10);
        } else {
          // Otro tipo de error (red, servidor caído, etc.)
          throw err;
        }
      }

      // ============================================
      // 4. TRANSFORMAR Y GUARDAR
      // ============================================
      // es async y recibe el apiClient
      const empresasTransformadas = await transformarDatosPython(datosPython, api);

      setEmpresasReales(empresasTransformadas);
      setSectorInfo({
        codigo: datosPython.codigo,
        nombre: datosPython.sector,
        categoria: datosPython.categoria,
      });
      setInfoMensaje(mensajeInfo);
    } catch (err) {
      // Error grave: API caída, sin conexión, etc.
      console.error("Error crítico cargando recomendaciones:", err);
      setError(err.message || "No se pudieron cargar las recomendaciones");
      setEmpresasReales(empresasMock); // Fallback a mock
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // STATS
  // ==========================================================
  const comprasRealizadas = 1;
  const ventasRealizadas = 2;
  const restantesPlatino = 2;

  // ==========================================================
  // FILTRO + SEARCH (ahora usa empresasReales en vez de empresasMock)
  // ==========================================================
  const empresasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    return empresasReales.filter((e) => {
      const coincideTipo = filterTipo === "Ambos" ? true : e.tipo === filterTipo;

      const coincideSearch =
        !term ||
        (e.nombre || "").toLowerCase().includes(term) ||
        (e.productos || "").toLowerCase().includes(term) ||
        (e.servicios || "").toLowerCase().includes(term) ||
        (e.ciudad || "").toLowerCase().includes(term) ||
        (e.estado || "").toLowerCase().includes(term) ||
        (e.categoria || "").toLowerCase().includes(term);

      return coincideTipo && coincideSearch;
    });
  }, [filterTipo, search, empresasReales]);

  const sociosPotenciales = empresasFiltradas.length;

  // ==========================================================
  // ACCIÓN: Conectar
  // ==========================================================
  const handleConectar = (empresa) => {
    // Si es una empresa real con dueño en el sistema, abrir mensajería
    const ownerId =
      empresa?.empresaData?.userId ||
      empresa?.empresaData?.usuarioId ||
      null;

    if (empresa.esReal && ownerId) {
      navigate(`/mensajes?userId=${ownerId}`);
      return;
    }

    // Fallback a formulario de comercio
    navigate(`/formulario-comercio/`, {
      state: {
        empresaId: empresa.id,
        nombre: empresa.nombre,
        tipo: empresa.tipo,
        productos: empresa.productos,
        servicios: empresa.servicios,
        ciudad: empresa.ciudad,
        estado: empresa.estado,
      },
    });
  };

  return (
    <Layout>
      <div>
        {/* ==========================================================
            HEADER DEL MÓDULO
           ========================================================== */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-5 py-4">
            <h1 className="text-text font-extrabold text-lg md:text-xl">
              Posición en el sistema
            </h1>
            <p className="text-muted text-sm mt-1 max-w-2xl">
              Visualiza socios potenciales en mapa o lista. Filtra por tipo, sector y ubicación.
            </p>

            {/* Info del sector analizado */}
            {sectorInfo && !loading && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-muted">Analizando sector:</span>
                <span className="font-semibold text-accent">{sectorInfo.nombre}</span>
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/25">
                  {sectorInfo.categoria}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-4 py-2">
              <Users className="w-4 h-4 text-muted" />
              <span className="text-sm text-muted">Resultados:</span>
              <span className="text-sm font-extrabold text-accent">{sociosPotenciales}</span>
            </div>

            {/* Toggle modo vista */}
            <div className="inline-flex rounded-full border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-1">
              <button
                onClick={() => setViewMode("map")}
                type="button"
                className={`px-4 py-2 text-sm rounded-full transition inline-flex items-center gap-2 ${
                  viewMode === "map"
                    ? "bg-accent text-slate-900 font-semibold"
                    : "text-text hover:bg-surface"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                Mapa
              </button>
              <button
                onClick={() => setViewMode("list")}
                type="button"
                className={`px-4 py-2 text-sm rounded-full transition inline-flex items-center gap-2 ${
                  viewMode === "list"
                    ? "bg-accent text-slate-900 font-semibold"
                    : "text-text hover:bg-surface"
                }`}
              >
                <ListIcon className="w-4 h-4" />
                Lista
              </button>
            </div>
          </div>
        </div>

        {/* Banner de error (si falla la API) */}
        {error && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-300">
                Usando datos de demostración
              </p>
              <p className="text-xs text-amber-200/80 mt-1">
                No se pudo conectar con el Sistema Inteligente Económico. {error}
              </p>
              <button
                onClick={cargarRecomendaciones}
                className="mt-2 text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 transition"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Banner de info/warning para SCIAN inválido */}
        {infoMensaje && !error && (
          <div className={`mb-4 rounded-2xl border p-4 flex items-start gap-3 ${
            infoMensaje.tipo === "warning"
              ? "border-yellow-500/30 bg-yellow-500/10"
              : "border-blue-500/30 bg-blue-500/10"
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              infoMensaje.tipo === "warning" ? "text-yellow-500" : "text-blue-500"
            }`} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                infoMensaje.tipo === "warning" ? "text-yellow-300" : "text-blue-300"
              }`}>
                {infoMensaje.tipo === "warning" ? "Aviso" : "Información"}
              </p>
              <p className={`text-xs mt-1 ${
                infoMensaje.tipo === "warning" ? "text-yellow-200/80" : "text-blue-200/80"
              }`}>
                {infoMensaje.texto}
              </p>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <StatCard icon={ShoppingCart} value={comprasRealizadas} label="Compras realizadas" />
          <StatCard icon={Handshake} value={ventasRealizadas} label="Ventas realizadas" />
          <StatCard icon={Lock} value={restantesPlatino} label="Restantes para rango Platino" compact />
          <StatCard icon={Users} value={sociosPotenciales} label="Socios potenciales (filtrados)" highlight />
        </div>

        {/* BUSCADOR + CHIPS FILTRO */}
        <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-muted absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por nombre, productos, servicios, ciudad, estado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={[
                  "w-full rounded-full pl-11 pr-4 py-2.5 text-sm",
                  "bg-surface/60 border border-border text-text placeholder:text-muted/70",
                  "outline-none backdrop-blur-md appearance-none bg-clip-padding transition",
                  "focus:ring-2 focus:ring-ring/40 focus:border-accent/30",
                ].join(" ")}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip label="Cliente" active={filterTipo === "Cliente"} onClick={() => setFilterTipo("Cliente")} />
              <Chip label="Proveedor" active={filterTipo === "Proveedor"} onClick={() => setFilterTipo("Proveedor")} />
              <Chip label="Ambos" active={filterTipo === "Ambos"} onClick={() => setFilterTipo("Ambos")} />
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <p className="text-text font-semibold">Analizando cadena de valor...</p>
            <p className="text-muted text-sm">Consultando MIP 2013 + Clasificación 2024</p>
          </div>
        ) : (
          /* LAYOUT PRINCIPAL (Mapa + Lista) */
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            {viewMode === "map" && (
              <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-text font-bold">Mapa de socios</h2>
                    <p className="text-muted text-xs">
                      Usa el zoom y selecciona empresas para ver ubicación.
                    </p>
                  </div>
                  <span className="text-[11px] text-muted border border-border bg-surface/50 rounded-full px-3 py-1">
                    Vista interactiva
                  </span>
                </div>

                <div className="p-4">
                  <div className="rounded-2xl overflow-hidden border border-border bg-surface/50">
                    <Mapa empresas={empresasFiltradas} zoom={5} />
                  </div>
                </div>
              </section>
            )}

            {(viewMode === "map" || viewMode === "list") && (
              <section
                className={`rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden ${
                  viewMode === "list" ? "xl:col-span-2" : ""
                }`}
              >
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-text font-bold">Socios potenciales</h2>
                    <p className="text-muted text-xs">
                      Filtrados por tu búsqueda y tipo seleccionado.
                    </p>
                  </div>
                  <span className="text-[11px] text-accent border border-accent/25 bg-accent/10 rounded-full px-3 py-1">
                    {sociosPotenciales} resultados
                  </span>
                </div>

                <div className="p-4 pr-2 max-h-[560px] overflow-y-auto">
                  <ListaEmpresas empresas={empresasFiltradas} onConectar={handleConectar} theme={theme} />
                </div>
              </section>
            )}
          </div>
        )}

        {/* BENEFICIOS (Accordion) - sin cambios */}
        <section className="mt-8">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-text font-extrabold text-lg md:text-xl">
                Beneficios del Ecosistema
              </h2>
              <p className="text-muted text-sm">
                Despliega cada beneficio para ver qué incluye y el nivel requerido.
              </p>
            </div>
            <span className="text-[11px] text-muted border border-border bg-surface/50 rounded-full px-3 py-1">
              Standard • Platinum • Black
            </span>
          </div>

          <div className="space-y-3">
            {beneficiosNiveles.map((b, idx) => {
              const open = openBenefitIndex === idx;
              return (
                <AccordionItem
                  key={idx}
                  title={b.title}
                  detail={b.detail}
                  tier={b.tier}
                  open={open}
                  onToggle={() => setOpenBenefitIndex(open ? null : idx)}
                  theme={theme}
                />
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}

/* ====================================================================
   UI COMPONENTS
   ==================================================================== */

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-4 py-2 rounded-full text-sm border transition ${
        active
          ? "bg-accent text-slate-900 border-accent font-semibold"
          : "bg-surface/50 text-text border-border hover:bg-surface"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ icon: Icon, value, label, compact = false, highlight = false }) {
  return (
    <div
      className={`rounded-3xl border backdrop-blur-xl shadow-pro p-4 flex items-center gap-3 min-w-0 ${
        highlight ? "bg-accent/10 border-accent/25" : "bg-surface/60 border-border"
      }`}
    >
      <div
        className={`shrink-0 h-11 w-11 rounded-2xl flex items-center justify-center border ${
          highlight
            ? "bg-accent/10 border-accent/25 text-accent"
            : "bg-surface/50 border-border text-muted"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={`font-extrabold ${compact ? "text-2xl" : "text-3xl"} ${
            highlight ? "text-accent" : "text-text"
          }`}
        >
          {value}
        </div>
        <div className={`text-xs sm:text-sm ${highlight ? "text-text/85" : "text-muted"} truncate`}>
          {label}
        </div>
      </div>
    </div>
  );
}

/**
 *  ListaEmpresas ahora muestra categoría y porcentaje
 */
function ListaEmpresas({ empresas, onConectar, theme }) {
  if (!empresas.length) {
    return <div className="p-10 text-center text-muted">No hay resultados con esos filtros.</div>;
  }

  return (
    <div className="grid gap-4">
      {empresas.map((e) => (
        <div
          key={e.id}
          className="rounded-2xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-muted">ID: {e.id}</span>
                <span className={tipoPill(theme, e.tipo)}>{e.tipo}</span>

                {/* Badge real vs teorico */}
                {e.esReal ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                    Empresa registrada
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/25">
                    Sector recomendado
                  </span>
                )}

                {/* Badge de categoría estratégica */}
                {e.categoria && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/25">
                    {e.categoria}
                  </span>
                )}

                {/* Porcentaje de relación */}
                {e.porcentaje !== undefined && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                    {e.porcentaje}% relación
                  </span>
                )}
              </div>

              <h3 className="mt-1 font-semibold text-text truncate">{e.nombre}</h3>

              <p className="text-sm text-text/80 mt-1">
                <span className="text-muted">Sector:</span> {e.productos}
              </p>

              {e.servicios && (
                <p className="text-sm text-text/80">
                  <span className="text-muted">Categoría:</span> {e.servicios}
                </p>
              )}

              <p className="text-sm text-muted mt-1">
                {e.ciudad} • {e.estado}
              </p>
            </div>

            <button
              onClick={() => onConectar?.(e)}
              type="button"
              className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900 shadow-pro hover:brightness-95 transition"
            >
              Conectar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function tipoPill(theme, tipo) {
  const isLight = theme === "light";
  const base = "text-[11px] px-2 py-0.5 rounded-full border";

  if (tipo === "Cliente") {
    return `${base} ${
      isLight
        ? "bg-emerald-500/10 text-emerald-800 border-emerald-400/25"
        : "bg-emerald-500/10 text-emerald-200 border-emerald-400/20"
    }`;
  }
  return `${base} ${
    isLight
      ? "bg-sky-500/10 text-sky-800 border-sky-400/25"
      : "bg-sky-500/10 text-sky-200 border-sky-400/20"
  }`;
}

function AccordionItem({ title, detail, tier, open, onToggle, theme }) {
  const styles = getTierStyles(tier, theme);

  return (
    <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-surface transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-9 w-9 rounded-xl border ${styles.bar} flex items-center justify-center`}>
            <Lock className="w-4 h-4 text-text" />
          </div>

          <div className="min-w-0 text-left">
            <div className="text-text font-semibold truncate">{title}</div>
            <div className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] ${styles.pill}`}>
              Nivel: {tierLabel(tier)}
            </div>
          </div>
        </div>

        <ChevronDown className={`w-5 h-5 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 text-sm text-text/80">
          <div className="rounded-xl border border-border bg-surface/50 p-3">
            {detail || "Detalle no disponible."}
          </div>
        </div>
      )}
    </div>
  );
}

function tierLabel(tier) {
  if (tier === "standard") return "STANDARD";
  if (tier === "platinum") return "PLATINO";
  return "BLACK";
}

function getTierStyles(tier, theme) {
  const isLight = theme === "light";

  if (tier === "standard") {
    return {
      pill: isLight
        ? "bg-sky-500/10 text-sky-800 border-sky-400/25"
        : "bg-sky-500/10 text-sky-200 border-sky-400/20",
      bar: "bg-surface/50 border-border",
    };
  }
  if (tier === "platinum") {
    return {
      pill: isLight
        ? "bg-amber-500/10 text-amber-900 border-amber-400/25"
        : "bg-amber-500/10 text-amber-200 border-amber-400/20",
      bar: "bg-surface/50 border-border",
    };
  }
  return {
    pill: isLight
      ? "bg-slate-500/10 text-slate-800 border-slate-400/25"
      : "bg-slate-500/10 text-slate-200 border-slate-300/25",
    bar: "bg-surface/50 border-border",
  };
}