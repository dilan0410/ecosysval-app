// src/pages/MapaPage.jsx
/**
 * MAPA / POSICIÓN EN EL SISTEMA (ECOSYSVAL)
 * --------------------------------------------------------------------
 * i18n al 100% + React Query + geolocalización 32 estados
 */

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { useMapaRecomendaciones } from "../hooks/useMapaRecomendaciones";

// ==========================================================
// COORDENADAS por estado
// ==========================================================
const COORDENADAS_ESTADOS = {
  "aguascalientes": { lat: 21.8818, lng: -102.2915 },
  "baja california": { lat: 30.8406, lng: -115.2838 },
  "baja california sur": { lat: 26.0444, lng: -111.1666 },
  "campeche": { lat: 19.8301, lng: -90.5349 },
  "chiapas": { lat: 16.7569, lng: -93.1292 },
  "chihuahua": { lat: 28.6320, lng: -106.0691 },
  "ciudad de mexico": { lat: 19.4326, lng: -99.1332 },
  "cdmx": { lat: 19.4326, lng: -99.1332 },
  "df": { lat: 19.4326, lng: -99.1332 },
  "distrito federal": { lat: 19.4326, lng: -99.1332 },
  "coahuila": { lat: 27.0587, lng: -101.7068 },
  "coahuila de zaragoza": { lat: 27.0587, lng: -101.7068 },
  "colima": { lat: 19.2452, lng: -103.7241 },
  "durango": { lat: 24.0277, lng: -104.6532 },
  "estado de mexico": { lat: 19.3235, lng: -99.5694 },
  "mexico": { lat: 19.3235, lng: -99.5694 },
  "edomex": { lat: 19.3235, lng: -99.5694 },
  "guanajuato": { lat: 21.0190, lng: -101.2574 },
  "guerrero": { lat: 17.5516, lng: -99.5010 },
  "hidalgo": { lat: 20.0911, lng: -98.7624 },
  "jalisco": { lat: 20.6597, lng: -103.3496 },
  "michoacan": { lat: 19.1687, lng: -101.8996 },
  "michoacan de ocampo": { lat: 19.1687, lng: -101.8996 },
  "morelos": { lat: 18.7305, lng: -99.0660 },
  "nayarit": { lat: 21.7514, lng: -104.8455 },
  "nuevo leon": { lat: 25.5922, lng: -99.9962 },
  "oaxaca": { lat: 17.0732, lng: -96.7266 },
  "puebla": { lat: 19.0414, lng: -98.2063 },
  "queretaro": { lat: 20.5881, lng: -100.3899 },
  "quintana roo": { lat: 19.1817, lng: -88.4791 },
  "san luis potosi": { lat: 22.1565, lng: -100.9855 },
  "sinaloa": { lat: 25.1721, lng: -107.4795 },
  "sonora": { lat: 29.2972, lng: -110.3309 },
  "tabasco": { lat: 17.9869, lng: -92.9303 },
  "tamaulipas": { lat: 24.2669, lng: -98.8363 },
  "tlaxcala": { lat: 19.3139, lng: -98.2404 },
  "veracruz": { lat: 19.1738, lng: -96.1342 },
  "veracruz de ignacio de la llave": { lat: 19.1738, lng: -96.1342 },
  "yucatan": { lat: 20.7099, lng: -89.0943 },
  "zacatecas": { lat: 22.7709, lng: -102.5832 },
};

