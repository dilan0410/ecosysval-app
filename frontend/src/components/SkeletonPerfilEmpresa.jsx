// frontend/src/components/SkeletonPerfilEmpresa.jsx
import React from "react";
import Skeleton from "./Skeleton";
import { SkeletonResenasSection } from "./SkeletonResena";

/**
 * Skeleton completo del perfil de empresa.
 * Se usa mientras carga /empresa/:id o /perfil
 */
export default function SkeletonPerfilEmpresa() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Botón volver */}
      <Skeleton className="h-5 w-20" />

      {/* ===== HEADER: Logo + Info principal ===== */}
      <div className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Banner simulado */}
        <Skeleton className="h-40 md:h-56 w-full" rounded="none" />

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Logo */}
            <Skeleton className="w-32 h-32 shrink-0" rounded="2xl" />

            {/* Info principal */}
            <div className="flex-1 space-y-4 w-full">
              {/* Razón social */}
              <Skeleton className="h-9 w-2/3" />

              {/* Sector */}
              <Skeleton className="h-4 w-1/2" />

              {/* Chips */}
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-7 w-24" rounded="full" />
                <Skeleton className="h-7 w-28" rounded="full" />
                <Skeleton className="h-7 w-32" rounded="full" />
                <Skeleton className="h-7 w-20" rounded="full" />
              </div>

              {/* Link página web */}
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Sección: Misión y Visión ===== */}
      <SkeletonSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      </SkeletonSection>

      {/* ===== Sección: Productos y Servicios ===== */}
      <SkeletonSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonList count={3} />
          <SkeletonList count={4} />
        </div>
      </SkeletonSection>

      {/* ===== Sección: Reseñas (completo) ===== */}
      <SkeletonResenasSection />
    </div>
  );
}

// ==========================================
// SUB-COMPONENTES REUTILIZABLES
// ==========================================

/**
 * Skeleton de una SectionCard (título + contenido)
 */
function SkeletonSection({ children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#071326]/85 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
      {/* Título de sección */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-7 h-7" rounded="lg" />
        <Skeleton className="h-6 w-64" />
      </div>
      {children}
    </div>
  );
}

/**
 * Skeleton de una lista con bullets
 */
function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-20" />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-2">
          <Skeleton className="h-3 w-3 mt-1 shrink-0" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}