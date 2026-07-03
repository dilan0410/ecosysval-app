// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  User,
  Lock,
  Globe,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Target,
  Package,
  Wrench,
  Leaf,
  Store,
  Truck,
  Plus,
  X,
  Check,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// ==========================================
// DATOS DE DROPDOWNS
// ==========================================

const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Coahuila de Zaragoza", "Colima", "Chiapas", "Chihuahua", "Ciudad de México",
  "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México",
  "Michoacán de Ocampo", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala",
  "Veracruz de Ignacio de la Llave", "Yucatán", "Zacatecas",
];

const OPCIONES_EMPLEADOS = [
  "0 - 5 empleados",
  "6 - 10 empleados",
  "11 - 30 empleados",
  "31 - 50 empleados",
  "51 - 100 empleados",
  "101 - 250 empleados",
  "251 a más empleados",
];

const OPCIONES_ANTIGUEDAD = [
  "Entre 6 meses y 1 año",
  "1 - 5 años",
  "5 - 10 años",
  "Más de 10 años",
];

const OPCIONES_VENTAS = [
  "Menos de $1.000.000 MXN",
  "Entre $1.000.000 y $5.000.000 MXN",
  "Entre $20.000.000 y $50.000.000 MXN",
  "Entre $50.000.000 y $100.000.000 MXN",
  "Más de $100.000.000 MXN",
];

const OPCIONES_AMBITO = ["Financiero", "Medio ambiental", "Social"];

const OPCIONES_ODS = [
  "1. Fin de la Pobreza",
  "2. Hambre Cero",
  "3. Salud y Bienestar",
  "4. Educación y Calidad",
  "5. Igualdad de Género",
  "6. Agua Limpia y Saneamiento",
  "7. Energía asequible y no Contaminante",
  "8. Trabajo Decente y Crecimiento Económico",
  "9. Industria Innovación e Infraestructura",
  "10. Reducción de las Desigualdades",
  "11. Ciudades y Comunidades Sostenibles",
  "12. Producción y consumo responsable",
  "13. Acción por el Clima",
  "14. Vida Submarina",
  "15. Vida de Ecosistemas Terrestres",
  "16. Paz, Justicia e Instituciones Sólidas",
  "17. Alianzas para Lograr los Objetivos",
];

const OPCIONES_OPERACIONES = ["Importación", "Exportación", "Ninguna"];

const OPCIONES_TRANSPORTE = [
  "Transporte aéreo",
  "Transporte ferroviario",
  "Transporte marítimo",
  "Transporte por carretera",
];

