// src/pages/Alianzas.jsx
import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";
import { useTheme } from "../components/ThemeProvider";
import {
  Handshake,
  Link2,
  ShoppingCart,
  BadgeDollarSign,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Clock3,
  FileText,
  MessageSquare,
  X,
} from "lucide-react";

const PLAN_USUARIO = "BÁSICO"; // luego backend/contexto

/* ---------------- MOCK DATA (ejemplo pro) ---------------- */
const alianzasMock = [
  {
    id: "rel-001",
    empresa: "Transporte del Sur",
    pais: "México",
    estado: "Chiapas",
    tipoRelacion: "Proveedor",
    verificada: true,
    score: 86, // salud de relación / reputación
    ultimaActividad: "2026-02-05T15:40:00Z",
    estadoRelacion: "Activa", // Activa | En negociación | Pausada | Cerrada
    tags: ["Logística", "Transporte", "Rutas"],
    resumen:
      "Relación activa con proveedor logístico. Última operación: compra de servicio de transporte.",
    conexiones: [
      { id: "c1", fecha: "2026-01-10", canal: "Mapa", estado: "Aceptada" },
      { id: "c2", fecha: "2026-01-12", canal: "Mensajes", estado: "Activa" },
    ],
    transacciones: [
      {
        id: "t1",
        fecha: "2026-02-05",
        tipo: "Compra",
        concepto: "Servicio de transporte",
        monto: 2400,
        moneda: "USD",
        estado: "Completada",
      },
      {
        id: "t2",
        fecha: "2026-01-20",
        tipo: "Compra",
        concepto: "Almacenamiento temporal",
        monto: 800,
        moneda: "USD",
        estado: "Completada",
      },
    ],
    negociaciones: [
      {
        id: "n1",
        fecha: "2026-01-09",
        asunto: "Tarifa preferencial por volumen",
        estado: "Cerrada",
      },
    ],
    documentos: [{ id: "d1", nombre: "Acuerdo de servicio.pdf", fecha: "2026-01-15" }],
    mensajes: 14,
  },
  {
    id: "rel-002",
    empresa: "Maderas del Centro",
    pais: "México",
    estado: "CDMX",
    tipoRelacion: "Cliente",
    verificada: false,
    score: 72,
    ultimaActividad: "2026-02-03T11:15:00Z",
    estadoRelacion: "En negociación",
    tags: ["Madera", "Construcción"],
    resumen: "Cliente potencial. Negociación abierta por suministro mensual.",
    conexiones: [{ id: "c1", fecha: "2026-02-01", canal: "Mapa", estado: "Pendiente" }],
    transacciones: [],
    negociaciones: [{ id: "n1", fecha: "2026-02-02", asunto: "Suministro mensual 20T", estado: "Abierta" }],
    documentos: [],
    mensajes: 3,
  },
  {
    id: "rel-003",
    empresa: "Ontario Automotive Cluster",
    pais: "Canadá",
    estado: "Ontario",
    tipoRelacion: "Aliado",
    verificada: true,
    score: 91,
    ultimaActividad: "2026-01-28T18:02:00Z",
    estadoRelacion: "Activa",
    tags: ["Automotriz", "Supply Chain", "Innovación"],
    resumen: "Alianza estratégica para networking y oportunidades de proveeduría.",
    conexiones: [{ id: "c1", fecha: "2025-12-18", canal: "Evento", estado: "Aceptada" }],
    transacciones: [
      {
        id: "t1",
        fecha: "2026-01-18",
        tipo: "Venta",
        concepto: "Consultoría / matching",
        monto: 1200,
        moneda: "USD",
        estado: "Completada",
      },
    ],
    negociaciones: [],
    documentos: [{ id: "d1", nombre: "MOU.pdf", fecha: "2025-12-20" }],
    mensajes: 6,
  },
];

/* ---------------- Helpers UI ---------------- */
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

/**
 * Chips adaptados a theme (light/dark)
 */
function chipEstado(estado, theme) {
  const isLight = theme === "light";
  switch (estado) {
    case "Activa":
      return isLight
        ? "bg-emerald-500/10 text-emerald-800 border-emerald-400/25"
        : "bg-emerald-500/15 text-emerald-200 border-emerald-300/25";
    case "En negociación":
      return isLight
        ? "bg-amber-500/10 text-amber-800 border-amber-400/25"
        : "bg-amber-500/15 text-amber-200 border-amber-300/25";
    case "Pausada":
      return isLight
        ? "bg-slate-500/10 text-slate-800 border-slate-400/25"
        : "bg-slate-500/15 text-slate-200 border-slate-300/25";
    case "Cerrada":
      return isLight
        ? "bg-red-500/10 text-red-800 border-red-400/25"
        : "bg-red-500/15 text-red-200 border-red-300/25";
    default:
      return "bg-surface/40 text-text border-border";
  }
}

