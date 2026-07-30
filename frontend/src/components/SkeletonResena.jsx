// frontend/src/components/SkeletonResena.jsx
import React from "react";
import Skeleton, { SkeletonAvatar } from "./Skeleton";

/**
 * Skeleton loader que simula una tarjeta de reseña.
 */
export default function SkeletonResena() {
  return (
    <div className="rounded-2xl bg-[#0a1a30]/60 border border-white/10 p-4">
      {/* Header: Avatar + Info + Fecha */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <SkeletonAvatar size="md" />
          
          <div className="space-y-2">
            {/* Nombre empresa */}
            <Skeleton className="h-4 w-32" />
            {/* Estrellas */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-3.5 w-3.5" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Fecha */}
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Comentario (2 líneas) */}
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

/**
 * Skeleton completo de la sección de estadísticas de reseñas.
 * Simula el header con promedio + distribución.
 */
export function SkeletonEstadisticas() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#0a1a30]/60 rounded-2xl p-6 border border-white/5">
      {/* Promedio grande */}
      <div className="text-center md:border-r md:border-white/10 md:pr-6 space-y-3">
        <Skeleton className="h-14 w-20 mx-auto" />
        <div className="flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-6" />
          ))}
        </div>
        <Skeleton className="h-3 w-24 mx-auto" />
      </div>

      {/* Distribución de estrellas */}
      <div className="md:col-span-2 space-y-2">
        {[5, 4, 3, 2, 1].map((estrella) => (
          <div key={estrella} className="flex items-center gap-3">
            <Skeleton className="h-3.5 w-4" />
            <Skeleton className="h-3.5 w-3.5" />
            <div className="flex-1">
              <Skeleton className="h-2 w-full" rounded="full" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Lista de skeletons de reseñas.
 * 
 * Props:
 * - count: número de skeletons (default: 3)
 */
export function SkeletonResenaList({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonResena key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton completo de la sección de reseñas.
 * Combina estadísticas + lista.
 */
export function SkeletonResenasSection() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl p-6 md:p-8 shadow-2xl space-y-8">
      {/* Título */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-7 h-7" rounded="lg" />
        <Skeleton className="h-6 w-56" />
      </div>

      {/* Estadísticas */}
      <SkeletonEstadisticas />

      {/* Título "Todas las reseñas" */}
      <Skeleton className="h-5 w-48 mb-4" />

      {/* Lista de reseñas */}
      <SkeletonResenaList count={3} />
    </div>
  );
}