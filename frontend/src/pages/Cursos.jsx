// src/pages/Cursos.jsx
/**
 * CURSOS / CAPACITACIONES (ECOSYSVAL)
 * --------------------------------------------------------------------
 * Objetivo:
 * - Landing de captación (copy + formulario) para agendar reunión.
 * - Envía información al backend: POST /contact/capacitaciones
 *
 * ✅ THEME + FONDO (IMPORTANTE):
 * - ❌ NO usamos backgroundImage en el contenedor (no fondo.png aquí).
 * - ✅ El fondo base lo maneja el sistema global (theme.css).
 * - ✅ En esta vista solo usamos overlays:
 *   1) fcursos.png como capa decorativa suave (no reemplaza el fondo)
 *   2) glow radial pro para contraste
 *
 * ✅ Inputs:
 * - Panel form “marco” (más contraste).
 * - Campos MÁS claros (glass) sin volverse blancos.
 * - Select con options oscuras para evitar dropdown blanco.
 *
 * Nota Tailwind:
 * - Evitamos clases inválidas bg-white/22.
 * - Usamos opacidades válidas.
 */

import React, { useState } from "react";
import SidebarMenu from "../components/SidebarMenu";
import MainHeader from "../components/MainHeader";
import { useTheme } from "../components/ThemeProvider";

