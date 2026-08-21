// frontend/src/api/socket.js
import { io } from "socket.io-client";
import { API_URL } from "./axiosClient";

let socket = null;

export function getChatSocket() {
  if (socket?.connected) return socket;

  const token = localStorage.getItem("token");
  if (!token) return null;

  socket = io(`${API_URL}/chat`, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}