// src/pages/ecommerce/Checkout.jsx
/**
 * CHECKOUT (Ecom) - Demo B2B
 * -------------------------------------------------------
 * ✅ Objetivo:
 * - Simular un checkout desde una cotización (sin backend).
 * - Lee `selectedId` desde route state (location.state).
 * - Muestra detalle del producto + notas de negociación + métodos de pago (demo).
 *
 * ✅ THEME:
 * - No usa fondo propio (eso vive en el Theme global + EcomLayout).
 * - Usa tokens: bg-surface, text-text, border-border, ring-ring, etc.
 */

import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { productosMock } from "../../data/ecommerceMock";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  /** selectedId llega desde: navigate("/ecommerce/checkout", { state: { selectedId } }) */
  const selectedId = location.state?.selectedId || "";

  /** Busca item en mock (luego: backend) */
  const item = useMemo(
    () => productosMock.find((x) => x.id === selectedId) || null,
    [selectedId]
  );

  /** Notas de negociación (solo demo) */
  const [notes, setNotes] = useState("");

  function goBackToCotizacion() {
    navigate("/ecommerce/cotizaciones", { state: { selectedId } });
  }

  function confirmOrder() {
    // TODO: conectar backend (crear orden) + flujo pagos
    alert("Orden creada (demo). Luego lo conectamos con backend/pagos.");
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-5">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-4">
            <h1 className="text-text font-extrabold text-lg md:text-xl">
              Checkout (demo)
            </h1>
            <p className="text-muted text-sm mt-1">
              Simulación de compra B2B.
            </p>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1fr_420px]">
          {/* ---------------------------
              Detalle + Notas
          ---------------------------- */}
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 text-text">
            <div className="font-extrabold">Detalle</div>

            {!item ? (
              <div className="mt-3 text-muted">
                No hay item seleccionado. Vuelve a cotizaciones y elige un producto.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {/* Card info producto */}
                <div className="rounded-2xl border border-border bg-surface/40 p-4">
                  <div className="text-xs text-muted">
                    {item.tipo} • {item.categoria}
                  </div>

                  <div className="text-text font-extrabold mt-1">
                    {item.nombre}
                  </div>

                  <div className="text-muted text-sm mt-1">
                    Proveedor:{" "}
                    <span className="text-text font-semibold">
                      {item.proveedor?.nombre || "—"}
                    </span>
                  </div>
                </div>

                {/* Notas */}
                <label className="block">
                  <span className="block text-xs font-semibold text-muted mb-1">
                    Notas de negociación
                  </span>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className={[
                      "w-full rounded-2xl px-3 py-2 outline-none",
                      "border border-border bg-surface/60 text-text placeholder:text-muted/70",
                      "focus:ring-2 focus:ring-ring/40",
                    ].join(" ")}
                    placeholder="Condiciones, tiempos, requisitos..."
                  />
                </label>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={goBackToCotizacion}
                    className="rounded-2xl border border-border bg-surface/60 hover:bg-surface transition px-5 py-3 text-sm font-semibold text-text shadow-pro"
                  >
                    Volver a cotización
                  </button>

                  <button
                    type="button"
                    onClick={confirmOrder}
                    className="rounded-2xl bg-accent px-5 py-3 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
                  >
                    Confirmar orden
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ---------------------------
              Sidebar pago (demo)
          ---------------------------- */}
          <aside className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 h-fit text-text">
            <div className="font-extrabold">Método de pago (demo)</div>

            <div className="mt-3 text-sm space-y-2">
              <div className="rounded-2xl border border-border bg-surface/40 p-4 text-muted">
                • Pago inmediato
              </div>
              <div className="rounded-2xl border border-border bg-surface/40 p-4 text-muted">
                • Pago a crédito (fase 2)
              </div>
              <div className="rounded-2xl border border-border bg-surface/40 p-4 text-muted">
                • Pago por hitos (fase 2)
              </div>
            </div>
          </aside>
        </section>

      </div>
    </Layout>
  );
}