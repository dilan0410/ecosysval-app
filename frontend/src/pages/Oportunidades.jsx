// src/pages/Oportunidades.jsx
import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";
import { useTheme } from "../components/ThemeProvider";
import {
  Inbox,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  MapPin,
  Tags,
  CheckCircle2,
  XCircle,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  Send,
  FileText,
  ShieldCheck,
} from "lucide-react";

const PLAN_USUARIO = "BÁSICO"; // luego del backend/contexto

/* ---------------- Mock: oportunidades que te envían ---------------- */
const oportunidadesMock = [
  {
    id: "opp-001",
    tipo: "Compra", // Compra | Venta
    titulo: "Compra de acero laminado (20T) mensual",
    empresa: "Maderas del Centro",
    verificada: false,
    pais: "México",
    estado: "CDMX",
    industria: "Construcción",
    prioridad: "Alta", // Alta | Media | Baja
    estadoOportunidad: "Nueva", // Nueva | En revisión | Aceptada | Rechazada | Contraoferta
    fecha: "2026-02-07T09:25:00Z",
    vence: "2026-02-14",
    moneda: "USD",
    presupuesto: 18000,
    volumen: "20 toneladas",
    entrega: "CDMX (zona industrial)",
    descripcion:
      "Buscamos proveedor estable para acero laminado. Entregas mensuales. Requerimos ficha técnica, tiempos y condiciones.",
    tags: ["Acero", "Suministro", "Mensual"],
    adjuntos: [{ id: "a1", nombre: "Requisitos_tecnicos.pdf" }],
  },
  {
    id: "opp-002",
    tipo: "Venta",
    titulo: "Oferta de servicio: logística nacional y cross-border",
    empresa: "Transporte del Sur",
    verificada: true,
    pais: "México",
    estado: "Chiapas",
    industria: "Logística",
    prioridad: "Media",
    estadoOportunidad: "En revisión",
    fecha: "2026-02-06T18:10:00Z",
    vence: "2026-02-20",
    moneda: "USD",
    presupuesto: 2400,
    volumen: "2 rutas / semana",
    entrega: "MX ↔ USA (según ruta)",
    descripcion:
      "Servicio logístico para rutas nacionales y cross-border. Disponibilidad inmediata, seguimiento y aseguramiento de carga.",
    tags: ["Transporte", "Cross-border", "Tracking"],
    adjuntos: [],
  },
  {
    id: "opp-003",
    tipo: "Compra",
    titulo: "Textil industrial para producción (lote trimestral)",
    empresa: "Textiles Hidalgo",
    verificada: true,
    pais: "México",
    estado: "Hidalgo",
    industria: "Textil",
    prioridad: "Baja",
    estadoOportunidad: "Nueva",
    fecha: "2026-02-01T12:05:00Z",
    vence: "2026-02-18",
    moneda: "USD",
    presupuesto: 5200,
    volumen: "Lote trimestral",
    entrega: "Pachuca",
    descripcion:
      "Solicitamos proveedor con certificaciones y consistencia en calidad. Adjuntar catálogo y condiciones de pago.",
    tags: ["Textil", "Calidad", "Certificación"],
    adjuntos: [{ id: "a1", nombre: "Especificaciones.xlsx" }],
  },
  {
    id: "opp-004",
    tipo: "Venta",
    titulo: "Venta de consultoría: matching de proveeduría automotriz",
    empresa: "Ontario Automotive Cluster",
    verificada: true,
    pais: "Canadá",
    estado: "Ontario",
    industria: "Automotriz",
    prioridad: "Alta",
    estadoOportunidad: "Contraoferta",
    fecha: "2026-01-28T16:40:00Z",
    vence: "2026-02-10",
    moneda: "USD",
    presupuesto: 1200,
    volumen: "Paquete 4 semanas",
    entrega: "Remoto",
    descripcion:
      "Paquete de networking + oportunidades verificadas con compradores. Incluye seguimiento semanal y reportes.",
    tags: ["Automotriz", "Networking", "Reportes"],
    adjuntos: [{ id: "a1", nombre: "Propuesta_MOU.pdf" }],
  },
];

/* ---------------- Helpers ---------------- */
function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * Chips adaptados a theme (dark/light)
 */
function chipTipo(tipo, theme) {
  const isLight = theme === "light";
  return tipo === "Compra"
    ? isLight
      ? "bg-amber-500/10 text-amber-800 border-amber-400/25"
      : "bg-amber-500/15 text-amber-200 border-amber-300/25"
    : isLight
    ? "bg-emerald-500/10 text-emerald-800 border-emerald-400/25"
    : "bg-emerald-500/15 text-emerald-200 border-emerald-300/25";
}

function chipEstado(e, theme) {
  const isLight = theme === "light";
  switch (e) {
    case "Nueva":
      return isLight
        ? "bg-sky-500/10 text-sky-800 border-sky-400/25"
        : "bg-sky-500/15 text-sky-200 border-sky-300/25";
    case "En revisión":
      return isLight
        ? "bg-slate-500/10 text-slate-800 border-slate-400/25"
        : "bg-surface/40 text-text border-border";
    case "Aceptada":
      return isLight
        ? "bg-emerald-500/10 text-emerald-800 border-emerald-400/25"
        : "bg-emerald-500/15 text-emerald-200 border-emerald-300/25";
    case "Rechazada":
      return isLight
        ? "bg-red-500/10 text-red-800 border-red-400/25"
        : "bg-red-500/15 text-red-200 border-red-300/25";
    case "Contraoferta":
      return isLight
        ? "bg-violet-500/10 text-violet-800 border-violet-400/25"
        : "bg-violet-500/15 text-violet-200 border-violet-300/25";
    default:
      return "bg-surface/40 text-text border-border";
  }
}

function chipPrioridad(p, theme) {
  const isLight = theme === "light";
  if (p === "Alta")
    return isLight
      ? "bg-red-500/10 text-red-800 border-red-400/25"
      : "bg-red-500/15 text-red-200 border-red-300/25";
  if (p === "Media")
    return isLight
      ? "bg-amber-500/10 text-amber-800 border-amber-400/25"
      : "bg-amber-500/15 text-amber-200 border-amber-300/25";
  return isLight
    ? "bg-slate-500/10 text-slate-800 border-slate-400/25"
    : "bg-slate-500/15 text-slate-200 border-slate-300/25";
}

