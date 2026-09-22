import React from "react";

function Subscribe() {
  const plans = [
    { 
      name: "Básico", 
      bgImage: "/Basico.png",
      features: [
        "Perfil empresarial personalizado",
        "Incorporación al Ecosistema",
        "Posicionamiento estratégico en el mercado"
      ]
    },
    { 
      name: "Pro", 
      bgImage: "/Pro.png",
      features: [
        "Perfil empresarial descargable",
        "Identificación de socios comerciales",
        "Integración de datos de valor"
      ]
    },
    { 
      name: "Premium", 
      bgImage: "/Premium.png",
      features: [
        "Propuestas comerciales con especificaciones técnicas",
        "Transacciones de compra-venta"
      ]
    },
    { 
      name: "Platino", 
      bgImage: "/Platino.png",
      features: [
        "Sistema de crecimiento",
        "Recompensas",
        "Networking",
        "Financiamientos",
        "Desarrollar la plataforma"
      ]
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/fondo.png')" }}
    >
      {/* OVERLAY OSCURO MÁS CLARO */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* HEADER */}
      <header className="relative z-10 flex items-center p-6">
        <img
          src="/ecosysval.png"
          alt="ECOSYSVAL"
          width="160"
          height="40"
          className="h-10 w-auto object-contain"
        />
      </header>

      {/* CONTENIDO */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-10">
        <div className="w-full max-w-6xl">
          {/* Título principal */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Elige tu Plan
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Selecciona el plan que mejor se adapte a las necesidades de tu empresa
            </p>
          </div>

          {/* Grid de tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className="flex flex-col rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-5px]"
              >
                {/* Imagen OPTIMIZADA */}
                <div
                  className="relative h-56 w-full overflow-hidden bg-white"
                >
                  <img
                    src={plan.bgImage}
                    alt={plan.name}
                    loading="lazy"
                    width="256"
                    height="224"
                    className="w-full h-full object-contain p-4 brightness-100 contrast-125"
                    style={{ filter: 'brightness(1.1) contrast(1.1) saturate(1.05)' }}
                  />
                </div>

                {/* Contenido */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Nombre del plan DEBAJO de la imagen */}
                  <h3 className="text-2xl font-bold text-white text-center mb-4">
                    {plan.name.toUpperCase()}
                  </h3>

                  {/* Lista de características */}
                  <ul className="space-y-3 mb-6 flex-grow">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-300 mr-2">•</span>
                        <span className="text-white/90 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Botón */}
                  <button className="w-full bg-yellow-400 text-slate-900 py-3 rounded-lg hover:bg-yellow-300 hover:shadow-lg transition-all duration-300 font-semibold text-lg">
                    Suscribirse
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="mt-16 text-center pt-8 border-t border-white/20">
            <p className="text-white/80">
              ¿Necesitas ayuda para elegir?{" "}
              <a 
                href="/contacto" 
                className="text-yellow-300 hover:text-yellow-400 hover:underline font-medium"
              >
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subscribe;