// src/pages/Eventos.jsx
/**
 * EVENTOS (Ecosysval)
 * -------------------------------------------------------
 * ✅ Objetivo:
 * - Mostrar calendario + agenda por día.
 * - Filtros: búsqueda + tipo de evento.
 * - Modal de detalle del evento.
 *
 * ✅ IMPORTANTE (THEME + FONDO):
 * - ❌ NO se usa backgroundImage en la página (NO fondo.png por encima).
 * - ✅ El fondo vive globalmente por tema (claro/oscuro) en CSS.
 * - ✅ Aquí solo agregamos un overlay "glow" suave para contraste,
 *   sin reemplazar ni tapar el fondo.
 *
 * ✅ UI:
 * - Tokens Tailwind: bg-surface, text-text, border-border, ring, etc.
 * - Badges/labels "theme-aware" para legibilidad en light/dark.
 */

import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  Video,
  GraduationCap,
  Users,
  Megaphone,
  Building2,
  MapPin,
  Clock,
  Ticket,
  ExternalLink,
  X,
  Filter,
} from "lucide-react";

import Layout from "../components/Layout";
import { useTheme } from "../components/ThemeProvider";

/* =========================
   MOCK DATA (luego backend)
========================= */
const eventosMock = [
  {
    id: "EVT-1001",
    titulo: "Conferencia: Tendencias Logísticas 2026",
    tipo: "Conferencia",
    fecha: "2026-02-18",
    horaInicio: "09:00",
    horaFin: "11:00",
    modalidad: "Híbrido",
    lugar: "CDMX • Centro de Convenciones",
    organizador: "Cámara de Transportistas de México",
    descripcion:
      "Panorama regional de logística, nearshoring, costos de transporte y tecnologías para optimización de rutas. Incluye panel con empresas líderes.",
    cupos: 240,
    link: "https://example.com/evento/logistica-2026",
    tags: ["logística", "nearshoring", "rutas"],
  },
  {
    id: "EVT-1002",
    titulo: "Capacitación: Compras Inteligentes B2B (Ecosysval)",
    tipo: "Capacitación",
    fecha: "2026-02-18",
    horaInicio: "15:00",
    horaFin: "17:30",
    modalidad: "Online",
    lugar: "Zoom",
    organizador: "Ecosysval Academy",
    descripcion:
      "Aprende a publicar oportunidades, analizar tendencias de demanda y convertir solicitudes en alianzas. Incluye checklist y plantilla de negociación.",
    cupos: 80,
    link: "https://example.com/evento/compras-b2b",
    tags: ["compras", "b2b", "negociación"],
  },
  {
    id: "EVT-1003",
    titulo: "Foro: Alianzas Sustentables en Cadenas de Valor",
    tipo: "Foro",
    fecha: "2026-02-21",
    horaInicio: "10:00",
    horaFin: "12:00",
    modalidad: "Presencial",
    lugar: "Guadalajara • Cámara Empresarial",
    organizador: "Asociación de Industria Jalisco",
    descripcion:
      "Espacio colaborativo entre empresas para acuerdos de valor compartido, certificaciones, abastecimiento responsable y métricas ESG.",
    cupos: 120,
    link: "https://example.com/evento/alianzas-sustentables",
    tags: ["ESG", "alianzas", "sustentabilidad"],
  },
  {
    id: "EVT-1004",
    titulo: "Networking: Match de Proveedores (Manufactura)",
    tipo: "Networking",
    fecha: "2026-02-22",
    horaInicio: "18:00",
    horaFin: "20:00",
    modalidad: "Presencial",
    lugar: "Monterrey • Hub Industrial",
    organizador: "Ecosysval Network",
    descripcion:
      "Ronda de presentaciones rápidas (speed-networking). Conecta compradores y proveedores con agenda automática por perfil.",
    cupos: 60,
    link: "https://example.com/evento/networking-manufactura",
    tags: ["proveedores", "manufactura", "match"],
  },
  {
    id: "EVT-1005",
    titulo: "Webinar: Cómo cerrar ventas B2B sin perder margen",
    tipo: "Webinar",
    fecha: "2026-02-25",
    horaInicio: "19:00",
    horaFin: "20:00",
    modalidad: "Online",
    lugar: "Streaming",
    organizador: "Ecosysval Growth",
    descripcion:
      "Técnicas para cotización, manejo de objeciones, pricing y contratos. Incluye casos reales y plantillas descargables.",
    cupos: 999,
    link: "https://example.com/evento/ventas-b2b",
    tags: ["ventas", "pricing", "margen"],
  },
  {
    id: "EVT-1006",
    titulo: "Feria: Expo Comercio Norteamérica",
    tipo: "Feria",
    fecha: "2026-03-03",
    horaInicio: "08:30",
    horaFin: "16:00",
    modalidad: "Presencial",
    lugar: "Toronto • Exhibition Center",
    organizador: "North America Trade Council",
    descripcion:
      "Exhibición de proveedores y compradores (México, USA y Canadá). Oportunidades de exportación, logística y financiación.",
    cupos: 2000,
    link: "https://example.com/evento/expo-na",
    tags: ["exportación", "trade", "northamerica"],
  },
];

