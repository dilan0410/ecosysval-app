// src/components/VistaSolicitudModal.jsx
import React, { useState } from "react";
import { Building2, Send, XCircle, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api/axiosClient";

/**
 * Vista de la EMPRESA B (receptora).
 */
export default function VistaSolicitudModal({ solicitud, onClose, onEstadoCambiado }) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [razones, setRazones] = useState({
    noInteresa: false,
    inventarioLleno: false,
    otra: "",
  });

  if (!solicitud) return null;

  const emisor =
    solicitud.empresaEmisora ||
    solicitud.empresa ||
    "Empresa solicitante";

  const destino =
    solicitud.empresaDestino ||
    "Tu empresa";

  const handleAceptar = async () => {
    setLoading(true);
    try {
      if (solicitud.id) {
        await api.patch(`/solicitudes-comercio/${solicitud.id}/estado`, {
          status: "aceptada",
        });
      }
      toast.success("Solicitud de conexión aceptada.", {
        style: {
          background: "#22c55e",
          color: "white",
          border: "none",
          fontWeight: 600,
        },
        icon: <CheckCircle className="w-5 h-5 text-white" />,
      });
      onEstadoCambiado?.("aceptada");
      onClose?.();
    } catch (error) {
      console.error("Error al aceptar solicitud:", error);
      toast.error("Error al procesar la respuesta.");
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!razones.noInteresa && !razones.inventarioLleno && !razones.otra.trim()) {
      toast.error("Selecciona o escribe al menos un motivo para rechazar.");
      return;
    }
    setLoading(true);
    try {
      if (solicitud.id) {
        await api.patch(`/solicitudes-comercio/${solicitud.id}/estado`, {
          status: "rechazada",
        });
      }
      toast.info("Solicitud rechazada correctamente.");
      onEstadoCambiado?.("rechazada");
      onClose?.();
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      toast.error("Error al procesar la respuesta.");
    } finally {
      setLoading(false);
    }
  };

  const descCompleta =
    solicitud.unidad && solicitud.unidad !== "Ninguna"
      ? `${solicitud.cantidad} ${String(solicitud.unidad).toLowerCase()} — ${solicitud.descripcion}`
      : `${solicitud.cantidad} — ${solicitud.descripcion}`;

  // —— Modal rechazo ——
  if (showRejectModal) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-[#0b1630] border border-white/10 text-white w-full max-w-md rounded-2xl shadow-2xl p-5">
          <h3 className="text-base font-bold mb-4 text-white">
            ¿Por qué rechazas la conexión? (Puedes seleccionar más de una opción)
          </h3>

          <div className="space-y-3 mb-5">
            <label className="flex items-center gap-3 cursor-pointer text-sm text-white/90">
              <input
                type="checkbox"
                checked={razones.noInteresa}
                onChange={() =>
                  setRazones((r) => ({ ...r, noInteresa: !r.noInteresa }))
                }
                className="w-4 h-4 accent-red-500 rounded"
              />
              En este momento no me interesa
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-sm text-white/90">
              <input
                type="checkbox"
                checked={razones.inventarioLleno}
                onChange={() =>
                  setRazones((r) => ({
                    ...r,
                    inventarioLleno: !r.inventarioLleno,
                  }))
                }
                className="w-4 h-4 accent-red-500 rounded"
              />
              Mi inventario está lleno / No tengo inventario disponible
            </label>

            <div className="pt-1">
              <label className="font-semibold text-xs text-white/70 block mb-1.5">
                Otra razón
              </label>
              <input
                type="text"
                placeholder="Escribe tu razón"
                value={razones.otra}
                onChange={(e) =>
                  setRazones((r) => ({ ...r, otra: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={handleRechazar}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Enviar
            </button>
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
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

  // —— Vista principal (Empresa B) ——
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-[#0b1630] border border-white/10 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-white/40 hover:text-white transition p-1"
          aria-label="Cerrar"
        >
          <XCircle className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-white mb-1">
            Solicitud de conexión
          </h2>
          <p className="text-[11px] text-white/45 mb-5">
            Detalle de la solicitud comercial
          </p>

          {/* De quién → a quién */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 mb-5">
            <div className="flex items-start gap-3 min-w-0">
              <Building2 className="w-7 h-7 text-accent flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-white/50 uppercase tracking-wide font-semibold">
                  Solicitud de
                </p>
                <p className="text-base font-extrabold text-white truncate" title={emisor}>
                  {emisor}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-white/40">
                  <ArrowRight className="w-3 h-3" />
                  <span className="truncate">Para: {destino}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-[11px] text-white/50 font-semibold mb-0.5">
                Transacción
              </p>
              <p className="text-sm font-bold text-white capitalize">
                {solicitud.transaccion || "Compra"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-white/50 font-semibold mb-0.5">
                Producto seleccionado
              </p>
              <p className="text-sm font-bold text-white">
                {solicitud.producto}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[11px] text-white/50 font-semibold mb-1">
              Descripción del producto solicitado
            </p>
            <p className="text-sm font-semibold text-white/90 leading-relaxed">
              {descCompleta}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              type="button"
              onClick={handleAceptar}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Aceptar conexión
            </button>
            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}