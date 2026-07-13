// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Por favor ingresa tu email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setEnviado(true);
      } else {
        // Mostrar errores específicos del backend
        const errorMessage = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Error al procesar la solicitud";
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/fondo.png')" }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-[#0b1630]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/ecosysval.png"
              alt="Ecosysval"
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* ==========================================
              ESTADO INICIAL: FORMULARIO
              ========================================== */}
          {!enviado && (
            <>
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  ¿Olvidaste tu contraseña?
                </h2>
                <p className="text-white/60 text-sm">
                  Ingresa tu email y te enviaremos un link para restablecerla.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="w-full px-4 py-3 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 text-slate-900 py-3 rounded-lg font-bold hover:brightness-95 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Enviar link de recuperación
                    </>
                  )}
                </button>
              </form>

              {/* Mensaje de error */}
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Link para volver */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-yellow-300 hover:underline text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a iniciar sesión
                </Link>
              </div>
            </>
          )}

          {/* ==========================================
              ESTADO: EMAIL ENVIADO
              ========================================== */}
          {enviado && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Revisa tu email!
              </h2>
              <p className="text-white/70 mb-2">
                Si <strong className="text-yellow-300">{email}</strong> está
                registrado, recibirás un correo con instrucciones para
                restablecer tu contraseña.
              </p>
              <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-left">
                <p className="text-yellow-200 text-sm">
                  <strong>Consejos:</strong>
                </p>
                <ul className="text-yellow-100/80 text-xs mt-2 space-y-1">
                  <li>• Revisa tu bandeja de entrada</li>
                  <li>• Si no lo ves, revisa la carpeta de spam</li>
                  <li>• El link expira en 1 hora</li>
                </ul>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-yellow-400 text-slate-900 py-3 rounded-lg font-bold hover:brightness-95 transition"
                >
                  Volver a iniciar sesión
                </button>
                <button
                  onClick={() => {
                    setEnviado(false);
                    setEmail("");
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm transition"
                >
                  Enviar a otro email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}