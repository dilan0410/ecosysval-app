// src/pages/Perfil.jsx
/**
 * PERFIL EMPRESARIAL (Ecosysval)
 * -------------------------------------------------------
 * - Visualiza / edita la información pública de la empresa.
 * - Soporta creación de perfil si aún no existe (404).
 * - Integra selección de actividad económica (SCIAN) (mock por ahora).
 * - Subida opcional de logo (endpoint PATCH).
 * - Exportación PDF (endpoint /reporte) si el backend lo expone.
 * - Integrado a tema claro/oscuro con tokens:
 *   bg-surface, text-text, border-border, ring, etc.
 *
 * IMPORTANTE:
 * - ❌ NO se fuerza el fondo aquí (NO fondo.png).
 * - ✅ El fondo vive globalmente por tema (body + --bg-image).
 * - ✅ Si queremos "estilo pro", usamos un overlay (glow) que NO pisa el fondo global.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Camera,
  Building2,
  Pencil,
  Save,
  X,
  Loader2,
  CheckCircle2,
  FileDown,
} from "lucide-react";

import SidebarMenu from "../components/SidebarMenu";
import MainHeader from "../components/MainHeader";

/** Backend base URL (Vite). En otro PC solo cambias .env */
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

/**
 * ✅ NOTA:
 * Esto está fijo a 1 para demo/entrega.
 * Cuando conectes login multi-empresa, reemplaza por:
 * - empresaId del usuario logueado
 * - o query param / route param
 */

// Helper para obtener el token JWT del localStorage
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Opciones SCIAN (mock) */
const OPCIONES_SCIAN = [
  { codigo: "522320", descripcion: "Otros servicios de intermediación crediticia" },
  { codigo: "541511", descripcion: "Servicios de desarrollo de software a la medida" },
  { codigo: "541512", descripcion: "Servicios de consultoría en tecnologías de información" },
  { codigo: "611430", descripcion: "Escuelas de capacitación para el trabajo" },
];

/** Estado inicial del formulario */
const FORM_INIT = {
  razonSocial: "",
  correo: "",
  ambito: "",
  ubicacion: "",
  representante: "",
  paginaWeb: "",
  logo: "",
  volumenVentas: "",
  empleados: 0,
  antiguedad: "",
  mision: "",
  vision: "",
  sucursales: "",
  socios: "",
  importaciones: false,
  exportaciones: false,
  productos: "",
  servicios: "",
  objetivos: "",
  scianCodigo: "",
  scianDescripcion: "",
};

/** Normaliza rutas que pueden venir con o sin "/" */
function normalizePath(p) {
  if (!p || typeof p !== "string") return null;
  return p.startsWith("/") ? p : `/${p}`;
}

