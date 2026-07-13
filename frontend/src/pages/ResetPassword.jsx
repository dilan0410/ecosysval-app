// frontend/src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Check,
  X,
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // Estados del formulario
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("form"); // 'form' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  // Validaciones de contraseña
  const validaciones = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumberOrSymbol: /[0-9!@#$%^&*(),.?":{}|<>_\-+=]/.test(password),
  };

  const passwordValida =
    validaciones.minLength &&
    validaciones.hasUppercase &&
    validaciones.hasLowercase &&
    validaciones.hasNumberOrSymbol;

  const passwordsCoinciden = password === confirmPassword && password.length > 0;

  // Verificar que hay token al cargar
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No se recibió ningún token. Solicita un nuevo link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validaciones frontend
    if (!passwordValida) {
      setErrorMessage("La contraseña no cumple con los requisitos.");
      return;
    }

    if (!passwordsCoinciden) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
      } else {
        // Error del backend
        const msg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Error al restablecer la contraseña";
        setErrorMessage(msg);

        // Si el token expiró o es inválido, cambiar a estado error
        if (
          msg.toLowerCase().includes("token") ||
          msg.toLowerCase().includes("expir")
        ) {
          setStatus("error");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setErrorMessage("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
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
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/ecosysval.png"
              alt="Ecosysval"
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* ==========================================
              ESTADO: FORMULARIO
              ========================================== */}
          {status === "form" && (
            <>
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Nueva contraseña
                </h2>
                <p className="text-white/60 text-sm">
                  Ingresa tu nueva contraseña para tu cuenta.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nueva contraseña */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nueva contraseña"
                      className="w-full px-4 py-3 pr-10 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Requisitos de la contraseña */}
                {password.length > 0 && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <p className="text-yellow-200 text-xs font-semibold mb-2">
                      La contraseña debe tener:
                    </p>
                    <ul className="space-y-1 text-xs">
                      <Requisito
                        cumple={validaciones.minLength}
                        texto="Al menos 8 caracteres"
                      />
                      <Requisito
                        cumple={validaciones.hasUppercase}
                        texto="Una letra mayúscula"
                      />
                      <Requisito
                        cumple={validaciones.hasLowercase}
                        texto="Una letra minúscula"
                      />
                      <Requisito
                        cumple={validaciones.hasNumberOrSymbol}
                        texto="Un número o símbolo"
                      />
                    </ul>
                  </div>
                )}

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar contraseña"
                      className="w-full px-4 py-3 pr-10 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 outline-none"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {/* Indicador de coincidencia */}
                  {confirmPassword.length > 0 && (
                    <p
                      className={`text-xs mt-2 ${
                        passwordsCoinciden
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {passwordsCoinciden ? (
                        <>✓ Las contraseñas coinciden</>
                      ) : (
                        <>✗ Las contraseñas no coinciden</>
                      )}
                    </p>
                  )}
                </div>

                {/* Botón submit */}
                <button
                  type="submit"
                  disabled={loading || !passwordValida || !passwordsCoinciden}
                  className="w-full bg-yellow-400 text-slate-900 py-3 rounded-lg font-bold hover:brightness-95 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Cambiar contraseña
                    </>
                  )}
                </button>
              </form>

              {/* Mensaje de error */}
              {errorMessage && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-sm">
                  {errorMessage}
                </div>
              )}
            </>
          )}

          {/* ==========================================
              ESTADO: ÉXITO
              ========================================== */}
          {status === "success" && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Contraseña actualizada!
              </h2>
              <p className="text-white/70 mb-6">
                Tu contraseña se cambió correctamente. Ya puedes iniciar sesión
                con tu nueva contraseña.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-yellow-400 text-slate-900 py-3 rounded-xl font-bold hover:brightness-95 transition"
              >
                Iniciar sesión
              </button>
            </div>
          )}

          {/* ==========================================
              ESTADO: ERROR (token inválido/expirado)
              ========================================== */}
          {status === "error" && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-14 h-14 text-red-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Link inválido o expirado
              </h2>
              <p className="text-white/70 mb-6">
                {errorMessage ||
                  "Este link ya fue usado o ha expirado. Solicita uno nuevo."}
              </p>
              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="block w-full bg-yellow-400 text-slate-900 py-3 rounded-xl font-bold hover:brightness-95 transition text-center"
                >
                  Solicitar nuevo link
                </Link>
                <Link
                  to="/login"
                  className="block w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-sm transition text-center"
                >
                  Volver a iniciar sesión
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE HELPER: Requisito de contraseña
// ==========================================
function Requisito({ cumple, texto }) {
  return (
    <li
      className={`flex items-center gap-2 ${
        cumple ? "text-emerald-400" : "text-yellow-100/60"
      }`}
    >
      {cumple ? <Check size={14} /> : <X size={14} />}
      <span>{texto}</span>
    </li>
  );
}