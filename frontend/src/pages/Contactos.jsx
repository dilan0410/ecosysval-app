// src/pages/Contactos.jsx
/**
 * CONTACTOS EMPRESARIALES (Ecosysval)
 * -------------------------------------------------------
 * ✅ Objetivo:
 * - Listar y gestionar contactos del ecosistema (proveedores / clientes / aliados).
 * - Búsqueda por empresa, contacto, cargo o tipo.
 * - Acciones rápidas: mensaje, favorito, eliminar, ver perfil (mock).
 *
 * ✅ IMPORTANTE (THEME + FONDO):
 * - ❌ NO se usa backgroundImage en la página (NO fondo.png por encima).
 * - ✅ El fondo vive globalmente por tema (claro/oscuro) en CSS.
 * - ✅ Aquí solo agregamos un overlay "glow" suave para contraste.
 *
 * ✅ UI:
 * - Tokens Tailwind: bg-surface, text-text, border-border, ring, etc.
 * - Badges/labels "theme-aware" para legibilidad en light/dark.
 */

import React, { useMemo, useState } from "react";
import { Search, MessageSquare, Trash2, Star, Users, Building2, MapPin } from "lucide-react";

import Layout from "../components/Layout";
import { useTheme } from "../components/ThemeProvider";

/* ---------------- Mock data (luego lo conectas a backend) ---------------- */

const contactosMock = [
  {
    id: 1,
    empresa: "Transporte del Sur",
    contacto: "Carlos Méndez",
    cargo: "Director Comercial",
    tipo: "Proveedor",
    estado: "Activo",
    ultimaInteraccion: "Hace 2 días",
    ubicacion: "Chiapas, MX",
  },
  {
    id: 2,
    empresa: "Maderas del Centro",
    contacto: "Ana Rodríguez",
    cargo: "Gerente de Compras",
    tipo: "Cliente",
    estado: "Nuevo",
    ultimaInteraccion: "Hoy",
    ubicacion: "CDMX, MX",
  },
  {
    id: 3,
    empresa: "Textiles Hidalgo",
    contacto: "Luis Herrera",
    cargo: "CEO",
    tipo: "Aliado",
    estado: "Inactivo",
    ultimaInteraccion: "Hace 1 semana",
    ubicacion: "Hidalgo, MX",
  },
];

/* ---------------- UI helpers (theme-aware) ---------------- */

const glassCard = "rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro";
const chipBase = "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold";

/** Badge por estado (Activo/Nuevo/Inactivo) adaptado al tema */
function statusChip(estado, theme) {
  const isLight = theme === "light";

  if (estado === "Activo") {
    return `${chipBase} ${
      isLight
        ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-800"
        : "border-emerald-300/25 bg-emerald-500/15 text-emerald-200"
    }`;
  }

  if (estado === "Nuevo") {
    return `${chipBase} ${
      isLight
        ? "border-blue-400/25 bg-blue-500/10 text-blue-800"
        : "border-blue-300/25 bg-blue-500/15 text-blue-200"
    }`;
  }

  return `${chipBase} ${
    isLight
      ? "border-slate-400/25 bg-slate-500/10 text-slate-800"
      : "border-slate-300/25 bg-slate-500/15 text-slate-200"
  }`;
}

/** Badge por tipo de relación */
function typeChip(tipo, theme) {
  const isLight = theme === "light";

  const map = {
    Proveedor: isLight
      ? "border-amber-400/25 bg-amber-500/10 text-amber-800"
      : "border-amber-300/25 bg-amber-500/15 text-amber-200",
    Cliente: isLight
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-800"
      : "border-emerald-300/25 bg-emerald-500/15 text-emerald-200",
    Aliado: isLight
      ? "border-violet-400/25 bg-violet-500/10 text-violet-800"
      : "border-violet-300/25 bg-violet-500/15 text-violet-200",
  };

  return `${chipBase} ${map[tipo] || (isLight ? "border-border bg-surface/40 text-text/80" : "border-border bg-surface/40 text-text/80")}`;
}

/** Botón de acción (icon-only) con tokens del tema */
function ActionIconButton({ title, onClick, children, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`h-10 w-10 rounded-2xl border border-border bg-surface/60 hover:bg-surface transition flex items-center justify-center ${
        danger ? "hover:ring-1 hover:ring-red-400/30" : "hover:ring-1 hover:ring-ring/30"
      }`}
    >
      {children}
    </button>
  );
}

export default function Contactos() {
  const { theme } = useTheme();

  // -------------------------
  // Estados / filtros
  // -------------------------
  const [search, setSearch] = useState("");

  // -------------------------
  // Filtrado
  // - Busca por empresa, contacto, cargo, tipo, estado y ubicación.
  // -------------------------
  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contactosMock;

    return contactosMock.filter((c) => {
      const blob = `${c.empresa} ${c.contacto} ${c.cargo} ${c.tipo} ${c.estado} ${c.ubicacion || ""}`.toLowerCase();
      return blob.includes(term);
    });
  }, [search]);

  return (
    <Layout>
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className={`${glassCard} p-6 text-text`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl border border-border bg-surface/40 flex items-center justify-center">
                      <Users className="w-6 h-6 text-accent" />
                    </div>

                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold">Contactos empresariales</h1>
                      <p className="text-sm text-muted mt-1 max-w-2xl">
                        Gestiona tus conexiones estratégicas dentro del ecosistema: proveedores, clientes y aliados.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`${chipBase} border-border bg-surface/40 text-text/80`}>
                          <Building2 className="w-3.5 h-3.5" />
                          {filtrados.length} contactos
                        </span>
                        <span className={`${chipBase} border-border bg-surface/40 text-text/80`}>
                          <Star className="w-3.5 h-3.5" />
                          Favoritos (mock)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones header (mock) */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => alert("Mock: importar contactos / sincronizar")}
                      className="rounded-full bg-surface/60 border border-border px-5 py-2 text-sm font-extrabold text-text hover:bg-surface transition shadow-pro"
                    >
                      Importar
                    </button>

                    <button
                      type="button"
                      onClick={() => alert("Mock: crear nuevo contacto")}
                      className="rounded-full bg-accent px-5 py-2 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-105 transition"
                    >
                      Nuevo contacto
                    </button>
                  </div>
                </div>

                {/* Buscador */}
                <div className="mt-5 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Buscar empresa, contacto, cargo, tipo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface/60 border border-border text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
              </div>

              {/* Grid contactos */}
              {filtrados.length === 0 ? (
                <div className={`${glassCard} p-12 text-center text-text`}>
                  <div className="text-4xl mb-2">👥</div>
                  <div className="font-extrabold">No hay contactos con esa búsqueda</div>
                  <div className="text-sm text-muted mt-1">Prueba con otro término (ej: proveedor, CDMX, Ana...)</div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtrados.map((c) => (
                    <article
                      key={c.id}
                      className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro p-5 text-text transition hover:-translate-y-0.5"
                    >
                      {/* glow interno */}
                      <div className="pointer-events-none absolute opacity-0" />

                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={typeChip(c.tipo, theme)}>{c.tipo}</span>
                            <span className={statusChip(c.estado, theme)}>{c.estado}</span>
                          </div>

                          <h3 className="text-lg font-extrabold mt-3 truncate">{c.empresa}</h3>

                          <p className="text-sm text-muted mt-1 truncate">{c.contacto}</p>
                          <p className="text-xs text-muted/80 truncate">{c.cargo}</p>

                          {c.ubicacion && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                              <MapPin className="w-4 h-4" />
                              {c.ubicacion}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 text-xs text-muted">
                        Última interacción: <span className="text-text/80 font-semibold">{c.ultimaInteraccion}</span>
                      </div>

                      {/* Acciones */}
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <div className="flex gap-2">
                          <ActionIconButton
                            title="Enviar mensaje"
                            onClick={() => alert(`Mock: abrir chat con ${c.contacto}`)}
                          >
                            <MessageSquare className="w-4 h-4 text-text" />
                          </ActionIconButton>

                          <ActionIconButton
                            title="Marcar favorito"
                            onClick={() => alert(`Mock: marcar favorito a ${c.empresa}`)}
                          >
                            <Star className="w-4 h-4 text-accent" />
                          </ActionIconButton>

                          <ActionIconButton
                            title="Eliminar contacto"
                            danger
                            onClick={() => alert(`Mock: eliminar contacto ${c.empresa}`)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </ActionIconButton>
                        </div>

                        <button
                          type="button"
                          onClick={() => alert(`Mock: ver perfil de ${c.empresa}`)}
                          className="text-xs font-extrabold text-accent hover:underline"
                        >
                          Ver perfil →
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
    </Layout>
  );
}