// frontend/src/components/Layout.jsx
/**
 * LAYOUT COMPONENT (ECOSYSVAL)
 * -------------------------------------------------------------------
 * Componente reutilizable que envuelve TODAS las páginas privadas.
 * Se encarga de:
 * - Renderizar el MainHeader (con hamburguesa en móvil)
 * - Renderizar el SidebarMenu (drawer en móvil, sidebar en desktop)
 * - Manejar el estado de apertura/cierre del sidebar
 * - Aplicar el fondo decorativo (opcional)
 *
 * Uso básico:
 *   <Layout>
 *     <div>Contenido de la página</div>
 *   </Layout>
 *
 * Uso con opciones:
 *   <Layout showSearch={false} showBack={true}>
 *     <div>Contenido</div>
 *   </Layout>
 */

import React, { useState } from "react";
import MainHeader from "./MainHeader";
import SidebarMenu from "./SidebarMenu";

/**
 * @param {ReactNode} children - Contenido de la página
 * @param {boolean} showSearch - Mostrar buscador en header (default true)
 * @param {boolean} showBack - Mostrar botón volver en header (default false)
 * @param {boolean} showDecorativeBackground - Mostrar overlay decorativo (default true)
 * @param {string} mainClassName - Clases adicionales para el <main>
 */
export default function Layout({
  children,
  showSearch = true,
  showBack = false,
  showDecorativeBackground = true,
  mainClassName = "",
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Overlay decorativo (glow) — opcional */}
      {showDecorativeBackground && (
        <div className="pointer-events-none fixed inset-0 z-0">
          <div
            className={[
              "absolute inset-0",
              "bg-[radial-gradient(1200px_600px_at_10%_10%,rgba(236,182,14,0.18),transparent_55%)]",
              "bg-[radial-gradient(900px_450px_at_90%_20%,rgba(59,130,246,0.12),transparent_55%)]",
            ].join(" ")}
          />
        </div>
      )}

      {/* Contenedor principal por encima del overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header con soporte para hamburguesa */}
        <MainHeader
          showSearch={showSearch}
          showBack={showBack}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex flex-1">
          {/* Sidebar responsive (drawer en móvil, fijo en desktop) */}
          <SidebarMenu
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Contenido de la página */}
          <main
            className={`flex-1 px-4 md:px-8 py-6 ${mainClassName}`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}