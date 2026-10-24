// src/pages/RegisterPage.tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Link2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Percent,
  Phone,
  Rocket,
  Shield,
  Sparkles,
  Store,
  Trash2,
  Truck,
  User,
  Wallet,
  X,
} from "lucide-react";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";

/* =========================================================
   HELPERS
   ========================================================= */
function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

function formatPhoneInput(v: string) {
  // Garde uniquement les chiffres + espaces, max 17 char
  return v.replace(/[^\d\s]/g, "").slice(0, 17);
}

/* =========================================================
   TYPES
   ========================================================= */
type FormState = {
  username: string;
  email: string;
  password: string;
  confirm: string;
  shop_name: string;
  shop_username: string;
  city: string;
  whatsapp_number: string;
  tagline: string;
  delivery_info: string;
  free_delivery_from: string; // texte pour l'input
  logo: File | null;
  banner: File | null;
};

const INITIAL: FormState = {
  username: "",
  email: "",
  password: "",
  confirm: "",
  shop_name: "",
  shop_username: "",
  city: "Douala",
  whatsapp_number: "",
  tagline: "",
  delivery_info: "",
  free_delivery_from: "",
  logo: null,
  banner: null,
};

/* =========================================================
   MAIN
   ========================================================= */
export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  /* --- URL preview --- */
  const shopSlug = useMemo(() => {
    const raw = form.shop_username || form.username || form.shop_name;
    return slugify(raw) || "ton-nom";
  }, [form.shop_username, form.username, form.shop_name]);

  /* --- Progression --- */
  const progress = useMemo(() => {
    const checks = [
      form.username.trim().length >= 3,
      form.password.length >= 8,
      form.password === form.confirm && form.confirm.length > 0,
      form.shop_name.trim().length >= 2,
      form.whatsapp_number.replace(/\D/g, "").length >= 9,
      form.city.trim().length >= 2,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [form]);

  /* --- Submit --- */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.username.trim().length < 3) {
      setError("Nom d'utilisateur : 3 caractères minimum.");
      return;
    }
    if (form.password.length < 8) {
      setError("Mot de passe : 8 caractères minimum.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.shop_name.trim().length < 2) {
      setError("Nom de boutique requis.");
      return;
    }
    if (form.whatsapp_number.replace(/\D/g, "").length < 9) {
      setError("Numéro WhatsApp invalide (ex: 237 6XX XXX XXX).");
      return;
    }

    setLoading(true);
    try {
      const freeFrom = form.free_delivery_from.trim()
        ? Number(form.free_delivery_from.replace(/\s/g, ""))
        : null;

      await register({
        username: form.username.trim(),
        password: form.password,
        email: form.email.trim() || undefined,
        shop_name: form.shop_name.trim(),
        shop_username: form.shop_username.trim() || undefined,
        whatsapp_number: form.whatsapp_number.replace(/\s+/g, ""),
        city: form.city.trim() || "Douala",
        tagline: form.tagline.trim() || undefined,
        delivery_info: form.delivery_info.trim() || undefined,
        free_delivery_from: freeFrom,
        logo: form.logo,
        banner: form.banner,
      });
      toast.success("Boutique créée 🎉");
      navigate("/dashboard");
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RENDER
     ========================================================= */
  return (
    <main className="relative overflow-hidden py-10 lg:py-14">
      {/* Décor de fond */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-100/50 blur-[130px]" />
        <div className="absolute -bottom-40 -left-24 h-[320px] w-[320px] rounded-full bg-teal-100/40 blur-[110px]" />
      </div>

      <div className="container-app">
        {/* -------- En-tête -------- */}
        <header className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#16a34a]/20 bg-[#16a34a]/[0.06] px-3.5 py-1.5 text-[12px] font-semibold text-[#15803d]">
            <Rocket className="h-3 w-3" />
            Lancement en 30 secondes
          </span>
          <h1 className="mt-5 text-[32px] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[42px]">
            Crée ta boutique.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-black/55">
            30 secondes pour lancer ton business en ligne — sans carte
            bancaire, sans commission, sans code.
          </p>
        </header>

        {error && (
          <div className="anim-pop mx-auto mt-8 flex max-w-3xl items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[13.5px] font-medium text-rose-700">
            <X className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.6} />
            <span>{error}</span>
          </div>
        )}

        {/* -------- Grid : form + preview -------- */}
        <div className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-[1fr_400px] lg:gap-10">
          {/* ============================================================
              FORMULAIRE
              ============================================================ */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Progress bar */}
            <ProgressBar value={progress} />

            {/* ---------- SECTION 1 : Ton compte ---------- */}
            <Section
              step={1}
              title="Ton compte"
              subtitle="Pour te connecter et gérer ta boutique."
              icon={<User className="h-4 w-4" />}
            >
              <Field
                icon={<User className="h-4 w-4" />}
                label="Nom d'utilisateur"
                value={form.username}
                onChange={(v) => set("username", v.replace(/\s/g, ""))}
                placeholder="jeankamga"
                autoComplete="username"
                required
              />

              <Field
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => set("email", v)}
                placeholder="toi@exemple.cm"
                autoComplete="email"
                optional
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  icon={<Lock className="h-4 w-4" />}
                  label="Mot de passe"
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={(v) => set("password", v)}
                  placeholder="8 caractères minimum"
                  autoComplete="new-password"
                  required
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? "Masquer" : "Voir"}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-black/40 transition hover:bg-black/5 hover:text-black"
                    >
                      {show ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />
                <Field
                  icon={<Lock className="h-4 w-4" />}
                  label="Confirmation"
                  type={show ? "text" : "password"}
                  value={form.confirm}
                  onChange={(v) => set("confirm", v)}
                  placeholder="Retape ton mot de passe"
                  autoComplete="new-password"
                  required
                  rightSlot={
                    form.confirm.length > 0 &&
                    form.confirm === form.password ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#16a34a] text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    ) : undefined
                  }
                />
              </div>

              {/* Jauge de force */}
              {form.password.length > 0 && (
                <PasswordStrength password={form.password} />
              )}
            </Section>

            {/* ---------- SECTION 2 : Ta boutique ---------- */}
            <Section
              step={2}
              title="Ta boutique"
              subtitle="C'est ce que tes clients verront."
              icon={<Store className="h-4 w-4" />}
            >
              <Field
                icon={<Store className="h-4 w-4" />}
                label="Nom de la boutique"
                value={form.shop_name}
                onChange={(v) => set("shop_name", v)}
                placeholder="SAWA House"
                required
              />

              <Field
                icon={<Link2 className="h-4 w-4" />}
                label="Identifiant d'URL"
                value={form.shop_username}
                onChange={(v) => set("shop_username", slugify(v))}
                placeholder="sawa-house"
                hint="minuscules, chiffres, tirets"
                optional
              />

              {/* Aperçu URL */}
              <div className="flex items-center gap-2 rounded-2xl border border-[#16a34a]/20 bg-[#16a34a]/[0.04] p-3">
                <Link2 className="h-4 w-4 shrink-0 text-[#16a34a]" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15803d]">
                    Ton lien public
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[13px] font-semibold text-[#16a34a]">
                    mboa237.com/p/{shopSlug}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `https://mboa237.com/p/${shopSlug}`
                    );
                  }}
                  className="shrink-0 rounded-lg border border-[#16a34a]/20 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-[#15803d] transition hover:bg-[#16a34a] hover:text-white"
                >
                  Copier
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  icon={<MapPin className="h-4 w-4" />}
                  label="Ville"
                  value={form.city}
                  onChange={(v) => set("city", v)}
                  placeholder="Douala"
                  required
                />
                <Field
                  icon={<Phone className="h-4 w-4" />}
                  label="WhatsApp"
                  type="tel"
                  value={form.whatsapp_number}
                  onChange={(v) => set("whatsapp_number", formatPhoneInput(v))}
                  placeholder="237 6XX XXX XXX"
                  autoComplete="tel"
                  required
                />
              </div>

              <Field
                icon={<Sparkles className="h-4 w-4" />}
                label="Slogan"
                value={form.tagline}
                onChange={(v) => set("tagline", v)}
                placeholder="Électroménager & maison à Douala"
                hint="1 phrase courte"
                optional
              />
            </Section>

            {/* ---------- SECTION 3 : Livraison ---------- */}
            <Section
              step={3}
              title="Livraison"
              subtitle="Comment et où tu livres tes clients."
              icon={<Truck className="h-4 w-4" />}
            >
              <Field
                icon={<Truck className="h-4 w-4" />}
                label="Info livraison"
                value={form.delivery_info}
                onChange={(v) => set("delivery_info", v)}
                placeholder="Livraison partout à Douala en 24h"
                hint="max 200 caractères"
                optional
              />

              <Field
                icon={<Wallet className="h-4 w-4" />}
                label="Livraison gratuite à partir de"
                type="text"
                value={form.free_delivery_from}
                onChange={(v) =>
                  set("free_delivery_from", v.replace(/[^\d]/g, "").slice(0, 8))
                }
                placeholder="100000"
                hint="en FCFA (optionnel)"
                optional
                rightSlot={
                  form.free_delivery_from ? (
                    <span className="text-[12px] font-semibold text-black/45">
                      F
                    </span>
                  ) : undefined
                }
              />
            </Section>

            {/* ---------- SECTION 4 : Visuels ---------- */}
            <Section
              step={4}
              title="Visuels"
              subtitle="Logo et bannière rendent ta boutique reconnaissable."
              icon={<ImagePlus className="h-4 w-4" />}
              badge="Optionnel"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FileUpload
                  label="Logo"
                  hint="Carré, 400×400 px conseillé"
                  value={form.logo}
                  onChange={(f) => set("logo", f)}
                  aspect="square"
                />
                <FileUpload
                  label="Bannière"
                  hint="Large, 1600×400 px conseillé"
                  value={form.banner}
                  onChange={(f) => set("banner", f)}
                  aspect="wide"
                />
              </div>
            </Section>

            {/* ---------- Submit ---------- */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading || progress < 80}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-black py-4 text-[15px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/85 hover:shadow-xl hover:shadow-black/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[420%]" />
                {loading ? (
                  <>
                    <Loader2 className="relative h-4 w-4 animate-spin" />
                    <span className="relative">Création de ta boutique…</span>
                  </>
                ) : (
                  <>
                    <span className="relative">Créer ma boutique</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {progress < 80 && (
                <p className="text-center text-[12.5px] text-black/45">
                  Complète {100 - progress}% pour activer le bouton
                </p>
              )}

              <p className="text-center text-[13px] text-black/50">
                Déjà un compte ?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#16a34a] hover:underline"
                >
                  Connecte-toi
                </Link>
              </p>
            </div>
          </form>

          {/* ============================================================
              PREVIEW STICKY (desktop)
              ============================================================ */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <ShopPreview form={form} shopSlug={shopSlug} />

              {/* Bénéfices */}
              <div className="rounded-3xl border border-black/[0.06] bg-white/70 p-5">
                <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-black/40">
                  <Shield className="h-3.5 w-3.5" />
                  Inclus gratuitement
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {[
                    { icon: Percent, text: "0% de commission sur tes ventes" },
                    { icon: Truck, text: "Commandes WhatsApp directes" },
                    { icon: Wallet, text: "Paiement Mobile Money" },
                    { icon: BadgeCheck, text: "Badge vendeur vérifié" },
                  ].map((b, i) => {
                    const Icon = b.icon;
                    return (
                      <li
                        key={b.text}
                        className="flex items-center gap-2.5 text-[13px] text-black/65"
                        style={{
                          animation: `fade-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
                        }}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#16a34a]/10 text-[#16a34a]">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {b.text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Animations locales */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          0%   { opacity: 0; transform: scale(0.94); }
          100% { opacity: 1; transform: scale(1); }
        }
        .anim-pop { animation: pop 0.4s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>
    </main>
  );
}

/* =========================================================
   PROGRESS BAR
   ========================================================= */
function ProgressBar({ value }: { value: number }) {
  const color =
    value < 40 ? "from-rose-400 to-rose-500" :
    value < 80 ? "from-amber-400 to-amber-500" :
    "from-[#16a34a] to-emerald-400";
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-black/60">
          Complète ton inscription
        </span>
        <span className={`text-[13px] font-bold ${
          value === 100 ? "text-[#16a34a]" : "text-black/60"
        }`}>
          {value}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {value === 100 && (
        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#16a34a]">
          <Check className="h-3 w-3" strokeWidth={3} />
          Tout est prêt, tu peux créer ta boutique
        </p>
      )}
    </div>
  );
}

/* =========================================================
   SECTION
   ========================================================= */
function Section({
  step,
  title,
  subtitle,
  icon,
  children,
  badge,
}: {
  step: number;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
  badge?: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white/70 backdrop-blur-sm">
      <div className="flex items-start gap-3 border-b border-black/[0.05] bg-white/50 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#16a34a] to-emerald-700 text-[12px] font-bold text-white shadow-md shadow-emerald-600/25">
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold tracking-[-0.01em]">{title}</h2>
            {badge && (
              <span className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-[10.5px] font-semibold text-black/50">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-[12.5px] text-black/50">{subtitle}</p>
          )}
        </div>
        <span className="hidden shrink-0 text-black/25 sm:block">{icon}</span>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

/* =========================================================
   FIELD (input stylé avec icône)
   ========================================================= */
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  icon,
  hint,
  rightSlot,
  required = false,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  icon?: ReactNode;
  hint?: string;
  rightSlot?: ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="group block">
      <span className="mb-1.5 flex items-center justify-between text-[12.5px] font-semibold text-black/70">
        <span className="flex items-center gap-1">
          {label}
          {optional && (
            <span className="font-normal text-black/35">(optionnel)</span>
          )}
          {required && <span className="text-rose-500">*</span>}
        </span>
        {hint && (
          <span className="font-normal text-black/35">{hint}</span>
        )}
      </span>

      <span className="relative flex items-center rounded-xl border border-black/[0.09] bg-white transition-all duration-300 focus-within:border-[#16a34a]/60 focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.08)]">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35 transition-colors group-focus-within:text-[#16a34a]">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full bg-transparent py-3 pr-14 text-[14px] outline-none placeholder:text-black/30 ${
            icon ? "pl-10" : "pl-4"
          }`}
        />
        {rightSlot && (
          <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
            {rightSlot}
          </span>
        )}
      </span>
    </label>
  );
}

/* =========================================================
   PASSWORD STRENGTH
   ========================================================= */
function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  }, [password]);

  const label =
    score <= 1 ? "Faible" : score === 2 ? "Moyen" : score === 3 ? "Bon" : "Excellent";
  const color =
    score <= 1 ? "bg-rose-500" :
    score === 2 ? "bg-amber-500" :
    score === 3 ? "bg-emerald-500" :
    "bg-[#16a34a]";

  return (
    <div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= score ? color : "bg-black/10"
            }`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
        <span className="text-black/45">Force du mot de passe</span>
        <span
          className={`font-semibold ${
            score <= 1 ? "text-rose-500" :
            score === 2 ? "text-amber-500" :
            "text-emerald-600"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   FILE UPLOAD
   ========================================================= */
function FileUpload({
  label,
  hint,
  value,
  onChange,
  aspect = "square",
}: {
  label: string;
  hint?: string;
  value: File | null;
  onChange: (f: File | null) => void;
  aspect?: "square" | "wide";
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Cleanup object URL */
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const pickFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5 MB max
    onChange(file);
  };

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) =>
    pickFile(e.target.files?.[0] ?? null);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  };

  const ratio = aspect === "wide" ? "aspect-[3/1]" : "aspect-square";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12.5px] font-semibold text-black/70">
        <span>{label}</span>
        <span className="font-normal text-black/35">(optionnel)</span>
      </div>

      {preview ? (
        <div
          className={`group relative overflow-hidden rounded-2xl border border-black/10 ${ratio}`}
        >
          <img
            src={preview}
            alt={label}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 backdrop-blur-sm transition group-hover:bg-black/40 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-[12.5px] font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Retirer
            </button>
          </div>
          <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur">
            {value?.name.slice(0, 24)}
          </span>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed px-4 text-center transition-all duration-300 ${ratio} ${
            dragging
              ? "border-[#16a34a] bg-[#16a34a]/5"
              : "border-black/15 bg-white/40 hover:border-[#16a34a]/40 hover:bg-[#16a34a]/[0.03]"
          }`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16a34a]/10 text-[#16a34a] transition-transform duration-300 group-hover:scale-110">
            <ImagePlus className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[12.5px] font-semibold text-black/75">
              Clique ou dépose
            </div>
            {hint && (
              <div className="mt-0.5 text-[11px] text-black/45">{hint}</div>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileInput}
        className="hidden"
      />
    </div>
  );
}

/* =========================================================
   SHOP PREVIEW
   ========================================================= */
function ShopPreview({
  form,
  shopSlug,
}: {
  form: FormState;
  shopSlug: string;
}) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!form.logo) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(form.logo);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.logo]);

  useEffect(() => {
    if (!form.banner) {
      setBannerPreview(null);
      return;
    }
    const url = URL.createObjectURL(form.banner);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.banner]);

  const initials = (form.shop_name || "M2").slice(0, 2).toUpperCase();

  return (
    <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_20px_50px_-25px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between border-b border-black/[0.05] bg-white/50 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-black/40">
          <Eye className="h-3 w-3" />
          Aperçu live
        </span>
        <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
      </div>

      {/* Bannière */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-[#16a34a] via-emerald-600 to-emerald-800">
        {bannerPreview && (
          <img
            src={bannerPreview}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] [background-size:16px_16px]" />
      </div>

      {/* Contenu */}
      <div className="relative -mt-8 px-4 pb-4">
        <div className="relative inline-block">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt=""
              className="h-16 w-16 rounded-2xl border-4 border-white bg-white object-cover shadow-md"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-[#16a34a] to-emerald-700 text-[18px] font-bold text-white shadow-md">
              {initials}
            </div>
          )}
        </div>

        <h3 className="mt-2.5 line-clamp-1 text-[14.5px] font-bold leading-tight">
          {form.shop_name || "Nom de ta boutique"}
        </h3>

        <div className="mt-1 flex items-center gap-2 text-[11.5px] text-black/50">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {form.city || "Douala"}
          </span>
          {form.whatsapp_number && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {form.whatsapp_number.replace(/\s/g, "").slice(0, 12)}
              </span>
            </>
          )}
        </div>

        {form.tagline && (
          <p className="mt-2 line-clamp-2 text-[12px] text-black/50">
            {form.tagline}
          </p>
        )}

        {form.delivery_info && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-sky-200/70 bg-sky-50/50 p-2.5">
            <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
            <p className="text-[11.5px] leading-snug text-sky-900/80">
              {form.delivery_info}
            </p>
          </div>
        )}

        {form.free_delivery_from && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#16a34a]/10 px-2.5 py-1 text-[10.5px] font-semibold text-[#16a34a]">
            <Wallet className="h-3 w-3" />
            Livraison gratuite dès{" "}
            {Number(form.free_delivery_from).toLocaleString("fr-FR")} F
          </div>
        )}

        <div className="mt-4 rounded-xl border border-black/[0.06] bg-black/[0.02] p-2.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-black/40">
            <Link2 className="h-3 w-3" />
            URL
          </div>
          <div className="mt-0.5 truncate font-mono text-[11.5px] font-medium text-[#16a34a]">
            /p/{shopSlug}
          </div>
        </div>
      </div>
    </div>
  );
}