import React, { useEffect, useState } from "react";
import { Users, Building2, Briefcase, TrendingUp, UserPlus, Activity } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function Admin() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmpresas: 0,
    totalEmpleos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const usersRes = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = await usersRes.json();
      
      const empresasRes = await fetch(`${API_URL}/empresas`);
      const empresas = await empresasRes.json();
      
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

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          ¡Bienvenido, {user?.name}!
        </h1>
        <p className="text-gray-400">
          Aquí tienes un resumen general de la plataforma
        </p>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Usuarios */}
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Users size={28} className="text-blue-400" />
            </div>
            <TrendingUp size={20} className="text-green-400" />
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {loading ? "..." : stats.totalUsers}
          </h3>
          <p className="text-gray-400 text-sm">Usuarios totales</p>
        </div>

        {/* Empresas */}
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Building2 size={28} className="text-green-400" />
            </div>
            <TrendingUp size={20} className="text-green-400" />
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {loading ? "..." : stats.totalEmpresas}
          </h3>
          <p className="text-gray-400 text-sm">Empresas registradas</p>
        </div>

        {/* Empleos */}
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Briefcase size={28} className="text-purple-400" />
            </div>
            <TrendingUp size={20} className="text-green-400" />
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {loading ? "..." : stats.totalEmpleos}
          </h3>
          <p className="text-gray-400 text-sm">Empleos publicados</p>
        </div>

        {/* Actividad */}
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Activity size={28} className="text-yellow-400" />
            </div>
            <TrendingUp size={20} className="text-green-400" />
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {loading ? "..." : stats.totalUsers + stats.totalEmpresas + stats.totalEmpleos}
          </h3>
          <p className="text-gray-400 text-sm">Total de registros</p>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <UserPlus size={24} className="text-yellow-400" />
          Resumen de la plataforma
        </h2>
        <p className="text-gray-400 mb-4">
          Usa el menú lateral para acceder a las diferentes secciones del panel.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-yellow-400">Estadísticas en vivo</h3>
            <p className="text-sm text-gray-400">
              Las estadísticas se actualizan en tiempo real desde la base de datos.
            </p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-yellow-400">Acceso seguro</h3>
            <p className="text-sm text-gray-400">
              Solo administradores pueden acceder a este panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;