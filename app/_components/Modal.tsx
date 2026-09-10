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
  const isOpen = name === openName;

  // DONT USE useOutsideClick BECAUSE IT CLOSES THE MODAL, ANOTHER MODAL WILL BE OPENED AND THAT WILL CLOSE THIS MODAL
  useEffect(
    function () {
      if (!isOpen) return;

      function handleEscapeKey(e: KeyboardEvent) {
        if (e.key === "Escape") {
          close();
        }
      }

      document.addEventListener("keydown", handleEscapeKey);
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
        document.body.style.overflow = previousOverflow;
      };
    },
    [isOpen, close]
  );

  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-stretch justify-center sm:items-center sm:p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="flex h-full w-full min-w-0 flex-col overflow-y-auto rounded-none border-0 bg-background-700 shadow-lg sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-auto sm:max-w-[calc(100vw-2rem)] sm:rounded-2xl sm:border sm:border-primary-500/20"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94] as const,
            }}
          >
            <div className="min-h-0 min-w-0 flex-1">
              {cloneElement(children, { onCloseModal: close })}
            </div>

            {showButton && (
              <div className="px-4 pb-4 pt-2 sm:px-6 flex justify-start">
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
