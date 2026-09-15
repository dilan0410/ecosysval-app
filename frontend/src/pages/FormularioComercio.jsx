// src/components/FormularioComercioModal.jsx
import React, { useState } from "react";
import { Building2, Info, Package, Settings, Send, XCircle } from "lucide-react";
import { toast } from "sonner";

const PRODUCTOS = [
  "Madera refinada",
  "Sillas de madera",
  "Mesas de madera",
  "Escritorios",
  "Escobas",
];

const UNIDADES = [
  "Ninguna",
  "Gramos",
  "Kilogramos",
  "Metros",
  "Metros cuadrados",
  "Metros cúbicos",
];

export default function FormularioComercioModal({ empresaTarget, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    transaccion: "compra",
    tipoItem: "producto",
    cantidad: "",
    producto: "Madera refinada",
    unidad: "Ninguna",
    descripcion: "",
  });

  const nombreEmpresa =
    empresaTarget?.nombre ||
    empresaTarget?.razonSocial ||
    empresaTarget?.name ||
    "Empresa seleccionada";

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.cantidad || Number(formData.cantidad) <= 0) {
      toast.error("Ingresa una cantidad válida.");
      return;
    }
    if (!formData.descripcion.trim()) {
      toast.error("Agrega una descripción del producto o servicio.");
      return;
    }

    setLoading(true);

    // Datos del emisor (Empresa A = usuario logueado)
    let emisorNombre = "Tu empresa";
    let emisorId = null;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      emisorNombre = u?.empresa?.razonSocial || u?.name || "Tu empresa";
      emisorId = u?.id || null;
    } catch (_) {}

    const payload = {
      ...formData,
      // Empresa B (receptora)
      empresaDestino: nombreEmpresa,
      empresaDestinoId: empresaTarget?.id,
      empresaData: empresaTarget,
      // Empresa A (emisora)
      empresaEmisora: emisorNombre,
      empresaEmisoraId: emisorId,
      createdAt: new Date().toISOString(),
      status: "pendiente",
    };

    // Mock profesional: guardar para demo de la empresa B
    try {
      const prev = JSON.parse(localStorage.getItem("ecosysval_solicitudes_comercio") || "[]");
      prev.unshift(payload);
      localStorage.setItem("ecosysval_solicitudes_comercio", JSON.stringify(prev.slice(0, 20)));
    } catch (_) {}

    setTimeout(() => {
      setLoading(false);
      toast.success(`Solicitud enviada a ${nombreEmpresa}`);
      onSuccess?.(payload);
      onClose?.();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
      {/* Modal compacto: sin scroll lateral, altura controlada */}
      <div className="bg-[#0b1630] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
          <h2 className="text-lg font-bold text-white">Formulario de comercio</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white transition p-1"
            aria-label="Cerrar"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body — sin overflow-x, padding compacto */}
        <div className="px-5 py-4 space-y-4">
          {/* Info corta */}
          <div className="flex gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-2.5 rounded-xl text-blue-200 text-xs leading-snug">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Seleccione el producto o servicio a solicitar u ofrecer. La empresa objetivo podrá
              aceptar o rechazar indicando el motivo.
            </p>
          </div>

          {/* Empresa + toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-6 h-6 text-white/50 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-extrabold text-white truncate" title={nombreEmpresa}>
                {nombreEmpresa}
              </h3>
            </div>

            <div className="flex bg-white/5 rounded-full p-0.5 border border-white/10 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleChange("tipoItem", "producto")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                  formData.tipoItem === "producto"
                    ? "bg-blue-600 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Package className="w-3.5 h-3.5" /> Producto
              </button>
              <button
                type="button"
                onClick={() => handleChange("tipoItem", "servicio")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                  formData.tipoItem === "servicio"
                    ? "bg-blue-600 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Settings className="w-3.5 h-3.5" /> Servicio
              </button>
            </div>
          </div>

          <form id="tradeForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Transacción */}
              <div>
                <label className="text-white/70 text-xs font-semibold mb-2 block">
                  Transacción
                </label>
                <div className="flex gap-5">
                  <label className="flex items-center gap-2 text-white/90 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="transaccion"
                      className="w-3.5 h-3.5 accent-blue-600"
                      checked={formData.transaccion === "compra"}
                      onChange={() => handleChange("transaccion", "compra")}
                    />
                    Compra
                  </label>
                  <label className="flex items-center gap-2 text-white/90 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="transaccion"
                      className="w-3.5 h-3.5 accent-blue-600"
                      checked={formData.transaccion === "venta"}
                      onChange={() => handleChange("transaccion", "venta")}
                    />
                    Venta
                  </label>
                </div>
              </div>

              {/* Cantidad */}
              <div>
                <label className="text-white/70 text-xs font-semibold mb-1.5 block">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) => handleChange("cantidad", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. 200"
                />
              </div>

              {/* Producto */}
              <div>
                <label className="text-white/70 text-xs font-semibold mb-1.5 block">
                  {formData.tipoItem === "producto" ? "Producto" : "Servicio"}
                </label>
                <select
                  value={formData.producto}
                  onChange={(e) => handleChange("producto", e.target.value)}
                  className="w-full bg-[#071326] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {PRODUCTOS.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unidad */}
              <div>
                <label className="text-white/70 text-xs font-semibold mb-1.5 block">
                  Unidad de medida
                </label>
                <select
                  value={formData.unidad}
                  onChange={(e) => handleChange("unidad", e.target.value)}
                  className="w-full bg-[#071326] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {UNIDADES.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción compacta */}
            <div>
              <label className="text-white/70 text-xs font-semibold mb-1.5 block">
                Descripción del {formData.tipoItem === "producto" ? "producto" : "servicio"}
              </label>
              <textarea
                rows={2}
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Ej. 200 kg de madera lista para cortar y trabajar."
              />
            </div>
          </form>
        </div>

        {/* Footer fijo */}
        <div className="px-5 py-3 border-t border-white/10 bg-white/5 flex justify-between items-center gap-3 shrink-0">
          <button
            type="submit"
            form="tradeForm"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Enviando...</span>
            ) : (
              <>
                <Send className="w-4 h-4" /> Enviar
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" /> Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}