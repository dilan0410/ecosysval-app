// src/components/SidebarMenu.jsx
/**
 * SIDEBAR MENU (ECOSYSVAL)
 * -------------------------------------------------------------------
 * Objetivo:
 * - Renderizar el menú lateral de navegación de la plataforma.
 * - Mantener un estilo "premium" tipo glassmorphism, coherente con el tema.
 *
 * Características:
 * - Soporta secciones mediante "divider" (Crecimiento, Negocio, Red, Sistema).
 * - Usa NavLink para resaltar automáticamente el item activo.
 * - Permite callback opcional onItemClick para cerrar sidebar en móvil, tracking, etc.
 *
 * Ajuste visual realizado:
 * - Se reemplaza el "azul chillón" del fondo por un azul grisáceo (slate/navy sobrio)
 *   para que combine con el tema actual sin afectar el dark/light global.
 * - Se ajusta el glow inferior: de azul a slate para mantener armonía.
 */

import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Definición del menú.
 * - label: texto visible.
 * - route: path de react-router.
 * - icon: ruta del ícono (assets en /public/icons/).
 * - type: si es "divider", se renderiza como separador/encabezado de sección.
 */
const menuItems = [
  { label: "Inicio", route: "/inicio", icon: "/icons/inicio.png" },
  { label: "Mis Publicaciones", route: "/profile", icon: "/icons/mis-publicaciones.png" },
  { label: "Perfil Empresarial", route: "/perfil", icon: "/icons/mi-perfil.png" },
  { label: "Grupos Empresariales", route: "/grupos", icon: "/icons/grupos-empresariales.png" },
  { label: "Ofertas de Empleo", route: "/empleos", icon: "/icons/oferta-de-empleo.png" },

  { type: "divider", label: "Crecimiento" },

  { label: "Capacitación-Cursos", route: "/cursos", icon: "/icons/cursos-certificaciones.png" },
  { label: "Recompensas", route: "/recompensas", icon: "/icons/recompensas.png" },
  { label: "Top Mundial", route: "/top-mundial", icon: "/icons/top-mundial.png" },
  { label: "Posición en el sistema", route: "/mapa", icon: "/icons/mapa.png" },

  { type: "divider", label: "Negocio" },

  { label: "Herramientas Financieras", route: "/herramientas-financieras", icon: "/icons/herramientas-financieras.png" },
  { label: "E-commerce", route: "/ecommerce", icon: "/icons/e-commerce.png" },
  { label: "Buzón Oportunidades", route: "/oportunidades", icon: "/icons/buzon-oportunidades.png" },
  { label: "Alianzas y Colaboraciones", route: "/alianzas", icon: "/icons/alianzas-colaboraciones.png" },
  { label: "Tendencias de Mercado", route: "/tendencias", icon: "/icons/tendencias-mercado.png" },

  { type: "divider", label: "Red" },

  { label: "Recomendaciones", route: "/recomendaciones", icon: "/icons/recomendaciones.png" },
  { label: "Favoritos", route: "/favoritos", icon: "/icons/favoritos.png" },
  { label: "Contactos", route: "/contactos", icon: "/icons/contactos.png" },
  { label: "Eventos", route: "/eventos", icon: "/icons/foros.png" },
  { label: "Mensajes", route: "/mensajes", icon: "/icons/mensajes.png" },

  { type: "divider", label: "Sistema" },

  { label: "Ajustes", route: "/ajustes", icon: "/icons/ajustes.png" },
];

/**
 * SidebarMenu
 * @param {Object} props
 * @param {(label: string) => void} [props.onItemClick]
 *  Callback opcional al hacer click en un item:
 *  - Útil para cerrar el menú en mobile o registrar analytics.
 */
