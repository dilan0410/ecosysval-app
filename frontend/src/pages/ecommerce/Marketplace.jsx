// src/pages/ecommerce/Marketplace.jsx
/**
 * MARKETPLACE B2B (Ecosysval)
 * -------------------------------------------------------
 * ✅ Objetivo:
 * - Explorar productos/servicios por país, tipo y categoría.
 * - Buscador por nombre/categoría/proveedor.
 * - CTA rápido: cotizar y comparar proveedores.
 *
 * ✅ THEME:
 * - No usa fondo propio (eso vive en el Theme global + Layout).
 * - Usa tokens: bg-surface, text-text, border-border, ring-ring, etc.
 */

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, BadgeCheck, MapPin } from "lucide-react";
import Layout from "../../components/Layout";
import { PAISES, categorias, productosMock } from "../../data/ecommerceMock";

export default function Marketplace() {
  const navigate = useNavigate();

  // -------------------------
  // Filtros
  // -------------------------
  const [pais, setPais] = useState("MX");
  const [tipo, setTipo] = useState("Todos");
  const [categoria, setCategoria] = useState("Todas");
  const [q, setQ] = useState("");

  const currency = useMemo(
    () => PAISES.find((p) => p.code === pais)?.currency || "MXN",
    [pais]
  );

  // -------------------------
  // Filtrado (memo)
  // -------------------------
  const items = useMemo(() => {
    const term = q.trim().toLowerCase();

    return productosMock
      .filter((x) => (pais ? x.pais === pais : true))
      .filter((x) => (tipo === "Todos" ? true : x.tipo === tipo))
      .filter((x) => (categoria === "Todas" ? true : x.categoria === categoria))
      .filter((x) => {
        if (!term) return true;

        return (
          (x.nombre || "").toLowerCase().includes(term) ||
          (x.categoria || "").toLowerCase().includes(term) ||
          (x.proveedor?.nombre || "").toLowerCase().includes(term)
        );
      });
  }, [pais, tipo, categoria, q]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-5">

        {/* Top bar (Title + botones) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-4">
            <h1 className="text-text font-extrabold text-lg md:text-xl">
              Marketplace B2B
            </h1>
            <p className="text-muted text-sm mt-1">
              Explora ofertas por país, sector, proveedor y tipo.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/ecommerce/cotizaciones")}
              className="rounded-full border border-border bg-surface/60 hover:bg-surface transition px-4 py-2.5 text-text text-sm font-semibold shadow-pro"
            >
              Ir a Cotizaciones
            </button>

            <button
              type="button"
              onClick={() => navigate("/ecommerce/comparador")}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
            >
              Comparador
            </button>
          </div>
        </div>

        {/* FILTROS — sin cambios */}
        <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5 text-text">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-xl">
              <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar productos, servicios, proveedor..."
                className={[
                  "w-full pl-11 pr-4 py-3 rounded-2xl",
                  "bg-surface/60 border border-border",
                  "text-text placeholder:text-muted/70 outline-none",
                  "focus:ring-2 focus:ring-ring/40",
                ].join(" ")}
              />
            </div>

            {/* Selects */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="inline-flex items-center gap-2 text-muted text-sm">
                <SlidersHorizontal className="w-4 h-4" />
                Filtros:
              </span>

              <Select
                value={pais}
                onChange={setPais}
                options={PAISES.map((p) => ({
                  value: p.code,
                  label: `${p.name} (${p.currency})`,
                }))}
              />

              <Select
                value={tipo}
                onChange={setTipo}
                options={[
                  { value: "Todos", label: "Todos" },
                  { value: "Producto", label: "Producto" },
                  { value: "Servicio", label: "Servicio" },
                ]}
              />

              <Select
                value={categoria}
                onChange={setCategoria}
                options={[
                  { value: "Todas", label: "Todas" },
                  ...categorias.map((c) => ({ value: c, label: c })),
                ]}
              />
            </div>
          </div>

          <div className="mt-3 text-muted text-sm">
            Mostrando <span className="text-text font-semibold">{items.length}</span> resultados en{" "}
            <span className="text-text font-semibold">{pais}</span> • Moneda:{" "}
            <span className="text-accent font-semibold">{currency}</span>
          </div>
        </section>

        {/* GRID — sin cambios */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((x) => (
            <article
              key={x.id}
              className={[
                "rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5",
                "hover:bg-surface/75 hover:-translate-y-0.5 transition cursor-pointer",
                "text-text relative overflow-hidden",
              ].join(" ")}
              onClick={() => navigate(`/ecommerce/producto/${x.id}`)}
              role="button"
              tabIndex={0}
            >
              {/* glow */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent/18 blur-3xl" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-muted text-xs">
                    {x.tipo} • {x.categoria} • {x.incoterm}
                  </div>
                  <div className="font-extrabold mt-1 truncate">{x.nombre}</div>
                </div>

                <span className="shrink-0 rounded-full border border-border bg-surface/40 px-3 py-1 text-[11px] text-muted">
                  ⭐ {x.rating}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl border border-border bg-surface/40 px-3 py-2">
                  <div className="text-muted text-[11px]">Precio base</div>
                  <div className="font-extrabold">
                    {formatMoney(x.precioBase, x.moneda)}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface/40 px-3 py-2">
                  <div className="text-muted text-[11px]">Unidad</div>
                  <div className="font-semibold">{x.unidad}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate flex items-center gap-1">
                    {x.proveedor?.verificado && (
                      <BadgeCheck className="w-4 h-4 text-emerald-500" />
                    )}
                    {x.proveedor?.nombre || "—"}
                  </div>

                  <div className="text-muted text-xs flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {x.proveedor?.ciudad || "—"}, {x.proveedor?.estado || "—"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/ecommerce/cotizaciones", { state: { selectedId: x.id } });
                  }}
                  className="rounded-2xl bg-accent px-4 py-2 text-xs font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
                >
                  Cotizar
                </button>
              </div>
            </article>
          ))}
        </section>

        {!items.length && (
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-12 text-center text-text">
            <div className="text-4xl mb-3">🛒</div>
            <p className="font-semibold">No hay resultados con esos filtros</p>
            <p className="text-muted text-sm mt-1">Prueba cambiando país, tipo o la búsqueda.</p>
          </div>
        )}

      </div>
    </Layout>
  );
}

/* -------------------- UI helpers -------------------- */

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={[
        "rounded-2xl px-4 py-3 text-sm outline-none",
        "bg-surface/60 border border-border text-text",
        "focus:ring-2 focus:ring-ring/40",
      ].join(" ")}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
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