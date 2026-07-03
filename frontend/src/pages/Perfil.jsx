// src/pages/Perfil.jsx
import React, { useEffect, useState } from "react";
import {
  Camera,
  Building2,
  Pencil,
  Save,
  X,
  Loader2,
  CheckCircle2,
  FileDown,
  Mail,
  MapPin,
  User,
  Globe,
  Users,
  Calendar,
  DollarSign,
  Target,
  Package,
  Wrench,
  Leaf,
  Store,
  Truck,
  Award,
} from "lucide-react";

import SidebarMenu from "../components/SidebarMenu";
import MainHeader from "../components/MainHeader";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Helper para obtener token JWT
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const OPCIONES_ODS = [
  "Fin de la Pobreza",
  "Hambre Cero",
  "Salud y Bienestar",
  "Educación y Calidad",
  "Igualdad de Género",
  "Agua Limpia y Saneamiento",
  "Energía asequible y no Contaminante",
  "Trabajo Decente y Crecimiento Económico",
  "Industria Innovación e Infraestructura",
  "Reducción de las Desigualdades",
  "Ciudades y Comunidades Sostenibles",
  "Producción y consumo responsable",
  "Acción por el Clima",
  "Vida Submarina",
  "Vida de Ecosistemas Terrestres",
  "Paz, Justicia e Instituciones Sólidas",
  "Alianzas para Lograr los Objetivos",
];