export default function SidebarMenu({ onItemClick }) {
  return (
    /**
     * Contenedor del sidebar:
     * - w-64: ancho fijo (256px).
     * - overflow-hidden: evita que efectos/glows sobresalgan visualmente.
     */
    <aside className="relative w-64 h-full text-white overflow-hidden">
      {/* ----------------------------------------------------------------
          CAPAS DE FONDO (premium, menos azul saturado)
          ----------------------------------------------------------------
          1) Base: gradiente azul grisáceo sobrio (navy/slate).
          2) Capa glass: blanco con baja opacidad + blur.
          Nota: se mantiene independiente del theme global para no "dañar"
                otros módulos que dependan de .dark o :root.
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220] via-[#0b1626] to-[#070c14]" />
      <div className="absolute inset-0 bg-white/4 backdrop-blur-md" />

      {/* ----------------------------------------------------------------
          GLOWS DECORATIVOS
          ----------------------------------------------------------------
          - Glow superior: dorado suave (mantiene identidad).
          - Glow inferior: se cambia de azul a slate para no "chillar".
      */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-slate-300/10 blur-3xl" />

      {/* ----------------------------------------------------------------
          CONTENIDO
          ---------------------------------------------------------------- */}
      <div className="relative flex flex-col h-full py-6 px-3">
        {/* --------------------------------------------------------------
            MARCA (opcional)
            - Útil si se quiere branding dentro del sidebar.
            - Si ya tienes marca completa en MainHeader, se puede ocultar.
        ---------------------------------------------------------------- */}
        <div className="px-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-yellow-400/15 border border-yellow-300/20 flex items-center justify-center">
              <span className="text-yellow-200 font-black">E</span>
            </div>

            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide">ECOSYSVAL</div>
              <div className="text-[11px] text-white/55">Ecosistema empresarial</div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------
            NAV
            - overflow-y-auto: permite scroll si hay muchos items.
            - pr-1: deja espacio para scrollbar sin tapar contenido.
        ---------------------------------------------------------------- */}
        <nav className="flex-1 overflow-y-auto pr-1 space-y-1">
          {menuItems.map((item, idx) => {
            // Render de separadores/encabezados por sección.
            if (item.type === "divider") {
              return (
                <div key={`div-${idx}`} className="pt-3 pb-1 px-2">
                  <div className="text-[11px] uppercase tracking-widest text-white/45">
                    {item.label}
                  </div>
                  <div className="mt-2 h-px bg-white/10" />
                </div>
              );
            }

            const { label, route, icon } = item;

            /**
             * NavLink:
             * - isActive lo provee react-router automáticamente según route actual.
             * - Se aplica estilo activo con un leve "ring" y background.
             */
            return (
              <NavLink
                key={label}
                to={route}
                title={label}
                onClick={() => onItemClick?.(label)}
                className={({ isActive }) =>
                  [
                    // Estructura base de item
                    "group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all",
                    // Hover sobrio
                    "hover:bg-white/7",
                    // Activo: fondo + borde suave
                    isActive ? "bg-white/9 ring-1 ring-white/10" : "bg-transparent",
                  ].join(" ")
                }
              >
                {/* ----------------------------------------------------------
                    INDICADOR LATERAL
                    - Se muestra solo en activo.
                    - Color dorado (identidad) sin saturar el fondo.
                ---------------------------------------------------------- */}
                <span
                  className={({ isActive }) =>
                    [
                      "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full transition-all",
                      isActive ? "bg-yellow-300" : "bg-transparent",
                    ].join(" ")
                  }
                />

                {/* ----------------------------------------------------------
                    CONTENEDOR DE ÍCONO
                    - Fondo tipo glass suave.
                    - Aumenta levemente en hover.
                ---------------------------------------------------------- */}
                <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/9 transition">
                  <img
                    src={icon}
                    alt={label}
                    className="w-5 h-5 object-contain opacity-90"
                  />
                </div>

                {/* Texto del item */}
                <span className="text-sm text-white/80 group-hover:text-white transition">
                  {label}
                </span>

                {/* ----------------------------------------------------------
                    PUNTO DERECHO (estado)
                    - Activo: dorado.
                    - Inactivo: blanco tenue, sube un poco en hover.
                ---------------------------------------------------------- */}
                <span
                  className={({ isActive }) =>
                    [
                      "ml-auto h-2 w-2 rounded-full transition",
                      isActive ? "bg-yellow-300" : "bg-white/10 group-hover:bg-white/20",
                    ].join(" ")
                  }
                />
              </NavLink>
            );
          })}
        </nav>

        {/* --------------------------------------------------------------
            BLOQUE INFERIOR (TIP)
            - Tarjeta informativa pequeña.
            - Mantiene el mismo estilo de glass (borde + fondo).
        ---------------------------------------------------------------- */}
        <div className="mt-4 px-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/65">Tip</div>
            <div className="text-[12px] text-white/80 mt-1">
              Publica ofertas y conecta con empresas en minutos.
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------
            PATRÓN DECORATIVO (opcional)
            - Imagen en /public/sidebar-pattern.png
            - Opacidad baja para no competir con el contenido.
        ---------------------------------------------------------------- */}
        <div
          className="absolute bottom-[-30px] left-0 w-full h-40 pointer-events-none"
          style={{
            backgroundImage: "url('/sidebar-pattern.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center bottom",
            backgroundSize: "150px",
            opacity: 0.12,
          }}
        />
      </div>
    </aside>
  );
}