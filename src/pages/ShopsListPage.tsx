// src/pages/ShopsListPage.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Grid3X3,
  LayoutGrid,
  MapPin,
  Package,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  X,
} from "lucide-react";
import { getErrorMessage, publicApi } from "@/lib/api";
import type { Shop } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { SkeletonBox } from "@/components/Skeleton";

type SortKey = "recent" | "name" | "products";
type ViewMode = "grid" | "list";

export default function ShopsListPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<ViewMode>("grid");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await publicApi.listShops({ search: search.trim() || undefined });
      setShops(res.results);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(id);
  }, [load]);

  /* Villes disponibles */
  const cities = useMemo(() => {
    const set = new Set<string>();
    shops.forEach((s) => s.city && set.add(s.city));
    return Array.from(set).sort();
  }, [shops]);

  /* Shops filtrés + triés */
  const visible = useMemo(() => {
    let arr = shops.filter((s) => !activeCity || s.city === activeCity);
    if (sort === "name") arr = [...arr].sort((a, b) => a.shop_name.localeCompare(b.shop_name));
    if (sort === "products") arr = [...arr].sort((a, b) => b.products_count - a.products_count);
    return arr;
  }, [shops, activeCity, sort]);

  const hasFilters = !!activeCity || !!search.trim();

  return (
    <main className="min-h-[70vh] bg-[#f8faf9] pb-16">
      <style>{`
        @keyframes shops-enter { from { opacity:0; transform:translateY(15px) } to {opacity:1; transform:translateY(0)} }
        .shops-enter { animation:shops-enter .55s cubic-bezier(.2,.7,.2,1) both }
        @keyframes float-slow { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(10px,-8px,0) scale(1.05); } }
        .shops-float { animation:float-slow 14s ease-in-out infinite; }
        @media(prefers-reduced-motion:reduce){.shops-enter,.shops-float{animation:none!important}}
      `}</style>

      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#052e25] via-[#066345] to-[#0e9f6e] px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute right-24 top-16 h-44 w-44 rounded-full bg-emerald-300/10 blur-2xl shops-float" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_30%,black,transparent_80%)]" />

        <div className="shops-enter relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide text-emerald-50 backdrop-blur">
            <Sparkles size={14} /> Le commerce près de chez toi
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-[-.05em] sm:text-5xl lg:text-6xl">
            Découvre les boutiques <span className="text-emerald-200">Mboa237</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-emerald-50/80 sm:text-lg">
            Des commerçants, des produits et de belles découvertes. Trouve ta prochaine boutique
            préférée.
          </p>

          {/* Search */}
          <div className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/30 bg-white p-2 shadow-2xl shadow-emerald-950/20 focus-within:ring-4 focus-within:ring-white/20">
            <Search className="ml-2 shrink-0 text-emerald-800" size={21} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom d'une boutique, commerçant…"
              aria-label="Rechercher une boutique"
              className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Effacer"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Stats mini */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-emerald-50/85">
            <span className="inline-flex items-center gap-2">
              <Store size={16} /> {loading ? "…" : shops.length} boutiques
            </span>
            <span className="inline-flex items-center gap-2">
              <Building2 size={16} /> {loading ? "…" : cities.length} villes
            </span>
            <span className="inline-flex items-center gap-2">
              <TrendingUp size={16} /> Vendeurs actifs
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================
          BARRE DE FILTRES
          ============================================================ */}
      <section className="sticky top-16 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="container-app py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Chips villes */}
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Chip active={!activeCity} onClick={() => setActiveCity(null)}>
                Toutes
              </Chip>
              {cities.map((c) => (
                <Chip
                  key={c}
                  active={activeCity === c}
                  onClick={() => setActiveCity(activeCity === c ? null : c)}
                >
                  <MapPin size={12} />
                  {c}
                </Chip>
              ))}
            </div>

            {/* Tri + vue */}
            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500"
              >
                <option value="recent">Plus récentes</option>
                <option value="name">Nom (A-Z)</option>
                <option value="products">Plus de produits</option>
              </select>

              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Vue grille"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                    view === "grid"
                      ? "bg-emerald-700 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="Vue liste"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                    view === "list"
                      ? "bg-emerald-700 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <Grid3X3 size={15} />
                </button>
              </div>

              <button
                onClick={() => void load()}
                disabled={loading}
                aria-label="Actualiser"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-50"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Filtres actifs */}
          {hasFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400">
                Filtres
              </span>
              {search && (
                <ActiveChip onClear={() => setSearch("")}>« {search} »</ActiveChip>
              )}
              {activeCity && <ActiveChip onClear={() => setActiveCity(null)}>{activeCity}</ActiveChip>}
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCity(null);
                }}
                className="text-[12.5px] font-bold text-emerald-700 underline-offset-4 hover:underline"
              >
                Tout effacer
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          LISTE
          ============================================================ */}
      <section className="container-app mt-9 sm:mt-12">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.17em] text-emerald-700">
              À explorer
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Les boutiques à découvrir
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {loading
                ? "Recherche des boutiques…"
                : `${visible.length} boutique${visible.length === 1 ? "" : "s"} affichée${
                    visible.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBox key={i} className="h-64 w-full" rounded="2xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState description={error} onRetry={() => void load()} />
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <SlidersHorizontal size={25} />
            </span>
            <EmptyState
              title="Aucune boutique trouvée"
              description="Essaie un autre mot-clé ou efface ta recherche."
            />
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((s, i) => (
              <ShopGridCard key={s.username} shop={s} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((s, i) => (
              <ShopListRow key={s.username} shop={s} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* =========================================================
   SHOP GRID CARD
   ========================================================= */
function ShopGridCard({ shop, index }: { shop: Shop; index: number }) {
  return (
    <Link
      to={`/p/${shop.username}`}
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
      className="shops-enter group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/[.07]"
    >
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-500">
        {shop.banner ? (
          <img
            src={shop.banner}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.2)_1px,transparent_0)] [background-size:18px_18px] transition duration-700 group-hover:scale-110" />
        <div className="absolute -right-4 -top-8 h-32 w-32 rounded-full border border-white/20" />

        {shop.is_verified && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-bold text-emerald-800 shadow backdrop-blur">
            <BadgeCheck size={12} /> Vérifiée
          </span>
        )}

        <span className="absolute right-4 bottom-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white backdrop-blur">
          <ArrowUpRight size={18} />
        </span>
      </div>

      <div className="relative px-5 pb-5">
        <div className="-mt-10 flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-[22px] border-4 border-white bg-white shadow-md">
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={`Logo ${shop.shop_name}`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 text-lg font-black text-white">
              {shop.shop_name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <h3 className="mt-4 truncate text-lg font-extrabold text-slate-950">
          {shop.shop_name}
        </h3>
        <p className="mt-1 truncate text-sm text-slate-500">@{shop.username}</p>

        {shop.tagline && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-slate-500">
            {shop.tagline}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
          {shop.city && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-700" />
              {shop.city}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Package size={14} className="text-emerald-700" />
            {shop.products_count} articles
          </span>
          {Number(shop.rating) > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {shop.rating}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3 text-sm font-bold text-slate-700 transition group-hover:bg-emerald-50 group-hover:text-emerald-800">
          Visiter la boutique
          <ArrowUpRight
            size={17}
            className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   SHOP LIST ROW
   ========================================================= */
function ShopListRow({ shop, index }: { shop: Shop; index: number }) {
  return (
    <Link
      to={`/p/${shop.username}`}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      className="shops-enter group flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg sm:gap-5 sm:p-5"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md sm:h-20 sm:w-20">
        {shop.logo ? (
          <img
            src={shop.logo}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 text-lg font-black text-white">
            {shop.shop_name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-extrabold text-slate-950">
            {shop.shop_name}
          </h3>
          {shop.is_verified && (
            <BadgeCheck size={15} className="shrink-0 text-emerald-600" />
          )}
        </div>
        <p className="mt-0.5 truncate text-[13px] text-slate-500">@{shop.username}</p>
        {shop.tagline && (
          <p className="mt-1 line-clamp-1 text-[12.5px] text-slate-500">
            {shop.tagline}
          </p>
        )}
      </div>

      <div className="hidden shrink-0 items-center gap-4 sm:flex">
        {shop.city && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <MapPin size={13} className="text-emerald-700" />
            {shop.city}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Package size={13} className="text-emerald-700" />
          {shop.products_count}
        </span>
      </div>

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition group-hover:translate-x-1 group-hover:bg-emerald-700 group-hover:text-white">
        <ArrowUpRight size={17} />
      </span>
    </Link>
  );
}

/* =========================================================
   CHIP
   ========================================================= */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-bold transition duration-200 active:scale-95 ${
        active
          ? "border-emerald-700 bg-emerald-700 text-white shadow-md shadow-emerald-700/15"
          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
      }`}
    >
      {children}
    </button>
  );
}

function ActiveChip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <span className="anim-pop-in inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[12px] font-bold text-white">
      {children}
      <button
        onClick={onClear}
        aria-label="Retirer"
        className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 hover:bg-white/35"
      >
        <X size={10} />
      </button>
    </span>
  );
}