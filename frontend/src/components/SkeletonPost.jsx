// frontend/src/components/SkeletonPost.jsx
import React from "react";
import Skeleton, { SkeletonAvatar } from "./Skeleton";

/**
 * Skeleton loader que simula un PostCard del feed.
 * Estructura idéntica para transición sin saltos.
 */
export default function SkeletonPost() {
  return (
    <article className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-5 md:p-6">
      {/* ===== HEADER: Avatar + Nombre + Fecha ===== */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar de la empresa */}
          <SkeletonAvatar size="md" />

          {/* Nombre + fecha */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      {/* ===== CONTENIDO: Texto ===== */}
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      {/* ===== IMAGEN (simulada, aparece a veces) ===== */}
      <Skeleton className="mt-4 h-80 w-full" rounded="2xl" />
    </article>
  );
}

/**
 * Lista de múltiples SkeletonPost para el feed.
 * 
 * Props:
 * - count: número de skeletons (default: 3)
 */
export function SkeletonPostList({ count = 3 }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPost key={i} />
      ))}
    </div>
  );
}