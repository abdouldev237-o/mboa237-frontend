// src/components/ProductCard.tsx
import { publicApi } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Plus } from "lucide-react";

interface Props {
  product: Product;
  shopUsername: string;
  shopWhatsapp: string;
  shopName: string;
}

export function ProductCard({ product, shopUsername, shopWhatsapp, shopName }: Props) {
  const order = async () => {
    void publicApi.trackWhatsappClick(shopUsername, product.id);
    const msg =
      `Bonjour ${shopName} 👋\n\n` +
      `Je souhaite commander :\n\n` +
      `• ${product.name}\n  ${fmtFcfa(product.price)}\n\n` +
      `Merci de me confirmer la disponibilité.`;
    window.open(
      `https://wa.me/${shopWhatsapp}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  const cover = product.image
    ? product.image
    : product.images[0] ?? null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-all duration-500 hover:-translate-y-1 hover:border-black/15 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.25)]">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 via-zinc-50 to-stone-100">
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
            <svg className="h-20 w-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
              <rect x="4" y="4" width="16" height="16" rx="3" />
              <circle cx="9" cy="9" r="1.5" />
              <path d="m4 16 4-4a2 2 0 0 1 2.8 0L16 16" />
            </svg>
          </div>
        )}

        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider shadow ${
              product.badge === "PROMO"
                ? "bg-rose-500 text-white"
                : product.badge === "NEW"
                ? "bg-sky-500 text-white"
                : "bg-orange-500 text-white"
            }`}
          >
            {product.badge_label}
          </span>
        )}

        <button 
        className="absolute hidden group-hover:flex rounded-full py-2 right-3 bottom-3 bg-white/20 border-white/80 cursor-pointer text-white rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider shadow">
            <Plus size={20} />
        </button>

        {product.discount_percent > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            -{product.discount_percent}%
          </span>
        )}

        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-3 py-1.5 text-[12.5px] font-semibold">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.category_name && (
          <span className="inline-flex w-fit rounded-full bg-black/[0.05] px-2 py-0.5 text-[10.5px] font-medium text-black/55">
            {product.category_name}
          </span>
        )}

        <h3 className="mt-2 line-clamp-2 text-[14.5px] font-bold leading-snug tracking-[-0.01em]">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-black/50">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[17px] font-bold tracking-[-0.01em] text-black tabular-nums">
              {fmtFcfa(product.price)}
            </span>
            {product.was_price && (
              <span className="text-[12px] text-black/35 line-through tabular-nums">
                {fmtFcfa(product.was_price)}
              </span>
            )}
          </div>

          <button
            onClick={order}
            disabled={!product.in_stock}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-2.5 text-[12.5px] font-semibold text-white transition-all duration-300 hover:bg-[#16a34a] hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-black"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.06c-.24.68-1.42 1.3-1.96 1.35-.5.05-1.14.07-1.83-.12-.42-.13-.97-.31-1.67-.62-2.94-1.27-4.86-4.23-5-4.43-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.59.83 2.03.9 2.18.07.15.12.32.02.51-.1.2-.15.32-.29.49-.15.17-.31.39-.44.52-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.17-.2.74-.86.94-1.16.2-.3.39-.25.66-.15.27.1 1.71.81 2.01.96.3.15.49.22.56.35.07.13.07.76-.17 1.44Z" />
            </svg>
            Commander WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
}

export function fmtFcfa(n: number) {
  return n.toLocaleString("fr-FR").replace(/\u202f/g, " ").replace(/\u00a0/g, " ") + " F";
}