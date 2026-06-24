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

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [ordenamiento, setOrdenamiento] = useState("recientes"); // recientes | antiguos | nombre
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // Cargar usuarios al iniciar
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Función para cargar usuarios
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsuarios(Array.isArray(data) ? data : []);
      } else {
        mostrarMensaje("error", "Error al cargar usuarios");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("error", "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar mensaje temporal
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  // Cambiar rol del usuario
  const cambiarRol = async (usuario) => {
    const nuevoRol = usuario.role === "admin" ? "user" : "admin";
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/${usuario.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ role: nuevoRol }),
      });
      
      if (res.ok) {
        mostrarMensaje("exito", `Rol cambiado a ${nuevoRol}`);
        cargarUsuarios();
      } else {
        mostrarMensaje("error", "Error al cambiar el rol");
      }
    } catch (error) {
      mostrarMensaje("error", "Error de conexión");
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async () => {
    if (!modalEliminar) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/${modalEliminar.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        mostrarMensaje("exito", "Usuario eliminado correctamente");
        cargarUsuarios();
      } else {
        mostrarMensaje("error", "Error al eliminar usuario");
      }
    } catch (error) {
      mostrarMensaje("error", "Error de conexión");
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
    <div className="p-8">
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

      {/* TABLA DE USUARIOS */}
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
          <div className="overflow-x-auto">
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
                        {/* Cambiar rol */}
                        <button
                          onClick={() => cambiarRol(usuario)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                          title={usuario.role === "admin" ? "Quitar admin" : "Hacer admin"}
                        >
                          {usuario.role === "admin" ? <ShieldOff size={18} /> : <Shield size={18} />}
                        </button>
                        
                        {/* Eliminar */}
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
        )}
      </div>

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