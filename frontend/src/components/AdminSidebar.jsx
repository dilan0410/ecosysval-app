import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";

function AdminSidebar({ onLogout, user }) {
  const location = useLocation();

  // Lista de items del menú
  const menuItems = [
    { 
      path: "/admin", 
      label: "Dashboard", 
      icon: LayoutDashboard 
    },
    { 
      path: "/admin/usuarios", 
      label: "Usuarios", 
      icon: Users 
    },
    { 
      path: "/admin/empresas", 
      label: "Empresas", 
      icon: Building2 
    },
    { 
      path: "/admin/empleos", 
      label: "Empleos", 
      icon: Briefcase 
    },
    { 
      path: "/admin/reportes", 
      label: "Reportes", 
      icon: BarChart3 
    },
    { 
      path: "/admin/configuracion", 
      label: "Configuración", 
      icon: Settings 
    },
  ];

  // Verificar si una ruta está activa
  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-black/40 backdrop-blur-sm border-r border-yellow-500/20 min-h-screen flex flex-col">
      {/* LOGO */}
        <div className="p-4 border-b border-yellow-500/20">
        <div className="flex flex-col items-center">
            <img
            src="/ecosysval.png"
            alt="ECOSYSVAL"
            className="h-12 w-auto object-contain mb-2"
            />
            <p className="text-xs text-gray-400 font-semibold">Panel de Administración</p>
        </div>
        </div>

      {/* MENÚ */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* USUARIO Y LOGOUT */}
      <div className="p-4 border-t border-yellow-500/20">
        <div className="mb-3 px-2">
          <p className="text-sm font-semibold text-white truncate">
            {user?.name || "Admin"}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {user?.email || ""}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 hover:text-white transition-all border border-red-500/30"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;