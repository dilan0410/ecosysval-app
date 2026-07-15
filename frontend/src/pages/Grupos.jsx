// src/pages/Grupos.jsx
/**
 * GRUPOS EMPRESARIALES (Ecosysval)
 * -------------------------------------------------------
 * ✅ Objetivo:
 * - Listado de grupos (cámaras, asociaciones, clústeres).
 * - Filtros: búsqueda, país, tipo, sector, solo verificados.
 * - Control de acceso por plan (mock).
 * - Modal de detalle con requisitos y beneficios.
 *
 * ✅ IMPORTANTE (THEME + FONDO):
 * - ❌ NO se usa backgroundImage en la página (NO fondo.png por encima).
 * - ✅ El fondo vive globalmente por tema (claro.png / oscuro.png) en CSS.
 * - ✅ Aquí solo agregamos un overlay "glow" suave para mejorar contraste,
 *   sin reemplazar ni tapar el fondo.
 *
 * ✅ UI:
 * - Tokens Tailwind: bg-surface, text-text, border-border, ring, etc.
 * - Badges con colores calculados según theme (dark/light) para legibilidad.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  MapPin,
  ShieldCheck,
  CalendarDays,
  Search,
  Building2,
  BadgeCheck,
  ExternalLink,
  X,
} from "lucide-react";

import Layout from "../components/Layout";
import { useTheme } from "../components/ThemeProvider";

/** Plan del usuario (mock). Luego: backend/contexto */
const PLAN_USUARIO = "BÁSICO";

/** Orden de planes para comparar accesos */
const PLANES_ORDEN = ["BÁSICO", "PRO", "PREMIUM", "PLATINO"];

/** Datos mock (luego: backend) */
const gruposMock = [
  {
    id: "cam-trans-mx",
    nombre: "Cámara Nacional de Transportistas de México",
    tipo: "Cámara",
    sector: "Transporte & Logística",
    pais: "México",
    estado: "CDMX",
    miembros: 1280,
    verificados: true,
    eventosMes: 6,
    oportunidadesMes: 18,
    descripcion:
      "Agrupa empresas transportistas y operadores logísticos. Promueve estándares, alianzas y acceso a oportunidades de negocio con empresas del ecosistema.",
    requisitos: ["Registro fiscal", "Carta de afiliación", "Cumplimiento básico"],
    beneficios: [
      "Acceso a oportunidades y licitaciones",
      "Networking B2B",
      "Eventos y capacitaciones",
      "Validación de reputación del grupo",
    ],
    tags: ["Transporte", "Logística", "Cadenas de valor"],
    nivelAcceso: "BÁSICO",
  },
  {
    id: "asoc-trans-jal",
    nombre: "Asociación de Transportes de Jalisco",
    tipo: "Asociación",
    sector: "Transporte",
    pais: "México",
    estado: "Jalisco",
    miembros: 540,
    verificados: true,
    eventosMes: 4,
    oportunidadesMes: 11,
    descripcion:
      "Conecta empresas de transporte en Jalisco con proveedores, clientes y aliados estratégicos. Impulsa la formalización y mejora operativa.",
    requisitos: ["Registro mercantil", "Documentación de flota (si aplica)"],
    beneficios: ["Ruedas de negocio", "Convenios", "Bolsa de oportunidades"],
    tags: ["Jalisco", "Rutas", "Carga"],
    nivelAcceso: "BÁSICO",
  },
  {
    id: "cluster-auto-ont",
    nombre: "Ontario Automotive Cluster",
    tipo: "Clúster",
    sector: "Manufactura & Automotriz",
    pais: "Canadá",
    estado: "Ontario",
    miembros: 210,
    verificados: true,
    eventosMes: 3,
    oportunidadesMes: 9,
    descripcion:
      "Clúster orientado a proveeduría automotriz, innovación, supply chain y alianzas transfronterizas.",
    requisitos: ["Perfil empresarial completo", "Validación de industria"],
    beneficios: ["Alianzas", "Benchmark", "Innovación", "Cadena de suministro"],
    tags: ["Automotriz", "Supply chain", "Innovación"],
    nivelAcceso: "PRO",
  },
  {
    id: "us-logistics-alliance",
    nombre: "US Logistics & Trade Alliance",
    tipo: "Alianza",
    sector: "Comercio Exterior",
    pais: "Estados Unidos",
    estado: "Texas",
    miembros: 860,
    verificados: false,
    eventosMes: 5,
    oportunidadesMes: 21,
    descripcion:
      "Comunidad de empresas de logística, comercio exterior e import/export. Facilita conexiones con compradores y proveedores.",
    requisitos: ["Perfil verificado", "KYC empresarial"],
    beneficios: ["Networking", "Deals", "Socios estratégicos", "Ferias"],
    tags: ["Trade", "Import/Export", "Texas"],
    nivelAcceso: "PREMIUM",
  },
];

