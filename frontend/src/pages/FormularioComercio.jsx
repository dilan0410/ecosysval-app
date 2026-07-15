// src/pages/FormularioComercio.jsx
import React, { useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import Layout from "../components/Layout";

const unidadesMock = ["Ninguna", "Toneladas", "Kilogramos", "Piezas", "Litros"];
const productosMock = ["Madera refinada", "Acero laminado", "Textil industrial"];
const serviciosMock = ["Asesoría", "Transporte", "Almacenamiento"];

export default function FormularioComercio() {
  const { empresaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ MapaPage manda: { nombre, tipo, productos, servicios, ciudad, estado }
  const state = location.state || {};
  const empresaNombre = state.nombre || state.empresaNombre || "Empresa";
  const empresaTipo = state.tipo || state.empresaTipo || "—";
  const ciudad = state.ciudad || "—";
  const estado = state.estado || "—";

  // Puede venir como string o array
  const productos = useMemo(() => normalizeList(state.productos), [state.productos]);
  const servicios = useMemo(() => normalizeList(state.servicios), [state.servicios]);

  const [tipoOperacion, setTipoOperacion] = useState("producto"); // producto | servicio
  const [tipoTransaccion, setTipoTransaccion] = useState("compra"); // compra | venta

  const [formProducto, setFormProducto] = useState({
    producto: "",
    cantidad: "",
    unidad: "Ninguna",
    descripcion: "",
  });

  const [formServicio, setFormServicio] = useState({
    servicio: "",
    descripcion: "",
  });

  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setFormProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleServicioChange = (e) => {
    const { name, value } = e.target;
    setFormServicio((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      empresaId,
      empresaNombre,
      empresaTipo,
      ciudad,
      estado,
      tipoOperacion,
      tipoTransaccion,
      detalle: tipoOperacion === "producto" ? formProducto : formServicio,
    };

    console.log("Payload comercio:", payload);
    alert("Solicitud de comercio registrada (mock).");
  };

  return (
    <Layout>
            <div className="mx-auto w-full max-w-6xl grid gap-6 lg:grid-cols-[360px_1fr]">
              {/* IZQUIERDA */}
              <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 text-text h-fit">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold">Formulario de comercio</h2>
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                      Selecciona si vas a negociar un <strong className="text-text">producto</strong> o un{" "}
                      <strong className="text-text">servicio</strong> y define si es{" "}
                      <strong className="text-text">compra</strong> o <strong className="text-text">venta</strong>.
                    </p>
                  </div>

                  <span className="hidden sm:inline-flex items-center rounded-full border border-border bg-surface/40 px-3 py-1 text-[11px] text-muted">
                    Negociación clara
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-5">
                  <div className="text-[11px] font-bold text-yellow-400/90 uppercase tracking-wider">
                    Empresa objetivo
                  </div>

                  <div className="mt-2 text-lg font-extrabold">{empresaNombre}</div>

                  <div className="mt-1 text-xs text-muted font-mono">ID: {empresaId}</div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <Info label="Tipo" value={empresaTipo} />
                    <Info label="Ubicación" value={`${ciudad}, ${estado}`} />
                    <Info label="Productos" value={productos || "—"} />
                    <Info label="Servicios" value={servicios || "—"} />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4">
                  <p className="text-xs text-text/90 leading-relaxed">
                    ⚠️ La solicitud está sujeta a aprobación. Entre más claro el alcance,
                    más rápido se gestiona.
                  </p>
                </div>
              </section>

              {/* DERECHA */}
              <section className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 md:p-8 text-text">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border">
                  <div>
                    <h3 className="text-lg font-extrabold">Detalle de la operación</h3>
                    <p className="text-sm text-muted">Define los parámetros principales de la transacción.</p>
                  </div>

                  <div className="inline-flex items-center rounded-2xl border border-border bg-surface/40 p-1">
                    <button
                      type="button"
                      onClick={() => setTipoOperacion("producto")}
                      className={[
                        "px-4 py-2 rounded-xl text-sm font-semibold transition",
                        tipoOperacion === "producto"
                          ? "bg-accent text-slate-900"
                          : "text-text/80 hover:bg-surface",
                      ].join(" ")}
                    >
                      Producto
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoOperacion("servicio")}
                      className={[
                        "px-4 py-2 rounded-xl text-sm font-semibold transition",
                        tipoOperacion === "servicio"
                          ? "bg-accent text-slate-900"
                          : "text-text/80 hover:bg-surface",
                      ].join(" ")}
                    >
                      Servicio
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div>
                    <span className="block text-sm font-semibold text-text mb-3">Tipo de transacción</span>

                    <div className="flex gap-3">
                      <ChipRadio
                        label="Compra"
                        active={tipoTransaccion === "compra"}
                        onClick={() => setTipoTransaccion("compra")}
                      />
                      <ChipRadio
                        label="Venta"
                        active={tipoTransaccion === "venta"}
                        onClick={() => setTipoTransaccion("venta")}
                      />
                    </div>
                  </div>

                  {tipoOperacion === "producto" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <Label text="Producto *" />
                        <select
                          name="producto"
                          value={formProducto.producto}
                          onChange={handleProductoChange}
                          className={fieldClass}
                          required
                        >
                          <option value="">Selecciona un producto...</option>
                          {productosMock.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label text="Cantidad *" />
                        <input
                          type="number"
                          name="cantidad"
                          min={1}
                          placeholder="1"
                          value={formProducto.cantidad}
                          onChange={handleProductoChange}
                          className={fieldClass}
                          required
                        />
                      </div>

                      <div>
                        <Label text="Unidad" />
                        <select
                          name="unidad"
                          value={formProducto.unidad}
                          onChange={handleProductoChange}
                          className={fieldClass}
                        >
                          {unidadesMock.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <Label text="Descripción / Notas" />
                        <textarea
                          name="descripcion"
                          rows={4}
                          value={formProducto.descripcion}
                          onChange={handleProductoChange}
                          className={textareaClass}
                          placeholder="Especificaciones técnicas, calidad, tiempos, condiciones..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <Label text="Servicio *" />
                        <select
                          name="servicio"
                          value={formServicio.servicio}
                          onChange={handleServicioChange}
                          className={fieldClass}
                          required
                        >
                          <option value="">Selecciona un servicio...</option>
                          {serviciosMock.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label text="Descripción del alcance" />
                        <textarea
                          name="descripcion"
                          rows={6}
                          value={formServicio.descripcion}
                          onChange={handleServicioChange}
                          className={textareaClass}
                          placeholder="Detalles sobre tiempos, entregables y condiciones..."
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-6 mt-4 border-t border-border flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="rounded-xl border border-border bg-surface/40 px-5 py-3 text-sm font-semibold text-text hover:bg-surface transition"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
                    >
                      <Send className="w-4 h-4" />
                      Enviar solicitud
                    </button>
                  </div>
                </form>
              </section>
            </div>
    </Layout>
  );
}

/* ---------------- Helpers ---------------- */

function normalizeList(v) {
  if (!v) return "—";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  if (typeof v === "string") return v.trim() ? v : "—";
  return "—";
}

const fieldClass =
  "w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring/40";
const textareaClass =
  "w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring/40 resize-y";

// ✅ Para que <option> se vea bien en dark/light
// (En muchos navegadores el <option> no hereda bien la clase del <select>)
const optionBase = "bg-surface text-text";

function Label({ text }) {
  return (
    <span className="mb-1.5 block text-xs font-bold text-muted uppercase tracking-wider">
      {text}
    </span>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-3">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="text-sm font-semibold text-text truncate">{value}</div>
    </div>
  );
}

function ChipRadio({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm font-semibold border transition",
        active
          ? "bg-accent border-yellow-400/25 text-slate-900 shadow-pro"
          : "bg-surface/40 border-border text-text/80 hover:bg-surface",
      ].join(" ")}
    >
      {label}
    </button>
  );
}