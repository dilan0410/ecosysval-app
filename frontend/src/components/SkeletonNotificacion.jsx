// frontend/src/components/SkeletonNotificacion.jsx
import React from "react";
import Skeleton from "./Skeleton";

/**
 * Skeleton loader que simula una NotificacionCard.
 * Estructura idéntica para transición sin saltos.
 */
export default function SkeletonNotificacion() {
  return (
    <article
      className="
        rounded-2xl border border-white/10 
        bg-black/20 backdrop-blur
        p-4 md:p-5 
        flex items-start justify-between gap-4
      "
    >
      <div className="flex items-start gap-4 min-w-0 flex-1">
        {/* Icono */}
        <Skeleton className="h-11 w-11 shrink-0" rounded="2xl" />

        <div className="min-w-0 flex-1 space-y-2">
          {/* Badges (tipo + nuevo) */}
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-24" rounded="full" />
            <Skeleton className="h-5 w-16" rounded="full" />
          </div>

          {/* Título */}
          <Skeleton className="h-4 w-3/5 mt-2" />

          {/* Mensaje (2 líneas) */}
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>

      {/* Fecha */}
      <div className="shrink-0">
        <Skeleton className="h-3 w-16" />
      </div>
    </article>
  );
}

/**
 * Lista de skeletons para notificaciones.
 * 
 * Props:
 * - count: número de skeletons (default: 4)
 */
export function SkeletonNotificacionList({ count = 4 }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonNotificacion key={i} />
      ))}
    </div>
  );
}