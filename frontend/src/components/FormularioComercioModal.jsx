// src/components/FormularioComercioModal.jsx
import React, { useState, useEffect } from "react";
import { Building2, Info, Package, Settings, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api/axiosClient";
import { normalizarArray } from "../hooks/useMapaRecomendaciones";

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
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [formData, setFormData] = useState({
    transaccion: "compra",
    tipoItem: "producto",
    cantidad: "",
    producto: "",
    unidad: "Ninguna",
    descripcion: "",
  });

  const nombreEmpresa =
    empresaTarget?.nombre ||
    empresaTarget?.razonSocial ||
    empresaTarget?.name ||
    "Empresa seleccionada";

  // Lista que se muestra según el toggle Producto / Servicio
  const itemsDisponibles =
    formData.tipoItem === "producto" ? productos : servicios;

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoadingProductos(true);

        // 1) PRIORIDAD: datos ya normalizados que vienen del mapa
        const prodsLocales = normalizarArray(
          empresaTarget?.productosLista ??
            empresaTarget?.productos ??
            empresaTarget?.empresaData?.productos
        );
        const servsLocales = normalizarArray(
          empresaTarget?.serviciosLista ??
            empresaTarget?.servicios ??
            empresaTarget?.empresaData?.servicios
        );

        if (prodsLocales.length > 0 || servsLocales.length > 0) {
          setProductos(prodsLocales);
          setServicios(servsLocales);

          const listaInicial =
            formData.tipoItem === "servicio" && servsLocales.length > 0
              ? servsLocales
              : prodsLocales.length > 0
              ? prodsLocales
              : servsLocales;

          if (listaInicial.length > 0) {
            setFormData((prev) => ({ ...prev, producto: listaInicial[0] }));
          }
          return;
        }

        // 2) FALLBACK: fetch a la API y normalizar
        if (empresaTarget?.id || empresaTarget?.empresaId) {
          const id = empresaTarget.id || empresaTarget.empresaId;
          try {
            const res = await api.get(`/empresas/${id}`);
            const empresaData = res.data || {};

            const prodsApi = normalizarArray(empresaData.productos);
            const servsApi = normalizarArray(empresaData.servicios);

            setProductos(prodsApi);
            setServicios(servsApi);

            const listaInicial =
              formData.tipoItem === "servicio" && servsApi.length > 0
                ? servsApi
                : prodsApi.length > 0
                ? prodsApi
                : servsApi;

            if (listaInicial.length > 0) {
              setFormData((prev) => ({ ...prev, producto: listaInicial[0] }));
            }
            return;
          } catch (err) {
            console.warn("No se pudo cargar empresa target:", err);
          }
        }

        // 3) Último recurso: mi-empresa (no debería llegar aquí en flujo normal)
        try {
          const res = await api.get("/empresas/mi-empresa");
          const empresaData = res.data || {};
          const prods = normalizarArray(empresaData.productos);
          const servs = normalizarArray(empresaData.servicios);
          setProductos(prods);
          setServicios(servs);
          if (prods.length > 0) {
            setFormData((prev) => ({ ...prev, producto: prods[0] }));
          }
        } catch (err) {
          console.error("Error cargando productos:", err);
          toast.error("No se pudieron cargar los productos");
          setProductos([]);
          setServicios([]);
        }
      } catch (error) {
        console.error("Error general cargando productos:", error);
        setProductos([]);
        setServicios([]);
      } finally {
        setLoadingProductos(false);
      }
    };

    cargarProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaTarget]);

  // Al cambiar Producto ↔ Servicio, seleccionar el primer item de esa lista
  useEffect(() => {
    const lista = formData.tipoItem === "producto" ? productos : servicios;
    if (lista.length > 0) {
      setFormData((prev) => ({
        ...prev,
        producto: lista.includes(prev.producto) ? prev.producto : lista[0],
      }));
    } else {
      setFormData((prev) => ({ ...prev, producto: "" }));
    }
  }, [formData.tipoItem, productos, servicios]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cantidad || Number(formData.cantidad) <= 0) {
      toast.error("Ingresa una cantidad válida.");
      return;
    }
    if (!formData.descripcion.trim()) {
      toast.error("Agrega una descripción del producto o servicio.");
      return;
    }
    if (!formData.producto) {
      toast.error("Selecciona un producto o servicio.");
      return;
    }

    // Función auxiliar para recortar textos y evitar error VARCHAR(255)
    const cut = (str, max = 240) => {
      const val = String(str || "").trim();
      return val.length > max ? val.slice(0, max - 3) + "..." : val;
    };

    setLoading(true);

    let emisorNombre = "Tu empresa";
    let emisorUserId = null;
    let emisorEmpresaId = null;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      emisorNombre = u?.empresa?.razonSocial || u?.name || "Tu empresa";
      emisorUserId = u?.id || null;
      emisorEmpresaId = u?.empresa?.id || null;
    } catch (_) {}

    const destinoId = empresaTarget?.id || empresaTarget?.empresaId || null;

    // Payload limpio alineado a la tabla solicitud_comercio
    const payload = {
      transaccion: formData.transaccion,           // 'compra' | 'venta'
      tipoItem: formData.tipoItem,                 // 'producto' | 'servicio'
      cantidad: Number(formData.cantidad),
      producto: cut(formData.producto, 240),
      unidad: formData.unidad || "Ninguna",
      descripcion: formData.descripcion.trim(),    // En BD es TEXT (ilimitado)

      empresaDestino: cut(nombreEmpresa, 240),
      empresaDestinoId: destinoId ? Number(destinoId) : null,

      empresaEmisora: cut(emisorNombre, 240),
      empresaEmisoraId: emisorUserId ? Number(emisorUserId) : null,

      status: "pendiente",
    };

    try {
      const { data } = await api.post("/solicitudes-comercio", payload);

      toast.success(`Solicitud enviada a ${nombreEmpresa}`);
      onSuccess?.(data || payload);
      onClose?.();
    } catch (error) {
      console.error("Error enviando solicitud:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al enviar solicitud";
      toast.error(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
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

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <div className="flex gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-2.5 rounded-xl text-blue-200 text-xs leading-snug">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Seleccione el producto o servicio a solicitar u ofrecer. La empresa
              objetivo podrá aceptar o rechazar indicando el motivo.
            </p>
          </div>

          {/* Empresa + toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-6 h-6 text-white/50 flex-shrink-0" />
              <h3
                className="text-base sm:text-lg font-extrabold text-white truncate"
                title={nombreEmpresa}
              >
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

              {/* Producto / Servicio */}
              <div>
                <label className="text-white/70 text-xs font-semibold mb-1.5 block">
                  {formData.tipoItem === "producto" ? "Producto" : "Servicio"}
                </label>
                {loadingProductos ? (
                  <div className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/50">
                    Cargando...
                  </div>
                ) : itemsDisponibles.length > 0 ? (
                  <select
                    value={formData.producto}
                    onChange={(e) => handleChange("producto", e.target.value)}
                    className="w-full bg-[#071326] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {itemsDisponibles.map((op, index) => (
                      <option key={index} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-sm text-amber-200">
                    Esta empresa no tiene{" "}
                    {formData.tipoItem === "producto" ? "productos" : "servicios"}{" "}
                    registrados
                  </div>
                )}
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

            {/* Descripción */}
            <div>
              <label className="text-white/70 text-xs font-semibold mb-1.5 block">
                Descripción del{" "}
                {formData.tipoItem === "producto" ? "producto" : "servicio"}
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

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-white/5 flex justify-between items-center gap-3 shrink-0">
          <button
            type="submit"
            form="tradeForm"
            disabled={
              loading || loadingProductos || itemsDisponibles.length === 0
            }
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