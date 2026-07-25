import React, { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Edit2, 
  Trash2, 
  Shield, 
  ShieldOff,
  X,
  Check,
  AlertCircle,
  UserPlus
} from "lucide-react";

// REFRESH TOKENS - axios con interceptor
import { api } from "../api/axiosClient";

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [ordenamiento, setOrdenamiento] = useState("recientes"); // recientes | antiguos | nombre
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [datosEditar, setDatosEditar] = useState({ name: "", email: "", role: "" });
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  // Cargar usuarios al iniciar
  useEffect(() => {
    cargarUsuarios();
  }, []);

    const cargarUsuarios = async () => {
      try {
        setLoading(true);
        // axios: token y refresh automáticos
        const res = await api.get("/users");
        setUsuarios(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error:", error);
        mostrarMensaje(
          "error",
          error.response?.data?.message || "Error al cargar usuarios"
        );
      } finally {
        setLoading(false);
      }
    };

  // Mostrar mensaje temporal
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  // Abrir modal de edición
const abrirEdicion = (usuario) => {
  setDatosEditar({
    name: usuario.name || "",
    email: usuario.email || "",
    role: usuario.role || "user",
  });
  setErrorModal(null);
  setModalEditar(usuario);
};

const guardarUsuario = async () => {
  // Limpiar error previo
  setErrorModal(null);

  // Validaciones básicas (ahora dentro del modal)
  if (!datosEditar.name || datosEditar.name.trim().length < 3) {
    setErrorModal("El nombre debe tener al menos 3 caracteres");
    return;
  }
  
  if (!datosEditar.email || !datosEditar.email.includes("@")) {
    setErrorModal("Email inválido");
    return;
  }

  // Validación adicional de email con regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(datosEditar.email)) {
    setErrorModal("El formato del email no es válido (ej: nombre@dominio.com)");
    return;
  }

    try {
      setGuardando(true);

      // axios: token, refresh y errores automáticos
      await api.put(`/users/${modalEditar.id}`, datosEditar);

      // Éxito: cerrar modal y mostrar mensaje en la página
      mostrarMensaje("exito", "Usuario actualizado correctamente");
      setModalEditar(null);
      cargarUsuarios();
    } catch (error) {
      console.error("Error:", error);
      // Axios pone el error del servidor en error.response.data
      setErrorModal(
        error.response?.data?.message || "Error al actualizar usuario"
      );
    } finally {
      setGuardando(false);
    }
  };

  // Cambiar rol del usuario
    const cambiarRol = async (usuario) => {
      const nuevoRol = usuario.role === "admin" ? "user" : "admin";

      try {
        // axios con auto-refresh
        await api.put(`/users/${usuario.id}`, { role: nuevoRol });
        mostrarMensaje("exito", `Rol cambiado a ${nuevoRol}`);
        cargarUsuarios();
      } catch (error) {
        mostrarMensaje(
          "error",
          error.response?.data?.message || "Error al cambiar el rol"
        );
      }
  };

  // Eliminar usuario
    const eliminarUsuario = async () => {
      if (!modalEliminar) return;

      try {
        // axios con auto-refresh
        await api.delete(`/users/${modalEliminar.id}`);
        mostrarMensaje("exito", "Usuario eliminado correctamente");
        cargarUsuarios();
      } catch (error) {
        mostrarMensaje(
          "error",
          error.response?.data?.message || "Error al eliminar usuario"
        );
      } finally {
        setModalEliminar(null);
      }
  };

 // Filtrar usuarios
    const usuariosFiltrados = usuarios
    .filter((u) => {
        const coincideBusqueda = 
        u.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email?.toLowerCase().includes(busqueda.toLowerCase());
        
        const coincideRol = filtroRol === "todos" || u.role === filtroRol;
        
        return coincideBusqueda && coincideRol;
    })
    .sort((a, b) => {
        // Ordenar según la opción elegida
        if (ordenamiento === "recientes") {
        return b.id - a.id; // ID descendente (más nuevos primero)
        } else if (ordenamiento === "antiguos") {
        return a.id - b.id; // ID ascendente (más viejos primero)
        } else if (ordenamiento === "nombre") {
        return a.name?.localeCompare(b.name); // Alfabético por nombre
        }
        return 0;
    });

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users size={32} className="text-yellow-400" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-400">
            Total: {usuarios.length} usuarios registrados
          </p>
        </div>
      </div>

      {/* MENSAJE DE NOTIFICACIÓN */}
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

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          {/* Filtro por rol */}
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500/50"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Solo Administradores</option>
            <option value="user">Solo Usuarios</option>
          </select>

          {/* NUEVO: Ordenamiento */}
        <select
            value={ordenamiento}
            onChange={(e) => setOrdenamiento(e.target.value)}
            className="bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500/50"
        >
            <option value="recientes">Más recientes</option>
            <option value="antiguos">Más antiguos</option>
            <option value="nombre">Por nombre (A-Z)</option>
        </select>

        </div>
      </div>

      {/* TABLA / TARJETAS */}
      <div className="bg-black/30 border border-yellow-500/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            Cargando usuarios...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            No se encontraron usuarios
          </div>
        ) : (
          <>
            {/* VISTA DESKTOP (tabla) - oculta en móvil */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/40 border-b border-yellow-500/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-yellow-400">Rol</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-yellow-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr 
                      key={usuario.id} 
                      className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-300">#{usuario.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold">
                            {usuario.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="font-medium">{usuario.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{usuario.email}</td>
                      <td className="px-6 py-4">
                        {usuario.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
                            <Shield size={14} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs font-semibold">
                            <UserPlus size={14} />
                            Usuario
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirEdicion(usuario)}
                            className="p-2 hover:bg-yellow-500/20 rounded-lg text-yellow-400 transition-colors"
                            title="Editar usuario"
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            onClick={() => cambiarRol(usuario)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                            title={usuario.role === "admin" ? "Quitar admin" : "Hacer admin"}
                          >
                            {usuario.role === "admin" ? <ShieldOff size={18} /> : <Shield size={18} />}
                          </button>
                          
                          <button
                            onClick={() => setModalEliminar(usuario)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                            title="Eliminar usuario"
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
              {usuariosFiltrados.map((usuario) => (
                <div 
                  key={usuario.id}
                  className="p-4 hover:bg-white/5 transition-colors"
                >
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-lg flex-shrink-0">
                        {usuario.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{usuario.name}</p>
                        <p className="text-xs text-gray-400 truncate">{usuario.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">#{usuario.id}</span>
                  </div>

                  {/* Rol */}
                  <div className="mb-3">
                    {usuario.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
                        <Shield size={14} />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs font-semibold">
                        <UserPlus size={14} />
                        Usuario
                      </span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => abrirEdicion(usuario)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg text-yellow-400 transition-colors text-sm font-semibold"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>

                    <button
                      onClick={() => cambiarRol(usuario)}
                      className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                      title={usuario.role === "admin" ? "Quitar admin" : "Hacer admin"}
                    >
                      {usuario.role === "admin" ? <ShieldOff size={18} /> : <Shield size={18} />}
                    </button>
                    
                    <button
                      onClick={() => setModalEliminar(usuario)}
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

      {/* MODAL DE EDICIÓN */}
      {modalEditar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-500/30 rounded-xl p-6 max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <Edit2 size={24} className="text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold">Editar Usuario</h3>
              </div>
              <button
                onClick={() => setModalEditar(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={datosEditar.name}
                  onChange={(e) => setDatosEditar({ ...datosEditar, name: e.target.value })}
                  placeholder="Nombre del usuario"
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={datosEditar.email}
                  onChange={(e) => setDatosEditar({ ...datosEditar, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                />
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Rol del usuario
                </label>
                <select
                  value={datosEditar.role}
                  onChange={(e) => setDatosEditar({ ...datosEditar, role: e.target.value })}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500/50"
                >
                  <option value="user">Usuario normal</option>
                  <option value="admin">Administrador</option>
                </select>
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
                  <span>Para cambiar la contraseña, el usuario debe hacerlo desde su perfil.</span>
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setModalEditar(null)}
                disabled={guardando}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarUsuario}
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

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/20 p-3 rounded-lg">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold">¿Eliminar usuario?</h3>
            </div>
            
            <p className="text-gray-300 mb-2">
              Estás a punto de eliminar a:
            </p>
            <p className="text-yellow-400 font-semibold mb-4">
              {modalEliminar.name} ({modalEliminar.email})
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
                onClick={eliminarUsuario}
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

export default AdminUsuarios;