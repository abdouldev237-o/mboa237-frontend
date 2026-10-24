// src/components/Spinner.tsx
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const s = size === "sm" ? "h-4 w-4 border-2" : size === "lg" ? "h-8 w-8 border-[3px]" : "h-6 w-6 border-[2.5px]";
  return (
    <span
      className={`inline-block animate-spin rounded-full border-black/10 border-t-[#16a34a] ${s} ${className}`}
      role="status"
      aria-label="Chargement"
    />
  );
}

export function FullPageSpinner({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-[13.5px] text-black/50">{label}</p>
    </div>
  );
}

export function InlineLoader({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-black/50">
      <Spinner size="sm" />
      {label}
    </span>
  );
}