// frontend/src/components/EmpresaCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Users, Star, ArrowRight } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

/**
 * Card reutilizable de empresa
 * 
 * Props:
 * - empresa: objeto empresa (con rating incluido)
 */
export default function EmpresaCard({ empresa }) {
  const navigate = useNavigate();

  if (!empresa) return null;

  const {
    id,
    razonSocial,
    logo,
    sectorScian,
    estado,
    empleados,
    paquete,
    rating = { promedio: 0, total: 0 },
  } = empresa;

  const logoUrl = logo
    ? logo.startsWith("http")
      ? logo
      : `${API_URL}${logo}`
    : null;

  const irAlPerfil = () => {
    navigate(`/empresa/${id}`);
  };

  return (
    <article
      onClick={irAlPerfil}
      className="group cursor-pointer rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl shadow-2xl overflow-hidden hover:border-yellow-400/50 hover:-translate-y-1 transition-all duration-300"
    >
      {/* ===== HEADER: Logo + Plan ===== */}
      <div className="relative p-5 pb-3 flex items-start justify-between gap-3">
        {/* Logo */}
        <div className="flex-shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={razonSocial}
              className="w-16 h-16 rounded-2xl object-contain border border-white/20 bg-white/5"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center border border-white/20"
            style={{ display: logoUrl ? "none" : "flex" }}
          >
            <Building2 className="w-8 h-8 text-white/40" />
          </div>
        </div>

        {/* Badge de plan */}
        {paquete && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-100">
            {paquete}
          </span>
        )}
      </div>

      {/* ===== CONTENIDO ===== */}
      <div className="px-5 pb-5">
        {/* Nombre */}
        <h3
          className="text-white font-bold text-lg mb-1 line-clamp-2 group-hover:text-yellow-400 transition"
          title={razonSocial}
        >
          {razonSocial || "Empresa sin nombre"}
        </h3>

        {/* Sector */}
        {sectorScian && (
          <p className="text-white/60 text-sm mb-3 line-clamp-1" title={sectorScian}>
            {sectorScian}
          </p>
        )}

        {/* Info: Estado + Empleados */}
        <div className="flex flex-wrap gap-2 mb-4">
          {estado && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs">
              <MapPin className="w-3 h-3" />
              {estado}
            </span>
          )}
          {empleados && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs">
              <Users className="w-3 h-3" />
              {empleados}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          {rating.total > 0 ? (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-semibold text-sm">
                {rating.promedio.toFixed(1)}
              </span>
              <span className="text-white/50 text-xs">
                ({rating.total} {rating.total === 1 ? "reseña" : "reseñas"})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-white/20" />
              <span className="text-white/40 text-xs italic">Sin reseñas</span>
            </div>
          )}

          {/* Flecha "Ver más" */}
          <div className="opacity-0 group-hover:opacity-100 transition text-yellow-400">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </article>
  );
}