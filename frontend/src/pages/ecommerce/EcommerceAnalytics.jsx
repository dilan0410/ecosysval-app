// src/pages/ecommerce/EcommerceAnalytics.jsx
/**
 * ECOMMERCE ANALYTICS (Demo)
 * -------------------------------------------------------
 * ✅ Theme:
 * - No define fondo (Theme global + Layout).
 * - Tokens: bg-surface, text-text, text-muted, border-border, ring-ring, shadow-pro, bg-accent.
 */

import React from "react";
import Layout from "../../components/Layout";

export default function EcommerceAnalytics() {
  const stats = [
    { label: "Compras (mes)", value: "12", hint: "Transacciones confirmadas" },
    { label: "Ventas (mes)", value: "7", hint: "Órdenes cerradas" },
    { label: "Ahorro estimado", value: "USD $4,250", hint: "Por comparación proveedores" },
    { label: "Cumplimiento promedio", value: "91%", hint: "Score logístico/comercial" },
  ];

  const insights = [
    "Mejor categoría del mes: Madera (alta demanda)",
    "Proveedor top: cumplimiento +95%",
    "Mayor ahorro: comparador activado en 60% de órdenes",
    "Oportunidad: activar logística estimada por API",
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-5">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-4">
            <h1 className="text-text font-extrabold text-lg md:text-xl">
              Analytics
            </h1>
            <p className="text-muted text-sm mt-1">
              Resumen ejecutivo del e-commerce (demo).
            </p>
          </div>
          {/* Sin botones — Analytics no tenía rightSlot */}
        </div>

        {/* KPIs — igual */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <KpiCard key={s.label} label={s.label} value={s.value} hint={s.hint} />
          ))}
        </section>

        {/* Insights — igual */}
        <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 text-text">
          <div className="font-extrabold">Insights (demo)</div>

          <ul className="mt-3 text-sm text-muted grid gap-2 md:grid-cols-2">
            {insights.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-text/85">{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-4 text-xs text-muted">
            Nota: Este módulo es demostrativo. Luego conectamos métricas reales (órdenes, ahorro, cumplimiento, tiempos de entrega).
          </div>
        </section>

      </div>
    </Layout>
  );
}

/* -------------------- UI -------------------- */

function KpiCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 text-text">
      <div className="text-muted text-xs">{label}</div>
      <div className="text-text font-extrabold text-3xl mt-2">{value}</div>
      <div className="text-muted text-xs mt-2">{hint}</div>
    </div>
  );
}