const PAQUETES = [
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

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Sección 1: Datos generales
    correoEmpresa: "",
    razonSocial: "",
    rfc: "",
    sectorScian: "",
    representante: "",
    paginaWeb: "",
    estado: "Aguascalientes",
    empleados: "0 - 5 empleados",
    antiguedad: "Entre 6 meses y 1 año",
    volumenVentas: "Menos de $1.000.000 MXN",
    ambito: "Financiero",

    // Sección 2: Misión y visión
    mision: "",
    vision: "",

    // Sección 3: Productos y servicios
    productos: [""],
    servicios: [""],

    // Sección 4: ODS
    ods: [],
    actividadesOds: [""],

    // Sección 5: Sucursales y socios
    tieneSucursales: false,
    tieneSocios: false,
    sucursales: [""],
    socios: [""],

    // Sección 6: Operaciones internacionales
    tiposOperaciones: [],
    paisesImportacion: [""],
    paisesExportacion: [""],
    transporteExtranjero: [],
    transporteNacional: [],

    // Sección 7: Logo
    logo: null,

    // Sección 8: Credenciales
    correoLogin: "",
    password: "",
    confirmPassword: "",
    aceptaTerminos: false,

    // Sección 9: Paquete
    paquete: "basico",
  });

  // ==========================================
  // HELPERS
  // ==========================================

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Manejar arrays dinámicos (productos, servicios, etc.)
  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length ? newArray : [""] });
  };

  // Manejar checkboxes múltiples (ODS, transporte, etc.)
  const handleCheckboxToggle = (field, value) => {
    const current = formData[field];
    const newArray = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: newArray });
  };

  // Validación de contraseña
  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password);
    return { hasMinLength, hasUppercase, hasLowercase, hasSymbol };
  };

  const passwordValidation = validatePassword(formData.password);
  const isPasswordValid =
    passwordValidation.hasMinLength &&
    passwordValidation.hasUppercase &&
    passwordValidation.hasLowercase &&
    passwordValidation.hasSymbol;

  // ==========================================
  // ENVÍO DEL FORMULARIO
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones básicas
    if (!formData.correoEmpresa || !formData.razonSocial || !formData.rfc) {
      setError("Por favor completa los campos obligatorios de la empresa.");
      return;
    }

    if (!formData.correoLogin || !formData.password) {
      setError("Por favor completa las credenciales de acceso.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!isPasswordValid) {
      setError("La contraseña no cumple con los requisitos.");
      return;
    }

    setLoading(true);

    try {
      // 1. Crear el usuario
      const userRes = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.representante,
        email: formData.correoLogin,
        password: formData.password,
      }),
    });

    if (!userRes.ok) {
      const errData = await userRes.json();
      throw new Error(errData.message || "Error al crear usuario");
    }

    const userResponse = await userRes.json();

      // El backend devuelve: { success, message, user: { id, ... } }
      if (!userResponse.success || !userResponse.user?.id) {
        throw new Error(userResponse.message || "Error al crear usuario");
      }

      const userData = userResponse.user;

      // 2. Limpiar arrays vacíos
      const cleanArray = (arr) =>
        Array.isArray(arr) ? arr.filter((item) => item && item.trim() !== "") : [];

      // 3. Crear la empresa vinculada al usuario
      const empresaPayload = {
        // Datos generales
        razonSocial: formData.razonSocial,
        correo: formData.correoEmpresa,
        rfc: formData.rfc,
        sectorScian: formData.sectorScian,
        representante: formData.representante,
        paginaWeb: formData.paginaWeb,
        estado: formData.estado,
        empleados: formData.empleados,
        antiguedad: formData.antiguedad,
        volumenVentas: formData.volumenVentas,
        ambito: formData.ambito,

        // Misión y visión
        mision: formData.mision,
        vision: formData.vision,

        // Productos y servicios
        productos: cleanArray(formData.productos),
        servicios: cleanArray(formData.servicios),

        // ODS
        ods: formData.ods,
        actividadesOds: cleanArray(formData.actividadesOds),

        // Sucursales y socios
        tieneSucursales: formData.tieneSucursales,
        tieneSocios: formData.tieneSocios,
        sucursales: cleanArray(formData.sucursales),
        socios: cleanArray(formData.socios),

        // Operaciones
        tiposOperaciones: formData.tiposOperaciones,
        paisesImportacion: cleanArray(formData.paisesImportacion),
        paisesExportacion: cleanArray(formData.paisesExportacion),
        transporteExtranjero: formData.transporteExtranjero,
        transporteNacional: formData.transporteNacional,

        // Sistema
        userId: userData.id,
        paquete: formData.paquete,
      };

      // NOTA: El backend ya crea empresa básica al crear user.
      // Necesitamos ACTUALIZAR esa empresa con los datos completos.
      // Primero buscamos la empresa del usuario
      const empresasRes = await fetch(`${API_URL}/empresas`);
      const todasEmpresas = await empresasRes.json();
      const miEmpresaCreada = todasEmpresas.find((e) => e.userId === userData.id);

      let empresaFinal;

      if (miEmpresaCreada) {
        // Ya existe una empresa creada por el backend → ACTUALIZAR con todos los datos
        const updateRes = await fetch(`${API_URL}/empresas/${miEmpresaCreada.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(empresaPayload),
        });
        if (!updateRes.ok) throw new Error("Error al actualizar empresa");
        empresaFinal = await updateRes.json();
      } else {
        // No existe empresa → CREAR nueva
        const empresaRes = await fetch(`${API_URL}/empresas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(empresaPayload),
        });
        if (!empresaRes.ok) throw new Error("Error al crear empresa");
        empresaFinal = await empresaRes.json();
      }

      setSuccess("¡Empresa registrada correctamente! Redirigiendo...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Ocurrió un error al registrar.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative py-8 px-4"
      style={{ backgroundImage: "url('/fondo.png')" }}
    >
      {/* OVERLAY OSCURO REAL - igual que Login */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header con logo */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Formulario de registro
            </h1>
            <p className="text-white/60 mt-2">Complete los campos para continuar.</p>
          </div>
          <img
            src="/ecosysval.png"
            alt="Ecosysval"
            className="h-16 md:h-20 w-auto object-contain"
          />
        </div>

        {/* Errores y éxito */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200">
             {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/40 text-green-200">
             {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ============================================ */}
          {/* SECCIÓN 1: Datos generales */}
          {/* ============================================ */}
          <Section icon={<Building2 />} title="Datos generales de la empresa">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Correo electrónico de la empresa *"
                placeholder="correo@empresa.com"
                type="email"
                value={formData.correoEmpresa}
                onChange={(v) => handleChange("correoEmpresa", v)}
              />
              <Input
                label="Razón social de la empresa *"
                placeholder="Razón social"
                value={formData.razonSocial}
                onChange={(v) => handleChange("razonSocial", v)}
              />
              <Input
                label="RFC de la empresa *"
                placeholder="XXX-AAMMDD-XXX"
                value={formData.rfc}
                onChange={(v) => handleChange("rfc", v.toUpperCase())}
              />
              <Input
                label="Sector según SCIAN México *"
                placeholder="0000"
                value={formData.sectorScian}
                onChange={(v) => handleChange("sectorScian", v)}
              />
              <Input
                label="Representante legal *"
                placeholder="Nombre completo"
                value={formData.representante}
                onChange={(v) => handleChange("representante", v)}
              />
              <Input
                label="Página web de la empresa"
                placeholder="https://www.empresa.com"
                value={formData.paginaWeb}
                onChange={(v) => handleChange("paginaWeb", v)}
              />
              <Select
                label="¿En qué estado de la república se encuentra la empresa? *"
                value={formData.estado}
                onChange={(v) => handleChange("estado", v)}
                options={ESTADOS_MEXICO}
              />
              <Select
                label="¿Cuántos empleados tiene su empresa? *"
                value={formData.empleados}
                onChange={(v) => handleChange("empleados", v)}
                options={OPCIONES_EMPLEADOS}
              />
              <Select
                label="Antigüedad de la empresa *"
                value={formData.antiguedad}
                onChange={(v) => handleChange("antiguedad", v)}
                options={OPCIONES_ANTIGUEDAD}
              />
              <Select
                label="Volumen de ventas anual de la empresa *"
                value={formData.volumenVentas}
                onChange={(v) => handleChange("volumenVentas", v)}
                options={OPCIONES_VENTAS}
              />
              <Select
                label="Ámbito de su misión y visión de la empresa *"
                value={formData.ambito}
                onChange={(v) => handleChange("ambito", v)}
                options={OPCIONES_AMBITO}
              />
            </div>
          </Section>

          {/* ============================================ */}
          {/* SECCIÓN 2: Misión y visión */}
          {/* ============================================ */}
          <Section icon={<Target />} title="Misión y visión">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="¿Cuál es la misión de la empresa? *"
                value={formData.mision}
                onChange={(v) => handleChange("mision", v)}
                rows={3}
              />
              <Textarea
                label="¿Cuál es la visión de la empresa? *"
                value={formData.vision}
                onChange={(v) => handleChange("vision", v)}
                rows={3}
              />
            </div>
          </Section>

          {/* ============================================ */}
          {/* SECCIÓN 3: Productos y servicios */}
          {/* ============================================ */}
          <Section icon={<Package />} title="Productos y servicios">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DynamicList
                label="¿Qué productos ofrece la empresa?"
                subtitle="En cada casilla solo puede ir un producto."
                items={formData.productos}
                onChange={(i, v) => handleArrayChange("productos", i, v)}
                onAdd={() => addArrayItem("productos")}
                onRemove={(i) => removeArrayItem("productos", i)}
              />
              <DynamicList
                label="¿Qué servicios ofrece la empresa?"
                subtitle="En cada casilla solo puede ir un servicio."
                items={formData.servicios}
                onChange={(i, v) => handleArrayChange("servicios", i, v)}
                onAdd={() => addArrayItem("servicios")}
                onRemove={(i) => removeArrayItem("servicios", i)}
              />
            </div>
          </Section>

          {/* ============================================ */}
          {/* SECCIÓN 4: ODS */}
          {/* ============================================ */}
          <Section icon={<Leaf />} title="Objetivos de Desarrollo Sostenible (ODS)">
            <p className="text-white/70 text-sm mb-4">
              ¿La empresa promueve alguno de los Objetivos de Desarrollo Sostenible?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
              {OPCIONES_ODS.map((ods, index) => {
                const odsNum = index + 1;
                return (
                  <Checkbox
                    key={odsNum}
                    label={ods}
                    checked={formData.ods.includes(odsNum)}
                    onChange={() => handleCheckboxToggle("ods", odsNum)}
                  />
                );
              })}
            </div>
            <DynamicList
              label="¿Qué actividades realiza la empresa para promover las iniciativas anteriores?"
              subtitle="En cada casilla solo puede ir una actividad."
              items={formData.actividadesOds}
              onChange={(i, v) => handleArrayChange("actividadesOds", i, v)}
              onAdd={() => addArrayItem("actividadesOds")}
              onRemove={(i) => removeArrayItem("actividadesOds", i)}
            />
          </Section>

          {/* ============================================ */}
          {/* SECCIÓN 5: Sucursales y socios */}
          {/* ============================================ */}
          <Section icon={<Store />} title="Sucursales y socios comerciales">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <RadioGroup
                label="¿La empresa cuenta con sucursales?"
                value={formData.tieneSucursales}
                onChange={(v) => handleChange("tieneSucursales", v)}
              />
              <RadioGroup
                label="¿La empresa tiene socios comerciales?"
                value={formData.tieneSocios}
                onChange={(v) => handleChange("tieneSocios", v)}
              />
            </div>

            {formData.tieneSucursales && (
              <div className="mb-6">
                <DynamicList
                  label="¿En qué estados de la república se ubican las sucursales?"
                  subtitle="En cada casilla solo puede ir un estado."
                  items={formData.sucursales}
                  onChange={(i, v) => handleArrayChange("sucursales", i, v)}
                  onAdd={() => addArrayItem("sucursales")}
                  onRemove={(i) => removeArrayItem("sucursales", i)}
                />
              </div>
            )}

            {formData.tieneSocios && (
              <DynamicList
                label="¿Cuáles son los cinco principales socios comerciales?"
                subtitle="En cada casilla solo puede ir un socio comercial."
                items={formData.socios}
                onChange={(i, v) => handleArrayChange("socios", i, v)}
                onAdd={() => addArrayItem("socios")}
                onRemove={(i) => removeArrayItem("socios", i)}
              />
            )}
          </Section>

          {/* ============================================ */}
          {/* SECCIÓN 6: Operaciones internacionales */}
          {/* ============================================ */}
          <Section icon={<Truck />} title="Operaciones internacionales">
            <div className="mb-6">
              <p className="text-white/90 font-semibold mb-3">
                ¿Qué tipos de operaciones realiza su empresa?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {OPCIONES_OPERACIONES.map((op) => (
                  <Checkbox
                    key={op}
                    label={op}
                    checked={formData.tiposOperaciones.includes(op)}
                    onChange={() => handleCheckboxToggle("tiposOperaciones", op)}
                  />
                ))}
              </div>
            </div>

            {formData.tiposOperaciones.includes("Importación") && (
              <div className="mb-6">
                <DynamicList
                  label="¿Con qué países realizas actividades de importación?"
                  subtitle="En cada casilla solo puede ir un país."
                  items={formData.paisesImportacion}
                  onChange={(i, v) =>
                    handleArrayChange("paisesImportacion", i, v)
                  }
                  onAdd={() => addArrayItem("paisesImportacion")}
                  onRemove={(i) => removeArrayItem("paisesImportacion", i)}
                />
              </div>
            )}

            {formData.tiposOperaciones.includes("Exportación") && (
              <div className="mb-6">
                <DynamicList
                  label="¿Con qué países realizas actividades de exportación?"
                  subtitle="En cada casilla solo puede ir un país."
                  items={formData.paisesExportacion}
                  onChange={(i, v) =>
                    handleArrayChange("paisesExportacion", i, v)
                  }
                  onAdd={() => addArrayItem("paisesExportacion")}
                  onRemove={(i) => removeArrayItem("paisesExportacion", i)}
                />
              </div>
            )}

            <div className="mb-6">
              <p className="text-white/90 font-semibold mb-3">
                ¿Qué medios de transporte utiliza para movimientos en el
                extranjero?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {OPCIONES_TRANSPORTE.map((t) => (
                  <Checkbox
                    key={`ext-${t}`}
                    label={t}
                    checked={formData.transporteExtranjero.includes(t)}
                    onChange={() =>
                      handleCheckboxToggle("transporteExtranjero", t)
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/90 font-semibold mb-3">
                ¿Qué medios de transporte usa para movimientos nacionales?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {OPCIONES_TRANSPORTE.map((t) => (
                  <Checkbox
                    key={`nac-${t}`}
                    label={t}
                    checked={formData.transporteNacional.includes(t)}
                    onChange={() =>
                      handleCheckboxToggle("transporteNacional", t)
                    }
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* ============================================ */}
          {/* SECCIÓN 7: Logo */}
          {/* ============================================ */}
          <Section icon={<Upload />} title="Logo de la empresa">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-2xl p-8 cursor-pointer hover:border-yellow-400/60 transition bg-white/5">
              <Upload className="w-12 h-12 text-white/40 mb-3" />
              <p className="text-white/70 text-center">
                {formData.logo
                  ? `Archivo: ${formData.logo.name}`
                  : "Haga click para subir el logo de la empresa"}
              </p>
              <p className="text-white/40 text-xs mt-2">
                SVG, PNG, JPG (MAX. 800x600px)
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleChange("logo", e.target.files[0])}
              />
            </label>
          </Section>

          {/* ============================================ */}
          {/* SECCIÓN 8: Credenciales */}
          {/* ============================================ */}
          <Section icon={<Lock />} title="Credenciales de ingreso">
            <div className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-yellow-200 text-sm font-semibold mb-2">
                Su contraseña debe estar compuesta mínimamente por:
              </p>
              <ul className="text-yellow-100/80 text-sm space-y-1">
                <li className={passwordValidation.hasMinLength ? "text-green-400" : ""}>
                  {passwordValidation.hasMinLength ? "✓" : "•"} 8 caracteres
                </li>
                <li className={passwordValidation.hasUppercase ? "text-green-400" : ""}>
                  {passwordValidation.hasUppercase ? "✓" : "•"} Una mayúscula
                </li>
                <li className={passwordValidation.hasLowercase ? "text-green-400" : ""}>
                  {passwordValidation.hasLowercase ? "✓" : "•"} Una minúscula
                </li>
                <li className={passwordValidation.hasSymbol ? "text-green-400" : ""}>
                  {passwordValidation.hasSymbol ? "✓" : "•"} Un símbolo
                </li>
              </ul>
              <p className="text-yellow-200/60 text-xs mt-2 italic">
                Por ejemplo: t$PaTd9c
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Correo electrónico *"
                placeholder="correo@empresa.com"
                type="email"
                value={formData.correoLogin}
                onChange={(v) => handleChange("correoLogin", v)}
              />
              <div></div>

              <div>
                <label className="text-white/90 text-sm font-semibold mb-2 block">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Contraseña"
                    className="w-full px-4 py-3 pr-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-white/90 text-sm font-semibold mb-2 block">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirmar contraseña"
                    className="w-full px-4 py-3 pr-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Checkbox
                label="Acepto los términos y condiciones."
                checked={formData.aceptaTerminos}
                onChange={() =>
                  handleChange("aceptaTerminos", !formData.aceptaTerminos)
                }
              />
            </div>
          </Section>

          {/* ============================================ */}
          {/* SECCIÓN 9: Paquetes */}
          {/* ============================================ */}
          <Section icon={<Check />} title="Selecciona tu paquete">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PAQUETES.map((p) => (
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
                  {formData.paquete === p.id && (
                    <div className="absolute top-2 right-2 z-20 bg-yellow-400 text-black rounded-full p-1.5 shadow-lg">
                      <Check size={16} />
                    </div>
                  )}
                  <div className="relative h-32 w-full overflow-hidden bg-white">
                    <img
                      src={p.bgImage}
                      alt={p.nombre}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-grow text-left">
                    <h3 className="text-lg font-bold text-white text-center mb-2">
                      {p.nombre}
                    </h3>
                    {p.gratis && (
                      <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-2 font-bold text-center self-center">
                        GRATIS
                      </span>
                    )}
                    <ul className="space-y-1 flex-grow">
                      {p.caracteristicas.map((c, i) => (
                        <li key={i} className="flex items-start text-xs">
                          <span className="text-yellow-300 mr-1">•</span>
                          <span className="text-white/90 leading-tight">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* Botón de registro */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 text-lg font-bold rounded-2xl shadow-lg transition"
          >
            {loading ? "Registrando..." : "Registrar mi empresa"}
          </button>

          <p className="text-center text-white/60 mt-4">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-yellow-400 font-semibold hover:underline"
            >
              Inicia sesión
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTES UI REUTILIZABLES
// ==========================================

function Section({ icon, title, children }) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-yellow-400">{icon}</div>
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="text-white/90 text-sm font-semibold mb-2 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-white/90 text-sm font-semibold mb-2 block">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
      >
        {options.map((op) => (
          <option key={op} value={op} className="bg-slate-800 text-white">
            {op}
          </option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className="text-white/90 text-sm font-semibold mb-2 block">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 resize-none"
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-white/90 hover:text-white transition">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded accent-yellow-400"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function RadioGroup({ label, value, onChange }) {
  return (
    <div>
      <p className="text-white/90 font-semibold mb-3">{label}</p>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-white/90">
          <input
            type="radio"
            checked={value === true}
            onChange={() => onChange(true)}
            className="w-4 h-4 accent-yellow-400"
          />
          <span>Sí</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-white/90">
          <input
            type="radio"
            checked={value === false}
            onChange={() => onChange(false)}
            className="w-4 h-4 accent-yellow-400"
          />
          <span>No</span>
        </label>
      </div>
    </div>
  );
}

function DynamicList({ label, subtitle, items, onChange, onAdd, onRemove }) {
  return (
    <div>
      <label className="text-white/90 text-sm font-semibold block">
        {label}
      </label>
      {subtitle && (
        <p className="text-white/50 text-xs mb-2">{subtitle}</p>
      )}
      <button
        type="button"
        onClick={onAdd}
        className="mb-3 inline-flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-semibold"
      >
        <Plus size={16} /> Agregar
      </button>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(index, e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-400 hover:text-red-300 px-2"
              >
                <X size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}