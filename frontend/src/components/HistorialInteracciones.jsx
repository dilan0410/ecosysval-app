// frontend/src/components/HistorialInteracciones.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axiosClient";
import { useTheme } from "./ThemeProvider";
import {
  MessageSquare,
  Star,
  Bell,
  Search,
  Calendar,
  ArrowUpRight,
  Loader2,
  Handshake,
  Clock,
  Filter,
} from "lucide-react";

function formatearTiempo(fecha) {
  if (!fecha) return "";
  const ahora = new Date();
  const f = new Date(fecha);
  const diffMs = ahora - f;
  if (diffMs < 0) return "Hace un momento";
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);
  const diffDias = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHoras < 24) return `Hace ${diffHoras} h`;
  if (diffDias === 1) return "Ayer";
  if (diffDias < 7) return `Hace ${diffDias} días`;
  return f.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HistorialInteracciones() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  useEffect(() => {
    cargarHistorial();
  }, []);

  async function cargarHistorial() {
    setLoading(true);
    try {
      // Consultar chats y notificaciones en paralelo
      const [convRes, notifRes] = await Promise.allSettled([
        api.get("/mensajes/conversaciones"),
        api.get("/notificaciones?limit=50"),
      ]);

      const eventos = [];

      // 1. Agregar conversaciones iniciadas o activas
      if (convRes.status === "fulfilled" && Array.isArray(convRes.value.data)) {
        convRes.value.data.forEach((c) => {
          const socioNombre = c.otroUsuario?.name || "Socio comercial";
          eventos.push({
            id: `conv-${c.id}`,
            tipo: "conversacion",
            titulo: `Interacción con ${socioNombre}`,
            descripcion: c.ultimoMensaje
              ? `Último mensaje: "${c.ultimoMensaje}"`
              : "Conversación comercial abierta.",
            fecha: c.ultimoMensajeAt || c.createdAt,
            enlace: `/mensajes?c=${c.id}`,
            socio: c.otroUsuario,
          });
        });
      }

      // 2. Agregar notificaciones/eventos de sistema y reseñas
      if (
        notifRes.status === "fulfilled" &&
        Array.isArray(notifRes.value.data?.notificaciones)
      ) {
        notifRes.value.data.notificaciones.forEach((n) => {
          const esResena = n.tipo?.startsWith("resena");
          eventos.push({
            id: `notif-${n.id}`,
            tipo: esResena ? "resena" : "sistema",
            titulo: n.titulo,
            descripcion: n.mensaje,
            fecha: n.createdAt,
            enlace: n.enlace,
          });
        });
      }

      // Ordenar por fecha cronológica (más reciente primero)
      eventos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setHistorial(eventos);
    } catch (err) {
      console.error("Error cargando historial de interacciones:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filtrado por tipo y búsqueda de texto
  const historialFiltrado = useMemo(() => {
    const term = search.trim().toLowerCase();

    return historial.filter((item) => {
      const coincideTipo =
        filtroTipo === "todos" ? true : item.tipo === filtroTipo;

      const coincideSearch =
        !term ||
        item.titulo.toLowerCase().includes(term) ||
        item.descripcion.toLowerCase().includes(term);

      return coincideTipo && coincideSearch;
    });
  }, [historial, search, filtroTipo]);

  return (
    <div className="space-y-6">
      {/* Header del módulo dentro de la pestaña */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl border border-border bg-surface/60 backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-3 py-1 text-xs text-muted">
            <Clock className="w-3.5 h-3.5 text-accent" />
            Trazabilidad Comercial
          </div>
          <h2 className="text-xl font-extrabold text-text mt-2">
            Historial de Interacciones
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Registro cronológico de tus conversaciones, ofertas y calificaciones en Ecosysval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium bg-surface/80 px-3 py-1.5 rounded-full border border-border">
            Total: <strong className="text-text">{historialFiltrado.length}</strong>
          </span>
        </div>
      </div>

      {/* Buscador + Filtros de Categoría */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por socio, asunto o evento..."
            className="w-full rounded-2xl border border-border bg-surface/60 pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Todos"
            active={filtroTipo === "todos"}
            onClick={() => setFiltroTipo("todos")}
            theme={theme}
          />
          <FilterChip
            label="Conversaciones"
            active={filtroTipo === "conversacion"}
            onClick={() => setFiltroTipo("conversacion")}
            theme={theme}
          />
          <FilterChip
            label="Reseñas"
            active={filtroTipo === "resena"}
            onClick={() => setFiltroTipo("resena")}
            theme={theme}
          />
          <FilterChip
            label="Sistema"
            active={filtroTipo === "sistema"}
            onClick={() => setFiltroTipo("sistema")}
            theme={theme}
          />
        </div>
      </div>

      {/* TIMELINE DE INTERACCIONES */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm font-semibold text-text">Cargando historial...</p>
        </div>
      ) : historialFiltrado.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-border bg-surface/40 text-muted">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl border border-border bg-surface/60 flex items-center justify-center">
            <Handshake className="w-6 h-6 text-muted" />
          </div>
          <p className="text-sm font-bold text-text">No hay interacciones registradas</p>
          <p className="text-xs text-muted mt-1">
            {search ? "No coinciden eventos con tu búsqueda." : "Conecta con empresas en el mapa para iniciar tu historial."}
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
          {historialFiltrado.map((item) => {
            const config = getConfigPorTipo(item.tipo);
            const Icon = config.icon;

            return (
              <div key={item.id} className="relative group">
                {/* Punto en la línea de tiempo */}
                <div
                  className={`absolute -left-6 top-1.5 h-5 w-5 rounded-full border border-border flex items-center justify-center ${config.bgColor}`}
                >
                  <Icon className={`w-3 h-3 ${config.textColor}`} />
                </div>

                {/* Tarjeta del evento */}
                <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-4 hover:border-accent/40 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${config.badge}`}>
                          {config.label}
                        </span>
                        <span className="text-[11px] text-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatearTiempo(item.fecha)}
                        </span>
                      </div>

                      <h4 className="mt-1.5 text-sm font-extrabold text-text truncate">
                        {item.titulo}
                      </h4>

                      <p className="mt-1 text-xs text-muted/90 leading-relaxed line-clamp-2">
                        {item.descripcion}
                      </p>
                    </div>

                    {item.enlace && (
                      <button
                        onClick={() => navigate(item.enlace)}
                        className="shrink-0 p-2 rounded-xl border border-border bg-surface/50 hover:bg-accent hover:text-slate-900 transition text-muted"
                        title="Ver detalle"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helpers de Estilos por Tipo de Evento
function getConfigPorTipo(tipo) {
  switch (tipo) {
    case "conversacion":
      return {
        icon: MessageSquare,
        label: "Mensajería",
        badge: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25",
        bgColor: "bg-emerald-500/20",
        textColor: "text-emerald-400",
      };
    case "resena":
      return {
        icon: Star,
        label: "Reseña",
        badge: "bg-amber-500/10 text-amber-300 border border-amber-500/25",
        bgColor: "bg-amber-500/20",
        textColor: "text-amber-400",
      };
    default:
      return {
        icon: Bell,
        label: "Sistema",
        badge: "bg-purple-500/10 text-purple-300 border border-purple-500/25",
        bgColor: "bg-purple-500/20",
        textColor: "text-purple-400",
      };
  }
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
        active
          ? "bg-accent text-slate-900 border-accent"
          : "bg-surface/50 text-text border-border hover:bg-surface"
      }`}
    >
      {label}
    </button>
  );
}