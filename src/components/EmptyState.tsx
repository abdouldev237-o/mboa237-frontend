// src/components/EmptyState.tsx
import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 bg-white px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/[0.04] text-black/40">
        {icon ?? <span className="text-[22px]">📭</span>}
      </div>
      <p className="mt-4 text-[15.5px] font-semibold">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-black/50">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}