// frontend/src/pages/Explorar.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import EmpresaCard from "../components/EmpresaCard";
import { SkeletonEmpresaGrid } from "../components/SkeletonEmpresaCard";
import {
  Search,
  Filter,
  X,
  Loader2,
  Building2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const OPCIONES_ORDEN = [
  { value: "recientes", label: "Más recientes" },
  { value: "nombre", label: "Nombre (A-Z)" },
  { value: "mejor-calificadas", label: "Mejor calificadas" },
];

export default function Explorar() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados del buscador (input local)
  const [inputBusqueda, setInputBusqueda] = useState(
    searchParams.get("q") || ""
  );

  // Estados de filtros aplicados (lo que va al backend)
  const [filtros, setFiltros] = useState({
    q: searchParams.get("q") || "",
    estado: searchParams.get("estado") || "",
    empleados: searchParams.get("empleados") || "",
    ordenar: searchParams.get("ordenar") || "recientes",
    page: parseInt(searchParams.get("page") || "1"),
  });

  // Datos
  const [resultado, setResultado] = useState({
    empresas: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Opciones para filtros
  const [opcionesFiltros, setOpcionesFiltros] = useState({
    estados: [],
    empleados: [],
  });

  // Filtros móviles (colapsables)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // ==========================================
  // CARGAR FILTROS DISPONIBLES
  // ==========================================
  useEffect(() => {
    async function cargarFiltros() {
      try {
        const res = await fetch(`${API_URL}/empresas/explorar/filtros`);
        if (res.ok) {
          const data = await res.json();
          setOpcionesFiltros(data);
        }
      } catch (e) {
        console.error("Error cargando filtros:", e);
      }
    }
    cargarFiltros();
  }, []);

  // ==========================================
  // CARGAR EMPRESAS (cuando cambian filtros)
  // ==========================================
  const cargarEmpresas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filtros.q) params.set("q", filtros.q);
      if (filtros.estado) params.set("estado", filtros.estado);
      if (filtros.empleados) params.set("empleados", filtros.empleados);
      if (filtros.ordenar) params.set("ordenar", filtros.ordenar);
      params.set("page", filtros.page.toString());
      params.set("limit", "12");

      const res = await fetch(
        `${API_URL}/empresas/explorar/buscar?${params.toString()}`
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setResultado(data);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar las empresas.");
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarEmpresas();
  }, [cargarEmpresas]);

  // ==========================================
  // SINCRONIZAR URL con filtros
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams();
    if (filtros.q) params.set("q", filtros.q);
    if (filtros.estado) params.set("estado", filtros.estado);
    if (filtros.empleados) params.set("empleados", filtros.empleados);
    if (filtros.ordenar !== "recientes") params.set("ordenar", filtros.ordenar);
    if (filtros.page > 1) params.set("page", filtros.page.toString());
    setSearchParams(params);
    // eslint-disable-next-line
  }, [filtros]);

  // ==========================================
  // Detectar si viene búsqueda desde el header
  // ==========================================
  useEffect(() => {
    const qFromUrl = searchParams.get("q") || "";
    if (qFromUrl !== filtros.q) {
      setInputBusqueda(qFromUrl);
      setFiltros((f) => ({ ...f, q: qFromUrl, page: 1 }));
    }
    // eslint-disable-next-line
  }, [searchParams.get("q")]);

  // ==========================================
  // HANDLERS
  // ==========================================
  function buscar(e) {
    e?.preventDefault();
    setFiltros((f) => ({ ...f, q: inputBusqueda.trim(), page: 1 }));
  }

  function limpiarFiltros() {
    setInputBusqueda("");
    setFiltros({
      q: "",
      estado: "",
      empleados: "",
      ordenar: "recientes",
      page: 1,
    });
  }

  function cambiarPagina(nuevaPagina) {
    if (nuevaPagina < 1 || nuevaPagina > resultado.totalPages) return;
    setFiltros((f) => ({ ...f, page: nuevaPagina }));
    // Scroll suave arriba
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function actualizarFiltro(campo, valor) {
    setFiltros((f) => ({ ...f, [campo]: valor, page: 1 }));
  }

  const hayFiltrosActivos =
    !!filtros.q ||
    !!filtros.estado ||
    !!filtros.empleados ||
    filtros.ordenar !== "recientes";

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ===== HEADER ===== */}
        <div className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-7 h-7 text-yellow-400" />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Explorar Empresas
              </h1>
              <p className="text-white/60 text-sm">
                Descubre y conecta con empresas del ecosistema
              </p>
            </div>
          </div>

          {/* ===== BUSCADOR ===== */}
          <form onSubmit={buscar} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={inputBusqueda}
                onChange={(e) => setInputBusqueda(e.target.value)}
                placeholder="Buscar por nombre, sector, productos, servicios..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#1e293b] border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-400 transition"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-6 py-3 rounded-2xl font-bold inline-flex items-center justify-center gap-2 transition"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </form>
        </div>

        {/* ===== FILTROS ===== */}
        <div className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl p-4 md:p-6 shadow-2xl">
          {/* Header de filtros (móvil: toggle) */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
              className="md:cursor-default inline-flex items-center gap-2 text-white font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4 text-yellow-400" />
              Filtros
              {hayFiltrosActivos && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold">
                  Activos
                </span>
              )}
            </button>

            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="text-white/60 hover:text-yellow-400 text-sm inline-flex items-center gap-1 transition"
              >
                <X className="w-3 h-3" />
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Cuerpo de filtros (siempre visible en desktop, toggle en móvil) */}
          <div
            className={`
              grid grid-cols-1 md:grid-cols-3 gap-3 mt-4
              ${filtrosAbiertos ? "block" : "hidden md:grid"}
            `}
          >
            {/* Estado */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => actualizarFiltro("estado", e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-yellow-400 transition"
              >
                <option value="">Todos los estados</option>
                {opcionesFiltros.estados.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
            </div>

            {/* Empleados */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Tamaño (empleados)
              </label>
              <select
                value={filtros.empleados}
                onChange={(e) => actualizarFiltro("empleados", e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-yellow-400 transition"
              >
                <option value="">Cualquier tamaño</option>
                {opcionesFiltros.empleados.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenar */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Ordenar por
              </label>
              <select
                value={filtros.ordenar}
                onChange={(e) => actualizarFiltro("ordenar", e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-yellow-400 transition"
              >
                {OPCIONES_ORDEN.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ===== RESULTADOS ===== */}
        <div>
          {/* Contador */}
          {!loading && !error && (
            <div className="mb-4 text-white/70 text-sm">
              {resultado.total === 0 ? (
                <span>No se encontraron empresas</span>
              ) : (
                <span>
                  Mostrando{" "}
                  <strong className="text-yellow-400">
                    {resultado.empresas.length}
                  </strong>{" "}
                  de{" "}
                  <strong className="text-yellow-400">
                    {resultado.total}
                  </strong>{" "}
                  {resultado.total === 1 ? "empresa" : "empresas"}
                  {filtros.q && (
                    <>
                      {" "}
                      para "<span className="text-white">{filtros.q}</span>"
                    </>
                  )}
                </span>
              )}
            </div>
          )}

          {/* Grid de empresas */}
          {loading ? (
            <SkeletonEmpresaGrid count={12} />
          ) : error ? (
            <div className="rounded-2xl bg-red-500/20 border border-red-500/40 p-6 text-red-200 text-center">
              {error}
            </div>
          ) : resultado.empresas.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl p-12 text-center shadow-2xl">
              <Building2 className="w-16 h-16 mx-auto text-white/30 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                No se encontraron empresas
              </h3>
              <p className="text-white/50 text-sm mb-4">
                Intenta ajustar los filtros o buscar con otras palabras.
              </p>
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-4 py-2 rounded-xl inline-flex items-center gap-2 font-semibold transition"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {resultado.empresas.map((empresa) => (
                <EmpresaCard key={empresa.id} empresa={empresa} />
              ))}
            </div>
          )}

          {/* ===== PAGINACIÓN ===== */}
          {!loading && resultado.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => cambiarPagina(filtros.page - 1)}
                disabled={filtros.page === 1}
                className="p-2.5 rounded-xl bg-[#1e293b] border border-slate-600 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Anterior</span>
              </button>

              <div className="px-4 py-2 rounded-xl bg-[#1e293b] border border-slate-600">
                <span className="text-white/70 text-sm">
                  Página{" "}
                  <strong className="text-yellow-400">{filtros.page}</strong> de{" "}
                  <strong className="text-yellow-400">
                    {resultado.totalPages}
                  </strong>
                </span>
              </div>

              <button
                onClick={() => cambiarPagina(filtros.page + 1)}
                disabled={filtros.page === resultado.totalPages}
                className="p-2.5 rounded-xl bg-[#1e293b] border border-slate-600 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-1"
              >
                <span className="hidden sm:inline text-sm">Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}