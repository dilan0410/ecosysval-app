// src/pages/Notificaciones.jsx
import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";
import { notificacionesMock } from "../data/notificacionesMock";
import { Search, Bell, CheckCheck } from "lucide-react";

export default function Notificaciones() {
  const [q, setQ] = useState("");

  const notifs = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return notificacionesMock;

    return notificacionesMock.filter((n) => {
      const t = (n.tipo || "").toLowerCase();
      const e = (n.empresa || "").toLowerCase();
      const d = (n.detalle || "").toLowerCase();
      return t.includes(term) || e.includes(term) || d.includes(term);
    });
  }, [q]);

  const unreadCount = useMemo(
    () => (notificacionesMock || []).filter((n) => !n.leido).length,
    []
  );

  return (
    <Layout>
      <div className="mx-auto w-full max-w-7xl">
        {/* Header de página */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#ffd166]" />
              Centro de notificaciones
            </div>

            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-white drop-shadow">
              Notificaciones{" "}
              <span className="text-[#ffd166]">del ecosistema</span>
            </h1>

            <p className="mt-2 text-sm text-white/75 max-w-2xl">
              Mantente al día con eventos, novedades y actividad relevante.
            </p>

            <div className="mt-4 h-1 w-56 rounded bg-[#ffd166]" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/90 backdrop-blur">
              No leídas: <strong className="text-white">{unreadCount}</strong>
            </span>

            <button
              type="button"
              onClick={() => alert("Luego conectamos 'Marcar todo como leído'")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ffd166] px-4 py-2 text-xs font-extrabold text-slate-900 shadow hover:brightness-95 transition"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todo como leído
            </button>
          </div>
        </div>

        {/* Contenedor principal */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Top bar */}
          <div className="p-5 border-b border-white/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-white/50 absolute left-3 top-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar notificaciones..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 pl-9 pr-3 py-2.5 text-sm text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#ffd166]/40"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip text="Todas" active />
              <Chip text="No leídas" />
              <Chip text="Transacciones" />
              <Chip text="Sistema" />
            </div>
          </div>

          {/* Lista */}
          <div className="p-5">
            {notifs.length === 0 ? (
              <div className="p-10 text-center text-white/70">
                <div className="mx-auto mb-3 h-12 w-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white/70" />
                </div>
                No tienes notificaciones por el momento.
              </div>
            ) : (
              <div className="grid gap-3">
                {notifs.map((notif) => {
                  const unread = !notif.leido;

                  return (
                    <article
                      key={notif.id}
                      className={[
                        "rounded-2xl border p-4 md:p-5 flex items-start justify-between gap-4 transition",
                        "bg-black/20 backdrop-blur",
                        unread
                          ? "border-[#ffd166]/20 ring-1 ring-[#ffd166]/10"
                          : "border-white/10",
                        "hover:bg-white/5",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <div
                          className={[
                            "h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0",
                            unread
                              ? "border-[#ffd166]/30 bg-[#ffd166]/10"
                              : "border-white/10 bg-white/5",
                          ].join(" ")}
                        >
                          <Bell
                            className={[
                              "w-5 h-5",
                              unread ? "text-[#ffd166]" : "text-white/70",
                            ].join(" ")}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={[
                                "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                                badgeByTipo(notif.tipo),
                              ].join(" ")}
                            >
                              {notif.tipo}
                            </span>

                            {unread && (
                              <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                                Nuevo
                              </span>
                            )}
                          </div>

                          <p className="mt-2 font-extrabold text-white text-sm truncate">
                            {notif.empresa}
                          </p>

                          <p className="mt-1 text-xs text-white/75 leading-relaxed">
                            {notif.detalle}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-white/50">
                          {notif.tiempo}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}

/* ---------- UI helpers ---------- */

function Chip({ text, active = false }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold",
        active
          ? "border-[#ffd166]/30 bg-[#ffd166]/15 text-[#ffd166]"
          : "border-white/10 bg-white/5 text-white/70",
      ].join(" ")}
    >
      {text}
    </span>
  );
}

function badgeByTipo(tipo) {
  const t = (tipo || "").toLowerCase();
  if (t.includes("alerta") || t.includes("error")) {
    return "border-red-400/20 bg-red-500/10 text-red-200";
  }
  if (t.includes("trans") || t.includes("pago") || t.includes("compra")) {
    return "border-sky-400/20 bg-sky-500/10 text-sky-200";
  }
  if (t.includes("info") || t.includes("sistema")) {
    return "border-white/10 bg-white/5 text-white/80";
  }
  return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
}