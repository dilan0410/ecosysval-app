// src/pages/Mensajes.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next"; // i18n
import Layout from "../components/Layout";
import { useTheme } from "../components/ThemeProvider";
import { useChat } from "../hooks/useChat";
import { api } from "../api/axiosClient";
import {
  Search,
  Mail,
  MailOpen,
  Send,
  Loader2,
  MessageCircle,
  ArrowLeft,
  X,
  Plus,
  Building2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  fadeIn,
  slideUp,
  scaleIn,
  staggerContainer,
  staggerItem,
  pageTransition,
} from "../utils/animations";

function badgeColor({ theme, color }) {
  const isLight = theme === "light";
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";
  const map = {
    amber: isLight
      ? "bg-amber-500/10 text-amber-800 border-amber-400/25"
      : "bg-amber-500/15 text-amber-200 border-amber-300/25",
    emerald: isLight
      ? "bg-emerald-500/10 text-emerald-800 border-emerald-400/25"
      : "bg-emerald-500/15 text-emerald-200 border-emerald-300/25",
    slate: isLight
      ? "bg-slate-500/10 text-slate-800 border-slate-400/25"
      : "bg-slate-500/15 text-slate-200 border-slate-300/25",
  };
  return `${base} ${map[color] || map.slate}`;
}

function formatearTiempo(fecha, lang) {
  if (!fecha) return "";
  const ahora = new Date();
  const f = new Date(fecha);
  const diffMs = ahora - f;
  if (diffMs < 0) return lang === "en" ? "Now" : "Ahora";
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);
  const diffDias = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return lang === "en" ? "Now" : "Ahora";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHoras < 24) return `${diffHoras}h`;
  if (diffDias === 1) return lang === "en" ? "Yesterday" : "Ayer";
  if (diffDias < 7) return `${diffDias}d`;
  return f.toLocaleDateString(lang === "en" ? "en-US" : "es-MX", { day: "2-digit", month: "short" });
}

