// src/pages/HerramientasFinancieras.jsx
/**
 * HERRAMIENTAS FINANCIERAS (ECOSYSVAL)
 * -------------------------------------------------------
 * ✅ Objetivo:
 * - Módulo de apoyo para decisiones rápidas:
 *   1) Resumen (KPIs + sugerencias)
 *   2) Conversor de monedas (FX)
 *   3) Mercados / commodities
 *   4) Calculadora de precio sugerido (costos + margen)
 *
 * ✅ IMPORTANTE (THEME + FONDO):
 * - ❌ NO se usa backgroundImage en la página (NO fondo.png por encima).
 * - ✅ El fondo vive globalmente por tema (claro.png / oscuro.png) en CSS.
 * - ✅ Aquí solo agregamos un overlay "glow" suave para mejorar contraste,
 *   sin reemplazar ni tapar el fondo.
 *
 * ✅ UI:
 * - Tokens Tailwind del theme: bg-surface, text-text, border-border, ring, muted, shadow-pro.
 * - Controles consistentes con Grupos.jsx
 */

import React, { useMemo, useState } from "react";
import {
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  Calculator,
  Info,
  RefreshCcw,
  BadgeCheck,
} from "lucide-react";

import Layout from "../components/Layout";

/* ============================================================================
   DATA (MOCK)
   ============================================================================ */

const PAISES = [
  { code: "MX", name: "México", currency: "MXN" },
  { code: "US", name: "Estados Unidos", currency: "USD" },
  { code: "CA", name: "Canadá", currency: "CAD" },
];

const MONEDAS = ["MXN", "USD", "CAD"];

const FX_MOCK = {
  USD_MXN: 17.2,
  CAD_MXN: 12.7,
  MXN_USD: 1 / 17.2,
  MXN_CAD: 1 / 12.7,
  USD_CAD: 1.34,
  CAD_USD: 1 / 1.34,
};

const COMMODITIES_MOCK = [
  { id: 1, name: "Acero (HRC)", unit: "USD/ton", value: 720, change: "+1.2%" },
  { id: 2, name: "Madera (Lumber)", unit: "USD/MBF", value: 520, change: "-0.6%" },
  { id: 3, name: "Petróleo (WTI)", unit: "USD/barril", value: 78.4, change: "+0.9%" },
  { id: 4, name: "Maíz", unit: "USD/bushel", value: 4.62, change: "+0.2%" },
];

const TABS = [
  { key: "resumen", label: "Resumen", icon: Wallet },
  { key: "fx", label: "Monedas", icon: ArrowLeftRight },
  { key: "commodities", label: "Mercados", icon: TrendingUp },
  { key: "pricing", label: "Precio sugerido", icon: Calculator },
];

/* ============================================================================
   PAGE
   ============================================================================ */

export default function HerramientasFinancieras() {
  const [tab, setTab] = useState("resumen");

  const handleRefresh = () => {
    alert("Luego conectamos APIs: FX + Commodities + Indicadores");
  };

  return (
    <Layout mainClassName="!p-6">
            <div className="mx-auto w-full max-w-6xl space-y-6">
              {/* HEADER */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-5">
                  <h1 className="text-text font-extrabold text-xl md:text-2xl">
                    Herramientas financieras
                  </h1>
                  <p className="text-muted text-sm mt-1 max-w-2xl">
                    Toma decisiones más rápidas con indicadores, tipo de cambio, precios de mercado
                    y cálculos de rentabilidad (México, USA y Canadá).
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1 text-text">
                      <BadgeCheck className="w-4 h-4 text-emerald-500" />
                      Indicadores & alertas
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1 text-text">
                      <ArrowLeftRight className="w-4 h-4 text-accent" />
                      Monedas (FX)
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1 text-text">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Mercados / commodities
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-full bg-accent px-5 py-2 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition inline-flex items-center gap-2"
                  onClick={handleRefresh}
                  title="Actualizar (mock)"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Actualizar datos
                </button>
              </div>

              {/* TABS */}
              <div className="flex flex-wrap gap-2">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTab(t.key)}
                      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 border transition shadow-pro text-sm font-semibold ${
                        active
                          ? "bg-accent text-slate-900 border-border"
                          : "bg-surface/60 text-text border-border hover:bg-surface"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* CONTENIDO */}
              {tab === "resumen" && <ResumenPanel />}
              {tab === "fx" && <FXPanel />}
              {tab === "commodities" && <CommoditiesPanel />}
              {tab === "pricing" && <PricingPanel />}
            </div>
    </Layout>
  );
}

/* ============================================================================
   TAB 1: RESUMEN
   ============================================================================ */

