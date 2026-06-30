import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, AlertCircle, Building2, User, Mail, Lock, MapPin, Globe, Eye, EyeOff } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { tipo: 'exito'|'error', texto: '' }
  
  const [formData, setFormData] = useState({
    // Datos del usuario
    name: "",
    email: "",
    password: "",
    
    // Datos de la empresa
    razonSocial: "",
    representante: "",
    ubicacion: "",
    paginaWeb: "",
    
    // Paquete
    paquete: "basico",
  });

  const paquetes = [
    {
      id: "basico",
      nombre: "BÁSICO",
      bgImage: "/Basico.png",
      gratis: true,
      caracteristicas: [
        "Perfil empresarial personalizado",
        "Incorporación al Ecosistema",
        "Posicionamiento estratégico en el mercado",
      ],
    },
    {
      id: "pro",
      nombre: "PRO",
      bgImage: "/Pro.png",
      gratis: false,
      caracteristicas: [
        "Perfil empresarial descargable",
        "Identificación de socios comerciales",
        "Integración de datos de valor",
      ],
    },
    {
      id: "premium",
      nombre: "PREMIUM",
      bgImage: "/Premium.png",
      gratis: false,
      caracteristicas: [
        "Propuestas comerciales con especificaciones técnicas",
        "Transacciones de compra-venta",
      ],
    },
    {
      id: "platino",
      nombre: "PLATINO",
      bgImage: "/Platino.png",
      gratis: false,
      caracteristicas: [
        "Sistema de crecimiento",
        "Recompensas",
        "Networking",
        "Financiamientos",
        "Desarrollar la plataforma",
      ],
    },
  ];

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const mostrarMensaje = (tipo, texto) => {
    setMessage({ tipo, texto });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validaciones
    if (formData.name.trim().length < 3) {
      mostrarMensaje("error", "El nombre debe tener al menos 3 caracteres");
      return;
    }
    if (!validateEmail(formData.email)) {
      mostrarMensaje("error", "Ingrese un correo válido");
      return;
    }
    if (formData.password.length < 6) {
      mostrarMensaje("error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (formData.razonSocial.trim().length < 3) {
      mostrarMensaje("error", "La razón social es obligatoria");
      return;
    }
    if (formData.representante.trim().length < 3) {
      mostrarMensaje("error", "El representante es obligatorio");
      return;
    }
    if (formData.ubicacion.trim().length < 3) {
      mostrarMensaje("error", "La ubicación es obligatoria");
      return;
    }

    try {
      setLoading(true);
      
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        mostrarMensaje("exito", "¡Empresa registrada correctamente! Redirigiendo al login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorData = await res.json();
        mostrarMensaje("error", errorData.message || "No se pudo registrar");
      }
    } catch (error) {
      console.error(error);
      mostrarMensaje("error", "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative py-8 px-4"
      style={{ backgroundImage: "url('/fondo.png')" }}
    >
      {/* OVERLAY OSCURO */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between mb-8">
        <img
          src="/ecosysval.png"
          alt="ECOSYSVAL"
          className="h-10 w-auto object-contain"
        />
      </header>

      {/* CONTENIDO */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-2xl p-6 md:p-8">
          
          {/* Título */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Registra tu Empresa
            </h2>
            <p className="text-gray-400 text-sm">
              Únete al ecosistema de cadenas de valor
            </p>
          </div>

          {/* Mensaje */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.tipo === "exito"
                  ? "bg-green-500/20 border border-green-500/40 text-green-300"
                  : "bg-red-500/20 border border-red-500/40 text-red-300"
              }`}
            >
              {message.tipo === "exito" ? <Check size={20} /> : <AlertCircle size={20} />}
              <span>{message.texto}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECCIÓN: CUENTA */}
            <div>
              <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={16} />
                Datos de la cuenta
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre de contacto */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Nombre de contacto *
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Email de la empresa *
                  </label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>

                {/* Contraseña */}
                <div className="md:col-span-2 relative">
                  <label className="block text-sm font-medium text-white mb-1">
                    Contraseña *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none pr-10"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN: EMPRESA */}
            <div>
              <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Building2 size={16} />
                Información de la empresa
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Razón social */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-1">
                    Razón social *
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre legal de la empresa"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                    value={formData.razonSocial}
                    onChange={(e) => handleChange("razonSocial", e.target.value)}
                    required
                  />
                </div>

                {/* Representante */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Representante legal *
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del representante"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                    value={formData.representante}
                    onChange={(e) => handleChange("representante", e.target.value)}
                    required
                  />
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Ubicación (Ciudad, Estado) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Guadalajara, Jalisco"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                    value={formData.ubicacion}
                    onChange={(e) => handleChange("ubicacion", e.target.value)}
                    required
                  />
                </div>

                {/* Página web (opcional) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-1">
                    Página web (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.tuempresa.com"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                    value={formData.paginaWeb}
                    onChange={(e) => handleChange("paginaWeb", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN: PAQUETES */}
            <div>
              <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-4 text-center">
                Selecciona tu paquete
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {paquetes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleChange("paquete", p.id)}
                    className={`relative flex flex-col rounded-2xl bg-white/10 backdrop-blur-md border-2 overflow-hidden shadow-xl transition-all duration-300 hover:translate-y-[-3px] ${
                      formData.paquete === p.id
                        ? "border-yellow-400 ring-4 ring-yellow-400/30 shadow-2xl"
                        : "border-white/20 opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* Indicador de seleccionado */}
                    {formData.paquete === p.id && (
                      <div className="absolute top-2 right-2 z-20 bg-yellow-400 text-black rounded-full p-1.5 shadow-lg">
                        <Check size={16} />
                      </div>
                    )}

                    {/* Imagen del plan */}
                    <div className="relative h-32 w-full overflow-hidden bg-white">
                      <img
                        src={p.bgImage}
                        alt={p.nombre}
                        className="w-full h-full object-contain p-2"
                        style={{ filter: 'brightness(1.1) contrast(1.1) saturate(1.05)' }}
                      />
                    </div>

                    {/* Contenido */}
                    <div className="p-3 flex flex-col flex-grow text-left">
                      {/* Nombre del plan */}
                      <h3 className="text-lg font-bold text-white text-center mb-2">
                        {p.nombre}
                      </h3>

                      {/* Badge GRATIS */}
                      {p.gratis && (
                        <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-2 font-bold text-center self-center">
                          GRATIS
                        </span>
                      )}

                      {/* Lista de características */}
                      <ul className="space-y-1 flex-grow">
                        {p.caracteristicas.map((c, i) => (
                          <li key={i} className="flex items-start text-xs">
                            <span className="text-yellow-300 mr-1 flex-shrink-0">•</span>
                            <span className="text-white/90 leading-tight">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-slate-900 py-3 rounded-lg font-bold text-lg hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Registrando...
                </>
              ) : (
                "Registrar mi empresa"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-white mt-6">
            ¿Ya tienes cuenta?{" "}
            <a 
              href="/login" 
              className="text-yellow-300 hover:underline font-semibold"
            >
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;