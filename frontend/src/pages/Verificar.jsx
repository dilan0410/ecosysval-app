// frontend/src/pages/Verificar.jsx
import React, { useEffect, useState, useRef } from "react"; // Agregar useRef
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function Verificar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  
  // NUEVO: Ref para prevenir doble ejecución
  const yaVerificado = useRef(false);

  useEffect(() => {
    // NUEVO: Si ya se ejecutó, no hacer nada
    if (yaVerificado.current) return;
    yaVerificado.current = true;

    if (!token) {
      setStatus("error");
      setMessage("No se recibió ningún token de verificación.");
      return;
    }

    verificarEmail();
  }, [token]);

  const verificarEmail = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/verify?token=${token}`, {
        method: "GET",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.alreadyVerified) {
          setStatus("already");
          setMessage(data.message);
        } else {
          setStatus("success");
          setMessage(data.message);
        }
      } else {
        setStatus("error");
        setMessage(data.message || "El link de verificación es inválido o expiró.");
      }
    } catch (error) {
      console.error("Error verificando email:", error);
      setStatus("error");
      setMessage("Hubo un error al verificar tu email. Intenta de nuevo.");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/fondo.png')" }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-[#0b1630]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <img
              src="/ecosysval.png"
              alt="Ecosysval"
              className="h-12 w-auto object-contain"
            />
          </div>

          {status === "loading" && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <Loader2 className="w-16 h-16 text-yellow-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Verificando tu email...
              </h2>
              <p className="text-white/60">Un momento por favor</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Email verificado!
              </h2>
              <p className="text-white/70 mb-6">{message}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-yellow-400 text-slate-900 py-3 rounded-xl font-bold hover:brightness-95 transition"
              >
                Iniciar sesión
              </button>
            </div>
          )}

          {status === "already" && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Mail className="w-14 h-14 text-blue-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Ya está verificado
              </h2>
              <p className="text-white/70 mb-6">{message}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-yellow-400 text-slate-900 py-3 rounded-xl font-bold hover:brightness-95 transition"
              >
                Ir a iniciar sesión
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-14 h-14 text-red-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No se pudo verificar
              </h2>
              <p className="text-white/70 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-yellow-400 text-slate-900 py-3 rounded-xl font-bold hover:brightness-95 transition"
                >
                  Volver a iniciar sesión
                </button>
                <Link
                  to="/register"
                  className="block w-full text-center text-yellow-300 hover:underline text-sm"
                >
                  ¿No tienes cuenta? Regístrate
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}