/** Determina si el plan del usuario cumple el acceso mínimo requerido */
function canAccess(requiredPlan, userPlan) {
  return PLANES_ORDEN.indexOf(userPlan) >= PLANES_ORDEN.indexOf(requiredPlan);
}

/**
 * Helper: construye clases de badge por color según theme.
 * - Dark (default): texto claro para que no se pierda.
 * - Light: texto más oscuro para legibilidad sobre fondo claro.
 */
function badgeColor({ theme, color }) {
  const isLight = theme === "light";

  const base = "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold";

  const map = {
    blue: isLight
      ? "bg-blue-500/10 text-blue-700 border-blue-400/25"
      : "bg-blue-500/15 text-blue-200 border-blue-300/25",
    amber: isLight
      ? "bg-amber-500/10 text-amber-800 border-amber-400/25"
      : "bg-amber-500/15 text-amber-200 border-amber-300/25",
    emerald: isLight
      ? "bg-emerald-500/10 text-emerald-800 border-emerald-400/25"
      : "bg-emerald-500/15 text-emerald-200 border-emerald-300/25",
    violet: isLight
      ? "bg-violet-500/10 text-violet-800 border-violet-400/25"
      : "bg-violet-500/15 text-violet-200 border-violet-300/25",
    red: isLight
      ? "bg-red-500/10 text-red-800 border-red-400/25"
      : "bg-red-500/15 text-red-200 border-red-300/25",
    cyan: isLight
      ? "bg-cyan-500/10 text-cyan-900 border-cyan-400/25"
      : "bg-cyan-500/15 text-cyan-200 border-cyan-300/25",
    slate: isLight
      ? "bg-slate-500/10 text-slate-800 border-slate-400/25"
      : "bg-slate-500/15 text-slate-200 border-slate-300/25",
  };

  return `${base} ${map[color] || map.slate}`;
}

/** Badge por tipo */
function badgeByTipo(tipo, theme) {
  switch (tipo) {
    case "Cámara":
      return badgeColor({ theme, color: "blue" });
    case "Asociación":
      return badgeColor({ theme, color: "emerald" });
    case "Clúster":
      return badgeColor({ theme, color: "violet" });
    case "Alianza":
      return badgeColor({ theme, color: "slate" });
    default:
      return badgeColor({ theme, color: "slate" });
  }
}

/** Badge por país */
function badgeByPais(pais, theme) {
  if (pais === "México") return badgeColor({ theme, color: "amber" });
  if (pais === "Estados Unidos") return badgeColor({ theme, color: "red" });
  if (pais === "Canadá") return badgeColor({ theme, color: "cyan" });
  return badgeColor({ theme, color: "slate" });
}