/**
 * API base:
 * - Usa variable VITE_API_URL si existe.
 * - Si no, cae en localhost.
 */
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function Cursos() {
  const { theme } = useTheme();

  // ==========================================================
  // STATE
  // ==========================================================
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    estado: "",
    telefono: "",
    empresa: "",
    cargo: "",
    interes: "Capacitación",
    mensaje: "",
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  /**
   * handleChange
   * - Actualiza el form según name/value del input.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  /**
   * handleSubmit
   * - Valida campos obligatorios.
   * - POST a /contact/capacitaciones.
   * - Muestra estados ok/error.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk(false);

    // Validación mínima
    if (!form.nombre || !form.apellido || !form.email || !form.estado || !form.telefono) {
      setError("Completa los campos obligatorios.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/contact/capacitaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Muestra los errores específicos del backend
        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message || 'No se pudo enviar el formulario';
        throw new Error(errorMessage);
      }

      setOk(true);

      // Reset del formulario
      setForm({
        nombre: "",
        apellido: "",
        email: "",
        estado: "",
        telefono: "",
        empresa: "",
        cargo: "",
        interes: "Capacitación",
        mensaje: "",
      });
    } catch (err) {
      setError(err?.message || "Error desconocido");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* ✅ Overlays pro (NO reemplazan el fondo global) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Capa decorativa (fcursos.png) suave */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/fcursos.png')" }}
        />

        {/* Glow radial premium */}
        <div
          className={[
            "absolute inset-0",
            "bg-[radial-gradient(1200px_600px_at_10%_10%,rgba(236,182,14,0.18),transparent_55%)]",
            "bg-[radial-gradient(900px_450px_at_90%_20%,rgba(59,130,246,0.12),transparent_55%)]",
          ].join(" ")}
        />

        {/* Tinte leve por tema para contraste */}
        <div className={theme === "light" ? "absolute inset-0 bg-white/20" : "absolute inset-0 bg-black/10"} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <MainHeader />

        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="w-64 hidden md:block">
            <SidebarMenu />
          </aside>

          {/* Main */}
          <main className="flex-1 relative overflow-hidden">
            <section className="relative mx-auto max-w-7xl px-6 py-14 grid gap-12 md:grid-cols-2">
              {/* ==========================================================
                  COPY (Panel glass)
                 ========================================================== */}
              <div className={panelCopyCls}>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-text">
                  Capacitación que impulsa{" "}
                  <span className="text-accent">decisiones estratégicas</span>
                </h1>

                <p className="mt-5 max-w-xl text-text/85 leading-relaxed">
                  Diseñamos programas de alto impacto para fortalecer liderazgo,
                  finanzas, innovación y competitividad empresarial.
                </p>

                <ul className="mt-8 space-y-3 text-text/75">
                  {[
                    "Estrategia y planeación empresarial",
                    "Análisis financiero y toma de decisiones",
                    "Diseño de modelos de negocio",
                    "Nearshoring y comercio internacional",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 grid grid-cols-3 gap-6">
                  <Stat value="30+" label="Años de experiencia" />
                  <Stat value="200+" label="Clientes" />
                  <Stat value="15" label="Países" />
                </div>
              </div>

              {/* ==========================================================
                  FORMULARIO (panel marco + campos glass claros)
                 ========================================================== */}
              <div className={panelFormCls}>
                <LogoEcosyval />

                <h2 className="mt-2 text-center text-lg font-extrabold text-text">
                  Agenda una reunión
                </h2>
                <p className="mb-4 text-center text-xs text-muted">
                  Un consultor se comunicará contigo
                </p>

                <form onSubmit={handleSubmit} className="grid gap-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      name="nombre"
                      label="Nombre *"
                      value={form.nombre}
                      onChange={handleChange}
                    />
                    <Input
                      name="apellido"
                      label="Apellido *"
                      value={form.apellido}
                      onChange={handleChange}
                    />
                  </div>

                  <Input
                    name="email"
                    type="email"
                    label="Email *"
                    value={form.email}
                    onChange={handleChange}
                  />

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Select
                      name="estado"
                      label="Estado *"
                      value={form.estado}
                      onChange={handleChange}
                      options={ESTADOS_MX}
                    />
                    <Input
                      name="telefono"
                      label="Teléfono *"
                      value={form.telefono}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      name="empresa"
                      label="Empresa"
                      value={form.empresa}
                      onChange={handleChange}
                    />
                    <Input
                      name="cargo"
                      label="Cargo"
                      value={form.cargo}
                      onChange={handleChange}
                    />
                  </div>

                  <Select
                    name="interes"
                    label="Interés"
                    value={form.interes}
                    onChange={handleChange}
                    options={["Capacitación", "Curso", "Diplomado", "Asesoría"]}
                    allowEmpty={false}
                  />

                  <Textarea
                    name="mensaje"
                    label="Mensaje"
                    value={form.mensaje}
                    onChange={handleChange}
                  />

                  {/* Mensajes de estado */}
                  {error && (
                    <p className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl p-2">
                      {error}
                    </p>
                  )}
                  {ok && (
                    <p className="text-sm text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
                      Solicitud enviada correctamente ✔
                    </p>
                  )}

                  <button type="submit" disabled={sending} className={submitBtnCls}>
                    {sending ? "Enviando..." : "Agendar ahora"}
                  </button>
                </form>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   ESTILOS (tokenizados + glass)
   ==================================================================== */

/**
 * Panel del copy:
 * - Glass, borde suave.
 */
const panelCopyCls =
  "rounded-3xl bg-surface/60 backdrop-blur-xl border border-border shadow-pro p-8";

/**
 * Panel del formulario:
 * - Un poco MÁS “marco” que el copy para jerarquía.
 */
const panelFormCls =
  "rounded-3xl bg-surface/70 backdrop-blur-xl border border-border shadow-pro p-6 ring-1 ring-black/5";

/**
 * Botón submit:
 * - Acento global (acento dorado en tu theme).
 */
const submitBtnCls =
  "mt-2 rounded-2xl bg-accent py-3 font-extrabold text-slate-900 hover:brightness-95 transition disabled:opacity-60 disabled:cursor-not-allowed";

/**
 * Inputs (más claros que el panel, pero glass):
 * - Evita blanco sólido.
 * - appearance-none para evitar estilos del navegador.
 */
const fieldBaseCls =
  "mt-1 w-full rounded-xl bg-surface/50 border border-border px-3 py-2 text-text " +
  "outline-none backdrop-blur-md appearance-none bg-clip-padding transition " +
  "placeholder:text-muted/70 " +
  "focus:bg-surface/60 focus:ring-2 focus:ring-ring/40 focus:border-ring/40";

/**
 * Opciones del select (dropdown):
 * - Fondo oscuro para evitar dropdown blanco.
 */
const optionCls = "bg-[#0b1630] text-white";

/* ====================================================================
   HELPERS (documentados)
   ==================================================================== */

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="text-xs text-muted">
      {label}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={fieldBaseCls}
      />
    </label>
  );
}

function Textarea({ label, name, value, onChange }) {
  return (
    <label className="text-xs text-muted">
      {label}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className={`${fieldBaseCls} resize-y`}
      />
    </label>
  );
}

/**
 * Select:
 * - allowEmpty:
 *   - true: incluye placeholder "Selecciona…"
 *   - false: no incluye placeholder (para interés)
 */
function Select({ label, name, value, onChange, options, allowEmpty = true }) {
  return (
    <label className="text-xs text-muted">
      {label}
      <select name={name} value={value} onChange={onChange} className={fieldBaseCls}>
        {allowEmpty && (
          <option value="" className={optionCls}>
            Selecciona…
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt} className={optionCls}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-accent">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function LogoEcosyval() {
  return (
    <div className="flex justify-center mb-3">
      <img src="/Logo.png" alt="Ecosysval" className="h-20 object-contain" />
    </div>
  );
}

/**
 * Estados (mock):
 * - Luego lo puedes traer del backend si quieres.
 */
const ESTADOS_MX = ["CDMX", "Jalisco", "Nuevo León", "Puebla", "Yucatán"];