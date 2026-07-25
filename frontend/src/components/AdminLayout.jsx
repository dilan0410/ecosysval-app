import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

// REFRESH TOKENS
import { logout as apiLogout } from "../api/axiosClient";

function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = async () => {
    // Invalidar refresh_token en backend + limpiar localStorage + redirect
    await apiLogout();
  };

  // Cerrar sidebar al cambiar de ruta en móvil
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex">
      
      {/* BOTÓN HAMBURGUESA - SOLO EN MÓVIL */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 bg-yellow-500 hover:bg-yellow-600 text-black p-2.5 rounded-lg shadow-lg transition-colors"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* OVERLAY OSCURO - SOLO EN MÓVIL CUANDO SIDEBAR ABIERTO */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        fixed lg:relative
        inset-y-0 left-0
        z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <AdminSidebar 
          onLogout={handleLogout} 
          user={user}
          onNavigate={closeSidebar}
        />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-auto w-full lg:ml-0">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;