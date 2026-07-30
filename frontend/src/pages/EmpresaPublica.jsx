// src/pages/EmpresaPublica.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ResenasSection from "../components/ResenasSection";
import SkeletonPerfilEmpresa from "../components/SkeletonPerfilEmpresa";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Calendar,
  Target,
  Package,
  Wrench,
  Leaf,
  Store,
  Truck,
  Award,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

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

// Helper: convierte cualquier valor a array de forma segura
function toArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return value.split(",").map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

// Helper: obtiene el userId del token JWT
function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

export default function EmpresaPublica() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    cargarEmpresa();
    // eslint-disable-next-line
  }, [id]);

  async function cargarEmpresa() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/empresas/${id}`);
      if (res.ok) {
        const data = await res.json();
        const empresaNormalizada = {
          ...data,
          productos: toArray(data.productos),
          servicios: toArray(data.servicios),
          ods: toArray(data.ods),
          actividadesOds: toArray(data.actividadesOds),
          sucursales: toArray(data.sucursales),
          socios: toArray(data.socios),
          tiposOperaciones: toArray(data.tiposOperaciones),
          paisesImportacion: toArray(data.paisesImportacion),
          paisesExportacion: toArray(data.paisesExportacion),
          transporteExtranjero: toArray(data.transporteExtranjero),
          transporteNacional: toArray(data.transporteNacional),
        };
        setEmpresa(empresaNormalizada);
      } else if (res.status === 404) {
        setError("Empresa no encontrada.");
      } else {
        throw new Error(`Error ${res.status}`);
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar la información de la empresa.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <SkeletonPerfilEmpresa />
      </Layout>
    );
  }

  if (!empresa) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl p-8 text-center shadow-2xl">
            <Building2 className="w-16 h-16 mx-auto text-white/40 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Empresa no encontrada
            </h2>
            <p className="text-white/60 mb-6">
              {error || "La empresa que buscas no existe o fue eliminada."}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-5 py-2 rounded-2xl inline-flex items-center gap-2 font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // ¿Es MI empresa? (para pasar esOwner a ResenasSection)
  const esMiEmpresa = currentUserId && empresa.userId === currentUserId;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ===== Botón volver ===== */}
        <button
          onClick={() => navigate(-1)}
          className="text-white/70 hover:text-white inline-flex items-center gap-2 text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* ===== HEADER con logo + info principal ===== */}
        <div className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Banner (si tiene) */}
          {empresa.banner && (
            <div className="h-40 md:h-56 w-full overflow-hidden">
              <img
                src={empresa.banner}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                {empresa.logo ? (
                  <img
                    src={
                      empresa.logo.startsWith("http")
                        ? empresa.logo
                        : `${API_URL}${empresa.logo}`
                    }
                    alt={empresa.razonSocial}
                    className="w-32 h-32 rounded-2xl object-contain border-2 border-white/20 bg-white/5"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-slate-700 flex items-center justify-center border-2 border-white/20">
                    <Building2 className="w-16 h-16 text-white/40" />
                  </div>
                )}
              </div>

              {/* Info principal */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                  {empresa.razonSocial}
                </h1>

                {empresa.sectorScian && (
                  <p className="text-white/70 mb-3">
                    Sector: <span className="text-yellow-400 font-semibold">{empresa.sectorScian}</span>
                  </p>
                )}

                {/* Info rápida */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {(empresa.estado || empresa.ubicacion) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      {empresa.estado || empresa.ubicacion}
                    </span>
                  )}
                  {empresa.empleados && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm">
                      <Users className="w-3.5 h-3.5" />
                      {empresa.empleados}
                    </span>
                  )}
                  {empresa.antiguedad && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      {empresa.antiguedad}
                    </span>
                  )}
                  {empresa.paquete && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-100 text-sm font-semibold uppercase">
                      <Award className="w-3.5 h-3.5" />
                      Plan {empresa.paquete}
                    </span>
                  )}
                </div>

                {/* Página web */}
                {empresa.paginaWeb && (
                  <a
                    href={
                      empresa.paginaWeb.startsWith("http")
                        ? empresa.paginaWeb
                        : `https://${empresa.paginaWeb}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm font-semibold transition"
                  >
                    <Globe className="w-4 h-4" />
                    {empresa.paginaWeb}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== MISIÓN Y VISIÓN ===== */}
        {(empresa.mision || empresa.vision) && (
          <SectionCard icon={<Target />} title="Misión y visión">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {empresa.mision && (
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                    Misión
                  </p>
                  <p className="text-white/90 leading-relaxed">{empresa.mision}</p>
                </div>
              )}
              {empresa.vision && (
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                    Visión
                  </p>
                  <p className="text-white/90 leading-relaxed">{empresa.vision}</p>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* ===== PRODUCTOS Y SERVICIOS ===== */}
        {(empresa.productos?.length > 0 || empresa.servicios?.length > 0) && (
          <SectionCard icon={<Package />} title="Productos y servicios">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {empresa.productos?.length > 0 && (
                <ListField
                  icon={<Package className="w-4 h-4 text-yellow-400" />}
                  label="Productos"
                  items={empresa.productos}
                />
              )}
              {empresa.servicios?.length > 0 && (
                <ListField
                  icon={<Wrench className="w-4 h-4 text-yellow-400" />}
                  label="Servicios"
                  items={empresa.servicios}
                />
              )}
            </div>
          </SectionCard>
        )}

        {/* ===== ODS ===== */}
        {empresa.ods?.length > 0 && (
          <SectionCard
            icon={<Leaf />}
            title="Objetivos de Desarrollo Sostenible"
          >
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
            {empresa.actividadesOds?.length > 0 && (
              <ListField
                label="Actividades para promover los ODS"
                items={empresa.actividadesOds}
              />
            )}
          </SectionCard>
        )}

        {/* ===== SUCURSALES Y SOCIOS ===== */}
        {(empresa.tieneSucursales || empresa.tieneSocios) && (
          <SectionCard icon={<Store />} title="Presencia comercial">
            {empresa.tieneSucursales && empresa.sucursales?.length > 0 && (
              <div className="mb-4">
                <ListField
                  label="Estados con sucursales"
                  items={empresa.sucursales}
                />
              </div>
            )}
            {empresa.tieneSocios && empresa.socios?.length > 0 && (
              <ListField
                label="Principales socios comerciales"
                items={empresa.socios}
              />
            )}
          </SectionCard>
        )}

        {/* ===== OPERACIONES INTERNACIONALES ===== */}
        {empresa.tiposOperaciones?.length > 0 &&
          !empresa.tiposOperaciones.includes("Ninguna") && (
            <SectionCard icon={<Truck />} title="Operaciones internacionales">
              <div className="mb-4">
                <p className="text-white/60 text-sm mb-2">Tipos de operaciones</p>
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
              </div>

              {empresa.paisesImportacion?.length > 0 && (
                <div className="mb-4">
                  <ListField
                    label="Países de importación"
                    items={empresa.paisesImportacion}
                  />
                </div>
              )}

              {empresa.paisesExportacion?.length > 0 && (
                <div className="mb-4">
                  <ListField
                    label="Países de exportación"
                    items={empresa.paisesExportacion}
                  />
                </div>
              )}
            </SectionCard>
          )}

        {/* ===== SECCIÓN DE RESEÑAS ===== */}
        <ResenasSection empresaId={empresa.id} esOwner={esMiEmpresa} />
      </div>
    </Layout>
  );
}

// ==========================================
// COMPONENTES REUTILIZABLES (mismos que Perfil.jsx)
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

function ListField({ label, items, icon }) {
  const validItems = Array.isArray(items)
    ? items.filter((i) => i && String(i).trim())
    : [];
  return (
    <div>
      <p className="text-white/60 text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
        {icon}
        {label}
      </p>
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