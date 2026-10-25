import { useId, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { getMotion, prefersReducedMotion } from "@/tokens/motion";

/* The goal card, expanded — desktop and tablet.
 *
 * Not a "WOOP popup": it is the same card with room for everything —
 * category, title, parent goals, the live progress control, WOOP, notes.
 * Mobile has no modal; the card expands in place instead.
 *
 * Native <dialog> + showModal(): the browser moves focus into it, keeps Tab
 * inside it, closes it on Esc and makes the page behind inert — no focus-trap
 * code of our own.
 *
 * Motion: a container transform — it grows out of the card on open and
 * shrinks back into it on close (tokens: woopOpen / woopClose). Under
 * prefers-reduced-motion it only fades.
 *
 * Mounted only while open; the parent unmounts it from onClose, which runs
 * after the close animation has finished.
 */

type GoalExpansionDialogProps = {
  /** The card it grows out of and shrinks back into. */
  originRef: RefObject<HTMLElement | null>;
  /** Small line above the title, e.g. the category chip. */
  eyebrow?: ReactNode;
  title: ReactNode;
  onClose: () => void;
  /** Or a function given `close`, for content that closes the dialog itself (animated, like Esc). */
  children: ReactNode | ((close: () => void) => ReactNode);
};

export function GoalExpansionDialog({ originRef, eyebrow, title, onClose, children }: GoalExpansionDialogProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const closing = useRef(false);

  /* Transform that makes the dialog sit exactly over the card. */
  const fromCard = () => {
    const d = ref.current!.getBoundingClientRect();
    const c = originRef.current?.getBoundingClientRect();
    if (!c || !d.width || !d.height) return "translateY(16px) scale(.97)";
    const dx = c.left + c.width / 2 - (d.left + d.width / 2);
    const dy = c.top + c.height / 2 - (d.top + d.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${c.width / d.width}, ${c.height / d.height})`;
  };

  const animateBackdrop = (from: number, to: number, duration: number) => {
    try {
      ref.current!.animate([{ opacity: from }, { opacity: to }], {
        duration,
        easing: "linear",
        fill: "forwards",
        pseudoElement: "::backdrop",
      });
    } catch {
      /* older browsers: the backdrop just appears */
    }
  };

  useLayoutEffect(() => {
    const d = ref.current;
    if (!d || d.open) return;
    d.showModal();
    const m = getMotion();
    animateBackdrop(0, 1, m.woopOpen.duration);
    if (prefersReducedMotion()) {
      d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: m.woopOpen.duration });
    } else {
      d.animate(
        [
          { transform: fromCard(), opacity: 0, offset: 0 },
          { opacity: 1, offset: 0.35 },
          { transform: "none", opacity: 1, offset: 1 },
        ],
        { duration: m.woopOpen.duration, easing: m.woopOpen.easing }
      );
    }
    // Opens once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestClose = async () => {
    const d = ref.current;
    if (!d || closing.current) return;
    closing.current = true;
    const m = getMotion();
    animateBackdrop(1, 0, m.woopClose.duration);
    const frames = prefersReducedMotion()
      ? [{ opacity: 1 }, { opacity: 0 }]
      : [
          { transform: "none", opacity: 1, offset: 0 },
          { opacity: 1, offset: 0.65 },
          { transform: fromCard(), opacity: 0, offset: 1 },
        ];
    await d.animate(frames, { duration: m.woopClose.duration, easing: m.woopClose.easing, fill: "forwards" }).finished;
    d.close();
    onClose();
  };

  /* Portalled to <body>, but React still bubbles events through the card,
     where drag-to-reorder listens. Stop them here so typing, clicking or
     pressing Space inside never starts a drag. */
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault(); // Esc: animate out instead of vanishing
        void requestClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) void requestClose(); // click on the backdrop
      }}
      onPointerDown={stop}
      onKeyDown={stop}
      className="m-auto w-[min(720px,calc(100vw-32px))] max-h-[85vh] overflow-visible rounded-3xl border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/40"
    >
      <div className="max-h-[85vh] space-y-6 overflow-y-auto p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            {eyebrow}
            <h2 id={titleId} className="type-main-title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void requestClose()}
            aria-label={t("common.close")}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-[var(--surface-sunken)] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {typeof children === "function" ? children(() => void requestClose()) : children}
      </div>
    </dialog>,
    document.body
  );
}