function ResumenPanel() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6">
        <h2 className="text-text font-extrabold text-lg">Resumen financiero</h2>
        <p className="text-muted text-sm mt-1">
          Vista rápida para decisiones: indicadores clave + alertas.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <KpiCard title="Liquidez (mock)" value="1.42" note="Saludable" />
          <KpiCard title="Margen bruto (mock)" value="28%" note="Estable" />
          <KpiCard title="Capacidad compra (mock)" value="$45,000 USD" note="Estimado" />
          <KpiCard title="Riesgo TC (mock)" value="Medio" note="MXN vs USD" />
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-accent/20 border border-border p-2">
              <Info className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-text font-extrabold">Sugerencia</p>
              <p className="text-muted text-sm mt-1">
                Conecta el tipo de cambio y commodities para calcular un{" "}
                <span className="text-text font-extrabold">
                  precio mínimo recomendado
                </span>{" "}
                por país y proteger márgenes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6">
        <h3 className="text-text font-extrabold text-lg">Atajos</h3>
        <p className="text-muted text-sm mt-1">Acciones rápidas.</p>

        <div className="mt-5 grid gap-3">
          <QuickAction title="Convertir monedas" desc="MXN/USD/CAD con histórico." />
          <QuickAction title="Ver commodities" desc="Acero, madera, energía, agro." />
          <QuickAction title="Calcular precio sugerido" desc="Costos + margen + TC." />
        </div>
      </div>
    </section>
  );
}

function KpiCard({ title, value, note }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-5">
      <p className="text-muted text-xs font-semibold">{title}</p>
      <p className="text-text text-2xl font-extrabold mt-2">{value}</p>
      <p className="text-muted text-xs mt-1">{note}</p>
    </div>
  );
}

function QuickAction({ title, desc }) {
  return (
    <button
      type="button"
      className="text-left rounded-2xl border border-border bg-surface/40 hover:bg-surface transition p-4"
      onClick={() => alert(`Luego conectamos acción: ${title}`)}
    >
      <p className="text-text font-extrabold">{title}</p>
      <p className="text-muted text-xs mt-1">{desc}</p>
    </button>
  );
}

/* ============================================================================
   TAB 2: MONEDAS (FX)
   ============================================================================ */

