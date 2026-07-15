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
import { notificacionesMock } from "../data/notificacionesMock";
import { mensajesMock } from "../data/mensajesMock";

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

  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

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
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        fetch(`${API_URL}/empresas/mi-empresa`, { headers })
          .then((r) => (r.ok ? r.json() : null))
          .then((empresa) => {
            if (empresa?.logo) {
              setProfilePic(getImageUrl(empresa.logo));
            } else {
              fetch(`${API_URL}/users/${parsed.id}`, { headers })
                .then((r) => r.json())
                .then((data) => {
                  if (data.profile_image) {
                    setProfilePic(getImageUrl(data.profile_image));
                  }
                })
                .catch(() => {});
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error("Error leyendo usuario:", e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setMenuOpen(false);
    setShowNotifications(false);
    setShowMessages(false);
    navigate("/subscribe");
    setTimeout(() => window.location.reload(), 100);
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

  const notifications = notificacionesMock;
  const unreadNotifications = notifications.filter((n) => !n.leido).length;

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
            <div className="w-full max-w-2xl relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white/90 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-yellow-300/70 transition shadow-sm"
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
            </div>
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
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#071a33]" />
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