// frontend/src/pages/AdminReportes.jsx
import React, { useEffect, useState } from "react";
import { api } from "../api/axiosClient";
import {
  Download,
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Loader2,
  RefreshCw,
  Globe,
  MapPin,
  Package
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

// Colores idénticos al Admin.jsx
const COLORES_PAQUETES = ["#3b82f6", "#10b981", "#fbbf24", "#a855f7", "#ec4899"];

export default function AdminReportes() {
  const [overview, setOverview] = useState(null);
  const [usuariosStats, setUsuariosStats] = useState(null);
  const [empresasStats, setEmpresasStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [ovRes, userRes, empRes] = await Promise.all([
        api.get("/admin/stats/overview"),
        api.get("/admin/stats/usuarios"),
        api.get("/admin/stats/empresas"),
      ]);

      setOverview(ovRes.data || null);
      setUsuariosStats(userRes.data || null);
      setEmpresasStats(empRes.data || null);
    } catch (error) {
      console.error("Error cargando estadísticas del admin:", error);
      toast.error("Error al obtener estadísticas del servidor");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // GENERAR Y DESCARGAR PDF EJECUTIVO
  // ==========================================
  function exportarReportePDF() {
    if (!overview || !empresasStats) {
      toast.error("No hay datos suficientes para generar el PDF");
      return;
    }

    setGenerandoPdf(true);
    try {
      const doc = new jsPDF();
      const fecha = new Date().toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      doc.setFillColor(7, 19, 38);
      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor(255, 209, 102);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("ECOSYSVAL — REPORTE EJECUTIVO", 14, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Sistema de Inteligencia Económica | Generado: ${fecha}`, 14, 27);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("1. Resumen General de Métricas (KPIs)", 14, 47);

      autoTable(doc, {
        startY: 52,
        head: [["Métrica", "Valor Actual", "Estado / Indicador"]],
        body: [
          ["Total de Usuarios Registrados", overview.totalUsuarios || 0, "Activos en plataforma"],
          ["Total de Empresas Registradas", overview.totalEmpresas || 0, "Socios de cadena de valor"],
          ["Ofertas de Empleo / Productos", overview.totalEmpleos || 0, "Publicaciones vigentes"],
          ["Tasa de Verificación de Emails", `${overview.tasaVerificacion || 0}%`, `${overview.usuariosVerificados || 0} verificados`],
          ["Nuevas Empresas (Este mes)", overview.empresasNuevasEsteMes || 0, "Crecimiento reciente"],
          ["Empresas con Operaciones Int.", empresasStats.indicadores?.conOperacionesInt || 0, `${empresasStats.porcentajes?.tasaInternacional || 0}% del total`],
        ],
        theme: "striped",
        headStyles: { fillColor: [7, 26, 51], textColor: [255, 209, 102] },
      });

      const finalY1 = doc.lastAutoTable.finalY + 12;
      doc.text("2. Distribución de Empresas por Paquete", 14, finalY1);

      const paquetesData = (empresasStats.porPaquete?.labels || []).map((label, i) => [
        label.toUpperCase(),
        empresasStats.porPaquete?.data[i] || 0,
        `${Math.round(((empresasStats.porPaquete?.data[i] || 0) / (empresasStats.total || 1)) * 100)}%`,
      ]);

      autoTable(doc, {
        startY: finalY1 + 5,
        head: [["Paquete / Tier", "Cantidad de Empresas", "Porcentaje"]],
        body: paquetesData.length ? paquetesData : [["Sin datos", 0, "0%"]],
        theme: "grid",
        headStyles: { fillColor: [17, 138, 178], textColor: [255, 255, 255] },
      });

      doc.save(`Reporte_Ejecutivo_Ecosysval_${Date.now()}.pdf`);
      toast.success("Reporte PDF descargado con éxito");
    } catch (err) {
      console.error("Error generando PDF:", err);
      toast.error("No se pudo generar el documento PDF");
    } finally {
      setGenerandoPdf(false);
    }
  }

  // Preparar datos para gráficos
  const usuariosChartData = (usuariosStats?.labels || []).map((label, idx) => ({
    mes: label,
    usuarios: usuariosStats?.data[idx] || 0,
  }));

  const empresasEstadoData = (empresasStats?.porEstado?.labels || []).slice(0, 8).map((label, idx) => ({
    estado: label,
    cantidad: empresasStats?.porEstado?.data[idx] || 0,
  }));

  const empresasPaqueteData = (empresasStats?.porPaquete?.labels || []).map((label, idx) => ({
    name: label.charAt(0).toUpperCase() + label.slice(1),
    value: empresasStats?.porPaquete?.data[idx] || 0,
  }));

  if (loading) {
    return (
      <div className="p-4 lg:p-8 pt-20 lg:pt-8 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mb-3" />
        <p className="text-gray-400 text-sm font-semibold">Cargando inteligencia de datos...</p>
      </div>
    );
  }

  return (
    // EL MISMO WRAPPER DEL ADMIN.JSX
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      
      {/* HEADER REPORTES */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="text-yellow-400" />
            Reportes y Analytics
          </h1>
          <p className="text-gray-400">
            Análisis consolidado de crecimiento y métricas del Ecosistema
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cargarDatos}
            className="p-3 bg-black/30 border border-yellow-500/20 rounded-xl hover:bg-white/5 transition text-gray-300"
            title="Refrescar datos"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={exportarReportePDF}
            disabled={generandoPdf}
            className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-lg"
          >
            {generandoPdf ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Exportar a PDF
          </button>
        </div>
      </div>

      {/* METRICAS DE RESUMEN (CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-800/20 border border-yellow-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Users size={24} className="text-yellow-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{overview?.totalUsuarios || 0}</h3>
          <p className="text-gray-400 text-sm">Usuarios en plataforma</p>
          <div className="mt-3 pt-3 border-t border-yellow-500/20">
            <p className="text-xs text-gray-500">
              {overview?.tasaVerificacion || 0}% de correos verificados
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Building2 size={24} className="text-green-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{overview?.totalEmpresas || 0}</h3>
          <p className="text-gray-400 text-sm">Empresas B2B</p>
          <div className="mt-3 pt-3 border-t border-green-500/20">
            <p className="text-xs text-gray-500">
              +{overview?.empresasNuevasEsteMes || 0} registradas este mes
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Briefcase size={24} className="text-blue-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{overview?.totalEmpleos || 0}</h3>
          <p className="text-gray-400 text-sm">Publicaciones / Ofertas</p>
          <div className="mt-3 pt-3 border-t border-blue-500/20">
            <p className="text-xs text-gray-500">
              {overview?.empleosActivos || 0} publicaciones activas
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Globe size={24} className="text-purple-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{empresasStats?.porcentajes?.tasaInternacional || 0}%</h3>
          <p className="text-gray-400 text-sm">Tasa Internacional</p>
          <div className="mt-3 pt-3 border-t border-purple-500/20">
            <p className="text-xs text-gray-500">
              Operan en el extranjero (Imp/Exp)
            </p>
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* GRÁFICO 1: TENDENCIA DE REGISTROS (Mismo diseño que el Dashboard) */}
        <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-yellow-400" />
                Tendencia de Registros
              </h3>
              <p className="text-xs text-gray-400 mt-1">Crecimiento de los últimos 6 meses</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={usuariosChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="mes" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #fbbf24",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="usuarios"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Usuarios"
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* GRÁFICO 2: DISTRIBUCIÓN POR PAQUETE */}
        <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Package size={20} className="text-yellow-400" />
              Empresas por Paquete
            </h3>
            <p className="text-xs text-gray-400 mt-1">Suscripciones comerciales (Tier)</p>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            {empresasPaqueteData.length > 0 ? (
              <PieChart>
                <Pie
                  data={empresasPaqueteData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {empresasPaqueteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES_PAQUETES[index % COLORES_PAQUETES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #fbbf24",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Sin datos de paquetes</p>
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRÁFICO 3: EMPRESAS POR ESTADO (Barras Verticales) */}
      <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6 mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MapPin size={20} className="text-yellow-400" />
            Top Estados con más Empresas
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Distribución geográfica de las empresas registradas
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={empresasEstadoData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis
              dataKey="estado"
              type="category"
              stroke="#9ca3af"
              width={120}
              style={{ fontSize: "11px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #fbbf24",
                borderRadius: "8px",
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

    </div>
  );
}