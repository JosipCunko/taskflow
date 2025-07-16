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
import { motion, AnimatePresence } from "framer-motion";
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

  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {name === openName && (
        <motion.div
          className="fixed inset-0 rounded-xl z-[999]  overflow-y-auto flex items-center justify-center backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="fixed top-[50%] left-[50%]  rounded-lg shadow-lg translate-x-[-50%] translate-y-[-50%] bg-background-700"
            initial={{ opacity: 0, x: 50, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div>{cloneElement(children, { onCloseModal: close })}</div>

            {showButton && (
              <div className="px-6 pb-4 pt-2 flex justify-start">
                <Button variant="secondary" onClick={close}>
                  Cancel
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
