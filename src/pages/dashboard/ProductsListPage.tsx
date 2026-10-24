// src/pages/dashboard/ProductsListPage.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Edit,
  Eye,
  Filter,
  Grid3X3,
  LayoutGrid,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { getErrorMessage, ownerApi } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useToast } from "@/components/Toast";

function fmtFcfa(n: number) {
  return n.toLocaleString("fr-FR").replace(/\u202f/g, " ").replace(/\u00a0/g, " ") + " F";
}

type ViewMode = "grid" | "list";

export default function ProductsListPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ownerApi.listProducts({ search: search.trim() || undefined });
      setProducts(res.results);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  const visible = useMemo(
    () =>
      products.filter((p) => {
        if (filter === "active") return p.is_active;
        if (filter === "inactive") return !p.is_active;
        return true;
      }),
    [products, filter]
  );

  const onDelete = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer « ${name} » ? Cette action est définitive.`)) return;
    setDeletingId(id);
    try {
      await ownerApi.deleteProduct(id);
      toast.success("Produit supprimé");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="container-app min-h-screen py-6 pb-16 sm:py-9">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-800">
            <Package size={13} />
            Mes produits
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-3xl">
            Ton catalogue
          </h1>
          <p className="mt-1 text-[13.5px] text-slate-500">
            {products.length} article{products.length === 1 ? "" : "s"} dans ta boutique
          </p>
        </div>
        <Link
          to="/dashboard/add/product"
          className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-700/25 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-xl"
        >
          <Plus size={17} />
          Ajouter un produit
        </Link>
      </header>

      {/* Filtres */}
      <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 sm:flex-row sm:items-center">
        <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Effacer"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X size={15} />
            </button>
          )}
        </label>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition ${
                  filter === f
                    ? "bg-emerald-700 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f === "all" ? "Tous" : f === "active" ? "Actifs" : "Masqués"}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setView("grid")}
              aria-label="Vue grille"
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                view === "grid" ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="Vue liste"
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                view === "list" ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-100"
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
      </section>

      {/* Contenu */}
      <section className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-rose-600" />
            <p className="mt-3 text-sm font-bold text-rose-700">{error}</p>
            <button
              onClick={() => void load()}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-rose-700"
            >
              Réessayer
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Package size={24} />
            </div>
            <h3 className="mt-5 text-[17px] font-extrabold text-slate-900">
              {products.length === 0 ? "Aucun produit pour l'instant" : "Aucun résultat"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-[13.5px] text-slate-500">
              {products.length === 0
                ? "Crée ton premier article et commence à vendre en ligne."
                : "Essaie un autre mot-clé ou change le filtre."}
            </p>
            {products.length === 0 && (
              <Link
                to="/dashboard/add/product"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-[13.5px] font-bold text-white transition hover:bg-emerald-800"
              >
                <Plus size={15} /> Ajouter mon premier produit
              </Link>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onDelete={() => onDelete(p.id, p.name)}
                deleting={deletingId === p.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                onDelete={() => onDelete(p.id, p.name)}
                deleting={deletingId === p.id}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* =========================================================
   PRODUCT CARD
   ========================================================= */
function ProductCard({
  product,
  onDelete,
  deleting,
}: {
  product: Product;
  onDelete: () => void;
  deleting: boolean;
}) {
  const cover = product.image || product.images?.[0] || null;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-stone-50">
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
            <Package size={36} strokeWidth={1.2} />
          </div>
        )}

        {product.badge && (
          <span
            className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow ${
              product.badge === "PROMO"
                ? "bg-rose-500 text-white"
                : product.badge === "NEW"
                  ? "bg-sky-500 text-white"
                  : "bg-orange-500 text-white"
            }`}
          >
            {product.badge_label || product.badge}
          </span>
        )}

        {product.discount_percent > 0 && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2 py-0.5 text-[10.5px] font-black text-rose-600 shadow">
            -{product.discount_percent}%
          </span>
        )}

        {!product.is_active && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="rounded-full bg-white px-3 py-1 text-[11.5px] font-black text-slate-900">
              Masqué
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 min-h-10 text-[13.5px] font-extrabold leading-tight text-slate-900">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[15px] font-black text-slate-900 tabular-nums">
            {fmtFcfa(product.price)}
          </span>
          {product.was_price && (
            <span className="text-[11px] text-slate-400 line-through tabular-nums">
              {fmtFcfa(product.was_price)}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
          <Link
            to={`/dashboard/edit/product/${product.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-emerald-700"
          >
            <Edit size={13} /> Modifier
          </Link>
          <button
            onClick={onDelete}
            disabled={deleting}
            aria-label="Supprimer"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PRODUCT ROW
   ========================================================= */
function ProductRow({
  product,
  onDelete,
  deleting,
}: {
  product: Product;
  onDelete: () => void;
  deleting: boolean;
}) {
  const cover = product.image || product.images?.[0] || null;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 transition hover:border-emerald-200 hover:shadow-md">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-stone-50">
        {cover ? (
          <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
            <Package size={22} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[14px] font-extrabold text-slate-900">{product.name}</h3>
          {!product.is_active && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
              Masqué
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-[12px] text-slate-500">{product.description}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[14px] font-black text-slate-900 tabular-nums">
            {fmtFcfa(product.price)}
          </span>
          {product.was_price && (
            <span className="text-[11px] text-slate-400 line-through tabular-nums">
              {fmtFcfa(product.was_price)}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to={`/dashboard/edit/product/${product.id}`}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-[12px] font-bold text-white transition hover:bg-emerald-700"
        >
          <Edit size={13} /> Modifier
        </Link>
        <button
          onClick={onDelete}
          disabled={deleting}
          aria-label="Supprimer"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}