import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ModalPortal } from "./ModalPortal";
import { getMotion, prefersReducedMotion } from "@/tokens/motion";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
};

/* Small form dialogs: New year / quarter / week, Edit categories.
 * Motion matches the card's ••• menu: the box grows in with the backdrop (menuOpen)
 * and fades out (menuClose). It stays mounted until the exit animation ends. */
export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    const [mounted, setMounted] = useState(isOpen);
    if (isOpen && !mounted) setMounted(true);
    const box = useRef<HTMLDivElement>(null);
    const overlay = useRef<HTMLDivElement>(null);

    // close on Escape — only while open (every page has several closed modals)
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    useLayoutEffect(() => {
        if (!mounted || !box.current || !overlay.current) return;
        const reduced = prefersReducedMotion();
        if (isOpen) {
            const m = getMotion(reduced).menuOpen;
            if (m.duration === 0) return;
            const opts = { duration: m.duration, easing: m.easing };
            box.current.animate([{ opacity: 0, transform: "translateY(4px) scale(0.97)" }, { opacity: 1, transform: "none" }], opts);
            overlay.current.animate([{ opacity: 0 }, { opacity: 1 }], opts);
            return;
        }
        const m = getMotion(reduced).menuClose;
        const opts = { duration: m.duration, easing: m.easing, fill: "forwards" as const };
        const exit = box.current.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.97)" }], opts);
        const fade = overlay.current.animate([{ opacity: 1 }, { opacity: 0 }], opts);
        exit.onfinish = () => setMounted(false);
        return () => {
            // reopened mid-exit: drop the exit and let the enter run
            exit.onfinish = null;
            exit.cancel();
            fade.cancel();
        };
    }, [isOpen, mounted]);

    if (!mounted) return null;

    return (
        <ModalPortal>
            {/* Portalled to <body>, but React still bubbles events through the parent —
                and Edit categories opens from inside the goal form. Stop submits here so
                saving a form in the modal never also submits the form behind it. */}
            <div className="fixed inset-0 z-50 flex items-center justify-center" onSubmit={(e) => e.stopPropagation()}>
                {/* overlay */}
                <div
                    ref={overlay}
                    className="absolute inset-0 bg-black/50"
                    onClick={onClose}
                ></div>

                {/* modal box */}
                <div ref={box} className="relative z-10 bg-card text-card-foreground rounded-2xl shadow-lg p-6 w-full max-w-[400px] mx-4 border max-h-[85vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </ModalPortal>
    );
};
