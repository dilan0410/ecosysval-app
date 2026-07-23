// frontend/src/utils/generarReportePDF.js
/**
 * GENERADOR DE REPORTES PDF - ECOSYSVAL
 * -------------------------------------------------------
 * Genera un PDF profesional con las estadísticas del
 * Sistema de Inteligencia Económica.
 *
 * Recibe los 3 objetos de stats del dashboard y devuelve
 * un PDF descargable automáticamente.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Genera y descarga el reporte PDF ejecutivo.
 *
 * @param {Object} overview - Datos de KPIs generales
 * @param {Object} usuariosPorMes - Tendencia mensual
 * @param {Object} empresasStats - Estadísticas de empresas
 * @param {Object} user - Usuario que genera el reporte
 */
export function generarReportePDF(overview, usuariosPorMes, empresasStats, user) {
  // ==========================================
  // CONFIGURACIÓN INICIAL
  // ==========================================
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Colores corporativos
  const COLOR_PRIMARIO = [251, 191, 36];   // Amarillo Ecosysval
  const COLOR_SECUNDARIO = [30, 41, 59];   // Slate oscuro
  const COLOR_TEXTO = [51, 65, 85];        // Slate medio
  const COLOR_MUTED = [148, 163, 184];     // Gris claro

  let y = 20; // Posición Y actual (se va incrementando)
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const MARGIN = 15;

    // ==========================================
    // HELPER: Agregar sección con título
    // ==========================================
    const agregarTitulo = (titulo) => {
        // Fondo del título
        doc.setFillColor(...COLOR_SECUNDARIO);
        doc.rect(MARGIN, y - 5, PAGE_WIDTH - MARGIN * 2, 8, "F");

        // Texto del título (sin emojis, solo texto limpio)
        doc.setTextColor(...COLOR_PRIMARIO);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(titulo, MARGIN + 3, y);
        y += 10;

        // Reset color
        doc.setTextColor(...COLOR_TEXTO);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
    };

  // ==========================================
  // ENCABEZADO
  // ==========================================
  // Título principal
  doc.setFillColor(...COLOR_SECUNDARIO);
  doc.rect(0, 0, PAGE_WIDTH, 40, "F");

  doc.setTextColor(...COLOR_PRIMARIO);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("ECOSYSVAL", PAGE_WIDTH / 2, 18, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Inteligencia Económica", PAGE_WIDTH / 2, 26, { align: "center" });

  doc.setFontSize(8);
  doc.text("Reporte Ejecutivo", PAGE_WIDTH / 2, 33, { align: "center" });

  y = 50;

  // ==========================================
  // METADATA (Fecha y usuario)
  // ==========================================
  const fecha = new Date().toLocaleString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.setTextColor(...COLOR_TEXTO);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(` Fecha: ${fecha}`, MARGIN, y);
  y += 5;
  doc.text(` Generado por: ${user?.name || "Admin"} (${user?.role || "admin"})`, MARGIN, y);
  y += 10;

  // ==========================================
  // 1. KPIS GENERALES
  // ==========================================
  agregarTitulo("RESUMEN EJECUTIVO");

  const kpisData = [
    ["Usuarios totales", overview?.totalUsuarios ?? 0],
    ["Empresas registradas", overview?.totalEmpresas ?? 0],
    ["Empleos publicados", overview?.totalEmpleos ?? 0],
    ["Administradores", overview?.totalAdmins ?? 0],
    ["Emails verificados", `${overview?.usuariosVerificados ?? 0} (${overview?.tasaVerificacion ?? 0}%)`],
    ["Emails pendientes", overview?.usuariosPendientes ?? 0],
    ["Nuevos usuarios este mes", overview?.usuariosNuevosEsteMes ?? 0],
    ["Nuevas empresas este mes", overview?.empresasNuevasEsteMes ?? 0],
    ["Empleos activos", overview?.empleosActivos ?? 0],
    ["Empleos cerrados", overview?.empleosCerrados ?? 0],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Métrica", "Valor"]],
    body: kpisData,
    theme: "grid",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: COLOR_SECUNDARIO,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLOR_TEXTO,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ==========================================
  // 2. TENDENCIA DE USUARIOS
  // ==========================================
  agregarTitulo("CRECIMIENTO MENSUAL DE USUARIOS");

  if (usuariosPorMes?.labels && usuariosPorMes?.data) {
    const tendenciaData = usuariosPorMes.labels.map((mes, index) => [
      mes,
      `${usuariosPorMes.data[index]} usuarios`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Mes", "Nuevos usuarios"]],
      body: tendenciaData,
      theme: "grid",
      headStyles: {
        fillColor: COLOR_PRIMARIO,
        textColor: COLOR_SECUNDARIO,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: COLOR_TEXTO,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: MARGIN, right: MARGIN },
    });

    y = doc.lastAutoTable.finalY + 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLOR_MUTED);
    doc.text(
      `Promedio: ${usuariosPorMes.promedio ?? 0} usuarios/mes · Total período: ${usuariosPorMes.total ?? 0}`,
      MARGIN,
      y
    );
    y += 10;
  }

  // ==========================================
  // 3. DISTRIBUCIÓN GEOGRÁFICA
  // ==========================================
  // Verificar si cabe en la página, si no, agregar nueva
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  agregarTitulo("DISTRIBUCIÓN GEOGRÁFICA (TOP 10)");

  if (empresasStats?.porEstado?.labels && empresasStats?.porEstado?.data) {
    const totalEmpresas = empresasStats.total || 1;
    const estadosData = empresasStats.porEstado.labels.slice(0, 10).map((estado, index) => {
      const cantidad = empresasStats.porEstado.data[index];
      const porcentaje = Math.round((cantidad / totalEmpresas) * 100);
      return [
        `${index + 1}`,
        estado,
        `${cantidad} empresas`,
        `${porcentaje}%`,
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [["#", "Estado", "Cantidad", "Porcentaje"]],
      body: estadosData,
      theme: "grid",
      headStyles: {
        fillColor: COLOR_PRIMARIO,
        textColor: COLOR_SECUNDARIO,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: COLOR_TEXTO,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: MARGIN, right: MARGIN },
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ==========================================
  // 4. PAQUETES COMERCIALES
  // ==========================================
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  agregarTitulo("PAQUETES COMERCIALES");

  if (empresasStats?.porPaquete?.labels && empresasStats?.porPaquete?.data) {
    const totalEmpresas = empresasStats.total || 1;
    const paquetesData = empresasStats.porPaquete.labels.map((paquete, index) => {
      const cantidad = empresasStats.porPaquete.data[index];
      const porcentaje = Math.round((cantidad / totalEmpresas) * 100);
      return [
        paquete.charAt(0).toUpperCase() + paquete.slice(1),
        `${cantidad} empresas`,
        `${porcentaje}%`,
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [["Paquete", "Cantidad", "Porcentaje"]],
      body: paquetesData,
      theme: "grid",
      headStyles: {
        fillColor: COLOR_PRIMARIO,
        textColor: COLOR_SECUNDARIO,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: COLOR_TEXTO,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: MARGIN, right: MARGIN },
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ==========================================
  // 5. INDICADORES DE PERFIL
  // ==========================================
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  agregarTitulo("INDICADORES DE PERFIL");

  if (empresasStats?.indicadores && empresasStats?.porcentajes) {
    const indicadoresData = [
      ["Empresas con logo", `${empresasStats.indicadores.conLogo} (${empresasStats.porcentajes.tasaPerfilCompleto}%)`],
      ["Empresas con sucursales", `${empresasStats.indicadores.conSucursales} (${empresasStats.porcentajes.tasaSucursales}%)`],
      ["Empresas con socios comerciales", empresasStats.indicadores.conSocios],
      ["Empresas con operaciones internacionales", `${empresasStats.indicadores.conOperacionesInt} (${empresasStats.porcentajes.tasaInternacional}%)`],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Indicador", "Valor"]],
      body: indicadoresData,
      theme: "grid",
      headStyles: {
        fillColor: COLOR_PRIMARIO,
        textColor: COLOR_SECUNDARIO,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: COLOR_TEXTO,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: MARGIN, right: MARGIN },
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ==========================================
  // 6. INSIGHTS Y RECOMENDACIONES
  // ==========================================
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  agregarTitulo("INSIGHTS Y RECOMENDACIONES");

  const insights = generarInsights(overview, empresasStats);

  doc.setFontSize(9);
  doc.setTextColor(...COLOR_TEXTO);
  doc.setFont("helvetica", "normal");

  insights.forEach((insight, index) => {
    // Verificar si cabe en la página
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    // Bullet
    doc.setTextColor(...COLOR_PRIMARIO);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}.`, MARGIN, y);

    // Texto
    doc.setTextColor(...COLOR_TEXTO);
    doc.setFont("helvetica", "normal");
    const lineas = doc.splitTextToSize(insight, PAGE_WIDTH - MARGIN * 2 - 8);
    doc.text(lineas, MARGIN + 6, y);
    y += lineas.length * 4.5 + 3;
  });

  // ==========================================
  // FOOTER (en todas las páginas)
  // ==========================================
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Línea separadora
    doc.setDrawColor(...COLOR_MUTED);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, 285, PAGE_WIDTH - MARGIN, 285);

    // Texto footer
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_MUTED);
    doc.setFont("helvetica", "normal");
    doc.text("Ecosysval © 2026 · Reporte generado automáticamente", MARGIN, 290);
    doc.text(`Página ${i} de ${totalPages}`, PAGE_WIDTH - MARGIN, 290, { align: "right" });
  }

  // ==========================================
  // DESCARGAR EL PDF
  // ==========================================
  const nombreArchivo = `Reporte-Ecosysval-${new Date().toISOString().substring(0, 10)}.pdf`;
  doc.save(nombreArchivo);
}

// ==========================================
// HELPER: Generar insights automáticos
// ==========================================
function generarInsights(overview, empresasStats) {
  const insights = [];

  // Insight 1: Tasa de verificación
  if (overview?.tasaVerificacion !== undefined) {
    if (overview.tasaVerificacion < 80) {
      insights.push(
        `Tasa de verificación de emails: ${overview.tasaVerificacion}%. Hay ${overview.usuariosPendientes} usuarios pendientes de verificar. Se recomienda revisar la entrega de emails (posibles correos en spam) y mejorar el flujo de reenvío.`
      );
    } else {
      insights.push(
        `Excelente tasa de verificación de emails (${overview.tasaVerificacion}%). El sistema de verificación funciona correctamente.`
      );
    }
  }

  // Insight 2: Paquetes comerciales
  if (empresasStats?.porPaquete?.labels && empresasStats?.total > 0) {
    const basicoIndex = empresasStats.porPaquete.labels.indexOf("basico");
    if (basicoIndex !== -1) {
      const basicoCount = empresasStats.porPaquete.data[basicoIndex];
      const porcentajeBasico = Math.round((basicoCount / empresasStats.total) * 100);

      if (porcentajeBasico > 80) {
        insights.push(
          `${porcentajeBasico}% de las empresas están en el paquete "Básico" (${basicoCount} de ${empresasStats.total}). Oportunidad de negocio: diseñar estrategia de conversión hacia paquetes premium (Pro, Premium, Platino) con beneficios diferenciados.`
        );
      }
    }
  }

  // Insight 3: Distribución geográfica
  if (empresasStats?.porEstado?.labels) {
    const sinEspecificarIndex = empresasStats.porEstado.labels.indexOf("Sin especificar");
    if (sinEspecificarIndex !== -1) {
      const cantidad = empresasStats.porEstado.data[sinEspecificarIndex];
      const porcentaje = Math.round((cantidad / empresasStats.total) * 100);

      if (porcentaje > 20) {
        insights.push(
          `${cantidad} empresas (${porcentaje}%) no especifican estado en el formulario de registro. Se recomienda hacer este campo obligatorio para mejorar la calidad de datos geográficos.`
        );
      }
    }
  }

  // Insight 4: Perfiles incompletos
  if (empresasStats?.porcentajes?.tasaPerfilCompleto !== undefined) {
    const tasa = empresasStats.porcentajes.tasaPerfilCompleto;
    if (tasa < 50) {
      insights.push(
        `Solo el ${tasa}% de las empresas tiene logo subido (${empresasStats.indicadores?.conLogo || 0} de ${empresasStats.total}). Se recomienda implementar sistema de gamificación o beneficios para incentivar la completitud de perfiles.`
      );
    }
  }

  // Insight 5: Operaciones internacionales
  if (empresasStats?.porcentajes?.tasaInternacional !== undefined) {
    const tasa = empresasStats.porcentajes.tasaInternacional;
    if (tasa > 30) {
      insights.push(
        `${tasa}% de las empresas registra operaciones internacionales (${empresasStats.indicadores?.conOperacionesInt || 0} empresas). Esto valida el enfoque B2B/cross-border de la plataforma y sugiere expansión hacia herramientas de comercio exterior.`
      );
    }
  }

  // Insight 6: Crecimiento
  if (overview?.usuariosNuevosEsteMes > 0 && overview?.empresasNuevasEsteMes > 0) {
    insights.push(
      `Crecimiento del mes actual: ${overview.usuariosNuevosEsteMes} nuevos usuarios y ${overview.empresasNuevasEsteMes} nuevas empresas registradas. La plataforma muestra tracción activa.`
    );
  }

  // Si no hay insights, mensaje por defecto
  if (insights.length === 0) {
    insights.push(
      "Los datos actuales no muestran anomalías significativas. El sistema opera dentro de parámetros esperados."
    );
  }

  return insights;
}