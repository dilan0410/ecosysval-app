// frontend/src/pages/AdminConfiguracion.jsx
import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Sliders,
  Save,
  AlertTriangle,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminConfiguracion() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem("ecosysval_admin_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      nombreSitio: "Ecosysval",
      emailSoporte: "contacto@ecosysval.com",
      telefonoSoporte: "+52 55 1234 5678",
      skipEmailVerification: true,
      jwtExpiresIn: "24h",
      modoMantenimiento: false,
      mensajeMantenimiento: "El sistema está en mantenimiento programado. Volvemos pronto.",
      maxPalabrasProhibidas: "spam, estafa, fraude",
      autoAprobarResenas: true,
      maxPeticionesPorMinuto: 100,
    };
  });

  function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("ecosysval_admin_config", JSON.stringify(config));
      setSaving(false);
      toast.success("Configuración del sistema guardada con éxito");
    }, 600);
  }

  return (
    // MISMO WRAPPER DEL ADMIN.JSX
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Settings className="text-yellow-400" />
            Configuración
          </h1>
          <p className="text-gray-400">
            Parámetros globales, seguridad y moderación de la plataforma
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-lg"
        >
          <Save size={20} />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      {/* PESTAÑAS Y CONTENIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        
        {/* NAV LATERAL DE PESTAÑAS */}
        <div className="space-y-1 p-3 rounded-xl border border-yellow-500/20 bg-black/30 h-fit">
          <ConfigTabBtn
            id="general"
            label="General"
            icon={Globe}
            active={activeTab === "general"}
            onClick={() => setActiveTab("general")}
          />
          <ConfigTabBtn
            id="seguridad"
            label="Seguridad & Auth"
            icon={ShieldCheck}
            active={activeTab === "seguridad"}
            onClick={() => setActiveTab("seguridad")}
          />
          <ConfigTabBtn
            id="moderacion"
            label="Moderación"
            icon={Sliders}
            active={activeTab === "moderacion"}
            onClick={() => setActiveTab("moderacion")}
          />
          <ConfigTabBtn
            id="mantenimiento"
            label="Mantenimiento"
            icon={AlertTriangle}
            active={activeTab === "mantenimiento"}
            onClick={() => setActiveTab("mantenimiento")}
          />
        </div>

        {/* PANEL DE FORMULARIO */}
        <form onSubmit={handleSave} className="p-6 rounded-xl border border-yellow-500/20 bg-black/30 space-y-6 min-h-[500px]">
          
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-gray-700 pb-3">
                <h3 className="text-xl font-bold text-white">
                  Información del Ecosistema
                </h3>
                <p className="text-sm text-gray-400">Datos públicos de la plataforma de Ecosysval.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field
                  label="Nombre de la Plataforma"
                  value={config.nombreSitio}
                  onChange={(val) => setConfig({ ...config, nombreSitio: val })}
                />
                <Field
                  label="Email Oficial de Soporte"
                  value={config.emailSoporte}
                  onChange={(val) => setConfig({ ...config, emailSoporte: val })}
                />
              </div>

              <Field
                label="Teléfono de Contacto"
                value={config.telefonoSoporte}
                onChange={(val) => setConfig({ ...config, telefonoSoporte: val })}
              />
            </div>
          )}

          {/* TAB 2: SEGURIDAD */}
          {activeTab === "seguridad" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-gray-700 pb-3">
                <h3 className="text-xl font-bold text-white">
                  Seguridad y Autenticación JWT
                </h3>
                <p className="text-sm text-gray-400">Control de sesiones y límites de peticiones.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field
                  label="Duración del Access Token (JWT)"
                  value={config.jwtExpiresIn}
                  onChange={(val) => setConfig({ ...config, jwtExpiresIn: val })}
                />
                <Field
                  label="Límite Rate Limiting (Peticiones/min)"
                  type="number"
                  value={config.maxPeticionesPorMinuto}
                  onChange={(val) => setConfig({ ...config, maxPeticionesPorMinuto: val })}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-4 cursor-pointer p-5 rounded-xl border border-yellow-500/20 bg-black/40 hover:bg-white/5 transition">
                  <input
                    type="checkbox"
                    checked={config.skipEmailVerification}
                    onChange={(e) => setConfig({ ...config, skipEmailVerification: e.target.checked })}
                    className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                  />
                  <div>
                    <span className="text-base font-bold text-white">Modo Desarrollo: Saltar Verificación de Email</span>
                    <p className="text-sm text-gray-400 mt-1">Si está activo, los usuarios podrán iniciar sesión sin validar su correo electrónico. Ideal para pruebas.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: MODERACIÓN */}
          {activeTab === "moderacion" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-gray-700 pb-3">
                <h3 className="text-xl font-bold text-white">
                  Moderación de Contenidos
                </h3>
                <p className="text-sm text-gray-400">Reglas para reseñas y comentarios.</p>
              </div>

              <label className="flex items-start gap-4 cursor-pointer p-5 rounded-xl border border-yellow-500/20 bg-black/40 hover:bg-white/5 transition">
                <input
                  type="checkbox"
                  checked={config.autoAprobarResenas}
                  onChange={(e) => setConfig({ ...config, autoAprobarResenas: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                />
                <div>
                  <span className="text-base font-bold text-white">Auto-aprobar Reseñas Comerciales</span>
                  <p className="text-sm text-gray-400 mt-1">Las calificaciones se publicarán de inmediato. Si se desactiva, un admin deberá aprobarlas manualmente.</p>
                </div>
              </label>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Palabras Prohibidas (separadas por coma)</label>
                <textarea
                  rows={4}
                  value={config.maxPalabrasProhibidas}
                  onChange={(e) => setConfig({ ...config, maxPalabrasProhibidas: e.target.value })}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: MANTENIMIENTO */}
          {activeTab === "mantenimiento" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-red-500/30 pb-3">
                <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Modo Mantenimiento
                </h3>
                <p className="text-sm text-red-200/70">Restringe el acceso temporal a la plataforma.</p>
              </div>

              <label className="flex items-start gap-4 cursor-pointer p-5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition">
                <input
                  type="checkbox"
                  checked={config.modoMantenimiento}
                  onChange={(e) => setConfig({ ...config, modoMantenimiento: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-red-600 bg-gray-900 text-red-500 focus:ring-red-500"
                />
                <div>
                  <span className="text-base font-bold text-white">Activar Modo Mantenimiento</span>
                  <p className="text-sm text-red-200/70 mt-1">Cerrará el acceso al sistema para usuarios regulares. Los administradores podrán seguir ingresando.</p>
                </div>
              </label>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Mensaje a mostrar a los usuarios</label>
                <textarea
                  rows={3}
                  value={config.mensajeMantenimiento}
                  onChange={(e) => setConfig({ ...config, mensajeMantenimiento: e.target.value })}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Subcomponentes
function ConfigTabBtn({ label, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-semibold transition-colors ${
        active
          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
          : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
      />
    </div>
  );
}