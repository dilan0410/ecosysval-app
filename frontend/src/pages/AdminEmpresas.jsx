import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Search, 
  Eye,
  Trash2, 
  X,
  Check,
  AlertCircle,
  MapPin,
  Mail,
  Globe,
  Users,
  TrendingUp,
  Calendar,
  Briefcase,
  Target,
  Award,
  Edit2
} from "lucide-react";

// REFRESH TOKENS - axios con interceptor
import { api } from "../api/axiosClient";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function AdminEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroAmbito, setFiltroAmbito] = useState("todos");
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [datosEditar, setDatosEditar] = useState({
    razonSocial: "",
    correo: "",
    representante: "",
    paginaWeb: "",
    ambito: "",
    ubicacion: "",
    sucursales: "",
    volumenVentas: "",
    empleados: 0,
    antiguedad: "",
    importaciones: false,
    exportaciones: false,
    socios: "",
    mision: "",
    vision: "",
    objetivos: "",
    productos: "",
    servicios: "",
    scianCodigo: "",
    scianDescripcion: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    cargarEmpresas();
  }, []);

    const cargarEmpresas = async () => {
      try {
        setLoading(true);
        // axios: token y refresh automáticos
        const res = await api.get("/empresas");
        setEmpresas(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error:", error);
        mostrarMensaje(
          "error",
          error.response?.data?.message || "Error al cargar empresas"
        );
      } finally {
        setLoading(false);
      }
    };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  // Abrir modal de edición
  const abrirEdicion = (empresa) => {
    setDatosEditar({
      razonSocial: empresa.razonSocial || "",
      correo: empresa.correo || "",
      representante: empresa.representante || "",
      paginaWeb: empresa.paginaWeb || "",
      ambito: empresa.ambito || "",
      ubicacion: empresa.ubicacion || "",
      sucursales: empresa.sucursales || "",
      volumenVentas: empresa.volumenVentas || "",
      empleados: empresa.empleados || 0,
      antiguedad: empresa.antiguedad || "",
      importaciones: empresa.importaciones || false,
      exportaciones: empresa.exportaciones || false,
      socios: empresa.socios || "",
      mision: empresa.mision || "",
      vision: empresa.vision || "",
      objetivos: empresa.objetivos || "",
      productos: empresa.productos || "",
      servicios: empresa.servicios || "",
      scianCodigo: empresa.scianCodigo || "",
      scianDescripcion: empresa.scianDescripcion || "",
    });
    setErrorModal(null);
    setModalEditar(empresa);
  };

  // Guardar cambios de la empresa
  const guardarEmpresa = async () => {
    setErrorModal(null);

    // Validaciones
    if (!datosEditar.razonSocial || datosEditar.razonSocial.trim().length < 3) {
      setErrorModal("La razón social debe tener al menos 3 caracteres");
      return;
    }

    if (!datosEditar.correo || !datosEditar.correo.includes("@")) {
      setErrorModal("Correo electrónico inválido");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(datosEditar.correo)) {
      setErrorModal("El formato del correo no es válido");
      return;
    }

    if (!datosEditar.representante || datosEditar.representante.trim().length < 3) {
      setErrorModal("El representante es obligatorio");
      return;
    }

      try {
        setGuardando(true);

        // Convertir empleados a número
        const dataToSend = {
          ...datosEditar,
          empleados: Number(datosEditar.empleados) || 0,
        };

        // axios: token, refresh y errores automáticos
        await api.put(`/empresas/${modalEditar.id}`, dataToSend);

        mostrarMensaje("exito", "Empresa actualizada correctamente");
        setModalEditar(null);
        cargarEmpresas();
      } catch (error) {
        console.error("Error:", error);
        // Axios pone el error del servidor en error.response.data
        setErrorModal(
          error.response?.data?.message || "Error al actualizar empresa"
        );
      } finally {
        setGuardando(false);
      }
    };

  const eliminarEmpresa = async () => {
    if (!modalEliminar) return;

    try {
      // axios con auto-refresh
      await api.delete(`/empresas/${modalEliminar.id}`);
      mostrarMensaje("exito", "Empresa eliminada correctamente");
      cargarEmpresas();
    } catch (error) {
      mostrarMensaje(
        "error",
        error.response?.data?.message || "Error al eliminar empresa"
      );
    } finally {
      setModalEliminar(null);
    }
  };

  // Obtener ámbitos únicos para el filtro
  const ambitos = [...new Set(empresas.map(e => e.ambito).filter(Boolean))];

  // Filtrar empresas
  const empresasFiltradas = empresas.filter((e) => {
    const coincideBusqueda = 
      e.razonSocial?.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.representante?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideAmbito = filtroAmbito === "todos" || e.ambito === filtroAmbito;
    
    return coincideBusqueda && coincideAmbito;
  });

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    return new Date(fecha).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Formatear dinero
  const formatearDinero = (cantidad) => {
    if (!cantidad) return "No especificado";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN"
    }).format(cantidad);
  };

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Building2 size={32} className="text-yellow-400" />
            Gestión de Empresas
          </h1>
          <p className="text-gray-400">
            Total: {empresas.length} empresas registradas
          </p>
        </div>
      </div>

      {/* MENSAJE */}
      {mensaje && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
            mensaje.tipo === "exito"
              ? "bg-green-500/20 border border-green-500/40 text-green-300"
              : "bg-red-500/20 border border-red-500/40 text-red-300"
          }`}
        >
          {mensaje.tipo === "exito" ? <Check size={20} /> : <AlertCircle size={20} />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* FILTROS */}
      <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por razón social, correo o representante..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <select
            value={filtroAmbito}
            onChange={(e) => setFiltroAmbito(e.target.value)}
            className="bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500/50"
          >
            <option value="todos">Todos los ámbitos</option>
            {ambitos.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLA / TARJETAS */}
      <div className="bg-black/30 border border-yellow-500/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            Cargando empresas...
          </div>
        ) : empresasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Building2 size={48} className="mx-auto mb-4 opacity-50" />
            {empresas.length === 0 
              ? "No hay empresas registradas aún"
              : "No se encontraron empresas con esos filtros"
            }
          </div>
        ) : (
          <>
            {/* VISTA DESKTOP (tabla) - oculta en móvil */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/40 border-b border-yellow-500/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">Empresa</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">Ubicación</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">Empleados</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">Antigüedad</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-yellow-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empresasFiltradas.map((empresa) => (
                    <tr 
                      key={empresa.id} 
                      className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-300">#{empresa.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-yellow-400 font-bold text-lg flex-shrink-0">
                            {empresa.logo ? (
                              <img 
                                src={`${API_URL}${empresa.logo}`}
                                alt={empresa.razonSocial}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              empresa.razonSocial?.charAt(0).toUpperCase() || "?"
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{empresa.razonSocial}</p>
                            <p className="text-xs text-gray-400">{empresa.correo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-500" />
                          {empresa.ubicacion}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-500" />
                          {empresa.empleados}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">
                          <Award size={14} />
                          {empresa.antiguedad} años
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModalDetalle(empresa)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => abrirEdicion(empresa)}
                            className="p-2 hover:bg-yellow-500/20 rounded-lg text-yellow-400 transition-colors"
                            title="Editar empresa"
                          >
                            <Edit2 size={18} />
                          </button>
                          
                          <button
                            onClick={() => setModalEliminar(empresa)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* VISTA MÓVIL (tarjetas) - oculta en desktop */}
            <div className="lg:hidden divide-y divide-gray-800">
              {empresasFiltradas.map((empresa) => (
                <div 
                  key={empresa.id}
                  className="p-4 hover:bg-white/5 transition-colors"
                >
                  {/* Header de la tarjeta */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-yellow-400 font-bold text-xl flex-shrink-0">
                      {empresa.logo ? (
                        <img 
                          src={`${API_URL}${empresa.logo}`}
                          alt={empresa.razonSocial}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        empresa.razonSocial?.charAt(0).toUpperCase() || "?"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{empresa.razonSocial}</p>
                      <p className="text-xs text-gray-400 truncate">{empresa.correo}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">#{empresa.id}</span>
                  </div>

                  {/* Info de la empresa */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="bg-black/30 p-2 rounded-lg">
                      <p className="text-gray-500 mb-1 flex items-center gap-1">
                        <MapPin size={12} /> Ubicación
                      </p>
                      <p className="text-gray-300 truncate">{empresa.ubicacion || "—"}</p>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg">
                      <p className="text-gray-500 mb-1 flex items-center gap-1">
                        <Users size={12} /> Empleados
                      </p>
                      <p className="text-gray-300">{empresa.empleados}</p>
                    </div>
                  </div>

                  {/* Badge de antigüedad */}
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">
                      <Award size={14} />
                      {empresa.antiguedad} años de antigüedad
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalDetalle(empresa)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors text-sm font-semibold"
                    >
                      <Eye size={16} />
                      Ver
                    </button>

                    <button
                      onClick={() => abrirEdicion(empresa)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg text-yellow-400 transition-colors text-sm font-semibold"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    
                    <button
                      onClick={() => setModalEliminar(empresa)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODAL DETALLE */}
      {modalDetalle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-500/30 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-yellow-400 font-bold text-2xl flex-shrink-0">
                  {modalDetalle.logo ? (
                    <img 
                      src={`${API_URL}${modalDetalle.logo}`}
                      alt={modalDetalle.razonSocial}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    modalDetalle.razonSocial?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{modalDetalle.razonSocial}</h2>
                  <p className="text-gray-400 text-sm">ID: #{modalDetalle.id}</p>
                </div>
              </div>
              <button
                onClick={() => setModalDetalle(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Información en grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                  <Mail size={14} /> Correo
                </p>
                <p className="font-medium">{modalDetalle.correo}</p>
              </div>

              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                  <Globe size={14} /> Página web
                </p>
                <p className="font-medium text-blue-400">{modalDetalle.paginaWeb || "No especificada"}</p>
              </div>

              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                  <Users size={14} /> Representante
                </p>
                <p className="font-medium">{modalDetalle.representante}</p>
              </div>

              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                  <MapPin size={14} /> Ubicación
                </p>
                <p className="font-medium">{modalDetalle.ubicacion}</p>
              </div>

              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                  <TrendingUp size={14} /> Volumen de ventas
                </p>
                <p className="font-medium">{formatearDinero(modalDetalle.volumenVentas)}</p>
              </div>

              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                  <Briefcase size={14} /> Empleados
                </p>
                <p className="font-medium">{modalDetalle.empleados}</p>
              </div>

              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                  <Award size={14} /> Antigüedad
                </p>
                <p className="font-medium">{modalDetalle.antiguedad} años</p>
              </div>

              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                  <Calendar size={14} /> Registrada
                </p>
                <p className="font-medium">{formatearFecha(modalDetalle.createdAt)}</p>
              </div>
            </div>

            {/* Importaciones / Exportaciones */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg text-center ${modalDetalle.importaciones ? 'bg-green-500/20 border border-green-500/40' : 'bg-gray-500/20 border border-gray-500/30'}`}>
                <p className="text-xs text-gray-400 mb-1">Importaciones</p>
                <p className={`font-bold ${modalDetalle.importaciones ? 'text-green-400' : 'text-gray-400'}`}>
                  {modalDetalle.importaciones ? "✓ SÍ" : "✗ NO"}
                </p>
              </div>

              <div className={`p-4 rounded-lg text-center ${modalDetalle.exportaciones ? 'bg-green-500/20 border border-green-500/40' : 'bg-gray-500/20 border border-gray-500/30'}`}>
                <p className="text-xs text-gray-400 mb-1">Exportaciones</p>
                <p className={`font-bold ${modalDetalle.exportaciones ? 'text-green-400' : 'text-gray-400'}`}>
                  {modalDetalle.exportaciones ? "✓ SÍ" : "✗ NO"}
                </p>
              </div>
            </div>

            {/* Misión y Visión */}
            {modalDetalle.mision && (
              <div className="bg-black/40 p-4 rounded-lg mb-4">
                <p className="text-xs text-yellow-400 mb-2 flex items-center gap-2 font-semibold">
                  <Target size={14} /> MISIÓN
                </p>
                <p className="text-sm text-gray-300">{modalDetalle.mision}</p>
              </div>
            )}

            {modalDetalle.vision && (
              <div className="bg-black/40 p-4 rounded-lg mb-4">
                <p className="text-xs text-yellow-400 mb-2 flex items-center gap-2 font-semibold">
                  <Eye size={14} /> VISIÓN
                </p>
                <p className="text-sm text-gray-300">{modalDetalle.vision}</p>
              </div>
            )}

            {/* Productos y Servicios */}
            {modalDetalle.productos && (
              <div className="bg-black/40 p-4 rounded-lg mb-4">
                <p className="text-xs text-yellow-400 mb-2 font-semibold">PRODUCTOS</p>
                <p className="text-sm text-gray-300">{modalDetalle.productos}</p>
              </div>
            )}

            {modalDetalle.servicios && (
              <div className="bg-black/40 p-4 rounded-lg mb-4">
                <p className="text-xs text-yellow-400 mb-2 font-semibold">SERVICIOS</p>
                <p className="text-sm text-gray-300">{modalDetalle.servicios}</p>
              </div>
            )}

            {/* SCIAN */}
            {modalDetalle.scianCodigo && (
              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-xs text-yellow-400 mb-2 font-semibold">CLASIFICACIÓN SCIAN</p>
                <p className="text-sm text-gray-300">
                  <span className="font-bold">{modalDetalle.scianCodigo}</span> - {modalDetalle.scianDescripcion}
                </p>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setModalDetalle(null)}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN */}
        {modalEditar && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-500/30 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/20 p-3 rounded-lg">
                    <Edit2 size={24} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Editar Empresa</h3>
                    <p className="text-xs text-gray-400">ID: #{modalEditar.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalEditar(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Formulario */}
              <div className="space-y-6">
                
                {/* SECCIÓN: INFORMACIÓN BÁSICA */}
                <div>
                  <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <Building2 size={16} />
                    INFORMACIÓN BÁSICA
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Razón Social <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={datosEditar.razonSocial}
                        onChange={(e) => setDatosEditar({ ...datosEditar, razonSocial: e.target.value })}
                        placeholder="Nombre legal de la empresa"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Correo <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={datosEditar.correo}
                        onChange={(e) => setDatosEditar({ ...datosEditar, correo: e.target.value })}
                        placeholder="contacto@empresa.com"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Representante <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={datosEditar.representante}
                        onChange={(e) => setDatosEditar({ ...datosEditar, representante: e.target.value })}
                        placeholder="Nombre completo"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Página Web
                      </label>
                      <input
                        type="text"
                        value={datosEditar.paginaWeb}
                        onChange={(e) => setDatosEditar({ ...datosEditar, paginaWeb: e.target.value })}
                        placeholder="https://www.empresa.com"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* SECCIÓN: UBICACIÓN */}
                <div>
                  <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <MapPin size={16} />
                    UBICACIÓN
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Ámbito
                      </label>
                      <select
                        value={datosEditar.ambito}
                        onChange={(e) => setDatosEditar({ ...datosEditar, ambito: e.target.value })}
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500/50"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Local">Local</option>
                        <option value="Regional">Regional</option>
                        <option value="Nacional">Nacional</option>
                        <option value="Internacional">Internacional</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={datosEditar.ubicacion}
                        onChange={(e) => setDatosEditar({ ...datosEditar, ubicacion: e.target.value })}
                        placeholder="Ciudad, Estado"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Sucursales
                      </label>
                      <input
                        type="text"
                        value={datosEditar.sucursales}
                        onChange={(e) => setDatosEditar({ ...datosEditar, sucursales: e.target.value })}
                        placeholder="Lista de ciudades con sucursales"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* SECCIÓN: NEGOCIO */}
                <div>
                  <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} />
                    INFORMACIÓN DEL NEGOCIO
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Volumen de Ventas
                      </label>
                      <input
                        type="text"
                        value={datosEditar.volumenVentas}
                        onChange={(e) => setDatosEditar({ ...datosEditar, volumenVentas: e.target.value })}
                        placeholder="Ej: 5000000"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Empleados
                      </label>
                      <input
                        type="number"
                        value={datosEditar.empleados}
                        onChange={(e) => setDatosEditar({ ...datosEditar, empleados: e.target.value })}
                        placeholder="0"
                        min="0"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Antigüedad (años)
                      </label>
                      <input
                        type="text"
                        value={datosEditar.antiguedad}
                        onChange={(e) => setDatosEditar({ ...datosEditar, antiguedad: e.target.value })}
                        placeholder="Ej: 10"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                      />
                    </div>
                  </div>

                  {/* Checkboxes Importaciones / Exportaciones */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <label className="flex items-center gap-3 cursor-pointer bg-black/30 p-3 rounded-lg hover:bg-black/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={datosEditar.importaciones}
                        onChange={(e) => setDatosEditar({ ...datosEditar, importaciones: e.target.checked })}
                        className="w-5 h-5 accent-yellow-500"
                      />
                      <span className="text-sm font-medium">Realiza Importaciones</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer bg-black/30 p-3 rounded-lg hover:bg-black/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={datosEditar.exportaciones}
                        onChange={(e) => setDatosEditar({ ...datosEditar, exportaciones: e.target.checked })}
                        className="w-5 h-5 accent-yellow-500"
                      />
                      <span className="text-sm font-medium">Realiza Exportaciones</span>
                    </label>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Socios Comerciales
                    </label>
                    <input
                      type="text"
                      value={datosEditar.socios}
                      onChange={(e) => setDatosEditar({ ...datosEditar, socios: e.target.value })}
                      placeholder="Nombres de socios principales"
                      className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                    />
                  </div>
                </div>

                {/* SECCIÓN: MISIÓN / VISIÓN / OBJETIVOS */}
                <div>
                  <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <Target size={16} />
                    MISIÓN Y VISIÓN
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Misión
                      </label>
                      <textarea
                        value={datosEditar.mision}
                        onChange={(e) => setDatosEditar({ ...datosEditar, mision: e.target.value })}
                        placeholder="Razón de ser de la empresa..."
                        rows={3}
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Visión
                      </label>
                      <textarea
                        value={datosEditar.vision}
                        onChange={(e) => setDatosEditar({ ...datosEditar, vision: e.target.value })}
                        placeholder="Hacia dónde se proyecta la empresa..."
                        rows={3}
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Objetivos
                      </label>
                      <textarea
                        value={datosEditar.objetivos}
                        onChange={(e) => setDatosEditar({ ...datosEditar, objetivos: e.target.value })}
                        placeholder="Objetivos estratégicos..."
                        rows={3}
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECCIÓN: PRODUCTOS Y SERVICIOS */}
                <div>
                  <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <Briefcase size={16} />
                    PRODUCTOS Y SERVICIOS
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Productos
                      </label>
                      <textarea
                        value={datosEditar.productos}
                        onChange={(e) => setDatosEditar({ ...datosEditar, productos: e.target.value })}
                        placeholder="Lista de productos..."
                        rows={3}
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Servicios
                      </label>
                      <textarea
                        value={datosEditar.servicios}
                        onChange={(e) => setDatosEditar({ ...datosEditar, servicios: e.target.value })}
                        placeholder="Lista de servicios..."
                        rows={3}
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECCIÓN: SCIAN */}
                <div>
                  <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <Award size={16} />
                    CLASIFICACIÓN SCIAN
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Código SCIAN
                      </label>
                      <input
                        type="text"
                        value={datosEditar.scianCodigo}
                        onChange={(e) => setDatosEditar({ ...datosEditar, scianCodigo: e.target.value })}
                        placeholder="Ej: 511210"
                        maxLength={10}
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Descripción SCIAN
                      </label>
                      <input
                        type="text"
                        value={datosEditar.scianDescripcion}
                        onChange={(e) => setDatosEditar({ ...datosEditar, scianDescripcion: e.target.value })}
                        placeholder="Ej: Edición de software"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Error dentro del modal */}
                {errorModal && (
                  <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-400" />
                    <p className="text-sm text-red-300">{errorModal}</p>
                  </div>
                )}

                {/* Aviso */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-blue-300 flex items-start gap-2">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Los campos marcados con <span className="text-red-400">*</span> son obligatorios. El logo se gestiona desde una pantalla separada.</span>
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setModalEditar(null)}
                  disabled={guardando}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEmpresa}
                  disabled={guardando}
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {guardando ? (
                    <>
                      <span className="animate-spin"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
)}

      {/* MODAL ELIMINAR */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/20 p-3 rounded-lg">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold">¿Eliminar empresa?</h3>
            </div>
            
            <p className="text-gray-300 mb-2">Estás a punto de eliminar:</p>
            <p className="text-yellow-400 font-semibold mb-4">
              {modalEliminar.razonSocial}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Esta acción no se puede deshacer.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalEliminar(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarEmpresa}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEmpresas;