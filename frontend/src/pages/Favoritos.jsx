// src/pages/Favoritos.jsx
/**
 * FAVORITOS (Ecosysval)
 * -------------------------------------------------------
 * ✅ Objetivo:
 * - Biblioteca personal de elementos guardados por el usuario (MVP pro con localStorage).
 * - Filtros: búsqueda, tipo, orden.
 * - Acciones: abrir item (navigate), eliminar item, limpiar todo.
 *
 * ✅ Importante (THEME + FONDO):
 * - ❌ NO se usa backgroundImage en la página (NO fondo.png por encima).
 * - ✅ El fondo vive globalmente por tema (claro/oscuro) en CSS.
 * - ✅ Aquí solo agregamos un overlay "glow" suave para mejorar contraste.
 *
 * ✅ localStorage:
 * - Guarda items en: localStorage["favoritos_ecosysval"]
 * - Estructura recomendada por item:
 *   {
 *     id: string|number,
 *     type: "Socio"|"Oportunidad"|"Recomendación"|"Producto"|"Mensaje"|"Otro",
 *     title: string,
 *     subtitle?: string,
 *     tags?: string[],
 *     sourceRoute?: string,    // a dónde navegar al abrir
 *     sourcePayload?: any,     // state opcional para navigate
 *     createdAt?: string,      // ISO
 *   }
 *
 * ✅ Migración:
 * - También migra/lee fav_recomendaciones (ids) si existe,
 *   creando tarjetas demo tipo "Recomendación" (para no perder favoritos antiguos).
 */

import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { useTheme } from "../components/ThemeProvider";

