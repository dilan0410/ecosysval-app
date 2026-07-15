// src/components/SidebarMenu.jsx
/**
 * SIDEBAR MENU (ECOSYSVAL) - VERSIÓN RESPONSIVE
 * -------------------------------------------------------------------
 * Comportamiento:
 * - DESKTOP (>= 1024px): Siempre visible, como sidebar tradicional
 * - MÓVIL (< 1024px): Drawer que se abre/cierra desde afuera
 *
 * Props:
 * - isOpen: boolean → controla si el drawer está abierto (móvil)
 * - onClose: function → callback para cerrar el drawer (móvil)
 * - onItemClick: function → callback al hacer click en un item
 */

import React from "react";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react"; // NUEVO: para el botón cerrar

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
 * @param {boolean} isOpen - Estado del drawer en móvil (default: false)
 * @param {function} onClose - Callback para cerrar el drawer
 * @param {function} onItemClick - Callback al hacer click en un item
 */
export default function SidebarMenu({ isOpen = false, onClose, onItemClick }) {
  // Función que se ejecuta al hacer click en un item
  const handleItemClick = (label) => {
    onItemClick?.(label);
    // Cerrar el drawer al navegar (solo en móvil)
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* ==============================================
          OVERLAY (solo visible en móvil cuando isOpen)
          ============================================== */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000] transition-opacity"
          onClick={onClose}
          aria-label="Cerrar menú"
        />
      )}

      {/* ==============================================
          SIDEBAR / DRAWER
          - Desktop (lg+): siempre visible, estático
          - Móvil: drawer flotante que se desliza
          ============================================== */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-[3100] lg:z-auto
          h-screen lg:h-full
          w-72 lg:w-64
          text-white overflow-hidden
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Capas de fondo premium */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220] via-[#0b1626] to-[#070c14]" />
        <div className="absolute inset-0 bg-white/4 backdrop-blur-md" />

        {/* Glows decorativos */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-slate-300/10 blur-3xl" />

        {/* CONTENIDO */}
        <div className="relative flex flex-col h-full py-6 px-3">
          
          {/* HEADER DEL DRAWER (con botón cerrar en móvil) */}
          <div className="px-2 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-yellow-400/15 border border-yellow-300/20 flex items-center justify-center">
                <span className="text-yellow-200 font-black">E</span>
              </div>

              <div className="leading-tight">
                <div className="text-sm font-bold tracking-wide">ECOSYSVAL</div>
                <div className="text-[11px] text-white/55">Ecosistema empresarial</div>
              </div>
            </div>

            {/* NUEVO: Botón cerrar (solo móvil) */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5 text-white/90" />
              </button>
            )}
          </div>

          {/* NAV */}
          <nav className="flex-1 overflow-y-auto pr-1 space-y-1">
            {menuItems.map((item, idx) => {
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

              return (
                <NavLink
                  key={label}
                  to={route}
                  title={label}
                  onClick={() => handleItemClick(label)}
                  className={({ isActive }) =>
                    [
                      "group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all",
                      "hover:bg-white/7 active:scale-[0.98]",
                      isActive ? "bg-white/9 ring-1 ring-white/10" : "bg-transparent",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Indicador lateral (dorado si está activo) */}
                      <span
                        className={[
                          "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full transition-all",
                          isActive ? "bg-yellow-300" : "bg-transparent",
                        ].join(" ")}
                      />

                      {/* Contenedor del ícono */}
                      <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/9 transition">
                        <img
                          src={icon}
                          alt={label}
                          className="w-5 h-5 object-contain opacity-90"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/icons/mi-perfil.png";
                          }}
                        />
                      </div>

                      {/* Texto del item */}
                      <span className="text-sm text-white/80 group-hover:text-white transition">
                        {label}
                      </span>

                      {/* Punto derecho */}
                      <span
                        className={[
                          "ml-auto h-2 w-2 rounded-full transition",
                          isActive ? "bg-yellow-300" : "bg-white/10 group-hover:bg-white/20",
                        ].join(" ")}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* BLOQUE INFERIOR (TIP) */}
          <div className="mt-4 px-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/65">Tip</div>
              <div className="text-[12px] text-white/80 mt-1">
                Publica ofertas y conecta con empresas en minutos.
              </div>
            </div>
          </div>

          {/* PATRÓN DECORATIVO */}
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
    </>
  );
}