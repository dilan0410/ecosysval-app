// src/components/MainHeader.jsx
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Bell,
  MessageSquare,
  UserCircle,
  ChevronDown,
  LogOut,
  Menu as MenuIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, logout as apiLogout } from "../api/axiosClient";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

export default function MainHeader({
  showSearch = true,
  showBack = false,
  onMenuClick,
}) {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [busquedaHeader, setBusquedaHeader] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      if (parsed.id) {
        cargarLogoUsuario(parsed.id);
        cargarContadores();
      }
    } catch (e) {
      console.error("Error leyendo usuario:", e);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const interval = setInterval(() => {
      cargarContadores();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const cargarLogoUsuario = async (userId) => {
    try {
      const empresaRes = await api.get("/empresas/mi-empresa");
      if (empresaRes.data?.logo) {
        setProfilePic(getImageUrl(empresaRes.data.logo));
        return;
      }

      const userRes = await api.get(`/users/${userId}`);
      if (userRes.data?.profile_image) {
        setProfilePic(getImageUrl(userRes.data.profile_image));
      }
    } catch (error) {
      // silencioso
    }
  };

  const cargarContadores = async () => {
    try {
      const [notifRes, chatRes] = await Promise.all([
        api.get("/notificaciones/count"),
        api.get("/mensajes/no-leidos"),
      ]);
      setUnreadCount(notifRes.data?.count || 0);
      setUnreadChatCount(chatRes.data?.noLeidos || 0);
    } catch (error) {
      setUnreadCount(0);
      setUnreadChatCount(0);
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    setShowNotifications(false);
    setShowMessages(false);
    await apiLogout();
  };

  const handleBuscarHeader = (e) => {
    e.preventDefault();
    const query = busquedaHeader.trim();
    if (query) {
      navigate(`/explorar?q=${encodeURIComponent(query)}`);
    } else {
      navigate(`/explorar`);
    }
    setBusquedaHeader("");
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

  const displayName = user?.name || user?.empresa || t("header.user");

  const closeAllMenus = () => {
    setMenuOpen(false);
    setShowMessages(false);
    setShowNotifications(false);
  };

  return (
    <header className="relative z-[2500]">
      <div className="absolute inset-0 bg-gradient-to-r from-[#071326] via-[#071a33] to-[#050b18]" />
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />

      <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative flex items-center justify-between px-3 sm:px-5 md:px-6 py-2.5 md:py-3 border-b border-white/10 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.8)]">
        
        {/* IZQUIERDA */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 transition"
            title={t("header.menu")}
            aria-label={t("header.openMenu")}
          >
            <MenuIcon className="w-5 h-5 text-white/90" />
          </button>

          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 transition"
              title={t("header.back")}
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
            title={t("header.goHome")}
          >
            <img
              src="/ecosysval.png"
              alt="Ecosysval"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-sm"
            />
          </button>
        </div>

        {/* CENTRO */}
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
                placeholder={t("header.searchPlaceholder")}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/90 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-yellow-300/70 transition shadow-sm"
                maxLength={100}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />

              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-900 transition"
                title={t("header.search")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Idioma */}
        <div className="hidden sm:flex">
          <LanguageSwitcher />
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              closeAllMenus();
              navigate("/mensajes");
              setTimeout(cargarContadores, 1000);
            }}
            className="relative h-10 w-10 rounded-xl md:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition flex items-center justify-center"
            title={t("header.messages")}
          >
            <MessageSquare className="w-5 h-5 text-white/85 hover:text-yellow-300 transition" />
            {unreadChatCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-slate-900 text-[10px] font-bold flex items-center justify-center ring-2 ring-[#071a33]">
                {unreadChatCount > 9 ? "9+" : unreadChatCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              closeAllMenus();
              navigate("/notificaciones");
              setTimeout(cargarContadores, 1000);
            }}
            className="relative h-10 w-10 rounded-xl md:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition flex items-center justify-center"
            title={t("header.notifications")}
          >
            <Bell className="w-5 h-5 text-white/85 hover:text-yellow-300 transition" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#071a33]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen((s) => !s);
              setShowMessages(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 md:gap-2 pl-1.5 pr-2 md:pl-2 md:pr-3 h-10 rounded-xl md:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition"
            title={t("header.userMenu")}
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

            <span className="hidden xl:block font-semibold text-white/90 max-w-[140px] truncate text-sm">
              {displayName}
            </span>

            <ChevronDown
              className={`w-4 h-4 text-white/70 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

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
                {t("nav.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}