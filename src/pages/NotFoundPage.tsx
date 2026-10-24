// src/pages/NotFoundPage.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Ghost,
  Home,
  MapPinOff,
  PackageSearch,
  Search,
  Sparkles,
  Store,
} from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  /* Suggestions cliquables */
  const suggestions = [
    {
      to: "/",
      icon: Home,
      title: "Accueil",
      desc: "Retour à la page principale",
    },
    {
      to: "/shops",
      icon: Store,
      title: "Boutiques",
      desc: "Découvrir les vendeurs Mboa237",
    },
    {
      to: "/register",
      icon: Sparkles,
      title: "Créer ma boutique",
      desc: "Lancer ton business en 30 secondes",
    },
  ];

  return (
    <main className="relative isolate flex min-h-[85vh] items-center overflow-hidden bg-[#fbfcfa] px-4 py-12 sm:px-6 lg:px-8">
      {/* ---------- Décor de fond ---------- */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(22,101,52,0.075)_1px,transparent_0)] [background-size:23px_23px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent_80%)]" />
        <div className="animate-float-slow absolute -left-32 top-20 h-[26rem] w-[26rem] rounded-full bg-emerald-200/40 blur-[110px]" />
        <div className="animate-float-slow absolute -right-32 bottom-0 h-[24rem] w-[24rem] rounded-full bg-lime-100/60 blur-[105px] [animation-delay:2s]" />
      </div>

      <div className="mx-auto w-full max-w-3xl">
        {/* ---------- Carte principale ---------- */}
        <div className="anim-404-in relative overflow-hidden rounded-[2.25rem] border border-[#e5ece6] bg-white/80 p-6 shadow-[0_35px_90px_-45px_rgba(17,72,39,0.35)] backdrop-blur-xl sm:p-10 lg:p-14">
          {/* Halos internes */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-lime-100/60 blur-3xl" />

          {/* ---------- Numéro 404 avec effets ---------- */}
          <div className="relative flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.16em] text-emerald-800">
              <MapPinOff className="h-3.5 w-3.5" />
              Page introuvable
            </span>

            {/* Le 404 en très gros, avec dégradé animé */}
            <div className="anim-404-glitch relative mt-6 select-none">
              <span className="block text-[96px] font-black leading-none tracking-[-0.06em] text-transparent [background:linear-gradient(110deg,#064e3b_20%,#16a34a_45%,#65c887_55%,#064e3b_80%)] [background-clip:text] [-webkit-background-clip:text] [background-size:200%_auto] [animation:shine_6s_linear_infinite] sm:text-[128px]">
                404
              </span>
              {/* Ombre flottante */}
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 translate-y-3 text-[96px] font-black leading-none tracking-[-0.06em] text-emerald-900/10 sm:text-[128px]"
              >
                404
              </span>
            </div>

            {/* Icône fantôme flottante */}
            <div className="anim-404-float -mt-6 mb-1 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-emerald-700 shadow-lg shadow-emerald-950/[0.06]">
              <Ghost className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-2xl font-black tracking-[-0.035em] text-[#14251b] sm:text-3xl">
              Cette page s'est égarée.
            </h1>
            <p className="mt-3 max-w-md text-[14.5px] leading-6 text-[#637168]">
              Le lien est peut-être cassé, ou la page a été déplacée. Pas de
              panique — on te ramène en un clic.
            </p>

            {/* URL demandée */}
            {location.pathname !== "/" && (
              <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-xl border border-black/[0.06] bg-black/[0.02] px-3 py-2 text-[12px]">
                <Search className="h-3.5 w-3.5 shrink-0 text-black/40" />
                <span className="truncate font-mono text-black/55">
                  {location.pathname}
                </span>
              </div>
            )}

            {/* ---------- Actions ---------- */}
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/"
                className="group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#123522] px-6 py-3.5 text-[14px] font-bold text-white shadow-xl shadow-emerald-950/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1a4b30] hover:shadow-2xl active:scale-[0.98]"
              >
                <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[420%]" />
                <ArrowLeft className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                <span className="relative">Retour à l'accueil</span>
              </Link>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dce5de] bg-white px-6 py-3.5 text-[14px] font-bold text-[#24382b] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                Page précédente
              </button>
            </div>
          </div>

          {/* ---------- Divider ---------- */}
          <div className="my-9 flex items-center gap-3">
            <span className="h-px flex-1 bg-black/[0.07]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/35">
              Ou explore
            </span>
            <span className="h-px flex-1 bg-black/[0.07]" />
          </div>

          {/* ---------- Suggestions ---------- */}
          <div className="grid gap-3 sm:grid-cols-3">
            {suggestions.map(({ to, icon: Icon, title, desc }, i) => (
              <Link
                key={to}
                to={to}
                style={{
                  animation: `card-in 0.55s cubic-bezier(0.16,1,0.3,1) ${
                    0.1 + i * 0.08
                  }s both`,
                }}
                className="group relative overflow-hidden rounded-2xl border border-[#e8eee9] bg-white p-4 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_45px_-25px_rgba(20,83,45,0.28)]"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-100/60 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 transition-all duration-500 group-hover:rotate-[-6deg] group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="relative mt-3 flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-extrabold text-[#1b3525]">
                    {title}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-black/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                </div>
                <p className="relative mt-1 text-[11.5px] leading-5 text-black/50">
                  {desc}
                </p>
              </Link>
            ))}
          </div>

          {/* ---------- Footer technique ---------- */}
          <div className="mt-8 flex flex-col items-center gap-2 text-center text-[11.5px] text-black/40 sm:flex-row sm:justify-center sm:gap-4">
            <span className="inline-flex items-center gap-1.5">
              <PackageSearch className="h-3.5 w-3.5 text-emerald-700" />
              Erreur 404 — ressource non trouvée
            </span>
            <span className="hidden h-3 w-px bg-black/10 sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-emerald-700" />
              Mboa237 — Le commerce camerounais, simplement
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Animations ---------- */}
      <style>{`
        @keyframes shine {
          to { background-position: 200% center; }
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50%      { transform: translate3d(8px,-10px,0) scale(1.05); }
        }
        @keyframes ghost-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-6px) rotate(-3deg); }
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0, 0); }
          20%      { transform: translate(-1px, 1px); }
          40%      { transform: translate(1px, -1px); }
          60%      { transform: translate(-1px, 0); }
          80%      { transform: translate(1px, 1px); }
        }
        .anim-404-in {
          animation: card-in 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .anim-404-float { animation: ghost-float 3.6s ease-in-out infinite; }
        .anim-404-glitch:hover { animation: glitch 0.35s ease-in-out 2; }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}