// src/components/MainHeader.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  MessageSquare,
  UserCircle,
  ChevronDown,
  LogOut,
  Menu as MenuIcon, // NUEVO: Icono hamburguesa
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { notificacionesMock } from "../data/notificacionesMock"; // OBSOLETO
import { mensajesMock } from "../data/mensajesMock";

// REFRESH TOKENS
import { api, logout as apiLogout } from "../api/axiosClient";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Helper universal para URLs de imágenes
function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

/**
 * MainHeader
 * @param {boolean} showSearch - Si mostrar el buscador (default true)
 * @param {boolean} showBack - Si mostrar botón "volver" (default false)
 * @param {function} onMenuClick - NUEVO: callback al hacer click en hamburguesa
 */
export default function MainHeader({
  showSearch = true,
  showBack = false,
  onMenuClick, // NUEVO
}) {
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [busquedaHeader, setBusquedaHeader] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // NUEVO: Contador de notificaciones no leídas
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Cargar usuario y logo de empresa
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      if (parsed.id) {
        // axios: token y refresh automáticos
        cargarLogoUsuario(parsed.id);
        cargarContadorNotificaciones(); // NUEVO: Cargar al inicio
      }
    } catch (e) {
      console.error("Error leyendo usuario:", e);
    }
  }, []);

  // NUEVO: Polling cada 30 segundos para actualizar el contador
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const interval = setInterval(() => {
      cargarContadorNotificaciones();
    }, 30000); // 30 segundos

    return () => clearInterval(interval); // Limpieza al desmontar
  }, []);

    // Función separada para claridad
    const cargarLogoUsuario = async (userId) => {
      try {
        // 1. Intentar obtener el logo de la empresa
        const empresaRes = await api.get("/empresas/mi-empresa");
        if (empresaRes.data?.logo) {
          setProfilePic(getImageUrl(empresaRes.data.logo));
          return;
        }

        // 2. Fallback: obtener imagen de perfil del usuario
        const userRes = await api.get(`/users/${userId}`);
        if (userRes.data?.profile_image) {
          setProfilePic(getImageUrl(userRes.data.profile_image));
        }
      } catch (error) {
        // Silencioso: si no hay empresa o falla, se muestra el ícono por defecto
        console.log("No hay logo/imagen disponible");
      }
    };

  // NUEVO: Cargar contador de notificaciones no leídas
  const cargarContadorNotificaciones = async () => {
    try {
      const res = await api.get("/notificaciones/count");
      setUnreadCount(res.data?.count || 0);
    } catch (error) {
      // Silencioso: si falla (no login, etc), no muestra nada
      setUnreadCount(0);
    }
  };

  const handleLogout = async () => {
    // Cerrar dropdowns primero
    setMenuOpen(false);
    setShowNotifications(false);
    setShowMessages(false);

    // Invalidar refresh_token en backend + limpiar localStorage
    // La función apiLogout ya redirige a /login automáticamente
    await apiLogout();
  };

  // NUEVO: Buscar empresas desde el header
  const handleBuscarHeader = (e) => {
    e.preventDefault();
    const query = busquedaHeader.trim();
    if (query) {
      navigate(`/explorar?q=${encodeURIComponent(query)}`);
    } else {
      navigate(`/explorar`);
    }
    setBusquedaHeader(""); // Limpiar el input después de buscar
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setShowNotifications(false);
        setShowMessages(false);
      }
    }

    if (menuOpen || showNotifications || showMessages) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, showNotifications, showMessages]);

  const displayName = user?.name || user?.empresa || "Usuario";

  // Ya no usamos el mock, el contador viene del backend (unreadCount)

  const mensajes = mensajesMock;
  const unreadMessages = mensajes.filter((m) => !m.leido).length;

  const closeAllMenus = () => {
    setMenuOpen(false);
    setShowMessages(false);
    setShowNotifications(false);
  };

  return (
    <header className="relative z-[2500]">
      {/* Fondo premium */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#071326] via-[#071a33] to-[#050b18]" />
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />

      {/* Efectos decorativos */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />

      {/* CAMBIO: Padding responsivo */}
      <div className="relative flex items-center justify-between px-3 sm:px-5 md:px-6 py-2.5 md:py-3 border-b border-white/10 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.8)]">
        
        {/* ===== IZQUIERDA: Hamburguesa + Logo ===== */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* NUEVO: Botón hamburguesa (solo móvil, hasta lg) */}
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 transition"
            title="Menú"
            aria-label="Abrir menú"
          >
            <MenuIcon className="w-5 h-5 text-white/90" />
          </button>

          {/* Botón volver (opcional) */}
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 transition"
              title="Volver"
            >
              ←
            </button>
          )}

          {/* Logo */}
          <button
            type="button"
            onClick={() => {
              closeAllMenus();
              navigate("/inicio");
            }}
            className="group flex items-center gap-2"
            title="Ir a Inicio"
          >
            <img
              src="/ecosysval.png"
              alt="Ecosysval"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-sm"
            />
          </button>
        </div>

        {/* ===== CENTRO: Buscador (oculto en móvil) ===== */}
        {showSearch && (
          <div className="hidden lg:flex flex-1 mx-6">
            <form 
              onSubmit={handleBuscarHeader}
              className="w-full max-w-2xl relative"
            >
              <input
                type="text"
                value={busquedaHeader}
                onChange={(e) => setBusquedaHeader(e.target.value)}
                placeholder="Buscar empresas por nombre, sector, productos..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white/90 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-yellow-300/70 transition shadow-sm"
                maxLength={100}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
              
              {/* Botón de búsqueda dentro del input */}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-900 transition"
                title="Buscar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* ===== DERECHA: Notificaciones + Mensajes + Usuario ===== */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 relative" ref={menuRef}>
          
          {/* Mensajes */}
          <button
            type="button"
            onClick={() => {
              closeAllMenus();
              navigate("/mensajes");
            }}
            className="relative h-10 w-10 rounded-xl md:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition flex items-center justify-center"
            title="Mensajes"
          >
            <MessageSquare className="w-5 h-5 text-white/85 hover:text-yellow-300 transition" />
            {unreadMessages > 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#071a33]" />
            )}
          </button>

          {/* Notificaciones */}
          <button
            type="button"
            onClick={() => {
              closeAllMenus();
              navigate("/notificaciones");
            }}
            className="relative h-10 w-10 rounded-xl md:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition flex items-center justify-center"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5 text-white/85 hover:text-yellow-300 transition" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#071a33]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Usuario */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen((s) => !s);
              setShowMessages(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 md:gap-2 pl-1.5 pr-2 md:pl-2 md:pr-3 h-10 rounded-xl md:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition"
            title="Menú de usuario"
          >
            {profilePic ? (
              <img
                src={profilePic}
                alt="avatar"
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl border border-white/15 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                  setProfilePic(null);
                }}
              />
            ) : (
              <UserCircle className="w-7 h-7 md:w-8 md:h-8 text-white/70" />
            )}

            {/* Nombre: solo en desktop */}
            <span className="hidden xl:block font-semibold text-white/90 max-w-[140px] truncate text-sm">
              {displayName}
            </span>

            <ChevronDown
              className={`w-4 h-4 text-white/70 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown usuario */}
          {menuOpen && (
            <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1630]/95 backdrop-blur-xl shadow-2xl z-[2600]">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="text-sm font-semibold text-white/95 truncate">
                  {displayName}
                </div>
                <div className="text-xs text-white/60 truncate">
                  {user?.email || ""}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}