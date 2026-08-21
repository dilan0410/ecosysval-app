// frontend/src/hooks/useChat.js
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/axiosClient";
import { getChatSocket } from "../api/socket";

export function useChat() {
  const [conversaciones, setConversaciones] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [sending, setSending] = useState(false);
  const [noLeidosTotal, setNoLeidosTotal] = useState(0);
  const [typingUserId, setTypingUserId] = useState(null);
  const [connected, setConnected] = useState(false);

  const selectedIdRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // Cargar lista de conversaciones
  const cargarConversaciones = useCallback(async () => {
    setLoadingConv(true);
    try {
      const [convRes, countRes] = await Promise.all([
        api.get("/mensajes/conversaciones"),
        api.get("/mensajes/no-leidos"),
      ]);
      setConversaciones(convRes.data || []);
      setNoLeidosTotal(countRes.data?.noLeidos || 0);
    } catch (e) {
      console.error("Error cargando conversaciones:", e);
      setConversaciones([]);
    } finally {
      setLoadingConv(false);
    }
  }, []);

  // Cargar mensajes de una conversación
  const cargarMensajes = useCallback(async (convId) => {
    if (!convId) return;
    setLoadingMsg(true);
    try {
      const res = await api.get(`/mensajes/conversaciones/${convId}/mensajes?limit=100`);
      setMensajes(res.data?.mensajes || []);

      // Marcar como leídos
      await api.patch(`/mensajes/conversaciones/${convId}/leer`);
      setConversaciones((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, noLeidos: 0 } : c))
      );
      
      const countRes = await api.get("/mensajes/no-leidos");
      setNoLeidosTotal(countRes.data?.noLeidos || 0);
    } catch (e) {
      console.error("Error cargando mensajes:", e);
      setMensajes([]);
    } finally {
      setLoadingMsg(false);
    }
  }, []);

  // Seleccionar chat
  const seleccionarConversacion = useCallback(
    async (convId) => {
      const socket = getChatSocket();
      if (selectedIdRef.current && socket) {
        socket.emit("leave_conversation", { conversacionId: selectedIdRef.current });
      }
      setSelectedId(convId);
      if (socket && convId) {
        socket.emit("join_conversation", { conversacionId: convId });
      }
      await cargarMensajes(convId);
    },
    [cargarMensajes]
  );

  // Enviar mensaje
  const enviarMensaje = useCallback(async (contenido) => {
    const texto = (contenido || "").trim();
    if (!texto || !selectedIdRef.current) return null;

    setSending(true);
    try {
      const socket = getChatSocket();
      if (socket?.connected) {
        const resp = await new Promise((resolve) => {
          socket.emit(
            "send_message",
            { conversacionId: selectedIdRef.current, contenido: texto },
            (ack) => resolve(ack)
          );
        });
        if (!resp?.ok) throw new Error(resp?.error || "Error al enviar");
        return resp.mensaje;
      }

      // Fallback rest si el socket no está conectado
      const res = await api.post(
        `/mensajes/conversaciones/${selectedIdRef.current}/mensajes`,
        { contenido: texto }
      );
      return res.data;
    } finally {
      setSending(false);
    }
  }, []);

  // Abrir o crear chat con un usuario
  const iniciarConversacion = useCallback(
    async (participanteId, mensajeInicial) => {
      const res = await api.post("/mensajes/conversaciones", {
        participanteId,
        mensajeInicial,
      });
      await cargarConversaciones();
      if (res.data?.conversacion?.id) {
        await seleccionarConversacion(res.data.conversacion.id);
      }
      return res.data;
    },
    [cargarConversaciones, seleccionarConversacion]
  );

  // Notificar que está escribiendo
  const emitTyping = useCallback((isTyping) => {
    const socket = getChatSocket();
    if (!socket || !selectedIdRef.current) return;
    socket.emit("typing", {
      conversacionId: selectedIdRef.current,
      isTyping,
    });
  }, []);

  // Suscripción a eventos del WebSocket
  useEffect(() => {
    const socket = getChatSocket();
    if (!socket) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onNewMessage = ({ conversacionId, mensaje }) => {
      if (selectedIdRef.current === conversacionId) {
        setMensajes((prev) => {
          if (prev.some((m) => m.id === mensaje.id)) return prev;
          return [...prev, mensaje];
        });
        api.patch(`/mensajes/conversaciones/${conversacionId}/leer`).catch(() => {});
        socket.emit("mark_read", { conversacionId });
      }

      setConversaciones((prev) => {
        const exists = prev.find((c) => c.id === conversacionId);
        if (!exists) {
          cargarConversaciones();
          return prev;
        }
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const soyYo = mensaje.senderId === currentUser?.id;

        const updated = prev.map((c) => {
          if (c.id !== conversacionId) return c;
          return {
            ...c,
            ultimoMensaje: mensaje.contenido,
            ultimoMensajeAt: mensaje.createdAt,
            ultimoSenderId: mensaje.senderId,
            noLeidos:
              selectedIdRef.current === conversacionId || soyYo
                ? 0
                : (c.noLeidos || 0) + 1,
          };
        });

        return updated.sort((a, b) => {
          const da = new Date(a.ultimoMensajeAt || a.createdAt).getTime();
          const db = new Date(b.ultimoMensajeAt || b.createdAt).getTime();
          return db - da;
        });
      });

      api.get("/mensajes/no-leidos").then((r) => {
        setNoLeidosTotal(r.data?.noLeidos || 0);
      }).catch(() => {});
    };

    const onMessagesRead = ({ conversacionId }) => {
      const me = JSON.parse(localStorage.getItem("user") || "{}")?.id;
      if (selectedIdRef.current === conversacionId) {
        setMensajes((prev) =>
          prev.map((m) =>
            m.senderId === me ? { ...m, leido: true, leidoAt: new Date().toISOString() } : m
          )
        );
      }
    };

    const onTyping = ({ conversacionId, userId, isTyping }) => {
      if (selectedIdRef.current !== conversacionId) return;
      setTypingUserId(isTyping ? userId : null);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      if (isTyping) {
        typingTimeout.current = setTimeout(() => setTypingUserId(null), 2500);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_message", onNewMessage);
    socket.on("messages_read", onMessagesRead);
    socket.on("user_typing", onTyping);

    if (socket.connected) setConnected(true);

    cargarConversaciones();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_message", onNewMessage);
      socket.off("messages_read", onMessagesRead);
      socket.off("user_typing", onTyping);
    };
  }, [cargarConversaciones]);

  return {
    conversaciones,
    mensajes,
    selectedId,
    loadingConv,
    loadingMsg,
    sending,
    noLeidosTotal,
    typingUserId,
    connected,
    cargarConversaciones,
    seleccionarConversacion,
    enviarMensaje,
    iniciarConversacion,
    emitTyping,
    setSelectedId,
  };
}