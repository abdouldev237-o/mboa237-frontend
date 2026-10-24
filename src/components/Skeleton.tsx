// src/components/Skeleton.tsx
/**
 * Bibliothèque de skeletons — utilisés partout pendant les fetch.
 * Aucun ne fait plus de 50 lignes, aucun ne dépend d'une lib externe.
 */
import type { CSSProperties } from "react";

/* =========================================================
   BASE
   ========================================================= */
interface BoxProps {
  className?: string;
  style?: CSSProperties;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function SkeletonBox({
  className = "",
  style,
  rounded = "md",
}: BoxProps) {
  const r =
    rounded === "sm"
      ? "rounded"
      : rounded === "full"
      ? "rounded-full"
      : `rounded-${rounded}`;
  return <div className={`skeleton ${r} ${className}`} style={style} />;
}

/* =========================================================
   LIGNES DE TEXTE
   ========================================================= */
export function SkeletonText({
  lines = 3,
  widths,
  className = "",
}: {
  lines?: number;
  widths?: string[];
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          className="h-4"
          style={{ width: widths?.[i] ?? (i === lines - 1 ? "70%" : "100%") }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   CARTE PRODUIT (grille)
   ========================================================= */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
      <SkeletonBox className="aspect-square w-full" rounded="sm" />
      <div className="space-y-2 p-4">
        <SkeletonBox className="h-3 w-16" />
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="mt-3 h-5 w-1/2" />
        <SkeletonBox className="mt-2 h-10 w-full rounded-full" rounded="full" />
      </div>
    </div>
  );
}

/* =========================================================
   CARTE PRODUIT (ligne mobile)
   ========================================================= */
export function ProductRowSkeleton() {
  return (
    <div className="flex gap-3.5 rounded-2xl bg-white p-3 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
      <SkeletonBox className="h-[112px] w-[112px] shrink-0" rounded="lg" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <SkeletonBox className="h-5 w-20" rounded="full" />
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="mt-auto h-5 w-1/3" />
        <SkeletonBox className="h-9 w-full rounded-full" rounded="full" />
      </div>
    </div>
  );
}

/* =========================================================
   GRILLE PRODUITS
   ========================================================= */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductRowSkeleton key={i} />
      ))}
    </div>
  );
}

/* =========================================================
   EN-TÊTE SHOP (bannière + avatar + infos)
   ========================================================= */
export function ShopHeaderSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white">
      <SkeletonBox className="h-48 w-full lg:h-56" rounded="sm" />
      <div className="relative px-6 pb-6 pt-4 lg:px-8">
        <div className="-mt-16 flex items-end gap-5">
          <SkeletonBox className="h-24 w-24 shrink-0 lg:h-28 lg:w-28" rounded="2xl" />
          <div className="flex-1 space-y-3 pb-1">
            <SkeletonBox className="h-7 w-48" />
            <div className="flex gap-3">
              <SkeletonBox className="h-4 w-24" />
              <SkeletonBox className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CARTE STAT (dashboard)
   ========================================================= */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
      <SkeletonBox className="h-9 w-9" rounded="lg" />
      <SkeletonBox className="mt-3 h-7 w-20" />
      <SkeletonBox className="mt-2 h-3 w-24" />
    </div>
  );
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* =========================================================
   CATÉGORIES (chips horizontales)
   ========================================================= */
export function CategoryChipsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBox key={i} className="h-9 w-24 shrink-0" rounded="full" />
      ))}
    </div>
  );
}

/* =========================================================
   PAGE COMPLÈTE DE BOUTIQUE
   ========================================================= */
export function ShopPageSkeleton() {
  return (
    <div className="container-app space-y-6 py-6">
      <ShopHeaderSkeleton />

      <div className="flex gap-2 overflow-hidden">
        <CategoryChipsSkeleton />
      </div>

      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <SkeletonBox className="h-6 w-48" />
          <SkeletonBox className="h-3 w-24" />
        </div>
        <SkeletonBox className="h-9 w-20" rounded="full" />
      </div>

      <ProductGridSkeleton />
    </div>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */
export function DashboardSkeleton() {
  return (
    <div className="container-app space-y-6 py-8">
      <SkeletonBox className="h-8 w-64" />
      <StatsGridSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonBox className="h-64 w-full" rounded="2xl" />
        <SkeletonBox className="h-64 w-full" rounded="2xl" />
      </div>
    </div>
  );
}