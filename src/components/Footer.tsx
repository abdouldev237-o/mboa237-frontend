// src/components/Footer.tsx
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-black/[0.06] bg-white">
      <div className="container-app grid gap-8 py-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#16a34a] to-emerald-700 text-[12.5px] font-bold text-white">
              M2
            </span>
            <span className="text-[15px] font-bold tracking-tight">Mboa237</span>
          </div>
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-black/55">
            La plateforme camerounaise pour créer ta boutique en ligne en 30
            secondes. Commandes WhatsApp, paiement Mobile Money.
          </p>
        </div>
        {[
          { title: "Produit", links: [["Fonctionnalités", "/"], ["Boutiques", "/shops"], ["Tarifs", "/"]] },
          { title: "Aide", links: [["Contact", "/"], ["FAQ", "/"], ["Guide", "/"]] },
          { title: "Légal", links: [["Conditions", "/"], ["Confidentialité", "/"], ["Cookies", "/"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-black/40">
              {col.title}
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-[13.5px] text-black/60 transition hover:text-black"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-black/[0.06]">
        <div className="container-app flex flex-col items-center justify-between gap-3 py-6 text-[12.5px] text-black/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Mboa237. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            Fait avec <span className="text-rose-500">♥</span> au Cameroun
            <span>🇨🇲</span>
          </p>
        </div>
      </div>
    </footer>
  );
}