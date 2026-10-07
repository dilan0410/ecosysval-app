// src/pages/Recomendaciones.jsx
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { useTheme } from "../components/ThemeProvider";
import {
  Sparkles,
  Building2,
  MapPin,
  Briefcase,
  Star,
  StarOff,
  MessageSquare,
  ArrowUpRight,
  Filter,
  Search,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axiosClient";
import { toast } from "sonner";

const OPCIONES_ODS = [
  "Fin de la Pobreza",
  "Hambre Cero",
  "Salud y Bienestar",
  "Educación y Calidad",
  "Igualdad de Género",
  "Agua Limpia y Saneamiento",
  "Energía asequible y no Contaminante",
  "Trabajo Decente y Crecimiento Económico",
  "Industria Innovación e Infraestructura",
  "Reducción de las Desigualdades",
  "Ciudades y Comunidades Sostenibles",
  "Producción y consumo responsable",
  "Acción por el Clima",
  "Vida Submarina",
  "Vida de Ecosistemas Terrestres",
  "Paz, Justicia e Instituciones Sólidas",
  "Alianzas para Lograr los Objetivos",
];

function badgeColor({ theme, color }) {
  const isLight = theme === "light";
  const base = "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold";
  const map = {
    blue: isLight
      ? "bg-blue-500/10 text-blue-700 border-blue-400/25"
      : "bg-blue-500/15 text-blue-200 border-blue-300/25",
    amber: isLight
      ? "bg-amber-500/10 text-amber-800 border-amber-400/25"
      : "bg-amber-500/15 text-amber-200 border-amber-300/25",
    emerald: isLight
      ? "bg-emerald-500/10 text-emerald-800 border-emerald-400/25"
      : "bg-emerald-500/15 text-emerald-200 border-emerald-300/25",
    red: isLight
      ? "bg-red-500/10 text-red-800 border-red-400/25"
      : "bg-red-500/15 text-red-200 border-red-300/25",
    slate: isLight
      ? "bg-slate-500/10 text-slate-800 border-slate-400/25"
      : "bg-slate-500/15 text-slate-200 border-slate-300/25",
  };
  return `${base} ${map[color] || map.slate}`;
}

function badgeByType(type, theme) {
  switch (type) {
    case "Socio":
      return badgeColor({ theme, color: "blue" });
    case "Producto":
      return badgeColor({ theme, color: "amber" });
    case "Acción":
      return badgeColor({ theme, color: "emerald" });
    default:
      return badgeColor({ theme, color: "slate" });
  }
}

function pillByPriority(p, theme) {
  switch (p) {
    case "Alta":
      return badgeColor({ theme, color: "red" });
    case "Media":
      return badgeColor({ theme, color: "amber" });
    case "Baja":
      return badgeColor({ theme, color: "slate" });
    default:
      return badgeColor({ theme, color: "slate" });
  }
}

export default function Recomendaciones() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [prioridad, setPrioridad] = useState("Todas");
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  const [favoritos, setFavoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fav_recomendaciones") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/empresas/explorar/buscar?limit=20&activo=true');
        const empresasReales = res.data.empresas || res.data || [];
        
        const itemsTransformados = empresasReales
          .filter(e => e.activo !== false)
          .map((empresa, index) => ({
            id: empresa.id,
            type: "Socio",
            prioridad: index < 5 ? "Alta" : index < 15 ? "Media" : "Baja",
            titulo: empresa.razonSocial,
            subtitulo: `${empresa.paquete || 'Básico'} • ${empresa.sectorScian || 'Sector no especificado'}`,
            ubicacion: `${empresa.estado || 'México'} ${empresa.ubicacion ? '• ' + empresa.ubicacion : ''}`,
            razon: `Coincide con tu sector SCIAN ${empresa.scianCodigo || ''}. ${empresa.empleados ? `${empresa.empleados} empleados.` : ''}`,
            tags: [empresa.ambito, empresa.sectorScian].filter(Boolean),
            score: Math.floor(Math.random() * 30) + 70,
            empresaData: empresa,
          }));
        
        setItems(itemsTransformados);
      } catch (error) {
        console.error('Error cargando recomendaciones:', error);
        toast.error('No se pudieron cargar las recomendaciones');
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem("fav_recomendaciones", JSON.stringify(favoritos));
  }, [favoritos]);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items
      .filter((x) => (tipo === "Todos" ? true : x.type === tipo))
      .filter((x) => (prioridad === "Todas" ? true : x.prioridad === prioridad))
      .filter((x) => (soloFavoritos ? favoritos.includes(x.id) : true))
      .filter((x) => {
        if (!term) return true;
        const blob = `${x.titulo} ${x.subtitulo} ${x.ubicacion} ${x.razon} ${(x.tags || []).join(" ")}`.toLowerCase();
        return blob.includes(term);
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [items, q, tipo, prioridad, soloFavoritos, favoritos]);

  const totalAlta = items.filter((x) => x.prioridad === "Alta").length;
  const totalSocios = items.filter((x) => x.type === "Socio").length;

  function toggleFav(id) {
    setFavoritos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  }

  function accionPrincipal(item) {
    if (item.type === "Socio") return "Ver perfil";
    if (item.type === "Producto") return "Ver tendencia";
    return "Ver sugerencia";
  }

  function handleOpen(item) {
    if (item.type === "Socio") {
      navigate(`/empresa/${item.id}`);
      return;
    }
    if (item.type === "Producto") {
      navigate("/tendencias");
      return;
    }
    navigate("/alianzas");
  }

  function handleMessage(item) {
    navigate("/mensajes", { state: { draft: `Hola, vi esta recomendación: ${item.titulo}` } });
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Motor de recomendaciones
              </div>
              <h1 className="mt-1 text-text text-2xl md:text-3xl font-extrabold">
                Recomendaciones
              </h1>
              <p className="mt-2 text-muted text-sm max-w-2xl">
                Sugerencias basadas en actividad del ecosistema, ubicación, sector y demanda detectada.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <KpiCard theme={theme} label="Alta prioridad" value={totalAlta} />
              <KpiCard theme={theme} label="Socios sugeridos" value={totalSocios} />
            </div>
          </div>
          {/* Filters row */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto] gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted absolute left-4 top-3.5" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por empresa, producto, razón, etiqueta..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-surface/60 text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <SelectPill theme={theme} label="Tipo" value={tipo} onChange={setTipo} options={["Todos", "Socio", "Producto", "Acción"]} />
            <SelectPill theme={theme} label="Prioridad" value={prioridad} onChange={setPrioridad} options={["Todas", "Alta", "Media", "Baja"]} />
            <button
              type="button"
              onClick={() => setSoloFavoritos((s) => !s)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border transition ${
                soloFavoritos
                  ? "bg-accent text-slate-900 border-border shadow-pro"
                  : "bg-surface/60 text-text border-border hover:bg-surface"
              }`}
              title="Filtrar favoritos"
            >
              <Filter className="w-4 h-4" />
              {soloFavoritos ? "Favoritos" : "Todos"}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted" />
            <p className="mt-3 text-muted">Cargando recomendaciones...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-12 text-center">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-text font-semibold">No hay recomendaciones con estos filtros</p>
            <p className="text-muted text-sm mt-1">Prueba cambiando el tipo o la búsqueda.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtrados.map((item) => {
              const isFav = favoritos.includes(item.id);
              return (
                <RecomCard
                  theme={theme}
                  key={item.id}
                  item={item}
                  isFav={isFav}
                  onFav={() => toggleFav(item.id)}
                  onOpen={() => handleOpen(item)}
                  onMsg={() => handleMessage(item)}
                  primaryLabel={accionPrincipal(item)}
                />
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

function KpiCard({ theme, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/50 px-4 py-3 text-center shadow-pro">
      <div className="text-2xl font-extrabold text-text">{value}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  );
}

function SelectPill({ theme, label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-border bg-surface/60 px-3 py-2.5 shadow-pro">
      <span className="text-[11px] text-muted font-bold uppercase tracking-wider">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-text outline-none text-sm flex-1"
      >
        {options.map((o) => (
          <option
            key={o}
            value={o}
            className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1630] text-white"}
          >
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function RecomCard({ theme, item, isFav, onFav, onOpen, onMsg, primaryLabel }) {
  return (
    <article className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5 flex flex-col text-text relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={badgeByType(item.type, theme)}>{item.type}</span>
            <span className={pillByPriority(item.prioridad, theme)}>{item.prioridad}</span>
            <span className="inline-flex items-center rounded-full border border-border bg-surface/50 px-3 py-1 text-[11px] text-muted">
              Score: <strong className="ml-1 text-text">{item.score ?? "—"}</strong>
            </span>
          </div>
          <h3 className="mt-3 text-text font-extrabold text-lg truncate">{item.titulo}</h3>
          <p className="text-muted text-sm mt-1 truncate">{item.subtitulo}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {item.ubicacion || "—"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onFav}
          className="h-10 w-10 rounded-2xl border border-border bg-surface/60 hover:bg-surface transition flex items-center justify-center"
          title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          {isFav ? (
            <Star className="w-5 h-5 text-accent" />
          ) : (
            <StarOff className="w-5 h-5 text-muted" />
          )}
        </button>
      </div>
      <div className="mt-4 rounded-2xl border border-border bg-surface/50 p-4">
        <div className="text-[11px] font-bold text-accent uppercase tracking-wider">Por qué te lo recomienda</div>
        <p className="mt-2 text-sm text-text/90 leading-relaxed">{item.razon}</p>
      </div>
      {(item.tags?.length ?? 0) > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.slice(0, 6).map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full border border-border bg-surface/50 px-3 py-1 text-[11px] text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onMsg}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface/60 px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface transition"
        >
          <MessageSquare className="w-4 h-4" />
          Mensaje
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
        >
          {item.type === "Socio" ? <Building2 className="w-4 h-4" /> : item.type === "Producto" ? <Briefcase className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {primaryLabel}
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}