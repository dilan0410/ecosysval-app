// src/pages/ecommerce/MisCompras.jsx
/**
 * MIS COMPRAS (E-commerce Ecosysval)
 * -------------------------------------------------------
 * ✅ THEME:
 * - No usa fondo (Theme global + Layout).
 * - Tokens: bg-surface, text-text, text-muted, border-border, ring-ring, bg-accent.
 */

import React, { useMemo } from "react";
import Layout from "../../components/Layout";
import { useTheme } from "../../components/ThemeProvider";

const comprasMock = [
  {
    id: "c-01",
    item: "Madera refinada premium",
    total: "MXN $85,000",
    estado: "En proceso",
    fecha: "2026-01-20",
  },
  {
    id: "c-02",
    item: "Acero laminado 304",
    total: "USD $11,000",
    estado: "Entregado",
    fecha: "2026-01-10",
  },
];

function badgeByEstado(estado, theme) {
  const isLight = theme === "light";
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold";

  const map = {
    "En proceso": isLight
      ? "bg-amber-500/10 text-amber-800 border-amber-400/25"
      : "bg-amber-500/15 text-amber-200 border-amber-300/25",
    Entregado: isLight
      ? "bg-emerald-500/10 text-emerald-800 border-emerald-400/25"
      : "bg-emerald-500/15 text-emerald-200 border-emerald-300/25",
  };

  return `${base} ${map[estado] || (isLight
    ? "bg-slate-500/10 text-slate-800 border-slate-400/25"
    : "bg-slate-500/15 text-slate-200 border-slate-300/25")}`;
}

export default function MisCompras() {
  const { theme } = useTheme();
  const total = useMemo(() => comprasMock.length, []);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-5">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-4">
            <h1 className="text-text font-extrabold text-lg md:text-xl">
              Mis compras
            </h1>
            <p className="text-muted text-sm mt-1">
              Historial de compras (demo).
            </p>
          </div>
          {/* Sin botones — MisCompras no tenía rightSlot */}
        </div>

        {/* Contenido — igual */}
        <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden text-text">
          <div className="px-6 py-4 border-b border-border text-sm">
            <span className="text-muted">Compras registradas:</span>{" "}
            <span className="text-text font-semibold">{total}</span>
          </div>

          {comprasMock.map((c, idx) => (
            <div
              key={c.id}
              className={[
                "px-6 py-4",
                idx !== comprasMock.length - 1 ? "border-b border-border" : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-text font-extrabold truncate">
                    {c.item}
                  </div>
                  <div className="text-muted text-xs mt-1">
                    {c.fecha} • ID: <span className="text-text">{c.id}</span>
                  </div>

                  <div className="mt-2">
                    <span className={badgeByEstado(c.estado, theme)}>
                      {c.estado}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-text font-extrabold">{c.total}</div>
                  <div className="text-muted text-xs mt-1">Total</div>
                </div>
              </div>
            </div>
          ))}

          {!comprasMock.length && (
            <div className="p-10 text-center">
              <div className="text-4xl mb-3">🧾</div>
              <div className="font-semibold">Aún no tienes compras</div>
              <div className="text-muted text-sm mt-1">
                Cuando confirmes una orden, aparecerá aquí.
              </div>
            </div>
          )}
        </section>

      </div>
    </Layout>
  );
}