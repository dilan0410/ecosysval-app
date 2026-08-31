// src/components/SidebarMenu.jsx
/**
 * SIDEBAR MENU (ECOSYSVAL) - RESPONSIVE + i18n
 */
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

/**
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onItemClick
 */
export default function SidebarMenu({ isOpen = false, onClose, onItemClick }) {
  const { t } = useTranslation();

  // Menú con keys i18n
  const menuItems = useMemo(
    () => [
      { labelKey: "nav.home", route: "/inicio", icon: "/icons/inicio.png" },
      { labelKey: "nav.myPosts", route: "/profile", icon: "/icons/mis-publicaciones.png" },
      { labelKey: "nav.companyProfile", route: "/perfil", icon: "/icons/mi-perfil.png" },
      { labelKey: "nav.businessGroups", route: "/grupos", icon: "/icons/grupos-empresariales.png" },
      { labelKey: "nav.jobOffers", route: "/empleos", icon: "/icons/oferta-de-empleo.png" },

      { type: "divider", labelKey: "nav.growth" },

      { labelKey: "nav.courses", route: "/cursos", icon: "/icons/cursos-certificaciones.png" },
      { labelKey: "nav.rewards", route: "/recompensas", icon: "/icons/recompensas.png" },
      { labelKey: "nav.worldTop", route: "/top-mundial", icon: "/icons/top-mundial.png" },
      { labelKey: "nav.mapPosition", route: "/mapa", icon: "/icons/mapa.png" },

      { type: "divider", labelKey: "nav.business" },

      { labelKey: "nav.financialTools", route: "/herramientas-financieras", icon: "/icons/herramientas-financieras.png" },
      { labelKey: "nav.ecommerce", route: "/ecommerce", icon: "/icons/e-commerce.png" },
      { labelKey: "nav.opportunities", route: "/oportunidades", icon: "/icons/buzon-oportunidades.png" },
      { labelKey: "nav.alliances", route: "/alianzas", icon: "/icons/alianzas-colaboraciones.png" },
      { labelKey: "nav.trends", route: "/tendencias", icon: "/icons/tendencias-mercado.png" },

      { type: "divider", labelKey: "nav.network" },

      { labelKey: "nav.explore", route: "/explorar", icon: "/icons/contactos.png" },
      { labelKey: "nav.recommendations", route: "/recomendaciones", icon: "/icons/recomendaciones.png" },
      { labelKey: "nav.favorites", route: "/favoritos", icon: "/icons/favoritos.png" },
      { labelKey: "nav.contacts", route: "/contactos", icon: "/icons/contactos.png" },
      { labelKey: "nav.events", route: "/eventos", icon: "/icons/foros.png" },
      { labelKey: "nav.messages", route: "/mensajes", icon: "/icons/mensajes.png" },

      { type: "divider", labelKey: "nav.system" },

      { labelKey: "nav.settings", route: "/ajustes", icon: "/icons/ajustes.png" },
    ],
    []
  );

  const handleItemClick = (label) => {
    onItemClick?.(label);
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000] transition-opacity"
          onClick={onClose}
          aria-label={t("common.close")}
        />
      )}

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
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220] via-[#0b1626] to-[#070c14]" />
        <div className="absolute inset-0 bg-white/4 backdrop-blur-md" />

        <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-slate-300/10 blur-3xl" />

        <div className="relative flex flex-col h-full py-6 px-3">
          <div className="px-2 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-yellow-400/15 border border-yellow-300/20 flex items-center justify-center">
                <span className="text-yellow-200 font-black">E</span>
              </div>

              <div className="leading-tight">
                <div className="text-sm font-bold tracking-wide">ECOSYSVAL</div>
                <div className="text-[11px] text-white/55">{t("nav.ecosystem")}</div>
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
                aria-label={t("common.close")}
              >
                <X className="w-5 h-5 text-white/90" />
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto pr-1 space-y-1">
            {menuItems.map((item, idx) => {
              if (item.type === "divider") {
                return (
                  <div key={`div-${idx}`} className="pt-3 pb-1 px-2">
                    <div className="text-[11px] uppercase tracking-widest text-white/45">
                      {t(item.labelKey)}
                    </div>
                    <div className="mt-2 h-px bg-white/10" />
                  </div>
                );
              }

              const { labelKey, route, icon } = item;
              const label = t(labelKey);

              return (
                <NavLink
                  key={labelKey}
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
                      <span
                        className={[
                          "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full transition-all",
                          isActive ? "bg-yellow-300" : "bg-transparent",
                        ].join(" ")}
                      />

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

                      <span className="text-sm text-white/80 group-hover:text-white transition">
                        {label}
                      </span>

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

          <div className="mt-4 px-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/65">{t("nav.tip")}</div>
              <div className="text-[12px] text-white/80 mt-1">
                {t("nav.tipText")}
              </div>
            </div>
          </div>

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