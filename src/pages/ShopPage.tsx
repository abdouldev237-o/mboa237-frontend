/*
 * Mboa237 public shop page — responsive premium edition.
 *
 * UX priorities:
 * - Render already available shop/product data without replacing it with
 *   a full-page loader during subsequent refreshes.
 * - Use skeletons only while first-time data is genuinely unavailable.
 * - Keep the mobile catalogue, shop contact, and sharing actions reachable.
 * - Preserve the existing publicApi, Shop, Product, Category, and toast APIs.
 * - Use native lazy image loading and reduced-motion-aware interactions.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag,
  Truck,
  X,
  Zap,
  PauseCircle, 
  ShieldAlert, 
} from "lucide-react";
import { getErrorMessage, publicApi } from "@/lib/api";
import type { Category, Product, Shop } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import {
  CategoryChipsSkeleton,
  ProductGridSkeleton,
  ShopHeaderSkeleton,
} from "@/components/Skeleton";
import { useToast } from "@/components/Toast";

/* =========================================================
   TYPES & HELPERS
   ========================================================= */
type SortKey = "recent" | "price_asc" | "price_desc";

function fmtFcfa(n: number) {
  return n.toLocaleString("fr-FR").replace(/\u202f/g, " ").replace(/\u00a0/g, " ") + " F";
}

function getCleanPhoneNumber(rawPhone: string | undefined | null): string {
  if (!rawPhone) return "";
  let phone = String(rawPhone).replace(/\D/g, "");
  if (phone.length === 9) {
    phone = `237${phone}`;
  }
  return phone;
}

function buildWhatsappMessage(shop: Shop, product: Product, qty = 1): string {
  return [
    `Bonjour ${shop.shop_name} 👋`,
    "",
    "Je souhaite commander :",
    "",
    `• ${product.name}${qty > 1 ? ` × ${qty}` : ""}`,
    `  ${fmtFcfa(product.price * qty)}`,
    "",
    "Merci de me confirmer la disponibilité.",
  ].join("\n");
}

