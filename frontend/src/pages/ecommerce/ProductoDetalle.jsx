// src/pages/ecommerce/ProductoDetalle.jsx
/**
 * PRODUCTO DETALLE (E-commerce Ecosysval)
 * -------------------------------------------------------
 * ✅ THEME:
 * - No usa fondo (Theme global + Layout).
 * - Tokens: bg-surface, text-text, text-muted, border-border, ring-ring, bg-accent.
 */

import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, ShieldCheck, FileText, Scale } from "lucide-react";
import Layout from "../../components/Layout";
import { productosMock } from "../../data/ecommerceMock";
import { useTheme } from "../../components/ThemeProvider";

export default function ProductoDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();

  const item = useMemo(() => productosMock.find((x) => x.id === id) || null, [id]);

  if (!item) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-4">
              <h1 className="text-text font-extrabold text-lg md:text-xl">
                Producto no encontrado
              </h1>
              <p className="text-muted text-sm mt-1">Verifica el ID</p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-8 text-text">
            <div className="text-sm text-muted">
              No existe el producto/servicio solicitado.
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate("/ecommerce/marketplace")}
                className="rounded-2xl bg-accent px-5 py-3 font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
              >
                Volver al Marketplace
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-text hover:bg-surface transition"
              >
                Volver atrás
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-5">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-4">
            <h1 className="text-text font-extrabold text-lg md:text-xl">
              {item.nombre}
            </h1>
            <p className="text-muted text-sm mt-1">
              {item.tipo} • {item.categoria} • {item.incoterm}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-border bg-surface/60 hover:bg-surface transition px-4 py-3 text-text shadow-pro inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </div>
        </div>

        {/* Contenido — igual */}
        <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 text-text">
            <div className="text-sm">
              <span className="font-extrabold text-text">Descripción</span>
            </div>

            <p className="mt-2 text-sm text-text/90 whitespace-pre-wrap leading-relaxed">
              {item.descripcion}
            </p>

            <div className="mt-6 grid md:grid-cols-3 gap-3">
              <Info label="Precio base" value={formatMoney(item.precioBase, item.moneda)} />
              <Info label="Unidad" value={item.unidad} />
              <Info label="Stock" value={`${item.stock ?? 0}`} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Chip text={`Rating: ${item.rating ?? "—"}`} />
              <Chip text={`Incoterm: ${item.incoterm ?? "—"}`} />
              <Chip text={`País: ${item.pais ?? "—"}`} />
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate("/ecommerce/cotizaciones", { state: { selectedId: item.id } })}
                className="rounded-2xl bg-accent px-5 py-3 font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition inline-flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Generar cotización
              </button>

              <button
                type="button"
                onClick={() => navigate("/ecommerce/checkout", { state: { selectedId: item.id } })}
                className="rounded-2xl border border-border bg-surface/60 hover:bg-surface transition px-5 py-3 text-text shadow-pro"
              >
                Ir a checkout (mock)
              </button>
            </div>
          </div>

          <aside className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 h-fit text-text">
            <div className="flex items-center justify-between gap-3">
              <div className="text-text font-extrabold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Proveedor
              </div>

              <button
                type="button"
                onClick={() => navigate("/ecommerce/comparador")}
                className="rounded-2xl border border-border bg-surface/60 hover:bg-surface transition px-3 py-2 text-xs font-semibold text-text inline-flex items-center gap-2"
                title="Comparar proveedores"
              >
                <Scale className="w-4 h-4" />
                Comparar
              </button>
            </div>

            <div className="mt-3">
              <div className="text-text font-extrabold">
                {item.proveedor?.nombre ?? "—"}{" "}
                {item.proveedor?.verificado && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-500 ml-2">
                    <BadgeCheck className="w-4 h-4" /> Verificado
                  </span>
                )}
              </div>

              <div className="text-muted text-sm mt-1">
                {item.proveedor?.ciudad ?? "—"}, {item.proveedor?.estado ?? "—"}
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              <Info label="Cumplimiento" value={`${item.proveedor?.cumplimiento ?? "—"}%`} />
              <Info label="Entrega a MX" value={`${item.tiemposEntrega?.MX ?? "—"} días`} />
              <Info label="Entrega a US" value={`${item.tiemposEntrega?.US ?? "—"} días`} />
              <Info label="Entrega a CA" value={`${item.tiemposEntrega?.CA ?? "—"} días`} />
            </div>

            <button
              type="button"
              onClick={() => navigate("/ecommerce/comparador")}
              className="mt-6 w-full rounded-2xl border border-border bg-surface/60 hover:bg-surface transition px-5 py-3 text-text shadow-pro"
            >
              Ver comparador de proveedores
            </button>

            <div className="mt-4 text-[11px] text-muted">
              Theme activo: <span className="text-text font-semibold">{theme}</span>
            </div>
          </aside>
        </section>

      </div>
    </Layout>
  );
}

/* ---------------- UI helpers ---------------- */

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 px-4 py-3">
      <div className="text-muted text-[11px]">{label}</div>
      <div className="text-text font-extrabold mt-0.5 truncate">{value}</div>
    </div>
  );
}

function Chip({ text }) {
  return (
    <span className="rounded-full border border-border bg-surface/40 px-3 py-1 text-xs text-muted">
      {text}
    </span>
  );
}

function formatMoney(v, currency) {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `${currency} ${v}`;
  }
}