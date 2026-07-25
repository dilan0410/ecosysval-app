// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error"); // NUEVO: 'error' | 'warning' | 'success'
  const [showResend, setShowResend] = useState(false); // NUEVO
  const [resending, setResending] = useState(false); // NUEVO
  const [loading, setLoading] = useState(false); // NUEVO
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setShowResend(false);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

            if (res.ok) {
              // Guardar AMBOS tokens (access + refresh)
              localStorage.setItem("token", data.access_token);
              localStorage.setItem("refresh_token", data.refresh_token);
              localStorage.setItem("user", JSON.stringify(data.user));

              if (data.user.role === "admin") {
                navigate("/admin");
              } else {
                navigate("/profile");
              }
            } else {
        // NUEVO: Detectar si el error es por email no verificado
        const isNotVerified = data.message?.toLowerCase().includes("verificar");
        
        if (isNotVerified) {
          setMessage(data.message);
          setMessageType("warning");
          setShowResend(true); // Mostrar botón de reenviar
        } else {
          setMessage(data.message || "Credenciales incorrectas");
          setMessageType("error");
        }
      }
    } catch (error) {
      setMessage("Error al iniciar sesión. Verifica tu conexión.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // NUEVA función: Reenviar email de verificación
  const handleResendVerification = async () => {
    if (!email) {
      setMessage("Escribe tu email primero");
      setMessageType("error");
      return;
    }

    setResending(true);

    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      setMessage(data.message);
      setMessageType("success");
      setShowResend(false);
    } catch (error) {
      setMessage("Error al reenviar el email");
      setMessageType("error");
    } finally {
      setResending(false);
    }
  };

  // NUEVO: Estilos según tipo de mensaje
  const messageStyles = {
    error: "bg-red-500/20 border-red-500/40 text-red-200",
    warning: "bg-yellow-500/20 border-yellow-500/40 text-yellow-200",
    success: "bg-emerald-500/20 border-emerald-500/40 text-emerald-200",
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/fondo.png')" }}
    >
      <div className="absolute inset-0 bg-black/50 z-0" />

      <header className="relative z-10 flex items-center p-6">
        <img
          src="/ecosysval.png"
          alt="ECOSYSVAL"
          className="h-10 w-auto object-contain"
        />
      </header>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md rounded-2xl bg-black/30 backdrop-blur-sm border border-white/20 shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-white mb-6">
            Inicio de sesión
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="correo@empresa.com"
                className="w-full px-4 py-2 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
            {/* MEJORADO: Label + link al mismo nivel */}
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-white">
                Contraseña
              </label>
              <a
                href="/forgot-password"
                className="text-yellow-300 hover:underline text-xs"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className="w-full px-4 py-2 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 outline-none pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-slate-700"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-slate-900 py-2 rounded-lg font-semibold hover:brightness-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          </form>

          {/* NUEVO: Mensaje con estilo según tipo */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg border text-sm ${messageStyles[messageType]}`}>
              {message}
            </div>
          )}

          {/* NUEVO: Botón de reenviar verificación */}
          {showResend && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {resending ? (
                <>Enviando...</>
              ) : (
                <>Reenviar email de verificación</>
              )}
            </button>
          )}

          <p className="text-center text-sm text-white mt-6">
            ¿No tienes una cuenta?{" "}
            <a href="/register" className="text-yellow-300 hover:underline">
              Crear una cuenta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;