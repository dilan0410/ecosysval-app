// src/components/MainHeader.jsx
import React, { useEffect, useRef, useState } from "react";
import { Bell, MessageSquare, UserCircle, ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificacionesMock } from "../data/notificacionesMock";
import { mensajesMock } from "../data/mensajesMock";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function MainHeader({ showSearch = true, showBack = false }) {
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const navigate = useNavigate();
  const menuRef = useRef(null);

  // 🔹 Cargar usuario y foto
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      if (parsed.id) {
        fetch(`${API_URL}/users/${parsed.id}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.profile_image) setProfilePic(`${API_URL}${data.profile_image}`);
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error("Error leyendo usuario:", e);
    }
  }, []);

  // 🔹 Cerrar sesión
  const handleLogout = () => {
    localStorage.clear();
    setMenuOpen(false);
    setShowNotifications(false);
    setShowMessages(false);
    navigate("/subscribe");
    setTimeout(() => window.location.reload(), 100);
  };

  // 🔹 Cerrar menús al hacer click fuera
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

  // 🔔 Notificaciones
  const notifications = notificacionesMock;
  const unreadNotifications = notifications.filter((n) => !n.leido).length;

  // 💬 Mensajes
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

      {/* Brillos suaves */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative flex items-center justify-between px-5 md:px-6 py-3 border-b border-white/10 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.8)]">
        {/* IZQUIERDA: volver + logo */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition"
              title="Volver"
            >
              ←
            </button>
          )}

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
              className="h-9 md:h-10 w-auto object-contain drop-shadow-sm"
            />
          </button>
        </div>

        {/* CENTRO: buscador */}
        {showSearch && (
          <div className="hidden md:flex flex-1 mx-6">
            <div className="w-full max-w-2xl relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white/90 text-slate-900 placeholder:text-slate-400 outline-none
                           focus:ring-2 focus:ring-yellow-300/70 transition shadow-sm"
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
            </div>
          </div>
        )}

        {/* DERECHA */}
        <div className="flex items-center gap-2 md:gap-3 relative" ref={menuRef}>
          {/* 💬 Mensajes -> NAVEGA a /mensajes */}
          <button
            type="button"
            onClick={() => {
              closeAllMenus();
              navigate("/mensajes");
            }}
            className="relative h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="Mensajes"
          >
            <MessageSquare className="w-5 h-5 text-white/85 hover:text-yellow-300 transition" />
            {unreadMessages > 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#071a33]" />
            )}
          </button>

          {/* 🔔 Notificaciones -> NAVEGA a /notificaciones */}
          <button
            type="button"
            onClick={() => {
              closeAllMenus();
              navigate("/notificaciones");
            }}
            className="relative h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5 text-white/85 hover:text-yellow-300 transition" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#071a33]" />
            )}
          </button>

          {/* USUARIO */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen((s) => !s);
              setShowMessages(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-2 pr-3 h-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
            title="Menú de usuario"
          >
            {profilePic ? (
              <img
                src={profilePic}
                alt="avatar"
                className="w-8 h-8 rounded-xl border border-white/15 object-cover"
              />
            ) : (
              <UserCircle className="w-8 h-8 text-white/70" />
            )}

            <span className="hidden md:block font-semibold text-white/90 max-w-[160px] truncate">
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
