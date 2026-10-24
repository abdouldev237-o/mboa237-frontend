// src/pages/DashboardPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChartNoAxesCombined,
  Check,
  CheckCircle2,
  CircleHelp,
  Copy,
  Eye,
  ExternalLink,
  Heart,
  Lightbulb,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  RefreshCw,
  Settings2,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Tags,
  Target,
  TrendingUp,
  Truck,
  Zap,
  Timer
  
} from "lucide-react";
import { getErrorMessage, ownerApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import type { Product, Shop } from "@/lib/types";
import { StatsGridSkeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";

/* =========================================================
   HELPERS
   ========================================================= */


function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!Number.isFinite(target)) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* =========================================================
   TIPS (contenus marketing, pas de fausses données)
   ========================================================= */
const TIPS = [
  {
    icon: Share2,
    title: "Partage ton lien",
    desc: "Envoie-le sur WhatsApp, Instagram et Facebook pour toucher plus de clients.",
  },
  {
    icon: Package,
    title: "Ajoute de belles photos",
    desc: "Les articles avec images claires sont 3× plus vus que les autres.",
  },
  {
    icon: MessageCircle,
    title: "Réponds vite sur WhatsApp",
    desc: "Une réponse en moins de 10 minutes augmente les conversions.",
  },
  {
    icon: Heart,
    title: "Soigne tes avis",
    desc: "Les clients font plus confiance aux boutiques bien notées.",
  },
];

/* =========================================================
   SANTÉ DE LA BOUTIQUE — calculée sur données réelles
   ========================================================= */
function computeHealth(shop: Shop): {
  score: number;
  checks: { label: string; done: boolean; icon: typeof Eye }[];
} {
  const checks = [
    { label: "Logo ajouté", done: Boolean(shop.logo), icon: Sparkles },
    { label: "Bannière ajoutée", done: Boolean(shop.banner), icon: Sparkles },
    { label: "Boutique vérifiée", done: shop.is_verified, icon: ShieldCheck },
    { label: "3 produits minimum", done: shop.products_count >= 3, icon: Package },
    { label: "Note reçue", done: Number(shop.rating) > 0, icon: Star },
    { label: "Info livraison", done: Boolean(shop.delivery_info), icon: Truck },
  ];
  const done = checks.filter((c) => c.done).length;
  return {
    score: Math.round((done / checks.length) * 100),
    checks,
  };
}

/* =========================================================
   MAIN
   ========================================================= */
export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  /* ---------- Chargement ---------- */
  const loadShop = async () => {
    setLoading(true);
    setError(null);
    try {
      setShop(await ownerApi.getShop());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await ownerApi.listProducts();
      setProducts(res.results || []);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };
  /* Source de vérité : la vraie liste retournée par l'API */
const realProductsCount = loadingProducts
  ? (shop?.products_count ?? 0)
  : products.length;

const canAddProduct = shop
  ? realProductsCount < shop.max_products
  : false;

const catalogUsage = useMemo(() => {
  if (!shop || shop.max_products === 0) return 0;
  return Math.min(100, (realProductsCount / shop.max_products) * 100);
}, [realProductsCount, shop]);


  useEffect(() => {
    void loadShop();
    void loadProducts();
  }, []);

  /* Rotation tips */
  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 5500);
    return () => clearInterval(t);
  }, []);

  /* ---------- Derived : données réelles ---------- */
  const health = useMemo(() => (shop ? computeHealth(shop) : null), [shop]);

  const conversionRate = useMemo(() => {
    if (!shop || shop.views_count === 0) return 0;
    return (shop.whatsapp_clicks / shop.views_count) * 100;
  }, [shop]);

  

  /* Top produits (vraies données, triées par vues) */
  const topProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.views_count > 0)
      .sort((a, b) => b.views_count - a.views_count)
      .slice(0, 5);
  }, [products]);

  /* Recommandations basées sur les vrais manques */
  const insights = useMemo(() => {
    if (!shop) return [];
    const list: Array<{
      tone: "warn" | "info" | "success";
      icon: typeof Eye;
      title: string;
      desc: string;
      action?: { to: string; label: string };
    }> = [];

    if (shop.views_count === 0) {
      list.push({
        tone: "warn",
        icon: Eye,
        title: "Personne n'a encore visité ta boutique",
        desc: "Partage ton lien sur WhatsApp et tes réseaux sociaux pour recevoir tes premiers visiteurs.",
      });
    }

    if (shop.products_count === 0) {
      list.push({
        tone: "warn",
        icon: Package,
        title: "Ta boutique est vide",
        desc: "Ajoute au moins 3 produits pour donner envie à tes clients de commander.",
        action: { to: "/dashboard/add/product", label: "Ajouter un produit" },
      });
    } else if (shop.products_count < 3) {
      list.push({
        tone: "info",
        icon: Package,
        title: "Encore un peu de contenu",
        desc: "Les boutiques avec 3 produits minimum reçoivent plus de commandes.",
        action: { to: "/dashboard/add/product", label: "Ajouter" },
      });
    }

    if (!shop.logo) {
      list.push({
        tone: "info",
        icon: Sparkles,
        title: "Ajoute un logo",
        desc: "Une boutique avec logo inspire plus confiance à première vue.",
        action: { to: "/dashboard/shop", label: "Ajouter le logo" },
      });
    }

    if (!shop.delivery_info) {
      list.push({
        tone: "info",
        icon: Truck,
        title: "Précise ta livraison",
        desc: "Indique tes zones et délais pour rassurer les clients.",
        action: { to: "/dashboard/shop", label: "Compléter" },
      });
    }

    if (shop.whatsapp_clicks === 0 && shop.views_count > 0) {
      list.push({
        tone: "info",
        icon: MessageCircle,
        title: "Aucun clic WhatsApp encore",
        desc: "Tes visiteurs n'ont pas encore commandé. Vérifie que tes prix sont attractifs.",
      });
    }

    if (list.length === 0) {
      list.push({
        tone: "success",
        icon: CheckCircle2,
        title: "Tout est en ordre !",
        desc: "Ta boutique est bien configurée. Continue à la partager pour faire grandir tes ventes.",
      });
    }

    return list.slice(0, 3);
  }, [shop]);

  const copyLink = async () => {
    if (!shop) return;
    const url = `${window.location.origin}/p/${shop.username}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  /* ---------- Erreur ---------- */
  if (error) {
    return (
      <main className="container-app py-10">
        <ErrorState description={error} onRetry={() => void loadShop()} />
      </main>
    );
  }

  /* ---------- Actions rapides ---------- */
  const actions = [
    {
      to: "/dashboard/products",
      icon: Package,
      title: "Mes produits",
      desc: "Voir, modifier, activer/désactiver ton catalogue",
      tone: "blue" as const,
    },
    {
      to: "/dashboard/add/product",
      icon: Plus,
      title: "Ajouter un produit",
      desc: "Publier un nouvel article en quelques clics",
      tone: "green" as const,
    },
    {
      to: "/dashboard/categories",
      icon: Tags,
      title: "Catégories",
      desc: "Organise ton catalogue par thème",
      tone: "violet" as const,
    },
    {
      to: "/dashboard/shop",
      icon: Store,
      title: "Ma boutique",
      desc: "Logo, bannière, infos de livraison",
      tone: "amber" as const,
    },
  ];

  const toneMap = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  };

  /* =========================================================
     RENDER
     ========================================================= */
  return (
    <main className="container-app min-h-screen py-6 pb-12 sm:py-9">
      <style>{`
        @keyframes dash-in { from { opacity:0; transform:translateY(14px) } to {opacity:1; transform:translateY(0)} }
        @keyframes dash-glow { 0%,100% { opacity:.45; transform:scale(1) } 50% { opacity:.8; transform:scale(1.08) } }
        @keyframes wave { 0%,100% { transform:rotate(0deg) } 20% { transform:rotate(20deg) } 40% { transform:rotate(-8deg) } 60% { transform:rotate(15deg) } 80% { transform:rotate(-4deg) } }
        @keyframes float-mini { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-4px) } }
        @keyframes bar-grow { from { transform:scaleX(0) } to { transform:scaleX(1) } }
        @keyframes ring-fill { from { stroke-dashoffset: var(--ring-circumference) } to { stroke-dashoffset: var(--ring-offset) } }
        .dash-in { animation:dash-in .55s cubic-bezier(.2,.7,.2,1) both }
        .dash-delay-1 { animation-delay:.08s } .dash-delay-2 {animation-delay:.16s} .dash-delay-3 {animation-delay:.24s} .dash-delay-4 {animation-delay:.32s}
        .dash-wave { animation:wave 1.8s ease-in-out infinite; display:inline-block; transform-origin:70% 70%; }
        .dash-float { animation:float-mini 3s ease-in-out infinite; }
        .bar-fill { transform-origin: left; animation: bar-grow 1.2s cubic-bezier(.2,.7,.2,1) both; }
        @media(prefers-reduced-motion:reduce){.dash-in,.dash-wave,.dash-float,.bar-fill{animation:none!important;transition:none!important}}
      `}</style>

      {/* ============================================================
          HEADER
          ============================================================ */}
      <header className="dash-in flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
            <Sparkles size={15} /> Espace commerçant
          </div>
          <h1 className="text-3xl font-extrabold tracking-[-0.045em] text-slate-950 sm:text-4xl">
            Bonjour{user?.username ? `, ${user.username}` : ""}{" "}
            <span className="dash-wave">👋</span>
          </h1>
          <p className="mt-2 max-w-xl text-base leading-7 text-slate-500">
            Tout ce qu'il faut pour faire grandir ta boutique, au même endroit.
          </p>
        </div>
        <div className="flex flex-col">
          <Link to={`/dashboard/my-subscription`} className="mb-3 inline-flex  w-max items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-800 transition duration-300 hover:-translate-y-1 hover:bg-red-700/50 hover:shadow-red-700/20">
            <Timer /> Fin d'abonnement dans {shop?.days_left} jours
          </Link>
          {shop && (
          <Link
            to={`/p/${shop.username}`}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition duration-300 hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-emerald-700/20"
          >
            <ExternalLink size={17} /> Voir ma boutique
            <ArrowUpRight
              size={16}
              className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        )}
        </div>
      </header>

      {/* ============================================================
          BANNIÈRE PRINCIPALE
          ============================================================ */}
      <section className="dash-in dash-delay-1 relative mt-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#10b981] p-6 text-white shadow-xl shadow-emerald-900/10 sm:p-8 lg:p-9">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/15 bg-white/[0.04] [animation:dash-glow_7s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute right-20 top-20 h-28 w-28 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-white/[0.05] blur-2xl" />

        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
              <ChartNoAxesCombined size={17} /> Ton activité en un coup d'œil
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {shop?.shop_name || "Ta boutique Mboa237"}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-50/85 sm:text-base">
              {shop
                ? shop.products_count === 0
                  ? "Ta boutique est prête. Ajoute ton premier produit pour commencer à vendre."
                  : "Continue à mettre tes produits en valeur et partage ta boutique pour toucher plus de clients."
                : "Configure ta boutique, ajoute tes produits et commence à présenter ton catalogue en ligne."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/dashboard/shop"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-900 transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                <Settings2 size={16} /> Personnaliser
              </Link>
              <Link
                to="/dashboard/products"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <Package size={16} /> Gérer les produits
              </Link>
            </div>
          </div>

          <div className="hidden h-36 w-36 items-center justify-center rounded-[32px] border border-white/20 bg-white/10 md:flex">
            <Store size={66} strokeWidth={1.2} className="dash-float" />
          </div>
        </div>
      </section>

      {/* ============================================================
          CATALOGUE + SHARE (2 colonnes)
          ============================================================ */}
      {shop && (
        <div className="dash-in dash-delay-1 mt-4 grid gap-4 lg:grid-cols-2">
          {/* Catalogue slot */}
          <section className="relative overflow-hidden rounded-[24px] border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 p-5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="relative">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/25">
                  <Package size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[.18em] text-emerald-700">
                    Capacité du catalogue
                  </p>
                  <p className="mt-1 text-[16px] font-extrabold text-slate-900">
  {realProductsCount} / {shop.max_products} produit
  {shop.max_products > 1 ? "s" : ""}
</p>
<p className="mt-1 text-[12.5px] text-slate-500">
  {canAddProduct
    ? `${shop.max_products - realProductsCount} emplacement${
        shop.max_products - realProductsCount > 1 ? "s" : ""
      } disponible${shop.max_products - realProductsCount > 1 ? "s" : ""} · Plan ${shop.plan_label}`
    : "Limite atteinte · Passe en PRO pour ajouter plus de produits"}
</p>
                </div>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                <div
                  className={`bar-fill h-full rounded-full ${
                    shop.can_add_product
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                      : "bg-gradient-to-r from-amber-500 to-rose-500"
                  }`}
                  style={{ width: `${catalogUsage}%` }}
                />
              </div>

              <Link
                to="/dashboard/add/product"
                className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition ${
                  shop.can_add_product
                    ? "bg-emerald-700 text-white hover:bg-emerald-800"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
                }`}
              >
                <Plus size={15} /> Ajouter un produit
              </Link>
            </div>
          </section>

          {/* Share */}
          <section className="flex flex-col justify-between rounded-[24px] border border-slate-200/80 bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Share2 size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-400">
                  Lien de la boutique
                </p>
                <p className="mt-1 text-[14px] font-extrabold text-slate-900">
                  Partage ta boutique
                </p>
                <p className="mt-1 truncate font-mono text-[12px] text-slate-500">
                  {window.location.origin}/p/{shop.username}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={copyLink}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700"
              >
                <Copy size={14} /> Copier
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Découvre ma boutique Mboa237 : ${window.location.origin}/p/${shop.username}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#16a34a] px-3 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                <MessageCircle size={14} /> Partager
              </a>
            </div>
          </section>
        </div>
      )}

      {/* ============================================================
          STATS RÉELLES
          ============================================================ */}
      <section className="dash-in dash-delay-2 mt-9">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
              Performance
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
              Statistiques de la boutique
            </h2>
          </div>
          <button
            onClick={() => {
              void loadShop();
              void loadProducts();
            }}
            disabled={loading}
            aria-label="Actualiser"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <StatsGridSkeleton />
        ) : shop ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <Stat
              icon={Eye}
              label="Vues de la boutique"
              value={shop.views_count}
              hint={
                shop.views_count === 0
                  ? "Aucune visite encore"
                  : "Depuis la création"
              }
              color="green"
            />
            <Stat
              icon={MessageCircle}
              label="Clics WhatsApp"
              value={shop.whatsapp_clicks}
              hint={
                shop.whatsapp_clicks === 0
                  ? "Aucun clic encore"
                  : "Commandes potentielles"
              }
              color="blue"
            />
            <Stat
              icon={Package}
              label="Produits publiés"
              value={shop.products_count}
              hint={`sur ${shop.max_products} disponibles`}
              color="violet"
            />
            <Stat
              icon={Star}
              label="Note moyenne"
              value={shop.rating ?? "—"}
              hint={
                Number(shop.rating) > 0
                  ? "Avis clients"
                  : "Pas encore d'avis"
              }
              color="amber"
              isRating
            />
          </div>
        ) : null}
      </section>

      {/* ============================================================
          SANTÉ + CONVERSION (2 colonnes)
          ============================================================ */}
      {shop && health && (
        <div className="dash-in dash-delay-2 mt-8 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          {/* Santé de la boutique */}
          <section className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-emerald-700">
                  Complétude
                </p>
                <p className="mt-1 text-[15px] font-extrabold text-slate-900">
                  Santé de la boutique
                </p>
                <p className="mt-1 text-[12.5px] text-slate-500">
                  {health.score === 100
                    ? "Parfait, tout est en place !"
                    : "Complète les étapes pour inspirer confiance"}
                </p>
              </div>

              <HealthRing score={health.score} />
            </div>

            <ul className="mt-5 space-y-2">
              {health.checks.map((c) => {
                const Icon = c.icon;
                return (
                  <li
                    key={c.label}
                    className="flex items-center gap-2.5 text-[12.5px]"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        c.done
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {c.done ? <Check size={11} strokeWidth={3} /> : <Icon size={10} />}
                    </span>
                    <span
                      className={
                        c.done ? "text-slate-700" : "text-slate-400"
                      }
                    >
                      {c.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Conversion */}
          <section className="relative overflow-hidden rounded-[24px] border border-sky-200/70 bg-gradient-to-br from-sky-50 via-white to-sky-50/30 p-5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-sky-700">
                  Conversion
                </p>
                <p className="mt-1 text-[15px] font-extrabold text-slate-900">
                  Visiteurs → clics WhatsApp
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Target size={18} />
              </span>
            </div>

            <div className="relative mt-5">
              <div className="flex items-baseline gap-2">
                <span className="text-[34px] font-black tracking-tight text-slate-950 tabular-nums">
                  <CountUpNumber value={conversionRate} decimals={1} />
                  <span className="ml-1 text-[18px] font-bold text-slate-400">%</span>
                </span>
                {conversionRate >= 5 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
                    Excellent
                  </span>
                )}
              </div>

              <p className="mt-1 text-[12.5px] text-slate-500">
                {shop.views_count === 0
                  ? "Aucune visite pour l'instant"
                  : shop.whatsapp_clicks === 0
                    ? "Tes visiteurs n'ont pas encore cliqué sur WhatsApp"
                    : `${shop.whatsapp_clicks} clic${shop.whatsapp_clicks > 1 ? "s" : ""} sur ${shop.views_count} visite${shop.views_count > 1 ? "s" : ""}`}
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-sky-100">
                <div
                  className="bar-fill h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                  style={{ width: `${Math.min(100, conversionRate * 10)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>0%</span>
                <span>Objectif : 5%+</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ============================================================
          RECOMMANDATIONS (basées sur les vrais manques)
          ============================================================ */}
      {shop && insights.length > 0 && (
        <section className="dash-in dash-delay-3 mt-9">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
              Prochaines étapes
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
              Recommandations personnalisées
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Actions concrètes basées sur l'état actuel de ta boutique.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((ins, i) => {
              const Icon = ins.icon;
              const tone =
                ins.tone === "warn"
                  ? "border-amber-200 bg-amber-50/60 text-amber-700"
                  : ins.tone === "success"
                    ? "border-emerald-200 bg-emerald-50/60 text-emerald-700"
                    : "border-sky-200 bg-sky-50/60 text-sky-700";
              return (
                <div
                  key={ins.title}
                  style={{
                    animation: `dash-in 0.55s cubic-bezier(.2,.7,.2,1) ${i * 0.08}s both`,
                  }}
                  className={`relative flex flex-col rounded-2xl border bg-white p-4 ${tone}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-extrabold text-slate-900">
                        {ins.title}
                      </p>
                      <p className="mt-1 text-[12px] leading-5 text-slate-500">
                        {ins.desc}
                      </p>
                    </div>
                  </div>
                  {ins.action && (
                    <Link
                      to={ins.action.to}
                      className="mt-3 inline-flex items-center gap-1.5 self-start rounded-lg bg-slate-900 px-3 py-1.5 text-[11.5px] font-bold text-white transition hover:bg-emerald-700"
                    >
                      {ins.action.label}
                      <ArrowRight size={11} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================================
          PRODUITS POPULAIRES (vraies données)
          ============================================================ */}
      {shop && (
        <section className="dash-in dash-delay-3 mt-9">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
                Top produits
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                Tes articles les plus vus
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Basé sur les vraies vues enregistrées.
              </p>
            </div>
            <Link
              to="/dashboard/products"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-emerald-700 underline-offset-4 hover:underline"
            >
              Voir tout <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5">
            {loadingProducts ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex animate-pulse items-center gap-3"
                  >
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-2/3 rounded bg-slate-100" />
                      <div className="h-2.5 w-1/3 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <TrendingUp size={22} />
                </span>
                <div>
                  <p className="text-[14px] font-bold text-slate-900">
                    {products.length === 0
                      ? "Aucun produit pour l'instant"
                      : "Aucune vue enregistrée"}
                  </p>
                  <p className="mt-1 text-[12.5px] text-slate-500">
                    {products.length === 0
                      ? "Ajoute ton premier produit pour voir tes stats évoluer."
                      : "Partage ta boutique pour générer des vues."}
                  </p>
                </div>
                {products.length === 0 && (
                  <Link
                    to="/dashboard/add/product"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-[12.5px] font-bold text-white transition hover:bg-emerald-800"
                  >
                    <Plus size={13} /> Ajouter un produit
                  </Link>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {topProducts.map((p, i) => {
                  const maxViews = topProducts[0]?.views_count || 1;
                  const pct = Math.round((p.views_count / maxViews) * 100);
                  const cover = p.image || p.images?.[0] || null;
                  return (
                    <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="w-6 shrink-0 text-center text-[13px] font-black text-slate-400 tabular-nums">
                        {i + 1}
                      </span>
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-stone-100">
                        {cover ? (
                          <img
                            src={cover}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <Package size={18} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-extrabold text-slate-900">
                          {p.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 tabular-nums">
                            <Eye size={10} /> {p.views_count}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/dashboard/edit/product/${p.id}`}
                        aria-label={`Modifier ${p.name}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-emerald-700"
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ============================================================
          ACTIONS RAPIDES
          ============================================================ */}
      <section className="dash-in dash-delay-3 mt-10">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
            À portée de main
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
            Gestion rapide
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Les raccourcis essentiels pour gérer ton activité.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map(({ to, icon: Icon, title, desc, tone }) => (
            <Link
              key={to}
              to={to}
              className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/[0.06]"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/0 blur-2xl transition duration-500 group-hover:bg-emerald-100/70" />
              <div
                className={`relative flex h-11 w-11 items-center justify-center rounded-2xl ${toneMap[tone]} transition duration-300 group-hover:scale-110`}
              >
                <Icon size={21} />
              </div>
              <div className="relative mt-4 flex items-center justify-between gap-3">
                <h3 className="text-[15px] font-extrabold text-slate-900">
                  {title}
                </h3>
                <ArrowUpRight
                  size={16}
                  className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700"
                />
              </div>
              <p className="relative mt-1.5 text-[12.5px] leading-5 text-slate-500">
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          MA BOUTIQUE EN UN COUP D'ŒIL (données réelles)
          ============================================================ */}
      {shop && (
        <section className="dash-in dash-delay-3 mt-10">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
              Résumé
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
              Ma boutique en un coup d'œil
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <SummaryCard
              icon={Store}
              label="Plan"
              value={shop.plan_label}
              hint={shop.is_pro ? "Accès complet" : "Limité à 10 produits"}
              tone="emerald"
            />
            <SummaryCard
              icon={MapPin}
              label="Ville"
              value={shop.city || "Non renseignée"}
              hint="Zone d'activité"
              tone="sky"
            />
            <SummaryCard
              icon={ShieldCheck}
              label="Vérification"
              value={shop.is_verified ? "Vérifiée" : "En attente"}
              hint={
                shop.is_verified
                  ? "Badge affiché"
                  : "Demande la vérification"
              }
              tone={shop.is_verified ? "emerald" : "slate"}
            />
            <SummaryCard
              icon={Calendar}
              label="Créée le"
              value={new Date(shop.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              hint="Depuis le lancement"
              tone="amber"
            />
          </div>
        </section>
      )}

      {/* ============================================================
          TIPS CAROUSEL
          ============================================================ */}
      <section className="dash-in dash-delay-4 mt-8">
        <div className="relative overflow-hidden rounded-[24px] border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-amber-50/50 p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Lightbulb size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-amber-700">
                  Astuce du jour
                </p>
                <span className="text-[11px] text-amber-700/60">
                  {tipIndex + 1} / {TIPS.length}
                </span>
              </div>
              <div key={tipIndex} style={{ animation: "dash-in .4s ease both" }} className="mt-2">
                <p className="text-[15px] font-extrabold text-slate-900">
                  {TIPS[tipIndex].title}
                </p>
                <p className="mt-1 text-[13.5px] leading-6 text-slate-600">
                  {TIPS[tipIndex].desc}
                </p>
              </div>
              <div className="mt-4 flex gap-1.5">
                {TIPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTipIndex(i)}
                    aria-label={`Astuce ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === tipIndex ? "w-6 bg-amber-600" : "w-1.5 bg-amber-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <Zap size={18} className="hidden shrink-0 text-amber-500 sm:block" />
          </div>
        </div>
      </section>

      {/* ============================================================
          HELP
          ============================================================ */}
      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        <CircleHelp size={18} className="mt-0.5 shrink-0 text-emerald-700" />
        <p>
          Astuce : partage le lien de ta boutique avec tes clients pour leur permettre de découvrir
          tes produits plus facilement.
        </p>
      </div>
    </main>
  );
}

/* =========================================================
   STAT
   ========================================================= */
function Stat({
  icon: Icon,
  label,
  value,
  hint,
  color,
  isRating = false,
}: {
  icon: typeof Eye;
  label: string;
  value: number | string;
  hint: string;
  color: "green" | "blue" | "violet" | "amber";
  isRating?: boolean;
}) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  };
  const numericValue =
    typeof value === "number" ? value : Number(value) || 0;
  const animated = useCountUp(
    isRating ? numericValue * 10 : numericValue,
    1400
  );
  const display = isRating
    ? Number(value) > 0
      ? (animated / 10).toFixed(1)
      : "—"
    : typeof value === "number"
      ? Math.round(animated).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ")
      : value;

  return (
    <article className="group rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${styles[color]}`}
        >
          <Icon size={21} />
        </span>
        <CheckCircle2
          size={16}
          className="text-slate-300 transition group-hover:text-emerald-600"
        />
      </div>
      <div className="mt-5 break-words text-2xl font-extrabold tracking-tight text-slate-950 tabular-nums sm:text-3xl">
        {display}
      </div>
      <div className="mt-1 text-sm font-bold text-slate-700">{label}</div>
      <div className="mt-1 text-xs leading-5 text-slate-400">{hint}</div>
    </article>
  );
}

/* =========================================================
   HEALTH RING — cercle SVG animé
   ========================================================= */
function HealthRing({ score }: { score: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#16a34a" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition:
              "stroke-dashoffset 1.4s cubic-bezier(0.2, 0.7, 0.2, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[17px] font-black tabular-nums text-slate-900">
          <CountUpNumber value={score} decimals={0} />%
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   COUNT UP NUMBERS (petit utilitaire)
   ========================================================= */
function CountUpNumber({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const v = useCountUp(value * Math.pow(10, decimals));
  return (
    <>{decimals > 0 ? (v / Math.pow(10, decimals)).toFixed(decimals) : Math.round(v)}</>
  );
}

/* =========================================================
   SUMMARY CARD
   ========================================================= */
function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  hint: string;
  tone: "emerald" | "sky" | "amber" | "slate";
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors[tone]}`}
        >
          <Icon size={15} />
        </span>
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <p className="mt-2.5 truncate text-[14.5px] font-extrabold text-slate-900">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-slate-400">{hint}</p>
    </article>
  );
}