import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    // Redirigir según el rol del usuario
    if (data.user.role === 'admin') {
      navigate("/admin");  // Si es admin, va al panel admin
    } else {
      navigate("/profile"); // Si es usuario normal, va a su perfil
    }
  } else {
        setMessage(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      setMessage("Error al iniciar sesión");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/fondo.png')" }}
    >
      {/* OVERLAY OSCURO REAL */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* HEADER */}
      <header className="relative z-10 flex items-center p-6">
        <img
          src="/ecosysval.png"
          alt="ECOSYSVAL"
          className="h-10 w-auto object-contain"
        />
      </header>

      {/* CONTENIDO */}
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
              <label className="block text-sm font-medium text-white mb-1">
                Contraseña
              </label>
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
              className="w-full bg-yellow-400 text-slate-900 py-2 rounded-lg font-semibold hover:brightness-95 transition"
            >
              Iniciar sesión
            </button>
          </form>

          {message && (
            <p className="text-center text-sm text-red-300 mt-4">
              {message}
            </p>
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
