// src/pages/HomePage.tsx
// Premium, responsive home page for Mboa237.
// Keeps the existing publicApi contract and React Router destinations.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Percent,
  Quote,
  Rocket,
  ShieldCheck,
  Smartphone,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Truck,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { publicApi } from "@/lib/api";
import type { Product, Shop } from "@/lib/types";

interface ProductWithShop {
  product: Product;
  shop: Shop;
}

function formatFcfa(value: number): string {
  return `${Number(value || 0)
    .toLocaleString("fr-FR")
    .replace(/[\u202f\u00a0]/g, " ")} F`;
}

function getInitials(name = "Mboa Shop"): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toLocaleUpperCase("fr-FR");
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (
      typeof window === "undefined" ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      element.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`mboa-reveal ${className}`.trim()}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function Eyebrow({
  icon: Icon,
  children,
  dark = false,
}: {
  icon: LucideIcon;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <span
      className={
        dark
          ? "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold tracking-wide text-white/80 backdrop-blur-xl"
          : "inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/85 px-3.5 py-2 text-xs font-semibold tracking-wide text-emerald-800 shadow-sm shadow-emerald-950/[0.03] backdrop-blur-xl"
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
  dark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  icon: LucideIcon;
  action?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Eyebrow icon={Icon} dark={dark}>
          {eyebrow}
        </Eyebrow>
        <h2
          className={`mt-4 text-3xl font-black leading-[1.08] tracking-[-0.045em] sm:text-4xl lg:text-[2.75rem] ${
            dark ? "text-white" : "text-[#14251b]"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-4 max-w-xl text-base leading-7 ${
              dark ? "text-white/60" : "text-[#637168]"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function OutlineLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#dce5de] bg-white px-5 py-3 text-sm font-bold text-[#24382b] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/[0.06] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

function PrimaryLink({
  to,
  children,
  light = false,
  className = "",
}: {
  to: string;
  children: ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={`mboa-primary group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-bold transition duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25 ${
        light
          ? "bg-white text-[#102318] shadow-lg shadow-black/10 hover:-translate-y-0.5 hover:bg-emerald-50"
          : "bg-[#123522] text-white shadow-xl shadow-emerald-950/15 hover:-translate-y-0.5 hover:bg-[#1a4b30] hover:shadow-2xl hover:shadow-emerald-950/20"
      } ${className}`}
    >
      <span className="mboa-button-sheen" aria-hidden="true" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </Link>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`mboa-skeleton rounded-2xl ${className}`} aria-hidden="true" />;
}

function ShopCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-[#e8eee9] bg-white">
      <Skeleton className="h-24 rounded-none" />
      <div className="px-4 pb-5">
        <Skeleton className="-mt-8 h-16 w-16 rounded-2xl border-4 border-white" />
        <Skeleton className="mt-4 h-4 w-3/4" />
        <Skeleton className="mt-3 h-3 w-1/2" />
        <Skeleton className="mt-5 h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-[#e8eee9] bg-white p-2.5">
      <Skeleton className="aspect-[4/4.5] rounded-[1.05rem]" />
      <div className="space-y-3 px-1 pb-1 pt-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

function ShopCard({ shop, index }: { shop: Shop; index: number }) {
  return (
    <Reveal delay={Math.min(index * 55, 275)} className="h-full">
      <Link
        to={`/p/${shop.username}`}
        className="group flex h-full flex-col overflow-hidden rounded-[1.45rem] border border-[#e8eee9] bg-white shadow-[0_6px_24px_-18px_rgba(19,49,31,0.3)] transition duration-500 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_24px_55px_-25px_rgba(20,83,45,0.24)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
      >
        <div className="relative h-24 overflow-hidden bg-gradient-to-br from-[#0c4729] via-[#16804a] to-[#65c887]">
          {shop.banner ? (
            <img
              src={shop.banner}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
          ) : (
            <>
              <div className="absolute -right-5 -top-12 h-36 w-36 rounded-full border border-white/20" />
              <div className="absolute -right-1 -top-7 h-24 w-24 rounded-full border border-white/20" />
              <div className="absolute -bottom-10 left-1/3 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <Store className="absolute bottom-4 right-5 h-9 w-9 text-white/35" strokeWidth={1.2} />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {shop.is_verified && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-emerald-800 shadow-sm backdrop-blur">
              <BadgeCheck className="h-3.5 w-3.5" /> Vérifiée
            </span>
          )}
        </div>

        <div className="relative flex flex-1 flex-col px-4 pb-4">
          <div className="-mt-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-[4px] border-white bg-white shadow-lg shadow-black/10">
            {shop.logo ? (
              <img src={shop.logo} alt={shop.shop_name} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-[#0c4729] text-lg font-black text-white">
                {getInitials(shop.shop_name)}
              </span>
            )}
          </div>

          <h3 className="mt-3 line-clamp-1 text-base font-extrabold tracking-tight text-[#172b1e]">
            {shop.shop_name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-[#78857d]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-700" />
              <span className="line-clamp-1">{shop.city || "Cameroun"}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-emerald-700" />
              {shop.products_count} articles
            </span>
            {Number(shop.rating) > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {shop.rating}
              </span>
            )}
          </div>
          {shop.tagline && (
            <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-[#68766d]">{shop.tagline}</p>
          )}
          <div className="mt-auto flex items-center justify-between border-t border-[#edf1ed] pt-4">
            <span className="text-sm font-bold text-emerald-800">Visiter la boutique</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 transition duration-300 group-hover:translate-x-1 group-hover:bg-emerald-700 group-hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

function ProductCard({ item, index }: { item: ProductWithShop; index: number }) {
  const { product, shop } = item;
  const cover = product.image || product.images?.[0] || null;
  const isDiscounted = Number(product.discount_percent || 0) > 0;

  const orderOnWhatsApp = useCallback(() => {
    const phone = String(shop.whatsapp_number || "").replace(/\D/g, "");
    if (!phone) {
      window.location.assign(`/p/${shop.username}`);
      return;
    }

    const message = [
      `Bonjour ${shop.shop_name} 👋`,
      "",
      "Je souhaite commander :",
      "",
      product.name,
      formatFcfa(product.price),
      "",
      "Merci !",
    ].join("\n");

    // Tracking is best-effort; an analytics error should never block the order.
    void publicApi.trackWhatsappClick(shop.username, product.id).catch(() => undefined);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }, [product.id, product.name, product.price, shop.shop_name, shop.username, shop.whatsapp_number]);

  return (
    <Reveal delay={Math.min(index * 35, 210)} className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-[1.45rem] border border-[#e8eee9] bg-white p-2.5 shadow-[0_6px_24px_-18px_rgba(19,49,31,0.32)] transition duration-500 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_24px_55px_-25px_rgba(20,83,45,0.23)]">
        <Link
          to={`/p/${shop.username}`}
          aria-label={`Voir ${product.name} dans la boutique ${shop.shop_name}`}
          className="relative block aspect-[4/4.5] overflow-hidden rounded-[1.1rem] bg-[#f1f5f1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25"
        >
          {cover ? (
            <img
              src={cover}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_20%_20%,#e0f2e6,transparent_55%),linear-gradient(135deg,#f4f7f4,#e7efe8)] text-emerald-800/45">
              <ShoppingBag className="h-14 w-14" strokeWidth={1.2} />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/[0.02] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />

          {product.badge && (
            <span
              className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-extrabold shadow-sm ${
                product.badge === "PROMO"
                  ? "bg-rose-500 text-white"
                  : product.badge === "NEW"
                    ? "bg-sky-600 text-white"
                    : "bg-amber-400 text-[#30250b]"
              }`}
            >
              {product.badge === "PROMO" ? <Percent className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
              {product.badge_label || product.badge}
            </span>
          )}

          {isDiscounted && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-black text-rose-600 shadow-sm">
              -{product.discount_percent}%
            </span>
          )}
          <span className="absolute bottom-2.5 left-2.5 inline-flex max-w-[calc(100%-1.25rem)] items-center gap-1.5 rounded-full border border-white/50 bg-white/90 px-2.5 py-1.5 text-[11px] font-bold text-[#314638] shadow-sm backdrop-blur-md">
            <Store className="h-3.5 w-3.5 shrink-0 text-emerald-800" />
            <span className="truncate">{shop.shop_name}</span>
          </span>
        </Link>

        <div className="flex flex-1 flex-col px-1 pb-1 pt-3.5">
          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-[#172b1e] sm:text-[15px]">
            {product.name}
          </h3>
          <div className="mt-auto pt-3">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-base font-black tracking-tight text-[#123522] sm:text-lg">
                {formatFcfa(product.price)}
              </span>
              {product.was_price && (
                <span className="text-xs font-medium text-[#97a29b] line-through">
                  {formatFcfa(product.was_price)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={orderOnWhatsApp}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#123522] px-3 py-2.5 text-sm font-bold text-white transition duration-300 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25 active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              Commander
              <ArrowUpRight className="ml-auto h-4 w-4 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

const FEATURES: { icon: LucideIcon; title: string; description: string; number: string }[] = [
  {
    icon: Zap,
    number: "01",
    title: "Une boutique en quelques clics",
    description: "Choisis ton nom, ajoute tes informations et partage un lien professionnel, sans savoir coder.",
  },
  {
    icon: MessageCircle,
    number: "02",
    title: "Les commandes sur WhatsApp",
    description: "Tes clients choisissent leurs articles et te contactent directement pour commander.",
  },
  {
    icon: Wallet,
    number: "03",
    title: "Mobile Money et paiement flexible",
    description: "Orange Money et MTN MoMo s’intègrent aux habitudes de paiement des clients au Cameroun.",
  },
  {
    icon: Percent,
    number: "04",
    title: "0% de commission sur tes ventes",
    description: "Garde le revenu de tes ventes. La plateforme ne prélève pas de commission sur chaque commande.",
  },
  {
    icon: Truck,
    number: "05",
    title: "Pensé pour la livraison locale",
    description: "Présente tes produits et échange avec tes clients pour organiser la remise ou la livraison.",
  },
  {
    icon: ShieldCheck,
    number: "06",
    title: "Une vitrine claire et rassurante",
    description: "Affiche tes articles, tes prix et les informations utiles dans une boutique simple à parcourir.",
  },
];

const STEPS: { number: string; icon: LucideIcon; title: string; description: string }[] = [
  { number: "01", icon: Store, title: "Crée ta boutique", description: "Choisis un nom et configure ta vitrine." },
  { number: "02", icon: Package, title: "Présente tes produits", description: "Ajoute de belles photos, tes prix et les détails." },
  { number: "03", icon: MessageCircle, title: "Partage ton lien", description: "Envoie ta boutique sur WhatsApp et les réseaux." },
  { number: "04", icon: TrendingUp, title: "Développe tes ventes", description: "Discute directement avec tes clients et organise les commandes." },
];

const TESTIMONIALS = [
  {
    name: "Marie Kamdem",
    city: "Douala",
    business: "SAWA House",
    initials: "MK",
    text: "J'ai mis ma boutique en ligne en moins de deux minutes. Les commandes tombent direct sur WhatsApp, je gère tout depuis mon téléphone.",
  },
  {
    name: "Éric Bello",
    city: "Yaoundé",
    business: "Bello Électro",
    initials: "EB",
    text: "0% commission c'est ce qui m'a convaincu. Je garde 100% de mes ventes et je ne paie que 5000 F/mois pour le plan Pro.",
  },
  {
    name: "Aminatou Ngono",
    city: "Bafoussam",
    business: "Chez Amina",
    initials: "AN",
    text: "Mes clientes adorent le côté simple : elles voient les articles, cliquent, et commandent. Plus besoin de renvoyer des photos une par une.",
  },
];

function StorefrontPreview() {
  const previewProducts = [
    { name: "Sneakers Urban", price: "18 500 F", tint: "from-orange-100 via-rose-50 to-white", mark: "S" },
    { name: "Sac Élégance", price: "12 000 F", tint: "from-amber-100 via-yellow-50 to-white", mark: "E" },
    { name: "Casque audio", price: "25 000 F", tint: "from-sky-100 via-cyan-50 to-white", mark: "A" },
    { name: "Montre Classic", price: "15 000 F", tint: "from-violet-100 via-fuchsia-50 to-white", mark: "C" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[36rem] lg:ml-auto">
      <div className="mboa-orbit pointer-events-none absolute -inset-5 rounded-[2.8rem] border border-emerald-200/70" />
      <div className="mboa-orbit mboa-orbit-reverse pointer-events-none absolute -inset-10 rounded-[3.4rem] border border-dashed border-emerald-200/60" />
      <div className="mboa-float relative rounded-[2rem] border border-white/80 bg-white/75 p-2.5 shadow-[0_32px_100px_-35px_rgba(17,72,39,0.34)] backdrop-blur-xl sm:p-3.5">
        <div className="overflow-hidden rounded-[1.55rem] border border-[#e6eee8] bg-[#fbfdfb]">
          <div className="flex items-center gap-1.5 border-b border-[#edf1ed] bg-white px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            <div className="ml-3 flex min-w-0 flex-1 items-center justify-center rounded-full bg-[#f4f7f4] px-3 py-1.5 text-[11px] font-medium text-[#8a978e]">
              <span className="truncate">mboa237.com/p/sawa-house</span>
            </div>
            <BadgeCheck className="ml-1 h-4 w-4 shrink-0 text-emerald-700" />
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-[#0d4328] via-[#126638] to-[#239b58] px-5 pb-7 pt-6 text-white sm:px-7 sm:pt-7">
            <div className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -right-1 -top-9 h-32 w-32 rounded-full border border-white/15" />
            <div className="relative flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-base font-black shadow-inner backdrop-blur-sm">
                SH
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-extrabold tracking-tight sm:text-xl">SAWA House</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold text-white/90">
                    <BadgeCheck className="h-3 w-3" /> Boutique
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/65">Mode · Lifestyle · Accessoires</p>
              </div>
              <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-800 sm:flex">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
            <div className="relative mt-6 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/75">La sélection du moment</p>
                <p className="mt-1.5 text-sm font-semibold text-white/95">Des trouvailles qui te ressemblent.</p>
              </div>
              <div className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold sm:block">
                Découvrir <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          <div className="px-3.5 pb-4 pt-4 sm:px-5 sm:pb-5">
            <div className="mb-3.5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold tracking-tight text-[#193324]">Les favoris du shop</p>
                <p className="mt-0.5 text-[11px] text-[#8a978e]">Une vitrine pensée pour le mobile</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800">4 articles</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {previewProducts.map((item, index) => (
                <div
                  key={item.name}
                  className="group/preview overflow-hidden rounded-2xl border border-[#e8eee9] bg-white p-2 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-950/[0.07] sm:p-2.5"
                >
                  <div className={`relative flex aspect-[1.25/1] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${item.tint}`}>
                    <span className="absolute -right-5 -top-6 h-20 w-20 rounded-full border border-white/70" />
                    <span className="absolute -bottom-7 -left-4 h-20 w-20 rounded-full bg-white/40 blur-lg" />
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/75 text-lg font-black text-[#365744] shadow-sm transition duration-500 group-hover/preview:rotate-[-6deg] group-hover/preview:scale-110">
                      {item.mark}
                    </span>
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-rose-600">Tendance</span>
                    )}
                  </div>
                  <p className="mt-2.5 line-clamp-1 text-xs font-bold text-[#253a2c] sm:text-sm">{item.name}</p>
                  <p className="mt-1 text-sm font-black text-emerald-800">{item.price}</p>
                </div>
              ))}
            </div>
            <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[#244331]">Commande directe sur WhatsApp</p>
                <p className="mt-0.5 text-[11px] text-[#728277]">Simple pour le vendeur comme pour le client.</p>
              </div>
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="mboa-float-delayed absolute -left-3 bottom-16 hidden items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-xl shadow-emerald-950/10 backdrop-blur-xl sm:flex lg:-left-12">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#1b3525]">Ta boutique, partout</p>
          <p className="mt-1 text-[11px] text-[#7d8a81]">Un seul lien à partager</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-emerald-700" />
      </div>

      <div className="mboa-float absolute -right-1 top-24 hidden items-center gap-2.5 rounded-2xl border border-white/80 bg-white/95 px-3.5 py-3 shadow-xl shadow-emerald-950/10 backdrop-blur-xl md:flex lg:-right-6">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f8ed] text-emerald-800">
          <MessageCircle className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
        </span>
        <div>
          <p className="text-xs font-extrabold text-[#1b3525]">Prêt à vendre ?</p>
          <p className="mt-0.5 text-[11px] text-[#7d8a81]">Ça commence ici.</p>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(22,101,52,0.075)_1px,transparent_0)] [background-size:23px_23px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
        <div className="mboa-blob absolute -right-36 -top-32 h-[28rem] w-[28rem] rounded-full bg-emerald-200/45 blur-[100px]" />
        <div className="mboa-blob mboa-blob-delay absolute -left-40 top-72 h-[25rem] w-[25rem] rounded-full bg-lime-100/70 blur-[105px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#fbfcfa] to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[0.96fr_1.04fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="relative z-10">
          <Reveal>
            <Eyebrow icon={Sparkles}>Le commerce camerounais, en plus simple</Eyebrow>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 max-w-3xl text-[2.65rem] font-black leading-[0.99] tracking-[-0.065em] text-[#14251b] sm:text-6xl lg:text-[4.65rem] xl:text-[5rem]">
              Ta boutique en ligne,
              <span className="relative mt-1 block text-emerald-700">
                prête en 30 secondes.
                <svg className="pointer-events-none absolute -bottom-2 left-0 h-3 w-[94%] text-emerald-300 sm:h-4" viewBox="0 0 500 18" fill="none" aria-hidden="true">
                  <path d="M3 13C109 3 308 1 496 9" stroke="currentColor" strokeWidth="7" strokeLinecap="round" opacity=".7" />
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#637168] sm:text-lg sm:leading-8">
              Présente tes produits dans une vraie vitrine en ligne, partage ton lien et reçois tes commandes sur WhatsApp. Pas besoin de savoir coder.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PrimaryLink to="/register" className="w-full sm:w-auto">
                <Rocket className="h-5 w-5" /> Créer ma boutique <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </PrimaryLink>
              <OutlineLink to="/shops">
                <Store className="h-4 w-4 text-emerald-800" /> Explorer les boutiques
              </OutlineLink>
            </div>
          </Reveal>

          <Reveal delay={290}>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold text-[#637168]">
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-700" /> Mise en place rapide</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-700" /> 0% sur tes ventes</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-700" /> Pensé mobile</span>
            </div>
          </Reveal>

          <Reveal delay={350}>
            <div className="mt-10 flex items-center gap-4 border-t border-[#e2eae3] pt-6">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {[
                  "from-amber-200 to-orange-300",
                  "from-emerald-200 to-teal-400",
                  "from-sky-200 to-blue-300",
                  "from-violet-200 to-fuchsia-300",
                ].map((gradient, index) => (
                  <span key={gradient} className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#fbfcfa] bg-gradient-to-br ${gradient} text-xs font-black text-[#193a27]`}>
                    { ["M", "J", "A", "E"][index] }
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-500" aria-label="5 étoiles">
                  {[0, 1, 2, 3, 4].map((value) => <Star key={value} className="h-3.5 w-3.5 fill-current" />)}
                  <span className="ml-1 text-xs font-extrabold text-[#314638]">Pensé pour les vendeurs d'ici</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#849087]">Une vitrine plus claire pour tes clients, sur téléphone et ordinateur.</p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} className="relative z-0 w-full">
          <StorefrontPreview />
        </Reveal>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9aa69d] lg:flex" aria-hidden="true">
        <ArrowDownRight className="h-4 w-4" /> Découvrir Mboa237
      </div>
    </section>
  );
}

function TrustStrip() {
  const trustItems = [
    { icon: MessageCircle, title: "Commandes WhatsApp", description: "Contact direct avec tes clients" },
    { icon: Wallet, title: "Paiements flexibles", description: "Orange Money · MTN MoMo" },
    { icon: ShieldCheck, title: "Une vitrine claire", description: "Infos et produits au même endroit" },
    { icon: Smartphone, title: "Mobile & ordinateur", description: "Accessible sur tous les écrans" },
  ];

  return (
    <section className="relative z-10 border-y border-[#e7eee8] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-4 gap-y-5 px-4 py-6 sm:px-6 md:grid-cols-4 md:gap-6 md:py-7 lg:px-8">
        {trustItems.map(({ icon: Icon, title, description }, index) => (
          <Reveal key={title} delay={index * 50} className="h-full">
            <div className="flex h-full items-start gap-3 sm:items-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-800 transition duration-300 hover:rotate-[-5deg] hover:scale-105">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold leading-5 text-[#203729]">{title}</p>
                <p className="mt-1 text-xs leading-5 text-[#829087]">{description}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}


function EmptyState({
  icon: Icon,
  title,
  description,
  to,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  action: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-[#d9e4db] bg-white px-5 py-14 text-center sm:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-emerald-50 text-emerald-800 ring-8 ring-emerald-50/60">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-6 text-lg font-extrabold tracking-tight text-[#1c3224]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#758279]">{description}</p>
      <div className="mt-6">
        <PrimaryLink to={to}>{action} <ArrowRight className="h-4 w-4" /></PrimaryLink>
      </div>
    </div>
  );
}

function FeatureSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute -right-40 top-12 h-80 w-80 rounded-full bg-emerald-100/55 blur-[100px]" aria-hidden="true" />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Conçu pour vendre"
            icon={Zap}
            title={<>Tout ce qu'il faut pour <span className="text-emerald-700">passer au digital.</span></>}
            description="Une expérience simple pour présenter tes articles, prendre contact avec tes clients et développer ton activité au Cameroun."
          />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, number, title, description }, index) => (
            <Reveal key={number} delay={index * 55} className="h-full">
              <article className="group relative h-full overflow-hidden rounded-[1.6rem] border border-[#e5ece6] bg-white p-5 shadow-[0_10px_36px_-28px_rgba(19,49,31,0.22)] transition duration-500 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_28px_65px_-35px_rgba(20,83,45,0.3)] sm:p-6">
                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-100/70 opacity-0 blur-2xl transition duration-700 group-hover:opacity-100" />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white text-emerald-800 shadow-sm transition duration-500 group-hover:rotate-[-6deg] group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-black tracking-[0.18em] text-[#cad5cc] transition-colors group-hover:text-emerald-700">{number}</span>
                </div>
                <h3 className="relative mt-6 text-lg font-extrabold tracking-tight text-[#1d3425]">{title}</h3>
                <p className="relative mt-2.5 text-sm leading-6 text-[#77847b]">{description}</p>
                <div className="relative mt-5 flex items-center gap-2 text-xs font-extrabold text-emerald-800">
                  <span>Simple et pratique</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-y border-[#e7eee8] bg-[#f3f7f3] py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(22,101,52,0.06)_1px,transparent_0)] [background-size:25px_25px]" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Le parcours"
            icon={TrendingUp}
            title={<>Quatre étapes. <span className="text-emerald-700">C'est tout.</span></>}
            description="Tu peux commencer petit, ajouter tes articles au fur et à mesure et partager ta vitrine dès qu'elle est prête."
          />
        </Reveal>
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-[11%] right-[11%] top-9 hidden h-px bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 lg:block" />
          {STEPS.map(({ number, icon: Icon, title, description }, index) => (
            <Reveal key={number} delay={index * 75} className="h-full">
              <article className="relative h-full rounded-[1.5rem] border border-[#e3ebe4] bg-white p-5 shadow-sm transition duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-950/[0.06] sm:p-6">
                <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.35rem] border border-emerald-100 bg-white text-emerald-800 shadow-[0_10px_22px_-15px_rgba(18,75,41,0.4)] transition duration-500 group-hover:scale-105">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full border-[3px] border-white bg-[#123522] px-1 text-[10px] font-black text-white">{number}</span>
                </div>
                <h3 className="mt-6 text-lg font-extrabold tracking-tight text-[#203729]">{title}</h3>
                <p className="mt-2.5 text-sm leading-6 text-[#78857d]">{description}</p>
                {index < STEPS.length - 1 && (
                  <div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-800 lg:hidden">
                    Étape suivante <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "500+", label: "Boutiques actives", icon: Store },
    { value: "10k+", label: "Produits présentés", icon: Package },
    { value: "25k+", label: "Commandes WhatsApp", icon: MessageCircle },
    { value: "0%", label: "Commission sur les ventes", icon: Percent },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-[#0d2115] py-16 text-white sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-32 -top-44 h-[28rem] w-[28rem] rounded-full bg-emerald-700/35 blur-[100px]" />
        <div className="absolute -bottom-48 right-0 h-[30rem] w-[30rem] rounded-full bg-lime-500/15 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:28px_28px] [mask-image:linear-gradient(to_right,black,transparent)]" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16 lg:px-8">
        <Reveal>
          <Eyebrow icon={TrendingUp} dark>Le commerce évolue</Eyebrow>
          <h2 className="mt-5 max-w-lg text-3xl font-black leading-[1.06] tracking-[-0.05em] sm:text-4xl lg:text-[3.25rem]">
            Fais grandir ton activité, <span className="text-emerald-300">à ta façon.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/60">
            Une vitrine digitale accessible, faite pour les commerçants qui veulent avancer sans compliquer leur quotidien.
          </p>
          <div className="mt-7">
            <PrimaryLink to="/register" light>Je lance ma boutique <ArrowRight className="h-4 w-4" /></PrimaryLink>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {stats.map(({ value, label, icon: Icon }, index) => (
            <Reveal key={label} delay={index * 65} className="h-full">
              <div className="group h-full rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-sm transition duration-500 hover:-translate-y-1 hover:border-emerald-300/35 hover:bg-white/[0.09] sm:p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200 transition duration-500 group-hover:rotate-[-6deg] group-hover:bg-emerald-300 group-hover:text-[#0d2115]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-5 text-3xl font-black tracking-[-0.05em] sm:text-4xl">{value}</p>
                <p className="mt-2 text-xs font-bold leading-5 text-white/55 sm:text-sm">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Paroles de commerçants"
            icon={Heart}
            title={<>Plus simple pour vendre, <span className="text-emerald-700">plus simple pour acheter.</span></>}
            description="Une expérience de boutique plus claire, que tes clients consultent depuis leur téléphone ou leur ordinateur."
          />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <Reveal key={item.name} delay={index * 70} className="h-full">
              <figure className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-[#e5ece6] bg-white p-5 shadow-[0_10px_36px_-28px_rgba(19,49,31,0.24)] transition duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-950/[0.07] sm:p-6">
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-50 transition duration-500 group-hover:scale-125" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500" aria-label="5 étoiles">
                    {[0, 1, 2, 3, 4].map((star) => <Star key={star} className="h-4 w-4 fill-current" />)}
                  </div>
                  <Quote className="h-7 w-7 text-emerald-700/20" />
                </div>
                <blockquote className="relative mt-5 flex-1 text-[15px] leading-7 text-[#526157]">« {item.text} »</blockquote>
                <figcaption className="relative mt-6 flex items-center gap-3 border-t border-[#edf1ed] pt-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-sm font-black text-emerald-900">{item.initials}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-extrabold text-[#243a2c]">{item.name}</span>
                    <span className="mt-1 block truncate text-xs font-medium text-[#859188]">{item.business} · {item.city}</span>
                  </span>
                  <BadgeCheck className="ml-auto h-5 w-5 shrink-0 text-emerald-700" aria-label="Profil présenté" />
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="pb-16 sm:pb-20 lg:pb-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#0d2115] px-5 py-12 text-center text-white shadow-[0_35px_90px_-45px_rgba(10,54,27,0.6)] sm:rounded-[2.5rem] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
              <div className="mboa-blob absolute -left-24 -top-28 h-72 w-72 rounded-full bg-emerald-600/35 blur-[85px]" />
              <div className="mboa-blob mboa-blob-delay absolute -bottom-36 -right-16 h-80 w-80 rounded-full bg-lime-400/20 blur-[95px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:26px_26px]" />
            </div>

            <div className="relative mx-auto max-w-3xl">
              <Eyebrow icon={Rocket} dark>Le prochain pas t'appartient</Eyebrow>
              <h2 className="mt-6 text-3xl font-black leading-[1.04] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Tes produits méritent <span className="text-emerald-300">leur place en ligne.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
                Crée ta vitrine, partage-la avec tes clients et fais connaître ton activité au-delà de ton quartier.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <PrimaryLink to="/register" light className="w-full sm:w-auto">
                  <Rocket className="h-4 w-4" /> Créer ma boutique gratuitement <ArrowRight className="h-4 w-4" />
                </PrimaryLink>
                <Link to="/shops" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20">
                  Voir les boutiques <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-white/50">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Pas besoin de coder</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Conçu pour mobile</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> 0% de commission</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<ProductWithShop[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fetchShops = useCallback(async () => {
    setLoadingShops(true);
    try {
      const response = await publicApi.listShops({ page: 1 });
      setShops((response.results || []).slice(0, 10));
    } catch {
      setShops([]);
    } finally {
      setLoadingShops(false);
    }
  }, []);

  const fetchProducts = useCallback(async (shopList: Shop[]) => {
    if (shopList.length === 0) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }

    setLoadingProducts(true);
    try {
      const results = await Promise.all(
        shopList.slice(0, 10).map(async (shop) => {
          try {
            const response = await publicApi.listProducts(shop.username, { page: 1 });
            return (response.results || []).slice(0, 2).map((product: Product) => ({ product, shop }));
          } catch {
            return [] as ProductWithShop[];
          }
        }),
      );
      setProducts(results.flat().slice(0, 20));
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    void fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    if (!loadingShops) void fetchProducts(shops);
  }, [loadingShops, shops, fetchProducts]);

  const featuredShops = useMemo(() => shops.slice(0, 10), [shops]);
  const featuredProducts = useMemo(() => products.slice(0, 20), [products]);

  return (
    <main className="mboa-home overflow-x-clip bg-[#fbfcfa] text-[#14251b]">
      <style>{`
        .mboa-home { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
        .mboa-reveal { opacity: 0; transform: translate3d(0, 22px, 0); transition: opacity .72s cubic-bezier(.2,.75,.25,1) var(--reveal-delay, 0ms), transform .72s cubic-bezier(.2,.75,.25,1) var(--reveal-delay, 0ms); }
        .mboa-reveal.is-visible { opacity: 1; transform: translate3d(0,0,0); }
        .mboa-float { animation: mboa-float 7s ease-in-out infinite; }
        .mboa-float-delayed { animation: mboa-float 7.5s ease-in-out -2.5s infinite; }
        .mboa-orbit { animation: mboa-orbit 32s linear infinite; }
        .mboa-orbit-reverse { animation-direction: reverse; animation-duration: 42s; }
        .mboa-blob { animation: mboa-breathe 10s ease-in-out infinite alternate; }
        .mboa-blob-delay { animation-delay: -4s; animation-duration: 13s; }
        .mboa-button-sheen { position:absolute; inset:0; pointer-events:none; transform:translateX(-140%) skewX(-18deg); background:linear-gradient(100deg,transparent 20%,rgba(255,255,255,.23) 50%,transparent 80%); transition:transform .8s cubic-bezier(.2,.75,.25,1); }
        .mboa-primary:hover .mboa-button-sheen { transform:translateX(140%) skewX(-18deg); }
        .mboa-skeleton { position:relative; overflow:hidden; background:#edf2ee; }
        .mboa-skeleton::after { content:""; position:absolute; inset:0; transform:translateX(-100%); background:linear-gradient(90deg,transparent,rgba(255,255,255,.85),transparent); animation:mboa-shimmer 1.7s infinite; }
        @keyframes mboa-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes mboa-orbit { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes mboa-breathe { from { transform:translate3d(0,0,0) scale(1); } to { transform:translate3d(18px,-14px,0) scale(1.08); } }
        @keyframes mboa-shimmer { 100% { transform:translateX(100%); } }
        @media (prefers-reduced-motion: reduce) {
          .mboa-home *, .mboa-home *::before, .mboa-home *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; transition-duration:.01ms !important; }
          .mboa-reveal { opacity:1; transform:none; }
        }
      `}</style>

      <HeroSection />
      <TrustStrip />

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Boutiques à découvrir"
              icon={Store}
              title={<>Des commerçants qui font <span className="text-emerald-700">bouger le marché.</span></>}
              description="Explore les vitrines, découvre les univers des vendeurs et trouve facilement les boutiques qui t'intéressent."
              action={<OutlineLink to="/shops">Toutes les boutiques</OutlineLink>}
            />
          </Reveal>

          {loadingShops ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => <ShopCardSkeleton key={index} />)}
            </div>
          ) : featuredShops.length === 0 ? (
            <EmptyState
              icon={Store}
              title="La première boutique peut être la tienne."
              description="Il n'y a pas encore de boutique à afficher ici. Lance ta vitrine et commence à présenter tes produits."
              to="/register"
              action="Créer ma boutique"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {featuredShops.map((shop, index) => <ShopCard key={shop.username} shop={shop} index={index} />)}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-[#e7eee8] bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="À découvrir maintenant"
              icon={ShoppingBag}
              title={<>Des produits à découvrir, <span className="text-emerald-700">des vendeurs à contacter.</span></>}
              description="Parcours une sélection d'articles publiés par les boutiques. Une question ou envie de commander ? Le contact reste direct."
              action={<OutlineLink to="/shops">Explorer le catalogue</OutlineLink>}
            />
          </Reveal>

          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => <ProductCardSkeleton key={index} />)}
            </div>
          ) : featuredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Les prochains coups de cœur arrivent bientôt."
              description="Aucun produit n'est disponible à afficher pour le moment. Parcours les boutiques pour découvrir les vendeurs."
              to="/shops"
              action="Voir les boutiques"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {featuredProducts.map((item, index) => <ProductCard key={`${item.shop.username}-${item.product.id}`} item={item} index={index} />)}
            </div>
          )}
        </div>
      </section>

      <FeatureSection />
      <HowItWorks />
      <StatsSection />
      <Testimonials />
      <FinalCTA />
    </main>
  );
}
