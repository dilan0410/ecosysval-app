// frontend/src/components/ResenasSection.jsx
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Building2,
  Calendar,
  Star,
} from "lucide-react";
import StarRating from "./StarRating";
import { SkeletonEstadisticas, SkeletonResenaList } from "./SkeletonResena";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper: obtiene el userId del token JWT (payload)
function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

// Helper: formatea la fecha en "hace X días"
function formatearFecha(fecha) {
  const ahora = new Date();
  const f = new Date(fecha);
  const diffMs = ahora - f;

  // Si es del futuro por diferencia de reloj, asumimos "Hace un momento"
  if (diffMs < 0) return "Hace un momento";

  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHoras < 24) return `Hace ${diffHoras} h`;
  if (diffDias === 1) return "Ayer";
  if (diffDias < 7) return `Hace ${diffDias} días`;
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semana(s)`;
  if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} mes(es)`;
  return `Hace ${Math.floor(diffDias / 365)} año(s)`;
}

export default function ResenasSection({ empresaId, esOwner = false }) {
  const [data, setData] = useState({
    estadisticas: { total: 0, promedio: 0, distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    resenas: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados del formulario nuevo
  const [nuevaRating, setNuevaRating] = useState(0);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Estado de edición
  const [editandoId, setEditandoId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComentario, setEditComentario] = useState("");
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  const currentUserId = getUserIdFromToken();
  const isLoggedIn = !!localStorage.getItem("token");

  // ¿El usuario actual ya tiene una reseña en esta empresa?
  const miResena = data.resenas.find((r) => r.userId === currentUserId);

  useEffect(() => {
    if (empresaId) cargarResenas();
    // eslint-disable-next-line
  }, [empresaId]);

  async function cargarResenas() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/resenas/empresa/${empresaId}`);
      if (!res.ok) throw new Error("Error al cargar reseñas");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar las reseñas.");
    } finally {
      setLoading(false);
    }
  }

  async function enviarResena(e) {
    e.preventDefault();
    if (nuevaRating < 1) {
      alert("Selecciona una calificación de 1 a 5 estrellas.");
      return;
    }
    if (nuevoComentario && nuevoComentario.trim().length > 0 && nuevoComentario.trim().length < 10) {
      alert("El comentario debe tener al menos 10 caracteres (o dejarlo vacío).");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/resenas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          empresaId,
          rating: nuevaRating,
          comentario: nuevoComentario.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "No se pudo publicar la reseña.");
        return;
      }
      // Éxito
      setNuevaRating(0);
      setNuevoComentario("");
      await cargarResenas();
    } catch (e) {
      console.error(e);
      alert("Error de conexión al publicar reseña.");
    } finally {
      setEnviando(false);
    }
  }

  function iniciarEdicion(resena) {
    setEditandoId(resena.id);
    setEditRating(resena.rating);
    setEditComentario(resena.comentario || "");
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setEditRating(0);
    setEditComentario("");
  }

  async function guardarEdicion(id) {
    if (editRating < 1) {
      alert("Selecciona una calificación válida.");
      return;
    }
    if (editComentario && editComentario.trim().length > 0 && editComentario.trim().length < 10) {
      alert("El comentario debe tener al menos 10 caracteres (o dejarlo vacío).");
      return;
    }

    setGuardandoEdit(true);
    try {
      const res = await fetch(`${API_URL}/resenas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          rating: editRating,
          comentario: editComentario.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "No se pudo actualizar la reseña.");
        return;
      }
      cancelarEdicion();
      await cargarResenas();
    } catch (e) {
      console.error(e);
      alert("Error de conexión al actualizar.");
    } finally {
      setGuardandoEdit(false);
    }
  }

  async function eliminarResena(id) {
    if (!window.confirm("¿Seguro que quieres eliminar tu reseña?")) return;

    try {
      const res = await fetch(`${API_URL}/resenas/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "No se pudo eliminar.");
        return;
      }
      await cargarResenas();
    } catch (e) {
      console.error(e);
      alert("Error de conexión al eliminar.");
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  const { estadisticas, resenas } = data;
  const { total, promedio, distribucion } = estadisticas;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl p-6 md:p-8 shadow-2xl space-y-8">
      {/* ===== TÍTULO ===== */}
      <div className="flex items-center gap-3">
        <div className="text-yellow-400">
          <MessageSquare />
        </div>
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
          Reseñas y calificaciones
        </h2>
      </div>

      {loading ? (
        <>
          <SkeletonEstadisticas />
          <div className="mt-8">
            <SkeletonResenaList count={3} />
          </div>
        </>
      ) : (
        <>
          {/* ===== ESTADÍSTICAS ===== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#0a1a30]/60 rounded-2xl p-6 border border-white/5">
            {/* Promedio grande */}
            <div className="text-center md:border-r md:border-white/10 md:pr-6">
              <div className="text-5xl font-extrabold text-yellow-400 mb-2">
                {promedio.toFixed(1)}
              </div>
              <StarRating value={Math.round(promedio)} size={24} />
              <p className="text-white/60 text-sm mt-2">
                {total} {total === 1 ? "reseña" : "reseñas"}
              </p>
            </div>

            {/* Distribución (barras) */}
            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((estrella) => {
                const cantidad = distribucion[estrella] || 0;
                const porcentaje = total > 0 ? (cantidad / total) * 100 : 0;
                return (
                    <div key={estrella} className="flex items-center gap-3">
                    <span className="text-white/70 text-sm w-4 text-right">
                        {estrella}
                    </span>
                    <Star
                        size={14}
                        className="text-yellow-400 fill-yellow-400 flex-shrink-0"
                    />
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${porcentaje}%` }}
                        />
                    </div>
                    <span className="text-white/70 text-sm w-16 text-right">
                        {cantidad} ({porcentaje.toFixed(0)}%)
                    </span>
                    </div>
                );
                })}
            </div>
          </div>

          {/* ===== FORMULARIO ===== */}
          {esOwner ? (
            <div className="rounded-2xl bg-blue-500/10 border border-blue-500/30 p-4 text-blue-200 text-center text-sm">
              Esta es tu empresa. No puedes calificarte a ti mismo.
            </div>
          ) : !isLoggedIn ? (
            <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/30 p-4 text-yellow-200 text-center text-sm">
              Inicia sesión para escribir una reseña.
            </div>
          ) : miResena ? (
            <div className="rounded-2xl bg-green-500/10 border border-green-500/30 p-4 text-green-200 text-center text-sm">
              Ya publicaste una reseña. Puedes editarla o eliminarla abajo.
            </div>
          ) : (
            <form
              onSubmit={enviarResena}
              className="rounded-2xl bg-[#0a1a30]/60 border border-white/10 p-6 space-y-4"
            >
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Pencil className="w-4 h-4 text-yellow-400" />
                Escribe tu reseña
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Tu calificación *
                </label>
                <StarRating
                  value={nuevaRating}
                  onChange={setNuevaRating}
                  size={32}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Comentario (opcional)
                </label>
                <textarea
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Comparte tu experiencia con esta empresa..."
                  className="w-full bg-[#1e293b] border border-slate-600 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-400 transition resize-none"
                />
                <p className="text-white/40 text-xs mt-1">
                  {nuevoComentario.length}/1000 · Mínimo 10 caracteres si escribes comentario
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={enviando || nuevaRating < 1}
                  className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-slate-900 px-5 py-2 rounded-xl inline-flex items-center gap-2 font-bold transition"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publicar reseña
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200">
              {error}
            </div>
          )}

          {/* ===== LISTA DE RESEÑAS ===== */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-yellow-400" />
              Todas las reseñas ({total})
            </h3>

            {resenas.length === 0 ? (
              <div className="text-center py-8 text-white/50 italic">
                Aún no hay reseñas. ¡Sé el primero en calificar!
              </div>
            ) : (
              <div className="space-y-4">
                {resenas.map((r) => {
                  const esMia = r.userId === currentUserId;
                  const enEdicion = editandoId === r.id;

                  return (
                    <div
                      key={r.id}
                      className="rounded-2xl bg-[#0a1a30]/60 border border-white/10 p-4 hover:border-white/20 transition"
                    >
                      {enEdicion ? (
                        // ===== MODO EDICIÓN =====
                        <div className="space-y-3">
                          <StarRating
                            value={editRating}
                            onChange={setEditRating}
                            size={28}
                          />
                          <textarea
                            value={editComentario}
                            onChange={(e) => setEditComentario(e.target.value)}
                            rows={3}
                            maxLength={1000}
                            className="w-full bg-[#1e293b] border border-slate-600 rounded-xl p-2.5 text-white focus:outline-none focus:border-yellow-400 transition resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={cancelarEdicion}
                              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium text-white transition inline-flex items-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Cancelar
                            </button>
                            <button
                              onClick={() => guardarEdicion(r.id)}
                              disabled={guardandoEdit}
                              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-slate-900 rounded-xl text-sm font-bold transition inline-flex items-center gap-1"
                            >
                              {guardandoEdit ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        // ===== MODO LECTURA =====
                        <>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3">
                              {/* Logo de la empresa del autor */}
                              {r.autor?.empresa?.logo ? (
                                <img
                                  src={r.autor.empresa.logo}
                                  alt=""
                                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-white/60" />
                                </div>
                              )}
                              <div>
                                <p className="text-white font-semibold text-sm">
                                  {r.autor?.empresa?.razonSocial || r.autor?.nombre || "Usuario"}
                                </p>
                                <StarRating value={r.rating} size={14} />
                              </div>
                            </div>
                            <div className="text-white/50 text-xs flex items-center gap-1 whitespace-nowrap">
                              <Calendar className="w-3 h-3" />
                              {formatearFecha(r.createdAt)}
                            </div>
                          </div>

                          {r.comentario && (
                            <p className="text-white/80 text-sm leading-relaxed mt-2">
                              {r.comentario}
                            </p>
                          )}

                          {esMia && (
                            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-white/10">
                              <button
                                onClick={() => iniciarEdicion(r)}
                                className="text-yellow-400 hover:text-yellow-300 text-xs inline-flex items-center gap-1 transition"
                              >
                                <Pencil className="w-3 h-3" />
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarResena(r.id)}
                                className="text-red-400 hover:text-red-300 text-xs inline-flex items-center gap-1 transition"
                              >
                                <Trash2 className="w-3 h-3" />
                                Eliminar
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}