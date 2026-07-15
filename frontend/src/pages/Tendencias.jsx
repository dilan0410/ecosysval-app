// ======================================================
// 📁 src/pages/Tendencias.jsx
// ------------------------------------------------------
// 📊 MÓDULO: Tendencias de mercado
// ------------------------------------------------------
// ¿Qué hace esta pantalla?
// - Detecta señales de demanda por país/sector/tipo y búsqueda
// - Calcula KPIs (demanda, no atendida, tendencias activas, score)
// - Muestra gráficos (línea por semana + barras ranking)
// - Lista "demanda no atendida" con acciones
// - Genera recomendaciones automáticas en base a topItem/sector/pais
//
// Notas:
// - Actualmente usa MOCK data (demandEventsMock / unmetDemandMock).
// - Preparado para theme tokens (light/dark) vía ThemeProvider.
// - Usa clases globales: bg-surface, text-text, border-border, shadow-pro, etc.
// ======================================================

import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";
import { useTheme } from "../components/ThemeProvider";

// ------------------------------------------------------
// 🎨 Iconografía UI
// ------------------------------------------------------
import {
  TrendingUp,
  Search,
  Filter,
  Sparkles,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  MapPin,
  Tag,
  BarChart3,
  LineChart as LineIcon,
  BadgeCheck,
  Lightbulb,
} from "lucide-react";

// ------------------------------------------------------
// 📈 Componentes Recharts (gráficas)
// ------------------------------------------------------
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

/* ---------------- Mock data (luego lo conectas a backend) ---------------- */

/**
 * Eventos de demanda (lo que están pidiendo empresas)
 * - cada registro representa una señal agregada por semana
 * - tendencia: valor 0..1 para estimar crecimiento
 */
const demandEventsMock = [
  // MX
  { id: 1, pais: "México", sector: "Construcción", item: "Madera de pino", tipo: "Producto", semana: "S1", count: 18, unidad: "m³", tendencia: 0.92 },
  { id: 2, pais: "México", sector: "Construcción", item: "Acero laminado", tipo: "Producto", semana: "S1", count: 10, unidad: "Ton", tendencia: 0.71 },
  { id: 3, pais: "México", sector: "Logística", item: "Transporte nacional", tipo: "Servicio", semana: "S1", count: 9, unidad: "Rutas", tendencia: 0.66 },
  { id: 4, pais: "México", sector: "Textil", item: "Textil industrial", tipo: "Producto", semana: "S1", count: 6, unidad: "Lotes", tendencia: 0.58 },

  { id: 5, pais: "México", sector: "Construcción", item: "Madera de pino", tipo: "Producto", semana: "S2", count: 24, unidad: "m³", tendencia: 0.95 },
  { id: 6, pais: "México", sector: "Construcción", item: "Acero laminado", tipo: "Producto", semana: "S2", count: 13, unidad: "Ton", tendencia: 0.74 },
  { id: 7, pais: "México", sector: "Logística", item: "Transporte nacional", tipo: "Servicio", semana: "S2", count: 11, unidad: "Rutas", tendencia: 0.70 },
  { id: 8, pais: "México", sector: "Textil", item: "Textil industrial", tipo: "Producto", semana: "S2", count: 8, unidad: "Lotes", tendencia: 0.61 },

  // USA
  { id: 9, pais: "Estados Unidos", sector: "Construcción", item: "Lumber (Pine)", tipo: "Producto", semana: "S1", count: 14, unidad: "m³", tendencia: 0.78 },
  { id: 10, pais: "Estados Unidos", sector: "Automotriz", item: "Componentes OEM", tipo: "Producto", semana: "S1", count: 7, unidad: "Lotes", tendencia: 0.64 },
  { id: 11, pais: "Estados Unidos", sector: "Logística", item: "Cross-border MX↔USA", tipo: "Servicio", semana: "S1", count: 9, unidad: "Rutas", tendencia: 0.73 },

  { id: 12, pais: "Estados Unidos", sector: "Construcción", item: "Lumber (Pine)", tipo: "Producto", semana: "S2", count: 17, unidad: "m³", tendencia: 0.83 },
  { id: 13, pais: "Estados Unidos", sector: "Automotriz", item: "Componentes OEM", tipo: "Producto", semana: "S2", count: 9, unidad: "Lotes", tendencia: 0.69 },
  { id: 14, pais: "Estados Unidos", sector: "Logística", item: "Cross-border MX↔USA", tipo: "Servicio", semana: "S2", count: 11, unidad: "Rutas", tendencia: 0.77 },

  // CAN
  { id: 15, pais: "Canadá", sector: "Construcción", item: "Madera estructural", tipo: "Producto", semana: "S1", count: 8, unidad: "m³", tendencia: 0.62 },
  { id: 16, pais: "Canadá", sector: "Automotriz", item: "Networking proveedores", tipo: "Servicio", semana: "S1", count: 6, unidad: "Paquetes", tendencia: 0.57 },
  { id: 17, pais: "Canadá", sector: "Construcción", item: "Madera estructural", tipo: "Producto", semana: "S2", count: 12, unidad: "m³", tendencia: 0.74 },
  { id: 18, pais: "Canadá", sector: "Automotriz", item: "Networking proveedores", tipo: "Servicio", semana: "S2", count: 7, unidad: "Paquetes", tendencia: 0.61 },
];