function FXPanel() {
  const [pais, setPais] = useState("MX");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("MXN");
  const [amount, setAmount] = useState("1000");

  const rateKey = `${from}_${to}`;
  const rate = FX_MOCK[rateKey] || 0;

  const result = useMemo(() => {
    const a = Number(amount || 0);
    if (!rate || Number.isNaN(a)) return 0;
    return a * rate;
  }, [amount, rate]);

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6">
        <h2 className="text-text font-extrabold text-lg">Conversor de monedas</h2>
        <p className="text-muted text-sm mt-1">
          Preparado para conectar API (tipo de cambio real + variación).
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="País (contexto)">
            <select
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-ring/40"
            >
              {PAISES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Monto">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40"
              placeholder="1000"
            />
          </Field>

          <Field label="De">
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-ring/40"
            >
              {MONEDAS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>

          <Field label="A">
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-ring/40"
            >
              {MONEDAS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-5">
          <p className="text-muted text-xs font-semibold">Resultado</p>
          <p className="text-text text-3xl font-extrabold mt-2">
            {formatMoney(result, to)}
          </p>
          <p className="text-muted text-xs mt-2">
            Tipo de cambio (mock): <span className="text-text/90">{rate || "—"}</span>
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6">
        <h3 className="text-text font-extrabold text-lg">Notas</h3>
        <p className="text-muted text-sm mt-2">Luego aquí mostramos:</p>
        <ul className="mt-3 space-y-2 text-muted text-sm">
          <li>• Variación 7 / 30 / 90 días</li>
          <li>• Alertas por volatilidad</li>
          <li>• Impacto en margen</li>
        </ul>
      </div>
    </section>
  );
}

/* ============================================================================
   TAB 3: MERCADOS / COMMODITIES
   ============================================================================ */

function CommoditiesPanel() {
  return (
    <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-text font-extrabold text-lg">Mercados / Commodities</h2>
          <p className="text-muted text-sm mt-1">
            Lista base. Luego lo conectamos a TradingEconomics / Nasdaq Data Link.
          </p>
        </div>

        <button
          type="button"
          className="rounded-full bg-surface/60 border border-border px-5 py-2 text-sm font-extrabold text-text shadow-pro hover:bg-surface transition inline-flex items-center gap-2"
          onClick={() => alert("Luego: refrescar commodities desde API")}
        >
          <RefreshCcw className="w-4 h-4" />
          Refrescar
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface/40">
        <table className="w-full text-sm">
          <thead className="bg-surface/40">
            <tr className="text-muted">
              <th className="text-left px-4 py-3">Activo</th>
              <th className="text-left px-4 py-3">Unidad</th>
              <th className="text-right px-4 py-3">Valor</th>
              <th className="text-right px-4 py-3">Cambio</th>
            </tr>
          </thead>
          <tbody>
            {COMMODITIES_MOCK.map((c) => (
              <tr key={c.id} className="border-t border-border text-text/90 hover:bg-surface/60 transition">
                <td className="px-4 py-3 font-extrabold">{c.name}</td>
                <td className="px-4 py-3 text-muted">{c.unit}</td>
                <td className="px-4 py-3 text-right">{c.value}</td>
                <td className="px-4 py-3 text-right">{c.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ============================================================================
   TAB 4: PRECIO SUGERIDO
   ============================================================================ */

function PricingPanel() {
  const [pais, setPais] = useState("MX");
  const [monedaVenta, setMonedaVenta] = useState("MXN");
  const [costoBase, setCostoBase] = useState("100");
  const [logistica, setLogistica] = useState("15");
  const [otros, setOtros] = useState("10");
  const [margen, setMargen] = useState("25");

  const totalCosto = useMemo(() => {
    const a = Number(costoBase || 0);
    const b = Number(logistica || 0);
    const c = Number(otros || 0);
    return a + b + c;
  }, [costoBase, logistica, otros]);

  const precioSugerido = useMemo(() => {
    const m = Number(margen || 0) / 100;
    if (totalCosto <= 0) return 0;
    return totalCosto * (1 + m);
  }, [totalCosto, margen]);

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6">
        <h2 className="text-text font-extrabold text-lg">Precio sugerido</h2>
        <p className="text-muted text-sm mt-1">
          Fórmula MVP: (costo + logística + otros) + margen.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="País destino">
            <select value={pais} onChange={(e) => setPais(e.target.value)} className={selectCls}>
              {PAISES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Moneda de venta">
            <select value={monedaVenta} onChange={(e) => setMonedaVenta(e.target.value)} className={selectCls}>
              {MONEDAS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Costo base">
            <input value={costoBase} onChange={(e) => setCostoBase(e.target.value)} className={inputCls} placeholder="100" />
          </Field>

          <Field label="Logística">
            <input value={logistica} onChange={(e) => setLogistica(e.target.value)} className={inputCls} placeholder="15" />
          </Field>

          <Field label="Otros costos">
            <input value={otros} onChange={(e) => setOtros(e.target.value)} className={inputCls} placeholder="10" />
          </Field>

          <Field label="Margen (%)">
            <input value={margen} onChange={(e) => setMargen(e.target.value)} className={inputCls} placeholder="25" />
          </Field>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface/40 p-5">
            <p className="text-muted text-xs font-semibold">Costo total</p>
            <p className="text-text text-2xl font-extrabold mt-2">{formatMoney(totalCosto, monedaVenta)}</p>
          </div>

          <div className="rounded-2xl border border-border bg-accent/15 p-5">
            <p className="text-text text-xs font-extrabold">Precio sugerido</p>
            <p className="text-text text-2xl font-extrabold mt-2">{formatMoney(precioSugerido, monedaVenta)}</p>
            <p className="text-muted text-xs mt-1">
              País: <span className="text-text/90">{pais}</span> • Margen:{" "}
              <span className="text-text/90">{margen}%</span>
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-5">
          <p className="text-text font-extrabold">Interpretación rápida</p>
          <p className="text-muted text-sm mt-1">
            Este cálculo es un MVP. Luego se ajusta por país (impuestos), tipo de cambio real,
            costos logísticos por ruta y variación de commodities (madera/acero).
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6">
        <h3 className="text-text font-extrabold text-lg">Próximo paso</h3>
        <p className="text-muted text-sm mt-2">Aquí conectaremos:</p>
        <ul className="mt-3 space-y-2 text-muted text-sm">
          <li>• Tipo de cambio real (si vendes en otra moneda)</li>
          <li>• Costos por país (impuestos/logística)</li>
          <li>• Ajuste por commodity (madera/acero)</li>
          <li>• Precio mínimo y recomendado por escenario</li>
        </ul>
      </div>
    </section>
  );
}

/* ============================================================================
   HELPERS
   ============================================================================ */

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] text-muted mb-1">{label}</span>
      {children}
    </label>
  );
}

function formatMoney(value, currency) {
  const n = Number(value || 0);
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency || ""}`;
  }
}

/* ============================================================================
   CLASES REUTILIZABLES (MISMAS QUE GRUPOS)
   ============================================================================ */

const selectCls =
  "w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-ring/40";

const inputCls =
  "w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40";