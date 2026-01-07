import { type ReactNode, useEffect } from "react";
import { ModalPortal } from "./ModalPortal";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
};

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    // close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* overlay */}
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={onClose}
                ></div>

                {/* modal box */}
                <div className="relative z-10 bg-card text-card-foreground rounded-2xl shadow-lg p-6 w-full max-w-[400px] mx-4 border">
                    {children}
                </div>
            </div>
        </ModalPortal>
    );
};