export default function Perfil() {
  // -------------------------
  // Estados principales
  // -------------------------
  const [empresa, setEmpresa] = useState(null);
  const [form, setForm] = useState(FORM_INIT);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  // -------------------------
  // Logo (archivo + preview)
  // -------------------------
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // -------------------------
  // Stats (mock / demo)
  // -------------------------
  const [stats] = useState({ compras: 1, ventas: 2, restantes: 2 });

  // -------------------------
  // Cargar perfil al montar
  // -------------------------
  useEffect(() => {
    cargarEmpresa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Limpieza de recursos (ObjectURL) al desmontar
   * para evitar memory leaks al cambiar de página.
   */
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  /**
   * Carga empresa desde backend.
   * - 200: setEmpresa + setForm
   * - 404: perfil no existe → habilita creación (editMode=true)
   * - otro: error
   */
  async function cargarEmpresa() {
    setLoading(true);
    setError("");

    try {
      // Usar endpoint que devuelve la empresa del usuario LOGUEADO
      const res = await fetch(`${API_URL}/empresas/mi-empresa`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setEmpresa(data);
        setForm(mapEmpresaToForm(data));
        setEditMode(false);
      } else if (res.status === 404) {
        // No tiene empresa registrada → habilitar creación
        setEmpresa(null);
        setForm(FORM_INIT);
        setEditMode(true);
      } else if (res.status === 401) {
        setError("Tu sesión ha expirado. Por favor inicia sesión de nuevo.");
      } else {
        throw new Error(`Error ${res.status}`);
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el perfil empresarial.");
    } finally {
      setLoading(false);
    }
  }

  /** Mapea objeto empresa (backend) al shape del form */
  function mapEmpresaToForm(data) {
    return {
      razonSocial: data?.razonSocial ?? "",
      correo: data?.correo ?? "",
      ambito: data?.ambito ?? "",
      ubicacion: data?.ubicacion ?? "",
      representante: data?.representante ?? "",
      paginaWeb: data?.paginaWeb ?? "",
      logo: data?.logo ?? "",
      volumenVentas: data?.volumenVentas ?? "",
      empleados: data?.empleados ?? 0,
      antiguedad: data?.antiguedad ?? "",
      mision: data?.mision ?? "",
      vision: data?.vision ?? "",
      sucursales: data?.sucursales ?? "",
      socios: data?.socios ?? "",
      importaciones: !!data?.importaciones,
      exportaciones: !!data?.exportaciones,
      productos: data?.productos ?? "",
      servicios: data?.servicios ?? "",
      objetivos: data?.objetivos ?? "",
      scianCodigo: data?.scianCodigo ?? "",
      scianDescripcion: data?.scianDescripcion ?? "",
    };
  }

  /** Helper: actualiza campos del form */
  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  /** Helper: alterna booleanos */
  function onToggle(field) {
    setForm((f) => ({ ...f, [field]: !f[field] }));
  }

  /**
   * Selección de logo
   * - Guarda file para subir luego en guardar()
   * - Genera preview local
   */
  function handleLogoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);

    // Limpia preview anterior si existe
    if (logoPreview) URL.revokeObjectURL(logoPreview);

    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  }

  /**
   * Sube logo (opcional) si existe archivo.
   * - Retorna la URL/ruta nueva si el endpoint responde correctamente
   * - Si falla, no interrumpe el guardado del perfil (solo warning)
   */
  async function subirLogoSiCorresponde(empresaId) {
    if (!logoFile) return null;

    const fd = new FormData();
    fd.append("file", logoFile);

    const res = await fetch(`${API_URL}/empresas/${empresaId}/logo`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: fd,
    });

    if (!res.ok) {
      console.warn("No se pudo subir el logo (endpoint opcional).");
      return null;
    }

    const data = await res.json();
    return data?.logo || null;
  }

  /**
   * Guardar
   * - Si empresa existe: PUT /empresas/:id
   * - Si no existe: POST /empresas
   * - Luego intenta subir logo (PATCH opcional)
   */
  async function guardar() {
    setSaving(true);
    setError("");

    try {
      let saved;

      if (empresa?.id) {
        // Actualizar
        const res = await fetch(`${API_URL}/empresas/${empresa.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Error al actualizar");
        saved = await res.json();
      } else {
        // Crear - incluir userId del usuario logueado
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const res = await fetch(`${API_URL}/empresas`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ ...form, userId: user.id }),
        });
        if (!res.ok) throw new Error("Error al crear");
        saved = await res.json();
      }

      // Subida opcional de logo
      const nuevoLogoUrl = await subirLogoSiCorresponde(saved.id);
      const empresaFinal = nuevoLogoUrl ? { ...saved, logo: nuevoLogoUrl } : saved;

      // Actualiza estados finales
      setEmpresa(empresaFinal);
      setForm(mapEmpresaToForm(empresaFinal));

      // Limpia preview y sale de edición
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoFile(null);
      setLogoPreview(null);
      setEditMode(false);
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar la información.");
    } finally {
      setSaving(false);
    }
  }

  /**
   * Cancelar edición
   * - Restaura el form desde empresa (si existe)
   * - Limpia logo preview/file
   */
  function cancelarEdicion() {
    if (empresa) setForm(mapEmpresaToForm(empresa));
    else setForm(FORM_INIT);

    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    setEditMode(false);
  }

  /**
   * Descargar PDF (si backend lo soporta)
   * Endpoint esperado:
   *   GET /empresas/:id/reporte -> { url: "/ruta/archivo.pdf" }
   */
  async function descargarPDF() {
    if (!empresa?.id) return;

    setDownloading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/empresas/${empresa.id}/reporte`, {
      headers: getAuthHeaders(),
    });
      if (!res.ok) throw new Error("Error al generar PDF");

      const data = await res.json();

      if (data?.url) {
        const link = document.createElement("a");
        link.href = `${API_URL}${data.url}`;
        link.download = `perfil_${(empresa.razonSocial || "empresa").replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError("No se recibió la URL del archivo.");
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo generar el PDF.");
    } finally {
      setDownloading(false);
    }
  }

  // -------------------------
  // Estado de carga
  // -------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* ✅ overlay pro sin reemplazar el fondo global */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div
            className={[
              "absolute inset-0",
              "bg-[radial-gradient(1200px_600px_at_10%_10%,rgba(236,182,14,0.18),transparent_55%)]",
              "bg-[radial-gradient(900px_450px_at_90%_20%,rgba(59,130,246,0.12),transparent_55%)]",
            ].join(" ")}
          />
        </div>

        <div className="relative z-10 rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-4 inline-flex items-center">
          <Loader2 className="w-5 h-5 mr-2 animate-spin text-text" />
          <span className="text-text">Cargando información empresarial...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ✅ overlay pro sin reemplazar el fondo global */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className={[
            "absolute inset-0",
            "bg-[radial-gradient(1200px_600px_at_10%_10%,rgba(236,182,14,0.18),transparent_55%)]",
            "bg-[radial-gradient(900px_450px_at_90%_20%,rgba(59,130,246,0.12),transparent_55%)]",
          ].join(" ")}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <MainHeader showSearch={true} showBack={false} />

        <div className="flex flex-1">
          <aside className="hidden md:block w-64">
            <SidebarMenu />
          </aside>

          <main className="flex-1 px-4 md:px-8 py-6">
            <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* ==========================================================
                  FORM PRINCIPAL
                 ========================================================== */}
              <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 md:p-7 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-text">Perfil Empresarial</h1>
                    <p className="text-muted text-sm mt-1">
                      Gestiona la información pública de tu empresa y su actividad SCIAN.
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2">
                    {!editMode ? (
                      <>
                        {empresa ? (
                          <button
                            onClick={() => setEditMode(true)}
                            className="bg-surface/70 hover:bg-surface transition text-text px-4 py-2 rounded-2xl shadow-pro inline-flex items-center gap-2 border border-border"
                            type="button"
                          >
                            <Pencil className="w-4 h-4" />
                            Editar
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditMode(true)}
                            className="bg-emerald-400 hover:bg-emerald-300 transition text-slate-900 px-4 py-2 rounded-2xl shadow-pro inline-flex items-center gap-2 font-semibold"
                            type="button"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Crear perfil
                          </button>
                        )}

                        <button
                          onClick={descargarPDF}
                          disabled={downloading || !empresa?.id}
                          className="bg-accent hover:brightness-95 transition text-slate-900 px-4 py-2 rounded-2xl shadow-pro inline-flex items-center gap-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                          type="button"
                        >
                          {downloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileDown className="w-4 h-4" />
                          )}
                          Descargar PDF
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={guardar}
                          disabled={saving}
                          className="bg-emerald-400 hover:bg-emerald-300 transition text-slate-900 px-4 py-2 rounded-2xl shadow-pro inline-flex items-center gap-2 font-semibold disabled:opacity-60"
                          type="button"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Guardar
                        </button>

                        <button
                          onClick={cancelarEdicion}
                          className="bg-surface/70 hover:bg-surface transition text-text px-4 py-2 rounded-2xl shadow-pro inline-flex items-center gap-2 border border-border"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Errores */}
                {error && (
                  <div className="p-3 rounded-2xl bg-red-500/10 text-red-600 border border-red-500/25">
                    {error}
                  </div>
                )}

                {/* ==========================================================
                    GRID PRINCIPAL (Campos + Logo)
                   ========================================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
                  {/* Campos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <Field
                      label="Razón social"
                      edit={editMode}
                      value={form.razonSocial}
                      onChange={(v) => onChange("razonSocial", v)}
                      placeholder="Nombre legal de la empresa"
                    />
                    <Field
                      label="Correo electrónico"
                      edit={editMode}
                      value={form.correo}
                      onChange={(v) => onChange("correo", v)}
                      placeholder="correo@empresa.com"
                    />
                    <Field
                      label="Ámbito"
                      edit={editMode}
                      value={form.ambito}
                      onChange={(v) => onChange("ambito", v)}
                      placeholder="Sector o industria"
                    />
                    <Field
                      label="Ubicación"
                      edit={editMode}
                      value={form.ubicacion}
                      onChange={(v) => onChange("ubicacion", v)}
                      placeholder="Ciudad, país"
                    />
                    <Field
                      label="Representante legal"
                      edit={editMode}
                      value={form.representante}
                      onChange={(v) => onChange("representante", v)}
                      placeholder="Nombre del representante"
                    />
                    <Field
                      label="Página web"
                      edit={editMode}
                      value={form.paginaWeb}
                      onChange={(v) => onChange("paginaWeb", v)}
                      placeholder="https://empresa.com"
                    />

                    {/* SCIAN */}
                    <div className="md:col-span-2 xl:col-span-3">
                      <p className="text-sm text-muted">Actividad económica (SCIAN)</p>

                      {editMode ? (
                        <select
                          className="mt-1 w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-text outline-none focus:ring-2 focus:ring-ring/40"
                          value={form.scianCodigo || ""}
                          onChange={(e) => {
                            const codigo = e.target.value;
                            const opcion = OPCIONES_SCIAN.find((o) => o.codigo === codigo);
                            setForm((f) => ({
                              ...f,
                              scianCodigo: codigo,
                              scianDescripcion: opcion?.descripcion || "",
                            }));
                          }}
                        >
                          <option value="">Selecciona una actividad…</option>
                          {OPCIONES_SCIAN.map((o) => (
                            <option key={o.codigo} value={o.codigo}>
                              {o.codigo} — {o.descripcion}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-text mt-2">
                          {form.scianCodigo ? (
                            <>
                              <span className="font-semibold">{form.scianCodigo}</span>
                              <span className="text-muted"> — {form.scianDescripcion}</span>
                            </>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Logo */}
                  <div className="rounded-3xl border border-border bg-surface/40 p-5 flex flex-col items-center justify-center relative shadow-pro">
                    {logoPreview || form.logo ? (
                      <img
                        src={
                          logoPreview ||
                          (String(form.logo).startsWith("http")
                            ? form.logo
                            : `${API_URL}${normalizePath(form.logo) || ""}`)
                        }
                        alt="Logo Empresa"
                        className="w-40 h-40 object-contain rounded-2xl border border-border bg-bg/40 shadow-pro"
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center rounded-2xl border border-border bg-bg/40">
                        <Building2 className="w-12 h-12 text-muted" />
                      </div>
                    )}

                    {editMode && (
                      <label className="absolute bottom-4 right-4 bg-accent cursor-pointer rounded-full p-3 shadow-pro hover:brightness-95 transition">
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
                        <Camera className="w-4 h-4 text-slate-900" />
                      </label>
                    )}

                    <div className="mt-4 text-center">
                      <p className="text-text font-semibold">Logo</p>
                      <p className="text-muted text-xs">Recomendado: PNG con fondo transparente.</p>
                    </div>
                  </div>
                </div>

                {/* Datos adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Field
                    label="Volumen de ventas anual"
                    edit={editMode}
                    value={form.volumenVentas}
                    onChange={(v) => onChange("volumenVentas", v)}
                    placeholder="Ej. 1.000.000 - 5.000.000 MXN"
                  />
                  <Field
                    label="Empleados"
                    type="number"
                    edit={editMode}
                    value={form.empleados}
                    onChange={(v) => onChange("empleados", Number(v))}
                    placeholder="0"
                  />
                  <Field
                    label="Antigüedad"
                    edit={editMode}
                    value={form.antiguedad}
                    onChange={(v) => onChange("antiguedad", v)}
                    placeholder="Ej. Más de 10 años"
                  />
                </div>

                {/* Misión / Visión */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field
                    label="Misión"
                    textarea
                    edit={editMode}
                    value={form.mision}
                    onChange={(v) => onChange("mision", v)}
                    placeholder="Propósito y razón de ser"
                  />
                  <Field
                    label="Visión"
                    textarea
                    edit={editMode}
                    value={form.vision}
                    onChange={(v) => onChange("vision", v)}
                    placeholder="A dónde quiere llegar la empresa"
                  />
                </div>

                {/* Sucursales / Socios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field
                    label="Sucursales"
                    edit={editMode}
                    value={form.sucursales}
                    onChange={(v) => onChange("sucursales", v)}
                    placeholder="Listado o /"
                  />
                  <Field
                    label="Principales socios comerciales"
                    edit={editMode}
                    value={form.socios}
                    onChange={(v) => onChange("socios", v)}
                    placeholder="Listado o /"
                  />
                </div>

                {/* Importaciones / Exportaciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ToggleCard
                    label="Importaciones"
                    value={form.importaciones}
                    edit={editMode}
                    onToggle={() => onToggle("importaciones")}
                  />
                  <ToggleCard
                    label="Exportaciones"
                    value={form.exportaciones}
                    edit={editMode}
                    onToggle={() => onToggle("exportaciones")}
                  />
                </div>

                {/* Productos / Servicios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field
                    label="Productos"
                    edit={editMode}
                    value={form.productos}
                    onChange={(v) => onChange("productos", v)}
                    placeholder="/"
                  />
                  <Field
                    label="Servicios"
                    edit={editMode}
                    value={form.servicios}
                    onChange={(v) => onChange("servicios", v)}
                    placeholder="/"
                  />
                </div>

                {/* ODS */}
                <Field
                  label="Objetivos de Desarrollo Sostenible"
                  edit={editMode}
                  value={form.objetivos}
                  onChange={(v) => onChange("objetivos", v)}
                  placeholder="/"
                />
              </section>

              {/* ==========================================================
                  PANEL DERECHO
                 ========================================================== */}
              <aside className="space-y-4">
                <StatCard value={stats.compras} title="Compras realizadas" />
                <StatCard value={stats.ventas} title="Ventas realizadas" />

                <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 text-center">
                  <div className="text-5xl font-extrabold text-accent">{stats.restantes}</div>
                  <div className="mt-2 text-muted leading-snug">
                    Transacciones restantes para desbloquear el rango Platino.
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   COMPONENTES UI (theme-ready + documentados)
   ========================================================== */

/**
 * Field
 * - En modo view (edit=false) muestra el valor como texto.
 * - En modo edit (edit=true) muestra input o textarea.
 * - Usa tokens para ser compatible con tema claro/oscuro.
 */
function Field({
  label,
  value,
  onChange,
  edit = false,
  textarea = false,
  type = "text",
  placeholder = "",
}) {
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>

      {edit ? (
        textarea ? (
          <textarea
            className="mt-1 w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-text outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted/70"
            rows={3}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <input
            type={type}
            className="mt-1 w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-text outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted/70"
            value={value ?? (type === "number" ? 0 : "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        )
      ) : (
        <p className="mt-2 text-text break-all">
          {String(value ?? "").trim() ? String(value) : <span className="text-muted">—</span>}
        </p>
      )}
    </div>
  );
}

/**
 * ToggleCard
 * - Alterna valores booleanos (importaciones/exportaciones).
 * - En modo view muestra estado con icono.
 * - En modo edit habilita el switch.
 */
function ToggleCard({ label, value, edit, onToggle }) {
  const active = !!value;

  return (
    <div className="rounded-3xl border border-border bg-surface/40 backdrop-blur-xl shadow-pro p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text font-semibold">{label}</p>
          <p className="text-muted text-xs mt-1">Estado: {active ? "Sí" : "No"}</p>
        </div>

        {edit ? (
          <button
            onClick={onToggle}
            className={[
              "w-14 h-7 rounded-full transition border border-border",
              active ? "bg-accent" : "bg-surface/70",
            ].join(" ")}
            title="Cambiar"
            type="button"
          >
            <span
              className={[
                "block w-6 h-6 rounded-full transform transition",
                "bg-slate-900/80",
                active ? "translate-x-7" : "translate-x-1",
              ].join(" ")}
            />
          </button>
        ) : (
          <span className={active ? "text-accent text-xl font-bold" : "text-muted text-xl font-bold"}>
            {active ? "✔" : "✖"}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * StatCard
 * - Tarjeta simple para stats del panel derecho.
 * - Theme-ready por tokens.
 */
function StatCard({ value, title }) {
  return (
    <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 text-center">
      <div className="text-5xl font-extrabold text-accent">{value}</div>
      <div className="mt-2 text-muted">{title}</div>
    </div>
  );
}