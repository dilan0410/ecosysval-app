// src/pages/MapaPage.jsx
/**
 * MAPA / POSICIÓN EN EL SISTEMA (ECOSYSVAL)
 * --------------------------------------------------------------------
 * ✅ Objetivo:
 * - Visualizar empresas del ecosistema en 2 modos: Mapa y Lista.
 * - Filtrar por tipo (Cliente / Proveedor / Ambos).
 * - Buscar por: nombre, productos, servicios, ciudad, estado.
 * - Permitir "Conectar" con una empresa (navega al formulario-comercio).
 * - Mostrar métricas rápidas (compras/ventas/restantes/filtrados).
 * - Mostrar un Accordion con beneficios por nivel (Standard / Platino / Black).
 *
 * ✅ Importante (THEME):
 * - Esta vista es "theme-ready": usa tokens (bg-surface, text-text, border-border...)
 * - Dark es el default (según tu theme.css). Light aplica con .light en body/html.
 * - Evitamos hardcode de bg-black/white para que no se rompa en modo claro.
 * - El fondo (fondo.png) idealmente vive en un layout global, NO aquí.
 *
 * ✅ Ajuste visual (línea premium glass del proyecto):
 * - Panels con glass (bg-surface/60 + backdrop-blur).
 * - Buscador en glass (sin volverse blanco sólido).
 * - Pills de tipo (Cliente/Proveedor) adaptadas a theme.
 */

import React, { useMemo, useState } from "react";
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
} from "lucide-react";

import Mapa from "../components/Mapa";
import Layout from "../components/Layout";
import { useTheme } from "../components/ThemeProvider";

/**
 * Data mock (luego: backend)
 * - id: código o nit
 * - tipo: Cliente | Proveedor
 * - productos/servicios: strings demo
 * - lat/lng: coordenadas para mapa
 */
const empresasMock = [
  {
    id: "0000123",
    tipo: "Cliente",
    nombre: "Maderas del Centro",
    productos: "Madera",
    servicios: null,
    ciudad: "Ciudad de México",
    estado: "CDMX",
    lat: 19.4326,
    lng: -99.1332,
  },
  {
    id: "0000124",
    tipo: "Proveedor",
    nombre: "Transporte del Sur",
    productos: "Madera",
    servicios: "Transporte",
    ciudad: "Chiapas",
    estado: "Chiapas",
    lat: 16.751,
    lng: -93.1169,
  },
  {
    id: "0000125",
    tipo: "Proveedor",
    nombre: "Textiles Hidalgo",
    productos: "Textilería",
    servicios: null,
    ciudad: "Pachuca",
    estado: "Hidalgo",
    lat: 20.0911,
    lng: -98.7624,
  },
  {
    id: "0000126",
    tipo: "Cliente",
    nombre: "Acero del Pacífico",
    productos: "Acero",
    servicios: null,
    ciudad: "Guadalajara",
    estado: "Jalisco",
    lat: 20.6597,
    lng: -103.3496,
  },
];

/**
 * Beneficios por nivel (demo)
 * - tier: standard | platinum | black
 */
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
 * MapaPage
 * - Contiene filtros, buscador, modo vista, stats y accordion.
 */
export default function MapaPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // ==========================================================
  // STATE UI
  // ==========================================================
  const [viewMode, setViewMode] = useState("map");
  const [filterTipo, setFilterTipo] = useState("Ambos"); // Cliente | Proveedor | Ambos
  const [search, setSearch] = useState("");
  const [openBenefitIndex, setOpenBenefitIndex] = useState(null);

  // ==========================================================
  // STATS (demo)
  // ==========================================================
  const comprasRealizadas = 1;
  const ventasRealizadas = 2;
  const restantesPlatino = 2;

  // ==========================================================
  // FILTRO + SEARCH (client-side)
  // ==========================================================
  const empresasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    return empresasMock.filter((e) => {
      const coincideTipo = filterTipo === "Ambos" ? true : e.tipo === filterTipo;

      const coincideSearch =
        !term ||
        (e.nombre || "").toLowerCase().includes(term) ||
        (e.productos || "").toLowerCase().includes(term) ||
        (e.servicios || "").toLowerCase().includes(term) ||
        (e.ciudad || "").toLowerCase().includes(term) ||
        (e.estado || "").toLowerCase().includes(term);

      return coincideTipo && coincideSearch;
    });
  }, [filterTipo, search]);

  const sociosPotenciales = empresasFiltradas.length;

  // ==========================================================
  // ACCIÓN: Conectar (navega con state)
  // ==========================================================
  const handleConectar = (empresa) => {
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

  // ==========================================================
  // OVERLAY PREMIUM (theme-aware)
  // - No fijamos fondo aquí; asumimos layout global.
  // ==========================================================
  const tintCls = theme === "light" ? "bg-white/15" : "bg-black/10";

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

              {/* ==========================================================
                  STATS
                 ========================================================== */}
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                <StatCard icon={ShoppingCart} value={comprasRealizadas} label="Compras realizadas" />
                <StatCard icon={Handshake} value={ventasRealizadas} label="Ventas realizadas" />
                <StatCard icon={Lock} value={restantesPlatino} label="Restantes para rango Platino" compact />
                <StatCard icon={Users} value={sociosPotenciales} label="Socios potenciales (filtrados)" highlight />
              </div>

              {/* ==========================================================
                  BUSCADOR + CHIPS FILTRO
                 ========================================================== */}
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

              {/* ==========================================================
                  LAYOUT PRINCIPAL (Mapa + Lista)
                 ========================================================== */}
              <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                {/* Mapa */}
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

                {/* Lista */}
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

                    <div className="p-4 max-h-[560px] overflow-y-auto">
                      <ListaEmpresas empresas={empresasFiltradas} onConectar={handleConectar} theme={theme} />
                    </div>
                  </section>
                )}
              </div>

              {/* ==========================================================
                  BENEFICIOS (Accordion)
                 ========================================================== */}
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
   UI COMPONENTS (documentados)
   ==================================================================== */

/**
 * Chip (filtro tipo)
 * - active: usa acento (bg-accent)
 * - inactive: glass surface
 */
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

/**
 * StatCard
 * - highlight: resalta con acento (para "Socios potenciales").
 * - compact: reduce tamaño del número.
 */
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
 * ListaEmpresas
 * - Render de cards por empresa.
 * - Pill por tipo (Cliente / Proveedor) theme-aware.
 * - Botón Conectar: navega y pasa state.
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
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted">ID: {e.id}</span>
                <span className={tipoPill(theme, e.tipo)}>{e.tipo}</span>
              </div>

              <h3 className="mt-1 font-semibold text-text truncate">{e.nombre}</h3>

              <p className="text-sm text-text/80 mt-1">
                <span className="text-muted">Productos:</span> {e.productos}
              </p>

              {e.servicios && (
                <p className="text-sm text-text/80">
                  <span className="text-muted">Servicios:</span> {e.servicios}
                </p>
              )}

              <p className="text-sm text-muted mt-1">
                📍 {e.ciudad} • {e.estado}
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

/**
 * tipoPill
 * - Badge de Cliente/Proveedor con colores que no se pierden en light/dark.
 */
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

/**
 * AccordionItem
 * - Item expandible para beneficios por nivel.
 */
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

/**
 * Labels tier
 */
function tierLabel(tier) {
  if (tier === "standard") return "STANDARD";
  if (tier === "platinum") return "PLATINO";
  return "BLACK";
}

/**
 * getTierStyles
 * - Píldora y “bar” del icono según nivel + theme.
 */
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