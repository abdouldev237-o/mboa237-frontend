// src/pages/LoginPage.tsx
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from '@/components/Field'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
} from "lucide-react";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { Spinner } from "@/components/Spinner";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
      if (remember) {
        localStorage.setItem("mboa_last_user", username.trim());
      } else {
        localStorage.removeItem("mboa_last_user");
      }
      toast.success("Bienvenue !");
      navigate("/dashboard");
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      setShake((s) => s + 1);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-[calc(100vh-64px)] items-center overflow-hidden bg-[#f7faf8] px-4 py-10 sm:px-6 lg:px-8">
      {/* Décor de fond */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(22,101,52,0.06)_1px,transparent_0)] [background-size:23px_23px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent_80%)]" />
        <div className="animate-float-slow absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="animate-float-slow absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-lime-200/40 blur-3xl [animation-delay:2s]" />
      </div>

      <div
        key={shake}
        className="login-enter relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white bg-white shadow-2xl shadow-emerald-950/[0.08] lg:grid-cols-[1fr_.92fr]"
        style={{ animation: shake ? "login-shake .4s ease" : undefined }}
      >
        {/* ============================================================
            PANNEAU GAUCHE — Branding
            ============================================================ */}
        <aside className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#052e25] via-[#065f46] to-[#10a36b] p-10 text-white lg:flex xl:p-12">
          <div className="pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-12 top-28 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-12 left-10 h-44 w-44 rounded-full bg-emerald-300/10 blur-2xl" />

          <Link to="/" className="relative inline-flex w-fit items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-800 shadow-lg">
              <Store size={25} />
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight">Mboa237</span>
              <span className="block text-xs text-emerald-100">Le commerce local, autrement</span>
            </span>
          </Link>

          <div className="relative my-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
              <Sparkles size={14} /> Ton activité mérite de grandir
            </span>
            <h1 className="mt-6 max-w-md text-4xl font-black leading-[1.12] tracking-[-.04em] xl:text-5xl">
              Ta boutique. Tes produits.{" "}
              <span className="text-emerald-200">Tes ambitions.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-emerald-50/80">
              Retrouve ton espace et continue à faire découvrir tes produits aux clients.
            </p>
            <div className="mt-8 space-y-3">
              {[
                "Gère tes produits en quelques clics",
                "Présente ta boutique en ligne",
                "Facilite les commandes sur WhatsApp",
              ].map((t) => (
                <div key={t} className="flex items-center gap-3 text-sm font-medium text-white/90">
                  <CheckCircle2 size={17} className="text-emerald-200" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Témoignage ajouté */}
          <figure className="relative rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
            <p className="text-[13px] leading-relaxed text-white/85">
              « J'ai mis ma boutique en ligne en moins de deux minutes. Les commandes tombent direct
              sur WhatsApp. »
            </p>
            <figcaption className="mt-3 flex items-center gap-3 text-[11.5px]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-[10.5px] font-bold">
                MK
              </span>
              <span>
                <span className="font-semibold text-white">Marie K.</span>
                <span className="text-white/45"> — Douala</span>
              </span>
            </figcaption>
          </figure>
        </aside>

        {/* ============================================================
            FORMULAIRE
            ============================================================ */}
        <section className="relative px-5 py-8 sm:px-10 sm:py-12 lg:px-12 xl:px-14">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 font-black text-emerald-800 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <Store size={20} />
            </span>
            Mboa237
          </Link>

          <div className="mb-8">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <LockKeyhole size={23} />
            </span>
            <p className="text-sm font-bold uppercase tracking-[.17em] text-emerald-700">
              Heureux de te revoir
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-slate-950 sm:text-4xl">
              Bon retour !
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Connecte-toi pour retrouver et gérer ta boutique.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="anim-pop-in mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium leading-6 text-rose-700"
            >
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <Field
              label="Nom d'utilisateur"
              value={username}
              onChange={setUsername}
              placeholder="jeankamga"
              autoComplete="username"
              icon={<UserRound size={18} />}
            />
            <Field
              label="Mot de passe"
              type={show ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="Ton mot de passe"
              autoComplete="current-password"
              icon={<LockKeyhole size={18} />}
              rightSlot={
                <button
                  type="button"
                  aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  onClick={() => setShow((s) => !s)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="group inline-flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600">
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-all duration-200 checked:border-emerald-700 checked:bg-emerald-700"
                  />
                  <CheckCircle2
                    size={14}
                    className="pointer-events-none absolute text-white opacity-0 transition-opacity peer-checked:opacity-100"
                  />
                </span>
                Se souvenir de moi
              </label>
              <button
                type="button"
                className="text-sm font-bold text-emerald-700 underline-offset-4 hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex min-h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-emerald-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-700/20 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[420%]" />
              {loading ? (
                <>
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                  Connexion…
                </>
              ) : (
                <>
                  <span className="relative">Se connecter</span>
                  <ArrowRight size={17} className="relative transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Nouveau sur Mboa237 ?{" "}
            <Link
              to="/register"
              className="font-extrabold text-emerald-700 decoration-2 underline-offset-4 hover:underline"
            >
              Crée ta boutique
            </Link>
          </p>

          <div className="mt-8 flex items-start gap-2 rounded-2xl bg-slate-50 p-3.5 text-xs leading-5 text-slate-500">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-700" />
            Tes identifiants restent personnels. Ne les partage avec personne.
          </div>
        </section>
      </div>

      <style>{`
        @keyframes login-enter {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes login-shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
        @keyframes pop-in {
          0%   { opacity: 0; transform: scale(0.94); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50%      { transform: translate3d(10px,-12px,0) scale(1.06); }
        }
        .login-enter { animation: login-enter 0.65s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        .anim-pop-in { animation: pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .login-enter, .anim-pop-in, .animate-float-slow { animation: none !important; }
        }
      `}</style>
    </main>
  );
}

