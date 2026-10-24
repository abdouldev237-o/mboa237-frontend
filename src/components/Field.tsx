/* ---------- Field réutilisable ---------- */
import type { ReactNode } from 'react';



export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  rightSlot,
  hint,
  required = true,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  rightSlot?: ReactNode;
  hint?: string;
  required?: boolean;
  icon?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-2 text-sm font-bold text-slate-700">
        <span>
          {label}
          {!required && <span className="ml-1 font-normal text-slate-400">(optionnel)</span>}
        </span>
        {hint && <span className="text-xs font-medium text-slate-400">{hint}</span>}
      </span>
      <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 transition duration-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
        <span className="shrink-0 text-slate-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-300"
        />
        {rightSlot}
      </span>
    </label>
  );
}


/* ---------- Field réutilisable ---------- */
/* ---------- FieldText corrigé ---------- */
export function FieldText({
  label,
  value,
  onChange,
  placeholder,
  icon,
  hint,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-[12.5px] font-bold text-slate-700">
        <span>
          {label}
          {!required && <span className="ml-1 font-normal text-slate-400">(optionnel)</span>}
        </span>
        {hint && <span className="text-xs font-medium text-slate-400">{hint}</span>}
      </span>
      <span className="flex min-h-[110px] items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
        {icon && <span className="mt-1 shrink-0 text-slate-400">{icon}</span>}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="min-w-0 flex-1 resize-none bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-300"
        />
      </span>
    </label>
  );
}