// src/pages/Mensajes.jsx
/**
 * MENSAJES (Ecosysval)
 * -------------------------------------------------------
 * ✅ Objetivo:
 * - Bandeja de entrada con búsqueda.
 * - Lista de mensajes + panel de detalle.
 * - Chips (UI) para filtros visuales (MVP).
 *
 * ✅ IMPORTANTE (THEME + FONDO):
 * - ❌ NO usar backgroundImage en la página (NO fondo.png encima).
 * - ✅ El fondo vive globalmente por tema (claro/oscuro) en CSS.
 * - ✅ Aquí solo agregamos overlay "glow" suave para contraste.
 *
 * ✅ UI:
 * - Tokens Tailwind: bg-surface, text-text, border-border, ring, etc.
 * - Chips/badges theme-aware (light/dark).
 */

import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";
import { mensajesMock } from "../data/mensajesMock";
import { Search, Mail, MailOpen, ArrowLeft, X } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";

/** Badge helper (theme-aware) */
function badgeColor({ theme, color }) {
  const isLight = theme === "light";
  const base = "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";

  const map = {
    amber: isLight
      ? "bg-amber-500/10 text-amber-800 border-amber-400/25"
      : "bg-amber-500/15 text-amber-200 border-amber-300/25",
    emerald: isLight
      ? "bg-emerald-500/10 text-emerald-800 border-emerald-400/25"
      : "bg-emerald-500/15 text-emerald-200 border-emerald-300/25",
    slate: isLight
      ? "bg-slate-500/10 text-slate-800 border-slate-400/25"
      : "bg-slate-500/15 text-slate-200 border-slate-300/25",
  };

  return `${base} ${map[color] || map.slate}`;
}

/** Chip (theme-aware) */
function chipClass(active, theme) {
  const isLight = theme === "light";
  if (active) return badgeColor({ theme, color: "amber" });

  // chip inactivo suave
  return [
    "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold",
    isLight ? "border-border bg-surface/60 text-muted" : "border-border bg-surface/40 text-muted",
  ].join(" ");
}