/**
 * “No atendidas” = oportunidades perdidas:
 * - llegaron solicitudes o señales, pero no se cerraron
 * - motivo típico: sin inventario / capacidad / partner aduanal / etc.
 */
const unmetDemandMock = [
  {
    id: "ud-001",
    pais: "México",
    estado: "Jalisco",
    sector: "Construcción",
    item: "Madera de pino",
    motivo: "Sin inventario",
    cantidad: "15 m³",
    fecha: "2026-02-03",
    empresas: 5,
    score: 92,
  },
  {
    id: "ud-002",
    pais: "México",
    estado: "CDMX",
    sector: "Logística",
    item: "Transporte nacional",
    motivo: "Capacidad limitada",
    cantidad: "2 rutas/semana",
    fecha: "2026-02-05",
    empresas: 3,
    score: 81,
  },
  {
    id: "ud-003",
    pais: "Estados Unidos",
    estado: "Texas",
    sector: "Logística",
    item: "Cross-border MX↔USA",
    motivo: "Sin partner aduanal",
    cantidad: "1 ruta/semana",
    fecha: "2026-02-01",
    empresas: 2,
    score: 77,
  },
];

/**
 * Recomendaciones (acciones sugeridas)
 * - Se construyen dinámicamente en base a topItem + sector + país
 * - Retorna tarjetas con: titulo, desc, action, icon
 */
function buildRecommendations({ topItem, sector, pais }) {
  const recs = [];

  // Si existe un topItem, recomendamos abastecimiento y publicación
  if (topItem) {
    recs.push({
      id: "r1",
      titulo: `Adquirir stock / capacidad: ${topItem.item}`,
      desc: `Alta demanda detectada en ${pais}. Considera abastecerte o aliarte con un proveedor para capturar pedidos recurrentes.`,
      action: "Crear plan de abastecimiento",
      icon: Package,
    });
    recs.push({
      id: "r2",
      titulo: `Publicar oferta y activar alcance`,
      desc: `Crea una publicación/oferta destacada con ${topItem.item} y condiciones. Aumenta visibilidad ante empresas buscando ese ítem.`,
      action: "Publicar oferta",
      icon: ArrowUpRight,
    });
  }

  // Siempre sugerimos alianzas
  recs.push({
    id: "r3",
    titulo: `Buscar alianzas por sector: ${sector || "tu sector"}`,
    desc: `Conecta con empresas complementarias para cubrir demanda (logística, insumos, certificaciones, financiamiento).`,
    action: "Ver alianzas",
    icon: BadgeCheck,
  });

  // Siempre sugerimos alertas inteligentes
  recs.push({
    id: "r4",
    titulo: `Configurar alertas inteligentes`,
    desc: `Define palabras clave, países y monto mínimo. Recibe alertas cuando la demanda suba o aparezcan oportunidades similares.`,
    action: "Configurar alertas",
    icon: Sparkles,
  });

  return recs;
}

/* ---------------- UI helpers (theme tokens) ---------------- */

/**
 * glassCard: contenedor base tipo "glassmorphism"
 * chipBase : pill/chip para metadatos
 */
const glassCard = "rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro";
const chipBase = "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold";

/**
 * scoreChip:
 * - Pinta el chip de "Opportunity XX%" según score
 * - Respeta light/dark con theme
 */
