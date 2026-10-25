import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getMotion, prefersReducedMotion } from "@/tokens/motion";

/* A small menu button: the goal card's ••• and the account avatar.
 *
 * ARIA menu-button pattern: the trigger has aria-haspopup="menu" and
 * aria-expanded; opening moves focus to the first item; ↑ ↓ Home End move
 * between items; Esc closes and returns focus to the trigger; Tab or a click
 * outside closes it. Colours: surface/overlay + border/overlay (Figma).
 * Motion: grows out of the trigger's corner (menuOpen), fades away (menuClose). */

export type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: "default" | "danger";
};

type ActionMenuProps = {
  /** Accessible name of the trigger, e.g. "More actions for Finish portfolio". */
  label: string;
  triggerContent: ReactNode;
  triggerClassName?: string;
  triggerStyle?: CSSProperties;
  items: ActionMenuItem[];
  /** Non-interactive line above the items, e.g. the signed-in email. */
  header?: ReactNode;
};

export function ActionMenu({ label, triggerContent, triggerClassName, triggerStyle, items, header }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Close with the exit animation, then unmount. focusTrigger: Esc / item chosen.
  const closing = useRef<Animation | null>(null);
  const close = (focusTrigger = false) => {
    if (focusTrigger) trigger.current?.focus();
    const el = menu.current;
    const m = getMotion(prefersReducedMotion()).menuClose;
    if (!el || m.duration === 0) return setOpen(false);
    if (closing.current) return;
    closing.current = el.animate(
      [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.97)" }],
      { duration: m.duration, easing: m.easing, fill: "forwards" },
    );
    closing.current.onfinish = () => {
      closing.current = null;
      setOpen(false);
    };
  };

  const itemEls = () => [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];

  useEffect(() => {
    if (!open) return;
    itemEls()[0]?.focus();
    const m = getMotion(prefersReducedMotion()).menuOpen;
    if (m.duration > 0) {
      menu.current?.animate(
        [{ opacity: 0, transform: "translateY(-4px) scale(0.95)" }, { opacity: 1, transform: "none" }],
        { duration: m.duration, easing: m.easing },
      );
    }
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menu.current?.contains(target) && !trigger.current?.contains(target)) close();
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // the card sits inside drag-to-reorder; keep its keys out of this menu
    const els = itemEls();
    const i = els.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => {
      e.preventDefault();
      els[(n + els.length) % els.length]?.focus();
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(els.length - 1);
    else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") close();
  };

  return (
    <div className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }
        }}
        className={cn(
          "grid cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]",
          triggerClassName
        )}
        style={triggerStyle}
      >
        {triggerContent}
      </button>
      {open && (
        <div
          ref={menu}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className="absolute end-0 top-full z-50 mt-2 min-w-48 origin-top-right rtl:origin-top-left rounded-2xl border border-[var(--border-overlay)] bg-[var(--surface-overlay)] p-1.5 shadow-xl"
        >
          {header}
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                close(true);
                item.onSelect();
              }}
              className={cn(
                "type-body-text flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-start outline-none hover:bg-[var(--surface-sunken)] focus-visible:bg-[var(--surface-sunken)]",
                item.tone === "danger" ? "text-[var(--signal-danger-text)]" : "text-[var(--text-primary)]"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