function TypingIndicator({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface/50 border border-border w-fit"
    >
      <span className="text-xs text-muted italic">{text}</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-accent"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function Mensajes() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    conversaciones,
    mensajes,
    selectedId,
    loadingConv,
    loadingMsg,
    sending,
    noLeidosTotal,
    typingUserId,
    connected,
    seleccionarConversacion,
    enviarMensaje,
    eliminarMensaje,
    iniciarConversacion,
    emitTyping,
    setSelectedId,
  } = useChat();

  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [texto, setTexto] = useState("");
  const chatContainerRef = useRef(null);

  const [showModalNuevoChat, setShowModalNuevoChat] = useState(false);
  const [busquedaEmpresa, setBusquedaEmpresa] = useState("");
  const [empresasEncontradas, setEmpresasEncontradas] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);

  const me = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    const c = searchParams.get("c");
    const userId = searchParams.get("userId");

    if (c) {
      const id = parseInt(c, 10);
      if (!Number.isNaN(id)) seleccionarConversacion(id);
      return;
    }

    if (userId) {
      const id = parseInt(userId, 10);
      if (!Number.isNaN(id)) {
        iniciarConversacion(id).catch(() => {
          toast.error(t("messages.deleteError"));
        });
        setSearchParams({}, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [mensajes, typingUserId]);

  const convFiltradas = useMemo(() => {
    let list = [...conversaciones];
    if (filtro === "no_leidas") list = list.filter((c) => (c.noLeidos || 0) > 0);
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((c) => {
        const n = (c.otroUsuario?.name || "").toLowerCase();
        const m = (c.ultimoMensaje || "").toLowerCase();
        return n.includes(term) || m.includes(term);
      });
    }
    return list;
  }, [conversaciones, q, filtro]);

  const selected = useMemo(
    () => conversaciones.find((c) => c.id === selectedId) || null,
    [conversaciones, selectedId]
  );

  async function handleSend(e) {
    e?.preventDefault?.();
    if (!texto.trim() || sending) return;
    const value = texto;
    setTexto("");
    emitTyping(false);
    try {
      await enviarMensaje(value);
    } catch (err) {
      setTexto(value);
      toast.error(t("messages.deleteError"));
    }
  }

  function onChangeTexto(v) {
    setTexto(v);
    emitTyping(true);
  }

  async function buscarEmpresasDirectorio(term) {
    setBusquedaEmpresa(term);
    if (!term.trim()) {
      setEmpresasEncontradas([]);
      return;
    }

    setLoadingEmpresas(true);
    try {
      const res = await api.get("/empresas");
      const todas = res.data || [];
      const query = term.toLowerCase();

      const filtradas = todas.filter((e) => {
        const rSocial = (e.razonSocial || "").toLowerCase();
        const rep = (e.representante || "").toLowerCase();
        const mail = (e.correo || "").toLowerCase();
        return rSocial.includes(query) || rep.includes(query) || mail.includes(query);
      });

      setEmpresasEncontradas(filtradas);
    } catch (err) {
      console.error("Error buscando empresas:", err);
    } finally {
      setLoadingEmpresas(false);
    }
  }

  async function handleIniciarChatConEmpresa(empresa) {
    if (!empresa.userId) {
      toast.error(t("messages.deleteError"));
      return;
    }

    try {
      toast.loading(t("common.loading"));
      await iniciarConversacion(empresa.userId);
      toast.dismiss();
      toast.success(t("messages.directoryTitle"));
      setShowModalNuevoChat(false);
      setBusquedaEmpresa("");
      setEmpresasEncontradas([]);
    } catch (err) {
      toast.dismiss();
      toast.error(t("messages.deleteError"));
    }
  }

  const lang = i18n.language;

  return (
    <Layout mainClassName="!p-6">
      <motion.div
        {...pageTransition}
        className="mx-auto w-full max-w-7xl space-y-6"
      >
        {/* Header */}
        <motion.div
          {...fadeIn}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro px-6 py-5">
            <div className={badgeColor({ theme, color: "slate" })}>
              <motion.span
                animate={{ scale: connected ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="ml-2">
                {connected ? t("messages.realtime") : t("messages.connecting")}
              </span>
            </div>

            <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-text">
              {t("messages.title")}{" "}
              <span className="text-accent">{t("messages.titleAccent")}</span>
            </h1>
            <p className="mt-2 text-sm text-muted max-w-2xl">
              {t("messages.subtitle")}
            </p>
            <div className="mt-4 h-1 w-56 rounded bg-accent" />
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowModalNuevoChat(true);
                buscarEmpresasDirectorio("");
              }}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition"
            >
              <Plus className="w-4 h-4" />
              {t("messages.newChat")}
            </motion.button>

            <span className="rounded-full bg-surface/60 text-text px-4 py-2 border border-border text-xs shadow-pro">
              {t("messages.unread")}: <strong>{noLeidosTotal}</strong>
            </span>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* LISTA DE CONVERSACIONES */}
          <motion.section
            {...fadeIn}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-border">
              <div className="relative">
                <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("messages.searchChats")}
                  className="w-full rounded-2xl border border-border bg-surface/60 pl-11 pr-3 py-3 text-sm text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <Chip
                    text={t("messages.filterAll")}
                    active={filtro === "todas"}
                    theme={theme}
                    onClick={() => setFiltro("todas")}
                  />
                  <Chip
                    text={t("messages.filterUnread")}
                    active={filtro === "no_leidas"}
                    theme={theme}
                    onClick={() => setFiltro("no_leidas")}
                  />
                </div>
              </div>
            </div>

            <div className="max-h-[650px] overflow-y-auto flex-1">
              {loadingConv ? (
                <div className="p-10 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : convFiltradas.length === 0 ? (
                <motion.div
                  {...scaleIn}
                  className="p-8 text-center text-muted flex flex-col items-center justify-center"
                >
                  <div className="mb-3 h-12 w-12 rounded-2xl border border-border bg-surface/40 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-muted" />
                  </div>
                  <p className="text-sm font-semibold text-text">
                    {q ? t("messages.emptySearch", { query: q }) : t("messages.emptyTitle")}
                  </p>
                  <p className="text-xs text-muted mt-1 max-w-xs">
                    {t("messages.emptyHint")}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setShowModalNuevoChat(true);
                      buscarEmpresasDirectorio(q);
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/30 text-accent px-3 py-2 text-xs font-bold hover:bg-accent/20 transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {t("messages.searchDirectory")}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  <AnimatePresence>
                    {convFiltradas.map((c, idx) => {
                      const isSelected = selectedId === c.id;
                      const unread = (c.noLeidos || 0) > 0;
                      return (
                        <motion.button
                          key={c.id}
                          variants={staggerItem}
                          layout
                          whileHover={{ x: 3 }}
                          type="button"
                          onClick={() => {
                            seleccionarConversacion(c.id);
                            setSearchParams({ c: String(c.id) }, { replace: true });
                          }}
                          className={[
                            "w-full text-left px-5 py-4 flex gap-4 transition",
                            idx !== convFiltradas.length - 1 ? "border-b border-border" : "",
                            unread ? "bg-surface/40" : "bg-transparent",
                            isSelected
                              ? "ring-1 ring-yellow-400/25 bg-accent/10"
                              : "hover:bg-surface",
                          ].join(" ")}
                        >
                          <div className="mt-0.5">
                            <div
                              className={[
                                "h-10 w-10 rounded-2xl border flex items-center justify-center overflow-hidden shrink-0",
                                unread
                                  ? "border-yellow-400/25 bg-accent/10"
                                  : "border-border bg-surface/40",
                              ].join(" ")}
                            >
                              {c.otroUsuario?.profile_image ? (
                                <img
                                  src={c.otroUsuario.profile_image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : unread ? (
                                <Mail className="w-5 h-5 text-accent" />
                              ) : (
                                <MailOpen className="w-5 h-5 text-muted" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-extrabold text-text truncate">
                                {c.otroUsuario?.name || "Socio"}
                              </p>
                              <p className="text-[11px] text-muted shrink-0">
                                {formatearTiempo(c.ultimoMensajeAt || c.createdAt, lang)}
                              </p>
                            </div>
                            <p className="mt-1 text-xs text-muted line-clamp-2">
                              {c.ultimoMensaje || t("messages.noMessages")}
                            </p>
                            <AnimatePresence>
                              {unread && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className="mt-2 flex items-center gap-2"
                                >
                                  <span className={badgeColor({ theme, color: "emerald" })}>
                                    {c.noLeidos} {t("messages.filterUnread").toLowerCase()}
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* PANEL DETALLE DEL CHAT */}
          <motion.section
            {...fadeIn}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro overflow-hidden flex flex-col min-h-[650px]"
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-2xl border border-border bg-surface/40 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-muted" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-text truncate">
                    {selected ? selected.otroUsuario?.name : t("messages.conversation")}
                  </div>
                  <div className="text-xs text-muted">
                    {selected
                      ? typingUserId
                        ? t("messages.typing")
                        : selected.otroUsuario?.email || ""
                      : t("messages.noSelection")}
                  </div>
                </div>
              </div>

              {selected && (
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    setSearchParams({}, { replace: true });
                  }}
                  className="h-10 w-10 rounded-2xl border border-border bg-surface/60 hover:bg-surface flex items-center justify-center"
                  title={t("common.close")}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!selected ? (
                <motion.div
                  key="empty"
                  {...fadeIn}
                  className="p-10 text-center text-muted flex-1 flex flex-col items-center justify-center"
                >
                  <div className="mx-auto mb-4 h-14 w-14 rounded-3xl border border-border bg-surface/40 flex items-center justify-center">
                    <MailOpen className="w-7 h-7 text-muted" />
                  </div>
                  <p className="text-text font-semibold">
                    {t("messages.noSelection")}
                  </p>
                  <p className="text-sm text-muted mt-2 max-w-md">
                    {t("messages.noSelectionHint")}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowModalNuevoChat(true);
                      buscarEmpresasDirectorio("");
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-xs font-bold text-slate-900 shadow-pro hover:brightness-95 transition"
                  >
                    <Building2 className="w-4 h-4" />
                    {t("messages.searchCompany")}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  {...fadeIn}
                  className="flex-1 flex flex-col"
                >
                  {/* Mensajes con scroll container */}
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[520px]"
                  >
                    {loadingMsg ? (
                      <div className="p-10 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-accent" />
                      </div>
                    ) : mensajes.length === 0 ? (
                      <div className="text-center text-muted text-sm py-10">
                        {t("messages.noMessages")}
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {mensajes.map((m) => {
                          const mine = m.senderId === me?.id;
                          return (
                            <motion.div
                              key={m.id}
                              {...slideUp}
                              layout
                              className={`flex group ${mine ? "justify-end" : "justify-start"}`}
                            >
                              <div className="relative flex items-center gap-2 max-w-[80%]">
                                {/* Botón eliminar traducido */}
                                {mine && (
                                  <motion.button
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      toast(t("messages.deleteConfirm"), {
                                        action: {
                                          label: t("common.delete"),
                                          onClick: async () => {
                                            try {
                                              await eliminarMensaje(m.id);
                                              toast.success(t("messages.deleted"));
                                            } catch {
                                              toast.error(t("messages.deleteError"));
                                            }
                                          },
                                        },
                                        cancel: { label: t("common.cancel") },
                                      });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                                    title={t("common.delete")}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </motion.button>
                                )}

                                <div
                                  className={[
                                    "rounded-2xl px-4 py-2.5 border text-sm whitespace-pre-wrap break-words shadow-sm flex-1",
                                    mine
                                      ? "bg-accent text-slate-900 border-accent/30 font-medium"
                                      : "bg-surface/50 text-text border-border",
                                  ].join(" ")}
                                >
                                  <p>{m.contenido}</p>
                                  <div
                                    className={`mt-1 text-[10px] flex items-center gap-1 ${
                                      mine ? "text-slate-800/70 justify-end" : "text-muted"
                                    }`}
                                  >
                                    <span>{formatearTiempo(m.createdAt, lang)}</span>
                                    {mine && (
                                      <span>
                                        {m.leido ? `· ${t("messages.read")}` : `· ${t("messages.sent")}`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}

                    <AnimatePresence>
                      {typingUserId && <TypingIndicator text={t("messages.typing")} />}
                    </AnimatePresence>
                  </div>

                  {/* Input envío */}
                  <form
                    onSubmit={handleSend}
                    className="p-4 border-t border-border flex items-end gap-2 bg-surface/20"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(null);
                        setSearchParams({}, { replace: true });
                      }}
                      className="hidden sm:inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface/50 shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <textarea
                      value={texto}
                      onChange={(e) => onChangeTexto(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      rows={1}
                      placeholder={t("messages.placeholder")}
                      className="flex-1 resize-none rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40 max-h-32"
                    />

                    <motion.button
                      whileHover={!sending && texto.trim() ? { scale: 1.05 } : {}}
                      whileTap={!sending && texto.trim() ? { scale: 0.95 } : {}}
                      type="submit"
                      disabled={sending || !texto.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-extrabold text-slate-900 shadow-pro hover:brightness-95 transition disabled:opacity-50 shrink-0"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {t("common.send")}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </div>
      </motion.div>

      {/* MODAL: BUSCAR EMPRESAS */}
      <AnimatePresence>
        {showModalNuevoChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModalNuevoChat(false);
            }}
          >
            <motion.div
              {...scaleIn}
              className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent" />
                  <h3 className="font-extrabold text-text text-lg">{t("messages.directoryTitle")}</h3>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={() => setShowModalNuevoChat(false)}
                  className="rounded-full p-1 hover:bg-surface/80 text-muted"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
                <input
                  autoFocus
                  type="text"
                  value={busquedaEmpresa}
                  onChange={(e) => buscarEmpresasDirectorio(e.target.value)}
                  placeholder={t("messages.directoryPlaceholder")}
                  className="w-full rounded-2xl border border-border bg-surface/80 pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {loadingEmpresas ? (
                  <div className="p-6 text-center text-muted flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    {t("common.loading")}
                  </div>
                ) : empresasEncontradas.length === 0 ? (
                  <div className="p-6 text-center text-muted text-xs">
                    {busquedaEmpresa
                      ? t("messages.emptySearch", { query: busquedaEmpresa })
                      : t("common.search")}
                  </div>
                ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-2"
                  >
                    {empresasEncontradas.map((emp) => (
                      <motion.div
                        key={emp.id}
                        variants={staggerItem}
                        whileHover={{ x: 3 }}
                        className="flex items-center justify-between p-3 rounded-2xl border border-border bg-surface/40 hover:bg-surface/80 transition"
                      >
                        <div>
                          <p className="text-sm font-bold text-text">{emp.razonSocial}</p>
                          <p className="text-xs text-muted">
                            {emp.representante ? `Rep: ${emp.representante}` : emp.correo}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleIniciarChatConEmpresa(emp)}
                          className="px-3 py-1.5 rounded-xl bg-accent text-slate-900 text-xs font-bold hover:brightness-95 transition"
                        >
                          {t("messages.startChat")}
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function Chip({ text, active = false, theme, onClick }) {
  const isLight = theme === "light";
  const cls = active
    ? badgeColor({ theme, color: "amber" })
    : [
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold cursor-pointer transition",
        isLight
          ? "border-border bg-surface/60 text-muted hover:bg-surface"
          : "border-border bg-surface/40 text-muted hover:bg-surface",
      ].join(" ");

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={onClick}
      className={cls}
    >
      {text}
    </motion.button>
  );
}