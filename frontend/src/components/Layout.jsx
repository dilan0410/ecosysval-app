// frontend/src/components/Layout.jsx
import React, { useState } from "react";
import MainHeader from "./MainHeader";
import SidebarMenu from "./SidebarMenu";

export default function Layout({
  children,
  showSearch = true,
  showBack = false,
  showDecorativeBackground = true,
  mainClassName = "",
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Overlay decorativo (glow) */}
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

      <div className="relative z-10 flex flex-col min-h-screen">
        <MainHeader
          showSearch={showSearch}
          showBack={showBack}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex flex-1 min-w-0">
          {/* 🔧 CAMBIO: wrapper que reserva ancho SOLO en desktop.
              En móvil el Sidebar es fixed (drawer), así que no debe ocupar espacio flex. */}
          <div className="hidden lg:block lg:w-64 shrink-0">
            <SidebarMenu
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>

          {/* En móvil renderizamos el Sidebar APARTE (fuera del flex)
              para que funcione como drawer flotante sin empujar el main */}
          <div className="lg:hidden">
            <SidebarMenu
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>

          <main
            className={`flex-1 px-4 md:px-8 py-6 min-w-0 max-w-full overflow-x-hidden ${mainClassName}`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}