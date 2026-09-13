// src/components/BuscadorInteligente.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Loader2, Building2, MapPin } from "lucide-react";
import useDebounce from "../hooks/useDebounce";
import { api } from "../api/axiosClient";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

export default function BuscadorInteligente() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  // Espera 300ms tras dejar de escribir para consultar la API
  const debouncedQuery = useDebounce(query, 300);

  // Cerrar el dropdown al hacer clic fuera del buscador
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Efecto que ejecuta la búsqueda en tiempo real
  useEffect(() => {
    const buscarEmpresas = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setResultados([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await api.get("/empresas/explorar/buscar", {
          params: { q: debouncedQuery, limit: 5 },
        });

        const data = res.data;
        
        // Extrae el arreglo de empresas sin importar cómo lo estructure la respuesta
        let items = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (Array.isArray(data?.empresas)) {
          items = data.empresas;
        } else if (Array.isArray(data?.data)) {
          items = data.data;
        } else if (Array.isArray(data?.items)) {
          items = data.items;
        }

        setResultados(items.slice(0, 5));
      } catch (error) {
        console.error("Error al autocompletar empresas:", error);
        setResultados([]);
      } finally {
        setIsSearching(false);
      }
    };

    buscarEmpresas();
  }, [debouncedQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    setShowDropdown(false);
    if (q) {
      navigate(`/explorar?q=${encodeURIComponent(q)}`);
    } else {
      navigate("/explorar");
    }
    setQuery("");
  };

  const handleSeleccionarEmpresa = (empresaId) => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/empresa/${empresaId}`);
  };

  return (
    <div ref={dropdownRef} className="w-full max-w-2xl relative">
      <form onSubmit={handleSubmit} className="w-full relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
          placeholder={t("header.searchPlaceholder", "Buscar empresas por nombre, sector, productos...")}
          className="w-full px-4 py-2.5 rounded-2xl bg-white/90 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-yellow-300/70 transition shadow-sm pr-10 text-sm font-medium"
          maxLength={100}
        />
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />

        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-900 transition flex items-center justify-center cursor-pointer"
          title={t("header.search", "Buscar")}
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Menú desplegable de Autocompletado */}
      {showDropdown && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 bg-[#0b1630]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-[3500] animate-in fade-in slide-in-from-top-2">
          {isSearching ? (
            <div className="p-4 text-center text-white/60 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
              <span>{t("common.loading", "Cargando...")}</span>
            </div>
          ) : resultados.length === 0 ? (
            <div className="p-4 text-center text-white/60 text-sm">
              {t("explore.noResults", "No se encontraron empresas")}
            </div>
          ) : (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-yellow-400/80 border-b border-white/5">
                {t("map.results", "Resultados")}
              </div>
              <ul>
                {resultados.map((emp) => {
                  const nombreEmpresa = emp.razonSocial || emp.nombre || emp.name || "Empresa";
                  const estadoEmpresa = emp.estado || emp.ubicacion || "México";
                  const logoEmpresa = emp.logo || emp.user?.empresa?.logo || null;

                  return (
                    <li key={emp.id}>
                      <button
                        type="button"
                        onClick={() => handleSeleccionarEmpresa(emp.id)}
                        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {logoEmpresa ? (
                            <img
                              src={getImageUrl(logoEmpresa)}
                              alt={nombreEmpresa}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-white/60" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/90 font-semibold text-sm truncate">
                            {nombreEmpresa}
                          </p>
                          <div className="flex items-center text-xs text-white/50 mt-0.5">
                            <MapPin className="w-3 h-3 mr-1 text-yellow-400/70" />
                            <span className="truncate">{estadoEmpresa}</span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="p-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-2 text-center text-xs font-semibold text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition cursor-pointer"
                >
                  {t("explore.showing", "Ver más resultados para")} "{query}" →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}