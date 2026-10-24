// src/components/ErrorState.tsx
import type { ReactNode } from "react";

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function ErrorState({
  title = "Oups, une erreur est survenue",
  description = "Impossible de charger les données. Vérifie ta connexion et réessaie.",
  onRetry,
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/50 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <p className="mt-4 text-[15.5px] font-semibold text-black">{title}</p>
      <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-black/60">
        {description}
      </p>
      <div className="mt-5 flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-black/85 active:scale-[0.98]"
          >
            Réessayer
          </button>
        )}
        {action}
      </div>
    </div>
  );
}