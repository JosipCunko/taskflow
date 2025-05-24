"use client";
import {
  cloneElement,
  createContext,
  ReactNode,
  useContext,
  useState,
  ReactElement,
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

  /*
  const modalRef = useRef<HTMLDivElement>(null);
  const outsideClickRef = useOutsideClick(
    dontUseOutsideClick ? () => {} : close,
    !dontUseOutsideClick
  );*/

  if (name !== openName) return null;

  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed top-0 left-0 w-full h-[100vh] bg-background-625 backdrop-blur-sm z-[999] p-0 " // adjusted backdrop-blur and z-index
    >
      <div
        className="fixed top-[50%] left-[50%] rounded-lg shadow-lg bg-background-700 p-4"
        style={{
          transform: "translate(-50%, -50%)",
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
          opacity: 1, // Start with opacity 1 if no complex entry animation
        }}
      >
        <div>{cloneElement(children, { onCloseModal: close })}</div>

        {/* For the "Show More" modal, we want a "Done" button inside its content, so showButton will be false. */}
        {showButton && (
          <div className="px-6 pb-4 pt-2 flex justify-start">
            {/* Ensure button is positioned nicely */}
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