function normalizarTextoEstado(str) {
  if (!str) return "";
  return String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function obtenerCoordenadasPorEstado(estadoNombre, id = "1") {
  const norm = normalizarTextoEstado(estadoNombre);
  const baseCoords = COORDENADAS_ESTADOS[norm] || COORDENADAS_ESTADOS["ciudad de mexico"];
  let seed = 0;
  const strId = String(id || "1");
  for (let i = 0; i < strId.length; i++) seed += strId.charCodeAt(i);
  const offsetLat = ((seed % 20) - 10) * 0.003;
  const offsetLng = (((seed * 3) % 20) - 10) * 0.003;
  return { lat: baseCoords.lat + offsetLat, lng: baseCoords.lng + offsetLng };
}

// Mock fallback
const empresasMock = [
  {
    id: "0000123",
    tipo: "Cliente",
    nombre: "Maderas del Centro",
    productos: "Madera",
    servicios: null,
    ciudad: "Ciudad de México",
    estado: "Ciudad de México",
    ...obtenerCoordenadasPorEstado("Ciudad de México", "0000123"),
  },
  {
    id: "0000124",
    tipo: "Proveedor",
    nombre: "Transporte del Sur",
    productos: "Madera",
    servicios: "Transporte",
    ciudad: "Chiapas",
    estado: "Chiapas",
    ...obtenerCoordenadasPorEstado("Chiapas", "0000124"),
  },
];

// Beneficios con CLAVES i18n
const beneficiosNiveles = [
  { titleKey: "benefits.b1_title", tier: "standard", detailKey: "benefits.b1_detail" },
  { titleKey: "benefits.b2_title", tier: "standard", detailKey: "benefits.b2_detail" },
  { titleKey: "benefits.b3_title", tier: "standard", detailKey: "benefits.b3_detail" },
  { titleKey: "benefits.b4_title", tier: "platinum", detailKey: "benefits.b4_detail" },
  { titleKey: "benefits.b5_title", tier: "platinum", detailKey: "benefits.b5_detail" },
  { titleKey: "benefits.b6_title", tier: "platinum", detailKey: "benefits.b6_detail" },
  { titleKey: "benefits.b7_title", tier: "platinum", detailKey: "benefits.b7_detail" },
  { titleKey: "benefits.b8_title", tier: "black", detailKey: "benefits.b8_detail" },
  { titleKey: "benefits.b9_title", tier: "black", detailKey: "benefits.b9_detail" },
  { titleKey: "benefits.b10_title", tier: "black", detailKey: "benefits.b10_detail" },
  { titleKey: "benefits.b11_title", tier: "black", detailKey: "benefits.b11_detail" },
];

// ==========================================================
// MapaPage
// ==========================================================
export default function MapaPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [viewMode, setViewMode] = useState("map");
  const [filterTipo, setFilterTipo] = useState("Ambos");
  const [search, setSearch] = useState("");
  const [openBenefitIndex, setOpenBenefitIndex] = useState(null);

  const {
    data,
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch,
  } = useMapaRecomendaciones();

  const empresasReales = data?.empresas || [];
  const sectorInfo = data?.sectorInfo || null;
  const infoMensaje = data?.infoMensaje || null;
  const error = queryError ? queryError.message || t("map.demoBody") : null;

  const listaBase = empresasReales.length > 0 ? empresasReales : error ? empresasMock : [];

  const comprasRealizadas = 1;
  const ventasRealizadas = 2;
  const restantesPlatino = 2;

  const empresasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();
    return listaBase.filter((e) => {
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
  }, [filterTipo, search, listaBase]);

  const sociosPotenciales = empresasFiltradas.length;

  const handleConectar = (empresa) => {
    const ownerId = empresa?.empresaData?.userId || empresa?.empresaData?.usuarioId || null;
    if (empresa.esReal && ownerId) {
      navigate(`/mensajes?userId=${ownerId}`);
      return;
    }
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
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-5 py-4">
            <h1 className="text-text font-extrabold text-lg md:text-xl">{t("map.title")}</h1>
            <p className="text-muted text-sm mt-1 max-w-2xl">{t("map.subtitle")}</p>
            {sectorInfo && !loading && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-muted">{t("map.analyzing")}</span>
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
              <span className="text-sm text-muted">{t("map.results")}:</span>
              <span className="text-sm font-extrabold text-accent">{sociosPotenciales}</span>
            </div>

            <div className="inline-flex rounded-full border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-1">
              <button
                onClick={() => setViewMode("map")}
                type="button"
                className={`px-4 py-2 text-sm rounded-full transition inline-flex items-center gap-2 ${
                  viewMode === "map" ? "bg-accent text-slate-900 font-semibold" : "text-text hover:bg-surface"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                {t("map.viewMap")}
              </button>
              <button
                onClick={() => setViewMode("list")}
                type="button"
                className={`px-4 py-2 text-sm rounded-full transition inline-flex items-center gap-2 ${
                  viewMode === "list" ? "bg-accent text-slate-900 font-semibold" : "text-text hover:bg-surface"
                }`}
              >
                <ListIcon className="w-4 h-4" />
                {t("map.viewList")}
              </button>
            </div>
          </div>
        </div>

        {/* Banner error */}
        {error && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-300">{t("map.demoTitle")}</p>
              <p className="text-xs text-amber-200/80 mt-1">{t("map.demoBody")} {error}</p>
              <button
                onClick={() => refetch()}
                className="mt-2 text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 transition"
              >
                {t("common.retry")}
              </button>
            </div>
          </div>
        )}

        {/* Banner info/warning */}
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
                {infoMensaje.tipo === "warning" ? t("map.warning") : t("map.info")}
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
          <StatCard icon={ShoppingCart} value={comprasRealizadas} label={t("map.purchases")} />
          <StatCard icon={Handshake} value={ventasRealizadas} label={t("map.sales")} />
          <StatCard icon={Lock} value={restantesPlatino} label={t("map.platinumLeft")} compact />
          <StatCard icon={Users} value={sociosPotenciales} label={t("map.potentialPartners")} highlight />
        </div>

        {/* BUSCADOR + CHIPS */}
        <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-muted absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder={t("map.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full pl-11 pr-4 py-2.5 text-sm bg-surface/60 border border-border text-text placeholder:text-muted/70 outline-none backdrop-blur-md appearance-none bg-clip-padding transition focus:ring-2 focus:ring-ring/40 focus:border-accent/30"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip label={t("map.client")} active={filterTipo === "Cliente"} onClick={() => setFilterTipo("Cliente")} />
              <Chip label={t("map.provider")} active={filterTipo === "Proveedor"} onClick={() => setFilterTipo("Proveedor")} />
              <Chip label={t("map.both")} active={filterTipo === "Ambos"} onClick={() => setFilterTipo("Ambos")} />
            </div>
          </div>
        </div>

        {isFetching && data && (
          <div className="mb-3 text-[11px] text-muted">{t("map.updating")}</div>
        )}

        {/* Loading state */}
        {loading && !data ? (
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <p className="text-text font-semibold">{t("map.loadingTitle")}</p>
            <p className="text-muted text-sm">{t("map.loadingSub")}</p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            {viewMode === "map" && (
              <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-text font-bold">{t("map.mapTitle")}</h2>
                    <p className="text-muted text-xs">{t("map.mapHint")}</p>
                  </div>
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
                    <h2 className="text-text font-bold">{t("map.listTitle")}</h2>
                    <p className="text-muted text-xs">{t("map.listHint")}</p>
                  </div>
                  <span className="text-[11px] text-accent border border-accent/25 bg-accent/10 rounded-full px-3 py-1">
                    {sociosPotenciales} {t("map.results").toLowerCase()}
                  </span>
                </div>
                <div className="p-4 pr-2 max-h-[560px] overflow-y-auto">
                  <ListaEmpresas empresas={empresasFiltradas} onConectar={handleConectar} theme={theme} t={t} />
                </div>
              </section>
            )}
          </div>
        )}

        {/* BENEFICIOS */}
        <section className="mt-8">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-text font-extrabold text-lg md:text-xl">{t("map.benefits")}</h2>
              <p className="text-muted text-sm">{t("benefits.subtitle")}</p>
            </div>
            <span className="text-[11px] text-muted border border-border bg-surface/50 rounded-full px-3 py-1">
              {t("benefits.tiersLabel")}
            </span>
          </div>

          <div className="space-y-3">
            {beneficiosNiveles.map((b, idx) => {
              const open = openBenefitIndex === idx;
              return (
                <AccordionItem
                  key={idx}
                  title={t(b.titleKey)}
                  detail={t(b.detailKey)}
                  tier={b.tier}
                  open={open}
                  onToggle={() => setOpenBenefitIndex(open ? null : idx)}
                  theme={theme}
                  t={t}
                />
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}

/* ==========================================
   UI COMPONENTS
   ========================================== */

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
        <div className={`font-extrabold ${compact ? "text-2xl" : "text-3xl"} ${highlight ? "text-accent" : "text-text"}`}>
          {value}
        </div>
        <div className={`text-xs sm:text-sm ${highlight ? "text-text/85" : "text-muted"} truncate`}>{label}</div>
      </div>
    </div>
  );
}

function ListaEmpresas({ empresas, onConectar, theme, t }) {
  if (!empresas.length) {
    return <div className="p-10 text-center text-muted">{t("map.noResults")}</div>;
  }

  return (
    <div className="grid gap-4">
      {empresas.map((e) => (
        <div key={e.id} className="rounded-2xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-muted">ID: {e.id}</span>
                <span className={tipoPill(theme, e.tipo)}>
                  {e.tipo === "Cliente" ? t("map.client") : t("map.provider")}
                </span>

                {e.esReal ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                    {t("map.registered")}
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/25">
                    {t("map.recommended")}
                  </span>
                )}

                {e.categoria && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/25">
                    {e.categoria}
                  </span>
                )}

                {e.porcentaje !== undefined && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                    {e.porcentaje}% {t("map.relation")}
                  </span>
                )}
              </div>

              <h3 className="mt-1 font-semibold text-text truncate">{e.nombre}</h3>

              <p className="text-sm text-text/80 mt-1">
                <span className="text-muted">{t("map.sector")}:</span> {e.productos}
              </p>

              {e.servicios && (
                <p className="text-sm text-text/80">
                  <span className="text-muted">{t("map.category")}:</span> {e.servicios}
                </p>
              )}

              <p className="text-sm text-muted mt-1">{e.ciudad} • {e.estado}</p>
            </div>

            <button
              onClick={() => onConectar?.(e)}
              type="button"
              className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900 shadow-pro hover:brightness-95 transition"
            >
              {t("map.connect")}
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
    return `${base} ${isLight ? "bg-emerald-500/10 text-emerald-800 border-emerald-400/25" : "bg-emerald-500/10 text-emerald-200 border-emerald-400/20"}`;
  }
  return `${base} ${isLight ? "bg-sky-500/10 text-sky-800 border-sky-400/25" : "bg-sky-500/10 text-sky-200 border-sky-400/20"}`;
}

function AccordionItem({ title, detail, tier, open, onToggle, theme, t }) {
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
              {t("benefits.levelLabel")}: {tierLabel(tier, t)}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 text-sm text-text/80">
          <div className="rounded-xl border border-border bg-surface/50 p-3">
            {detail || t("benefits.noDetail")}
          </div>
        </div>
      )}
    </div>
  );
}

function tierLabel(tier, t) {
  if (tier === "standard") return t("benefits.tierStandard");
  if (tier === "platinum") return t("benefits.tierPlatinum");
  return t("benefits.tierBlack");
}

function getTierStyles(tier, theme) {
  const isLight = theme === "light";
  if (tier === "standard") {
    return {
      pill: isLight ? "bg-sky-500/10 text-sky-800 border-sky-400/25" : "bg-sky-500/10 text-sky-200 border-sky-400/20",
      bar: "bg-surface/50 border-border",
    };
  }
  if (tier === "platinum") {
    return {
      pill: isLight ? "bg-amber-500/10 text-amber-900 border-amber-400/25" : "bg-amber-500/10 text-amber-200 border-amber-400/20",
      bar: "bg-surface/50 border-border",
    };
  }
  return {
    pill: isLight ? "bg-slate-500/10 text-slate-800 border-slate-400/25" : "bg-slate-500/10 text-slate-200 border-slate-300/25",
    bar: "bg-surface/50 border-border",
  };
}