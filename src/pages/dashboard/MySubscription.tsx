// src/pages/MySubscription.tsx
import { useEffect, useState } from "react";
import {
  AlertCircle, ArrowRight, Calendar, Check, CheckCircle2,
  Clock, CreditCard, Loader2, Lock, RefreshCw, ShieldCheck,
  Sparkles, 
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { http, getErrorMessage } from "@/lib/api";

/* =========================================================
   TYPES
   ========================================================= */
type BillingCycle = "monthly" | "yearly";

type SubStatus = {
  is_active: boolean;
  days_left: number;
  subscription_expires_at: string | null;
  plan: string;
  plan_label: string;
  is_test_mode: boolean;
  is_promo_shop: boolean;
  prices: { monthly: number; yearly: number };
  currency: string;
  last_subscription: any | null;
};

const FEATURES = [
  "Page publique de ta boutique",
  "Tableau de bord complet",
  "Commandes directes sur WhatsApp",
  "Auto-publication sur Djoss237",
  "Support prioritaire",
];

function fmtFcfa(n: number) {
  return n.toLocaleString("fr-FR").replace(/\u202f/g, " ") + " F";
}

/* =========================================================
   PAGE
   ========================================================= */
export default function MySubscription() {
  const toast = useToast();
  const [status, setStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isYear, setIsYear] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  /* ---------- Chargement ---------- */
  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await http.get<SubStatus>("/me/subscription/status/");
      setStatus(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  /* ---------- Paiement ---------- */
  const handlePayment = async () => {
    if (!status) return;
    setIsProcessing(true);
    try {
      const cycle: BillingCycle = isYear ? "yearly" : "monthly";
      const { data } = await http.post<{
        authorization_url: string;
        reference: string;
        amount: number;
        is_test_mode: boolean;
      }>("/me/subscription/initialize/", { billing_cycle: cycle });

      toast.success(
        data.is_test_mode
          ? `Redirection NotchPay (mode test — ${fmtFcfa(data.amount)})`
          : `Redirection NotchPay (${fmtFcfa(data.amount)})`
      );

      // Redirection vers la page de paiement NotchPay
      window.location.href = data.authorization_url;
    } catch (e) {
      toast.error(getErrorMessage(e));
      setIsProcessing(false);
    }
  };

  /* ---------- États ---------- */
  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#f8faf9]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center bg-[#f8faf9] p-6 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <h2 className="mt-3 text-xl font-bold">Erreur</h2>
        <p className="mt-1 text-slate-500">{error ?? "Statut introuvable."}</p>
        <button
          onClick={() => void loadStatus()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
        >
          <RefreshCw size={16} /> Réessayer
        </button>
      </div>
    );
  }

  const price = isYear ? status.prices.yearly : status.prices.monthly;
  const period = isYear ? "an" : "mois";
  const isExpiringSoon = status.days_left > 0 && status.days_left <= 7;
  const isExpired = status.days_left === 0;

  return (
    <div className="min-h-screen bg-[#f8faf9] px-4 py-12">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
            <Sparkles size={14} /> Espace abonnement
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Gérez votre abonnement
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {status.is_test_mode
              ? "Mode test actif — vos paiements ne seront pas débités."
              : "Gardez votre boutique visible pour vos clients."}
          </p>
        </div>

        {/* STATUS */}
        <div
          className={`mx-auto mt-8 flex max-w-lg items-center gap-4 rounded-2xl border p-4 sm:p-5 ${
            isExpired
              ? "border-rose-200 bg-rose-50"
              : isExpiringSoon
                ? "border-amber-200 bg-amber-50"
                : "border-emerald-200 bg-white"
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              isExpired
                ? "bg-rose-100 text-rose-600"
                : isExpiringSoon
                  ? "bg-amber-100 text-amber-600"
                  : "bg-emerald-100 text-emerald-600"
            }`}
          >
            <Calendar size={24} />
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
              Statut de la boutique
            </div>
            {isExpired ? (
              <div className="mt-1 text-lg font-black text-rose-700">Expiré</div>
            ) : (
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-2xl font-black ${isExpiringSoon ? "text-amber-700" : "text-emerald-700"}`}>
                  {status.days_left}
                </span>
                <span className="text-sm font-semibold text-slate-600">
                  jour{status.days_left > 1 ? "s" : ""} restant{status.days_left > 1 ? "s" : ""}
                </span>
              </div>
            )}
            {status.last_subscription && (
              <p className="mt-1 text-[11.5px] text-slate-500">
                Dernier paiement : {fmtFcfa(status.last_subscription.amount)} — {status.last_subscription.status_label}
              </p>
            )}
          </div>
        </div>

        {/* CARTE TARIF */}
        <div className="mx-auto mt-8 max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Plan {status.plan_label}
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-4xl font-black tabular-nums">{fmtFcfa(price)}</span>
                <span className="text-sm font-medium text-slate-400">/ {period}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-white/10 p-1">
              <button
                onClick={() => setIsYear(false)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  !isYear ? "bg-white text-slate-900" : "text-slate-300"
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => setIsYear(true)}
                className={`relative rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  isYear ? "bg-white text-slate-900" : "text-slate-300"
                }`}
              >
                An
                <span className="absolute -right-2 -top-3 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                  -10%
                </span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <ul className="space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => void handlePayment()}
              disabled={isProcessing || status.is_active}
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-[15px] font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Redirection…
                </>
              ) : status.is_active ? (
                <>
                  <CheckCircle2 size={18} />
                  Abonnement déjà actif
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Payer {fmtFcfa(price)}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400">
              <Lock size={12} /> Paiement sécurisé via NotchPay (OM · MTN)
            </div>

            {status.is_test_mode && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
                <strong>Mode test :</strong> le montant sera forcé à 100 XAF et aucun argent réel ne sera débité.
              </div>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-10 max-w-lg space-y-2">
          <div className="flex items-start gap-3 rounded-xl border bg-white p-3.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <div className="text-[13px] font-bold text-slate-800">Quand suis-je débité ?</div>
              <div className="mt-0.5 text-[12px] text-slate-500">
                Le paiement est instantané. L'abonnement est activé dès le webhook NotchPay reçu.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border bg-white p-3.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <div className="text-[13px] font-bold text-slate-800">Puis-je annuler ?</div>
              <div className="mt-0.5 text-[12px] text-slate-500">
                Oui, l'abonnement expire automatiquement à la fin de la période choisie.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}