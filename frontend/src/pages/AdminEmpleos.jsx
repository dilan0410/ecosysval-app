import React, { useEffect, useState } from "react";
import { 
  Briefcase, 
  Search, 
  Eye,
  Trash2, 
  X,
  Check,
  AlertCircle,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  FileText,
  Award,
  Calendar,
  XCircle,
  PlayCircle,
  Power
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function AdminEmpleos() {
  const [empleos, setEmpleos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroModalidad, setFiltroModalidad] = useState("todos");
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    cargarEmpleos();
  }, []);

  const cargarEmpleos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/empleos`);
      
      if (res.ok) {
        const data = await res.json();
        setEmpleos(Array.isArray(data) ? data : []);
      } else {
        mostrarMensaje("error", "Error al cargar empleos");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("error", "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  // Cerrar empleo
  const cerrarEmpleo = async (empleo) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/empleos/${empleo.id}/cerrar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        mostrarMensaje("exito", "Empleo cerrado correctamente");
        cargarEmpleos();
      } else {
        mostrarMensaje("error", "Error al cerrar el empleo");
      }
    } catch (error) {
      mostrarMensaje("error", "Error de conexión");
    }
  };

  // Reabrir empleo
  const reabrirEmpleo = async (empleo) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/empleos/${empleo.id}/reabrir`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        mostrarMensaje("exito", "Empleo reabierto correctamente");
        cargarEmpleos();
      } else {
        mostrarMensaje("error", "Error al reabrir el empleo");
      }
    } catch (error) {
      mostrarMensaje("error", "Error de conexión");
    }
  };

  // Eliminar empleo
  const eliminarEmpleo = async () => {
    if (!modalEliminar) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/empleos/${modalEliminar.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        mostrarMensaje("exito", "Empleo eliminado correctamente");
        cargarEmpleos();
      } else {
        mostrarMensaje("error", "Error al eliminar empleo");
      }
    } catch (error) {
      mostrarMensaje("error", "Error de conexión");
    } finally {
      setModalEliminar(null);
    }
  };

  // Obtener modalidades únicas
  const modalidades = [...new Set(empleos.map(e => e.modalidad).filter(Boolean))];

  // Filtrar empleos
  const empleosFiltrados = empleos.filter((e) => {
    const coincideBusqueda = 
      e.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.empresa?.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.ubicacion?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideEstado = filtroEstado === "todos" || e.estado === filtroEstado;
    const coincideModalidad = filtroModalidad === "todos" || e.modalidad === filtroModalidad;
    
    return coincideBusqueda && coincideEstado && coincideModalidad;
  });

  // Estadísticas
  const activos = empleos.filter(e => e.estado === "ACTIVA").length;
  const cerrados = empleos.filter(e => e.estado === "CERRADA").length;

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    return new Date(fecha).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

    // Calcular días desde publicación
    const diasDesde = (fecha) => {
    if (!fecha) return "Sin fecha";
    
    const ahora = new Date();
    const publicado = new Date(fecha);
    const diffMs = ahora - publicado;
    
    // Si la fecha está en el futuro o es muy reciente
    if (diffMs < 0) return "Hoy";
    
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Menos de 1 hora
    if (diffMinutos < 60) {
        if (diffMinutos < 1) return "Hace unos segundos";
        return `Hace ${diffMinutos} min`;
    }
    
    // Menos de 24 horas
    if (diffHoras < 24) {
        return `Hace ${diffHoras}h`;
    }
    
    // Menos de 7 días
    if (diffDias < 7) {
        return `Hace ${diffDias} ${diffDias === 1 ? 'día' : 'días'}`;
    }
    
    // Menos de 30 días
    if (diffDias < 30) {
        const semanas = Math.floor(diffDias / 7);
        return `Hace ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
    }
    
    // Menos de 365 días
    if (diffDias < 365) {
        const meses = Math.floor(diffDias / 30);
        return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
    
    // Más de un año
    const años = Math.floor(diffDias / 365);
    return `Hace ${años} ${años === 1 ? 'año' : 'años'}`;
    };

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Briefcase size={32} className="text-yellow-400" />
          Gestión de Empleos
        </h1>
        <p className="text-gray-400">
          Total: {empleos.length} ofertas · 
          <span className="text-green-400 ml-1">{activos} activas</span> · 
          <span className="text-red-400 ml-1">{cerrados} cerradas</span>
        </p>
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
              placeholder="Buscar por título, empresa o ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500/50"
          >
            <option value="todos">Todos los estados</option>
            <option value="ACTIVA">Solo Activas</option>
            <option value="CERRADA">Solo Cerradas</option>
          </select>

          <select
            value={filtroModalidad}
            onChange={(e) => setFiltroModalidad(e.target.value)}
            className="bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500/50"
          >
            <option value="todos">Todas las modalidades</option>
            {modalidades.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-black/30 border border-yellow-500/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            Cargando empleos...
          </div>
        ) : empleosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
            {empleos.length === 0 
              ? "No hay empleos publicados aún"
              : "No se encontraron empleos con esos filtros"
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/40 border-b border-yellow-500/20">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">Empleo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">Modalidad</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">Salario</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">Publicado</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-yellow-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleosFiltrados.map((empleo) => (
                  <tr 
                    key={empleo.id} 
                    className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-300">#{empleo.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{empleo.titulo}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Building2 size={12} />
                          {empleo.empresa}
                          {empleo.ubicacion && (
                            <>
                              <span className="mx-1">·</span>
                              <MapPin size={12} />
                              {empleo.ubicacion}
                            </>
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full font-semibold">
                        {empleo.modalidad || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-green-400" />
                        {empleo.salario || "Por acordar"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {empleo.estado === "ACTIVA" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                          <PlayCircle size={14} />
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
                          <XCircle size={14} />
                          Cerrada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-gray-500" />
                          {diasDesde(empleo.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModalDetalle(empleo)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {empleo.estado === "ACTIVA" ? (
                          <button
                            onClick={() => cerrarEmpleo(empleo)}
                            className="p-2 hover:bg-orange-500/20 rounded-lg text-orange-400 transition-colors"
                            title="Cerrar empleo"
                          >
                            <Power size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => reabrirEmpleo(empleo)}
                            className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors"
                            title="Reabrir empleo"
                          >
                            <PlayCircle size={18} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => setModalEliminar(empleo)}
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
        )}
      </div>

      {/* MODAL DETALLE */}
      {modalDetalle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-500/30 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{modalDetalle.titulo}</h2>
                  {modalDetalle.estado === "ACTIVA" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      <PlayCircle size={14} />
                      Activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
                      <XCircle size={14} />
                      Cerrada
                    </span>
                  )}
                </div>
                <p className="text-yellow-400 font-medium flex items-center gap-2">
                  <Building2 size={16} />
                  {modalDetalle.empresa}
                </p>
                <p className="text-gray-400 text-sm">ID: #{modalDetalle.id}</p>
              </div>
              <button
                onClick={() => setModalDetalle(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Info en grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {modalDetalle.ubicacion && (
                <div className="bg-black/40 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <MapPin size={12} /> Ubicación
                  </p>
                  <p className="text-sm font-medium">{modalDetalle.ubicacion}</p>
                </div>
              )}

              {modalDetalle.modalidad && (
                <div className="bg-black/40 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Modalidad</p>
                  <p className="text-sm font-medium">{modalDetalle.modalidad}</p>
                </div>
              )}

              {modalDetalle.jornada && (
                <div className="bg-black/40 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Jornada</p>
                  <p className="text-sm font-medium">{modalDetalle.jornada}</p>
                </div>
              )}

              {modalDetalle.contrato && (
                <div className="bg-black/40 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Contrato</p>
                  <p className="text-sm font-medium">{modalDetalle.contrato}</p>
                </div>
              )}
            </div>

            {/* Salario */}
            {modalDetalle.salario && (
              <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/30 p-4 rounded-lg mb-4">
                <p className="text-xs text-green-300 mb-1 flex items-center gap-1">
                  <DollarSign size={14} /> SALARIO
                </p>
                <p className="text-xl font-bold text-green-400">{modalDetalle.salario}</p>
              </div>
            )}

            {/* Descripción */}
            <div className="bg-black/40 p-4 rounded-lg mb-4">
              <p className="text-xs text-yellow-400 mb-2 font-semibold flex items-center gap-1">
                <FileText size={14} /> DESCRIPCIÓN
              </p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{modalDetalle.descripcion}</p>
            </div>

            {/* Requisitos */}
            {modalDetalle.requisitos && (
              <div className="bg-black/40 p-4 rounded-lg mb-4">
                <p className="text-xs text-yellow-400 mb-2 font-semibold flex items-center gap-1">
                  <Award size={14} /> REQUISITOS
                </p>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{modalDetalle.requisitos}</p>
              </div>
            )}

            {/* Beneficios */}
            {modalDetalle.beneficios && (
              <div className="bg-black/40 p-4 rounded-lg mb-4">
                <p className="text-xs text-yellow-400 mb-2 font-semibold">BENEFICIOS</p>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{modalDetalle.beneficios}</p>
              </div>
            )}

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-black/40 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Publicado
                </p>
                <p className="text-sm font-medium">{formatearFecha(modalDetalle.createdAt)}</p>
              </div>

              <div className="bg-black/40 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <Clock size={12} /> Última actualización
                </p>
                <p className="text-sm font-medium">{formatearFecha(modalDetalle.updatedAt)}</p>
              </div>
            </div>

            <div className="flex justify-end">
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

      {/* MODAL ELIMINAR */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/20 p-3 rounded-lg">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold">¿Eliminar empleo?</h3>
            </div>
            
            <p className="text-gray-300 mb-2">Estás a punto de eliminar:</p>
            <p className="text-yellow-400 font-semibold mb-1">
              {modalEliminar.titulo}
            </p>
            <p className="text-gray-400 text-sm mb-4">{modalEliminar.empresa}</p>
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
                onClick={eliminarEmpleo}
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

export default AdminEmpleos;