function money(n, currency = "USD") {
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

export default function Oportunidades() {
  const { theme } = useTheme();

  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("Todos"); // Todos | Compra | Venta
  const [pais, setPais] = useState("Todos");
  const [estadoOpp, setEstadoOpp] = useState("Todos");
  const [soloVerificadas, setSoloVerificadas] = useState(false);
  const [soloGuardadas, setSoloGuardadas] = useState(false);

  const [guardadas, setGuardadas] = useState(() => new Set());
  const [selectedId, setSelectedId] = useState(oportunidadesMock[0]?.id || null);

  const paises = useMemo(
    () => ["Todos", ...new Set(oportunidadesMock.map((o) => o.pais))],
    []
  );
  const estados = useMemo(
    () => ["Todos", ...new Set(oportunidadesMock.map((o) => o.estadoOportunidad))],
    []
  );

  const filtradas = useMemo(() => {
    const term = q.trim().toLowerCase();
    return oportunidadesMock
      .filter((o) => {
        const okTipo = tipo === "Todos" ? true : o.tipo === tipo;
        const okPais = pais === "Todos" ? true : o.pais === pais;
        const okEstado = estadoOpp === "Todos" ? true : o.estadoOportunidad === estadoOpp;
        const okVerified = soloVerificadas ? o.verificada : true;
        const okSaved = soloGuardadas ? guardadas.has(o.id) : true;

        const okSearch =
          !term ||
          o.titulo.toLowerCase().includes(term) ||
          o.empresa.toLowerCase().includes(term) ||
          o.industria.toLowerCase().includes(term) ||
          (o.tags || []).some((t) => t.toLowerCase().includes(term));

        return okTipo && okPais && okEstado && okVerified && okSaved && okSearch;
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [q, tipo, pais, estadoOpp, soloVerificadas, soloGuardadas, guardadas]);

  const selected = useMemo(
    () => oportunidadesMock.find((o) => o.id === selectedId) || filtradas[0] || null,
    [selectedId, filtradas]
  );

  const unreadCount = useMemo(
    () => oportunidadesMock.filter((o) => o.estadoOportunidad === "Nueva").length,
    []
  );

  const toggleGuardar = (id) => {
    setGuardadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setEstadoLocal = (id, newEstado) => {
    // Mock: como no hay backend, solo alerta
    alert(`Mock: "${id}" → Estado: ${newEstado}`);
  };

  return (
    <Layout>
            <div className="mx-auto w-full max-w-6xl space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl border border-border bg-surface/40 flex items-center justify-center">
                      <Inbox className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h1 className="text-text font-extrabold text-xl md:text-2xl">
                        Buzón de oportunidades
                      </h1>
                      <p className="text-muted text-sm mt-1">
                        Recibe ofertas de compra y venta de otras empresas. Revisa, prioriza y responde con un clic.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-border bg-surface/40 px-3 py-1 text-text">
                      Nuevas: <strong className="text-accent">{unreadCount}</strong>
                    </span>
                    <span className="rounded-full border border-border bg-surface/40 px-3 py-1 text-text">
                      Plan: <strong className="text-accent">{PLAN_USUARIO}</strong>
                    </span>
                    <span className="rounded-full border border-border bg-surface/40 px-3 py-1 text-text">
                      Tip: guarda oportunidades para revisión y seguimiento.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="rounded-full bg-surface/60 border border-border px-5 py-2 text-sm font-extrabold text-text hover:bg-surface transition shadow-pro"
                    type="button"
                    onClick={() => alert("Mock: refrescar oportunidades")}
                  >
                    Actualizar
                  </button>
                  <button
                    className="rounded-full bg-accent px-5 py-2 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-105 transition"
                    type="button"
                    onClick={() => alert("Mock: abrir preferencias / alertas")}
                  >
                    Preferencias
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar por empresa, título, industria o tags..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface/60 border border-border text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 w-full lg:w-auto">
                    <Select theme={theme} label="Tipo" value={tipo} onChange={setTipo} options={["Todos", "Compra", "Venta"]} />
                    <Select theme={theme} label="País" value={pais} onChange={setPais} options={paises} />
                    <Select theme={theme} label="Estado" value={estadoOpp} onChange={setEstadoOpp} options={estados} />
                    <Toggle label="Solo verificadas" checked={soloVerificadas} onChange={setSoloVerificadas} />
                    <Toggle
                      label={soloGuardadas ? "Guardadas ✓" : "Solo guardadas"}
                      checked={soloGuardadas}
                      onChange={setSoloGuardadas}
                    />
                  </div>
                </div>
              </div>

              {/* Layout Inbox */}
              <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                {/* Lista */}
                <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="text-text font-extrabold flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted" />
                      Oportunidades
                      <span className="text-muted text-xs font-semibold">({filtradas.length})</span>
                    </div>
                    <div className="text-xs text-muted">Inbox</div>
                  </div>

                  {filtradas.length === 0 ? (
                    <div className="p-10 text-center text-muted">
                      No hay oportunidades con estos filtros.
                    </div>
                  ) : (
                    <div className="max-h-[640px] overflow-y-auto">
                      {filtradas.map((o) => {
                        const active = o.id === selectedId;
                        const saved = guardadas.has(o.id);
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => setSelectedId(o.id)}
                            className={`w-full text-left px-5 py-4 border-b border-border transition ${
                              active ? "bg-surface/70" : "hover:bg-surface/50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${chipTipo(
                                      o.tipo,
                                      theme
                                    )}`}
                                  >
                                    {o.tipo === "Compra" ? (
                                      <span className="inline-flex items-center gap-1">
                                        <ArrowDownLeft className="w-3.5 h-3.5" /> Compra
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1">
                                        <ArrowUpRight className="w-3.5 h-3.5" /> Venta
                                      </span>
                                    )}
                                  </span>

                                  <span
                                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${chipEstado(
                                      o.estadoOportunidad,
                                      theme
                                    )}`}
                                  >
                                    {o.estadoOportunidad}
                                  </span>

                                  <span
                                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${chipPrioridad(
                                      o.prioridad,
                                      theme
                                    )}`}
                                  >
                                    {o.prioridad}
                                  </span>

                                  {o.verificada && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      Verificada
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 text-sm font-extrabold text-text truncate">
                                  {o.titulo}
                                </div>

                                <div className="mt-1 text-xs text-muted truncate">
                                  {o.empresa} • {o.industria}
                                </div>

                                <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                                  <MapPin className="w-4 h-4" />
                                  {o.estado}, {o.pais}
                                  <span className="mx-1 opacity-40">•</span>
                                  <Clock3 className="w-4 h-4" />
                                  {fmtDate(o.fecha)}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleGuardar(o.id);
                                }}
                                className="h-10 w-10 rounded-2xl border border-border bg-surface/40 hover:bg-surface flex items-center justify-center"
                                title={saved ? "Quitar de guardadas" : "Guardar"}
                              >
                                {saved ? (
                                  <BookmarkCheck className="w-5 h-5 text-accent" />
                                ) : (
                                  <Bookmark className="w-5 h-5 text-muted" />
                                )}
                              </button>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Detalle */}
                <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 md:p-8 text-text">
                  {!selected ? (
                    <div className="p-10 text-center text-muted">
                      Selecciona una oportunidad para ver el detalle.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-5 border-b border-border">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${chipTipo(
                                selected.tipo,
                                theme
                              )}`}
                            >
                              {selected.tipo}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${chipEstado(
                                selected.estadoOportunidad,
                                theme
                              )}`}
                            >
                              {selected.estadoOportunidad}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${chipPrioridad(
                                selected.prioridad,
                                theme
                              )}`}
                            >
                              Prioridad {selected.prioridad}
                            </span>
                          </div>

                          <h2 className="mt-3 text-lg md:text-xl font-extrabold">
                            {selected.titulo}
                          </h2>

                          <div className="mt-2 text-sm text-muted">
                            <strong className="text-text">{selected.empresa}</strong> •{" "}
                            {selected.industria}
                          </div>

                          <div className="mt-2 text-xs text-muted flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {selected.estado}, {selected.pais}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Clock3 className="w-4 h-4" />
                              {fmtDate(selected.fecha)}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Tags className="w-4 h-4" />
                              {selected.tags.join(", ")}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-surface/40 p-4 min-w-[220px]">
                          <div className="text-[11px] text-muted uppercase tracking-wider">
                            Presupuesto estimado
                          </div>
                          <div className="text-xl font-extrabold text-accent mt-1">
                            {money(selected.presupuesto, selected.moneda)}
                          </div>
                          <div className="text-xs text-muted mt-2">
                            Volumen: <span className="text-text font-semibold">{selected.volumen}</span>
                          </div>
                          <div className="text-xs text-muted mt-1">
                            Entrega: <span className="text-text font-semibold">{selected.entrega}</span>
                          </div>
                          <div className="text-xs text-muted mt-1">
                            Vence: <span className="text-text font-semibold">{selected.vence}</span>
                          </div>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="mt-6 rounded-3xl border border-border bg-surface/40 p-5">
                        <div className="text-sm font-extrabold">Descripción</div>
                        <p className="text-sm text-muted mt-2 leading-relaxed whitespace-pre-wrap">
                          {selected.descripcion}
                        </p>
                      </div>

                      {/* Adjuntos */}
                      <div className="mt-5 rounded-3xl border border-border bg-surface/40 p-5">
                        <div className="text-sm font-extrabold">Adjuntos</div>
                        {selected.adjuntos.length === 0 ? (
                          <div className="text-sm text-muted mt-2">No hay adjuntos.</div>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {selected.adjuntos.map((a) => (
                              <div
                                key={a.id}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/50 p-3"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="w-4 h-4 text-muted" />
                                  <div className="truncate">
                                    <div className="text-sm font-semibold truncate">{a.nombre}</div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="rounded-xl border border-border bg-surface/60 px-3 py-2 text-xs font-bold hover:bg-surface transition"
                                  onClick={() => alert("Mock: abrir/descargar adjunto")}
                                >
                                  Abrir
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="mt-6 pt-5 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-extrabold text-text hover:bg-surface transition"
                            onClick={() => alert("Mock: abrir chat con empresa")}
                          >
                            <MessageSquare className="w-4 h-4" />
                            Abrir chat
                          </button>

                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-extrabold text-text hover:bg-surface transition"
                            onClick={() => alert("Mock: generar contraoferta")}
                          >
                            <Send className="w-4 h-4" />
                            Contraoferta
                          </button>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/15 px-5 py-3 text-sm font-extrabold text-emerald-100 hover:bg-emerald-500/20 transition"
                            onClick={() => setEstadoLocal(selected.id, "Aceptada")}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Aceptar
                          </button>

                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-500/15 px-5 py-3 text-sm font-extrabold text-red-100 hover:bg-red-500/20 transition"
                            onClick={() => setEstadoLocal(selected.id, "Rechazada")}
                          >
                            <XCircle className="w-4 h-4" />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </section>
              </div>
            </div>
    </Layout>
  );
}

/* ---------------- Small UI components ---------------- */

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
          <option key={o} value={o} className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1630] text-white"}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full rounded-2xl border px-4 py-3 text-sm font-extrabold transition ${
        checked
          ? "border-emerald-400/25 bg-emerald-500/15 text-emerald-200"
          : "border-border bg-surface/60 text-text hover:bg-surface"
      }`}
      title={label}
      aria-pressed={checked}
    >
      {label}
    </button>
  );
}