export default function Mensajes() {
  const { theme } = useTheme();
  const [q, setQ] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // NUEVO
  const [selected, setSelected] = useState(null);

  /** Filtrado por búsqueda (asunto / remitente / preview) */
  const mensajes = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return mensajesMock;

    return mensajesMock.filter((m) => {
      const a = (m.asunto || "").toLowerCase();
      const r = (m.remitente || "").toLowerCase();
      const p = (m.preview || "").toLowerCase();
      return a.includes(term) || r.includes(term) || p.includes(term);
    });
  }, [q]);

  /** Conteo de no leídos (mvp) */
  const unreadCount = useMemo(() => (mensajesMock || []).filter((m) => !m.leido).length, []);

  return (
    <Layout mainClassName="!p-6">
            <div className="mx-auto w-full max-w-7xl space-y-6">
              {/* Header de página */}
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-5">
                  <div className={badgeColor({ theme, color: "slate" })}>
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span className="ml-2">Bandeja de entrada</span>
                  </div>

                  <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-text">
                    Mensajes <span className="text-accent">de socios y contactos</span>
                  </h1>

                  <p className="mt-2 text-sm text-muted max-w-2xl">
                    Revisa, filtra y gestiona conversaciones dentro del ecosistema.
                  </p>

                  <div className="mt-4 h-1 w-56 rounded bg-accent" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="rounded-full bg-surface/60 text-text px-4 py-2 border border-border text-xs shadow-pro">
                    No leídos: <strong className="text-text">{unreadCount}</strong>
                  </span>
                </div>
              </div>

              {/* Grid: lista + detalle */}
              <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                {/* LISTA */}
                <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden">
                  <div className="p-5 border-b border-border">
                    <div className="relative">
                      <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar mensajes..."
                        className="w-full rounded-2xl border border-border bg-surface/60 pl-11 pr-3 py-3 text-sm text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40"
                      />
                    </div>

                    {/* Chips (MVP visual) */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip text="Todos" active theme={theme} />
                      <Chip text="No leídos" theme={theme} />
                      <Chip text="Socios" theme={theme} />
                      <Chip text="Proveedores" theme={theme} />
                    </div>
                  </div>

                  <div className="max-h-[650px] overflow-y-auto">
                    {mensajes.length === 0 ? (
                      <div className="p-10 text-center text-muted">
                        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl border border-border bg-surface/40 flex items-center justify-center">
                          <Mail className="w-6 h-6 text-muted" />
                        </div>
                        No hay mensajes que coincidan con tu búsqueda.
                      </div>
                    ) : (
                      mensajes.map((msg, idx) => {
                        const isSelected = selected?.id === msg.id;
                        const unread = !msg.leido;

                        return (
                          <button
                            key={msg.id}
                            type="button"
                            onClick={() => setSelected(msg)}
                            className={[
                              "w-full text-left px-5 py-4 flex gap-4 transition",
                              idx !== mensajes.length - 1 ? "border-b border-border" : "",
                              unread ? "bg-surface/40" : "bg-transparent",
                              isSelected ? "ring-1 ring-yellow-400/25 bg-accent/10" : "hover:bg-surface",
                            ].join(" ")}
                          >
                            <div className="mt-0.5">
                              <div
                                className={[
                                  "h-10 w-10 rounded-2xl border flex items-center justify-center",
                                  unread ? "border-yellow-400/25 bg-accent/10" : "border-border bg-surface/40",
                                ].join(" ")}
                              >
                                {unread ? (
                                  <Mail className="w-5 h-5 text-accent" />
                                ) : (
                                  <MailOpen className="w-5 h-5 text-muted" />
                                )}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-extrabold text-text truncate">{msg.remitente}</p>
                                <p className="text-[11px] text-muted shrink-0">{msg.tiempo}</p>
                              </div>

                              <p className="mt-1 text-xs font-semibold text-accent truncate">{msg.asunto}</p>

                              <p className="mt-1 text-xs text-muted line-clamp-2">{msg.preview}</p>

                              <div className="mt-2 flex items-center gap-2">
                                {unread && (
                                  <span className={badgeColor({ theme, color: "emerald" })}>
                                    Nuevo
                                  </span>
                                )}

                                <span className={badgeColor({ theme, color: "slate" })}>
                                  Conversación
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* DETALLE */}
                <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden">
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl border border-border bg-surface/40 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-muted" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-text">Detalle del mensaje</div>
                        <div className="text-xs text-muted">Selecciona un mensaje para ver el contenido.</div>
                      </div>
                    </div>

                    {selected && (
                      <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className="h-10 w-10 rounded-2xl border border-border bg-surface/60 hover:bg-surface flex items-center justify-center"
                        title="Cerrar"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {!selected ? (
                    <div className="p-10 text-center text-muted">
                      <div className="mx-auto mb-4 h-14 w-14 rounded-3xl border border-border bg-surface/40 flex items-center justify-center">
                        <MailOpen className="w-7 h-7 text-muted" />
                      </div>
                      <p className="text-text font-semibold">Aún no has seleccionado un mensaje</p>
                      <p className="text-sm text-muted mt-2 max-w-md mx-auto">
                        Usa la lista de la izquierda para abrir una conversación y revisar la información.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6">
                      {/* Header del mensaje */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-xs text-muted">Remitente</div>
                          <div className="text-lg font-extrabold text-text">{selected.remitente}</div>

                          <div className="mt-2 text-xs text-muted">Asunto</div>
                          <div className="text-sm font-semibold text-accent">{selected.asunto}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={badgeColor({ theme, color: "slate" })}>{selected.tiempo}</span>
                          {!selected.leido && <span className={badgeColor({ theme, color: "emerald" })}>Nuevo</span>}
                        </div>
                      </div>

                      {/* Cuerpo */}
                      <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-5">
                        <div className="text-xs font-semibold text-muted mb-2">Mensaje</div>
                        <p className="text-sm text-text/90 whitespace-pre-wrap leading-relaxed">
                          {/* Si luego agregas msg.body lo muestras aquí.
                              Por ahora usamos preview como contenido */}
                          {selected.preview}
                        </p>
                      </div>

                      {/* Acciones (placeholder) */}
                      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={() => setSelected(null)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-2 text-sm font-semibold text-text hover:bg-surface transition"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Volver
                        </button>

                        <button
                          type="button"
                          onClick={() => alert("Luego conectamos respuesta real 😉")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
                        >
                          Responder
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </Layout>
  );
}

/* ---------- UI helpers ---------- */

function Chip({ text, active = false, theme }) {
  return <span className={chipClass(active, theme)}>{text}</span>;
}