// frontend/src/utils/animations.js
/**
 * Animaciones globales reutilizables con Framer Motion
 * ------------------------------------------------------
 * Uso consistente en toda la aplicación Ecosysval
 */

// ==========================================
// FADE IN suave (para paginas y contenedores)
// ==========================================
export const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: "easeOut" },
};

// ==========================================
// FADE IN rapido (para elementos pequeños)
// ==========================================
export const fadeInFast = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

// ==========================================
// SLIDE UP (mensajes de chat - vienen desde abajo)
// ==========================================
export const slideUp = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
};

// ==========================================
// SLIDE FROM RIGHT (para paneles laterales)
// ==========================================
export const slideFromRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: 0.3, ease: "easeOut" },
};

// ==========================================
// SLIDE FROM LEFT (para notificaciones)
// ==========================================
export const slideFromLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: "easeOut" },
};

// ==========================================
// SCALE IN (para modales y popups)
// ==========================================
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.25, ease: "easeOut" },
};

// ==========================================
// STAGGER CONTAINER (para listas con efecto cascada)
// ==========================================
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05, // Cada hijo aparece 50ms después del anterior
      delayChildren: 0.1,
    },
  },
};

// ==========================================
// STAGGER ITEM (hijo del stagger container)
// ==========================================
export const staggerItem = {
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// ==========================================
// PAGE TRANSITION (transición entre páginas)
// ==========================================
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

// ==========================================
// TYPING BOUNCE (para el indicador "escribiendo...")
// ==========================================
export const typingBounce = {
  animate: {
    y: [0, -4, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ==========================================
// HOVER EFFECTS
// ==========================================
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.15 },
};

export const hoverLift = {
  whileHover: { y: -2, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)" },
  transition: { duration: 0.2 },
};