export default function Grupos() {
  const { theme } = useTheme();

  // -------------------------
  // Filtros
  // -------------------------
  const [q, setQ] = useState("");
  const [pais, setPais] = useState("Todos");
  const [tipo, setTipo] = useState("Todos");
  const [sector, setSector] = useState("Todos");
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Modal seleccionado
  const [selected, setSelected] = useState(null);

  // -------------------------
  // Opciones de filtros
  // -------------------------
  const paises = useMemo(() => ["Todos", ...Array.from(new Set(gruposMock.map((g) => g.pais)))], []);
  const tipos = useMemo(() => ["Todos", ...Array.from(new Set(gruposMock.map((g) => g.tipo)))], []);
  const sectores = useMemo(() => ["Todos", ...Array.from(new Set(gruposMock.map((g) => g.sector)))], []);

  // -------------------------
  // Aplicación de filtros
  // -------------------------
  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();

    return gruposMock.filter((g) => {
      const okPais = pais === "Todos" ? true : g.pais === pais;
      const okTipo = tipo === "Todos" ? true : g.tipo === tipo;
      const okSector = sector === "Todos" ? true : g.sector === sector;
      const okVerified = onlyVerified ? g.verificados : true;

      const okSearch =
        !term ||
        g.nombre.toLowerCase().includes(term) ||
        g.sector.toLowerCase().includes(term) ||
        g.estado.toLowerCase().includes(term) ||
        g.pais.toLowerCase().includes(term) ||
        (g.tags || []).some((t) => t.toLowerCase().includes(term));

      return okPais && okTipo && okSector && okVerified && okSearch;
    });
  }, [q, pais, tipo, sector, onlyVerified]);

  // -------------------------
  // Stats
  // -------------------------
  const totalMiembros = useMemo(() => filtrados.reduce((acc, g) => acc + (g.miembros || 0), 0), [filtrados]);
  const totalOportunidades = useMemo(
    () => filtrados.reduce((acc, g) => acc + (g.oportunidadesMes || 0), 0),
    [filtrados]
  );

  // -------------------------
  // UX Modal: bloquear scroll + cerrar con Escape
  // -------------------------
  useEffect(() => {
    if (!selected) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  return (
    <>
      <Layout>
            <div className="mx-auto w-full max-w-6xl space-y-6">
              {/* HEADER */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-5">
                  <h1 className="text-text font-extrabold text-xl md:text-2xl">Grupos empresariales</h1>
                  <p className="text-muted text-sm mt-1 max-w-2xl">
                    Cámaras, asociaciones y clústeres que agrupan empresas por industria y región. Únete para potenciar
                    networking, alianzas y oportunidades.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1 text-text">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Grupos verificados
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1 text-text">
                      <Users className="w-4 h-4 text-accent" />
                      Comunidad & alianzas
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1 text-text">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      Cámaras / Asociaciones / Clústeres
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-surface/60 text-text px-4 py-2 border border-border text-xs shadow-pro">
                    Plan actual: <strong className="text-accent">{PLAN_USUARIO}</strong>
                  </span>

                  <button
                    className="rounded-full bg-accent px-5 py-2 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
                    type="button"
                    onClick={() => alert("Mock: abrir pantalla de mejora de plan")}
                  >
                    Mejorar plan
                  </button>
                </div>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Stat value={filtrados.length} label="Grupos encontrados" icon={<Building2 className="w-5 h-5" />} />
                <Stat value={totalMiembros.toLocaleString()} label="Miembros (total)" icon={<Users className="w-5 h-5" />} />
                <Stat value={totalOportunidades} label="Oportunidades / mes" icon={<BadgeCheck className="w-5 h-5" />} />
                <Stat
                  value={filtrados.filter((g) => g.verificados).length}
                  label="Verificados"
                  icon={<ShieldCheck className="w-5 h-5" />}
                  accent
                />
              </div>

              {/* SEARCH & FILTERS */}
              <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar por nombre, sector, estado, tags..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface/60 border border-border text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full lg:w-auto">
                    <Select value={pais} onChange={setPais} options={paises} label="País" />
                    <Select value={tipo} onChange={setTipo} options={tipos} label="Tipo" />
                    <Select value={sector} onChange={setSector} options={sectores} label="Sector" />
                    <Toggle checked={onlyVerified} onChange={setOnlyVerified} label="Solo verificados" />
                  </div>
                </div>
              </div>

              {/* CARDS */}
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtrados.map((g) => {
                  const locked = !canAccess(g.nivelAcceso, PLAN_USUARIO);

                  return (
                    <article
                      key={g.id}
                      className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5 text-text relative overflow-hidden hover:-translate-y-0.5 transition"
                    >
                      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={badgeByTipo(g.tipo, theme)}>{g.tipo}</span>
                            <span className={badgeByPais(g.pais, theme)}>{g.pais}</span>

                            {g.verificados && (
                              <span className={badgeColor({ theme, color: "emerald" })}>
                                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                Verificado
                              </span>
                            )}

                            {locked && (
                              <span className="inline-flex items-center rounded-full border border-border bg-surface/40 px-3 py-1 text-[11px] text-muted">
                                Requiere {g.nivelAcceso}+
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 text-base font-extrabold leading-snug truncate">{g.nombre}</h3>

                          <p className="mt-1 text-xs text-muted flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {g.estado}
                            <span className="opacity-40">•</span>
                            {g.sector}
                          </p>
                        </div>

                        <div className="h-10 w-10 rounded-2xl border border-border bg-surface/40 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-muted" />
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-text/90 line-clamp-3 leading-relaxed">{g.descripcion}</p>

                      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <MiniStat value={g.miembros.toLocaleString()} label="Miembros" icon={<Users className="w-4 h-4" />} />
                        <MiniStat value={g.eventosMes} label="Eventos/mes" icon={<CalendarDays className="w-4 h-4" />} />
                        <MiniStat value={g.oportunidadesMes} label="Oport./mes" icon={<BadgeCheck className="w-4 h-4" />} />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(g.tags || []).slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[11px] rounded-full border border-border bg-surface/40 px-3 py-1 text-muted"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelected(g)}
                          className="flex-1 rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface transition"
                        >
                          Ver detalle
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (locked) return alert(`Tu plan es ${PLAN_USUARIO}. Requiere ${g.nivelAcceso}+`);
                            alert("Mock: Solicitud enviada al grupo ✅");
                          }}
                          className={`rounded-xl px-4 py-2.5 text-sm font-extrabold transition inline-flex items-center gap-2 ${
                            locked
                              ? "bg-surface/60 text-muted cursor-not-allowed border border-border"
                              : "bg-accent text-slate-900 hover:brightness-95"
                          }`}
                          aria-disabled={locked}
                          title={locked ? `Requiere ${g.nivelAcceso}+` : "Solicitar unión"}
                        >
                          Solicitar
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {!filtrados.length && (
                <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-10 text-center text-text">
                  No hay grupos con esos filtros. Prueba con otro sector o país.
                </div>
              )}
            </div>

            {/* MODAL DETALLE */}
            {selected && (
              <GrupoModal
                grupo={selected}
                onClose={() => setSelected(null)}
                locked={!canAccess(selected.nivelAcceso, PLAN_USUARIO)}
              />
            )}
      </Layout>
    </>
  );
}

/* ---------------- UI helpers ---------------- */

function Stat({ value, label, icon, accent = false }) {
  return (
    <div
      className={`rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5 text-text flex items-center gap-3 ${
        accent ? "ring-1 ring-emerald-400/30" : ""
      }`}
    >
      <div className="h-10 w-10 rounded-2xl border border-border bg-surface/40 flex items-center justify-center text-muted">
        {icon}
      </div>
      <div>
        <div className="text-xl font-extrabold leading-none">{value}</div>
        <div className="text-xs text-muted mt-1">{label}</div>
      </div>
    </div>
  );
}

function MiniStat({ value, label, icon }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-3">
      <div className="flex items-center justify-center gap-2 text-text text-sm font-extrabold">
        {icon}
        {value}
      </div>
      <div className="text-[11px] text-muted mt-1">{label}</div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="w-full">
      <div className="text-[11px] text-muted mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-ring/40"
      >
        {options.map((o) => (
          <option key={o} value={o}>
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
      className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        checked
          ? "border-emerald-400/25 bg-emerald-500/15 text-emerald-200"
          : "border-border bg-surface/60 text-text hover:bg-surface"
      }`}
      aria-pressed={checked}
    >
      {label}
    </button>
  );
}

function GrupoModal({ grupo, onClose, locked }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        className="relative w-full max-w-3xl rounded-3xl border border-border bg-surface/90 backdrop-blur-xl shadow-pro text-text overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 border-b border-border flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-muted">Detalle del grupo</div>
            <div className="text-lg font-extrabold mt-1 truncate">{grupo.nombre}</div>
            <div className="text-sm text-muted mt-1">
              {grupo.tipo} • {grupo.sector} • {grupo.estado}, {grupo.pais}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-border bg-surface/60 hover:bg-surface flex items-center justify-center"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-sm font-extrabold">Descripción</div>
            <p className="text-sm text-text/90 mt-2 leading-relaxed">{grupo.descripcion}</p>

            <div className="mt-5 text-sm font-extrabold">Beneficios</div>
            <ul className="mt-2 space-y-2 text-sm text-muted">
              {grupo.beneficios.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="rounded-3xl border border-border bg-surface/60 p-5">
              <div className="text-sm font-extrabold">Requisitos</div>
              <ul className="mt-2 space-y-2 text-sm text-muted">
                {grupo.requisitos.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    {r}
                  </li>
                ))}
              </ul>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <MiniStat value={grupo.miembros.toLocaleString()} label="Miembros" icon={<Users className="w-4 h-4" />} />
                <MiniStat value={grupo.eventosMes} label="Eventos/mes" icon={<CalendarDays className="w-4 h-4" />} />
                <MiniStat value={grupo.oportunidadesMes} label="Oport./mes" icon={<BadgeCheck className="w-4 h-4" />} />
              </div>

              {locked && (
                <div className="mt-4 rounded-2xl border border-border bg-surface/60 p-3 text-sm text-muted">
                  🔒 Tu plan requiere <strong className="text-text">{grupo.nivelAcceso}+</strong> para solicitar unión.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-text hover:bg-surface transition"
          >
            Cerrar
          </button>

          <button
            type="button"
            disabled={locked}
            onClick={() => alert("Mock: solicitud enviada ✅")}
            className={`rounded-xl px-6 py-3 text-sm font-extrabold transition ${
              locked
                ? "bg-surface/60 text-muted cursor-not-allowed border border-border"
                : "bg-accent text-slate-900 hover:brightness-95"
            }`}
          >
            Solicitar unión
          </button>
        </div>
      </div>
    </div>
  );
}