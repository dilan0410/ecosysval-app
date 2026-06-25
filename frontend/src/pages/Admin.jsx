import React, { useEffect, useState } from "react";
import { 
  Users, 
  Building2, 
  Briefcase, 
  TrendingUp, 
  Activity,
  ArrowUp,
  ArrowDown,
  Calendar,
  Shield,
  UserCheck
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmpresas: 0,
    totalEmpleos: 0,
    totalAdmins: 0,
    totalUsuariosNormales: 0,
  });
  const [ultimosUsuarios, setUltimosUsuarios] = useState([]);
  const [ultimasEmpresas, setUltimasEmpresas] = useState([]);
  const [datosGraficoUsuarios, setDatosGraficoUsuarios] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Cargar usuarios
      const usersRes = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = await usersRes.json();
      const usuariosArray = Array.isArray(users) ? users : [];
      
      // Cargar empresas
      const empresasRes = await fetch(`${API_URL}/empresas`);
      const empresas = await empresasRes.json();
      const empresasArray = Array.isArray(empresas) ? empresas : [];
      
      // Cargar empleos
      const empleosRes = await fetch(`${API_URL}/empleos`);
      const empleos = await empleosRes.json();
      const empleosArray = Array.isArray(empleos) ? empleos : [];

      // Calcular estadísticas
      const totalAdmins = usuariosArray.filter(u => u.role === 'admin').length;
      const totalUsuariosNormales = usuariosArray.filter(u => u.role === 'user').length;

      setStats({
        totalUsers: usuariosArray.length,
        totalEmpresas: empresasArray.length,
        totalEmpleos: empleosArray.length,
        totalAdmins,
        totalUsuariosNormales,
      });

      // Últimos 5 usuarios (ordenados por ID descendente)
      const ultimos5Users = [...usuariosArray]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);
      setUltimosUsuarios(ultimos5Users);

      // Últimas 5 empresas
      const ultimas5Empresas = [...empresasArray]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);
      setUltimasEmpresas(ultimas5Empresas);

      // Datos para gráfico (simulado por ahora, basado en IDs)
      const graficoData = generarDatosGrafico(usuariosArray, empresasArray);
      setDatosGraficoUsuarios(graficoData);

    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generar datos del gráfico basado en lo que hay
  const generarDatosGrafico = (usuarios, empresas) => {
    // Por ahora simulamos los últimos 7 días
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return dias.map((dia, index) => ({
      dia,
      usuarios: Math.max(0, Math.floor(Math.random() * usuarios.length) + index),
      empresas: Math.max(0, Math.floor(Math.random() * empresas.length) + index),
    }));
  };

  // Datos para gráfico de pastel (roles)
  const datosPastel = [
    { name: 'Administradores', value: stats.totalAdmins, color: '#fbbf24' },
    { name: 'Usuarios', value: stats.totalUsuariosNormales, color: '#3b82f6' },
  ];

  // Datos para gráfico de barras (comparativa)
  const datosBarras = [
    { categoria: 'Usuarios', cantidad: stats.totalUsers, color: '#3b82f6' },
    { categoria: 'Empresas', cantidad: stats.totalEmpresas, color: '#10b981' },
    { categoria: 'Empleos', cantidad: stats.totalEmpleos, color: '#a855f7' },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-400">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          ¡Bienvenido, {user?.name}!
        </h1>
        <p className="text-gray-400">
          Aquí tienes un resumen completo de la plataforma
        </p>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Usuarios */}
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Users size={24} className="text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
              <ArrowUp size={14} />
              <span>+12%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalUsers}</h3>
          <p className="text-gray-400 text-sm">Usuarios totales</p>
          <div className="mt-3 pt-3 border-t border-blue-500/20">
            <p className="text-xs text-gray-500">
              <span className="text-yellow-400 font-semibold">{stats.totalAdmins}</span> admins · 
              <span className="text-blue-400 font-semibold ml-1">{stats.totalUsuariosNormales}</span> usuarios
            </p>
          </div>
        </div>

        {/* Empresas */}
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Building2 size={24} className="text-green-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
              <ArrowUp size={14} />
              <span>+8%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalEmpresas}</h3>
          <p className="text-gray-400 text-sm">Empresas registradas</p>
          <div className="mt-3 pt-3 border-t border-green-500/20">
            <p className="text-xs text-gray-500">
              Crecimiento sostenido
            </p>
          </div>
        </div>

        {/* Empleos */}
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Briefcase size={24} className="text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs font-semibold">
              <span>—</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalEmpleos}</h3>
          <p className="text-gray-400 text-sm">Empleos publicados</p>
          <div className="mt-3 pt-3 border-t border-purple-500/20">
            <p className="text-xs text-gray-500">
              Próximamente disponible
            </p>
          </div>
        </div>

        {/* Actividad total */}
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-800/20 border border-yellow-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Activity size={24} className="text-yellow-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
              <ArrowUp size={14} />
              <span>+15%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {stats.totalUsers + stats.totalEmpresas + stats.totalEmpleos}
          </h3>
          <p className="text-gray-400 text-sm">Total de registros</p>
          <div className="mt-3 pt-3 border-t border-yellow-500/20">
            <p className="text-xs text-gray-500">
              Plataforma activa
            </p>
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico de líneas - Crecimiento */}
        <div className="lg:col-span-2 bg-black/30 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-yellow-400" />
                Actividad de la semana
              </h3>
              <p className="text-xs text-gray-400">Últimos 7 días</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={datosGraficoUsuarios}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="dia" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #fbbf24',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="usuarios" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Usuarios"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="empresas" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Empresas"
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de pastel - Roles */}
        <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Shield size={20} className="text-yellow-400" />
              Usuarios por rol
            </h3>
            <p className="text-xs text-gray-400">Distribución actual</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={datosPastel}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {datosPastel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #fbbf24',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRÁFICO DE BARRAS - Comparativa */}
      <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6 mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Activity size={20} className="text-yellow-400" />
            Comparativa general
          </h3>
          <p className="text-xs text-gray-400">Registros por categoría</p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={datosBarras}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="categoria" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #fbbf24',
                borderRadius: '8px'
              }} 
            />
            <Bar 
            dataKey="cantidad" 
            fill="#fbbf24" 
            radius={[8, 8, 0, 0]}
            activeBar={{ fill: '#fbbf24', stroke: '#fbbf24' }}
          />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LISTAS DE ÚLTIMOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos usuarios */}
        <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <UserCheck size={20} className="text-yellow-400" />
              Últimos usuarios
            </h3>
            <span className="text-xs text-gray-400">
              {ultimosUsuarios.length} mostrados
            </span>
          </div>
          
          {ultimosUsuarios.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay usuarios</p>
          ) : (
            <div className="space-y-3">
              {ultimosUsuarios.map((usuario) => (
                <div 
                  key={usuario.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold">
                    {usuario.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{usuario.name}</p>
                    <p className="text-xs text-gray-400 truncate">{usuario.email}</p>
                  </div>
                  {usuario.role === 'admin' ? (
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full font-semibold">
                      Admin
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full font-semibold">
                      User
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas empresas */}
        <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Building2 size={20} className="text-yellow-400" />
              Últimas empresas
            </h3>
            <span className="text-xs text-gray-400">
              {ultimasEmpresas.length} mostradas
            </span>
          </div>
          
          {ultimasEmpresas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay empresas</p>
          ) : (
            <div className="space-y-3">
              {ultimasEmpresas.map((empresa) => (
                <div 
                  key={empresa.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-yellow-400 font-bold">
                    {empresa.razonSocial?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{empresa.razonSocial}</p>
                    <p className="text-xs text-gray-400 truncate">{empresa.ubicacion}</p>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Users size={12} />
                    {empresa.empleados}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;