function chipTipo(tipo, theme) {
  const isLight = theme === "light";
  if (tipo === "Cliente")
    return isLight
      ? "bg-sky-500/10 text-sky-800 border-sky-400/25"
      : "bg-sky-500/15 text-sky-200 border-sky-300/25";
  if (tipo === "Proveedor")
    return isLight
      ? "bg-violet-500/10 text-violet-800 border-violet-400/25"
      : "bg-violet-500/15 text-violet-200 border-violet-300/25";
  if (tipo === "Aliado")
    return isLight
      ? "bg-blue-500/10 text-blue-800 border-blue-400/25"
      : "bg-blue-500/15 text-blue-200 border-blue-300/25";
  return "bg-surface/40 text-text border-border";
}

export default function Alianzas() {
  const { theme } = useTheme();

  const [tab, setTab] = useState("Resumen"); // Resumen | Transacciones | Conexiones | Negociaciones
  const [q, setQ] = useState("");
  const [pais, setPais] = useState("Todos");
  const [tipo, setTipo] = useState("Todos");
  const [estadoRel, setEstadoRel] = useState("Todos");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [selected, setSelected] = useState(null);

  const paises = useMemo(() => ["Todos", ...new Set(alianzasMock.map((a) => a.pais))], []);
  const tipos = useMemo(() => ["Todos", ...new Set(alianzasMock.map((a) => a.tipoRelacion))], []);
  const estados = useMemo(() => ["Todos", ...new Set(alianzasMock.map((a) => a.estadoRelacion))], []);

  const filtradas = useMemo(() => {
    const term = q.trim().toLowerCase();
    return alianzasMock.filter((a) => {
      const okPais = pais === "Todos" ? true : a.pais === pais;
      const okTipo = tipo === "Todos" ? true : a.tipoRelacion === tipo;
      const okEstado = estadoRel === "Todos" ? true : a.estadoRelacion === estadoRel;
      const okVerified = onlyVerified ? a.verificada : true;

      const okSearch =
        !term ||
        a.empresa.toLowerCase().includes(term) ||
        a.estado.toLowerCase().includes(term) ||
        a.pais.toLowerCase().includes(term) ||
        (a.tags || []).some((t) => t.toLowerCase().includes(term));

      return okPais && okTipo && okEstado && okVerified && okSearch;
    });
  }, [q, pais, tipo, estadoRel, onlyVerified]);

  // KPIs
  const totalCompras = useMemo(
    () => filtradas.reduce((acc, a) => acc + a.transacciones.filter((t) => t.tipo === "Compra").length, 0),
    [filtradas]
  );
  const totalVentas = useMemo(
    () => filtradas.reduce((acc, a) => acc + a.transacciones.filter((t) => t.tipo === "Venta").length, 0),
    [filtradas]
  );
  const totalConex = useMemo(() => filtradas.reduce((acc, a) => acc + a.conexiones.length, 0), [filtradas]);
  const activas = useMemo(() => filtradas.filter((a) => a.estadoRelacion === "Activa").length, [filtradas]);

  // Data por tab (tabla)
  const rows = useMemo(() => {
    if (tab === "Resumen") return filtradas;

    if (tab === "Transacciones") {
      return filtradas
        .flatMap((a) =>
          a.transacciones.map((t) => ({
            ...t,
            empresa: a.empresa,
            pais: a.pais,
            tipoRelacion: a.tipoRelacion,
            estadoRelacion: a.estadoRelacion,
            verificada: a.verificada,
            _relId: a.id,
          }))
        )
        .sort((x, y) => new Date(y.fecha) - new Date(x.fecha));
    }

    if (tab === "Conexiones") {
      return filtradas
        .flatMap((a) =>
          a.conexiones.map((c) => ({
            ...c,
            empresa: a.empresa,
            pais: a.pais,
            tipoRelacion: a.tipoRelacion,
            estadoRelacion: a.estadoRelacion,
            verificada: a.verificada,
            _relId: a.id,
          }))
        )
        .sort((x, y) => new Date(y.fecha) - new Date(x.fecha));
    }

    // Negociaciones
    return filtradas
      .flatMap((a) =>
        a.negociaciones.map((n) => ({
          ...n,
          empresa: a.empresa,
          pais: a.pais,
          tipoRelacion: a.tipoRelacion,
          estadoRelacion: a.estadoRelacion,
          verificada: a.verificada,
          _relId: a.id,
        }))
      )
      .sort((x, y) => new Date(y.fecha) - new Date(x.fecha));
  }, [tab, filtradas]);

  return (
    <>
      <Layout>
            <div className="mx-auto w-full max-w-6xl space-y-6">
              {/* Title */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-5">
                  <h1 className="text-text font-extrabold text-xl md:text-2xl">
                    Alianzas y colaboraciones
                  </h1>
                  <p className="text-muted text-sm mt-1 max-w-2xl">
                    Historial de compras, ventas, conexiones, negociaciones y actividad con otras empresas.
                    Centraliza tu relación B2B en un solo lugar.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <Pill icon={<Handshake className="w-4 h-4 text-accent" />} text="Relaciones B2B" />
                    <Pill icon={<ShoppingCart className="w-4 h-4 text-emerald-400" />} text="Compras & supply" />
                    <Pill icon={<BadgeDollarSign className="w-4 h-4 text-sky-400" />} text="Ventas & revenue" />
                    <Pill icon={<Link2 className="w-4 h-4 text-violet-400" />} text="Conexiones" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-surface/60 text-text px-4 py-2 border border-border text-xs shadow-pro">
                    Plan actual: <strong className="text-accent">{PLAN_USUARIO}</strong>
                  </span>
                  <button
                    className="rounded-full bg-accent px-5 py-2 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-105 transition"
                    type="button"
                    onClick={() => alert("Mock: abrir pantalla de mejora de plan")}
                  >
                    Mejorar plan
                  </button>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <KPI icon={<ShoppingCart className="w-5 h-5" />} value={totalCompras} label="Compras registradas" />
                <KPI icon={<BadgeDollarSign className="w-5 h-5" />} value={totalVentas} label="Ventas registradas" />
                <KPI icon={<Link2 className="w-5 h-5" />} value={totalConex} label="Conexiones" />
                <KPI icon={<Handshake className="w-5 h-5" />} value={activas} label="Relaciones activas" accent />
              </div>

              {/* Tabs + Filters */}
              <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Tabs */}
                  <div className="overflow-x-auto -mx-1 px-1 scrollbar-hide">
                    <div className="inline-flex rounded-2xl border border-border bg-surface/50 p-1 w-max">
                      {["Resumen", "Transacciones", "Conexiones", "Negociaciones"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTab(t)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                            tab === t ? "bg-accent text-slate-900" : "text-text/80 hover:bg-surface"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar empresa, país, estado, tags..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface/60 border border-border text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                    <Select theme={theme} label="País" value={pais} onChange={setPais} options={paises} />
                    <Select theme={theme} label="Tipo" value={tipo} onChange={setTipo} options={tipos} />
                    <Select theme={theme} label="Estado" value={estadoRel} onChange={setEstadoRel} options={estados} />
                    <Toggle label="Solo verificados" checked={onlyVerified} onChange={setOnlyVerified} />
                  </div>
                </div>
              </div>

              {/* Table / List */}
              <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div className="text-text font-extrabold flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted" />
                    {tab}
                    <span className="text-muted text-xs font-semibold">({rows.length})</span>
                  </div>
                  <div className="text-xs text-muted">
                    Tip: abre una alianza para ver timeline, documentos y acciones.
                  </div>
                </div>

                {rows.length === 0 ? (
                  <div className="p-10 text-center text-muted">
                    No hay registros en esta vista con los filtros actuales.
                  </div>
                ) : (
                  <>
                    {tab === "Resumen" ? (
                      <ResumenGrid theme={theme} data={rows} onOpen={(rel) => setSelected(rel)} />
                    ) : (
                      <Tabla
                        theme={theme}
                        tab={tab}
                        rows={rows}
                        onOpen={(relId) => setSelected(alianzasMock.find((a) => a.id === relId))}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
      </Layout>

            {/* Drawer detalle */}
            {selected && <DetalleDrawer theme={theme} rel={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

/* ---------------- Components ---------------- */

function Pill({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1 text-text/80">
      {icon}
      {text}
    </span>
  );
}

function KPI({ icon, value, label, accent = false }) {
  return (
    <div
      className={`rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5 text-text flex items-center gap-3 ${
        accent ? "ring-1 ring-ring/30" : ""
      }`}
    >
      <div className="h-10 w-10 rounded-2xl border border-border bg-surface/40 flex items-center justify-center text-text/80">
        {icon}
      </div>
      <div>
        <div className="text-xl font-extrabold leading-none">{value}</div>
        <div className="text-xs text-muted mt-1">{label}</div>
      </div>
    </div>
  );
}

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

function ResumenGrid({ theme, data, onOpen }) {
  return (
    <div className="p-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {data.map((a) => (
        <article
          key={a.id}
          className="rounded-3xl border border-border bg-surface/40 p-5 text-text hover:bg-surface/60 transition cursor-pointer"
          onClick={() => onOpen(a)}
          title="Abrir detalle"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onOpen(a);
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${chipTipo(
                    a.tipoRelacion,
                    theme
                  )}`}
                >
                  {a.tipoRelacion}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${chipEstado(
                    a.estadoRelacion,
                    theme
                  )}`}
                >
                  {a.estadoRelacion}
                </span>
                {a.verificada && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verificada
                  </span>
                )}
              </div>

              <h3 className="mt-3 text-base font-extrabold truncate">{a.empresa}</h3>
              <p className="text-xs text-muted mt-1">
                {a.estado}, {a.pais} • Score <span className="text-accent font-bold">{a.score}</span>
              </p>
            </div>

            <div className="h-10 w-10 rounded-2xl border border-border bg-surface/40 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-text/80" />
            </div>
          </div>

          <p className="mt-3 text-sm text-muted line-clamp-2">{a.resumen}</p>

          <div className="mt-4 grid grid-cols-4 gap-3 text-center">
            <Mini value={a.transacciones.length} label="Tx" />
            <Mini value={a.conexiones.length} label="Conex." />
            <Mini value={a.negociaciones.length} label="Neg." />
            <Mini value={a.mensajes} label="Msgs" />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="w-4 h-4" />
              {fmtDate(a.ultimaActividad)}
            </span>
            <span className="inline-flex items-center gap-1 text-accent font-semibold">
              Abrir <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function Mini({ value, label }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-3">
      <div className="text-text font-extrabold">{value}</div>
      <div className="text-[11px] text-muted mt-1">{label}</div>
    </div>
  );
}

function Tabla({ theme, tab, rows, onOpen }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-text">
        <thead className="text-xs text-muted uppercase border-b border-border">
          <tr>
            <Th>Empresa</Th>
            <Th>País</Th>
            <Th>Tipo</Th>
            <Th>Estado</Th>

            {tab === "Transacciones" && (
              <>
                <Th>Fecha</Th>
                <Th>Tipo Tx</Th>
                <Th>Concepto</Th>
                <Th>Monto</Th>
                <Th>Estado Tx</Th>
              </>
            )}
            {tab === "Conexiones" && (
              <>
                <Th>Fecha</Th>
                <Th>Canal</Th>
                <Th>Estado conexión</Th>
              </>
            )}
            {tab === "Negociaciones" && (
              <>
                <Th>Fecha</Th>
                <Th>Asunto</Th>
                <Th>Estado</Th>
              </>
            )}
            <Th></Th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={`${tab}-${r.id}-${r._relId || ""}`} className="hover:bg-surface/50 transition">
              <Td className="font-semibold">
                <div className="flex items-center gap-2">
                  {r.verificada && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  {r.empresa}
                </div>
              </Td>
              <Td>{r.pais}</Td>
              <Td>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${chipTipo(
                    r.tipoRelacion,
                    theme
                  )}`}
                >
                  {r.tipoRelacion}
                </span>
              </Td>
              <Td>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${chipEstado(
                    r.estadoRelacion,
                    theme
                  )}`}
                >
                  {r.estadoRelacion}
                </span>
              </Td>

              {tab === "Transacciones" && (
                <>
                  <Td>{r.fecha}</Td>
                  <Td>
                    <span className="inline-flex items-center gap-2">
                      {r.tipo === "Venta" ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-amber-400" />
                      )}
                      {r.tipo}
                    </span>
                  </Td>
                  <Td className="min-w-[220px]">{r.concepto}</Td>
                  <Td className="font-extrabold text-accent">{money(r.monto, r.moneda)}</Td>
                  <Td>{r.estado}</Td>
                </>
              )}

              {tab === "Conexiones" && (
                <>
                  <Td>{r.fecha}</Td>
                  <Td>{r.canal}</Td>
                  <Td>{r.estado}</Td>
                </>
              )}

              {tab === "Negociaciones" && (
                <>
                  <Td>{r.fecha}</Td>
                  <Td className="min-w-[260px]">{r.asunto}</Td>
                  <Td>{r.estado}</Td>
                </>
              )}

              <Td className="text-right">
                <button
                  type="button"
                  onClick={() => onOpen(r._relId)}
                  className="rounded-xl border border-border bg-surface/60 px-3 py-2 text-xs font-bold text-text hover:bg-surface transition"
                >
                  Ver detalle
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-6 py-3 font-semibold">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-6 py-4 ${className}`}>{children}</td>;
}

function DetalleDrawer({ theme, rel, onClose }) {
  const timeline = useMemo(() => {
    const items = [];

    rel.conexiones.forEach((c) =>
      items.push({
        type: "Conexión",
        fecha: c.fecha,
        label: `Conexión por ${c.canal} (${c.estado})`,
      })
    );

    rel.negociaciones.forEach((n) =>
      items.push({
        type: "Negociación",
        fecha: n.fecha,
        label: `${n.asunto} (${n.estado})`,
      })
    );

    rel.transacciones.forEach((t) =>
      items.push({
        type: "Transacción",
        fecha: t.fecha,
        label: `${t.tipo}: ${t.concepto} • ${money(t.monto, t.moneda)} (${t.estado})`,
      })
    );

    items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    return items.slice(0, 12);
  }, [rel]);

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-border bg-surface/85 backdrop-blur-xl shadow-pro text-text">
        <div className="p-6 border-b border-border flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-muted">Detalle de alianza</div>
            <div className="text-lg font-extrabold mt-1 truncate">{rel.empresa}</div>
            <div className="text-sm text-muted mt-1">
              {rel.estado}, {rel.pais} • {rel.tipoRelacion} • Score{" "}
              <span className="text-accent font-bold">{rel.score}</span>
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

        <div className="p-6 space-y-5 overflow-y-auto h-[calc(100%-76px)]">
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${chipTipo(
                rel.tipoRelacion,
                theme
              )}`}
            >
              {rel.tipoRelacion}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${chipEstado(
                rel.estadoRelacion,
                theme
              )}`}
            >
              {rel.estadoRelacion}
            </span>
            {rel.verificada && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verificada
              </span>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-surface/50 p-5">
            <div className="text-sm font-extrabold">Resumen</div>
            <p className="text-sm text-muted mt-2 leading-relaxed">{rel.resumen}</p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Box icon={<ShoppingCart className="w-4 h-4" />} value={rel.transacciones.length} label="Tx" />
            <Box icon={<Link2 className="w-4 h-4" />} value={rel.conexiones.length} label="Conex." />
            <Box icon={<Handshake className="w-4 h-4" />} value={rel.negociaciones.length} label="Neg." />
            <Box icon={<MessageSquare className="w-4 h-4" />} value={rel.mensajes} label="Msgs" />
          </div>

          <div className="rounded-3xl border border-border bg-surface/50 p-5">
            <div className="text-sm font-extrabold">Timeline (últimos eventos)</div>
            <div className="mt-3 space-y-3">
              {timeline.length === 0 ? (
                <div className="text-sm text-muted">Sin actividad registrada.</div>
              ) : (
                timeline.map((it, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" />
                    <div className="min-w-0">
                      <div className="text-xs text-muted">
                        {it.type} • {it.fecha}
                      </div>
                      <div className="text-sm text-text/90">{it.label}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface/50 p-5">
            <div className="text-sm font-extrabold">Documentos</div>
            <div className="mt-3 space-y-2">
              {rel.documentos.length === 0 ? (
                <div className="text-sm text-muted">No hay documentos aún.</div>
              ) : (
                rel.documentos.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/60 p-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-muted" />
                      <div className="truncate">
                        <div className="text-sm font-semibold truncate">{d.nombre}</div>
                        <div className="text-xs text-muted">{d.fecha}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-xl border border-border bg-surface/70 px-3 py-2 text-xs font-bold hover:bg-surface transition"
                      onClick={() => alert("Mock: descargar/abrir documento")}
                    >
                      Abrir
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm font-extrabold hover:bg-surface transition"
              onClick={() => alert("Mock: abrir chat con la empresa")}
            >
              Abrir chat
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-extrabold text-slate-900 hover:brightness-105 transition"
              onClick={() => alert("Mock: crear nueva transacción/registro")}
            >
              Registrar actividad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Box({ icon, value, label }) {
  return (
    <div className="rounded-3xl border border-border bg-surface/50 p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-text font-extrabold">
        {icon}
        {value}
      </div>
      <div className="text-[11px] text-muted mt-1">{label}</div>
    </div>
  );
}