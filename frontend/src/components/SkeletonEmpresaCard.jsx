// frontend/src/components/SkeletonEmpresaCard.jsx
import React from "react";
import Skeleton, { SkeletonText } from "./Skeleton";

/**
 * Skeleton loader que simula una EmpresaCard.
 * Debe verse idéntico en estructura para evitar 
 * saltos de layout cuando se cargan los datos reales.
 */
export default function SkeletonEmpresaCard() {
  return (
    <article className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* ===== HEADER: Logo + Plan ===== */}
      <div className="p-5 pb-3 flex items-start justify-between gap-3">
        {/* Logo */}
        <Skeleton className="w-16 h-16" rounded="2xl" />

        {/* Badge de plan */}
        <Skeleton className="h-5 w-14" rounded="full" />
      </div>

      {/* ===== CONTENIDO ===== */}
      <div className="px-5 pb-5">
        {/* Nombre (2 líneas simuladas) */}
        <div className="space-y-2 mb-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-3/5" />
        </div>

        {/* Sector */}
        <Skeleton className="h-3.5 w-2/3 mb-4" />

        {/* Chips: Estado + Empleados */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-6 w-24" rounded="full" />
          <Skeleton className="h-6 w-28" rounded="full" />
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </article>
  );
}

/**
 * Grid de múltiples SkeletonEmpresaCard.
 * Útil para mostrar mientras cargan las empresas.
 * 
 * Props:
 * - count: número de skeletons a mostrar (default: 6)
 */
export function SkeletonEmpresaGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonEmpresaCard key={i} />
      ))}
    </div>
  );
}