/* =========================
   HELPERS
========================= */

const TIPOS = ["Todos", "Conferencia", "Capacitación", "Foro", "Networking", "Webinar", "Feria"];

const glassCard = "rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro";
const chipBase = "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold";

/** Icono por tipo */
function iconByTipo(tipo) {
  switch (tipo) {
    case "Conferencia":
      return <Megaphone className="w-4 h-4" />;
    case "Capacitación":
      return <GraduationCap className="w-4 h-4" />;
    case "Foro":
      return <Users className="w-4 h-4" />;
    case "Networking":
      return <Building2 className="w-4 h-4" />;
    case "Webinar":
      return <Video className="w-4 h-4" />;
    case "Feria":
      return <Ticket className="w-4 h-4" />;
    default:
      return <CalendarDays className="w-4 h-4" />;
  }
}

/**
 * Badge theme-aware por tipo:
 * - Light: texto más oscuro para legibilidad.
 * - Dark: texto claro.
 */
function badgeByTipo(tipo, theme) {
  const isLight = theme === "light";
  const base = chipBase;

  const map = {
    Conferencia: isLight
      ? "border-sky-400/25 bg-sky-500/10 text-sky-900"
      : "border-sky-300/25 bg-sky-500/15 text-sky-200",
    Capacitación: isLight
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-900"
      : "border-emerald-300/25 bg-emerald-500/15 text-emerald-200",
    Foro: isLight
      ? "border-violet-400/25 bg-violet-500/10 text-violet-900"
      : "border-violet-300/25 bg-violet-500/15 text-violet-200",
    Networking: isLight
      ? "border-amber-400/25 bg-amber-500/10 text-amber-900"
      : "border-amber-300/25 bg-amber-500/15 text-amber-200",
    Webinar: isLight
      ? "border-blue-400/25 bg-blue-500/10 text-blue-900"
      : "border-blue-300/25 bg-blue-500/15 text-blue-200",
    Feria: isLight
      ? "border-rose-400/25 bg-rose-500/10 text-rose-900"
      : "border-rose-300/25 bg-rose-500/15 text-rose-200",
  };

  const fallback = isLight
    ? "border-border bg-surface/40 text-text/80"
    : "border-border bg-surface/40 text-text/80";

  return `${base} ${map[tipo] || fallback}`;
}

function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/** Construye grilla del mes (semanas empiezan en lunes) */
function getCalendarGrid(monthDate) {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);

  const startDay = (start.getDay() + 6) % 7; // 0 lunes ... 6 domingo
  const totalDays = end.getDate();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let day = 1; day <= totalDays; day++) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

/* =========================
   PAGE
========================= */

