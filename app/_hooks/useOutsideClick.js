import { useEffect, useRef } from "react";

export function useOutsideClick(handler, listenCapturing = true) {
  const ref = useRef();

  useEffect(
    function () {
      function handleClick(e) {
        if (ref.current && !ref.current.contains(e.target)) {
          handler();
        }
      }

      // Add a small delay to prevent immediate trigger
      const timeoutId = setTimeout(() => {
        document.addEventListener("click", handleClick, listenCapturing);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("click", handleClick, listenCapturing);
      };
    },
    [handler, listenCapturing]
  );

  return ref;
}
