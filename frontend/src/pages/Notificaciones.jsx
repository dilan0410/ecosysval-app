// src/pages/Notificaciones.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../api/axiosClient";
import {
  Search,
  Bell,
  CheckCheck,
  Loader2,
  Trash2,
  Star,
  Edit3,
  X,
  RefreshCw,
} from "lucide-react";

export default function Notificaciones() {
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todas");
  const [marcando, setMarcando] = useState(false);

  // ==========================================
  // Cargar notificaciones al inicio
  // ==========================================
  useEffect(() => {
    cargarNotificaciones();
  }, []);

  async function cargarNotificaciones() {
    setLoading(true);
    try {
      const res = await api.get("/notificaciones?limit=50");
      setNotificaciones(res.data?.notificaciones || []);
      setNoLeidas(res.data?.noLeidas || 0);
      setTotal(res.data?.total || 0);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // Marcar una notificación como leída
  // ==========================================
  async function marcarLeida(id) {
    try {
      await api.patch(`/notificaciones/${id}/leer`);
      // Actualizar el estado local
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marcando como leída:", error);
    }
  }

  // ==========================================
  // Marcar TODAS como leídas
  // ==========================================
  async function marcarTodasLeidas() {
    if (noLeidas === 0) return;

    setMarcando(true);
    try {
      await api.patch("/notificaciones/leer-todas");
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (error) {
      console.error("Error marcando todas:", error);
      alert("Error al marcar todas como leídas");
    } finally {
      setMarcando(false);
    }
  }

  // ==========================================
  // Eliminar una notificación
  // ==========================================
  async function eliminarNotificacion(id, event) {
    event.stopPropagation();
    if (!window.confirm("¿Eliminar esta notificación?")) return;

    try {
      await api.delete(`/notificaciones/${id}`);
      const notif = notificaciones.find((n) => n.id === id);
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
      setTotal((prev) => prev - 1);
      if (notif && !notif.leida) {
        setNoLeidas((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error al eliminar la notificación");
    }
  }

  // ==========================================
  // Click en notificación (marca como leída + navega)
  // ==========================================
  async function handleClickNotif(notif) {
    if (!notif.leida) {
      await marcarLeida(notif.id);
    }
    if (notif.enlace) {
      navigate(notif.enlace);
    }
  }

  // ==========================================
  // Filtrar notificaciones
  // ==========================================
  const notifsFiltradas = useMemo(() => {
    let resultado = [...notificaciones];

    // Filtro por tipo
    if (filtroActivo === "no_leidas") {
      resultado = resultado.filter((n) => !n.leida);
    } else if (filtroActivo === "resenas") {
      resultado = resultado.filter((n) => n.tipo?.startsWith("resena_"));
    }

    // Filtro por búsqueda
    const term = q.trim().toLowerCase();
    if (term) {
      resultado = resultado.filter((n) => {
        const t = (n.titulo || "").toLowerCase();
        const m = (n.mensaje || "").toLowerCase();
        return t.includes(term) || m.includes(term);
      });
    }

    return resultado;
  }, [notificaciones, filtroActivo, q]);

  // ==========================================
  // Formatear tiempo relativo
  // ==========================================
  function formatearTiempo(fecha) {
    const ahora = new Date();
    const f = new Date(fecha);
    const diffMs = ahora - f;
    if (diffMs < 0) return "Hace un momento";

    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 1) return "Hace un momento";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    if (diffDias === 1) return "Ayer";
    if (diffDias < 7) return `Hace ${diffDias} días`;
    if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} sem`;
    if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} meses`;
    return `Hace ${Math.floor(diffDias / 365)} años`;
  }

  return (
    <Layout>
      <div className="mx-auto w-full max-w-7xl">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#ffd166]" />
              Centro de notificaciones
            </div>

            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-white drop-shadow">
              Notificaciones{" "}
              <span className="text-[#ffd166]">del ecosistema</span>
            </h1>

            <p className="mt-2 text-sm text-white/75 max-w-2xl">
              Mantente al día con eventos, novedades y actividad relevante.
            </p>

            <div className="mt-4 h-1 w-56 rounded bg-[#ffd166]" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/90 backdrop-blur">
              No leídas: <strong className="text-white">{noLeidas}</strong>
            </span>

            <button
              type="button"
              onClick={cargarNotificaciones}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-medium text-white transition disabled:opacity-60"
              title="Refrescar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>

            <button
              type="button"
              onClick={marcarTodasLeidas}
              disabled={marcando || noLeidas === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ffd166] px-4 py-2 text-xs font-extrabold text-slate-900 shadow hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {marcando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              Marcar todo como leído
            </button>
          </div>
        </div>

        {/* ===== CONTENEDOR PRINCIPAL ===== */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Top bar: buscador + filtros */}
          <div className="p-5 border-b border-white/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-white/50 absolute left-3 top-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar notificaciones..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 pl-9 pr-3 py-2.5 text-sm text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#ffd166]/40"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip
                text="Todas"
                count={notificaciones.length}
                active={filtroActivo === "todas"}
                onClick={() => setFiltroActivo("todas")}
              />
              <Chip
                text="No leídas"
                count={noLeidas}
                active={filtroActivo === "no_leidas"}
                onClick={() => setFiltroActivo("no_leidas")}
              />
              <Chip
                text="Reseñas"
                count={notificaciones.filter((n) => n.tipo?.startsWith("resena_")).length}
                active={filtroActivo === "resenas"}
                onClick={() => setFiltroActivo("resenas")}
              />
            </div>
          </div>

          {/* Lista */}
          <div className="p-5">
            {loading ? (
              <div className="p-10 text-center text-white/70">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                Cargando notificaciones...
              </div>
            ) : notifsFiltradas.length === 0 ? (
              <div className="p-10 text-center text-white/70">
                <div className="mx-auto mb-3 h-12 w-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white/70" />
                </div>
                {notificaciones.length === 0
                  ? "No tienes notificaciones por el momento."
                  : "No hay notificaciones que coincidan con los filtros."}
              </div>
            ) : (
              <div className="grid gap-3">
                {notifsFiltradas.map((notif) => (
                  <NotificacionCard
                    key={notif.id}
                    notif={notif}
                    onClick={() => handleClickNotif(notif)}
                    onDelete={(e) => eliminarNotificacion(notif.id, e)}
                    formatearTiempo={formatearTiempo}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}

// ==========================================
// Componente: Tarjeta de notificación
// ==========================================
function NotificacionCard({ notif, onClick, onDelete, formatearTiempo }) {
  const unread = !notif.leida;
  const config = configPorTipo(notif.tipo);

  return (
    <article
      onClick={onClick}
      className={[
        "cursor-pointer group",
        "rounded-2xl border p-4 md:p-5 flex items-start justify-between gap-4 transition",
        "bg-black/20 backdrop-blur",
        unread
          ? "border-[#ffd166]/20 ring-1 ring-[#ffd166]/10"
          : "border-white/10",
        "hover:bg-white/5",
      ].join(" ")}
    >
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div
          className={[
            "h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0",
            unread
              ? "border-[#ffd166]/30 bg-[#ffd166]/10"
              : "border-white/10 bg-white/5",
          ].join(" ")}
        >
          <config.Icon
            className={[
              "w-5 h-5",
              unread ? "text-[#ffd166]" : "text-white/70",
            ].join(" ")}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${config.badge}`}
            >
              {config.label}
            </span>

            {unread && (
              <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                Nuevo
              </span>
            )}
          </div>

          <p className="mt-2 font-extrabold text-white text-sm">
            {notif.titulo}
          </p>

          <p className="mt-1 text-xs text-white/75 leading-relaxed">
            {notif.mensaje}
          </p>

          {notif.enlace && (
            <p className="mt-2 text-[11px] text-[#ffd166] opacity-70 group-hover:opacity-100 transition">
              Click para ver →
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className="text-[11px] text-white/50 whitespace-nowrap">
          {formatearTiempo(notif.createdAt)}
        </p>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition"
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}

// ==========================================
// Chip de filtro con contador
// ==========================================
function Chip({ text, count = 0, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition",
        active
          ? "border-[#ffd166]/30 bg-[#ffd166]/15 text-[#ffd166]"
          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
      ].join(" ")}
    >
      {text}
      {count > 0 && (
        <span
          className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold ${
            active ? "bg-[#ffd166]/30 text-[#ffd166]" : "bg-white/10 text-white/70"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ==========================================
// Configuración visual por tipo de notificación
// ==========================================
function configPorTipo(tipo) {
  switch (tipo) {
    case "resena_nueva":
      return {
        Icon: Star,
        label: "Nueva reseña",
        badge: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
      };
    case "resena_editada":
      return {
        Icon: Edit3,
        label: "Reseña editada",
        badge: "border-sky-400/20 bg-sky-500/10 text-sky-200",
      };
    case "resena_eliminada":
      return {
        Icon: X,
        label: "Reseña eliminada",
        badge: "border-red-400/20 bg-red-500/10 text-red-200",
      };
    default:
      return {
        Icon: Bell,
        label: tipo || "Notificación",
        badge: "border-white/10 bg-white/5 text-white/80",
      };
  }
}