// frontend/src/pages/AdminReportes.jsx
/**
 * REPORTES EJECUTIVOS (distinto del Dashboard /admin)
 * - Tablas detalladas
 * - Filtros por búsqueda y tipo
 * - Exportación PDF y CSV (Excel-compatible)
 */
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/axiosClient";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  Building2,
  Briefcase,
  BarChart3,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Mail,
  MapPin,
  Package,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export default function AdminReportes() {
  const [overview, setOverview] = useState(null);
  const [empresasStats, setEmpresasStats] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  // UI reportes
  const [reporteActivo, setReporteActivo] = useState("usuarios"); // usuarios | empresas | resumen
  const [q, setQ] = useState("");
  const [filtroUsuarios, setFiltroUsuarios] = useState("todos"); // todos | verificados | pendientes | admin
  const [filtroPaquete, setFiltroPaquete] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    setLoading(true);
    try {
      const [ov, empStats, usersRes, empRes] = await Promise.all([
        api.get("/admin/stats/overview"),
        api.get("/admin/stats/empresas"),
        api.get("/users").catch(() => ({ data: [] })),
        api.get("/empresas").catch(() => ({ data: [] })),
      ]);

      setOverview(ov.data || null);
      setEmpresasStats(empStats.data || null);

      // Normalizar listas (por si el backend envuelve en { data: [] })
      const rawUsers = usersRes.data;
      const listaUsers = Array.isArray(rawUsers)
        ? rawUsers
        : Array.isArray(rawUsers?.users)
        ? rawUsers.users
        : Array.isArray(rawUsers?.data)
        ? rawUsers.data
        : [];

      const rawEmp = empRes.data;
      const listaEmp = Array.isArray(rawEmp)
        ? rawEmp
        : Array.isArray(rawEmp?.empresas)
        ? rawEmp.empresas
        : Array.isArray(rawEmp?.data)
        ? rawEmp.data
        : [];

      setUsuarios(listaUsers);
      setEmpresas(listaEmp);
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
    }
  }

  // -------- Filtros usuarios --------
  const usuariosFiltrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (filtroUsuarios === "verificados" && !u.email_verified) return false;
      if (filtroUsuarios === "pendientes" && u.email_verified) return false;
      if (filtroUsuarios === "admin" && u.role !== "admin") return false;

      if (!term) return true;
      return (
        String(u.name || "").toLowerCase().includes(term) ||
        String(u.email || "").toLowerCase().includes(term) ||
        String(u.role || "").toLowerCase().includes(term)
      );
    });
  }, [usuarios, q, filtroUsuarios]);

  // -------- Filtros empresas --------
  const paquetesDisponibles = useMemo(() => {
    const set = new Set(empresas.map((e) => e.paquete || "sin-paquete"));
    return Array.from(set).sort();
  }, [empresas]);

  const estadosDisponibles = useMemo(() => {
    const set = new Set(
      empresas.map((e) => e.estado || e.ubicacion || "Sin especificar")
    );
    return Array.from(set).sort();
  }, [empresas]);

  const empresasFiltradas = useMemo(() => {
    const term = q.trim().toLowerCase();
    return empresas.filter((e) => {
      const paquete = e.paquete || "sin-paquete";
      const estado = e.estado || e.ubicacion || "Sin especificar";

      if (filtroPaquete !== "todos" && paquete !== filtroPaquete) return false;
      if (filtroEstado !== "todos" && estado !== filtroEstado) return false;

      if (!term) return true;
      return (
        String(e.razonSocial || "").toLowerCase().includes(term) ||
        String(e.correo || "").toLowerCase().includes(term) ||
        String(e.rfc || "").toLowerCase().includes(term) ||
        String(e.sectorScian || "").toLowerCase().includes(term) ||
        String(estado).toLowerCase().includes(term)
      );
    });
  }, [empresas, q, filtroPaquete, filtroEstado]);

  // -------- Export CSV (abre en Excel) --------
  function descargarCSV(nombre, headers, rows) {
    const escape = (v) => {
      const s = v == null ? "" : String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines = [
      headers.map(escape).join(","),
      ...rows.map((r) => r.map(escape).join(",")),
    ];
    // BOM para Excel en español
    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nombre}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportarCSVActual() {
    setExportando(true);
    try {
      if (reporteActivo === "usuarios") {
        descargarCSV(
          "reporte_usuarios",
          ["ID", "Nombre", "Email", "Rol", "Email verificado"],
          usuariosFiltrados.map((u) => [
            u.id,
            u.name,
            u.email,
            u.role,
            u.email_verified ? "Sí" : "No",
          ])
        );
      } else if (reporteActivo === "empresas") {
        descargarCSV(
          "reporte_empresas",
          [
            "ID",
            "Razón social",
            "Correo",
            "RFC",
            "Estado",
            "Paquete",
            "SCIAN",
            "Representante",
          ],
          empresasFiltradas.map((e) => [
            e.id,
            e.razonSocial,
            e.correo,
            e.rfc,
            e.estado || e.ubicacion,
            e.paquete,
            e.sectorScian,
            e.representante,
          ])
        );
      } else {
        descargarCSV(
          "reporte_resumen_kpis",
          ["Métrica", "Valor"],
          [
            ["Total usuarios", overview?.totalUsuarios ?? 0],
            ["Usuarios verificados", overview?.usuariosVerificados ?? 0],
            ["Usuarios pendientes", overview?.usuariosPendientes ?? 0],
            ["Tasa verificación %", overview?.tasaVerificacion ?? 0],
            ["Total empresas", overview?.totalEmpresas ?? 0],
            ["Empresas nuevas este mes", overview?.empresasNuevasEsteMes ?? 0],
            ["Total empleos", overview?.totalEmpleos ?? 0],
            ["Empleos activos", overview?.empleosActivos ?? 0],
            [
              "Empresas con logo",
              empresasStats?.indicadores?.conLogo ?? 0,
            ],
            [
              "Tasa internacional %",
              empresasStats?.porcentajes?.tasaInternacional ?? 0,
            ],
          ]
        );
      }
      toast.success("CSV exportado (compatible con Excel)");
    } catch (e) {
      toast.error("Error al exportar CSV");
    } finally {
      setExportando(false);
    }
  }

  // -------- Export PDF del reporte activo --------
  function exportarPDFActual() {
    setExportando(true);
    try {
      const doc = new jsPDF();
      const fecha = new Date().toLocaleString("es-MX");

      doc.setFillColor(7, 19, 38);
      doc.rect(0, 0, 210, 28, "F");
      doc.setTextColor(251, 191, 36);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("ECOSYSVAL — Reportes ejecutivos", 14, 18);
      doc.setTextColor(200);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Generado: ${fecha}`, 14, 24);

      doc.setTextColor(30);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");

      if (reporteActivo === "usuarios") {
        doc.text(`Reporte de usuarios (${usuariosFiltrados.length})`, 14, 38);
        autoTable(doc, {
          startY: 42,
          head: [["ID", "Nombre", "Email", "Rol", "Verificado"]],
          body: usuariosFiltrados.map((u) => [
            u.id,
            u.name || "",
            u.email || "",
            u.role || "",
            u.email_verified ? "Sí" : "No",
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [31, 41, 55], textColor: [251, 191, 36] },
        });
      } else if (reporteActivo === "empresas") {
        doc.text(`Reporte de empresas (${empresasFiltradas.length})`, 14, 38);
        autoTable(doc, {
          startY: 42,
          head: [["ID", "Razón social", "Estado", "Paquete", "SCIAN"]],
          body: empresasFiltradas.map((e) => [
            e.id,
            e.razonSocial || "",
            e.estado || e.ubicacion || "",
            e.paquete || "",
            e.sectorScian || "",
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [31, 41, 55], textColor: [251, 191, 36] },
        });
      } else {
        doc.text("Resumen ejecutivo (KPIs)", 14, 38);
        autoTable(doc, {
          startY: 42,
          head: [["Métrica", "Valor"]],
          body: [
            ["Total usuarios", String(overview?.totalUsuarios ?? 0)],
            ["Verificados", String(overview?.usuariosVerificados ?? 0)],
            ["Pendientes", String(overview?.usuariosPendientes ?? 0)],
            ["Tasa verificación", `${overview?.tasaVerificacion ?? 0}%`],
            ["Total empresas", String(overview?.totalEmpresas ?? 0)],
            ["Nuevas este mes", String(overview?.empresasNuevasEsteMes ?? 0)],
            ["Empleos totales", String(overview?.totalEmpleos ?? 0)],
            ["Empleos activos", String(overview?.empleosActivos ?? 0)],
            [
              "Tasa internacional",
              `${empresasStats?.porcentajes?.tasaInternacional ?? 0}%`,
            ],
          ],
          headStyles: { fillColor: [31, 41, 55], textColor: [251, 191, 36] },
        });
      }

      doc.save(`Ecosysval_Reporte_${reporteActivo}_${Date.now()}.pdf`);
      toast.success("PDF del reporte generado");
    } catch (e) {
      console.error(e);
      toast.error("Error al generar PDF");
    } finally {
      setExportando(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-8 pt-20 lg:pt-8 flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mb-3" />
        <p className="text-gray-400 text-sm">Cargando reportes detallados...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="text-yellow-400" />
            Reportes ejecutivos
          </h1>
          <p className="text-gray-400">
            Tablas filtrables y exportación · Distinto del monitor del Dashboard
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={cargarTodo}
            className="p-3 bg-black/30 border border-yellow-500/20 rounded-xl hover:bg-white/5 transition text-gray-300"
            title="Refrescar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={exportarCSVActual}
            disabled={exportando}
            className="inline-flex items-center gap-2 px-4 py-3 bg-black/30 border border-green-500/30 text-green-300 hover:bg-green-500/10 font-semibold rounded-xl transition disabled:opacity-50"
          >
            <FileSpreadsheet size={18} />
            Excel / CSV
          </button>
          <button
            onClick={exportarPDFActual}
            disabled={exportando}
            className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl transition disabled:opacity-50 shadow-lg"
          >
            {exportando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            PDF del reporte
          </button>
        </div>
      </div>

      {/* SELECTOR DE REPORTE */}
      <div className="flex flex-wrap gap-2 mb-6">
        <TabBtn
          active={reporteActivo === "usuarios"}
          onClick={() => {
            setReporteActivo("usuarios");
            setQ("");
          }}
          icon={Users}
          label="Usuarios"
          count={usuariosFiltrados.length}
        />
        <TabBtn
          active={reporteActivo === "empresas"}
          onClick={() => {
            setReporteActivo("empresas");
            setQ("");
          }}
          icon={Building2}
          label="Empresas"
          count={empresasFiltradas.length}
        />
        <TabBtn
          active={reporteActivo === "resumen"}
          onClick={() => setReporteActivo("resumen")}
          icon={FileText}
          label="Resumen KPIs"
        />
      </div>

      {/* FILTROS */}
      {reporteActivo !== "resumen" && (
        <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-4 mb-6 flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                reporteActivo === "usuarios"
                  ? "Buscar por nombre, email o rol..."
                  : "Buscar por razón social, RFC, correo, SCIAN..."
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-700 text-sm text-white outline-none focus:border-yellow-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-yellow-400" />
            {reporteActivo === "usuarios" ? (
              <select
                value={filtroUsuarios}
                onChange={(e) => setFiltroUsuarios(e.target.value)}
                className="rounded-xl bg-gray-900/60 border border-gray-700 text-sm text-white px-3 py-2.5 outline-none focus:border-yellow-500"
              >
                <option value="todos">Todos los usuarios</option>
                <option value="verificados">Solo verificados</option>
                <option value="pendientes">Solo pendientes</option>
                <option value="admin">Solo admins</option>
              </select>
            ) : (
              <>
                <select
                  value={filtroPaquete}
                  onChange={(e) => setFiltroPaquete(e.target.value)}
                  className="rounded-xl bg-gray-900/60 border border-gray-700 text-sm text-white px-3 py-2.5 outline-none focus:border-yellow-500"
                >
                  <option value="todos">Todos los paquetes</option>
                  {paquetesDisponibles.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="rounded-xl bg-gray-900/60 border border-gray-700 text-sm text-white px-3 py-2.5 outline-none focus:border-yellow-500 max-w-[180px]"
                >
                  <option value="todos">Todos los estados</option>
                  {estadosDisponibles.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONTENIDO */}
      {reporteActivo === "resumen" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MiniKpi
              icon={Users}
              label="Usuarios"
              value={overview?.totalUsuarios ?? 0}
              sub={`${overview?.tasaVerificacion ?? 0}% verificados`}
              color="blue"
            />
            <MiniKpi
              icon={Building2}
              label="Empresas"
              value={overview?.totalEmpresas ?? 0}
              sub={`+${overview?.empresasNuevasEsteMes ?? 0} este mes`}
              color="green"
            />
            <MiniKpi
              icon={Briefcase}
              label="Empleos"
              value={overview?.totalEmpleos ?? 0}
              sub={`${overview?.empleosActivos ?? 0} activos`}
              color="purple"
            />
            <MiniKpi
              icon={Package}
              label="Internacional"
              value={`${empresasStats?.porcentajes?.tasaInternacional ?? 0}%`}
              sub="Empresas con Imp/Exp"
              color="yellow"
            />
          </div>

          <div className="bg-black/30 border border-yellow-500/20 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="text-yellow-400" size={20} />
              Indicadores para exportación
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Este bloque resume KPIs para stakeholders. Usa <strong>PDF</strong> o{" "}
              <strong>CSV</strong> arriba para descargar el resumen. El detalle de
              filas está en las pestañas Usuarios y Empresas.
            </p>
            <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
              <li>
                Verificados: {overview?.usuariosVerificados ?? 0} · Pendientes:{" "}
                {overview?.usuariosPendientes ?? 0}
              </li>
              <li>
                Empresas con logo: {empresasStats?.indicadores?.conLogo ?? 0}
              </li>
              <li>
                Con sucursales: {empresasStats?.indicadores?.conSucursales ?? 0}
              </li>
              <li>
                Filas cargadas en reportes: {usuarios.length} usuarios ·{" "}
                {empresas.length} empresas
              </li>
            </ul>
          </div>
        </div>
      )}

      {reporteActivo === "usuarios" && (
        <div className="bg-black/30 border border-yellow-500/20 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-yellow-500/20 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Mail size={18} className="text-yellow-400" />
              Listado de usuarios
            </h3>
            <span className="text-xs text-gray-400">
              {usuariosFiltrados.length} de {usuarios.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700 bg-black/40">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Rol</th>
                  <th className="px-4 py-3 font-semibold">Verificado</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                      No hay usuarios con esos filtros.
                      {!usuarios.length && (
                        <span className="block mt-1 text-xs">
                          Si la lista está vacía, el endpoint GET /users puede no
                          estar expuesto al admin.
                        </span>
                      )}
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-gray-800 hover:bg-white/5 transition"
                    >
                      <td className="px-4 py-3 text-gray-400">{u.id}</td>
                      <td className="px-4 py-3 font-medium text-white">
                        {u.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{u.email || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            u.role === "admin"
                              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                              : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          }`}
                        >
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.email_verified ? (
                          <span className="text-green-400 text-xs font-semibold">
                            Sí
                          </span>
                        ) : (
                          <span className="text-red-400 text-xs font-semibold">
                            No
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reporteActivo === "empresas" && (
        <div className="bg-black/30 border border-yellow-500/20 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-yellow-500/20 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <MapPin size={18} className="text-yellow-400" />
              Listado de empresas
            </h3>
            <span className="text-xs text-gray-400">
              {empresasFiltradas.length} de {empresas.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700 bg-black/40">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Razón social</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Paquete</th>
                  <th className="px-4 py-3 font-semibold">SCIAN</th>
                  <th className="px-4 py-3 font-semibold">Correo</th>
                </tr>
              </thead>
              <tbody>
                {empresasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      No hay empresas con esos filtros.
                    </td>
                  </tr>
                ) : (
                  empresasFiltradas.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-gray-800 hover:bg-white/5 transition"
                    >
                      <td className="px-4 py-3 text-gray-400">{e.id}</td>
                      <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">
                        {e.razonSocial || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {e.estado || e.ubicacion || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                          {e.paquete || "basico"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {e.sectorScian || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 truncate max-w-[160px]">
                        {e.correo || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-500 mt-8">
        Dashboard (/admin) = monitor visual · Reportes = tablas y exportación
      </p>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
        active
          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
          : "bg-black/30 text-gray-400 border-yellow-500/20 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon size={16} />
      {label}
      {typeof count === "number" && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 border border-white/10">
          {count}
        </span>
      )}
    </button>
  );
}

function MiniKpi({ icon: Icon, label, value, sub, color }) {
  const map = {
    blue: "from-blue-600/20 to-blue-800/20 border-blue-500/30 text-blue-400",
    green: "from-green-600/20 to-green-800/20 border-green-500/30 text-green-400",
    purple:
      "from-purple-600/20 to-purple-800/20 border-purple-500/30 text-purple-400",
    yellow:
      "from-yellow-600/20 to-orange-800/20 border-yellow-500/30 text-yellow-400",
  };
  return (
    <div
      className={`bg-gradient-to-br ${map[color]} border rounded-xl p-6 hover:scale-105 transition-transform`}
    >
      <div className="bg-black/20 p-3 rounded-lg w-fit mb-3">
        <Icon size={22} className={map[color].split(" ").pop()} />
      </div>
      <h3 className="text-3xl font-bold mb-1 text-white">{value}</h3>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-white/10">{sub}</p>
    </div>
  );
}