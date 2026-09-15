import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Info, Package, Settings, Send, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function FormularioComercioModal({ empresaTarget, onClose, onSuccess }) {
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    transaccion: "compra",
    tipoItem: "producto",
    cantidad: "",
    producto: "Madera refinada",
    unidad: "Ninguna",
    descripcion: ""
  });

  const productosOpciones = [
    "Madera refinada", "Sillas de madera", "Mesas de madera", "Escritorios", "Escobas"
  ];

  const unidadesOpciones = [
    "Ninguna", "Gramos", "Kilogramos", "Metros", "Metros cuadrados", "Metros cúbicos"
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.cantidad || !formData.descripcion) {
      toast.error("Por favor completa la cantidad y la descripción.");
      return;
    }

    setLoading(true);
    
    // Simulamos una petición al backend de 1.5 segundos (Mock)
    setTimeout(() => {
      setLoading(false);
      toast.success("Solicitud de comercio enviada correctamente.");
      onSuccess(formData); // Llama a la función de éxito
      onClose(); // Cierra el modal
    }, 1500);
  };

  const nombreEmpresa = empresaTarget?.razonSocial || empresaTarget?.nombre || "Empresa Seleccionada";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0b1630] border border-white/10 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white">Formulario de comercio</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Info Alert */}
          <div className="flex gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl mb-6 text-blue-200 text-sm">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              Para realizar el proceso de comercio, seleccione el producto o servicio que va a solicitar u ofrecer a la empresa seleccionada. Tenga en cuenta que su oferta de comercio puede ser rechazada, de ser así, la empresa objetivo expresará el motivo.
            </p>
          </div>

          {/* Header Empresa y Tipo */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-white/50" />
              <h3 className="text-2xl font-black text-white truncate max-w-md">
                {nombreEmpresa}
              </h3>
            </div>

            {/* Toggle Producto/Servicio */}
            <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
              <button
                type="button"
                onClick={() => handleChange("tipoItem", "producto")}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition ${
                  formData.tipoItem === "producto" ? "bg-blue-600 text-white shadow-lg" : "text-white/60 hover:text-white"
                }`}
              >
                <Package className="w-4 h-4" /> Producto
              </button>
              <button
                type="button"
                onClick={() => handleChange("tipoItem", "servicio")}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition ${
                  formData.tipoItem === "servicio" ? "bg-blue-600 text-white shadow-lg" : "text-white/60 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4" /> Servicio
              </button>
            </div>
          </div>

          <form id="tradeForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transacción */}
              <div>
                <label className="text-white/80 text-sm font-semibold mb-3 block">Transacción</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 text-white/90 cursor-pointer">
                    <input 
                      type="radio" 
                      name="transaccion" 
                      className="w-4 h-4 accent-blue-600"
                      checked={formData.transaccion === "compra"}
                      onChange={() => handleChange("transaccion", "compra")}
                    />
                    Compra
                  </label>
                  <label className="flex items-center gap-3 text-white/90 cursor-pointer">
                    <input 
                      type="radio" 
                      name="transaccion" 
                      className="w-4 h-4 accent-blue-600"
                      checked={formData.transaccion === "venta"}
                      onChange={() => handleChange("transaccion", "venta")}
                    />
                    Venta
                  </label>
                </div>
              </div>

              {/* Cantidad */}
              <div>
                <label className="text-white/80 text-sm font-semibold mb-2 block">Cantidad</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) => handleChange("cantidad", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              {/* Producto */}
              <div>
                <label className="text-white/80 text-sm font-semibold mb-2 block">
                  {formData.tipoItem === "producto" ? "Producto" : "Servicio"}
                </label>
                <select 
                  value={formData.producto}
                  onChange={(e) => handleChange("producto", e.target.value)}
                  className="w-full bg-[#071326] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  {productosOpciones.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>

              {/* Unidad */}
              <div>
                <label className="text-white/80 text-sm font-semibold mb-2 block">Unidad de medida</label>
                <select 
                  value={formData.unidad}
                  onChange={(e) => handleChange("unidad", e.target.value)}
                  className="w-full bg-[#071326] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  {unidadesOpciones.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="text-white/80 text-sm font-semibold mb-2 block">Descripción del producto/servicio</label>
              <textarea 
                rows="3"
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
              ></textarea>
            </div>
          </form>
        </div>

        {/* Footer / Botones */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-between items-center">
          <button 
            type="submit" 
            form="tradeForm"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            {loading ? <span className="animate-pulse">Enviando...</span> : <><Send className="w-4 h-4" /> Enviar</>}
          </button>

          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" /> Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}