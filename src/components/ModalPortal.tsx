import { type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalPortalProps = {
    children: ReactNode;
};

export const ModalPortal = ({ children }: ModalPortalProps) => {
    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) return null;

    return createPortal(children, modalRoot);
};