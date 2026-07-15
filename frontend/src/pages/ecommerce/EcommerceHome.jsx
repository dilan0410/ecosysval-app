// src/pages/ecommerce/EcommerceHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, BarChart3, Scale, FileText } from "lucide-react";
import Layout from "../../components/Layout";

export default function EcommerceHome() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Marketplace B2B",
      desc: "Explora productos/servicios por país, sector, precio y proveedor.",
      icon: <ShoppingCart className="w-5 h-5" />,
      to: "/ecommerce/marketplace",
      tone: "blue",
    },
    {
      title: "Cotizaciones inteligentes",
      desc: "Cotiza por volumen, entrega estimada, tipo de cambio y logística.",
      icon: <FileText className="w-5 h-5" />,
      to: "/ecommerce/cotizaciones",
      tone: "amber",
    },
    {
      title: "Comparador de proveedores",
      desc: "Compara precio, lead time, verificación y cumplimiento.",
      icon: <Scale className="w-5 h-5" />,
      to: "/ecommerce/comparador",
      tone: "emerald",
    },
    {
      title: "Analytics",
      desc: "Resumen de compras, ventas, ahorro y desempeño (demo).",
      icon: <BarChart3 className="w-5 h-5" />,
      to: "/ecommerce/analytics",
      tone: "violet",
    },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Top bar (Title + Right slot) — MISMOS TEXTOS que _EcomLayout */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-4">
            <h1 className="text-text font-extrabold text-lg md:text-xl">
              E-commerce • Marketplace B2B Inteligente
            </h1>
            <p className="text-muted text-sm mt-1">
              Compra, vende y negocia con información estratégica (MX • US • CA).
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => navigate("/ecommerce/marketplace")}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
            >
              Ir al Marketplace
            </button>
          </div>
        </div>

        {/* Grid accesos */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => (
            <button
              key={c.title}
              type="button"
              onClick={() => navigate(c.to)}
              className={[
                "text-left rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5",
                "hover:bg-surface/75 hover:-translate-y-0.5 transition",
                "text-text relative overflow-hidden",
              ].join(" ")}
            >
              <div className={glowByTone(c.tone)} />

              <div className={iconWrapByTone(c.tone)}>
                <div className="text-text/90">{c.icon}</div>
              </div>

              <div className="mt-4">
                <div className="font-extrabold">{c.title}</div>
                <div className="text-muted text-sm mt-1">{c.desc}</div>
              </div>
            </button>
          ))}
        </section>

        {/* Value props — MISMOS TEXTOS que _EcomLayout */}
        <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 text-text">
          <div className="font-extrabold">Qué hace "pro" este E-commerce</div>

          <ul className="mt-3 grid gap-2 md:grid-cols-2 text-sm text-muted">
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-text/85">Cotización por volumen + logística estimada</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-text/85">Comparador de proveedores con cumplimiento</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-text/85">Multi-país y multi-moneda (MXN/USD/CAD)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-text/85">Base para crédito, pagos y tracking (fase 2)</span>
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}

/* -------------------- UI helpers -------------------- */

function iconWrapByTone(tone) {
  const base = "rounded-2xl p-3 w-fit border border-border bg-surface/50";
  const map = {
    blue: "ring-1 ring-blue-400/20 bg-[linear-gradient(135deg,rgba(59,130,246,0.14),transparent)]",
    amber: "ring-1 ring-amber-400/20 bg-[linear-gradient(135deg,rgba(236,182,14,0.16),transparent)]",
    emerald: "ring-1 ring-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),transparent)]",
    violet: "ring-1 ring-violet-400/20 bg-[linear-gradient(135deg,rgba(139,92,246,0.14),transparent)]",
  };
  return `${base} ${map[tone] || map.blue}`;
}

function glowByTone(tone) {
  const base = "pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl";
  const map = {
    blue: "bg-blue-400/15",
    amber: "bg-amber-400/18",
    emerald: "bg-emerald-400/15",
    violet: "bg-violet-400/15",
  };
  return `${base} ${map[tone] || map.blue}`;
}