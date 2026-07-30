// frontend/src/components/Skeleton.jsx
import React from "react";

/**
 * Componente base para skeleton loaders.
 * Muestra un bloque gris con animación de pulso.
 * 
 * Props:
 * - className: clases extra de Tailwind (width, height, etc.)
 * - rounded: tipo de border-radius ('sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full')
 * - as: elemento HTML (default: 'div')
 * 
 * Ejemplos:
 *   <Skeleton className="h-4 w-32" />         → Línea de texto
 *   <Skeleton className="h-12 w-12" rounded="full" />  → Avatar circular
 *   <Skeleton className="h-40 w-full" rounded="2xl" /> → Imagen grande
 */
export default function Skeleton({
  className = "",
  rounded = "lg",
  as: Component = "div",
}) {
  const roundedMap = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-full",
    none: "",
  };

  return (
    <Component
      className={`
        bg-white/5 
        border border-white/5
        animate-pulse
        ${roundedMap[rounded] || "rounded-lg"}
        ${className}
      `}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton para líneas de texto (con variaciones de ancho)
 * 
 * Props:
 * - lines: número de líneas (default: 1)
 * - lastLineWidth: ancho de la última línea (default: '75%')
 * 
 * Ejemplo:
 *   <SkeletonText lines={3} />
 *   → Muestra 3 líneas de texto simuladas
 *     donde la última es más corta (más realista)
 */
export function SkeletonText({ lines = 1, lastLineWidth = "75%", className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5 w-full"
          style={
            i === lines - 1 && lines > 1
              ? { width: lastLineWidth }
              : undefined
          }
        />
      ))}
    </div>
  );
}

/**
 * Skeleton para un avatar (circular)
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 */
export function SkeletonAvatar({ size = "md", className = "" }) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <Skeleton
      rounded="full"
      className={`${sizeMap[size]} shrink-0 ${className}`}
    />
  );
}

/**
 * Skeleton para botones
 */
export function SkeletonButton({ className = "" }) {
  return <Skeleton className={`h-10 w-24 ${className}`} rounded="xl" />;
}

/**
 * Skeleton para imágenes/banners
 */
export function SkeletonImage({ className = "" }) {
  return <Skeleton className={`h-40 w-full ${className}`} rounded="2xl" />;
}