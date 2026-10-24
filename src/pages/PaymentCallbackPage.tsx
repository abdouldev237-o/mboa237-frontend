// src/pages/PaymentCallbackPage.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle, RefreshCw } from "lucide-react";
import { http, getErrorMessage } from "@/lib/api";

type State = "loading" | "success" | "error" | "pending";

export default function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Récupérer les DEUX références depuis l'URL
  const trxref =
    params.get("trxref") ||
    params.get("sub_ref") ||
    (params.get("reference") || "").startsWith("SUB-")
      ? params.get("reference")
      : "";
  const notchpayRef = params.get("reference") || "";
  // Le premier `reference` peut être SUB-xxx et le second trx.xxx
  const allRefs = params.getAll("reference");
const subRef =
  params.get("trxref") ||
  params.get("sub_ref") ||
  allRefs.find((r) => r.startsWith("SUB-")) ||
  "";
const trxRef =
  allRefs.find((r) => r.startsWith("trx")) ||
  params.get("reference") ||
  "";

  const verify = useCallback(async () => {
  if (!subRef) {
    setState("error");
    setMessage("Référence d'abonnement manquante dans l'URL.");
    return;
  }

  try {
    const { data, status } = await http.get("/me/subscription/callback/", {
      params: {
        trxref: subRef,               // ← internal SUB-xxx
        reference: trxRef,            // ← NotchPay trx.xxx
      },
      validateStatus: (s) => s < 500,
    });

    if (data.is_active) {
      setState("success");
      setMessage("Abonnement activé avec succès !");
      if (pollRef.current) clearTimeout(pollRef.current);
      setTimeout(() => navigate("/dashboard/subscription", { replace: true }), 2500);
      return;
    }

    if (status === 202 || data.status === "pending_webhook") {
      // ... retry logic ...
      return;
    }

    setState("error");
    setMessage(data.detail || "Paiement non confirmé.");
  } catch (e) {
    setState("error");
    setMessage(getErrorMessage(e));
  }
}, [subRef, trxRef, attempts, navigate]);

  useEffect(() => {
    void verify();
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [verify]);

  const handleManualVerify = () => {
    setState("loading");
    setAttempts(0);
    void verify();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-6">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 text-center shadow-xl">
        {state === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-600" />
            <p className="mt-4 font-bold">Vérification du paiement…</p>
          </>
        )}

        {state === "pending" && (
          <>
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-amber-500" />
            <p className="mt-4 text-xl font-black">Confirmation en cours…</p>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
            {attempts < 15 && (
              <p className="mt-3 text-xs text-slate-400">
                Tentative {attempts + 1} / 15
              </p>
            )}
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleManualVerify}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
              >
                Vérifier maintenant
              </button>
              <button
                onClick={() => navigate("/dashboard/subscription", { replace: true })}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700"
              >
                Retour
              </button>
            </div>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <p className="mt-4 text-xl font-black">Paiement confirmé 🎉</p>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-rose-500" />
            <p className="mt-4 text-xl font-black">Paiement non confirmé</p>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleManualVerify}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
              >
                Réessayer
              </button>
              <button
                onClick={() => navigate("/dashboard/subscription", { replace: true })}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700"
              >
                Retour
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}