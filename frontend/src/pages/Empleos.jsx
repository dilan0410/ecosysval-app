// src/pages/Empleos.jsx
/**
 * EMPLEOS (ECOSYSVAL)
 * --------------------------------------------------------------------
 * Objetivo:
 * - Publicar ofertas de empleo (formulario).
 * - Consultar, buscar y listar empleos desde backend.
 * - Ver detalle en modal y permitir eliminar.
 *
 * ✅ IMPORTANTE (THEME + FONDO):
 * - ❌ NO usamos backgroundImage en esta página (NO fondo.png).
 * - ✅ El fondo queda global por tema (claro.png / oscuro.png) desde CSS.
 * - ✅ Aquí solo usamos overlays suaves (glow) para contraste, sin tapar.
 *
 * ✅ Ajuste visual (según tu feedback):
 * - Panel formulario: MÁS “marco” (contraste).
 * - Inputs: más claros que el panel, efecto glass, SIN blanco sólido.
 *
 * ✅ Nota Tailwind:
 * - Usamos opacidades válidas: /10 /15 /20 /25 /30 /40 /50 /60 /70
 */

import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import JobCard from "../components/JobCard";
import { X, Plus, Search, FileText, Loader2 } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";

/**
 * URL del backend (ajústala si tu API está en otro puerto/ruta)
 */
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function Empleos() {
  const { theme } = useTheme(); // por si luego quieres ajustar detalles por theme

  // ==========================================================
  // STATE PRINCIPAL
  // ==========================================================
  const [jobs, setJobs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // NUEVO
  const [openJob, setOpenJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Búsqueda local (client-side)
  const [q, setQ] = useState("");

  // ==========================================================
  // FORM STATE
  // ==========================================================
  const [form, setForm] = useState({
    titulo: "",
    empresa: "",
    ubicacion: "",
    salario: "",
    modalidad: "Presencial",
    tipoContrato: "Obra o labor",
    jornada: "Tiempo completo",
    descripcion: "",
    requisitos: "",
    beneficios: "",
    contacto: "",
    urgente: false,
  });

  // ==========================================================
  // INIT LOAD
  // ==========================================================
  useEffect(() => {
    fetchEmpleos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * UX modal:
   * - Bloquea scroll del body cuando hay modal
   * - Cierra con ESC
   */
  useEffect(() => {
    if (!openJob) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") setOpenJob(null);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openJob]);

  /**
   * GET /empleos
   * - Carga empleos desde backend.
   * - Normaliza: si no es array, asigna [].
   */
  const fetchEmpleos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error al obtener empleos");
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper para cambiar valores del form.
   */
  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /**
   * POST /empleos
   * - Validación mínima.
   * - Mapeo: tipoContrato -> tipo_contrato (backend).
   */
  const publicarEmpleo = async (e) => {
    e.preventDefault();

    if (!form.titulo || !form.empresa || !form.ubicacion || !form.descripcion) {
      alert("Completa mínimo: Título, Empresa, Ubicación y Descripción.");
      return;
    }

    const { tipoContrato, ...restForm } = form;
    const dataParaEnviar = { ...restForm, tipo_contrato: tipoContrato };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataParaEnviar),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        alert(err?.message || "No se pudo publicar el empleo.");
        return;
      }

      const nuevoJob = await response.json();
      setJobs((prev) => [nuevoJob, ...prev]);

      // Reset form
      setForm({
        titulo: "",
        empresa: "",
        ubicacion: "",
        salario: "",
        modalidad: "Presencial",
        tipoContrato: "Obra o labor",
        jornada: "Tiempo completo",
        descripcion: "",
        requisitos: "",
        beneficios: "",
        contacto: "",
        urgente: false,
      });
    } catch (error) {
      console.error(error);
      alert("Error al guardar en la base de datos.");
    }
  };

  /**
   * DELETE /empleos/:id
   * - Confirmación antes de eliminar.
   * - Cierra modal si el eliminado estaba abierto.
   */
  const eliminarEmpleo = async (id) => {
    if (!window.confirm("¿Eliminar este empleo permanentemente?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (!response.ok) {
        alert("No se pudo eliminar el empleo.");
        return;
      }

      setJobs((prev) => prev.filter((j) => j.id !== id));
      if (openJob?.id === id) setOpenJob(null);
    } catch (error) {
      console.error(error);
      alert("Error al eliminar.");
    }
  };

  /**
   * Filtro client-side (búsqueda):
   * - Filtra por: título, empresa, ubicación, descripción.
   */
  const jobsFiltrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return jobs;

    return jobs.filter((j) => {
      const titulo = (j.titulo || "").toLowerCase();
      const empresa = (j.empresa || "").toLowerCase();
      const ubicacion = (j.ubicacion || "").toLowerCase();
      const descripcion = (j.descripcion || "").toLowerCase();

      return (
        titulo.includes(term) ||
        empresa.includes(term) ||
        ubicacion.includes(term) ||
        descripcion.includes(term)
      );
    });
  }, [jobs, q]);

  return (
  <>
    <Layout>
      <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-[420px_1fr]">
              {/* ==========================================================
                  FORMULARIO (panel marco + inputs glass)
                 ========================================================== */}
              <section className={panelFormCls}>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-lg font-extrabold text-text inline-flex items-center gap-2">
                    <Plus className="w-5 h-5 text-accent" />
                    Publicar oferta de empleo
                  </h1>
                  <span className="text-xs text-muted">{jobs.length} creadas</span>
                </div>

                <form onSubmit={publicarEmpleo} className="grid gap-3">
                  <Field label="Título *">
                    <input
                      value={form.titulo}
                      onChange={(e) => handleChange("titulo", e.target.value)}
                      className={inputCls}
                      placeholder="Analista de soporte"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Empresa *">
                      <input
                        value={form.empresa}
                        onChange={(e) => handleChange("empresa", e.target.value)}
                        className={inputCls}
                        placeholder="Ej: OMEC"
                      />
                    </Field>

                    <Field label="Ubicación *">
                      <input
                        value={form.ubicacion}
                        onChange={(e) => handleChange("ubicacion", e.target.value)}
                        className={inputCls}
                        placeholder="Ej: CDMX"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Salario">
                      <input
                        value={form.salario}
                        onChange={(e) => handleChange("salario", e.target.value)}
                        className={inputCls}
                        placeholder="Ej: $1000"
                      />
                    </Field>

                    <Field label="Modalidad">
                      <select
                        value={form.modalidad}
                        onChange={(e) => handleChange("modalidad", e.target.value)}
                        className={selectCls}
                      >
                        <option className={optionCls}>Presencial</option>
                        <option className={optionCls}>Remoto</option>
                        <option className={optionCls}>Híbrido</option>
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Contrato">
                      <select
                        value={form.tipoContrato}
                        onChange={(e) => handleChange("tipoContrato", e.target.value)}
                        className={selectCls}
                      >
                        <option className={optionCls}>Obra o labor</option>
                        <option className={optionCls}>Término fijo</option>
                        <option className={optionCls}>Indefinido</option>
                        <option className={optionCls}>Prestación de servicios</option>
                      </select>
                    </Field>

                    <Field label="Jornada">
                      <select
                        value={form.jornada}
                        onChange={(e) => handleChange("jornada", e.target.value)}
                        className={selectCls}
                      >
                        <option className={optionCls}>Tiempo completo</option>
                        <option className={optionCls}>Medio tiempo</option>
                        <option className={optionCls}>Por horas</option>
                        <option className={optionCls}>Turnos rotativos</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Descripción *">
                    <textarea
                      value={form.descripcion}
                      onChange={(e) => handleChange("descripcion", e.target.value)}
                      className={textareaCls}
                      rows={4}
                      placeholder="Describe funciones principales..."
                    />
                  </Field>

                  <Field label="Requisitos">
                    <textarea
                      value={form.requisitos}
                      onChange={(e) => handleChange("requisitos", e.target.value)}
                      className={textareaCls}
                      rows={3}
                      placeholder="Ej: Bachillerato..."
                    />
                  </Field>

                  <Field label="Beneficios">
                    <textarea
                      value={form.beneficios}
                      onChange={(e) => handleChange("beneficios", e.target.value)}
                      className={textareaCls}
                      rows={2}
                      placeholder="Ej: Bonos, remoto, seguro..."
                    />
                  </Field>

                  <Field label="Contacto (correo/WhatsApp)">
                    <input
                      value={form.contacto}
                      onChange={(e) => handleChange("contacto", e.target.value)}
                      className={inputCls}
                      placeholder="correo@empresa.com / +57..."
                    />
                  </Field>

                  <label className="flex items-center gap-2 text-sm text-text/80">
                    <input
                      type="checkbox"
                      checked={form.urgente}
                      onChange={(e) => handleChange("urgente", e.target.checked)}
                      className="accent-[var(--accent)]"
                    />
                    Marcar como urgente
                  </label>

                  <button
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 font-semibold text-slate-900 shadow-pro hover:brightness-95 transition"
                  >
                    <FileText className="w-5 h-5" />
                    Publicar empleo
                  </button>
                </form>
              </section>

              {/* ==========================================================
                  LISTA (panel + search glass)
                 ========================================================== */}
              <section className={panelListCls}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <h2 className="text-lg font-extrabold text-text">Empleos publicados</h2>

                  <div className="relative">
                    <Search className="w-4 h-4 text-muted absolute left-3 top-3" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className={searchCls}
                      placeholder="Buscar empleo..."
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center p-16 text-muted">
                    <Loader2 className="w-8 h-8 animate-spin mb-3" />
                    <p>Cargando vacantes desde la base de datos...</p>
                  </div>
                ) : jobsFiltrados.length === 0 ? (
                  <div className="rounded-3xl border border-border bg-surface/60 p-10 text-center">
                    <div className="text-4xl mb-3">💼</div>
                    <p className="text-text font-semibold">No se encontraron empleos</p>
                    <p className="text-muted text-sm mt-1">Prueba con otro término de búsqueda.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {jobsFiltrados.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onOpen={(j) => setOpenJob(j)}
                        onApply={(j) => alert(`Aplicación enviada para: ${j.titulo}`)}
                        compact
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>        
    </Layout>

        {/* ==========================================================
            MODAL DETALLE
           ========================================================== */}
        {openJob && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpenJob(null)} />

            <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-surface/90 backdrop-blur-xl shadow-pro overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <h3 className="font-extrabold text-text">{openJob.titulo}</h3>
                  <p className="text-xs text-muted">
                    {openJob.empresa} • {openJob.ubicacion}
                  </p>
                </div>

                <button
                  onClick={() => setOpenJob(null)}
                  className="h-10 w-10 rounded-2xl border border-border hover:bg-surface flex items-center justify-center"
                  title="Cerrar"
                  type="button"
                >
                  <X className="w-4 h-4 text-text" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm text-text/80">
                <InfoRow label="Salario" value={openJob.salario || "A convenir"} />
                <InfoRow label="Modalidad" value={openJob.modalidad} />
                <InfoRow label="Contrato" value={openJob.tipo_contrato || openJob.tipoContrato} />
                <InfoRow label="Jornada" value={openJob.jornada} />
                <Block title="Descripción" text={openJob.descripcion} />

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => eliminarEmpleo(openJob.id)}
                    className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-600 hover:bg-red-500/20"
                    type="button"
                  >
                    Eliminar
                  </button>

                  <button
                    onClick={() => setOpenJob(null)}
                    className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900 hover:brightness-95"
                    type="button"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  </>
  );
}

/* ====================================================================
   ESTILOS (tokenizados + glass)
   ==================================================================== */

/**
 * Panel del formulario:
 * - “Marco” más marcado (más contraste que la lista).
 */
const panelFormCls =
  "rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-6 h-fit ring-1 ring-black/5";

/**
 * Panel de lista:
 * - Un poquito menos marcado para jerarquía visual.
 */
const panelListCls =
  "rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6";

/**
 * Inputs:
 * - Más claros que panel (glass).
 * - Nunca blancos sólidos.
 * - bg-clip-padding + appearance-none ayuda a evitar overrides raros.
 */
const inputCls =
  "w-full rounded-2xl border border-border bg-surface/50 px-4 py-2.5 text-text " +
  "outline-none backdrop-blur-md appearance-none bg-clip-padding transition " +
  "placeholder:text-muted/70 " +
  "focus:bg-surface/60 focus:border-ring/40 focus:ring-2 focus:ring-ring/40";

/**
 * Select:
 * - Igual que input + cursor pointer.
 */
const selectCls =
  "w-full rounded-2xl border border-border bg-surface/50 px-4 py-2.5 text-text " +
  "outline-none backdrop-blur-md appearance-none bg-clip-padding transition cursor-pointer " +
  "focus:bg-surface/60 focus:border-ring/40 focus:ring-2 focus:ring-ring/40";

/**
 * Textarea:
 * - Igual a input, con resize.
 */
const textareaCls =
  "w-full rounded-2xl border border-border bg-surface/50 px-4 py-2.5 text-text " +
  "outline-none backdrop-blur-md appearance-none bg-clip-padding transition resize-y " +
  "placeholder:text-muted/70 " +
  "focus:bg-surface/60 focus:border-ring/40 focus:ring-2 focus:ring-ring/40";

/**
 * Search:
 * - Compacto, glass, NO blanco.
 */
const searchCls =
  "pl-9 pr-3 py-2 rounded-2xl border border-border bg-surface/50 text-text " +
  "outline-none backdrop-blur-md appearance-none bg-clip-padding transition " +
  "placeholder:text-muted/70 text-sm w-72 max-w-full " +
  "focus:bg-surface/60 focus:border-ring/40 focus:ring-2 focus:ring-ring/40";

/**
 * Options en select:
 * - Fondo acorde para dropdown (evita blanco chillón).
 * - Nota: en algunos browsers el option no respeta clases 100%,
 *   pero ayuda bastante.
 */
const optionCls = "bg-[#0b1630] text-white";

/* ====================================================================
   COMPONENTES (documentados)
   ==================================================================== */

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-muted mb-1">{label}</span>
      {children}
    </label>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-text text-right">{value}</span>
    </div>
  );
}

function Block({ title, text }) {
  if (!text) return null;
  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-4">
      <div className="font-semibold text-text mb-1">{title}</div>
      <div className="text-text/80 whitespace-pre-wrap">{text}</div>
    </div>
  );
}