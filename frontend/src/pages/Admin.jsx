import React, { useEffect, useState } from "react";
import { 
  Users, 
  Building2, 
  Briefcase, 
  TrendingUp, 
  Activity,
  ArrowUp,
  Shield,
  UserCheck,
  Mail,
  MapPin,
  Package,
  Globe,
  Download
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

// PDF Generator
import { generarReportePDF } from "../utils/generarReportePDF";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para datos REALES del backend
  const [overview, setOverview] = useState(null);
  const [usuariosPorMes, setUsuariosPorMes] = useState(null);
  const [empresasStats, setEmpresasStats] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      // Peticiones EN PARALELO a los nuevos endpoints reales
      const [overviewRes, usuariosRes, empresasRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/stats/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/stats/empresas`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Verificar respuestas
      if (!overviewRes.ok || !usuariosRes.ok || !empresasRes.ok) {
        throw new Error("Error al cargar estadísticas");
      }

      // Convertir a JSON en paralelo
      const [overviewData, usuariosData, empresasData] = await Promise.all([
        overviewRes.json(),
        usuariosRes.json(),
        empresasRes.json(),
      ]);

      setOverview(overviewData);
      setUsuariosPorMes(usuariosData);
      setEmpresasStats(empresasData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para gráfico de líneas (usuarios por mes)
  const datosGraficoUsuarios = usuariosPorMes
    ? usuariosPorMes.labels.map((label, index) => ({
        mes: label,
        usuarios: usuariosPorMes.data[index],
      }))
    : [];

  // Preparar datos para gráfico de barras (empresas por estado - top 8)
  const datosEmpresasPorEstado = empresasStats?.porEstado
    ? empresasStats.porEstado.labels.slice(0, 8).map((label, index) => ({
        estado: label,
        cantidad: empresasStats.porEstado.data[index],
      }))
    : [];

  // Preparar datos para gráfico circular (distribución de paquetes)
  const datosPaquetes = empresasStats?.porPaquete
    ? empresasStats.porPaquete.labels.map((label, index) => ({
        name: label.charAt(0).toUpperCase() + label.slice(1), // Capitalizar
        value: empresasStats.porPaquete.data[index],
      }))
    : [];

  // Colores para el gráfico circular
  const COLORES_PAQUETES = ["#3b82f6", "#10b981", "#fbbf24", "#a855f7", "#ec4899"];

  // Datos para gráfico de roles
  const datosRoles = overview
    ? [
        { name: "Administradores", value: overview.totalAdmins, color: "#fbbf24" },
        { name: "Usuarios", value: overview.totalUsuarios - overview.totalAdmins, color: "#3b82f6" },
      ]
    : [];

  // Datos para gráfico de verificación de emails
  const datosVerificacion = overview
    ? [
        { name: "Verificados", value: overview.usuariosVerificados, color: "#10b981" },
        { name: "Pendientes", value: overview.usuariosPendientes, color: "#ef4444" },
      ]
    : [];

  // Datos para gráfico de barras (comparativa general)
  const datosBarras = overview
    ? [
        { categoria: "Usuarios", cantidad: overview.totalUsuarios },
        { categoria: "Empresas", cantidad: overview.totalEmpresas },
        { categoria: "Empleos", cantidad: overview.totalEmpleos },
      ]
    : [];

  // ==========================================
  // ESTADOS DE CARGA Y ERROR
  // ==========================================
  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-400">
          <Activity className="animate-pulse mx-auto mb-3" size={48} />
          Cargando dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-6 text-center">
          <p className="text-red-300 mb-2 font-semibold">Error al cargar datos</p>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <button
            onClick={cargarDatos}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

   // Función para descargar PDF
  const handleDescargarPDF = () => {
    try {
      generarReportePDF(overview, usuariosPorMes, empresasStats, user);
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("Error al generar el PDF. Intenta de nuevo.");
    }
  };

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          ¡Bienvenido, {user?.name}!
        </h1>
        <p className="text-gray-400">
          Sistema de Inteligencia Económica · Datos actualizados en tiempo real
        </p>
      </div>

      <button
          onClick={handleDescargarPDF}
          disabled={!overview || !usuariosPorMes || !empresasStats}
          className="inline-flex mb-10 items-center gap-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          title="Descargar reporte ejecutivo en PDF"
        >
          <Download size={20} />
          Descargar PDF
        </button>

      {/* TARJETAS DE ESTADÍSTICAS PRINCIPALES (4 KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Usuarios */}
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Users size={24} className="text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
              <ArrowUp size={14} />
              <span>+{overview?.usuariosNuevosEsteMes || 0}</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{overview?.totalUsuarios || 0}</h3>
          <p className="text-gray-400 text-sm">Usuarios totales</p>
          <div className="mt-3 pt-3 border-t border-blue-500/20">
            <p className="text-xs text-gray-500">
              <span className="text-yellow-400 font-semibold">{overview?.totalAdmins || 0}</span> admins · 
              <span className="text-blue-400 font-semibold ml-1">{(overview?.totalUsuarios || 0) - (overview?.totalAdmins || 0)}</span> usuarios
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
              <span>+{overview?.empresasNuevasEsteMes || 0}</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{overview?.totalEmpresas || 0}</h3>
          <p className="text-gray-400 text-sm">Empresas registradas</p>
          <div className="mt-3 pt-3 border-t border-green-500/20">
            <p className="text-xs text-gray-500">
              Nuevas este mes
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
              <span>{overview?.empleosActivos || 0} activos</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{overview?.totalEmpleos || 0}</h3>
          <p className="text-gray-400 text-sm">Empleos publicados</p>
          <div className="mt-3 pt-3 border-t border-purple-500/20">
            <p className="text-xs text-gray-500">
              <span className="text-green-400">{overview?.empleosActivos || 0}</span> activos ·
              <span className="text-gray-400 ml-1">{overview?.empleosCerrados || 0}</span> cerrados
            </p>
          </div>
        </div>

        {/* Verificación de Emails */}
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-800/20 border border-yellow-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Mail size={24} className="text-yellow-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
              <span>{overview?.tasaVerificacion || 0}%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {overview?.usuariosVerificados || 0}
          </h3>
          <p className="text-gray-400 text-sm">Emails verificados</p>
          <div className="mt-3 pt-3 border-t border-yellow-500/20">
            <p className="text-xs text-gray-500">
              <span className="text-red-400">{overview?.usuariosPendientes || 0}</span> pendientes
            </p>
          </div>
        </div>
      </div>

      {/* GRÁFICOS PRINCIPALES: TENDENCIAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico de líneas - Usuarios por mes (REAL) */}
        <div className="lg:col-span-2 bg-black/30 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-yellow-400" />
                Tendencia de usuarios registrados
              </h3>
              <p className="text-xs text-gray-400">
                Últimos {usuariosPorMes?.periodo || "6 meses"} · Promedio: {usuariosPorMes?.promedio || 0}/mes
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={datosGraficoUsuarios}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="mes" stroke="#9ca3af" />
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
                strokeWidth={3}
                name="Usuarios nuevos"
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de pastel - Roles */}
        <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Shield size={20} className="text-yellow-400" />
              Distribución de roles
            </h3>
            <p className="text-xs text-gray-400">Usuarios del sistema</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={datosRoles}
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${value}`}
              >
                {datosRoles.map((entry, index) => (
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
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRÁFICOS SECUNDARIOS: EMPRESAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico de barras - Empresas por estado */}
        <div className="lg:col-span-2 bg-black/30 border border-yellow-500/20 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MapPin size={20} className="text-yellow-400" />
              Empresas por estado
            </h3>
            <p className="text-xs text-gray-400">
              Top 8 estados con más empresas registradas
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={datosEmpresasPorEstado} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis 
                dataKey="estado" 
                type="category" 
                stroke="#9ca3af"
                width={110}
                style={{ fontSize: "11px" }}
              />
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
                radius={[0, 8, 8, 0]}
                name="Empresas"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de pastel - Paquetes */}
        <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Package size={20} className="text-yellow-400" />
              Paquetes comerciales
            </h3>
            <p className="text-xs text-gray-400">Distribución actual</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={datosPaquetes}
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {datosPaquetes.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORES_PAQUETES[index % COLORES_PAQUETES.length]} 
                  />
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

      {/* GRÁFICO DE BARRAS - Comparativa general */}
      <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6 mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Activity size={20} className="text-yellow-400" />
            Comparativa general
          </h3>
          <p className="text-xs text-gray-400">Registros totales por categoría</p>
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
              activeBar={{ fill: '#f59e0b', stroke: '#fbbf24' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* INDICADORES DE PERFIL COMPLETO */}
      {empresasStats?.indicadores && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Perfil completo */}
          <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-emerald-500/20 p-3 rounded-lg">
                <UserCheck size={24} className="text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-emerald-400">
                {empresasStats.porcentajes.tasaPerfilCompleto}%
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">
              {empresasStats.indicadores.conLogo}
            </h3>
            <p className="text-gray-400 text-sm">Perfiles con logo</p>
          </div>

          {/* Con sucursales */}
          <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Building2 size={24} className="text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-blue-400">
                {empresasStats.porcentajes.tasaSucursales}%
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">
              {empresasStats.indicadores.conSucursales}
            </h3>
            <p className="text-gray-400 text-sm">Con sucursales</p>
          </div>

          {/* Internacionales */}
          <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Globe size={24} className="text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-purple-400">
                {empresasStats.porcentajes.tasaInternacional}%
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">
              {empresasStats.indicadores.conOperacionesInt}
            </h3>
            <p className="text-gray-400 text-sm">Con operaciones internacionales</p>
          </div>
        </div>
      )}

      {/* METADATA / FOOTER */}
      <div className="text-center text-xs text-gray-500 mt-8">
        <p>
          Última actualización: {overview?.calculadoEn ? new Date(overview.calculadoEn).toLocaleString("es-MX") : "—"}
        </p>
        <button
          onClick={cargarDatos}
          className="mt-2 text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          Actualizar datos
        </button>
      </div>
    </div>
  );
}

export default Admin;