// src/pages/ecommerce/Comparador.jsx
/**
 * COMPARADOR DE PROVEEDORES (Ecom) - Demo
 * -------------------------------------------------------
 * ✅ Objetivo:
 * - Comparar proveedores por precio relativo, lead time, verificación,
 *   cumplimiento y rating (mock).
 *
 * ✅ THEME:
 * - No define fondo (lo maneja el theme global + Layout).
 * - Usa tokens: bg-surface, text-text, border-border, ring-ring, etc.
 */

import React, { useMemo, useState } from "react";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import Layout from "../../components/Layout";
import { proveedoresMock } from "../../data/ecommerceMock";

const ORDENES = [
  { value: "precio", label: "Orden: Precio" },
  { value: "lead", label: "Orden: Lead time" },
  { value: "rating", label: "Orden: Rating" },
  { value: "cumplimiento", label: "Orden: Cumplimiento" },
];

function VerificationBadge({ verificado }) {
  if (verificado) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        <BadgeCheck className="w-4 h-4" />
        Verificado
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
      <ShieldAlert className="w-4 h-4" />
      No verificado
    </span>
  );
}

function PriceChip({ value }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface/40 px-3 py-1 text-xs text-text">
      {Number(value).toFixed(2)}
    </span>
  );
}

export default function Comparador() {
  const [orden, setOrden] = useState("precio");

  const rows = useMemo(() => {
    const arr = [...proveedoresMock];

    if (orden === "precio") arr.sort((a, b) => a.precioRelativo - b.precioRelativo);
    if (orden === "lead") arr.sort((a, b) => a.leadTimeDias - b.leadTimeDias);
    if (orden === "rating") arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (orden === "cumplimiento") arr.sort((a, b) => (b.cumplimiento ?? 0) - (a.cumplimiento ?? 0));

    return arr;
  }, [orden]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-5">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-4">
            <h1 className="text-text font-extrabold text-lg md:text-xl">
              Comparador de proveedores
            </h1>
            <p className="text-muted text-sm mt-1">
              Comparación por precio, lead time, verificación y cumplimiento.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className={[
                "rounded-2xl px-3 py-2 text-sm outline-none transition",
                "border border-border bg-surface/60 text-text",
                "focus:ring-2 focus:ring-ring/40",
              ].join(" ")}
            >
              {ORDENES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contenido — igual */}
        <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden">
          <div className="px-6 py-4 border-b border-border text-sm text-muted">
            Precio relativo:{" "}
            <span className="text-text font-semibold">1.00 = referencia</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted">
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 font-semibold whitespace-nowrap">Proveedor</th>
                  <th className="text-left px-6 py-3 font-semibold whitespace-nowrap">País</th>
                  <th className="text-left px-6 py-3 font-semibold whitespace-nowrap">Verificación</th>
                  <th className="text-left px-6 py-3 font-semibold whitespace-nowrap">Precio relativo</th>
                  <th className="text-left px-6 py-3 font-semibold whitespace-nowrap">Lead time</th>
                  <th className="text-left px-6 py-3 font-semibold whitespace-nowrap">Cumplimiento</th>
                  <th className="text-left px-6 py-3 font-semibold whitespace-nowrap">Rating</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border text-text/90 hover:bg-surface/40 transition"
                  >
                    <td className="px-6 py-4 font-semibold whitespace-nowrap">{p.nombre}</td>
                    <td className="px-6 py-4 text-muted whitespace-nowrap">{p.pais}</td>
                    <td className="px-6 py-4"><VerificationBadge verificado={!!p.verificado} /></td>
                    <td className="px-6 py-4"><PriceChip value={p.precioRelativo} /></td>
                    <td className="px-6 py-4 text-muted whitespace-nowrap">{p.leadTimeDias} días</td>
                    <td className="px-6 py-4 text-muted whitespace-nowrap">{p.cumplimiento}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-accent">⭐</span>
                        <span className="font-semibold">{p.rating}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 text-xs text-muted">
            Tip: ordena por "Lead time" para priorizar proveedores más rápidos o por "Cumplimiento" para reducir riesgo.
          </div>
        </section>

      </div>
    </Layout>
  );
}