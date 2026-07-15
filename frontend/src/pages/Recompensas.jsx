// src/pages/Recompensas.jsx
/**
 * RECOMPENSAS (ECOSYSVAL)
 * --------------------------------------------------------------------
 * ✅ Theme-ready:
 * - No ponemos fondo fijo (fondo.png) aquí.
 * - El fondo global lo maneja theme.css (.light / default).
 * - Esta vista agrega solo overlays premium (glow + tint suave).
 *
 * ✅ Tokens:
 * - bg-surface / text-text / border-border / text-muted / ring / etc.
 *
 * ✅ Chips por plan:
 * - Se calculan por theme para que en light no se “desaparezcan”.
 */

import React, { useMemo, useState } from "react";
import { X, Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemeProvider";
import Layout from "../components/Layout";

const PLANES_ORDEN = ["BÁSICO", "PRO", "PREMIUM", "PLATINO"];

// 🔧 Cambia esto luego por el plan real del usuario (desde backend o contexto)
const PLAN_USUARIO = "BÁSICO";

const recompensasData = [
  {
    id: 1,
    titulo: "Programas de reconocimientos",
    descripcion:
      "Permite la creación de distintos programas para reconocer los avances en el bienestar de los miembros del Ecosistema.",
    plan: "PRO",
  },
  {
    id: 2,
    titulo: "Descuentos destacados",
    descripcion:
      "Muestra de manera más destacada los convenios que se quieren potenciar dentro del Ecosistema.",
    plan: "PRO",
  },
  {
    id: 3,
    titulo: "Notificaciones automáticas",
    descripcion:
      "Envío de notificaciones al usuario luego de una transacción en la plataforma.",
    plan: "PREMIUM",
  },
  {
    id: 4,
    titulo: "Marketplace personalizado",
    descripcion:
      "Beneficios flexibles a tu medida ofrecidos por las empresas del Ecosistema.",
    plan: "PREMIUM",
  },
  {
    id: 5,
    titulo: "Descuentos en el muro",
    descripcion:
      "Las principales colecciones en el muro social para aumentar su visibilidad.",
    plan: "PLATINO",
  },
];

/* ==========================================================
   UI helpers (theme-aware)
   ========================================================== */

/**
 * chipByPlan(theme, plan)
 * - Genera estilos para chips por plan.
 * - En light: texto más oscuro (legible).
 * - En dark: texto más claro.
 */
function chipByPlan(theme, plan) {
  const isLight = theme === "light";
  const base = "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold";

  const map = {
    PRO: isLight
      ? "bg-sky-500/10 text-sky-800 border-sky-400/25"
      : "bg-sky-500/15 text-sky-200 border-sky-500/30",
    PREMIUM: isLight
      ? "bg-amber-500/10 text-amber-800 border-amber-400/25"
      : "bg-amber-400/15 text-amber-200 border-amber-400/35",
    PLATINO: isLight
      ? "bg-slate-500/10 text-slate-800 border-slate-400/25"
      : "bg-slate-200/10 text-slate-100 border-slate-200/25",
    "BÁSICO": isLight
      ? "bg-slate-500/10 text-slate-800 border-slate-400/25"
      : "bg-slate-400/10 text-slate-200 border-slate-400/20",
  };

  return `${base} ${map[plan] || map["BÁSICO"]}`;
}

/**
 * ringByPlan(theme, plan)
 * - Sutil ring cuando está activo y cumple.
 */
function ringByPlan(theme, plan) {
  const isLight = theme === "light";
  if (plan === "PRO") return isLight ? "ring-sky-500/15" : "ring-sky-400/25";
  if (plan === "PREMIUM") return isLight ? "ring-amber-500/15" : "ring-amber-400/25";
  if (plan === "PLATINO") return isLight ? "ring-slate-500/15" : "ring-slate-200/25";
  return "ring-black/5";
}

/**
 * prettyPlan(theme, plan)
 * - Metadatos por plan para cards del modal.
 */
function prettyPlan(theme, plan) {
  const isLight = theme === "light";

  if (plan === "BÁSICO") {
    return {
      accent: isLight ? "text-slate-900" : "text-slate-200",
      border: isLight ? "border-slate-300/50" : "border-border",
    };
  }
  if (plan === "PRO") {
    return {
      accent: isLight ? "text-sky-800" : "text-sky-200",
      border: isLight ? "border-sky-400/30" : "border-sky-500/25",
    };
  }
  if (plan === "PREMIUM") {
    return {
      accent: isLight ? "text-amber-800" : "text-amber-200",
      border: isLight ? "border-amber-400/30" : "border-amber-400/25",
    };
  }
  // PLATINO
  return {
    accent: isLight ? "text-slate-900" : "text-slate-100",
    border: isLight ? "border-slate-300/50" : "border-slate-200/20",
  };
}

export default function Recompensas() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [modalOpen, setModalOpen] = useState(false);

  const idxUser = PLANES_ORDEN.indexOf(PLAN_USUARIO);

  // Features comparativas
  const tabla = useMemo(() => {
    const features = [
      { key: "feed", label: "Acceso a feed / muro social", min: "BÁSICO" },
      { key: "reconocimientos", label: "Programas de reconocimientos", min: "PRO" },
      { key: "destacados", label: "Descuentos destacados (mayor visibilidad)", min: "PRO" },
      { key: "notificaciones", label: "Notificaciones automáticas", min: "PREMIUM" },
      { key: "marketplace", label: "Marketplace personalizado", min: "PREMIUM" },
      { key: "colecciones", label: "Colecciones y descuentos en el muro", min: "PLATINO" },
      { key: "soporte", label: "Soporte prioritario", min: "PLATINO" },
    ];

    const included = (plan, min) =>
      PLANES_ORDEN.indexOf(plan) >= PLANES_ORDEN.indexOf(min);

    return { features, included };
  }, []);

  return (
    <>
      <Layout>
            <section className="mx-auto w-full max-w-6xl">
              {/* Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-text drop-shadow">
                    Recompensas del <span className="text-accent">Ecosistema</span>
                  </h1>
                  <p className="mt-2 max-w-2xl text-muted text-sm leading-relaxed">
                    Explora los beneficios disponibles según tu plan. Las recompensas
                    bloqueadas se activan al mejorar tu suscripción.
                  </p>
                  <div className="mt-4 h-1 w-44 rounded bg-accent" />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2 text-xs text-text shadow-pro backdrop-blur">
                    Plan actual: <strong className="text-text">{PLAN_USUARIO}</strong>
                  </span>

                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-slate-900 shadow-pro hover:brightness-95 transition"
                    type="button"
                  >
                    <Sparkles className="w-4 h-4" />
                    Mejorar plan
                  </button>
                </div>
              </div>

              {/* Contenedor glass */}
              <div className="mt-7 rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-4 md:p-8">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {recompensasData.map((item) => {
                    const locked = idxUser < PLANES_ORDEN.indexOf(item.plan);
                    const chipCls = chipByPlan(theme, item.plan);
                    const ringCls = ringByPlan(theme, item.plan);

                    return (
                      <article
                        key={item.id}
                        className={[
                          "relative flex flex-col rounded-2xl border border-border bg-surface/50 backdrop-blur",
                          "p-5 shadow-sm transition-all duration-200 min-w-0 overflow-hidden",
                          "hover:-translate-y-0.5 hover:bg-surface/60 hover:shadow-pro",
                          locked ? "" : `ring-1 ${ringCls}`,
                        ].join(" ")}
                      >
                        <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[rgba(236,182,14,0.65)] via-white/10 to-transparent" />

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={[
                                "flex h-10 w-10 items-center justify-center rounded-2xl border",
                                locked
                                  ? "bg-surface/50 text-muted border-border"
                                  : "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
                              ].join(" ")}
                            >
                              <span className="text-lg">{locked ? "🔒" : "✅"}</span>
                            </div>

                            <h2 className="text-sm font-semibold text-text truncate">
                              {item.titulo}
                            </h2>
                          </div>

                          <span className={chipCls}>{item.plan}</span>
                        </div>

                        <p className="mt-3 text-xs text-text/80 leading-relaxed">
                          {item.descripcion}
                        </p>

                        <div className="mt-5 flex items-center justify-between">
                          <span className="text-[11px] text-muted">
                            Disponible en{" "}
                            <span className="text-text/90 font-semibold">{item.plan}</span>
                          </span>

                          {locked ? (
                            <span className="text-[11px] text-muted">Requiere actualización</span>
                          ) : (
                            <span className="text-[11px] text-emerald-500 font-semibold">Activo</span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
      </Layout>

            {/* MODAL */}
            {modalOpen && (
              <Modal theme={theme} onClose={() => setModalOpen(false)}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-text">Mejorar tu plan</h3>
                    <p className="mt-1 text-sm text-muted">
                      Compara beneficios y elige el plan ideal para tu organización.
                    </p>
                  </div>

                  <button
                    onClick={() => setModalOpen(false)}
                    className="h-10 w-10 rounded-2xl border border-border bg-surface/50 hover:bg-surface/70 flex items-center justify-center text-text"
                    title="Cerrar"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Resumen planes */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {PLANES_ORDEN.map((p) => {
                    const isCurrent = p === PLAN_USUARIO;
                    const meta = prettyPlan(theme, p);

                    return (
                      <div
                        key={p}
                        className={[
                          "rounded-2xl border bg-surface/50 backdrop-blur p-4",
                          meta.border,
                          isCurrent ? "ring-1 ring-[rgba(236,182,14,0.35)]" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`text-sm font-bold ${meta.accent}`}>{p}</div>

                          {isCurrent && (
                            <span className="text-[11px] rounded-full bg-accent/20 border border-accent/30 px-2 py-0.5 text-accent">
                              Actual
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-muted">
                          {p === "BÁSICO" && "Acceso esencial al ecosistema."}
                          {p === "PRO" && "Más visibilidad y reconocimientos."}
                          {p === "PREMIUM" && "Automatización y personalización."}
                          {p === "PLATINO" && "Máximo alcance + soporte prioritario."}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Comparativo */}
                <div className="mt-6 rounded-2xl border border-border bg-surface/50 overflow-hidden">
                  <div className="grid grid-cols-[1fr_repeat(4,110px)] gap-0">
                    <div className="px-4 py-3 text-xs font-semibold text-muted border-b border-border">
                      Beneficio
                    </div>

                    {PLANES_ORDEN.map((p) => (
                      <div
                        key={p}
                        className="px-3 py-3 text-xs font-semibold text-text border-b border-border text-center"
                      >
                        {p}
                      </div>
                    ))}

                    {tabla.features.map((f) => (
                      <React.Fragment key={f.key}>
                        <div className="px-4 py-3 text-sm text-text/90 border-b border-border">
                          {f.label}
                        </div>

                        {PLANES_ORDEN.map((plan) => {
                          const ok = tabla.included(plan, f.min);
                          const isCurrent = plan === PLAN_USUARIO;

                          return (
                            <div
                              key={`${f.key}-${plan}`}
                              className={[
                                "px-3 py-3 border-b border-border text-center",
                                isCurrent ? "bg-surface/60" : "",
                              ].join(" ")}
                            >
                              {ok ? (
                                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-600">
                                  <Check className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="text-muted text-sm">—</span>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-border bg-surface/50 px-4 py-2 text-sm font-semibold text-text hover:bg-surface/70 transition"
                    type="button"
                  >
                    Ahora no
                  </button>

                  <button
                    onClick={() => {
                      setModalOpen(false);
                      navigate("/suscripcion"); // cámbialo si tienes otra ruta
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
        {/* Glow interno del modal */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className={theme === "light" ? "absolute inset-0 bg-white/10" : "absolute inset-0 bg-black/5"} />
        </div>

        <div className="relative">{children}</div>
      </div>
    </div>
  );
}