"use client";
import {
  cloneElement,
  createContext,
  ReactNode,
  useContext,
  useState,
  ReactElement,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import Button from "./reusable/Button";

interface ModalContextType {
  openName: string;
  close: () => void;
  open: (name: string) => void;
}

export const ModalContext = createContext<ModalContextType | null>(null);

function Modal({ children }: { children: ReactNode }) {
  const [openName, setOpenName] = useState<string>("");

  const close = () => setOpenName("");
  const open = setOpenName;

  return (
    <ModalContext.Provider value={{ openName, close, open }}>
      {children}
    </ModalContext.Provider>
  );
}

interface OpenProps {
  children: ReactElement<{ onClick?: () => void }>;
  opens: string;
}

function Open({ children, opens: opensWindowName }: OpenProps) {
  const context = useContext(ModalContext);
  if (!context) throw new Error("Open must be used within Modal Provider"); // Enhanced error message

  return cloneElement(children, {
    onClick: () => context.open(opensWindowName),
  });
}

interface WindowProps {
  children: ReactElement<{ onCloseModal?: () => void }>;
  name: string;
  showButton?: boolean;
  dontUseOutsideClick?: boolean;
}

function Window({ children, name, showButton = undefined }: WindowProps) {
  const context = useContext(ModalContext);
  if (!context) throw new Error("Window must be used within Modal Provider");
  const { openName, close } = context;

  // DONT USE useOutsideClick BECAUSE IT CLOSES THE MODAL, ANOTHER MODAL WILL BE OPENED AND THAT WILL CLOSE THIS MODAL
  useEffect(
    function () {
      function handleEscapeKey(e: KeyboardEvent) {
        if (e.key === "Escape") {
          close();
        }
      }

      document.addEventListener("keydown", handleEscapeKey);

      return () => document.removeEventListener("keydown", handleEscapeKey);
    },
    [close]
  );

  if (name !== openName) return null;

  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 rounded-xl z-[999] p-4 overflow-y-auto flex items-center justify-center" // Added overflow-y-auto and flex centering
    >
      <div className="fixed top-[50%] left-[50%] rounded-lg shadow-lg p-4 translate-x-[-50%] translate-y-[-50%]">
        <div>{cloneElement(children, { onCloseModal: close })}</div>

        {showButton && (
          <div className="px-6 pb-4 pt-2 flex justify-start">
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