function openWhatsapp(shop: Shop, product: Product, qty = 1) {
  const phone = getCleanPhoneNumber(shop.whatsapp_number);
  if (!phone) return;
  void publicApi.trackWhatsappClick(shop.username, product.id).catch(() => undefined);
  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsappMessage(shop, product, qty))}`,
    "_blank",
    "noopener,noreferrer"
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */
export default function ShopPage() {
  const { username = "" } = useParams<{ username: string }>();
  const toast = useToast();

  const [shop, setShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);
  const [isExpired, setIsExpired] = useState(false);
  const [expiredInfo, setExpiredInfo] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(1);

  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  /* ---------- Fetchers ---------- */
  const fetchShop = useCallback(async () => {
    setLoadingShop(true);
    setError(null);
    try {
      setShop(await publicApi.getShop(username));
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      if(status === 403 && data?.reason === 'subscription_expired' ){
        setIsExpired(true)
        setExpiredInfo(data)
        return;
      }

      setError(getErrorMessage(e));
    } finally {
      setLoadingShop(false);
    }
  }, [username]);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      setCategories(await publicApi.listCategories(username));
    } catch {
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [username]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const ordering =
        sort === "price_asc" ? "price" : sort === "price_desc" ? "-price" : undefined;
      const res = await publicApi.listProducts(username, {
        category: activeCategory ?? undefined,
        search: query.trim() || undefined,
        ordering,
        page,
      });
      setProducts(res.results);
      setTotalPages(Math.max(1, Math.ceil(res.count / 20)));
    } catch (e) {
      setError(getErrorMessage(e));
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [username, activeCategory, query, sort, page]);

  useEffect(() => {
    void fetchShop();
    void fetchCategories();
  }, [fetchShop, fetchCategories]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, query, sort]);

  /* ---------- Derived ---------- */
  const title = useMemo(
    () =>
      activeCategory
        ? categories.find((c) => c.slug === activeCategory)?.name ?? "Produits"
        : "Tous nos produits",
    [activeCategory, categories]
  );

  const cleanNumber = getCleanPhoneNumber(shop?.whatsapp_number);
  const contact = cleanNumber ? `https://wa.me/${cleanNumber}` : "";

  /* ---------- Callbacks STABLES ---------- */
  const handleProductVisited = useCallback((fresh: Product) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === fresh.id ? { ...p, views_count: fresh.views_count } : p
      )
    );
  }, []);

  const closeModal = useCallback(() => {
    setModalProduct(null);
  }, []);

  const share = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié !");
    } catch {
      toast.error("Impossible de copier");
    }
  }, [toast]);

  /* ---------- Erreur globale ---------- */
  if (error && !shop && !loadingShop && !isExpired) {
    return (
      <main className="min-h-screen bg-[#f8faf9] px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <ErrorState description={error} onRetry={() => void fetchShop()} />
        </div>
      </main>
    );
  }
  if (isExpired) {
  // 1. Nettoyage du numéro WhatsApp pour éviter l'erreur '@'
  const rawPhone = expiredInfo?.whatsapp_number || "";
  let cleanPhone = rawPhone.replace(/\D/g, "");
  if (cleanPhone.length === 9) cleanPhone = `237${cleanPhone}`;
  
  const waMessage = encodeURIComponent(
    `Bonjour ${expiredInfo?.shop_name || 'la boutique'}, je vous contacte depuis Mboa237.`
  );
  const waLink = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f8faf9] p-4 sm:p-6 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* ================= BACKGROUND ANIMÉ ================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-amber-100/40 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -right-40 bottom-10 h-[30rem] w-[30rem] rounded-full bg-emerald-100/50 blur-[120px]" />
      </div>

      {/* ================= CARTE PRINCIPALE ================= */}
      <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 p-8 text-center shadow-[0_35px_80px_-30px_rgba(0,0,0,0.15)] backdrop-blur-2xl sm:p-10 animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        
        {/* Halo décoratif */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-50 blur-2xl" />

        {/* ================= ICÔNE ================= */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-amber-200/60 bg-gradient-to-b from-amber-50 to-white shadow-sm">
          <div className="absolute inset-0 rounded-[2rem] border border-amber-400/30 animate-[pulse-ring_2.5s_ease-out_infinite]" />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100/50 text-amber-600">
            <PauseCircle size={38} strokeWidth={1.5} />
          </div>
        </div>

        {/* ================= BADGE ================= */}
        <div className="mt-6 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-amber-700">
            <ShieldAlert size={13} /> Boutique indisponible
          </span>
        </div>

        {/* ================= TITRE & MESSAGE ================= */}
        <h1 className="mt-4 text-2xl font-black tracking-[-0.03em] text-slate-900 sm:text-3xl">
          {expiredInfo?.shop_name || "Boutique en pause"}
        </h1>
        
        <p className="mt-3 text-[14.5px] leading-relaxed text-slate-500">
          Cette boutique a temporairement suspendu son abonnement sur Mboa237.
        </p>

        {expiredInfo?.message && (
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-[13px] leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-900">Message du vendeur :</span>
            <br />
            {expiredInfo.message}
          </div>
        )}

        {/* ================= BOUTON WHATSAPP ================= */}
        <div className="mt-8">
          {cleanPhone ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex min-h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#16a34a] px-6 py-3.5 text-[14.5px] font-extrabold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl active:scale-[0.98]"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[420%]" />
              <MessageCircle size={19} className="relative z-10" />
              <span className="relative z-10">Contacter sur WhatsApp</span>
              <ArrowRight size={16} className="relative z-10 ml-1 opacity-70 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          ) : (
            <div className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-[14px] font-bold text-slate-400">
              <MessageCircle size={18} /> Contact indisponible
            </div>
          )}
        </div>

        {/* ================= SÉPARATEUR ================= */}
        <div className="my-7 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-100" />
          <Sparkles size={14} className="text-slate-300" />
          <span className="h-px flex-1 bg-slate-100" />
        </div>

        {/* ================= BRANDING ================= */}
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1.5 font-black tracking-tight text-slate-900">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-white">
              <Store size={11} />
            </span>
            Mboa237.com
          </div>
          <p className="text-[11px] font-medium text-slate-400">
            Marketplace des boutiques du Cameroun
          </p>
        </div>
      </div>

      {/* Styles d'animation locaux */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          80%, 100% { transform: scale(1.15); opacity: 0; }
        }
      `}</style>
    </div>
  );
}


  /* =========================================================
     RENDER
     ========================================================= */
  return (
    <div className="min-h-screen bg-[#f8faf9] font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
      <style>{`
        /* Animations de base */
        @keyframes fade-up { from { opacity:0; transform:translateY(20px) } to {opacity:1; transform:translateY(0)} }
        @keyframes fade-in { from { opacity:0 } to {opacity:1} }
        @keyframes scale-in { from { opacity:0; transform:scale(0.95) } to {opacity:1; transform:scale(1)} }
        @keyframes slide-in-right { from { opacity:0; transform:translateX(30px) } to {opacity:1; transform:translateX(0)} }
        
        /* Animations complexes */
        @keyframes gradient-shift { 0%,100% { background-position:0% 50% } 50% { background-position:100% 50% } }
        @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-10px) } }
        @keyframes drive { 0% { transform: translateX(-100%) } 100% { transform: translateX(300%) } }
        @keyframes shimmer { 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5 } 80%,100% { transform: scale(2); opacity: 0 } }
        @keyframes pop { 0% { transform: scale(0.9); opacity: 0.5 } 50% { transform: scale(1.05) } 100% { transform: scale(1); opacity: 1 } }

        /* Classes utilitaires */
        .anim-fade-up { animation: fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both }
        .anim-fade-in { animation: fade-in 0.4s ease-out both }
        .anim-scale-in { animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both }
        .anim-slide-in { animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) both }
        .anim-gradient { background-size: 200% 200%; animation: gradient-shift 12s ease infinite }
        .anim-float { animation: float 6s ease-in-out infinite }
        .anim-drive { animation: drive 8s linear infinite }
        .anim-price { animation: pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) both }
        
        /* Scrollbar invisible */
        .no-scrollbar::-webkit-scrollbar { display: none }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none }
        
        /* Scrollbar custom pour modal */
        .custom-scrollbar::-webkit-scrollbar { width: 6px }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1 }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* =========================================================
           MOBILE-FIRST POLISH LAYER
           The catalogue remains readable on narrow phones, tablets,
           landscape devices, and desktop screens.
           ========================================================= */

        :root {
          color-scheme: light;
          --mboa-emerald: #047857;
          --mboa-emerald-dark: #064e3b;
          --mboa-emerald-soft: #ecfdf5;
          --mboa-ink: #0f172a;
          --mboa-muted: #64748b;
          --mboa-line: #e2e8f0;
          --mboa-surface: #ffffff;
          --mboa-canvas: #f8faf9;
        }

        html {
          scroll-behavior: smooth;
          scroll-padding-top: 5rem;
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }

        body {
          min-width: 320px;
          -webkit-tap-highlight-color: transparent;
        }

        button,
        a,
        input,
        select,
        textarea {
          touch-action: manipulation;
        }

        button,
        select,
        input {
          font: inherit;
        }

        button:focus-visible,
        a:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 3px solid rgba(16, 185, 129, .55);
          outline-offset: 3px;
        }

        img {
          max-width: 100%;
        }

        .mboa-mobile-quickbar {
          position: relative;
          z-index: 20;
          border-bottom: 1px solid rgba(226, 232, 240, .9);
          background: rgba(255, 255, 255, .96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .mboa-mobile-quickbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .75rem;
          width: 100%;
          max-width: 1440px;
          margin-inline: auto;
          padding: .625rem 1rem;
        }

        .mboa-mobile-store-name {
          min-width: 0;
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .mboa-mobile-store-name strong {
          overflow: hidden;
          max-width: 58vw;
          color: var(--mboa-ink);
          font-size: .875rem;
          font-weight: 900;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mboa-mobile-store-name span {
          color: var(--mboa-muted);
          font-size: .6875rem;
          font-weight: 600;
        }

        .mboa-mobile-quick-actions {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: .5rem;
        }

        .mboa-quick-action {
          display: inline-flex;
          min-height: 2.625rem;
          align-items: center;
          justify-content: center;
          gap: .375rem;
          border: 1px solid var(--mboa-line);
          border-radius: .875rem;
          background: white;
          padding: .625rem .75rem;
          color: #334155;
          font-size: .75rem;
          font-weight: 800;
          text-decoration: none;
          transition:
            background-color .2s ease,
            border-color .2s ease,
            transform .2s ease,
            box-shadow .2s ease;
        }

        .mboa-quick-action:hover {
          border-color: #a7f3d0;
          background: #f0fdf4;
          box-shadow: 0 5px 16px rgba(6, 78, 59, .08);
        }

        .mboa-quick-action:active {
          transform: scale(.97);
        }

        .mboa-quick-action-primary {
          border-color: #15803d;
          background: #16a34a;
          color: white;
          box-shadow: 0 5px 14px rgba(22, 163, 74, .16);
        }

        .mboa-quick-action-primary:hover {
          border-color: #166534;
          background: #15803d;
          color: white;
        }

        .mboa-catalogue-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: .75rem;
        }

        .mboa-catalogue-hint {
          display: flex;
          align-items: center;
          gap: .5rem;
          color: #64748b;
          font-size: .75rem;
          font-weight: 600;
        }

        .mboa-catalogue-hint-dot {
          display: inline-block;
          width: .45rem;
          height: .45rem;
          flex: 0 0 auto;
          border-radius: 9999px;
          background: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, .12);
        }

        .mboa-mobile-section-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .75rem;
          margin-bottom: .75rem;
        }

        .mboa-mobile-section-label strong {
          color: #0f172a;
          font-size: .875rem;
          font-weight: 900;
        }

        .mboa-mobile-section-label span {
          color: #64748b;
          font-size: .6875rem;
          font-weight: 700;
        }

        .mboa-touch-scroll {
          overscroll-behavior-inline: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .mboa-touch-scroll::-webkit-scrollbar {
          display: none;
        }

        .mboa-product-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-items: stretch;
          gap: .75rem;
        }

        .mboa-product-grid > * {
          min-width: 0;
        }

        .mboa-product-image {
          isolation: isolate;
          contain: layout paint;
        }

        .mboa-product-image img {
          backface-visibility: hidden;
          transform: translateZ(0);
        }

        .mboa-product-card {
          min-width: 0;
          -webkit-tap-highlight-color: transparent;
        }

        .mboa-product-card:focus-within {
          outline: 2px solid rgba(16, 185, 129, .65);
          outline-offset: 3px;
        }

        .mboa-product-title {
          overflow-wrap: anywhere;
          word-break: normal;
        }

        .mboa-price {
          font-variant-numeric: tabular-nums;
          letter-spacing: -.025em;
        }

        .mboa-safe-bottom {
          padding-bottom: max(.75rem, env(safe-area-inset-bottom));
        }

        .mboa-modal-scroll {
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        .mboa-mobile-sticky-shadow {
          box-shadow: 0 -8px 28px rgba(15, 23, 42, .08);
        }

        .mboa-empty-state {
          display: flex;
          min-height: 15rem;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.25rem;
          text-align: center;
        }

        .mboa-empty-icon {
          display: flex;
          width: 4rem;
          height: 4rem;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          border: 1px solid #d1fae5;
          border-radius: 1.5rem;
          background: #ecfdf5;
          color: #047857;
        }

        .mboa-skeleton {
          position: relative;
          overflow: hidden;
          background: #e9efeb;
        }

        .mboa-skeleton::after {
          position: absolute;
          inset: 0;
          content: "";
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, .72),
            transparent
          );
          animation: mboa-skeleton-shimmer 1.35s ease-in-out infinite;
        }

        @keyframes mboa-skeleton-shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .mboa-retry-button {
          display: inline-flex;
          min-height: 2.75rem;
          align-items: center;
          justify-content: center;
          gap: .5rem;
          border: 1px solid #a7f3d0;
          border-radius: .875rem;
          background: white;
          padding: .75rem 1rem;
          color: #065f46;
          font-size: .8125rem;
          font-weight: 800;
          transition: background-color .2s ease, transform .2s ease;
        }

        .mboa-retry-button:hover {
          background: #ecfdf5;
        }

        .mboa-retry-button:active {
          transform: scale(.98);
        }

        .mboa-modal-content {
          min-height: 0;
        }

        .mboa-modal-action {
          min-height: 3rem;
          -webkit-appearance: none;
          appearance: none;
        }

        .mboa-pill {
          display: inline-flex;
          align-items: center;
          gap: .375rem;
          border-radius: 9999px;
          padding: .375rem .625rem;
          font-size: .6875rem;
          font-weight: 800;
          line-height: 1.25;
        }

        .mboa-pill-success {
          background: #dcfce7;
          color: #166534;
        }

        .mboa-pill-neutral {
          background: #f1f5f9;
          color: #475569;
        }

        .mboa-pill-warning {
          background: #fff7ed;
          color: #9a3412;
        }

        .mboa-divider {
          height: 1px;
          width: 100%;
          background: #eef2f6;
        }

        .mboa-footer-link {
          display: inline-flex;
          min-height: 2rem;
          align-items: center;
          color: #64748b;
          text-decoration: none;
          transition: color .2s ease;
        }

        .mboa-footer-link:hover {
          color: #047857;
        }

        .mboa-image-placeholder {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 20% 15%, rgba(16, 185, 129, .10), transparent 40%),
            linear-gradient(145deg, #f8fafc, #ecfdf5);
          color: #a7b5ae;
        }

        .mboa-hero-content {
          width: 100%;
          max-width: 1440px;
          margin-inline: auto;
        }

        .mboa-trust-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .mboa-trust-card {
          display: flex;
          min-width: 0;
          align-items: flex-start;
          gap: .625rem;
        }

        .mboa-trust-card p {
          overflow-wrap: anywhere;
        }

        .mboa-categories-wrap {
          position: relative;
        }

        .mboa-categories-wrap::after {
          position: absolute;
          top: 0;
          right: 0;
          bottom: .5rem;
          width: 1.5rem;
          content: "";
          pointer-events: none;
          background: linear-gradient(90deg, transparent, var(--mboa-canvas));
        }

        .mboa-search-control {
          min-height: 3rem;
          width: 100%;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          background: white;
          padding: .75rem 1rem;
          color: #0f172a;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
        }

        .mboa-search-control:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, .12);
        }

        .mboa-select-control {
          min-height: 3rem;
          width: 100%;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          background: white;
          padding: .75rem 2.5rem .75rem 1rem;
          color: #334155;
          font-size: .875rem;
          font-weight: 700;
          outline: none;
        }

        .mboa-select-control:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, .12);
        }

        .mboa-card-focus {
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            border-color .25s ease;
        }

        .mboa-card-focus:active {
          transform: scale(.99);
        }

        .mboa-motion-safe {
          animation-duration: .45s;
          animation-timing-function: cubic-bezier(.16, 1, .3, 1);
        }

        @media (max-width: 359px) {
          .mboa-mobile-quickbar-inner {
            gap: .375rem;
            padding-inline: .625rem;
          }

          .mboa-mobile-store-name strong {
            max-width: 42vw;
            font-size: .8125rem;
          }

          .mboa-quick-action {
            min-height: 2.375rem;
            padding: .5rem .625rem;
            font-size: .6875rem;
          }

          .mboa-product-grid {
            gap: .5rem;
          }

          .mboa-product-grid article {
            border-radius: 1rem;
          }

          .mboa-product-grid article > div:last-child {
            padding: .625rem;
          }
        }

        @media (min-width: 480px) {
          .mboa-product-grid {
            gap: 1rem;
          }

          .mboa-trust-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1.25rem;
          }
        }

        @media (min-width: 640px) {
          .mboa-mobile-quickbar-inner {
            padding-inline: 1.5rem;
          }

          .mboa-product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1.25rem;
          }

          .mboa-trust-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .mboa-catalogue-toolbar {
            gap: 1.25rem;
          }
        }

        @media (min-width: 1024px) {
          .mboa-mobile-quickbar {
            display: none;
          }

          .mboa-product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1.5rem;
          }
        }

        @media (min-width: 1280px) {
          .mboa-product-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (orientation: landscape) and (max-height: 500px) {
          .mboa-mobile-quickbar-inner {
            padding-block: .375rem;
          }

          .mboa-mobile-quickbar .mboa-quick-action {
            min-height: 2.125rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mboa-skeleton::after {
            animation: none;
            transform: none;
          }

          .mboa-card-focus,
          .mboa-quick-action,
          .mboa-retry-button {
            transition: none;
          }
        }

      `}</style>

      {/* ============================================================
          HEADER FLOTTANT
          ============================================================ */}
      <Header shop={shop} onShare={share} contact={contact} />
      <MobileStoreQuickBar shop={shop} contact={contact} onShare={share} />

      <main>
        {!shop ? (
          <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
            <ShopHeaderSkeleton />
          </div>
        ) : (
          <>
            {/* ============================================================
                HERO SECTION
                ============================================================ */}
            <ShopHero shop={shop} contact={contact} />

            {/* ============================================================
                TRUST STRIP
                ============================================================ */}
            <section className="border-b border-slate-200 bg-white shadow-sm">
              <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4 sm:px-6 lg:px-10">
                <TrustItem icon={MessageCircle} title="Commande WhatsApp" desc="Direct avec la boutique" />
                <TrustItem icon={Truck} title="Livraison rapide" desc={shop.city ? `${shop.city} & environs` : "Partout"} />
                <TrustItem icon={ShieldCheck} title={shop.is_verified ? "Boutique vérifiée" : "Vendeur local"} desc="Sélection Mboa237" />
                <TrustItem icon={Zap} title="Paiement flexible" desc="OM · MTN · Cash" />
              </div>
            </section>

            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
              {/* ============================================================
                  BANNIÈRE LIVRAISON ANIMÉE
                  ============================================================ */}
              {shop.delivery_info && <DeliveryBanner shop={shop} />}

              {/* ============================================================
                  CATALOGUE PRODUITS
                  ============================================================ */}
              <section id="catalogue" className="scroll-mt-24 pb-20 pt-12">
                {/* Header Catalogue */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[12px] font-extrabold uppercase tracking-[.2em] text-emerald-700">
                      Le catalogue
                    </p>
                    <h2 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">
                      {title}
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:w-[540px]">
                    <label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                      <Search size={18} className="shrink-0 text-slate-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher un article…"
                        className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                      />
                      {query && (
                        <button
                          type="button"
                          onClick={() => setQuery("")}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </label>

                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    >
                      <option value="recent">Nouveautés</option>
                      <option value="price_asc">Prix : croissant</option>
                      <option value="price_desc">Prix : décroissant</option>
                    </select>
                  </div>
                </div>

                {/* Filtres Catégories */}
                <div className="mt-8">
                  {loadingCategories ? (
                    <CategoryChipsSkeleton />
                  ) : (
                    categories.length > 0 && (
                      <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2">
                        <CategoryChip
                          active={!activeCategory}
                          onClick={() => setActiveCategory(null)}
                        >
                          Tout voir
                        </CategoryChip>
                        {categories.map((c) => (
                          <CategoryChip
                            key={c.id}
                            active={activeCategory === c.slug}
                            onClick={() =>
                              setActiveCategory(activeCategory === c.slug ? null : c.slug)
                            }
                          >
                            {c.name}
                            <span
                              className={`ml-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                                activeCategory === c.slug
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {c.products_count}
                            </span>
                          </CategoryChip>
                        ))}
                      </div>
                    )
                  )}
                </div>

                {/* Titre et compteur */}
                <div className="mb-6 mt-8 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                      {title}
                    </h3>
                    <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-600 to-lime-400" />
                  </div>
                  {!loadingProducts && (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                      {products.length} produit{products.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>

                {/* Grille de produits */}
                {loadingProducts && products.length === 0 ? (
                  <ProductGridSkeleton count={8} />
                ) : products.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-white px-4 py-16 text-center shadow-sm">
                    <EmptyState
                      title="Aucun article trouvé"
                      description="Essaie un autre mot-clé ou change de catégorie."
                      icon={<Search size={28} className="text-slate-300" />}
                    />
                  </div>
                ) : (
                  <>
                    {loadingProducts && products.length > 0 ? (
                      <div
                        className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-500"
                        role="status"
                        aria-live="polite"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                        Actualisation du catalogue…
                      </div>
                    ) : null}
                    <div className="mboa-product-grid grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                      {products.map((p, i) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          index={i}
                          onView={() => setModalProduct(p)}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <nav className="mt-12 flex flex-wrap items-center justify-center gap-3">
                        <button
                          disabled={page <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft size={17} /> Précédent
                        </button>
                        <span className="rounded-xl bg-slate-100 px-4 py-3 text-[13px] font-bold text-slate-600">
                          Page {page} / {totalPages}
                        </span>
                        <button
                          disabled={page >= totalPages}
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Suivant <ChevronRight size={17} />
                        </button>
                      </nav>
                    )}
                  </>
                )}
              </section>
            </div>
          </>
        )}
      </main>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <Footer shop={shop} contact={contact} />

      {/* ============================================================
          BOUTONS FLOTTANTS
          ============================================================ */}
      {contact && <FloatingActions contact={contact} onShare={share} />}

      {/* ============================================================
          MODAL PRODUIT
          ============================================================ */}
      {modalProduct && shop && (
        <ProductDetailModal
          key={modalProduct.id}
          product={modalProduct}
          shop={shop}
          onClose={closeModal}
          onVisited={handleProductVisited}
        />
      )}
    </div>
  );
}