function scoreChip(score, theme) {
  const isLight = theme === "light";
  if (score >= 85) return isLight ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-800" : "border-emerald-300/25 bg-emerald-500/15 text-emerald-200";
  if (score >= 70) return isLight ? "border-amber-400/30 bg-amber-500/10 text-amber-800" : "border-amber-300/25 bg-amber-500/15 text-amber-200";
  return isLight ? "border-red-400/30 bg-red-500/10 text-red-800" : "border-red-300/25 bg-red-500/15 text-red-200";
}

export default function Tendencias() {
  // ------------------------------------------------------
  // 🎛️ Theme actual (light/dark)
  // ------------------------------------------------------
  const { theme } = useTheme();

  // ------------------------------------------------------
  // 🎚️ Estados UI (filtros)
  // ------------------------------------------------------
  const [pais, setPais] = useState("México");
  const [sector, setSector] = useState("Todos");
  const [tipo, setTipo] = useState("Todos"); // Producto | Servicio | Todos
  const [q, setQ] = useState("");
  const [periodo, setPeriodo] = useState("Últimas 2 semanas");

  // Listas para selects
  const paises = ["México", "Estados Unidos", "Canadá"];
  const sectores = useMemo(() => {
    const list = Array.from(new Set(demandEventsMock.map((d) => d.sector)));
    return ["Todos", ...list];
  }, []);

  // ------------------------------------------------------
  // 🔎 Filtrado principal (demanda detectada)
  // ------------------------------------------------------
  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    return demandEventsMock.filter((d) => {
      const okPais = d.pais === pais;
      const okSector = sector === "Todos" ? true : d.sector === sector;
      const okTipo = tipo === "Todos" ? true : d.tipo === tipo;
      const okSearch = !term || d.item.toLowerCase().includes(term) || d.sector.toLowerCase().includes(term);
      return okPais && okSector && okTipo && okSearch;
    });
  }, [pais, sector, tipo, q]);

  // ------------------------------------------------------
  // 🥇 Top items agrupados (por item/tipo/sector)
  // - total: suma de count
  // - trend: máx tendencia encontrada
  // ------------------------------------------------------
  const topItems = useMemo(() => {
    const map = new Map();
    for (const d of filtrados) {
      const key = `${d.item}__${d.tipo}__${d.sector}`;
      const prev = map.get(key) || {
        item: d.item,
        tipo: d.tipo,
        sector: d.sector,
        total: 0,
        unidad: d.unidad,
        trend: 0,
      };
      prev.total += d.count;
      prev.trend = Math.max(prev.trend, d.tendencia);
      map.set(key, prev);
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [filtrados]);

  // Top #1 (para highlight y recomendaciones)
  const topItem = topItems[0] || null;

  // ------------------------------------------------------
  // 📈 Serie para gráfica de línea (demanda por semana)
  // - Weeks fijas para mantener consistencia en UI
  // - Si no hay data, muestra 0
  // ------------------------------------------------------
  const lineSeries = useMemo(() => {
    const weeks = ["S1", "S2", "S3", "S4"];
    const totals = new Map(weeks.map((w) => [w, 0]));
    for (const d of filtrados) totals.set(d.semana, (totals.get(d.semana) || 0) + d.count);
    return weeks.map((w) => ({ semana: w, demanda: totals.get(w) || 0 }));
  }, [filtrados]);

  // ------------------------------------------------------
  // 📊 Serie para barras (ranking top items)
  // ------------------------------------------------------
  const barSeries = useMemo(() => topItems.map((t) => ({ name: t.item, total: t.total })), [topItems]);

  // ------------------------------------------------------
  // 🚨 Demanda no atendida (filtrada por país/sector y search)
  // ------------------------------------------------------
  const unmet = useMemo(() => {
    const term = q.trim().toLowerCase();
    return unmetDemandMock
      .filter((u) => {
        const okPais = u.pais === pais;
        const okSector = sector === "Todos" ? true : u.sector === sector;
        const okSearch = !term || u.item.toLowerCase().includes(term) || u.motivo.toLowerCase().includes(term);
        return okPais && okSector && okSearch;
      })
      .sort((a, b) => b.score - a.score);
  }, [pais, sector, q]);

  // ------------------------------------------------------
  // 📌 KPIs
  // ------------------------------------------------------
  const kpiDemanda = useMemo(() => filtrados.reduce((acc, d) => acc + d.count, 0), [filtrados]);
  const kpiNoAtendida = useMemo(() => unmet.reduce((acc, u) => acc + u.empresas, 0), [unmet]);
  const kpiTendencias = topItems.length;

  /**
   * Opportunity Score:
   * - volumeScore: normaliza total (topItem.total / 30) -> 0..100
   * - trendScore : tendencia (0..1) -> 0..100
   * - mezcla: 55% volumen + 45% tendencia
   */
  const kpiOpportunityScore = useMemo(() => {
    if (!topItem) return 0;
    const volumeScore = Math.min(100, Math.round((topItem.total / 30) * 100));
    const trendScore = Math.round(topItem.trend * 100);
    return Math.round(volumeScore * 0.55 + trendScore * 0.45);
  }, [topItem]);

  // ------------------------------------------------------
  // 💡 Recomendaciones dinámicas (basadas en topItem)
  // ------------------------------------------------------
  const recommendations = useMemo(
    () =>
      buildRecommendations({
        topItem,
        sector: sector === "Todos" ? (topItem?.sector || "General") : sector,
        pais,
      }),
    [topItem, sector, pais]
  );

  // ------------------------------------------------------
  // 🎨 Ajustes visuales de gráficos según theme
  // (sin romper tu lógica / sin cambiar estructuras)
  // ------------------------------------------------------
  const gridStroke = theme === "light" ? "rgba(15,23,42,0.10)" : "rgba(255,255,255,0.10)";
  const axisStroke = theme === "light" ? "rgba(15,23,42,0.35)" : "rgba(255,255,255,0.35)";
  const tooltipStyle = theme === "light"
    ? { backgroundColor: "rgba(255,255,255,0.95)", border: "1px solid rgba(15,23,42,0.12)", borderRadius: 12 }
    : { backgroundColor: "rgba(11,22,48,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 };

  return (
    <Layout>
            <div className="mx-auto w-full max-w-6xl space-y-6">
              {/* ------------------------------------------------------
                  🧾 Header de página
                 ------------------------------------------------------ */}
              <div className={`${glassCard} px-6 py-5`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl border border-border bg-surface/40 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-accent" />
                    </div>

                    <div>
                      <h1 className="text-text font-extrabold text-xl md:text-2xl">
                        Tendencias de mercado
                      </h1>
                      <p className="text-muted text-sm mt-1 max-w-2xl">
                        Detecta qué están solicitando las empresas, identifica demanda no atendida y recibe sugerencias
                        para capturar oportunidades por país, sector y tipo de operación.
                      </p>

                      {/* Chips resumen (pais / sector / periodo) */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`${chipBase} border-border bg-surface/40 text-text/80`}>
                          <MapPin className="w-3.5 h-3.5" />
                          {pais}
                        </span>
                        <span className={`${chipBase} border-border bg-surface/40 text-text/80`}>
                          <Tag className="w-3.5 h-3.5" />
                          {sector === "Todos" ? "Todos los sectores" : sector}
                        </span>
                        <span className={`${chipBase} border-border bg-surface/40 text-text/80`}>
                          <Filter className="w-3.5 h-3.5" />
                          {periodo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => alert("Mock: actualizar / sincronizar tendencias")}
                      className="rounded-full bg-surface/60 border border-border px-5 py-2 text-sm font-extrabold text-text hover:bg-surface transition"
                    >
                      Actualizar
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Mock: configurar alertas")}
                      className="rounded-full bg-accent px-5 py-2 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-105 transition"
                    >
                      Configurar alertas
                    </button>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------
                  🎛️ Filtros
                 ------------------------------------------------------ */}
              <div className={`${glassCard} p-5`}>
                <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto_auto] items-end">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar productos/servicios (ej: pino, logística, acero...)"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface/60 border border-border text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  {/* Selects */}
                  <Select theme={theme} value={pais} onChange={setPais} label="País" options={paises} />
                  <Select theme={theme} value={sector} onChange={setSector} label="Sector" options={sectores} />
                  <Select theme={theme} value={tipo} onChange={setTipo} label="Tipo" options={["Todos", "Producto", "Servicio"]} />
                  <Select
                    theme={theme}
                    value={periodo}
                    onChange={setPeriodo}
                    label="Periodo"
                    options={["Últimas 2 semanas", "Últimos 30 días", "Últimos 90 días"]}
                  />
                </div>
              </div>

              {/* ------------------------------------------------------
                  📌 KPIs
                 ------------------------------------------------------ */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi
                  theme={theme}
                  title="Demanda detectada"
                  value={kpiDemanda}
                  subtitle="Total de solicitudes / señales"
                  icon={BarChart3}
                />
                <Kpi
                  theme={theme}
                  title="No atendidas"
                  value={kpiNoAtendida}
                  subtitle="Empresas afectadas"
                  icon={AlertTriangle}
                  accent="warn"
                />
                <Kpi
                  theme={theme}
                  title="Tendencias activas"
                  value={kpiTendencias}
                  subtitle="Productos/servicios top"
                  icon={LineIcon}
                />
                <Kpi
                  theme={theme}
                  title="Opportunity score"
                  value={`${kpiOpportunityScore}%`}
                  subtitle="Potencial estimado"
                  icon={Sparkles}
                  accent="good"
                />
              </div>

              {/* ------------------------------------------------------
                  📈 Gráficos
                 ------------------------------------------------------ */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Line chart */}
                <div className={`${glassCard} p-6`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-text font-extrabold">Demanda por semana</div>
                      <div className="text-muted text-sm">Señales agregadas (filtrado por país/sector/tipo)</div>
                    </div>
                    <span className={`${chipBase} border-border bg-surface/40 text-text/80`}>
                      <TrendingUp className="w-3.5 h-3.5 text-accent" />
                      {topItem ? `Top: ${topItem.item}` : "Sin datos"}
                    </span>
                  </div>

                  <div className="mt-5 h-[260px] w-full min-w-0 overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineSeries}>
                        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
                        <XAxis dataKey="semana" stroke={axisStroke} tick={{ fill: axisStroke }} />
                        <YAxis stroke={axisStroke} tick={{ fill: axisStroke }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="demanda" strokeWidth={3} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar chart */}
                <div className={`${glassCard} p-6`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-text font-extrabold">Ranking de tendencias</div>
                      <div className="text-muted text-sm">Top ítems por volumen total detectado</div>
                    </div>
                    <span className={`${chipBase} border-border bg-surface/40 text-text/80`}>
                      <Package className="w-3.5 h-3.5 text-accent" />
                      {tipo}
                    </span>
                  </div>

                  <div className="mt-5 h-[260px] w-full min-w-0 overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barSeries}>
                        <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
                        <XAxis dataKey="name" hide />
                        <YAxis stroke={axisStroke} tick={{ fill: axisStroke }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="total" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Listado top 5 */}
                  <div className="mt-4 grid gap-2">
                    {topItems.slice(0, 5).map((t) => (
                      <div
                        key={`${t.item}-${t.sector}-${t.tipo}`}
                        className="rounded-2xl border border-border bg-surface/40 px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-text font-semibold truncate">{t.item}</div>
                          <div className="text-muted text-xs truncate">
                            {t.sector} • {t.tipo} • unidad: {t.unidad}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-accent font-extrabold">{t.total}</div>
                          <div className="text-muted text-[11px]">volumen</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------
                  🚨 Unmet demand + 💡 Recommendations
                 ------------------------------------------------------ */}
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                {/* Unmet demand */}
                <div className={`${glassCard} p-6`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-text font-extrabold">Demanda no atendida</div>
                      <div className="text-muted text-sm">
                        Casos donde hubo intención de compra/venta pero no se cerró (stock/capacidad/partner).
                      </div>
                    </div>

                    <span
                      className={`${chipBase} ${
                        theme === "light"
                          ? "border-red-400/30 bg-red-500/10 text-red-800"
                          : "border-red-300/25 bg-red-500/15 text-red-200"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Señales críticas
                    </span>
                  </div>

                  {unmet.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-8 text-center text-muted">
                      No hay registros de demanda no atendida con estos filtros.
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-3">
                      {unmet.map((u) => (
                        <div key={u.id} className="rounded-3xl border border-border bg-surface/40 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-text font-extrabold truncate">{u.item}</div>
                              <div className="text-muted text-sm mt-1">
                                {u.sector} • {u.estado}, {u.pais}
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className={`${chipBase} border-border bg-surface/60 text-text/80`}>
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                  {u.cantidad}
                                </span>
                                <span className={`${chipBase} border-border bg-surface/60 text-text/80`}>
                                  Motivo: {u.motivo}
                                </span>
                                <span className={`${chipBase} ${scoreChip(u.score, theme)}`}>
                                  Opportunity {u.score}%
                                </span>
                              </div>

                              <div className="mt-3 text-muted text-xs">
                                Detectado: <span className="text-text/85 font-semibold">{u.fecha}</span> • Empresas:{" "}
                                <span className="text-text/85 font-semibold">{u.empresas}</span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                              <button
                                type="button"
                                className="rounded-xl bg-accent px-4 py-2 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-105 transition"
                                onClick={() => alert(`Mock: generar plan de abastecimiento para "${u.item}"`)}
                              >
                                Capturar oportunidad
                              </button>
                              <button
                                type="button"
                                className="rounded-xl border border-border bg-surface/60 px-4 py-2 text-sm font-extrabold text-text hover:bg-surface transition"
                                onClick={() => alert(`Mock: buscar proveedores/alianzas para "${u.item}"`)}
                              >
                                Buscar aliados
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className={`${glassCard} p-6`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-text font-extrabold">Recomendaciones</div>
                      <div className="text-muted text-sm">Acciones sugeridas basadas en señales del mercado.</div>
                    </div>

                    <span
                      className={`${chipBase} ${
                        theme === "light"
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-800"
                          : "border-emerald-300/25 bg-emerald-500/15 text-emerald-200"
                      }`}
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      Smart
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {recommendations.map((r) => {
                      const Icon = r.icon;
                      return (
                        <div key={r.id} className="rounded-3xl border border-border bg-surface/40 p-5">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-2xl border border-border bg-surface/60 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-accent" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-text font-extrabold">{r.titulo}</div>
                              <div className="text-muted text-sm mt-1">{r.desc}</div>

                              <button
                                type="button"
                                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-4 py-2 text-sm font-extrabold text-text hover:bg-surface transition"
                                onClick={() => alert(`Mock: ${r.action}`)}
                              >
                                {r.action}
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Consejo final */}
                  <div className="mt-5 rounded-3xl border border-border bg-surface/50 p-5">
                    <div className="text-text font-extrabold flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-emerald-400" />
                      Consejo pro
                    </div>
                    <p className="text-muted text-sm mt-2 leading-relaxed">
                      Si un ítem aparece como tendencia en 2+ semanas y además hay demanda no atendida,
                      es una señal fuerte para: <strong className="text-text">comprar inventario</strong>,{" "}
                      <strong className="text-text">conseguir proveedor</strong> o{" "}
                      <strong className="text-text">publicar oferta</strong> con condiciones claras.
                    </p>
                  </div>
                </div>
              </div>
              {/* FIN Unmet + Recommendations */}
            </div>
    </Layout>
  );
}

/* ---------------- Components ---------------- */

/**
 * Select reutilizable:
 * - Respeta theme para el fondo de las opciones (<option>)
 * - Usa tokens globales para input/select
 */
function Select({ theme, label, value, onChange, options }) {
  return (
    <div className="w-full">
      <div className="text-[11px] text-muted mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-ring/40"
      >
        {options.map((o) => (
          <option
            key={o}
            value={o}
            className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1630] text-white"}
          >
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * KPI card:
 * - accent: good | warn | undefined
 * - Ajusta borde/fondo según tema
 */
function Kpi({ theme, title, value, subtitle, icon: Icon, accent }) {
  const accentClass =
    accent === "good"
      ? theme === "light"
        ? "border-emerald-400/30 bg-emerald-500/10"
        : "border-emerald-300/25 bg-emerald-500/12"
      : accent === "warn"
      ? theme === "light"
        ? "border-amber-400/30 bg-amber-500/10"
        : "border-amber-300/25 bg-amber-500/12"
      : "border-border bg-surface/60";

  return (
    <div className={`rounded-3xl border ${accentClass} backdrop-blur-xl shadow-pro p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-muted text-xs font-bold uppercase tracking-wider">{title}</div>
          <div className="text-text text-2xl font-extrabold mt-2">{value}</div>
          <div className="text-muted text-sm mt-1">{subtitle}</div>
        </div>
        <div className="h-11 w-11 rounded-2xl border border-border bg-surface/50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
      </div>
    </div>
  );
}