// src/pages/TopMundial.jsx
/**
 * TOP MUNDIAL (ECOSYSVAL)
 * --------------------------------------------------------------------
 * ✅ Theme-ready:
 * - NO fijamos fondo (/fondo.png) aquí; lo maneja el layout/tema global.
 * - Solo agregamos overlays premium (glow + tint).
 *
 * ✅ Tokens:
 * - bg-surface / text-text / border-border / text-muted / ring.
 */

import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";
import { Lock, ArrowUpRight, Sparkles, X, Check, Filter, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemeProvider";

const PLANES_ORDEN = ["BÁSICO", "PRO", "PREMIUM", "PLATINO"];
const PLAN_USUARIO = "BÁSICO"; // luego lo traes del backend/contexto

export default function TopMundial() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [openPlans, setOpenPlans] = useState(false);

  const requierePlan = "PREMIUM";
  const locked = PLANES_ORDEN.indexOf(PLAN_USUARIO) < PLANES_ORDEN.indexOf(requierePlan);

  const kpis = useMemo(
    () => [
      { title: "Empresas rankeadas", value: "1,250", hint: "Últimas 24h" },
      { title: "Países", value: "45", hint: "Activos" },
      { title: "Sectores", value: "32", hint: "Clasificados" },
      { title: "Movimiento", value: "+4.2%", hint: "Semana" },
    ],
    []
  );

  const ranking = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        pos: i + 1,
        empresa: `Empresa Global ${i + 1}`,
        pais: ["CO", "MX", "US", "BR", "CL"][i % 5],
        imp: `$ ${(120 + i * 7).toFixed(1)}M`,
        exp: `$ ${(98 + i * 6.2).toFixed(1)}M`,
        variacion: `${i % 2 === 0 ? "+" : "-"}${(1.2 + i * 0.18).toFixed(1)}%`,
      })),
    []
  );

  const bars = useMemo(() => [35, 48, 28, 62, 52, 74, 58, 80, 66, 90], []);

  const planes = useMemo(
    () => [
      {
        plan: "BÁSICO",
        desc: "Acceso esencial al ecosistema.",
        perks: ["Feed básico", "Perfil empresarial"],
        cta: "Tu plan",
      },
      {
        plan: "PRO",
        desc: "Más visibilidad y beneficios.",
        perks: ["Recompensas PRO", "Mayor exposición"],
        cta: "Subir a PRO",
      },
      {
        plan: "PREMIUM",
        desc: "Datos avanzados + automatización.",
        perks: ["Top Mundial", "Notificaciones automáticas", "Reportes PDF"],
        cta: "Subir a PREMIUM",
        highlight: true,
      },
      {
        plan: "PLATINO",
        desc: "Máximo alcance + soporte prioritario.",
        perks: ["Todo Premium", "Soporte prioritario", "Marketplace destacado"],
        cta: "Subir a PLATINO",
      },
    ],
    []
  );

  // Pequeño tinte para overlays según tema (solo visual)
  const tintCls = theme === "light" ? "bg-white/15" : "bg-black/10";

  return (
    <>
      <Layout>
            <div className="mx-auto w-full max-w-7xl">
              {/* Header superior */}
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-text shadow-pro backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    Dashboard • Comercio internacional
                  </div>

                  <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-text drop-shadow">
                    Top Mundial{" "}
                    <span className="text-accent">Importaciones & Exportaciones</span>
                  </h1>

                  <p className="mt-2 text-sm text-muted max-w-2xl">
                    Ranking global, comparativos y tendencias por país/sector. Disponible desde{" "}
                    <span className="text-accent font-semibold">PREMIUM</span>.
                  </p>

                  <div className="mt-4 h-1 w-56 rounded bg-accent" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2 text-xs text-text shadow-pro backdrop-blur">
                    Plan actual: <strong className="text-text">{PLAN_USUARIO}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => setOpenPlans(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-slate-900 shadow-pro hover:brightness-95 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    Mejorar plan
                  </button>
                </div>
              </div>

              {/* GRID principal: KPIs + panel */}
              <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* Panel grande */}
                <section className="relative rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden">
                  {/* Glow */}
                  <div className="pointer-events-none absolute -top-28 -right-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[rgba(236,182,14,0.7)] via-white/10 to-transparent" />

                  <div className="relative p-6 md:p-7">
                    {/* Header panel */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface/50">
                          <Lock className="w-6 h-6 text-text" />
                        </div>

                        <div>
                          <div className="text-xs tracking-[0.18em] font-semibold uppercase text-muted">
                            {locked ? "Vista previa" : "Acceso habilitado"}
                          </div>

                          <div className="mt-1 text-lg md:text-xl font-extrabold text-text">
                            Ranking y tendencias globales
                          </div>

                          <p className="mt-2 text-sm text-text/80 max-w-2xl">
                            {locked ? (
                              <>
                                Desbloquea el tablero completo con{" "}
                                <span className="text-accent font-semibold">PREMIUM</span>{" "}
                                o superior (ranking, filtros, exportación y reportes).
                              </>
                            ) : (
                              <>Ya tienes acceso. Usa filtros, ranking completo y exporta reportes.</>
                            )}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Chip text="País" />
                            <Chip text="Sector" />
                            <Chip text="Periodo" />
                            <Chip text="Exportar PDF" />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-2 text-sm font-semibold text-text hover:bg-surface transition"
                          onClick={() => {}}
                        >
                          <Filter className="w-4 h-4" />
                          Filtros
                        </button>

                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-2 text-sm font-semibold text-text hover:bg-surface transition"
                          onClick={() => {}}
                        >
                          <Download className="w-4 h-4" />
                          Exportar
                        </button>

                        {locked ? (
                          <button
                            type="button"
                            onClick={() => setOpenPlans(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
                          >
                            Mejorar
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate("/top-mundial/dashboard")}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-extrabold text-white shadow-pro hover:brightness-95 transition"
                          >
                            Abrir tablero
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* KPI row */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {kpis.map((k) => (
                        <Kpi
                          key={k.title}
                          title={k.title}
                          value={k.value}
                          hint={k.hint}
                          locked={locked}
                        />
                      ))}
                    </div>

                    {/* Graph + Table */}
                    <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
                      {/* Mini chart */}
                      <div className="rounded-2xl border border-border bg-surface/50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                          <div className="text-sm font-semibold text-text">
                            Tendencia (últimos 10 periodos)
                          </div>
                          <span className="text-[11px] text-muted">
                            {locked ? "Bloqueado" : "Actualizado"}
                          </span>
                        </div>

                        <div className="p-4">
                          <div className="flex items-end gap-2 h-40">
                            {bars.map((h, idx) => (
                              <div key={idx} className="flex-1">
                                <div
                                  className={[
                                    "w-full rounded-lg",
                                    locked
                                      ? "bg-surface/70"
                                      : idx >= 7
                                      ? "bg-accent"
                                      : "bg-surface/80",
                                  ].join(" ")}
                                  style={{ height: `${h}%` }}
                                />
                                <div className="mt-2 text-[10px] text-muted text-center">
                                  {idx + 1}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 rounded-xl border border-border bg-surface/50 px-3 py-2 text-xs text-muted">
                            {locked ? (
                              <>
                                Disponible desde <b className="text-accent">PREMIUM</b>.
                              </>
                            ) : (
                              <>
                                Mejor periodo: <b className="text-accent">#10</b> • Variación positiva.
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Table with lock overlay only here */}
                      <div className="relative rounded-2xl border border-border bg-surface/50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                          <div className="text-sm font-semibold text-text">
                            Top 10 Empresas (vista previa)
                          </div>
                          <span className="text-[11px] rounded-full px-2 py-0.5 border border-border bg-surface/50 text-muted">
                            Ranking global
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-surface/70 text-muted">
                              <tr>
                                <Th>#</Th>
                                <Th>Empresa</Th>
                                <Th>País</Th>
                                <Th className="text-right">Importaciones</Th>
                                <Th className="text-right">Exportaciones</Th>
                                <Th className="text-right">Variación</Th>
                              </tr>
                            </thead>

                            <tbody>
                              {ranking.map((r) => (
                                <tr
                                  key={r.pos}
                                  className="border-t border-border text-text hover:bg-surface/70 transition"
                                >
                                  <Td className="font-semibold">{r.pos}</Td>
                                  <Td className="font-semibold">{r.empresa}</Td>
                                  <Td className="text-muted">{r.pais}</Td>
                                  <Td className="text-right text-muted">{r.imp}</Td>
                                  <Td className="text-right text-muted">{r.exp}</Td>
                                  <Td className="text-right">
                                    <span className={variationPill(theme, r.variacion)}>
                                      {r.variacion}
                                    </span>
                                  </Td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* LOCK OVERLAY ONLY ON TABLE */}
                        {locked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
                            <div className="relative z-10 mx-6 w-full max-w-md rounded-2xl border border-accent/25 bg-surface/70 backdrop-blur-xl p-5 shadow-pro">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-2xl border border-border bg-surface/60 flex items-center justify-center">
                                  <Lock className="w-6 h-6 text-text" />
                                </div>
                                <div>
                                  <div className="text-sm font-extrabold text-text">
                                    Desbloquea el ranking completo
                                  </div>
                                  <div className="text-xs text-muted">
                                    Disponible desde <b className="text-accent">PREMIUM</b>.
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setOpenPlans(true)}
                                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
                              >
                                Mejorar a PREMIUM
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Panel lateral */}
                <aside className="space-y-6">
                  <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6">
                    <div className="text-xs tracking-[0.18em] uppercase font-semibold text-muted">
                      Tu acceso
                    </div>

                    <div className="mt-2 text-xl font-extrabold text-text">
                      {locked ? "Limitado" : "Completo"}
                    </div>

                    <div className="mt-2 text-sm text-text/80">
                      {locked
                        ? "Solo vista previa. Activa PREMIUM para ver ranking real, filtros y reportes."
                        : "Tienes acceso a filtros, ranking completo y exportación."}
                    </div>

                    <div className="mt-4 space-y-2">
                      <SideItem ok={!locked} text="Ranking completo" />
                      <SideItem ok={!locked} text="Filtros por país/sector" />
                      <SideItem ok={!locked} text="Exportación PDF/Excel" />
                      <SideItem ok={!locked} text="Alertas y tendencias" />
                    </div>

                    <button
                      onClick={() => setOpenPlans(true)}
                      className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
                      type="button"
                    >
                      <Sparkles className="w-4 h-4" />
                      Mejorar plan
                    </button>
                  </div>

                  <div className="rounded-3xl border border-border bg-surface/50 p-6 shadow-pro">
                    <div className="text-sm font-extrabold text-text">Tip rápido</div>
                    <p className="mt-2 text-sm text-muted">
                      En <b className="text-accent">PREMIUM</b> podrás comparar empresas por país y exportar reportes
                      para decisiones estratégicas.
                    </p>
                    <div className="mt-4 h-1 w-24 rounded bg-accent" />
                  </div>
                </aside>
              </div>
            </div>
      </Layout>

            {/* MODAL PLANES */}
            {openPlans && (
              <Modal theme={theme} onClose={() => setOpenPlans(false)}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-text">Mejorar tu plan</h3>
                    <p className="mt-1 text-sm text-muted">
                      Para Top Mundial necesitas <strong className="text-accent">PREMIUM</strong> o superior.
                    </p>
                  </div>

                  <button
                    onClick={() => setOpenPlans(false)}
                    className="h-10 w-10 rounded-2xl border border-border bg-surface/50 hover:bg-surface flex items-center justify-center text-text"
                    title="Cerrar"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {planes.map((p) => {
                    const isCurrent = p.plan === PLAN_USUARIO;
                    const isRecommended = p.plan === requierePlan;

                    return (
                      <div
                        key={p.plan}
                        className={[
                          "rounded-2xl border bg-surface/50 backdrop-blur p-4",
                          "border-border",
                          isRecommended ? "ring-1 ring-accent/40" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-extrabold text-text">{p.plan}</div>

                          {isCurrent && (
                            <span className="text-[11px] rounded-full bg-accent/20 border border-accent/30 px-2 py-0.5 text-accent">
                              Actual
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-muted">{p.desc}</div>

                        <div className="mt-3 space-y-1.5">
                          {p.perks.map((k) => (
                            <div key={k} className="flex items-center gap-2 text-xs text-text/85">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-600">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                              <span>{k}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          disabled={isCurrent}
                          onClick={() => {
                            setOpenPlans(false);
                            navigate("/suscripcion"); // ajusta si tu ruta es otra
                          }}
                          className={[
                            "mt-4 w-full rounded-xl px-4 py-2 text-sm font-extrabold shadow-pro transition",
                            isCurrent
                              ? "bg-surface/60 text-muted cursor-not-allowed border border-border"
                              : isRecommended
                              ? "bg-accent text-slate-900 hover:brightness-95"
                              : "bg-surface/50 text-text hover:bg-surface border border-border",
                          ].join(" ")}
                        >
                          {isCurrent ? "Tu plan" : p.cta}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={() => setOpenPlans(false)}
                    className="rounded-xl border border-border bg-surface/50 px-4 py-2 text-sm font-semibold text-text hover:bg-surface transition"
                    type="button"
                  >
                    Ahora no
                  </button>

                  <button
                    onClick={() => {
                      setOpenPlans(false);
                      navigate("/suscripcion");
                    }}
                    className="rounded-xl bg-accent px-5 py-2 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
                    type="button"
                  >
                    Ver planes y precios
                  </button>
                </div>
              </Modal>
            )}
    </>            
  );
}

/* ---------- UI helpers ---------- */

function Chip({ text }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface/50 px-3 py-1 text-[11px] text-muted">
      {text}
    </span>
  );
}

function Kpi({ title, value, hint, locked }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted font-semibold">
        {title}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-text">
        {locked ? "—" : value}
      </div>
      <div className="mt-1 text-xs text-muted">
        {locked ? "Disponible en PREMIUM" : hint}
      </div>
    </div>
  );
}

function SideItem({ ok, text }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={[
          "inline-flex h-6 w-6 items-center justify-center rounded-full border",
          ok
            ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-600"
            : "bg-surface/50 border-border text-muted",
        ].join(" ")}
      >
        {ok ? "✓" : "•"}
      </span>
      <span className={ok ? "text-text/90" : "text-muted"}>{text}</span>
    </div>
  );
}

function variationPill(theme, variacion) {
  const isLight = theme === "light";
  const isPos = String(variacion || "").startsWith("+");

  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[12px] border";

  if (isPos) {
    return `${base} ${
      isLight
        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-800"
        : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    }`;
  }
  return `${base} ${
    isLight
      ? "border-red-400/30 bg-red-500/10 text-red-800"
      : "border-red-400/20 bg-red-500/10 text-red-200"
  }`;
}

function Th({ children, className = "" }) {
  return <th className={`px-4 py-3 text-left font-semibold ${className}`}>{children}</th>;
}

function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

/* ---------- Modal reusable (theme-ready) ---------- */
function Modal({ children, onClose, theme }) {
  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* panel */}
      <div className="relative w-full max-w-5xl rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-6 md:p-7">
        {/* Glow interno */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className={theme === "light" ? "absolute inset-0 bg-white/10" : "absolute inset-0 bg-black/5"} />
        </div>

        <div className="relative">{children}</div>
      </div>
    </div>
  );
}