import {
  Star,
  Trash2,
  Search,
  Filter,
  ArrowUpRight,
  Building2,
  Sparkles,
  ShoppingBag,
  Briefcase,
  Mail,
  MessageSquare,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Keys de localStorage
const LS_KEY = "favoritos_ecosysval";
const LS_RECOM_IDS = "fav_recomendaciones";

export default function Favoritos() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Estado principal
  const [items, setItems] = useState([]);

  // Filtros
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [orden, setOrden] = useState("Recientes");

  /**
   * Carga inicial:
   * 1) Lee favoritos nuevos (LS_KEY).
   * 2) Migra fav_recomendaciones (IDs) a items tipo "Recomendación" si aún no existen.
   */
  useEffect(() => {
    // 1) Carga favoritos “nuevos”
    let fav = [];
    try {
      fav = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      if (!Array.isArray(fav)) fav = [];
    } catch {
      fav = [];
    }

    // 2) Lee ids antiguos de recomendaciones
    let recomIds = [];
    try {
      recomIds = JSON.parse(localStorage.getItem(LS_RECOM_IDS) || "[]");
      if (!Array.isArray(recomIds)) recomIds = [];
    } catch {
      recomIds = [];
    }

    // 3) Migra ids (solo si no existen como items ya)
    const yaEnFav = new Set(fav.map((x) => `${x.type}:${x.id}`));
    const migrados = recomIds
      .filter((id) => !yaEnFav.has(`Recomendación:${id}`))
      .map((id) => ({
        id,
        type: "Recomendación",
        title: `Recomendación guardada #${id}`,
        subtitle: "Guardada desde el motor de recomendaciones",
        tags: ["Recomendaciones", "AI"],
        sourceRoute: "/recomendaciones",
        createdAt: new Date().toISOString(),
      }));

    const merged = [...migrados, ...fav];
    setItems(merged);

    // Persistimos migración (opcional)
    if (migrados.length) {
      localStorage.setItem(LS_KEY, JSON.stringify(merged));
    }
  }, []);

  /** Tipos disponibles para el select (dinámico según items guardados) */
  const tiposDisponibles = useMemo(() => {
    const set = new Set(items.map((i) => i.type));
    return ["Todos", ...Array.from(set)];
  }, [items]);

  /** Filtrado + ordenamiento */
  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();

    let data = items
      .filter((x) => (tipo === "Todos" ? true : x.type === tipo))
      .filter((x) => {
        if (!term) return true;
        const blob = `${x.title} ${x.subtitle || ""} ${(x.tags || []).join(" ")}`.toLowerCase();
        return blob.includes(term);
      });

    if (orden === "Recientes") {
      data = data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (orden === "Antiguos") {
      data = data.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (orden === "A-Z") {
      data = data.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return data;
  }, [items, q, tipo, orden]);

  const total = items.length;

  /** Persist helper: actualiza estado y localStorage */
  function persist(next) {
    setItems(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }

  /**
   * Elimina un item por (type,id).
   * Si es "Recomendación", también lo quita del LS_RECOM_IDS para mantener consistencia.
   */
  function removeItem(type, id) {
    const next = items.filter((x) => !(x.type === type && x.id === id));
    persist(next);

    if (type === "Recomendación") {
      try {
        const ids = JSON.parse(localStorage.getItem(LS_RECOM_IDS) || "[]");
        const nextIds = Array.isArray(ids) ? ids.filter((x) => x !== id) : [];
        localStorage.setItem(LS_RECOM_IDS, JSON.stringify(nextIds));
      } catch {}
    }
  }

  /** Limpia todos los favoritos */
  function clearAll() {
    if (!window.confirm("¿Eliminar todos tus favoritos?")) return;
    persist([]);
    localStorage.setItem(LS_RECOM_IDS, JSON.stringify([]));
  }

  /** Abre el item navegando a su ruta (si existe) */
  function openItem(item) {
    if (item?.sourceRoute) {
      navigate(item.sourceRoute, { state: item.sourcePayload || {} });
    } else {
      alert(`Abrir: ${item.title}`);
    }
  }

  return (
    <Layout>
            <div className="mx-auto max-w-7xl space-y-6">
              {/* Header */}
              <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-6 text-text">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">
                      <Star className="w-4 h-4" />
                      Biblioteca personal
                    </div>
                    <h1 className="mt-1 text-2xl md:text-3xl font-extrabold">Favoritos</h1>
                    <p className="mt-2 text-muted text-sm max-w-2xl">
                      Aquí encuentras empresas, oportunidades y recomendaciones que guardaste para revisar después.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-border bg-surface/50 px-4 py-3 text-center shadow-pro">
                      <div className="text-2xl font-extrabold">{total}</div>
                      <div className="text-[11px] text-muted">guardados</div>
                    </div>

                    <button
                      type="button"
                      onClick={clearAll}
                      className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm font-semibold text-text hover:bg-surface transition shadow-pro"
                      title="Eliminar todos"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-muted absolute left-4 top-3.5" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar por nombre, tags, descripción..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-surface/60 text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  <SelectPill
                    theme={theme}
                    label="Tipo"
                    value={tipo}
                    onChange={setTipo}
                    options={tiposDisponibles}
                    icon={<Filter className="w-4 h-4 text-muted" />}
                  />

                  <SelectPill
                    theme={theme}
                    label="Orden"
                    value={orden}
                    onChange={setOrden}
                    options={["Recientes", "Antiguos", "A-Z"]}
                  />
                </div>
              </div>

              {/* List */}
              {filtrados.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filtrados.map((item) => (
                    <FavCard
                      key={`${item.type}-${item.id}`}
                      item={item}
                      theme={theme}
                      onOpen={() => openItem(item)}
                      onRemove={() => removeItem(item.type, item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
    </Layout>
  );
}

/* -------------------- UI -------------------- */

/** Estado vacío */
function EmptyState() {
  return (
    <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-12 text-center text-text">
      <div className="text-4xl mb-3">⭐</div>
      <p className="font-semibold">No tienes favoritos con estos filtros</p>
      <p className="text-muted text-sm mt-1">
        Guarda elementos desde Recomendaciones, Tendencias u Oportunidades.
      </p>
    </div>
  );
}

/**
 * Select estilo pill (theme-aware):
 * - Options con fondo correcto para evitar texto ilegible en dark.
 */
function SelectPill({ theme, label, value, onChange, options, icon }) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-border bg-surface/60 px-3 py-2.5 shadow-pro">
      {icon ? icon : null}
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

/** Tarjeta de favorito */
function FavCard({ item, theme, onOpen, onRemove }) {
  const icon = iconByType(item.type);
  const badge = badgeByType(item.type, theme);

  const createdLabel = item.createdAt
    ? new Date(item.createdAt).toLocaleString("es-CO", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "—";

  return (
    <article className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5 flex flex-col text-text">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={badge}>
              {icon}
              {item.type}
            </span>

            <span className="inline-flex items-center rounded-full border border-border bg-surface/40 px-3 py-1 text-[11px] text-muted">
              {createdLabel}
            </span>
          </div>

          <h3 className="mt-3 font-extrabold text-lg truncate">{item.title}</h3>
          {item.subtitle && <p className="text-muted text-sm mt-1 line-clamp-2">{item.subtitle}</p>}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="h-10 w-10 rounded-2xl border border-border bg-surface/60 hover:bg-surface transition flex items-center justify-center"
          title="Quitar de favoritos"
        >
          <Trash2 className="w-5 h-5 text-red-400" />
        </button>
      </div>

      {(item.tags?.length ?? 0) > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.slice(0, 7).map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full border border-border bg-surface/40 px-3 py-1 text-[11px] text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
        >
          Abrir
          <ArrowUpRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => alert("Próximo: compartir / enviar a un contacto")}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface/60 px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface transition shadow-pro"
          title="Acción rápida"
        >
          <Mail className="w-4 h-4" />
          Compartir
        </button>
      </div>
    </article>
  );
}

/* -------------------- Badges + Icons -------------------- */

/**
 * Helper: construye clases de badge por color según theme.
 * - Dark: texto claro para contraste.
 * - Light: texto oscuro para legibilidad.
 */
function badgeColor({ theme, color }) {
  const isLight = theme === "light";
  const base = "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold";

  const map = {
    blue: isLight
      ? "bg-blue-500/10 text-blue-700 border-blue-400/25"
      : "bg-blue-500/15 text-blue-200 border-blue-300/25",
    emerald: isLight
      ? "bg-emerald-500/10 text-emerald-800 border-emerald-400/25"
      : "bg-emerald-500/15 text-emerald-200 border-emerald-300/25",
    amber: isLight
      ? "bg-amber-500/10 text-amber-800 border-amber-400/25"
      : "bg-amber-500/15 text-amber-200 border-amber-300/25",
    sky: isLight
      ? "bg-sky-500/10 text-sky-800 border-sky-400/25"
      : "bg-sky-500/15 text-sky-200 border-sky-300/25",
    slate: isLight
      ? "bg-slate-500/10 text-slate-800 border-slate-400/25"
      : "bg-slate-500/15 text-slate-200 border-slate-300/25",
  };

  return `${base} ${map[color] || map.slate}`;
}

/** Badge por tipo de favorito */
function badgeByType(type, theme) {
  switch (type) {
    case "Socio":
      return badgeColor({ theme, color: "blue" });
    case "Oportunidad":
      return badgeColor({ theme, color: "emerald" });
    case "Recomendación":
      return badgeColor({ theme, color: "amber" });
    case "Producto":
      return badgeColor({ theme, color: "sky" });
    case "Mensaje":
      return badgeColor({ theme, color: "slate" });
    default:
      return badgeColor({ theme, color: "slate" });
  }
}

/** Icono por tipo */
function iconByType(type) {
  const cls = "w-4 h-4";
  if (type === "Socio") return <Building2 className={cls} />;
  if (type === "Oportunidad") return <ShoppingBag className={cls} />;
  if (type === "Recomendación") return <Sparkles className={cls} />;
  if (type === "Producto") return <Briefcase className={cls} />;
  if (type === "Mensaje") return <MessageSquare className={cls} />;
  return <Star className={cls} />;
}