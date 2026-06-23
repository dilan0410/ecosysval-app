import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, Building2, Briefcase, BarChart3 } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmpresas: 0,
    totalEmpleos: 0,
  });
  const [loading, setLoading] = useState(true);

  // Cargar datos del usuario y estadísticas al iniciar
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    
    fetchStats();
  }, []);

  // Función para obtener estadísticas
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Obtener usuarios (ruta protegida solo admin)
      const usersRes = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = await usersRes.json();
      
      // Obtener empresas
      const empresasRes = await fetch(`${API_URL}/empresas`);
      const empresas = await empresasRes.json();
      
      // Obtener empleos
      const empleosRes = await fetch(`${API_URL}/empleos`);
      const empleos = await empleosRes.json();
      
      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalEmpresas: Array.isArray(empresas) ? empresas.length : 0,
        totalEmpleos: Array.isArray(empleos) ? empleos.length : 0,
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* HEADER */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-yellow-500/30 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img
              src="/ecosysval.png"
              alt="ECOSYSVAL"
              className="h-10 w-auto object-contain"
            />
            <h1 className="text-xl font-bold text-yellow-400">
              Panel de Administración
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-6">
        {/* BIENVENIDA */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            ¡Bienvenido, {user?.name}!
          </h2>
          <p className="text-gray-400">
            Aquí tienes un resumen de la plataforma
          </p>
        </div>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tarjeta usuarios */}
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Users size={28} className="text-blue-400" />
              </div>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              {loading ? "..." : stats.totalUsers}
            </h3>
            <p className="text-gray-400 text-sm">Usuarios registrados</p>
          </div>

          {/* Tarjeta empresas */}
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Building2 size={28} className="text-green-400" />
              </div>
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              {loading ? "..." : stats.totalEmpresas}
            </h3>
            <p className="text-gray-400 text-sm">Empresas registradas</p>
          </div>

          {/* Tarjeta empleos */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Briefcase size={28} className="text-purple-400" />
              </div>
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              {loading ? "..." : stats.totalEmpleos}
            </h3>
            <p className="text-gray-400 text-sm">Empleos publicados</p>
          </div>
        </div>

        {/* SECCIONES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => alert("Próximamente: Gestión de usuarios")}
            className="bg-black/30 hover:bg-black/50 border border-yellow-500/30 rounded-xl p-6 text-left transition-all hover:border-yellow-500/60"
          >
            <Users size={32} className="text-yellow-400 mb-3" />
            <h3 className="text-xl font-bold mb-2">Gestión de Usuarios</h3>
            <p className="text-gray-400 text-sm">
              Ver, editar y eliminar usuarios registrados
            </p>
          </button>

          <button
            onClick={() => alert("Próximamente: Gestión de empresas")}
            className="bg-black/30 hover:bg-black/50 border border-yellow-500/30 rounded-xl p-6 text-left transition-all hover:border-yellow-500/60"
          >
            <Building2 size={32} className="text-yellow-400 mb-3" />
            <h3 className="text-xl font-bold mb-2">Gestión de Empresas</h3>
            <p className="text-gray-400 text-sm">
              Aprobar, editar y eliminar empresas
            </p>
          </button>

          <button
            onClick={() => alert("Próximamente: Gestión de empleos")}
            className="bg-black/30 hover:bg-black/50 border border-yellow-500/30 rounded-xl p-6 text-left transition-all hover:border-yellow-500/60"
          >
            <Briefcase size={32} className="text-yellow-400 mb-3" />
            <h3 className="text-xl font-bold mb-2">Gestión de Empleos</h3>
            <p className="text-gray-400 text-sm">
              Moderar ofertas de empleo
            </p>
          </button>

          <button
            onClick={() => alert("Próximamente: Reportes")}
            className="bg-black/30 hover:bg-black/50 border border-yellow-500/30 rounded-xl p-6 text-left transition-all hover:border-yellow-500/60"
          >
            <BarChart3 size={32} className="text-yellow-400 mb-3" />
            <h3 className="text-xl font-bold mb-2">Reportes</h3>
            <p className="text-gray-400 text-sm">
              Generar reportes y análisis
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}

export default Admin;