export default function Perfil() {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Cargar datos
  useEffect(() => {
    cargarEmpresa();
  }, []);

  async function cargarEmpresa() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/empresas/mi-empresa`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setEmpresa(data);
      } else if (res.status === 404) {
        setError("No tienes una empresa registrada aún.");
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

  async function descargarPDF() {
    if (!empresa?.id) return;

    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/empresas/${empresa.id}/reporte`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Error al generar PDF");
      const data = await res.json();
      if (data?.url) {
        const link = document.createElement("a");
        link.href = `${API_URL}${data.url}`;
        link.download = `perfil_${empresa.razonSocial || "empresa"}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo generar el PDF.");
    } finally {
      setDownloading(false);
    }
  }

  // ==========================================
  // ESTADOS DE CARGA
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando información empresarial...</span>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainHeader showSearch={true} showBack={false} />
        <div className="flex flex-1">
          <aside className="hidden md:block w-64">
            <SidebarMenu />
          </aside>
          <main className="flex-1 p-8">
            <div className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl p-8 text-center shadow-2xl">
              <Building2 className="w-16 h-16 mx-auto text-white/40 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                No tienes empresa registrada
              </h2>
              <p className="text-white/60">{error}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================

  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader showSearch={true} showBack={false} />

      <div className="flex flex-1">
        <aside className="hidden md:block w-64">
          <SidebarMenu />
        </aside>

        <main className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* HEADER */}
            <div className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-white">
                    Perfil Empresarial
                  </h1>
                  <p className="text-white/60 mt-1">
                    Información completa de tu empresa registrada.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={descargarPDF}
                    disabled={downloading || !empresa?.id}
                    className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-slate-900 px-4 py-2 rounded-2xl inline-flex items-center gap-2 font-semibold"
                  >
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                    Descargar PDF
                  </button>
                </div>
              </div>

              {/* PLAN ACTUAL */}
              {empresa.paquete && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/20 border border-yellow-400/40">
                  <Award className="w-4 h-4 text-yellow-300" />
                  <span className="text-yellow-100 font-semibold uppercase">
                    Plan {empresa.paquete}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200">
                {error}
              </div>
            )}

            {/* ============================================ */}
            {/* SECCIÓN 1: Datos generales */}
            {/* ============================================ */}
            <SectionCard icon={<Building2 />} title="Datos generales de la empresa">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Razón social" value={empresa.razonSocial} />
                <Field label="Correo electrónico" value={empresa.correo} icon={<Mail size={14} />} />
                <Field label="RFC" value={empresa.rfc} />
                <Field label="Sector SCIAN" value={empresa.sectorScian} />
                <Field label="Representante legal" value={empresa.representante} icon={<User size={14} />} />
                <Field label="Página web" value={empresa.paginaWeb} icon={<Globe size={14} />} />
                <Field label="Estado" value={empresa.estado || empresa.ubicacion} icon={<MapPin size={14} />} />
                <Field label="Empleados" value={empresa.empleados} icon={<Users size={14} />} />
                <Field label="Antigüedad" value={empresa.antiguedad} icon={<Calendar size={14} />} />
                <Field label="Volumen de ventas anual" value={empresa.volumenVentas} icon={<DollarSign size={14} />} />
                <Field label="Ámbito" value={empresa.ambito} />
              </div>
            </SectionCard>

            {/* ============================================ */}
            {/* SECCIÓN 2: Misión y visión */}
            {/* ============================================ */}
            <SectionCard icon={<Target />} title="Misión y visión">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Misión" value={empresa.mision} multiline />
                <Field label="Visión" value={empresa.vision} multiline />
              </div>
            </SectionCard>

            {/* ============================================ */}
            {/* SECCIÓN 3: Productos y servicios */}
            {/* ============================================ */}
            <SectionCard icon={<Package />} title="Productos y servicios">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ListField label="Productos" items={empresa.productos} />
                <ListField label="Servicios" items={empresa.servicios} />
              </div>
            </SectionCard>

            {/* ============================================ */}
            {/* SECCIÓN 4: ODS */}
            {/* ============================================ */}
            <SectionCard icon={<Leaf />} title="Objetivos de Desarrollo Sostenible (ODS)">
              {empresa.ods && Array.isArray(empresa.ods) && empresa.ods.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {empresa.ods.map((odsNum) => (
                    <div
                      key={odsNum}
                      className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/90 text-sm">
                        {odsNum}. {OPCIONES_ODS[odsNum - 1]}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/50 italic mb-4">No hay ODS seleccionados.</p>
              )}
              <ListField label="Actividades para promover los ODS" items={empresa.actividadesOds} />
            </SectionCard>

            {/* ============================================ */}
            {/* SECCIÓN 5: Sucursales y socios */}
            {/* ============================================ */}
            <SectionCard icon={<Store />} title="Sucursales y socios comerciales">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-white/60 text-sm mb-1">¿Tiene sucursales?</p>
                  <p className="text-white text-lg font-semibold">
                    {empresa.tieneSucursales ? "Sí" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">¿Tiene socios comerciales?</p>
                  <p className="text-white text-lg font-semibold">
                    {empresa.tieneSocios ? "Sí" : "No"}
                  </p>
                </div>
              </div>

              {empresa.tieneSucursales && (
                <div className="mb-4">
                  <ListField label="Estados con sucursales" items={empresa.sucursales} />
                </div>
              )}

              {empresa.tieneSocios && (
                <ListField label="Principales socios comerciales" items={empresa.socios} />
              )}
            </SectionCard>

            {/* ============================================ */}
            {/* SECCIÓN 6: Operaciones internacionales */}
            {/* ============================================ */}
            <SectionCard icon={<Truck />} title="Operaciones internacionales">
              <div className="mb-6">
                <p className="text-white/60 text-sm mb-2">Tipos de operaciones</p>
                {empresa.tiposOperaciones && Array.isArray(empresa.tiposOperaciones) && empresa.tiposOperaciones.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {empresa.tiposOperaciones.map((op) => (
                      <span
                        key={op}
                        className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-200 text-sm"
                      >
                        {op}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/50 italic">No especificado.</p>
                )}
              </div>

              {empresa.paisesImportacion && Array.isArray(empresa.paisesImportacion) && empresa.paisesImportacion.length > 0 && (
                <div className="mb-4">
                  <ListField label="Países de importación" items={empresa.paisesImportacion} />
                </div>
              )}

              {empresa.paisesExportacion && Array.isArray(empresa.paisesExportacion) && empresa.paisesExportacion.length > 0 && (
                <div className="mb-4">
                  <ListField label="Países de exportación" items={empresa.paisesExportacion} />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <p className="text-white/60 text-sm mb-2">Transporte para movimientos extranjeros</p>
                  {empresa.transporteExtranjero && Array.isArray(empresa.transporteExtranjero) && empresa.transporteExtranjero.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {empresa.transporteExtranjero.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-200 text-sm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/50 italic text-sm">No especificado.</p>
                  )}
                </div>

                <div>
                  <p className="text-white/60 text-sm mb-2">Transporte para movimientos nacionales</p>
                  {empresa.transporteNacional && Array.isArray(empresa.transporteNacional) && empresa.transporteNacional.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {empresa.transporteNacional.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-200 text-sm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/50 italic text-sm">No especificado.</p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* ============================================ */}
            {/* SECCIÓN 7: Logo */}
            {/* ============================================ */}
            {empresa.logo && (
              <SectionCard icon={<Camera />} title="Logo de la empresa">
                <div className="flex justify-center">
                  <img
                    src={empresa.logo.startsWith("http") ? empresa.logo : `${API_URL}${empresa.logo}`}
                    alt="Logo"
                    className="max-w-xs max-h-48 object-contain rounded-2xl border border-white/20"
                  />
                </div>
              </SectionCard>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTES UI REUTILIZABLES
// ==========================================

function SectionCard({ icon, title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-yellow-400">{icon}</div>
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, icon, multiline = false }) {
  const displayValue = value && String(value).trim() ? String(value) : "—";
  const isEmpty = !value || !String(value).trim();

  return (
    <div>
      <p className="text-white/60 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className={`text-white ${multiline ? "" : "truncate"} ${isEmpty ? "text-white/40 italic" : ""}`}>
        {displayValue}
      </p>
    </div>
  );
}

function ListField({ label, items }) {
  const validItems = Array.isArray(items) ? items.filter((i) => i && String(i).trim()) : [];

  return (
    <div>
      <p className="text-white/60 text-xs uppercase tracking-wider mb-2">{label}</p>
      {validItems.length > 0 ? (
        <ul className="space-y-1">
          {validItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-white/90">
              <span className="text-yellow-400 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white/40 italic">Sin datos registrados.</p>
      )}
    </div>
  );
}