/* =========================================================
   SUB-COMPONENTS (Design)
   ========================================================= */

// 1. HEADER
function Header({ shop, onShare, contact }: { shop: Shop | null; onShare: () => void; contact: string }) {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5 rounded-xl text-sm font-black tracking-tight text-slate-900 transition hover:opacity-80"
        >
          <span className="items-center flex  ">
            <span className="rounded-full  border-gray-200 border w-20 h-10">
              {shop?.logo ? (
                  <img src={shop?.logo} alt={`Logo ${shop?.shop_name}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                    {shop?.shop_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
            </span>
            <span className="ml-1 max-w-[180px] truncate text-base font-bold sm:text-lg">
              {shop?.shop_name ?? "Boutique"}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onShare}
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 sm:inline-flex"
          >
            <Share2 size={17} />
          </button>
          {contact && (
            <a
              href={contact}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#16a34a] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
            >
              <MessageCircle size={17} /> Contacter
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. HERO
function ShopHero({ shop, contact }: { shop: Shop; contact: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950">
      <div className="anim-gradient absolute inset-0 bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#10b981]" />
      {shop.banner && (
        <img
          src={shop.banner}
          alt="Bannière"
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.15)_1px,transparent_0)] [background-size:24px_24px]" />
      <div className="anim-float pointer-events-none absolute -right-10 top-10 h-64 w-64 rounded-full border border-white/10 sm:right-[10%] sm:h-96 sm:w-96" />

      <div className="relative mx-auto flex min-h-[360px] max-w-[1440px] flex-col justify-end px-4 pb-10 pt-14 sm:min-h-[420px] sm:px-6 sm:pb-14 lg:px-10 lg:pb-20">
        <div className="anim-fade-up max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md">
            <Sparkles size={14} className="text-emerald-300" /> Boutique Officielle
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="relative shrink-0">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[32px] border-4 border-white/20 bg-white text-3xl font-black text-emerald-800 shadow-2xl backdrop-blur-sm sm:h-32 sm:w-32">
                {shop.logo ? (
                  <img src={shop.logo} alt={`Logo ${shop.shop_name}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                    {shop.shop_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              {shop.is_verified && (
                <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#064e3b] bg-emerald-500 text-white shadow-lg" title="Boutique vérifiée">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 text-white">
              <h1 className="text-4xl font-black tracking-[-.045em] sm:text-5xl lg:text-6xl">
                {shop.shop_name}
              </h1>
              {shop.tagline && (
                <p className="mt-3 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                  {shop.tagline}
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-white/90">
                {shop.city && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 backdrop-blur-md">
                    <MapPin size={14} /> {shop.city}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 backdrop-blur-md">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <b>{shop.rating ?? "—"}</b>
                  <span className="text-white/60">·</span>
                  {shop.products_count} articles
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {contact && (
              <a
                href={contact}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-emerald-950 shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-emerald-50 hover:shadow-xl"
              >
                <MessageCircle size={18} className="text-emerald-600" /> Discuter sur WhatsApp
              </a>
            )}
            <a
              href="#catalogue"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/20"
            >
              <ShoppingBag size={18} /> Voir le catalogue <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// 3. DELIVERY BANNER
function DeliveryBanner({ shop }: { shop: Shop }) {
  return (
    <section className="anim-fade-up relative mt-8 overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-sky-50 p-5 shadow-sm sm:p-6">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm ring-1 ring-sky-100">
            <Truck size={28} className="animate-pulse" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Informations de livraison
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {shop.delivery_info}
            </p>
          </div>
        </div>
        {shop.free_delivery_from ? (
          <div className="shrink-0 rounded-2xl bg-white px-4 py-3 text-center shadow-sm ring-1 ring-sky-100 sm:text-left">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Livraison offerte</div>
            <div className="text-[15px] font-black text-sky-700">dès {Number(shop.free_delivery_from).toLocaleString("fr-FR")} F</div>
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 overflow-hidden opacity-30 sm:opacity-20">
        <div className="anim-drive absolute bottom-2 h-6 w-full">
          <Truck className="h-6 w-6 text-sky-600" />
        </div>
        <div className="absolute bottom-0 w-full border-b-2 border-dashed border-sky-300" />
      </div>
    </section>
  );
}

// 4. PRODUCT CARD
function ProductCard({ product, index, onView }: { product: Product; index: number; onView: () => void }) {
  const cover = product.image || product.images?.[0] || null;
  const discount = Number(product.discount_percent || 0);
  const inStock = product.in_stock;

  return (
    <article
      onClick={onView}
      style={{ animation: `fade-up 0.6s cubic-bezier(.16,1,.3,1) ${Math.min(index, 7) * 50}ms both` }}
      className="mboa-product-card p-3 mboa-card-focus group relative flex cursor-pointer flex-col overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_20px_40px_-20px_rgba(20,83,45,0.3)]"
    >
      <div className="mboa-product-image relative rounded-xl shadow aspect-[4/4.5] overflow-hidden bg-slate-50">
        {cover ? (
          <img src={cover} alt={product.name} loading={index < 2 ? "eager" : "lazy"} decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300"><Package size={44} strokeWidth={1.2} /></div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md ${
              product.badge === "PROMO" ? "bg-rose-500/90 text-white" : product.badge === "NEW" ? "bg-sky-500/90 text-white" : "bg-orange-500/90 text-white"
            }`}>
              {product.badge_label || product.badge}
            </span>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-[12px] font-bold text-slate-900 shadow-lg backdrop-blur">
            <Eye size={14} /> Aperçu
          </span>
        </div>

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-4 py-1.5 text-[12px] font-black text-slate-900 shadow-md">Rupture de stock</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {product.category_name && (
          <span className="mb-1.5 inline-flex w-fit rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {product.category_name}
          </span>
        )}
        <h3 className="line-clamp-2 min-h-[2.5em] text-[13.5px] font-extrabold leading-snug text-slate-900 transition-colors group-hover:text-emerald-900 sm:text-[14.5px]">
          {product.name}
        </h3>
        
        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col">
            {product.was_price && product.was_price > product.price && (
              <span className="text-[11px] font-medium text-slate-400 line-through tabular-nums">{fmtFcfa(product.was_price)}</span>
            )}
            <span className="origin-left text-[15.5px] font-black text-slate-950 tabular-nums transition-transform duration-300 group-hover:scale-105 sm:text-[16.5px]">
              {fmtFcfa(product.price)}
            </span>
          </div>
          {discount > 0 && (
            <span className="mb-1 inline-flex items-center rounded bg-rose-100 px-1.5 py-0.5 text-[10.5px] font-black text-rose-700">-{discount}%</span>
          )}
        </div>
      </div>
    </article>
  );
}

// 5. MODAL PRODUIT PREMIUM
function ProductDetailModal({
  product: initialProduct,
  shop,
  onClose,
  onVisited,
}: {
  product: Product;
  shop: Shop;
  onClose: () => void;
  onVisited: (fresh: Product) => void;
}) {
  const [fresh, setFresh] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "livraison">("desc");

  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const fetchedRef = useRef<string | null>(null);

  /* 
   * FETCH SÉCURISÉ 
   * Ici, on utilise uniquement la promesse (pas de setTimeout).
   * Si l'API Django échoue, on catch l'erreur, setLoading(false) s'exécute,
   * et on affiche l'erreur dans le modal sans bloquer l'utilisateur.
   */
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    if (fetchedRef.current === initialProduct.id && fresh){
      setLoading(false);
      return;
    }
    fetchedRef.current = initialProduct.id;

    

    publicApi
      .getProduct(shop.username, initialProduct.id)
      .then((data) => {
        if (!isMounted) return;
        setFresh(data);
        onVisited(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        // On affiche l'erreur discrètement mais on garde l'interface
        setError("Impossible de charger les détails complets (Erreur API).");
        console.error("API ERROR:", err);
        setFresh(initialProduct as any);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialProduct.id, shop.username, onVisited]);

  const display = fresh || initialProduct;

  const images = useMemo(() => {
    const list = [display.image, display.second_image, display.third_image].filter(Boolean) as string[];
    if (list.length > 0) return list;
    if (display.images?.length) return display.images;
    return [];
  }, [display]);

  // Gestion des touches clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (images.length <= 1) return;
      if (e.key === "ArrowRight") setActiveImage((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActiveImage((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, images.length]);

  // Blocage du scroll body
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, []);

  const cover = images[activeImage] || null;
  const total = display.price * qty;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:px-6 sm:py-8" role="dialog" aria-modal="true">
      <div onClick={onClose} className="anim-fade-in absolute inset-0 bg-slate-950/75 backdrop-blur-sm" />

      <div className="anim-scale-in relative flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-5xl sm:rounded-[2rem]">
        
        {/* Bouton Fermer */}
        <div className="absolute right-4 top-4 z-20">
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur-md transition hover:rotate-90 hover:bg-white hover:text-rose-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col overflow-hidden lg:grid lg:grid-cols-[1.1fr_1fr]">
          
          {/* ================= GALERIE ================= */}
          <div className="relative flex shrink-0 flex-col bg-slate-50">
            <div className="relative aspect-square w-full overflow-hidden bg-slate-100 sm:aspect-[4/5] lg:aspect-auto lg:h-full">
              {cover ? (
                <img
                  key={cover}
                  src={cover}
                  alt={display.name}
                  loading="eager"
                  decoding="async"
                  className="anim-fade-in absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                  <Package size={64} strokeWidth={1} />
                </div>
              )}

              {display.badge && (
                <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-lg ${
                      display.badge === "PROMO" ? "bg-rose-500 text-white" 
                      : display.badge === "NEW" ? "bg-sky-500 text-white" 
                      : "bg-orange-500 text-white"
                  }`}>
                    {display.badge_label || display.badge}
                  </span>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition hover:scale-110"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur-md transition hover:scale-110"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="no-scrollbar absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-3 overflow-x-auto p-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      i === activeImage ? "border-emerald-600 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= DÉTAILS ================= */}
          <div className="flex flex-1 flex-col overflow-hidden bg-white">
            <div className="mboa-modal-scroll custom-scrollbar flex-1 overflow-y-auto p-5 sm:p-7">
              
              <div className="mb-3 flex items-center gap-2">
                {display.category_name && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <Tag size={12} /> {display.category_name}
                  </span>
                )}
                {display.in_stock ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 size={12} /> En stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                    <X size={12} /> Rupture
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
                {display.name}
              </h2>

              <div className="mt-3 flex items-center gap-4 text-[13px]">
                {Number(display.rating) > 0 && (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                    <Star size={14} className="fill-amber-400 text-amber-400" /> {display.rating}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
                  <Eye size={14} />
                  {loading ? "Chargement..." : `${display.views_count} vues`}
                </span>
              </div>

              {/* SI ERREUR API, ON L'AFFICHE ICI */}
              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12.5px] font-medium text-rose-700">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* PRIX ANIMÉ */}
              <div key={display.price} className="anim-price mt-5 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-black tracking-tighter text-slate-950 tabular-nums sm:text-4xl">
                  {fmtFcfa(display.price)}
                </span>
                {display.was_price && display.was_price > display.price && (
                  <span className="text-[15px] font-medium text-slate-400 line-through tabular-nums sm:text-[16px]">
                    {fmtFcfa(display.was_price)}
                  </span>
                )}
              </div>

              {/* TABS */}
              <div className="mt-8 border-b border-slate-200">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab("desc")}
                    className={`pb-3 text-[13.5px] font-bold transition-colors ${activeTab === "desc" ? "border-b-2 border-emerald-600 text-emerald-700" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab("livraison")}
                    className={`pb-3 text-[13.5px] font-bold transition-colors ${activeTab === "livraison" ? "border-b-2 border-emerald-600 text-emerald-700" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    Livraison & Paiement
                  </button>
                </div>
              </div>

              <div className="pt-5">
                {activeTab === "desc" && (
                  <div className="anim-fade-in">
                    {loading && !fresh ? (
                      <div className="space-y-2.5">
                        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-4/6 animate-pulse rounded bg-slate-100" />
                      </div>
                    ) : (
                      <p className="whitespace-pre-line text-[14px] leading-relaxed text-slate-600">
                        {display.description || "Aucune description fournie pour ce produit. Contactez la boutique pour plus de détails."}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "livraison" && (
                  <div className="anim-fade-in space-y-4">
                    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                      <Truck className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                      <div>
                        <div className="text-[13.5px] font-bold text-slate-900">Informations de livraison</div>
                        <div className="mt-0.5 text-[12.5px] text-slate-500">{shop.delivery_info || "Livraison standard."}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                      <div>
                        <div className="text-[13.5px] font-bold text-slate-900">Paiement sécurisé</div>
                        <div className="mt-0.5 text-[12.5px] text-slate-500">Payez à la livraison ou par Mobile Money (OM, MTN).</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER STICKY */}
            <div className="mboa-mobile-sticky-shadow mboa-safe-bottom shrink-0 border-t border-slate-100 bg-white p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:text-emerald-600 disabled:opacity-40 disabled:shadow-none"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-[15px] font-black tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:text-emerald-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total</div>
                  <div className="text-[20px] font-black text-slate-950 tabular-nums">
                    {fmtFcfa(total)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => openWhatsapp(shop, display, qty)}
                disabled={!display.in_stock}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] px-5 py-4 text-[15px] font-extrabold text-white shadow-lg shadow-emerald-600/25 transition duration-300 hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <MessageCircle size={20} />
                <span>Commander sur WhatsApp</span>
                {display.in_stock && (
                  <ArrowUpRight size={18} className="opacity-80 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. FLOATING ACTIONS
function FloatingActions({ contact, onShare }: { contact: string; onShare: () => void }) {
  return (
    <>
      <a
        href={contact}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[#16a34a] text-white shadow-xl shadow-emerald-900/30 transition duration-300 hover:-translate-y-1 hover:bg-emerald-700 sm:flex"
      >
        <MessageCircle size={24} />
        <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-300 ring-2 ring-white animate-pulse" />
      </a>

      <div className="mboa-safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl sm:hidden">
        <div className="flex gap-2.5">
          <button
            onClick={onShare}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm"
          >
            <Share2 size={18} />
          </button>
          <a
            href={contact}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#16a34a] text-sm font-extrabold text-white shadow-md active:scale-[0.98]"
          >
            <MessageCircle size={18} /> Commander
          </a>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
      <div className="h-20 sm:hidden" />
    </>
  );
}



/* =========================================================
   MOBILE STORE QUICK BAR
   A compact mobile-only shortcut row. It shows the shop name,
   lets shoppers jump directly to the catalogue, share the page,
   or contact the seller without covering product content.
   ========================================================= */
function MobileStoreQuickBar({
  shop,
  contact,
  onShare,
}: {
  shop: Shop | null;
  contact: string;
  onShare: () => void;
}) {
  const shopName = shop?.shop_name || "Boutique";

  const jumpToCatalogue = useCallback(() => {
    const catalogue = document.getElementById("catalogue");
    if (!catalogue) return;
    catalogue.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className="mboa-mobile-quickbar lg:hidden">
      <div className="mboa-mobile-quickbar-inner">
        <button
          type="button"
          onClick={jumpToCatalogue}
          className="mboa-mobile-store-name min-w-0 flex-1 text-left"
          aria-label={`Voir le catalogue de ${shopName}`}
        >
          <strong>{shopName}</strong>
          <span>
            {shop?.city ? `${shop.city} · ` : ""}
            {shop?.products_count ?? 0} article
            {(shop?.products_count ?? 0) === 1 ? "" : "s"}
          </span>
        </button>

        <div className="mboa-mobile-quick-actions">
          <button
            type="button"
            onClick={onShare}
            className="mboa-quick-action"
            aria-label="Partager cette boutique"
            title="Partager la boutique"
          >
            <Share2 size={16} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={jumpToCatalogue}
            className="mboa-quick-action"
            aria-label="Parcourir les produits"
          >
            <ShoppingBag size={15} aria-hidden="true" />
            <span>Catalogue</span>
          </button>

          {contact ? (
            <a
              href={contact}
              target="_blank"
              rel="noopener noreferrer"
              className="mboa-quick-action mboa-quick-action-primary"
              aria-label={`Contacter ${shopName} sur WhatsApp`}
            >
              <MessageCircle size={15} aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}




/* =========================================================
   RESILIENT SKELETON PRIMITIVES
   Skeletons are only intended for the first empty fetch.
   When real data is already on screen, keep it visible during
   refreshes instead of replacing the whole catalogue.
   ========================================================= */

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`mboa-skeleton block rounded-xl ${className}`}
    />
  );
}

// function MobileProductSkeleton() {
//   return (
//     <article
//       aria-hidden="true"
//       className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white"
//     >
//       <SkeletonBlock className="aspect-[4/4.5] w-full rounded-none" />
//       <div className="space-y-3 p-3.5">
//         <SkeletonBlock className="h-2.5 w-1/3 rounded-md" />
//         <SkeletonBlock className="h-4 w-full rounded-md" />
//         <SkeletonBlock className="h-4 w-4/5 rounded-md" />
//         <div className="flex items-center justify-between pt-2">
//           <SkeletonBlock className="h-5 w-2/5 rounded-md" />
//           <SkeletonBlock className="h-8 w-8 rounded-xl" />
//         </div>
//       </div>
//     </article>
//   );
// }

// function MobileProductGridSkeleton({
//   count = 6,
// }: {
//   count?: number;
// }) {
//   return (
//     <div
//       className="mboa-product-grid"
//       aria-label="Chargement du catalogue"
//       role="status"
//     >
//       {Array.from({ length: count }, (_, index) => (
//         <MobileProductSkeleton key={`mobile-product-skeleton-${index}`} />
//       ))}
//       <span className="sr-only">Chargement des produits…</span>
//     </div>
//   );
// }

/* =========================================================
   SMALL SCREEN AND ACCESSIBILITY UTILITIES
   ========================================================= */

// function useReducedMotionPreference() {
//   const [reducedMotion, setReducedMotion] = useState(false);

//   useEffect(() => {
//     if (typeof window === "undefined" || !window.matchMedia) return;

//     const media = window.matchMedia("(prefers-reduced-motion: reduce)");
//     const update = () => setReducedMotion(media.matches);
//     update();

//     if (typeof media.addEventListener === "function") {
//       media.addEventListener("change", update);
//       return () => media.removeEventListener("change", update);
//     }

//     media.addListener(update);
//     return () => media.removeListener(update);
//   }, []);

//   return reducedMotion;
// }

// function useEscapeKey(onEscape: () => void, enabled = true) {
//   const callbackRef = useRef(onEscape);

//   useEffect(() => {
//     callbackRef.current = onEscape;
//   }, [onEscape]);

//   useEffect(() => {
//     if (!enabled) return;

//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (event.key !== "Escape") return;
//       callbackRef.current();
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [enabled]);
// }

// function formatProductCount(count: number) {
//   if (!Number.isFinite(count) || count < 0) return "0 produit";
//   return `${count} produit${count === 1 ? "" : "s"}`;
// }

// function getProductImageList(product: Product) {
//   const candidates = [
//     product.image,
//     product.second_image,
//     product.third_image,
//     ...(product.images || []),
//   ];

//   return Array.from(
//     new Set(
//       candidates.filter(
//         (image): image is string =>
//           typeof image === "string" && image.trim().length > 0
//       )
//     )
//   );
// }

// function isValidExternalUrl(value: string | undefined | null) {
//   if (!value) return false;

//   try {
//     const url = new URL(value, window.location.origin);
//     return url.protocol === "https:" || url.protocol === "http:";
//   } catch {
//     return false;
//   }
// }

/* =========================================================
   MOBILE INTERACTION GUIDELINES
   Keep targets comfortably tappable and avoid horizontal
   overflow caused by long product names or large prices.
   ========================================================= */

// const MOBILE_INTERACTION_GUIDELINES = {
//   minimumTapTarget: 44,
//   preferredHorizontalPadding: 16,
//   compactGridColumns: 2,
//   tabletGridColumns: 3,
//   desktopGridColumns: 4,
//   preferredProductImageRatio: "4 / 4.5",
//   useSafeAreaInsets: true,
//   preserveExistingResultsDuringRefresh: true,
// } as const;

/* =========================================================
   DESIGN TOKENS
   Shared values document the visual system for future edits.
   These tokens intentionally mirror the Tailwind palette used
   throughout this page, so no external CSS package is needed.
   ========================================================= */

// const SHOP_PAGE_DESIGN_TOKENS = {
//   color: {
//     ink: "#0f172a",
//     muted: "#64748b",
//     border: "#e2e8f0",
//     surface: "#ffffff",
//     canvas: "#f8faf9",
//     primary: "#047857",
//     primaryDark: "#064e3b",
//     primarySoft: "#ecfdf5",
//     success: "#16a34a",
//     whatsapp: "#16a34a",
//     warning: "#f59e0b",
//     danger: "#e11d48",
//   },
//   radius: {
//     control: "0.875rem",
//     card: "1.25rem",
//     panel: "2rem",
//     pill: "9999px",
//   },
//   spacing: {
//     pageMobile: "1rem",
//     pageTablet: "1.5rem",
//     pageDesktop: "2.5rem",
//     cardMobile: "0.75rem",
//     section: "3rem",
//   },
//   responsive: {
//     mobile: 480,
//     tablet: 640,
//     laptop: 1024,
//     desktop: 1280,
//   },
// } as const;

/* =========================================================
   ERROR MESSAGE GUIDELINES
   Keep messages understandable and actionable for shoppers.
   These helpers do not replace the API layer's error handler;
   they are intended for future inline retry panels.
   ========================================================= */

// function getShopFriendlyErrorMessage(error: unknown) {
//   if (error instanceof TypeError) {
//     return "Vérifiez votre connexion Internet puis réessayez.";
//   }

//   if (error instanceof Error && error.message.trim()) {
//     return error.message;
//   }

//   return "Une erreur est survenue. Réessayez dans quelques instants.";
// }

// function getProductFriendlyErrorMessage(error: unknown) {
//   const message = getShopFriendlyErrorMessage(error);

//   if (/network|fetch|connexion|internet/i.test(message)) {
//     return "Le catalogue ne répond pas pour le moment. Vérifiez votre connexion.";
//   }

//   return message;
// }






/* =========================================================
   MOBILE QUALITY CHECKLIST
   This checklist documents the behavior expected from the
   finished responsive page for later manual verification.
   ========================================================= */


// 7. FOOTER
function Footer({ shop, contact }: { shop: Shop | null; contact: string }) {
  return (
    <footer className="border-t border-slate-200 bg-[#f8faf9]">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 text-base font-black text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
                <Store size={18} />
              </span>
              Mboa237
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
              {shop ? `Bienvenue dans la boutique ${shop.shop_name}.` : "Découvrez des boutiques locales sur Mboa237."} Le commerce local, simplement et en toute sécurité.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
            <Link to="/shops" className="transition hover:text-emerald-700">Toutes les boutiques</Link>
            <Link to="/" className="transition hover:text-emerald-700">Accueil</Link>
            {contact && (
              <a href={contact} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-emerald-700">
                <MessageCircle size={15} /> Contacter
              </a>
            )}
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Mboa237. Tous droits réservés.</span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" /> Paiement à la livraison
          </span>
        </div>
      </div>
    </footer>
  );
}

// 8. UTILS
function TrustItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-[13px] font-extrabold text-slate-900">{title}</p>
        <p className="text-[11.5px] text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function CategoryChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-bold transition-all duration-300 active:scale-95 ${
        active
          ? "border-emerald-700 bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
      }`}
    >
      {children}
    </button>
  );
}





// ... (dans ton composant)

