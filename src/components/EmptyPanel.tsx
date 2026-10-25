import type { ReactNode } from "react";

/* The empty / next-step panel (Figma "Empty panel"): a dashed area in place of the
 * goals, with a short title, one sentence on what to do, and the action(s). */
export function EmptyPanel({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-[var(--border-default)] px-6 py-12 text-center">
      <h2 className="type-body-title text-[var(--text-primary)]">{title}</h2>
      <p className="type-body-text max-w-xl text-[var(--text-secondary)]">{description}</p>
      {actions && <div className="flex flex-col items-center gap-3 sm:flex-row">{actions}</div>}
    </section>
  );
}