export default function Eventos() {
  const { theme } = useTheme();

  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [tipo, setTipo] = useState("Todos");
  const [q, setQ] = useState("");
  const [modalEvento, setModalEvento] = useState(null);

  /**
   * Indexa eventos por fecha para:
   * - pintar contadores en calendario
   * - obtener rápido los eventos del día
   */
  const eventosPorFecha = useMemo(() => {
    const map = new Map();
    for (const e of eventosMock) {
      if (!map.has(e.fecha)) map.set(e.fecha, []);
      map.get(e.fecha).push(e);
    }
    // orden por hora
    for (const [k, arr] of map) {
      arr.sort((a, b) => (a.horaInicio > b.horaInicio ? 1 : -1));
      map.set(k, arr);
    }
    return map;
  }, []);

  const calendarCells = useMemo(() => getCalendarGrid(monthCursor), [monthCursor]);

  /** Eventos del día (aplica filtros tipo + búsqueda) */
  const eventosDelDia = useMemo(() => {
    const list = eventosPorFecha.get(selectedDate) || [];
    const term = q.trim().toLowerCase();

    return list.filter((e) => {
      const okTipo = tipo === "Todos" ? true : e.tipo === tipo;
      const okQ =
        !term ||
        e.titulo.toLowerCase().includes(term) ||
        e.organizador.toLowerCase().includes(term) ||
        (e.tags || []).some((t) => t.toLowerCase().includes(term));
      return okTipo && okQ;
    });
  }, [eventosPorFecha, selectedDate, tipo, q]);

  /** Total de eventos del mes (sin filtros) */
  const totalMes = useMemo(() => {
    const y = monthCursor.getFullYear();
    const m = monthCursor.getMonth() + 1;
    const prefix = `${y}-${String(m).padStart(2, "0")}-`;
    let c = 0;
    for (const e of eventosMock) if (e.fecha.startsWith(prefix)) c++;
    return c;
  }, [monthCursor]);

  const monthLabel = useMemo(() => {
    const months = [
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
    ];
    return `${months[monthCursor.getMonth()]} ${monthCursor.getFullYear()}`;
  }, [monthCursor]);

  return (
    <Layout>
            <div className="max-w-7xl mx-auto space-y-6">
              {/* HERO / Header */}
              <section className={`${glassCard} p-6 text-text`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl border border-border bg-surface/40 flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-accent" />
                    </div>

                    <div>
                      <h1 className="text-2xl font-extrabold">Eventos del Ecosistema</h1>
                      <p className="text-sm text-muted mt-1 max-w-2xl">
                        Conferencias, capacitaciones, foros, ferias y networking en México, USA y Canadá.
                        Planea tu agenda y no te pierdas oportunidades.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`${chipBase} border-border bg-surface/40 text-text/80`}>
                      <span className="text-muted mr-2">Eventos este mes:</span>
                      <strong className="text-accent">{totalMes}</strong>
                    </span>

                    <button
                      type="button"
                      className="rounded-full bg-accent px-5 py-2 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-105 transition"
                      onClick={() => alert("Próximo paso: crear evento / conectar backend")}
                    >
                      + Crear evento
                    </button>
                  </div>
                </div>

                {/* Search + filtros */}
                <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar por título, organizador o tag (ej: logística, ESG, exportación)..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface/60 border border-border text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto">
                    <span className="inline-flex items-center gap-2 text-xs text-muted px-2">
                      <Filter className="w-4 h-4" /> Tipo
                    </span>

                    {TIPOS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTipo(t)}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-extrabold border transition ${
                          tipo === t
                            ? "bg-accent text-slate-900 border-yellow-300/30"
                            : "bg-surface/40 text-text/85 border-border hover:bg-surface"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* GRID: Calendar + Day agenda */}
              <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
                {/* CALENDARIO */}
                <section className={`${glassCard} p-5 text-text`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted uppercase tracking-widest">Calendario</div>
                      <div className="text-lg font-extrabold">{monthLabel}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMonthCursor(addMonths(monthCursor, -1))}
                        className="h-10 w-10 rounded-xl border border-border bg-surface/50 hover:bg-surface transition"
                        title="Mes anterior"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => setMonthCursor(addMonths(monthCursor, 1))}
                        className="h-10 w-10 rounded-xl border border-border bg-surface/50 hover:bg-surface transition"
                        title="Mes siguiente"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* Weekdays */}
                  <div className="mt-4 grid grid-cols-7 gap-2 text-[11px] text-muted">
                    {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
                      <div key={d} className="text-center">{d}</div>
                    ))}
                  </div>

                  {/* Cells */}
                  <div className="mt-2 grid grid-cols-7 gap-2">
                    {calendarCells.map((d, i) => {
                      if (!d) return <div key={i} className="h-12 rounded-xl bg-transparent" />;

                      const key = toDateKey(d);
                      const isSelected = key === selectedDate;
                      const isToday = key === toDateKey(new Date());
                      const count = (eventosPorFecha.get(key) || []).length;

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedDate(key)}
                          className={[
                            "h-12 rounded-xl border text-sm font-extrabold transition relative flex items-center justify-center",
                            isSelected
                              ? "bg-accent text-slate-900 border-yellow-300/30"
                              : "bg-surface/40 text-text/85 border-border hover:bg-surface",
                          ].join(" ")}
                          title={count ? `${count} evento(s)` : "Sin eventos"}
                        >
                          <span className={isToday && !isSelected ? "text-accent" : ""}>
                            {d.getDate()}
                          </span>

                          {count > 0 && (
                            <span
                              className={[
                                "absolute right-2 top-2 text-[10px] rounded-full px-2 py-0.5 border",
                                isSelected
                                  ? "bg-black/10 text-slate-900 border-yellow-300/20"
                                  : "bg-surface/60 text-text/80 border-border",
                              ].join(" ")}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-2xl border border-border bg-surface/40 p-4">
                    <div className="text-xs text-muted">Fecha seleccionada</div>
                    <div className="text-sm font-extrabold">{selectedDate}</div>
                    <div className="text-xs text-muted mt-1">Tip: Haz click en un día para ver la agenda.</div>
                  </div>
                </section>

                {/* AGENDA DEL DÍA */}
                <section className={`${glassCard} p-6 text-text`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted uppercase tracking-widest">Agenda</div>
                      <div className="text-lg font-extrabold">Eventos del {selectedDate}</div>
                      <div className="text-sm text-muted mt-1">
                        {eventosDelDia.length
                          ? `Encontramos ${eventosDelDia.length} evento(s) según tus filtros.`
                          : "No hay eventos para este día con los filtros actuales."}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTipo("Todos");
                        setQ("");
                      }}
                      className="rounded-xl border border-border bg-surface/50 px-4 py-2 text-xs font-extrabold text-text/85 hover:bg-surface transition"
                    >
                      Limpiar filtros
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    {eventosDelDia.length === 0 ? (
                      <div className="rounded-3xl border border-border bg-surface/40 p-10 text-center">
                        <div className="text-4xl mb-3">📅</div>
                        <div className="font-extrabold">Sin eventos</div>
                        <div className="text-sm text-muted mt-1">Cambia la fecha o prueba con otros filtros.</div>
                      </div>
                    ) : (
                      eventosDelDia.map((e) => (
                        <article
                          key={e.id}
                          className="rounded-3xl border border-border bg-surface/40 p-5 hover:bg-surface transition cursor-pointer"
                          onClick={() => setModalEvento(e)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className={badgeByTipo(e.tipo, theme)}>
                                {iconByTipo(e.tipo)}
                                {e.tipo}
                              </div>

                              <h3 className="mt-3 text-lg font-extrabold leading-snug">{e.titulo}</h3>

                              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                                <span className="inline-flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {e.horaInicio} - {e.horaFin}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {e.lugar}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <Building2 className="w-4 h-4" />
                                  {e.organizador}
                                </span>
                              </div>

                              <p className="mt-3 text-sm text-text/90 line-clamp-2">{e.descripcion}</p>

                              {e.tags?.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {e.tags.map((t) => (
                                    <span
                                      key={t}
                                      className="text-[11px] rounded-full border border-border bg-surface/40 px-3 py-1 text-muted"
                                    >
                                      #{t}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-[11px] text-muted">Cupos</div>
                              <div className="text-xl font-extrabold text-accent">{e.cupos}</div>

                              <button
                                type="button"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-extrabold text-slate-900 shadow-pro hover:brightness-105 transition"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  setModalEvento(e);
                                }}
                              >
                                Ver detalle
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>

            {/* MODAL */}
            {modalEvento && <EventModal theme={theme} evento={modalEvento} onClose={() => setModalEvento(null)} />}
    </Layout>
  );
}

/* =========================
   MODAL
========================= */

function EventModal({ theme, evento, onClose }) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        className="relative w-full max-w-3xl rounded-3xl border border-border bg-surface/90 backdrop-blur-xl shadow-pro overflow-hidden text-text"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className={badgeByTipo(evento.tipo, theme)}>
                {iconByTipo(evento.tipo)}
                {evento.tipo}
              </div>

              <h2 className="mt-3 text-2xl font-extrabold leading-snug">{evento.titulo}</h2>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
                <span className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {evento.fecha} • {evento.horaInicio} - {evento.horaFin}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {evento.lugar}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-2xl border border-border bg-surface/60 hover:bg-surface transition flex items-center justify-center"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Organizador" value={evento.organizador} />
            <InfoCard label="Modalidad" value={evento.modalidad} />
            <InfoCard label="Cupos" value={String(evento.cupos)} />
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-5">
            <div className="text-xs text-muted uppercase tracking-widest">Descripción</div>
            <p className="mt-2 text-sm text-text/90 leading-relaxed whitespace-pre-wrap">{evento.descripcion}</p>

            {evento.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {evento.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] rounded-full border border-border bg-surface/40 px-3 py-1 text-muted"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              type="button"
              onClick={() => alert("Próximo paso: inscribirse / conectar backend")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-105 transition"
            >
              Inscribirme
              <Ticket className="w-4 h-4" />
            </button>

            <a
              href={evento.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 px-6 py-3 text-sm font-semibold text-text hover:bg-surface transition"
            >
              Abrir enlace
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="h-px bg-border" />
        <div className="p-4 text-center text-xs text-muted">Ecosysval • Eventos y actividades del ecosistema</div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-4">
      <div className="text-[11px] text-muted uppercase tracking-widest">{label}</div>
      <div className="mt-1 font-extrabold text-text truncate">{value}</div>
    </div>
  );
}